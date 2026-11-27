import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Guide, GuideIndex, QuestMin, RoutePack, Step } from "../../contracts/schema.ts";
import { buildData, type QuestDb } from "./build-data.ts";
import { findIntegrityIssues } from "./guide-integrity.ts";
import { compareTpfQuestie, loadTpfDb, mergeQuestDb, roundQuestXp, type TpfDb } from "./tpf-db.ts";

const SRC = [{ url: "https://example.com/test", label: "test" }];
const ZEPHRAS = { mapId: 2521, zone: "Zephras Isle", exact: true };

function step(id: string, extra: Partial<Step> = {}): Step {
  return { id, n: 1, tags: {}, text: [{ segments: [{ t: id }] }], actions: [], conditions: [], sources: SRC, verified: false, ...extra };
}

/** QuestieDB fixture: Zephras Isle (AreaTable 16593 on uiMap 2521) plus one Durotar quest. */
function questie(): QuestDb {
  return {
    quests: {
      "92461": { id: 92461, name: "Harmony", level: 2, reqLevel: 1, classes: 0, xp: 85, zoneId: 16593, zone: "Zephras Isle", forever: true,
        start: { npc: [10] }, end: { npc: [10] }, objectives: { creatures: [{ id: 20 }] }, pre: { single: [92460] } },
      "92482": { id: 92482, name: "The Way of the Hunter", level: 2, classes: 4, zoneId: 16593, zone: "Zephras Isle", forever: true, start: { npc: [11] } },
      "92483": { id: 92483, name: "At Home in the Shadows", level: 2, classes: 8, zoneId: 16593, zone: "Zephras Isle", forever: true, start: { npc: [12] } },
      "100": { id: 100, name: "Durotar Quest", level: 3, zoneId: 14, zone: "Durotar", start: { npc: [13] } },
    },
    npcs: {
      "10": { id: 10, name: "Elder", spawns: { "16593": [[40, 50]] } },
      "11": { id: 11, name: "Hunter Trainer", spawns: { "16593": [[41, 51]] } },
      "12": { id: 12, name: "Rogue Trainer", spawns: { "16593": [[42, 52]] } },
      "13": { id: 13, name: "Durotar Giver", spawns: { "14": [[50, 50]] } },
      "20": { id: 20, name: "Vuldren", spawns: { "16593": [[43, 53]] } },
    },
    objects: {},
    items: {},
    zones: { "14": { name: "Durotar", uiMapId: 1411, continent: 1 }, "16593": { name: "Zephras Isle", uiMapId: 2521, continent: 947 } },
  };
}

const ev = [{ session: "20990101-0001-aaaa", t: [1] }];

/** tpf-db fixture: 92461 confirmed (seen in a log), 92551 only in tpf-db, 92482 unconfirmed (QuestieDB copy). */
function tpf(): TpfDb {
  return {
    quests: {
      "92461": { id: 92461, status: "confirmed", name: "Harmony in Balance", zone: "Zephras Isle", mapId: 2521, end: { npc: [10] },
        enderAt: { "map:2521": [[40.2, 50.1]] }, objectives: { creatures: [{ id: 21, count: 8, text: "Juvenile Vuldren" }] },
        xpReceived: [{ playerLevel: 2, xp: 80 }], pre: { single: [99999], status: "inferred" }, evidence: ev, samples: 1 },
      "92551": { id: 92551, status: "confirmed", name: "Stolen Supplies", zone: "Zephras Isle", mapId: 2521,
        acceptAt: { "map:2521": [[45.26, 45.25]] }, objectives: { items: [{ id: 252760, count: 10, text: "Stolen Shen'dar Supplies" }] },
        xpReceived: [{ playerLevel: 9, xp: 525 }], evidence: ev, samples: 1 },
    },
    npcs: { "21": { id: 21, status: "confirmed", name: "Juvenile Vuldren", spawns: { "map:2521": [[43.2, 25.7]] }, minLevel: 1, maxLevel: 2, roles: ["mob"] },
      "10": { id: 10, status: "confirmed", name: "Elder", spawns: { "map:2521": [[40.1, 50.0], [40.3, 50.2]] }, roles: ["questEnder"] } },
    objects: {},
    items: { "252760": { id: 252760, status: "confirmed", name: "Stolen Shen'dar Supplies", npcDrops: [252068] } },
    zones: { "map:2521": { name: "Zephras Isle", uiMapId: 2521 } },
    unconfirmed: {
      quests: { "92482": { id: 92482, status: "unconfirmed", name: "The Way of the Hunter", classes: 4, zone: "Zephras Isle", source: { name: "QuestieDB x" } } },
      npcs: {},
      objects: {},
      items: {},
    },
  };
}

