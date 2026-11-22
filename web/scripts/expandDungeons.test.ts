import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Guide, RoutePack, Step } from "../../contracts/schema.ts";
import type { Step as WebStep } from "../src/data/schema";
import { resolveRoute } from "../src/lib/resolveRoute";
import { buildData, type DataManifest, type QuestDb } from "./build-data.ts";
import { dungeonIdOf, expandDungeonPlaceholders, makeExpandContext, type PrereqGuard } from "./expandDungeons.ts";
import type { DungeonDossier, IntegrationPlan } from "./dungeonPlan.ts";
import type { AllowlistEntry, PrereqQuest } from "./prereq-check.ts";
import { assertNoDuplicateTurnIns } from "./turnin-check.ts";

const SRC = [{ url: "https://example.com/test", label: "test" }];
const at = { mapId: 1418, x: 44.6, y: 12.1, zone: "Badlands", exact: true };
const ULD = { name: "Uldaman", instanceId: 1337, levels: [42, 52] as [number, number] };

function step(id: string, extra: Partial<Step> = {}): Step {
  return { id, n: 1, tags: {}, text: [{ segments: [{ t: id }] }], actions: [], conditions: [], sources: SRC, verified: true, ...extra };
}
const accept = (q: number) => ({ type: "accept" as const, questId: q, label: `Q${q}` });
const turnin = (q: number) => ({ type: "turnin" as const, questId: q, label: `Q${q}` });

/** Dungeons pack steps for Uldaman (ids like research/dungeons/steps-v2.json) plus one tagged Forever dungeon. */
function dungeonSteps(): Step[] {
  const d = { dungeon: ULD, routes: ["balanced" as const] };
  return [
    step("dungeons:uldaman:accept:1", { ...d, actions: [{ type: "goto", at }, accept(1)] }),
    step("dungeons:uldaman:accept:2", { ...d, actions: [accept(2)] }),
    step("dungeons:uldaman:run", { ...d, actions: [{ type: "goto", at }] }),
    step("dungeons:uldaman:turnin:1", { ...d, actions: [turnin(1)] }),
    step("dungeons:uldaman:turnin:2", { ...d, actions: [turnin(2)] }),
    step("dungeons:uldaman:off", { dungeonsOff: true, alternativeTo: ["dungeons:uldaman:run"], routes: ["balanced", "speedrun"] }),
    step("dungeons:forever:krol-dok-stronghold:q1", { dungeon: { name: "Krol'dok Stronghold" }, tags: { dungeonId: "kroldok-stronghold" } as Step["tags"], routes: ["balanced", "speedrun"], actions: [accept(3)] }),
    step("dungeons:forever:krol-dok-stronghold:run", { dungeon: { name: "Krol'dok Stronghold" }, tags: { dungeonId: "kroldok-stronghold" } as Step["tags"], routes: ["balanced", "speedrun"] }),
  ];
}

function placeholder(id: string, dungeonId: string, routes: Step["routes"] = ["balanced", "speedrun"]): Step[] {
  return [
    step(id, { tags: { dungeonId } as Step["tags"], dungeon: ULD, routes }),
    step(`${id}:off`, { dungeonsOff: true, alternativeTo: [id], routes }),
  ];
}

function run(packs: { id: string; steps: Step[] }[], dsteps = dungeonSteps()) {
  const warnings: string[] = [];
  const ctx = makeExpandContext(dsteps, packs.flatMap((p) => p.steps), [...dsteps, ...packs.flatMap((p) => p.steps)].map((s) => s.id), warnings);
  const out = packs.map((p) => expandDungeonPlaceholders(p.id, p.steps, ctx));
  return { out, warnings };
}

const ids = (s: readonly { id: string }[]) => s.map((x) => x.id);

