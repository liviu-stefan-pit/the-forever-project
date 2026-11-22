import { existsSync, mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Guide, GuideIndex, Insights, RoutePack, Step, ZoneInfo } from "../../contracts/schema.ts";
import {
  guideTitle,
  ISSUE_LEFT_OUT,
  ISSUE_UNCHECKED,
  applyMapAssets,
  loadMapZoneAssets,
  attachIdPrefixes,
  buildData,
  buildIndex,
  discoverPacks,
  makeValidators,
  breadcrumbWarnings,
  buildQuestSteps,
  buildLandingStats,
  enforceRules,
  joinHooks,
  skippedQuestSummary,
  cleanHook,
  ensureHookPins,
  parseLevels,
  PACK_TRANSFORMS,
  parsePrereqMode,
  type PackTransform,
  stepLevels,
  type DataManifest,
  type HookEntry,
  type QuestDb,
} from "./build-data.ts";

const SRC = [{ url: "https://example.com/test", label: "test" }];
const at = (x: number, y: number, zone = "Durotar", mapId = 1411) => ({ mapId, x, y, zone, exact: true });

function step(id: string, extra: Partial<Step> = {}): Step {
  return { id, n: 1, tags: {}, text: [{ segments: [{ t: id }] }], actions: [], conditions: [], sources: SRC, verified: true, ...extra };
}

function pack(id: string, levels: [number, number], steps: Step[]): RoutePack {
  return { schema: "project-forever/route", version: 2, id, title: id, levels, steps };
}

const db: QuestDb = {
  quests: {
    "100": { id: 100, name: "Old Quest", level: 3, reqLevel: 1, start: { npc: [1] }, end: { npc: [1] }, objectives: { creatures: [{ id: 2 }] } },
    "95000": { id: 95000, name: "New Forever Quest", level: 8, forever: true },
    "79953": { id: 79953, name: "Excluded book", level: 20, forever: true },
  },
  npcs: { "1": { id: 1, name: "Giver", spawns: { "14": [[40, 60]] } }, "2": { id: 2, name: "Boar", spawns: { "14": [[41, 61], [-1, -1]] } } },
  objects: {},
  items: {},
  zones: { "14": { name: "Durotar", uiMapId: 1411, continent: 1 }, "1637": { name: "Orgrimmar", uiMapId: 1454, continent: 1 } },
};

function hook(id: string, zone: string, levels: string, npc?: { id: number; x: number; y: number; zone?: string }): HookEntry {
  return {
    hookId: id,
    zone,
    levels,
    professionHook: {
      profession: "Cooking",
      itemName: `Item ${id}`,
      note: `Keep items (${id})`,
      sources: SRC,
      verified: false,
      ...(npc ? { npc: { id: npc.id, name: `Npc ${npc.id}`, zone: npc.zone ?? zone, x: npc.x, y: npc.y } } : {}),
      pass2: true,
    } as HookEntry["professionHook"],
  };
}

function writeResearch(packs: Record<string, unknown>, extra: (dir: string) => void = () => {}): string {
  const dir = mkdtempSync(join(tmpdir(), "pf-research-"));
  for (const [rel, data] of Object.entries(packs)) {
    const p = join(dir, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, JSON.stringify(data));
  }
  extra(dir);
  return dir;
}

const read = <T>(out: string, rel: string) => JSON.parse(readFileSync(join(out, rel), "utf-8")) as T;

describe("guideTitle", () => {
  it("drops faction tags, toggle hints and level ranges the UI already shows", () => {
    expect(guideTitle("Durotar 1-12 (Horde)")).toBe("Durotar");
    expect(guideTitle("The Barrens 12-20 (Horde)")).toBe("The Barrens");
    expect(guideTitle("Zephras Isle 1-12 (Horde Skyborne)")).toBe("Zephras Isle");
    expect(guideTitle("Horde dungeon quests 13-60 (dungeons toggle)")).toBe("Dungeon quests");
    expect(guideTitle("The Barrens (first half)")).toBe("The Barrens (first half)");
    expect(guideTitle("Mount Hyjal to 60")).toBe("Mount Hyjal to 60");
  });
});