describe("mergeQuestDb", () => {
  it("prefers tpf-db confirmed, then tpf-db unconfirmed, then QuestieDB", () => {
    const db = mergeQuestDb(questie(), tpf());
    expect(db.dataStatus).toEqual({ "92461": "confirmed", "92551": "confirmed", "92482": "unconfirmed" });
    const q = db.quests["92461"]!;
    expect(q.name).toBe("Harmony in Balance"); // confirmed wins
    expect(q.start).toEqual({ npc: [10] }); // tpf-db had no giver id: QuestieDB's stays
    expect(q.objectives).toEqual({ creatures: [{ id: 21, count: 8 }] });
    expect([q.level, q.reqLevel, q.classes]).toEqual([2, 1, 0]); // fields the log cannot show stay from QuestieDB
    expect(q.xp).toBe(85); // QuestieDB's table XP (tier match); the observed 80 is in the comparison report
    expect(q.pre).toEqual({ single: [92460] }); // inferred prerequisites are never used
    expect(db.quests["92483"]).toEqual(questie().quests["92483"]); // QuestieDB only
    expect(db.quests["100"]).toEqual(questie().quests["100"]);
    expect(db.dataStatus!["100"]).toBeUndefined();
  });

  it("adds tpf-only quests with the observed XP and the zone of their map", () => {
    const db = mergeQuestDb(questie(), tpf());
    const q = db.quests["92551"]!;
    expect([q.name, q.xp, q.zoneId, q.forever]).toEqual(["Stolen Supplies", 525, 16593, true]);
    expect(q.objectives).toEqual({ items: [{ id: 252760, count: 10 }] });
  });

  it("uses tpf-db positions for NPCs it saw and resolves map: zone keys", () => {
    const db = mergeQuestDb(questie(), tpf());
    expect(db.npcs["10"]!.spawns).toEqual({ "map:2521": [[40.2, 50.1]] }); // quest NPC: centre of the dialog spots
    expect(db.npcs["21"]!.spawns).toEqual({ "map:2521": [[43.2, 25.7]] }); // mob: every fight position
    expect(db.npcs["20"]!.spawns).toEqual({ "16593": [[43, 53]] });
    expect(db.zones["map:2521"]).toEqual({ name: "Zephras Isle", uiMapId: 2521 });
    expect(db.items["252760"]!.name).toBe("Stolen Shen'dar Supplies");
    expect((db.npcs["10"] as { status?: string }).status).toBeUndefined(); // record bookkeeping is not merged
  });

  it("extends drop lists only for tpf-db quest objectives", () => {
    const q = questie();
    q.items["2589"] = { id: 2589, name: "Linen Cloth", npcDrops: [1] };
    q.items["5"] = { id: 5, name: "Claw", npcDrops: [2] };
    const t = tpf();
    t.items["2589"] = { id: 2589, status: "confirmed", name: "Linen Cloth", npcDrops: [21] };
    t.items["5"] = { id: 5, status: "confirmed", name: "Claw", npcDrops: [21], questObjectiveOf: [92461] };
    const db = mergeQuestDb(q, t);
    expect(db.items["2589"]!.npcDrops).toEqual([1]);
    expect(db.items["5"]!.npcDrops).toEqual([2, 21]);
    expect(db.items["252760"]!.npcDrops).toEqual([252068]); // not in QuestieDB: logged list
  });

  it("returns QuestieDB unchanged without tpf-db, and leaves its input alone", () => {
    const q = questie();
    expect(mergeQuestDb(q, null)).toBe(q);
    const before = JSON.stringify(q);
    mergeQuestDb(q, tpf());
    expect(JSON.stringify(q)).toBe(before);
  });

  it("only merges quests in the tpf-db zones", () => {
    const t = tpf();
    t.quests["92461"]!.zone = "Elsewhere";
    expect(mergeQuestDb(questie(), t).dataStatus!["92461"]).toBeUndefined();
  });
});