describe("expandDungeonPlaceholders", () => {
  it("reads the dungeon id from tags.dungeonId or the step id", () => {
    expect(dungeonIdOf(step("dungeons:uldaman:accept:1"))).toBe("uldaman");
    expect(dungeonIdOf(step("dungeons:forever:alcaz-prison:q1"))).toBe("alcaz-prison");
    expect(dungeonIdOf(step("dungeons:forever:krol-dok-stronghold:q1", { tags: { dungeonId: "kroldok-stronghold" } as Step["tags"] }))).toBe("kroldok-stronghold");
  });

  it("splices accepts before and run + turn-ins after a matched placeholder, keeping its dungeons-off alternative", () => {
    const steps = [step("p:1"), ...placeholder("p:uld", "uldaman"), step("p:2")];
    const { out, warnings } = run([{ id: "p", steps }]);
    expect(ids(out[0]!.steps)).toEqual([
      "p:1",
      "p:uld+dungeons:uldaman:accept:1",
      "p:uld+dungeons:uldaman:accept:2",
      "p:uld",
      "p:uld+dungeons:uldaman:run",
      "p:uld+dungeons:uldaman:turnin:1",
      "p:uld+dungeons:uldaman:turnin:2",
      "p:uld:off",
      "p:2",
    ]);
    expect(out[0]!.stats).toMatchObject({ placeholders: 1, expanded: 1, inserted: 5 });
    expect(warnings).toEqual([]);
    const ins = out[0]!.steps.filter((s) => s.id.includes("+"));
    for (const s of ins) {
      expect(s.dungeon).toEqual(ULD); // dungeon-gated
      expect(s.dungeonsOff).toBeUndefined();
      expect(s.alternativeTo).toEqual(["p:uld:off"]); // dungeons-on alternative of the off path
      expect(s.tags).toMatchObject({ dungeonId: "uldaman", expandedFrom: "p:uld" });
    }
    // the dungeons pack's own :off step is never inserted; the placeholder and its alternative are untouched
    expect(out[0]!.steps.some((s) => s.id.endsWith("dungeons:uldaman:off"))).toBe(false);
    expect(out[0]!.steps.find((s) => s.id === "p:uld")).toBe(steps[1]);
    expect(out[0]!.steps.find((s) => s.id === "p:uld:off")).toBe(steps[2]);
  });

  it("matches Forever dungeons by tags.dungeonId", () => {
    const { out } = run([{ id: "p", steps: placeholder("p:kd", "kroldok-stronghold") }]);
    expect(ids(out[0]!.steps)).toEqual(["p:kd+dungeons:forever:krol-dok-stronghold:q1", "p:kd", "p:kd+dungeons:forever:krol-dok-stronghold:run", "p:kd:off"]);
  });

  it("keeps an unmatched placeholder and warns instead of failing", () => {
    const steps = placeholder("p:x", "no-such-dungeon");
    const { out, warnings } = run([{ id: "p", steps }]);
    expect(out[0]!.steps).toEqual(steps);
    expect(out[0]!.stats.unmatched).toEqual(["no-such-dungeon"]);
    expect(warnings.join("\n")).toMatch(/p:x has dungeonId "no-such-dungeon"/);
  });

  it("keeps existing ids and order, and inserted ids are deterministic and unique", () => {
    const steps = [step("a"), ...placeholder("a:uld", "uldaman"), step("b")];
    const one = run([{ id: "a", steps }]).out[0]!.steps;
    const two = run([{ id: "a", steps }]).out[0]!.steps;
    expect(ids(one)).toEqual(ids(two));
    expect(ids(one).filter((id) => !id.includes("+"))).toEqual(ids(steps));
    expect(new Set(ids(one)).size).toBe(one.length);
  });

  it("only inserts a step on routes both the placeholder and the dungeon step allow", () => {
    const both = run([{ id: "p", steps: placeholder("p:u", "uldaman") }]).out[0]!.steps;
    for (const s of both.filter((x) => x.id.includes("+"))) expect(s.routes).toEqual(["balanced"]);
    const speed = run([{ id: "p", steps: placeholder("p:u", "uldaman", ["speedrun"]) }]).out[0]!;
    expect(speed.stats.inserted).toBe(0);
    expect(speed.stats.skippedRoutes).toBe(5);
  });

  it("skips quests the leveling packs already accept or turn in, per route", () => {
    const steps = [
      step("lv:acc1", { routes: ["balanced"], actions: [accept(1)] }), // accepted in the open world → keep the dungeon turn-in
      step("lv:done2", { routes: ["balanced"], actions: [accept(2), turnin(2)] }), // fully done elsewhere → skip both
      step("lv:offonly", { dungeonsOff: true, actions: [turnin(3)] }), // dungeons-off path does not count
      ...placeholder("p:u", "uldaman"),
      ...placeholder("p:k", "kroldok-stronghold"),
    ];
    const { out } = run([{ id: "lv", steps }]);
    const got = ids(out[0]!.steps).filter((id) => id.includes("+"));
    expect(got).toEqual([
      "p:u+dungeons:uldaman:run",
      "p:u+dungeons:uldaman:turnin:1",
      "p:k+dungeons:forever:krol-dok-stronghold:q1",
      "p:k+dungeons:forever:krol-dok-stronghold:run",
    ]);
    expect(out[0]!.stats.skippedDuplicateQuests).toBe(3);
  });

  it("drops only the routes where the quest is already turned in earlier", () => {
    const dsteps = [step("dungeons:alcaz-prison:turnin:9", { dungeon: { name: "Alcaz Prison" }, routes: ["balanced", "speedrun"], actions: [turnin(9)] })];
    const steps = [step("lv:t9", { routes: ["speedrun"], actions: [turnin(9)] }), ...placeholder("p:a", "alcaz-prison")];
    const s = run([{ id: "lv", steps }], dsteps).out[0]!.steps.find((x) => x.id === "p:a+dungeons:alcaz-prison:turnin:9")!;
    expect(s.routes).toEqual(["balanced"]);
  });

  it("expands a dungeon once across packs (first by level) and warns on repeats", () => {
    const { out, warnings } = run([
      { id: "p20", steps: placeholder("p20:u", "uldaman") },
      { id: "p40", steps: [...placeholder("p40:u", "uldaman"), ...placeholder("p40:u2", "uldaman")] },
    ]);
    expect(out[0]!.stats.inserted).toBe(5);
    expect(out[1]!.stats).toMatchObject({ inserted: 0, repeated: ["uldaman", "uldaman"] });
    expect(ids(out[1]!.steps)).toEqual(["p40:u", "p40:u:off", "p40:u2", "p40:u2:off"]);
    expect(warnings.filter((w) => /repeats dungeonId "uldaman" \(already expanded at p20:u\)/.test(w))).toHaveLength(2);
  });

  it("resolveRoute shows the expanded steps only with dungeons on, and the alternative only with dungeons off", () => {
    const steps = [step("a", { actions: [accept(50)] }), ...placeholder("p:u", "uldaman"), step("b", { actions: [turnin(50)] })];
    const expanded = run([{ id: "p", steps }]).out[0]!.steps as unknown as WebStep[];
    const vis = (dungeons: boolean, route: "balanced" | "speedrun") => ids(resolveRoute(expanded, { route, dungeons }).steps);
    expect(vis(true, "balanced")).toEqual([
      "a",
      "p:u+dungeons:uldaman:accept:1",
      "p:u+dungeons:uldaman:accept:2",
      "p:u",
      "p:u+dungeons:uldaman:run",
      "p:u+dungeons:uldaman:turnin:1",
      "p:u+dungeons:uldaman:turnin:2",
      "b",
    ]);
    expect(vis(false, "balanced")).toEqual(["a", "p:u:off", "b"]);
    expect(vis(true, "speedrun")).toEqual(["a", "p:u", "b"]); // dungeon quests are balanced-only
    expect(vis(false, "speedrun")).toEqual(["a", "p:u:off", "b"]);
    const hidden = resolveRoute(expanded, { route: "balanced", dungeons: false }).hidden;
    expect(hidden["p:u+dungeons:uldaman:run"]).toBe("dungeons");
    expect(assertNoDuplicateTurnIns([{ id: "p", steps: expanded as unknown as Step[] }])).toEqual([]);
  });

  it("passes the duplicate turn-in check: inserted steps vs the dungeons-off path, and duplicates inside the dungeon pack", () => {
    // The dungeon pack turns quest 1 in twice (two dungeons share it); the off path turns it in too.
    const dsteps = [
      ...dungeonSteps(),
      step("dungeons:zulfarrak:turnin:1", { dungeon: { name: "Zul'Farrak" }, routes: ["balanced"], actions: [turnin(1)] }),
    ];
    const steps = [
      ...placeholder("p:u", "uldaman"),
      ...placeholder("p:z", "zulfarrak"),
      step("open:t1", { dungeonsOff: true, alternativeTo: ["p:u"], actions: [turnin(1)] }),
    ];
    const { out } = run([{ id: "p", steps }], dsteps);
    expect(ids(out[0]!.steps)).not.toContain("p:z+dungeons:zulfarrak:turnin:1"); // already turned in at Uldaman
    expect(assertNoDuplicateTurnIns([{ id: "p", steps: out[0]!.steps }])).toEqual([]);
  });
});