describe("discoverPacks", () => {
  it("finds route-v2 packs by content and skips tools/, catalog/ and other JSON", () => {
    const dir = writeResearch({
      "horde-1-20/a.json": pack("a", [1, 12], [step("a:1")]),
      "nova/v2/b.json": pack("b", [12, 20], [step("b:1")]),
      "nova/catalog/quests.json": pack("cat", [1, 2], []),
      "x/tools/snap.json": pack("tool", [1, 2], []),
      "professions/class_professions.json": {},
      "notes.json": { schema: "something-else" },
    });
    expect(discoverPacks(dir).map((p) => p.pack.id)).toEqual(["a", "b"]);
  });
});

describe("rules", () => {
  it("strips excluded quests and forces verified:false on Forever quest steps", () => {
    const warnings: string[] = [];
    const r = enforceRules(
      "p",
      [
        step("keep"),
        step("book", { actions: [{ type: "accept", questId: 79953, label: "x" }] }),
        step("book2", { actions: [{ type: "turnin", questId: 81951, label: "x" }] }),
        step("new", { actions: [{ type: "accept", questId: 95000, label: "x" }] }),
        step("newAlready", { verified: false, actions: [{ type: "accept", questId: 95000, label: "x" }] }),
      ],
      (id) => id === 95000 || id === 79953,
      warnings,
    );
    expect(r.steps.map((s) => s.id)).toEqual(["keep", "new", "newAlready"]);
    expect(r.steps.find((s) => s.id === "new")!.verified).toBe(false);
    expect([r.stripped, r.forced]).toEqual([2, 1]);
    expect(warnings).toHaveLength(3);
  });

  it("estimates step levels from quest levels and xp targets", () => {
    const steps = [step("a"), step("b", { actions: [{ type: "accept", questId: 100, label: "" }] }), step("c", { actions: [{ type: "xp", level: 6, label: "" }] }), step("d")];
    expect(stepLevels(steps, 1, (id) => db.quests[String(id)]?.level)).toEqual([1, 3, 6, 6]);
    expect(parseLevels("10-60")).toEqual([10, 60]);
    expect(parseLevels("x")).toBeNull();
  });
});

describe("breadcrumbWarnings", () => {
  it("warns when a route accepts the target first, leaves a breadcrumb open, or points at a missing quest", () => {
    const questDb: QuestDb = {
      ...db,
      quests: {
        ...db.quests,
        "1": { id: 1, breadcrumbFor: 2 },
        "2": { id: 2 },
        "5": { id: 5, breadcrumbFor: 999 },
        "9": { id: 9, breadcrumbFor: 999 },
      },
    };
    const lines = breadcrumbWarnings(
      [
        {
          slug: "g",
          steps: [
            step("s1", { actions: [{ type: "accept", questId: 2, label: "T" }], routes: ["balanced"] }),
            step("s2", { actions: [{ type: "turnin", questId: 1, label: "B" }], routes: ["balanced"] }),
            step("s3", { actions: [{ type: "accept", questId: 1, label: "B" }, { type: "accept", questId: 2, label: "T" }], routes: ["speedrun"] }),
            step("s4", { actions: [{ type: "accept", questId: 5, label: "gone" }] }),
          ],
        },
      ],
      questDb,
      [1, 2, 5],
    );
    expect(lines).toEqual([
      "[breadcrumb] missing: quest 5 breadcrumbFor 999 is not in Questie",
      "[breadcrumb] order: g balanced accepts 2 before turnin of breadcrumb 1",
      "[breadcrumb] open: g balanced accepts 5 (breadcrumbFor 999) but never turns it in",
      "[breadcrumb] open: g speedrun accepts 1 (breadcrumbFor 2) but never turns it in",
      "[breadcrumb] open: g speedrun accepts 5 (breadcrumbFor 999) but never turns it in",
    ]);
  });
});

describe("buildQuestSteps", () => {
  it("maps quest ids to step ids across guides, in guide order, with numeric keys ascending", () => {
    const g = (slug: string, steps: Step[]) => ({ slug, steps }) as unknown as Guide;
    const qs = buildQuestSteps([
      g("a", [step("a:1", { actions: [{ type: "accept", questId: 20, label: "" }] }), step("a:2", { actions: [{ type: "turnin", questId: 20, label: "" }, { type: "accept", questId: 3, label: "" }] })]),
      g("b", [step("b:1", { bonus: { questIds: [20], xp: 1, why: "" } })]),
    ]);
    expect(Object.keys(qs)).toEqual(["3", "20"]);
    expect(qs["20"]).toEqual(["a:1", "a:2", "b:1"]);
  });
});