describe("compareTpfQuestie", () => {
  it("lists ids, positions and XP that differ", () => {
    const t = tpf();
    t.quests["92461"]!.start = { npc: [10] };
    t.quests["92461"]!.giverAt = { "map:2521": [[48, 50]] };
    const r = compareTpfQuestie(questie(), t);
    const q = r.quests.find((x) => x.id === 92461)!;
    expect(q.issues).toEqual(["name", "objective-creatures", "xp", "start-position"]);
    expect(q.questie.startDistance).toBe(8);
    expect(r.quests.find((x) => x.id === 92551)!.issues).toEqual(["missing-in-questie"]);
    // 315 in QuestieDB is shown as 320 in game: only rounding
    const qd = questie();
    qd.quests["92461"]!.xp = 315;
    qd.quests["92461"]!.name = "Harmony in Balance";
    t.quests["92461"]!.xpReceived = [{ playerLevel: 2, xp: 320 }];
    const r2 = compareTpfQuestie(qd, t);
    expect(r2.quests.find((x) => x.id === 92461)!.issues).toEqual(["objective-creatures", "xp-rounding", "start-position"]);
    expect(r2.summary["quest:xp-rounding"]).toBe(1);
    expect(r.npcs.find((x) => x.id === 21)!.issues).toEqual(["missing-in-questie"]);
    expect(r.items).toEqual([{ id: 252760, name: "Stolen Shen'dar Supplies", issues: ["missing-in-questie"] }]);
  });

  it("knows the client's quest XP rounding", () => {
    expect([roundQuestXp(85), roundQuestXp(315), roundQuestXp(560), roundQuestXp(910), roundQuestXp(1234)]).toEqual([85, 320, 550, 900, 1250]);
  });
});

describe("loadTpfDb", () => {
  it("is null without quests.json and reads unconfirmed/ beside it", () => {
    const dir = mkdtempSync(join(tmpdir(), "pf-tpf-"));
    expect(loadTpfDb(dir)).toBeNull();
    writeFileSync(join(dir, "quests.json"), JSON.stringify(tpf().quests));
    mkdirSync(join(dir, "unconfirmed"));
    writeFileSync(join(dir, "unconfirmed/quests.json"), JSON.stringify(tpf().unconfirmed.quests));
    const t = loadTpfDb(dir)!;
    expect(Object.keys(t.quests)).toEqual(["92461", "92551"]);
    expect(Object.keys(t.unconfirmed.quests)).toEqual(["92482"]);
    expect(t.npcs).toEqual({});
  });

  it("reads the committed content/tpf-db when present", () => {
    const t = loadTpfDb();
    if (!t) return;
    expect(t.quests["92551"]?.name).toBe("Stolen Supplies");
    for (const q of Object.values(t.quests)) expect(q.status).toBe("confirmed");
    for (const q of Object.values(t.unconfirmed.quests)) {
      expect(q.status).toBe("unconfirmed");
      expect(t.quests[String(q.id)]).toBeUndefined();
    }
  });
});