describe("expandDungeonPlaceholders anchors mode", () => {
  const tinyPlan = (): IntegrationPlan => ({
    dungeons: [
      {
        id: "uldaman",
        levels: [42, 52],
        byRoute: {
          balanced: {
            byRace: {
              all: {
                includedQuestIds: [1],
                pickups: [{ afterStepId: "lv:anchor", questIds: [1], dungeonStepIds: ["dungeons:uldaman:accept:1"] }],
                prep: { afterStepId: "lv:anchor", estLevel: 44 },
                run: { afterStepId: "lv:anchor", estLevel: 44, insideQuestIds: [] },
                turnins: [],
              },
            },
          },
        },
      },
    ],
  });
  const tinyDossier = (): Map<string, DungeonDossier> =>
    new Map([
      [
        "uldaman",
        {
          id: "uldaman",
          name: "Uldaman",
          runStepId: "dungeons:uldaman:run",
          quests: [{ questId: 1, name: "Old" }],
          prep: { hearth: "Kargath", consumables: ["food"], group: "5-player", warnings: ["Bring a group."] },
        },
      ],
    ]);

  it("inserts pickup, prep, and run after the anchor in the anchor section, dungeon-gated, with no Dungeon: section", () => {
    const anchor = step("lv:anchor", { section: "Badlands", routes: ["balanced", "speedrun"], actions: [accept(50)] });
    const packs = [{ id: "lv", steps: [anchor, step("lv:next", { section: "Badlands" })] }];
    const dsteps = dungeonSteps();
    const warnings: string[] = [];
    const ctx = makeExpandContext(
      dsteps,
      packs.flatMap((p) => p.steps),
      [...dsteps, ...packs.flatMap((p) => p.steps)].map((s) => s.id),
      warnings,
      undefined,
      tinyPlan(),
      tinyDossier(),
    );
    const out = expandDungeonPlaceholders("lv", packs[0]!.steps, ctx);
    const got = ids(out.steps);
    expect(got).toEqual([
      "lv:anchor",
      "lv:anchor+dungeons:uldaman:accept:1",
      "lv:anchor+prep:uldaman",
      "lv:anchor+dungeons:uldaman:run",
      "lv:next",
    ]);
    const pickup = out.steps.find((s) => s.id.endsWith(":accept:1"))!;
    const prep = out.steps.find((s) => s.id.includes("+prep:"))!;
    const run = out.steps.find((s) => s.id.endsWith(":run"))!;
    for (const s of [pickup, prep, run]) {
      expect(s.section).toBe("Badlands");
      expect(s.dungeon).toBeTruthy();
      expect(s.section?.startsWith("Dungeon:")).toBe(false);
    }
    expect(pickup.tags).toMatchObject({ dungeonPart: "pickup", dungeonId: "uldaman" });
    expect(prep.tags).toMatchObject({ dungeonPart: "prep" });
    expect(run.tags).toMatchObject({ dungeonPart: "run" });
    expect(run.routes).toEqual(["balanced"]);
    expect(run.text[0]?.segments[0]?.t).toMatch(/about level 44/);
    expect(out.steps.some((s) => (s.section ?? "").startsWith("Dungeon:"))).toBe(false);
  });

  it("sets dungeonsOffRoutes on speedrun.replaces steps without removing them", () => {
    const plan: IntegrationPlan = {
      dungeons: [
        {
          id: "uldaman",
          levels: [42, 52],
          byRoute: {
            speedrun: {
              replaces: ["lv:ow"],
              byRace: {
                all: {
                  includedQuestIds: [],
                  pickups: [],
                  prep: { afterStepId: "lv:anchor", estLevel: 44 },
                  run: { afterStepId: "lv:anchor", estLevel: 44, insideQuestIds: [] },
                  turnins: [],
                },
              },
            },
          },
        },
      ],
    };
    const steps = [
      step("lv:ow", { routes: ["balanced", "speedrun"], actions: [accept(9)] }),
      step("lv:anchor", { section: "Badlands", routes: ["balanced", "speedrun"] }),
    ];
    const dsteps = dungeonSteps();
    const warnings: string[] = [];
    const ctx = makeExpandContext(dsteps, steps, [...dsteps, ...steps].map((s) => s.id), warnings, undefined, plan, tinyDossier());
    const out = expandDungeonPlaceholders("lv", steps, ctx);
    const ow = out.steps.find((s) => s.id === "lv:ow")!;
    expect(ow.dungeonsOffRoutes).toEqual(["speedrun"]);
    expect(ow.dungeonsOff).toBeUndefined();
    expect(ids(out.steps)).toContain("lv:ow");
  });

  it("drops plan-controlled placeholders instead of expanding them", () => {
    const plan = tinyPlan();
    const steps = [...placeholder("lv:uld", "uldaman"), step("lv:anchor", { section: "Badlands" })];
    const dsteps = dungeonSteps();
    const warnings: string[] = [];
    const ctx = makeExpandContext(dsteps, steps, [...dsteps, ...steps].map((s) => s.id), warnings, undefined, plan, tinyDossier());
    const out = expandDungeonPlaceholders("lv", steps, ctx);
    expect(ids(out.steps)).not.toContain("lv:uld");
    expect(ids(out.steps)).not.toContain("lv:uld:off");
    expect(out.stats.placeholdersDropped).toBeGreaterThanOrEqual(2);
    expect(ids(out.steps)).toContain("lv:anchor+dungeons:uldaman:accept:1");
  });

  it("keeps the run when an on-run accept fails the prereq guard (strips the accept, does not drop the run)", () => {
    const plan: IntegrationPlan = {
      dungeons: [
        {
          id: "zulfarrak",
          levels: [44, 54],
          byRoute: {
            balanced: {
              byRace: {
                all: {
                  includedQuestIds: [5],
                  pickups: [],
                  prep: { afterStepId: "lv:anchor", estLevel: 46 },
                  run: { afterStepId: "lv:anchor", estLevel: 46, insideQuestIds: [5] },
                  turnins: [],
                },
              },
            },
          },
        },
      ],
    };
    const dossier: Map<string, DungeonDossier> = new Map([
      [
        "zulfarrak",
        {
          id: "zulfarrak",
          name: "Zul'Farrak",
          runStepId: "dungeons:zulfarrak:run",
          quests: [{ questId: 5, name: "Inside", stepIds: { accept: "dungeons:zulfarrak:accept:5" } }],
          prep: { hearth: "Gadgetzan", consumables: ["food"], group: "5-player" },
        },
      ],
    ]);
    const ZF = { name: "Zul'Farrak", instanceId: 1176, levels: [44, 54] as [number, number] };
    const dsteps = [
      step("dungeons:zulfarrak:accept:5", { dungeon: ZF, routes: ["balanced"], actions: [accept(5)] }),
      step("dungeons:zulfarrak:run", {
        dungeon: ZF,
        routes: ["balanced"],
        actions: [{ type: "goto", at }, accept(5), { type: "collect" as const, itemId: 1, count: 1, questId: 5, label: "q5" }],
      }),
    ];
    const steps = [step("lv:anchor", { section: "Tanaris", routes: ["balanced", "speedrun"] })];
    const warnings: string[] = [];
    const prereq: PrereqGuard = {
      quests: { "5": { pre: { single: [99] } } },
      allowlist: [],
      walk: [{ id: "lv", levels: [40, 60], steps }],
    };
    const ctx = makeExpandContext(dsteps, steps, [...dsteps, ...steps].map((s) => s.id), warnings, prereq, plan, dossier);
    const out = expandDungeonPlaceholders("lv", steps, ctx);
    const run = out.steps.find((s) => s.id.endsWith(":run"))!;
    expect(run).toBeTruthy();
    expect(run.routes).toContain("balanced");
    expect(run.actions.some((a) => a.type === "accept" && "questId" in a && a.questId === 5)).toBe(false);
    expect(run.actions.some((a) => "questId" in a && a.questId === 5)).toBe(false);
    expect(run.actions.some((a) => a.type === "goto")).toBe(true);
  });

  it("accepts a follow-up after the prerequisite turn-in when the hub matches, and omits it from the run sentence", () => {
    const org = { mapId: 1454, x: 59.5, y: 36.6, zone: "Orgrimmar", exact: true };
    const plan: IntegrationPlan = {
      dungeons: [
        {
          id: "uldaman",
          levels: [42, 52],
          byRoute: {
            balanced: {
              byRace: {
                all: {
                  includedQuestIds: [2283, 2284],
                  pickups: [{ afterStepId: "lv:early", questIds: [2283, 2284], dungeonStepIds: ["dungeons:uldaman:accept:2283", "dungeons:uldaman:accept:2284"] }],
                  run: { afterStepId: "lv:run", estLevel: 45, insideQuestIds: [] },
                  turnins: [{ afterStepId: "lv:org", questIds: [2283], dungeonStepIds: ["dungeons:uldaman:turnin:2283"], sameHub: false }],
                },
              },
            },
          },
        },
      ],
    };
    const dossier: Map<string, DungeonDossier> = new Map([
      [
        "uldaman",
        {
          id: "uldaman",
          name: "Uldaman",
          runStepId: "dungeons:uldaman:run",
          quests: [
            { questId: 2283, name: "Necklace Recovery", giver: { hub: "Orgrimmar", zone: "Orgrimmar" }, stepIds: { accept: "dungeons:uldaman:accept:2283", turnin: "dungeons:uldaman:turnin:2283" } },
            { questId: 2284, name: "Necklace Recovery, Take 2", giver: { hub: "Orgrimmar", zone: "Orgrimmar" }, prerequisites: [2283], stepIds: { accept: "dungeons:uldaman:accept:2284" } },
          ],
        },
      ],
    ]);
    const d = { dungeon: ULD, routes: ["balanced" as const] };
    const dsteps = [
      step("dungeons:uldaman:accept:2283", { ...d, actions: [accept(2283)] }),
      step("dungeons:uldaman:accept:2284", { ...d, text: [{ segments: [{ t: "Accept from Dran Droffers (Orgrimmar)" }] }], actions: [accept(2284)] }),
      step("dungeons:uldaman:run", { ...d, actions: [{ type: "goto", at }] }),
      step("dungeons:uldaman:turnin:2283", { ...d, text: [{ segments: [{ t: "Turn in Necklace Recovery to Dran Droffers (Orgrimmar)" }] }], actions: [{ type: "goto", at: org }, turnin(2283)] }),
    ];
    const steps = [
      step("lv:early", { section: "Orgrimmar", routes: ["balanced", "speedrun"] }),
      step("lv:run", { section: "Badlands", routes: ["balanced", "speedrun"] }),
      step("lv:org", { section: "Orgrimmar", routes: ["balanced", "speedrun"] }),
    ];
    const warnings: string[] = [];
    const prereq: PrereqGuard = {
      quests: { "2284": { pre: { single: [2283] } } },
      allowlist: [],
      walk: [{ id: "lv", levels: [40, 60], steps }],
    };
    const ctx = makeExpandContext(dsteps, steps, [...dsteps, ...steps].map((s) => s.id), warnings, prereq, plan, dossier);
    const out = expandDungeonPlaceholders("lv", steps, ctx);
    const got = ids(out.steps);
    const accept2284 = got.indexOf("lv:org+dungeons:uldaman:accept:2284");
    const turn2283 = got.indexOf("lv:org+dungeons:uldaman:turnin:2283");
    expect(accept2284).toBeGreaterThan(turn2283);
    expect(got).not.toContain("lv:early+dungeons:uldaman:accept:2284");
    const run = out.steps.find((s) => s.id.includes("dungeons:uldaman:run"))!;
    const sentence = run.text.map((b) => b.segments.map((seg) => seg.t).join("")).join(" ");
    expect(sentence).toContain("Necklace Recovery");
    expect(sentence).not.toContain("Take 2");
    expect(warnings.some((w) => w.includes("2284"))).toBe(false);
  });

  it("places a speedrun plan run even when the dungeon pack step is balanced-only", () => {
    const plan: IntegrationPlan = {
      dungeons: [
        {
          id: "city-of-dalaran",
          levels: [30, 40],
          byRoute: {
            speedrun: {
              byRace: {
                all: {
                  includedQuestIds: [],
                  pickups: [],
                  prep: { afterStepId: "lv:anchor", estLevel: 33 },
                  run: { afterStepId: "lv:anchor", estLevel: 33, insideQuestIds: [] },
                  turnins: [],
                },
              },
            },
          },
        },
      ],
    };
    const dossier: Map<string, DungeonDossier> = new Map([
      [
        "city-of-dalaran",
        {
          id: "city-of-dalaran",
          name: "City of Dalaran",
          runStepId: "dungeons:forever:city-of-dalaran:run",
          prep: { hearth: "Undercity", consumables: ["food"], group: "5-player" },
        },
      ],
    ]);
    const dsteps = [
      step("dungeons:forever:city-of-dalaran:run", {
        dungeon: { name: "City of Dalaran" },
        tags: { dungeonId: "city-of-dalaran" } as Step["tags"],
        routes: ["balanced"],
        actions: [{ type: "goto", at }],
      }),
    ];
    const steps = [step("lv:anchor", { section: "Silverpine", routes: ["balanced", "speedrun"] })];
    const warnings: string[] = [];
    const ctx = makeExpandContext(dsteps, steps, [...dsteps, ...steps].map((s) => s.id), warnings, undefined, plan, dossier);
    const out = expandDungeonPlaceholders("lv", steps, ctx);
    const run = out.steps.find((s) => s.id.includes(":run"))!;
    expect(run).toBeTruthy();
    expect(run.routes).toEqual(["speedrun"]);
  });
});