describe("skippedQuestSummary", () => {
  it("lists every unique skipped quest once, with its reasons and route when not on all routes", () => {
    const skips = [
      { questId: 6135, route: "balanced", reason: "cascade" },
      { questId: 4810, route: "balanced", reason: "missing" },
      { questId: 4810, route: "speedrun", reason: "missing" },
      { questId: 6135, route: "balanced", reason: "cascade" },
    ];
    expect(skippedQuestSummary(skips)).toBe("4810 (missing), 6135 (cascade; balanced only)");
    expect(skippedQuestSummary([])).toBe("");
  });
});

describe("joinHooks", () => {
  it("joins by zone + level, once, with a pin only when the hook has NPC coords", () => {
    const steps = [
      step("s1", { actions: [{ type: "goto", at: at(40, 60) }] }),
      step("s2", { actions: [{ type: "goto", at: at(50, 50, "Orgrimmar", 1454) }] }),
      step("s3", { actions: [{ type: "goto", at: at(45, 45) }] }),
    ];
    const levels = [3, 5, 8];
    const hooks = [
      hook("h1", "Durotar", "6-10", { id: 9, x: 51.1, y: 42.6 }),
      hook("h1dup", "Durotar", "6-10", { id: 9, x: 51.1, y: 42.6 }),
      hook("h2", "Durotar", "1-4"),
      hook("writ", "Crafting", "1-60", { id: 7, x: 10, y: 20, zone: "Orgrimmar" }),
      hook("nomatch", "Feralas", "40-50"),
    ];
    hooks[1]!.professionHook.itemName = "Item h1";
    hooks[1]!.professionHook.note = "Keep items (h1)";
    const mapIdFor = (z: string) => ({ Durotar: 1411, Orgrimmar: 1454 })[z];
    const n = joinHooks(steps, levels, hooks, mapIdFor);
    expect(n).toBe(2 + 1);
    expect(steps[2]!.professionHooks!.map((h) => h.note)).toEqual(["Keep items (h1)"]);
    expect(steps[2]!.pins).toEqual([expect.objectContaining({ kind: "npc", npcId: 9, at: { mapId: 1411, zone: "Durotar", x: 51.1, y: 42.6 }, verified: false })]);
    expect(steps[0]!.professionHooks!.map((h) => h.note)).toEqual(["Keep items (h2)"]);
    expect(steps[0]!.pins).toBeUndefined();
    // Writ hook: no step in "Crafting", so it falls back to the turn-in NPC's zone.
    expect(steps[1]!.professionHooks![0]!.npc!.id).toBe(7);
    expect(steps[1]!.pins![0]).toMatchObject({ npcId: 7, at: { mapId: 1454 } });
    // Extra research fields are dropped; verified kept as given.
    expect(steps[0]!.professionHooks![0]).not.toHaveProperty("pass2");
    expect(steps[0]!.professionHooks![0]!.verified).toBe(false);
  });

  it("adds the NPC pin when the step already carries the hook (no double hook, not counted)", () => {
    const h = hook("pre", "Durotar", "1-10", { id: 11, x: 30, y: 40 });
    const steps = [step("s1", { actions: [{ type: "goto", at: at(40, 60) }] })];
    steps[0] = { ...steps[0]!, professionHooks: [cleanHook(h.professionHook)] };
    const n = joinHooks(steps, [5], [h], () => 1411);
    expect(n).toBe(0);
    expect(steps[0]!.professionHooks).toHaveLength(1);
    expect(steps[0]!.pins).toEqual([expect.objectContaining({ kind: "npc", npcId: 11, at: { mapId: 1411, zone: "Durotar", x: 30, y: 40 } })]);
  });
});