describe("buildData with tpf-db", () => {
  const read = <T>(out: string, rel: string) => JSON.parse(readFileSync(join(out, rel), "utf-8")) as T;
  const zephras: RoutePack = {
    schema: "project-forever/route",
    version: 2,
    id: "zephras-isle",
    title: "Zephras Isle 1-12 (Horde Skyborne)",
    levels: [1, 12],
    status: "play-tested",
    playtested: { date: "2026-11-27", class: "Shaman", levels: [1, 13] },
    steps: [
      step("z:1", { actions: [{ type: "goto", at: { ...ZEPHRAS, x: 40, y: 50 } }, { type: "accept", questId: 92461, label: "Harmony" }] }),
      step("z:2", { actions: [{ type: "goto", at: { ...ZEPHRAS, x: 45, y: 45 } }, { type: "accept", questId: 92551, label: "Stolen Supplies" }] }),
      step("z:3", { actions: [{ type: "goto", at: { ...ZEPHRAS, x: 41, y: 51 } }, { type: "accept", questId: 92482, label: "Hunter" }], conditions: [{ cmd: "class", args: "Hunter" }] as Step["conditions"] }),
      step("z:4", { actions: [{ type: "goto", at: { ...ZEPHRAS, x: 42, y: 52 } }, { type: "accept", questId: 92483, label: "Rogue" }] }),
    ],
  };
  const durotar: RoutePack = {
    schema: "project-forever/route",
    version: 2,
    id: "durotar-1-12",
    title: "Durotar 1-12 (Horde)",
    levels: [1, 12],
    steps: [step("d:1", { actions: [{ type: "goto", at: { mapId: 1411, zone: "Durotar", exact: true, x: 50, y: 50 } }, { type: "accept", questId: 100, label: "Q" }] })],
  };

  function run() {
    const research = mkdtempSync(join(tmpdir(), "pf-research-"));
    for (const [rel, data] of Object.entries({ "z.json": zephras, "d.json": durotar })) writeFileSync(join(research, rel), JSON.stringify(data));
    const out = mkdtempSync(join(tmpdir(), "pf-out-"));
    buildData({ research, out, questDb: mergeQuestDb(questie(), tpf()), now: "2026-11-27T00:00:00.000Z", prereqMode: "off" });
    return out;
  }

  it("copies pack status and playtested into the guide and its index entry; experimental by default", () => {
    const out = run();
    const z = read<Guide>(out, "guides/zephras-isle.json");
    expect([z.status, z.playtested]).toEqual(["play-tested", { date: "2026-11-27", class: "Shaman", levels: [1, 13] }]);
    const d = read<Guide>(out, "guides/durotar-1-12.json");
    expect([d.status, d.playtested]).toEqual(["experimental", undefined]);
    const entries = read<GuideIndex>(out, "guide_index.json").entries!;
    expect(entries.find((e) => e.slug === "zephras-isle")).toMatchObject({ status: "play-tested", playtested: { class: "Shaman" } });
    expect(entries.find((e) => e.slug === "durotar-1-12")!.status).toBe("experimental");
    expect(entries.find((e) => e.slug === "durotar-1-12")!.playtested).toBeUndefined();
  });

  it("writes dataStatus on quest rows and on every quest action", () => {
    const out = run();
    const rows = read<QuestMin[]>(out, "quests-min.json");
    expect(Object.fromEntries(rows.map((q) => [q.id, q.dataStatus]))).toEqual({
      "100": "questie",
      "92461": "confirmed",
      "92482": "unconfirmed",
      "92483": "questie",
      "92551": "confirmed",
    });
    const z = read<Guide>(out, "guides/zephras-isle.json");
    const byQuest = Object.fromEntries(z.steps.flatMap((s) => s.actions).flatMap((a) => ("questId" in a && a.questId ? [[a.questId, (a as { dataStatus?: string }).dataStatus]] : [])));
    // QuestieDB-only quests get no action-level dataStatus (guide text never names the data source); their row says "questie".
    expect(byQuest).toEqual({ "92461": "confirmed", "92551": "confirmed", "92482": "unconfirmed", "92483": undefined });
  });

  it("has no missing-quest finding for a quest only tpf-db knows", () => {
    const out = run();
    const guides = ["zephras-isle", "durotar-1-12"].map((s) => read<Guide>(out, `guides/${s}.json`));
    const quests = read<QuestMin[]>(out, "quests-min.json");
    expect(quests.some((q) => q.id === 92551)).toBe(true);
    const findings = findIntegrityIssues(guides, read<GuideIndex>(out, "guide_index.json"), quests as never);
    expect(findings.filter((f) => f.category === "missing-quest")).toEqual([]);
  });

  it("without tpf-db the same quest is missing", () => {
    const research = mkdtempSync(join(tmpdir(), "pf-research-"));
    writeFileSync(join(research, "z.json"), JSON.stringify(zephras));
    const out = mkdtempSync(join(tmpdir(), "pf-out-"));
    buildData({ research, out, questDb: questie(), now: "2026-11-27T00:00:00.000Z", prereqMode: "off" });
    expect(read<QuestMin[]>(out, "quests-min.json").some((q) => q.id === 92551)).toBe(false);
  });
});