describe("buildData with dungeon expansion", () => {
  const db: QuestDb = {
    quests: {
      "1": { id: 1, name: "Old", level: 44 },
      "2": { id: 2, name: "Old 2", level: 44 },
      "95001": { id: 95001, name: "Forever dungeon quest", level: 45, forever: true },
      "79953": { id: 79953, name: "Excluded", level: 45, forever: true },
    },
    npcs: {},
    objects: {},
    items: {},
    zones: { "3": { name: "Badlands", uiMapId: 1418, continent: 0 } },
  };
  const pack = (id: string, levels: [number, number], steps: Step[]): RoutePack => ({ schema: "project-forever/route", version: 2, id, title: id, levels, steps });

  it("expands in the build, applies the strip / Forever rules to inserted steps and keeps the Dungeons guide", () => {
    const d = { dungeon: ULD, routes: ["balanced" as const] };
    const dsteps = [
      ...dungeonSteps().slice(0, 6),
      step("dungeons:uldaman:accept:95001", { ...d, actions: [accept(95001)] }),
      step("dungeons:uldaman:accept:79953", { ...d, actions: [accept(79953)] }),
    ];
    const dir = mkdtempSync(join(tmpdir(), "pf-expand-"));
    const put = (rel: string, v: unknown) => {
      mkdirSync(join(dir, rel, ".."), { recursive: true });
      writeFileSync(join(dir, rel), JSON.stringify(v));
    };
    put("dungeons/steps-v2.json", pack("horde-dungeons-15-60", [13, 60], dsteps));
    put("horde-40-60-01-riverglades-stv/route.json", pack("horde-40-60-01-riverglades-stv", [40, 60], [step("lv:1", { actions: [{ type: "goto", at }] }), ...placeholder("lv:uld", "uldaman"), ...placeholder("lv:nope", "nope")]));
    const out = mkdtempSync(join(tmpdir(), "pf-out-"));
    const m = buildData({ research: dir, out, questDb: db, hooks: [], now: "2026-01-01T00:00:00Z" });
    expect(m.dungeonExpansion["horde-40-60-01-riverglades-stv"]).toMatchObject({ placeholders: 2, expanded: 1, inserted: 7, unmatched: ["nope"] });
    const g = JSON.parse(readFileSync(join(out, "guides/horde-40-60-01-riverglades-stv.json"), "utf-8")) as Guide;
    const sids = g.steps.map((s) => s.id);
    expect(sids).toContain("lv:uld+dungeons:uldaman:accept:95001");
    expect(sids.some((s) => s.includes("79953"))).toBe(false); // inserted (7), then stripped by enforceRules
    expect(g.steps.find((s) => s.id === "lv:uld+dungeons:uldaman:accept:95001")!.verified).toBe(false); // Forever → unverified
    expect(g.steps.map((s) => s.n)).toEqual(g.steps.map((_, i) => i + 1));
    expect(new Set(sids).size).toBe(sids.length);
    const dg = JSON.parse(readFileSync(join(out, "guides/horde-dungeons-15-60.json"), "utf-8")) as Guide;
    expect(dg.subgroup).toBe("Dungeons");
    expect(dg.steps).toHaveLength(dsteps.length - 1);
    expect((m as DataManifest).warnings.join("\n")).toMatch(/lv:nope has dungeonId "nope"/);
  });
});