describe("ensureHookPins", () => {
  it("pins NPCs of hooks embedded on steps, once, skipping hooks without coords or map", () => {
    const withNpc = cleanHook(hook("e", "Tanaris", "40-50", { id: 21, x: 50, y: 28, zone: "Tanaris" }).professionHook);
    const noNpc = cleanHook(hook("f", "Tanaris", "40-50").professionHook);
    const steps = [step("s1", { actions: [{ type: "goto", at: at(40, 60) }] })];
    steps[0] = { ...steps[0]!, professionHooks: [withNpc, noNpc, withNpc] };
    expect(ensureHookPins(steps, (z) => ({ Tanaris: 1446 })[z])).toBe(1);
    expect(steps[0]!.pins).toEqual([expect.objectContaining({ kind: "npc", npcId: 21, at: { mapId: 1446, zone: "Tanaris", x: 50, y: 28 } })]);
    expect(ensureHookPins(steps, () => 1446)).toBe(0);
  });
});

describe("applyMapAssets", () => {
  const durotar: ZoneInfo = { mapId: 1411, areaId: 14, name: "Durotar", continent: 1, levels: [1, 12] };
  const orgrimmar: ZoneInfo = { mapId: 1454, areaId: 1637, name: "Orgrimmar", continent: 1 };
  const bounds = { left: 1, top: 2, width: 3, height: 4 };

  it("copies image and bounds onto the zone with the matching mapId", () => {
    const [z] = applyMapAssets([durotar], [{ mapId: 1411, image: "maps/1411.webp", bounds }], new Set());
    expect(z).toEqual({ ...durotar, image: "maps/1411.webp", bounds });
  });

  it("leaves an unmatched zone unchanged except for the webp fallback", () => {
    const [matched, unmatched] = applyMapAssets(
      [durotar, orgrimmar],
      [{ mapId: 1411, image: "maps/1411.webp", bounds }],
      new Set([1454]),
    );
    expect(matched).toEqual({ ...durotar, image: "maps/1411.webp", bounds });
    expect(unmatched).toEqual({ ...orgrimmar, image: "maps/1454.webp" });
    expect(unmatched!.bounds).toBeUndefined();
  });

  it("applies the webp fallback only when image is still missing", () => {
    const already: ZoneInfo = { ...durotar, image: "maps/custom.webp" };
    const [kept, filled] = applyMapAssets([already, orgrimmar], undefined, new Set([1411, 1454]));
    expect(kept!.image).toBe("maps/custom.webp");
    expect(filled!.image).toBe("maps/1454.webp");
    const [fromRecord] = applyMapAssets([durotar], [{ mapId: 1411, image: "maps/1411.webp", bounds }], new Set([1411]));
    expect(fromRecord!.image).toBe("maps/1411.webp");
    expect(fromRecord!.bounds).toEqual(bounds);
  });

  it("does not throw when the map source is empty or absent", () => {
    expect(applyMapAssets([durotar], undefined, new Set())).toEqual([durotar]);
    expect(applyMapAssets([durotar], [], new Set())).toEqual([durotar]);
  });
});

describe("loadMapZoneAssets", () => {
  it("returns undefined and does not throw when the file is not valid JSON", () => {
    const path = join(mkdtempSync(join(tmpdir(), "pf-zones-")), "zones.json");
    writeFileSync(path, "{ this is not json", "utf8");
    try {
      expect(loadMapZoneAssets(path)).toBeUndefined();
    } finally {
      unlinkSync(path);
    }
  });
});