describe("dungeon pack order and the prerequisite guard", () => {
  const ZF = { name: "Zul'Farrak", instanceId: 1176, levels: [44, 54] as [number, number] };
  const d = (id: string, actions: Step["actions"], extra: Partial<Step> = {}) =>
    step(`dungeons:zulfarrak:${id}`, { dungeon: ZF, routes: ["balanced", "speedrun"], actions, ...extra });
  const collect = (q: number) => ({ type: "collect" as const, itemId: 1000 + q, count: 1, questId: q, label: `item for ${q}` });

  /** Run with the guard on: `packs` are walked in order (no race start packs), `quests` are QuestieDB rows. */
  function runG(packs: { id: string; levels: [number, number]; steps: Step[] }[], dsteps: Step[], quests: Record<string, PrereqQuest>, allowlist: AllowlistEntry[] = []) {
    const warnings: string[] = [];
    const prereq: PrereqGuard = { quests, allowlist, walk: packs.map((p) => ({ ...p })) };
    const all = [...dsteps, ...packs.flatMap((p) => p.steps)];
    const ctx = makeExpandContext(dsteps, packs.flatMap((p) => p.steps), all.map((s) => s.id), warnings, prereq);
    const out = packs.map((p) => expandDungeonPlaceholders(p.id, p.steps, ctx));
    return { out, warnings };
  }
  const inserted = (steps: Step[]) => ids(steps).filter((i) => i.includes("+")).map((i) => i.split("+")[1]!.replace("dungeons:zulfarrak:", ""));

  it("keeps the dungeon pack's order: steps before the run go before the placeholder, the run and later steps after it", () => {
    const dsteps = [
      d("accept:1", [accept(1)]),
      d("run", [{ type: "goto", at }, collect(1)]),
      d("turnin:1", [turnin(1)]),
      d("accept:2", [accept(2)]), // follow-up accepted after its lead-in turn-in
      d("turnin:2", [turnin(2)]),
    ];
    const quests = { "1": {}, "2": { pre: { single: [1] } } };
    const { out, warnings } = runG([{ id: "lv", levels: [40, 60], steps: placeholder("lv:zf", "zulfarrak") }], dsteps, quests);
    expect(ids(out[0]!.steps)).toEqual([
      "lv:zf+dungeons:zulfarrak:accept:1",
      "lv:zf",
      "lv:zf+dungeons:zulfarrak:run",
      "lv:zf+dungeons:zulfarrak:turnin:1",
      "lv:zf+dungeons:zulfarrak:accept:2",
      "lv:zf+dungeons:zulfarrak:turnin:2",
      "lv:zf:off",
    ]);
    expect(out[0]!.stats.prereqSkippedQuests).toBe(0);
    expect(warnings).toEqual([]);
  });

  const chain = () => [
    d("accept:5", [accept(5)]),
    d("accept:6", [accept(6)]),
    d("accept:7", [accept(7)]),
    d("run", [{ type: "goto", at }, collect(5), collect(7)]),
    d("turnin:5", [turnin(5)]),
    d("objective:6", [collect(6)]),
    d("turnin:6", [turnin(6)]),
    d("turnin:7", [turnin(7)]),
  ];

  it("skips an accept whose prerequisite is not turned in earlier, with its turn-in and objectives, and warns", () => {
    const quests = { "5": { pre: { single: [99] } }, "6": {}, "7": {} };
    const { out, warnings } = runG([{ id: "lv", levels: [40, 60], steps: placeholder("lv:zf", "zulfarrak") }], chain(), quests);
    expect(inserted(out[0]!.steps)).toEqual(["accept:6", "accept:7", "run", "objective:6", "turnin:6", "turnin:7"]);
    const run = out[0]!.steps.find((s) => s.id.endsWith(":run"))!;
    expect(run.actions.some((a) => "questId" in a && a.questId === 5)).toBe(false); // objective of the dropped quest removed
    expect(run.actions.some((a) => "questId" in a && a.questId === 7)).toBe(true);
    expect(out[0]!.stats).toMatchObject({ prereqSkippedQuests: 2, prereqCascaded: 0 }); // quest 5 on both routes
    expect(warnings.filter((w) => /skipped dungeon quest 5 \(zulfarrak\) — prerequisite 99 not turned in earlier/.test(w))).toHaveLength(2);
  });

  it("cascades: a follow-up of a skipped quest is skipped too", () => {
    const quests = { "5": { pre: { single: [99] } }, "6": { pre: { single: [5] } }, "7": { pre: { group: [6] } } };
    const dsteps = [d("accept:5", [accept(5)]), d("turnin:5", [turnin(5)]), d("accept:6", [accept(6)]), d("turnin:6", [turnin(6)]), d("accept:7", [accept(7)]), d("run", [{ type: "goto", at }]), d("turnin:7", [turnin(7)])];
    const { out } = runG([{ id: "lv", levels: [40, 60], steps: placeholder("lv:zf", "zulfarrak") }], dsteps, quests);
    expect(inserted(out[0]!.steps)).toEqual(["run"]);
    expect(out[0]!.stats).toMatchObject({ prereqSkippedQuests: 2, prereqCascaded: 4 });
    expect(out[0]!.stats.prereqSkips.filter((x) => x.route === "balanced").map((x) => [x.questId, x.reason])).toEqual([
      [5, "missing"],
      [6, "cascade"],
      [7, "cascade"],
    ]);
  });

  it("pre.single is any-of and pre.group is all-of (QuestieDB / prereq-check semantics)", () => {
    const lv = [step("lv:t1", { actions: [accept(1), turnin(1)] }), ...placeholder("lv:zf", "zulfarrak")];
    const quests = { "1": {}, "5": { pre: { single: [98, 1] } }, "6": { pre: { group: [1, 98] } }, "7": { pre: { group: [1] } } };
    const { out } = runG([{ id: "lv", levels: [40, 60], steps: lv }], chain(), quests);
    expect(inserted(out[0]!.steps)).toEqual(["accept:5", "accept:7", "run", "turnin:5", "turnin:7"]);
  });

  it("honours the prerequisite allowlist", () => {
    const quests = { "5": { pre: { single: [99] } }, "6": {}, "7": {} };
    const allow: AllowlistEntry[] = [{ questId: 5, missingPre: 99, reason: "lead-in removed in Forever", source: "https://example.com/forever" }];
    const { out } = runG([{ id: "lv", levels: [40, 60], steps: placeholder("lv:zf", "zulfarrak") }], chain(), quests, allow);
    expect(inserted(out[0]!.steps)).toContain("accept:5");
    expect(out[0]!.stats.prereqSkippedQuests).toBe(0);
  });

  it("keeps a quest whose prerequisite is turned in earlier in a leveling pack, on that route and class only", () => {
    const quests = { "5": { pre: { single: [99] } }, "6": { pre: { single: [98] } }, "7": { pre: { single: [97] } } };
    const p20 = [
      step("p20:t99", { actions: [turnin(99)] }), // both routes, every class
      step("p20:t98", { routes: ["balanced"], actions: [turnin(98)] }), // balanced only
      step("p20:t97", { classes: ["Warrior"], actions: [turnin(97)] }), // Warriors only
    ];
    const { out, warnings } = runG(
      [
        { id: "p20", levels: [20, 40], steps: p20 },
        { id: "p40", levels: [40, 60], steps: placeholder("p40:zf", "zulfarrak") },
      ],
      chain(),
      quests,
    );
    const got = out[1]!.steps.filter((s) => s.id.includes("+"));
    const routesOf = (k: string) => got.find((s) => s.id.endsWith(k))?.routes;
    expect(routesOf(":accept:5")).toEqual(["balanced", "speedrun"]);
    expect(routesOf(":accept:6")).toEqual(["balanced"]); // prereq only on balanced
    expect(routesOf(":accept:7")).toBeUndefined(); // prereq only visible to Warriors → skipped for everyone else
    expect(warnings.some((w) => /quest 7 .*e\.g\. Orc\/Hunter/.test(w))).toBe(true);
  });

  it("a class-restricted quest only needs its prerequisite for the classes that can take it", () => {
    const quests = { "5": { classes: 1, pre: { single: [97] } }, "6": {}, "7": {} }; // Warrior-only quest (mask 1)
    const p20 = [step("p20:t97", { classes: ["Warrior"], actions: [turnin(97)] })];
    const dsteps = chain().map((s) => (s.id.endsWith(":5") ? { ...s, classes: ["Warrior" as const] } : s));
    const { out } = runG(
      [
        { id: "p20", levels: [20, 40], steps: p20 },
        { id: "p40", levels: [40, 60], steps: placeholder("p40:zf", "zulfarrak") },
      ],
      dsteps,
      quests,
    );
    expect(inserted(out[1]!.steps)).toContain("accept:5");
  });
});