describe("buildData", () => {
  const good = pack("horde-1-12", [1, 12], [
    step("p:1", { actions: [{ type: "goto", at: at(40, 60) }, { type: "accept", questId: 100, label: "Old Quest" }], routes: ["balanced", "speedrun"] }),
    step("p:2", { actions: [{ type: "goto", at: at(41, 61) }, { type: "accept", questId: 79953, label: "book" }] }),
    step("p:3", { actions: [{ type: "goto", at: at(42, 62) }, { type: "accept", questId: 95000, label: "new" }], routes: ["balanced"] }),
    step("p:4", { actions: [{ type: "goto", at: at(50, 50, "Orgrimmar", 1454) }], tags: { dungeonId: "rfc", forever: true } as Step["tags"], dungeon: { name: "Ragefire Chasm", instanceId: 2437 } }),
  ]);

  it("writes the UI files and a manifest; passes tags/dungeon through", () => {
    const research = writeResearch({ "horde-1-20/p.json": good, "dungeons/d.json": pack("horde-dungeons", [13, 60], [step("d:1", { dungeon: { name: "Wailing Caverns", instanceId: 43 } })]) }, (dir) => {
      mkdirSync(join(dir, "professions"), { recursive: true });
      writeFileSync(join(dir, "professions/class_professions.json"), "{}");
      writeFileSync(join(dir, "professions/tips_matrix.json"), "{}");
      writeFileSync(join(dir, "professions/profession_hooks.json"), JSON.stringify([hook("h", "Durotar", "1-12", { id: 9, x: 1, y: 2 })]));
    });
    const out = mkdtempSync(join(tmpdir(), "pf-out-"));
    const m = buildData({ research, out, questDb: db, now: "2026-11-21T00:00:00.000Z" });
    for (const f of ["manifest.json", "guide_index.json", "quest-steps.json", "insights.json", "guides/horde-1-12.json", "guides/horde-dungeons.json", "quests-min.json", "quests-geo.json", "quests-detail.json", "zones.json", "class_professions.json", "profession_hooks.json", "trainers.json", "search-index.json"]) {
      expect(existsSync(join(out, f)), f).toBe(true);
    }
    expect(existsSync(join(out, "quests.json"))).toBe(false);
    expect(existsSync(join(out, "tips_matrix.json"))).toBe(false);
    expect(m.packs.map((p) => [p.id, p.kind, p.file, p.source])).toEqual([
      ["horde-1-12", "leveling", "guides/horde-1-12.json", "research/horde-1-20/p.json"],
      ["horde-dungeons", "dungeons", "guides/horde-dungeons.json", "research/dungeons/d.json"],
    ]);
    expect(m.packs[0]!.routes).toEqual({ balanced: 3, speedrun: 2 });
    expect(m.stats).toEqual({ strippedSteps: 1, forcedUnverified: 1, hooksJoined: 1, hooksSkipped: 0 });
    expect(read<DataManifest>(out, "manifest.json").byLevel.map((b) => b.label)).toEqual(["1-12", "13-60"]);

    const g = read<Guide>(out, "guides/horde-1-12.json");
    expect(g.steps.map((s) => [s.id, s.n])).toEqual([["p:1", 1], ["p:3", 2], ["p:4", 3]]);
    for (const s of g.steps) expect(s.sources).toBeUndefined();
    expect(g.steps[1]!.verified).toBe(false);
    expect(g.steps[2]!.tags).toEqual({ dungeonId: "rfc", forever: true });
    expect(g.steps[2]!.dungeon).toEqual({ name: "Ragefire Chasm", instanceId: 2437 });
    expect(g.sections.map((s) => [s.zone, s.mapId, s.firstStep, s.lastStep])).toEqual([["Durotar", 1411, "p:1", "p:3"], ["Orgrimmar", 1454, "p:4", "p:4"]]);
    expect(g.steps[0]!.professionHooks).toHaveLength(1);

    const idx = read<GuideIndex>(out, "guide_index.json");
    // Dungeon packs are still built for step copying, but omitted from guide_index brackets.
    expect(idx.brackets).toEqual([
      { label: "1-12", guides: ["horde-1-12"], idPrefixes: { "horde-1-12": ["horde-1-12", "p"] } },
    ]);
    expect(idx.starts).toEqual([{ race: ["Orc", "Troll"], label: "Durotar", firstGuide: "horde-1-12" }]);
    expect(idx.entries).toEqual([{ slug: "horde-1-12", title: "Horde-1-12", stepIds: ["p:1", "p:3", "p:4"], stepCount: 3 }]);

    const quests = read<{ id: number; start: { name: string; at?: unknown }[]; xp?: number }[]>(out, "quests-min.json");
    expect(quests.map((q) => q.id)).toEqual([100, 95000]);
    expect(quests[0]!.start[0]).not.toHaveProperty("at");
    expect(quests[0]).not.toHaveProperty("inGuides");
    const geo = read<{ id: number; start: { at: unknown[] }[]; objectives: { at: unknown[] }[] }[]>(out, "quests-geo.json");
    expect(geo[0]!.start[0]!.at).toEqual([{ mapId: 1411, x: 40, y: 60, zone: "Durotar", exact: true }]);
    expect(geo[0]!.objectives[0]!.at).toHaveLength(1);
    const detail = read<{ id: number; objectivesText: string[]; drops: unknown[] }[]>(out, "quests-detail.json");
    expect(detail.map((d) => d.id)).toEqual([100, 95000]);

    // quest-steps.json: quest id → step ids (loader.ts loadQuestSteps shape).
    const qs = read<Record<string, string[]>>(out, "quest-steps.json");
    expect(qs).toEqual({ "100": ["p:1"], "95000": ["p:3"] });

    // insights.json: a valid Insights; issues list what the build changed.
    const ins = read<Insights>(out, "insights.json");
    expect(ins.added).toEqual({});
    expect(ins.nearMisses).toEqual({});
    expect(ins.issues).toEqual([
      { severity: "warn", guide: "horde-1-12", questId: 79953, questName: "Excluded book", msg: ISSUE_LEFT_OUT },
      { severity: "info", guide: "horde-1-12", step: "p:3", msg: ISSUE_UNCHECKED },
    ]);
  });

  it("fails the build on a schema error", () => {
    const bad = pack("bad", [1, 5], [{ ...step("x:1"), raw: "nope" } as unknown as Step]);
    const research = writeResearch({ "horde-1-20/bad.json": bad });
    expect(() => buildData({ research, out: mkdtempSync(join(tmpdir(), "pf-out-")), questDb: db })).toThrow(/validation failed[\s\S]*bad\.json/);
  });

  it("fails on duplicate pack ids", () => {
    const research = writeResearch({ "a/p.json": pack("same", [1, 5], [step("a")]), "b/p.json": pack("same", [5, 9], [step("b")]) });
    expect(() => buildData({ research, out: mkdtempSync(join(tmpdir(), "pf-out-")), questDb: db })).toThrow(/duplicate pack id same/);
  });

  it("fails when two leveling packs turn in the same quest; ignores the dungeon reference pack", () => {
    const a = pack("horde-20-40", [20, 40], [step("a:1", { actions: [{ type: "turnin", questId: 193, label: "x" }] }), step("a:2", { actions: [{ type: "turnin", questId: 3520, label: "x" }] })]);
    const b = pack("horde-40-60", [40, 60], [step("b:1", { actions: [{ type: "turnin", questId: 193, label: "x" }] })]);
    const d = pack("horde-dungeons-15-60", [13, 60], [
      step("d:1", { dungeon: { name: "ZF" }, actions: [{ type: "turnin", questId: 3520, label: "x" }] }),
      step("d:2", { dungeon: { name: "ST" }, actions: [{ type: "turnin", questId: 3520, label: "x" }] }),
    ]);
    const out = () => mkdtempSync(join(tmpdir(), "pf-out-"));
    expect(() => buildData({ research: writeResearch({ "a.json": a, "b.json": b, "dungeons/d.json": d }), out: out(), questDb: db })).toThrow(
      /duplicate turn-in check \(leveling packs\) failed: 1 quest\(s\)[\s\S]*\[balanced\] quest 193 turned in by horde-20-40 \(a:1\) and horde-40-60 \(b:1\)[\s\S]*\[speedrun\] quest 193/,
    );
    expect(buildData({ research: writeResearch({ "a.json": a, "dungeons/d.json": d }), out: out(), questDb: db }).packs).toHaveLength(2);
  });

  it("runs the prereq check after the transforms, in fail / warn / off mode, with the research allowlist", () => {
    const db2: QuestDb = { ...db, quests: { ...db.quests, "200": { id: 200, name: "Needs 100", level: 5, pre: { single: [100] } } } as QuestDb["quests"] };
    const p = pack("solo", [20, 40], [step("a:1", { actions: [{ type: "accept", questId: 200, label: "x" }] })]);
    const research = writeResearch({ "a.json": p });
    const out = () => mkdtempSync(join(tmpdir(), "pf-out-"));
    expect(() => buildData({ research, out: out(), questDb: db2 })).toThrow(/solo step a:1: accept quest 200 before any of \[100\]/);
    expect(buildData({ research, out: out(), questDb: db2, prereqMode: "warn" }).warnings.some((w) => w.includes("accept quest 200"))).toBe(true);
    expect(buildData({ research, out: out(), questDb: db2, prereqMode: "off" }).warnings.some((w) => w.startsWith("prereq"))).toBe(false);
    writeFileSync(join(research, "prereq-allowlist.json"), JSON.stringify([{ questId: 200, missingPre: [100], reason: "stale in Forever", source: "https://example.com" }]));
    expect(buildData({ research, out: out(), questDb: db2 }).packs).toHaveLength(1);
    expect(parsePrereqMode(undefined)).toBe("fail");
    expect(parsePrereqMode("warn")).toBe("warn");
    expect(() => parsePrereqMode("nope")).toThrow(/PF_PREREQ_CHECK/);
  });

  it("runs the turn-in check after the pack transforms (hook point)", () => {
    const a = pack("solo", [20, 40], [step("a:1", { actions: [{ type: "turnin", questId: 5, label: "x" }] })]);
    const research = writeResearch({ "a.json": a });
    const dup: PackTransform = (p) => ({ ...p, steps: [...p.steps, { ...p.steps[0]!, id: "a:copy" }] });
    expect(() => buildData({ research, out: mkdtempSync(join(tmpdir(), "pf-out-")), questDb: db, transforms: [...PACK_TRANSFORMS, dup] })).toThrow(/quest 5 turned in by solo \(a:1, a:copy\) \(same pack\)/);
  });

  it("groups by bracket, keeps an explicit next, and records shared id prefixes", () => {
    const guide = (slug: string, min: number, max: number, ids: string[], next?: string): Guide => ({
      slug,
      name: slug,
      displayName: slug,
      subgroup: "Leveling",
      minLevel: min,
      maxLevel: max,
      next,
      zones: ["The Barrens"],
      source: "builtin",
      sections: [],
      steps: ids.map((id, n) => step(id, { n: n + 1 })),
    });
    const early = guide("barrens-12-20", 12, 20, ["barrens-12-20:s"]);
    const needles = guide("horde-20-40-04-needles", 20, 40, ["horde-20-40:to-needles"], "custom-next");
    const later = guide("horde-40-60-01", 40, 60, ["h4060:s"]);
    const index = buildIndex([needles, early, later], "t", new Map([[needles.slug, "20-40"]]));
    attachIdPrefixes(index, [early, needles, later]);
    expect(index.brackets.map((b) => b.label)).toEqual(["12-20", "20-40", "40-60"]);
    expect(index.brackets[1]).toEqual({
      label: "20-40",
      guides: ["horde-20-40-04-needles"],
      idPrefixes: { "horde-20-40-04-needles": ["horde-20-40-04-needles", "horde-20-40"] },
    });
    expect(index.brackets[2]!.idPrefixes).toEqual({ "horde-40-60-01": ["horde-40-60-01", "h4060"] });
    expect(early.next).toBe("horde-20-40-04-needles");
    expect(needles.next).toBe("custom-next");
    expect(makeValidators().pack({ ...pack("horde-20-40-04-needles", [20, 40], []), bracket: "20-40", next: "horde-20-40-05" })).toBe(true);
    expect(makeValidators().pack(pack("durotar", [1, 12], []))).toBe(true);
  });

  it("builds the committed research/ tree without errors", () => {
    const research = fileURLToPath(new URL("../../research/", import.meta.url));
    const out = mkdtempSync(join(tmpdir(), "pf-out-"));
    // Prereq check in warn mode here: main's packs still have open prereq findings (they are listed in
    // manifest.warnings); `npm run build` uses the default fail mode, PF_PREREQ_CHECK=warn downgrades it.
    const m = buildData({ research, out, prereqMode: "warn" });
    expect(m.packs.length).toBeGreaterThan(0);
    for (const p of m.packs) {
      const g = read<Guide>(out, p.file);
      expect(g.steps.length).toBe(p.steps);
      for (const s of g.steps) for (const a of s.actions) if ("questId" in a) expect([79953, 81951]).not.toContain(a.questId);
    }
  });
});

describe("buildLandingStats", () => {
  it("totals steps across guides, quests on the route and distinct zones", () => {
    const g = (zones: string[], n: number) => ({ zones, steps: Array.from({ length: n }, (_, i) => ({ id: `s${i}` })) }) as unknown as Guide;
    const stats = buildLandingStats([g(["Durotar", "Orgrimmar"], 3), g(["Durotar", "The Barrens"], 2)], { "1": ["a"], "2": ["b"], "3": ["c", "d"] });
    expect(stats).toEqual({ steps: 5, quests: 3, zones: 3 });
  });
});