describe("1-20 earlyRun suppresses the later anchor", () => {
  it("inserts Ragefire once at the 1-20 anchor and does not insert the 20-40 run", () => {
    const RFC = { name: "Ragefire Chasm", instanceId: 2437, levels: [13, 18] as [number, number] };
    const dsteps = [
      step("dungeons:ragefire-chasm:accept:5728", { dungeon: RFC, routes: ["balanced", "speedrun"], actions: [accept(5728)] }),
      step("dungeons:ragefire-chasm:run", { dungeon: RFC, routes: ["balanced", "speedrun"], actions: [{ type: "goto", at }] }),
      step("dungeons:ragefire-chasm:turnin:5728", { dungeon: RFC, routes: ["balanced", "speedrun"], actions: [turnin(5728)] }),
    ];
    const plan: IntegrationPlan = {
      dungeons: [
        {
          id: "ragefire-chasm",
          levels: [13, 18],
          byRoute: {
            balanced: {
              byRace: {
                all: {
                  includedQuestIds: [5728],
                  pickups: [{ afterStepId: "b12:early", questIds: [5728], dungeonStepIds: ["dungeons:ragefire-chasm:accept:5728"] }],
                  prep: { afterStepId: "h20:late", estLevel: 21 },
                  run: { afterStepId: "h20:late", estLevel: 21, insideQuestIds: [] },
                  turnins: [{ afterStepId: "h20:late", questIds: [5728], dungeonStepIds: ["dungeons:ragefire-chasm:turnin:5728"], sameHub: true }],
                  earlyPrep: { afterStepId: "b12:early", estLevel: 15 },
                  earlyRun: { afterStepId: "b12:early", estLevel: 15, insideQuestIds: [] },
                },
              },
            },
          },
        },
      ],
    };
    const dossier: Map<string, DungeonDossier> = new Map([
      ["ragefire-chasm", { id: "ragefire-chasm", name: "Ragefire Chasm", runStepId: "dungeons:ragefire-chasm:run", quests: [{ questId: 5728, name: "Hidden Enemies" }] }],
    ]);
    const early = step("b12:early", { section: "The Barrens", routes: ["balanced", "speedrun"] });
    const late = step("h20:late", { section: "Hillsbrad", routes: ["balanced", "speedrun"] });
    const warnings: string[] = [];
    const packs = [
      { id: "b12", steps: [early] },
      { id: "h20", steps: [late] },
    ];
    const ctx = makeExpandContext(
      dsteps,
      packs.flatMap((p) => p.steps),
      [...dsteps, ...packs.flatMap((p) => p.steps)].map((s) => s.id),
      warnings,
      undefined,
      plan,
      dossier,
    );
    const out = packs.map((p) => expandDungeonPlaceholders(p.id, p.steps, ctx));
    const earlyIds = out[0]!.steps.map((s) => s.id);
    const lateIds = out[1]!.steps.map((s) => s.id);
    expect(earlyIds.filter((id) => id.includes("ragefire-chasm:run"))).toEqual(["b12:early+dungeons:ragefire-chasm:run"]);
    expect(lateIds.some((id) => id.includes("ragefire-chasm"))).toBe(false);
    expect(earlyIds.filter((id) => id.includes(":run")).length).toBe(1);
  });
});

