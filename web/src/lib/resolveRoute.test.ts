import { describe, expect, it } from "vitest";
import type { ProfessionHook, QuestInfo, Step, Tip } from "../data/schema";
import { resolveRoute, tipApplies } from "./resolveRoute";
import { questPins, stepPins } from "./pins";
import { visibleRoutePolyline } from "../components/map/route";
import { createDefaultEvaluator, createProfileEvaluator } from "../state/visibility";
import { applyToggle } from "../state/questProgress";

const src = [{ url: "https://example.com/test", label: "test" }];
const tip = (t: Partial<Tip> & { text: string }): Tip => ({ kind: "general", sources: src, verified: true, ...t });
const hook = (h: Partial<ProfessionHook> & Pick<ProfessionHook, "profession">): ProfessionHook => ({
  note: "n",
  sources: src,
  verified: true,
  ...h,
});

function step(id: string, partial: Partial<Step> = {}): Step {
  return { id, n: 0, tags: {}, text: [], actions: [], conditions: [], ...partial };
}

function goto(x: number, y: number, extra: { hidden?: boolean; mapId?: number } = {}) {
  return { type: "goto" as const, at: { mapId: extra.mapId ?? 1, x, y, zone: "Z", exact: true }, hidden: extra.hidden };
}

const steps: Step[] = [
  step("both"),
  step("bal-only", { routes: ["balanced"] }),
  step("speed-only", { routes: ["speedrun"] }),
  step("legacy-bonus", { bonus: { questIds: [1], xp: 100, why: "near" } }),
  step("dng", { dungeon: { name: "Test Dungeon" } }),
  step("dng-alt", { dungeonsOff: true, alternativeTo: ["dng"] }),
  step("legacy-dng", { conditions: [{ cmd: "dungeon", args: "TD", label: "" }] }),
  step("warrior", { classes: ["Warrior"] }),
  step("tank", { roles: ["tank"] }),
  step("troll-filter", { filter: { any: [[{ race: "Troll" }]] } }),
  step("opt", { tags: { optional: true } }),
];
const ids = (r: ReturnType<typeof resolveRoute>) => r.steps.map((s) => s.id);

describe("resolveRoute: routes", () => {
  it("balanced keeps both + balanced-only + legacy bonus, drops speedrun-only", () => {
    const r = resolveRoute(steps, { route: "balanced", dungeons: false });
    expect(ids(r)).toEqual(["both", "bal-only", "legacy-bonus", "dng-alt", "warrior", "tank", "troll-filter", "opt"]);
    expect(r.hidden["speed-only"]).toBe("route");
  });

  it("speedrun keeps both + speedrun-only, drops balanced-only and legacy bonus", () => {
    const r = resolveRoute(steps, { route: "speedrun", dungeons: false });
    expect(ids(r)).toContain("speed-only");
    expect(ids(r)).not.toContain("bal-only");
    expect(r.hidden["legacy-bonus"]).toBe("speedrun");
  });

  it("numbers resolved steps 1..n", () => {
    const r = resolveRoute(steps, { route: "speedrun", dungeons: true });
    expect(r.steps.map((s) => s.routeIndex)).toEqual(r.steps.map((_, i) => i + 1));
  });
});

describe("resolveRoute: dungeon toggle", () => {
  it("dungeons on shows dungeon steps (v2 and legacy) and hides alternatives", () => {
    const r = resolveRoute(steps, { route: "balanced", dungeons: true });
    expect(ids(r)).toEqual(expect.arrayContaining(["dng", "legacy-dng"]));
    expect(r.hidden["dng-alt"]).toBe("dungeons");
  });

  it("dungeons off shows alternatives and hides dungeon steps", () => {
    const r = resolveRoute(steps, { route: "balanced", dungeons: false });
    expect(ids(r)).toContain("dng-alt");
    expect(r.hidden.dng).toBe("dungeons");
    expect(r.hidden["legacy-dng"]).toBe("dungeons");
  });

  it("toggling off→on→off returns the identical route", () => {
    const off1 = ids(resolveRoute(steps, { route: "speedrun", dungeons: false }));
    const on = ids(resolveRoute(steps, { route: "speedrun", dungeons: true }));
    const off2 = ids(resolveRoute(steps, { route: "speedrun", dungeons: false }));
    expect(off2).toEqual(off1);
    expect(on).not.toEqual(off1);
    // Non-dungeon steps are identical in both directions.
    const neutral = (l: string[]) => l.filter((id) => !["dng", "dng-alt", "legacy-dng"].includes(id));
    expect(neutral(on)).toEqual(neutral(off1));
  });

  it("progress is keyed by step id, so ticks survive a toggle", () => {
    const profile = {
      id: "p", name: "t", race: "Orc", cls: "Warrior" as const, routeStyle: "balanced" as const,
      options: { showOptional: true, hideDone: false, dungeons: false },
      steps: {}, quests: {}, addedQuests: [], createdAt: 0, updatedAt: 0, schema: 1 as const,
    };
    const ticked = applyToggle(profile, "both", step("both"), { stepsForQuest: () => [], now: 1 });
    const on = { ...ticked, options: { ...ticked.options, dungeons: true } };
    const back = { ...on, options: { ...on.options, dungeons: false } };
    expect(on.steps.both).toBeTruthy();
    expect(back.steps.both).toBeTruthy();
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: true }))).toContain("both");
  });
});

describe("resolveRoute: class / race / role", () => {
  it("class filter via `classes` and alias `class`", () => {
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: false, class: "Mage" }))).not.toContain("warrior");
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: false, cls: "Warrior" }))).toContain("warrior");
  });

  it("role filter", () => {
    const r = resolveRoute(steps, { route: "balanced", dungeons: false, role: "dps" });
    expect(r.hidden.tank).toBe("role");
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: false, role: "tank" }))).toContain("tank");
  });

  it("race filter applies only with a character", () => {
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: false, race: "Orc", cls: "Warrior" }))).not.toContain("troll-filter");
    expect(ids(resolveRoute(steps, { route: "balanced", dungeons: false }))).toContain("troll-filter");
  });

  it("showOptional false hides optional steps", () => {
    expect(resolveRoute(steps, { route: "balanced", dungeons: false, showOptional: false }).hidden.opt).toBe("optional");
  });
});

describe("resolveRoute: tips, hooks, elites", () => {
  const rich = step("rich", {
    sources: src,
    verified: true,
    tips: [
      tip({ text: "any" }),
      tip({ text: "tank", roles: ["tank"] }),
      tip({ text: "mage", classes: ["Mage"] }),
      tip({ text: "speed", kind: "speed", routes: ["speedrun"] }),
      tip({ text: "dng", dungeons: true }),
    ],
    professionHooks: [hook({ profession: "Cooking" }), hook({ profession: "Skinning", verified: false })],
    elite: [{ name: "Boss", groupSize: 3, sources: src, verified: true, tips: [tip({ text: "heal", roles: ["healer"] }), tip({ text: "all" })] }],
  });

  it("filters tips by role/class/route/dungeons", () => {
    const [s] = resolveRoute([rich], { route: "balanced", dungeons: false, cls: "Warrior", role: "tank" }).steps;
    expect(s!.tips!.map((t) => t.text)).toEqual(["any", "tank"]);
    const [m] = resolveRoute([rich], { route: "speedrun", dungeons: true, cls: "Mage", role: "dps" }).steps;
    expect(m!.tips!.map((t) => t.text)).toEqual(["any", "mage", "speed", "dng"]);
  });

  it("no character = every role/class tip", () => {
    const [s] = resolveRoute([rich], { route: "balanced", dungeons: false }).steps;
    expect(s!.tips!.map((t) => t.text)).toEqual(["any", "tank", "mage"]);
  });

  it("filters elite tactic tips by role", () => {
    const [s] = resolveRoute([rich], { route: "balanced", dungeons: false, role: "dps" }).steps;
    expect(s!.elite![0]!.tips.map((t) => t.text)).toEqual(["all"]);
  });

  it("profession hooks: undefined = all, list = only those", () => {
    expect(resolveRoute([rich], { route: "balanced", dungeons: false }).steps[0]!.professionHooks).toHaveLength(2);
    const [s] = resolveRoute([rich], { route: "balanced", dungeons: false, professions: ["Cooking"] }).steps;
    expect(s!.professionHooks!.map((h) => h.profession)).toEqual(["Cooking"]);
    expect(s!.unverified).toBe(false);
  });

  it("flags unverified when a kept item is unverified", () => {
    expect(resolveRoute([rich], { route: "balanced", dungeons: false, professions: ["Skinning"] }).steps[0]!.unverified).toBe(true);
    expect(resolveRoute([step("u", { sources: src })], { route: "balanced", dungeons: false }).steps[0]!.unverified).toBe(true);
  });

  it("does not mutate the input step", () => {
    resolveRoute([rich], { route: "balanced", dungeons: false, professions: [] });
    expect(rich.professionHooks).toHaveLength(2);
  });

  it("tipApplies treats missing filters as everyone", () => {
    expect(tipApplies({}, { route: "speedrun", dungeons: true, cls: "Rogue", role: "dps" })).toBe(true);
  });
});

describe("Guest and profile evaluators share one rule set", () => {
  it("guest (default evaluator) == profile with no character, for every route × dungeons", () => {
    for (const route of ["balanced", "speedrun"] as const) {
      for (const dungeons of [false, true]) {
        const guest = createDefaultEvaluator(route, { dungeons });
        const prof = createProfileEvaluator({ routeStyle: route, dungeons });
        for (const s of steps) expect(guest.step(s)).toEqual(prof.step(s));
      }
    }
  });

  it("resolver == profile evaluator", () => {
    const vis = createProfileEvaluator({ race: "Orc", cls: "Warrior", role: "tank", routeStyle: "speedrun", dungeons: true });
    const r = resolveRoute(steps, { route: "speedrun", dungeons: true, race: "Orc", cls: "Warrior", role: "tank" });
    expect(ids(r)).toEqual(steps.filter((s) => vis.step(s).visible).map((s) => s.id));
  });
});

describe("visibleRoutePolyline", () => {
  const route = [
    step("a", { actions: [goto(10, 10), goto(20, 20, { hidden: true })] }),
    step("b", { routes: ["balanced"], actions: [goto(30, 30)] }),
    step("c", { actions: [goto(20, 20), goto(40, 40), goto(0, 0), goto(50, 50, { mapId: 2 })] }),
  ];
  it("keeps hidden waypoints, drops filtered steps, placeholders, other maps, consecutive dupes", () => {
    const vis = createProfileEvaluator({ routeStyle: "speedrun" });
    expect(visibleRoutePolyline(route, 1, (s) => vis.step(s).visible)).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 40, y: 40 },
    ]);
    const bal = createProfileEvaluator({ routeStyle: "balanced" });
    expect(visibleRoutePolyline(route, 1, (s) => bal.step(s).visible)).toHaveLength(5);
  });
});

describe("pins derived from quests", () => {
  const at = (x: number, y: number, mapId = 1) => ({ mapId, x, y, zone: "Z", exact: true });
  const q: QuestInfo = {
    id: 7, name: "Q", level: 1, reqLevel: 1, races: 0, classes: 0, custom: false,
    start: [{ kind: "npc", id: 100, name: "Giver", at: [at(10, 10)] }],
    end: [{ kind: "npc", id: 101, name: "Ender", at: [at(20, 20), at(0, 0)] }],
    objectivesText: [],
    objectives: [
      { kind: "kill", id: 200, name: "Boar", count: 5, at: [at(30, 30), at(31, 31)] },
      { kind: "object", id: 300, name: "Crate", at: [at(40, 40, 2)] },
      { kind: "rep", name: "Rep", at: [at(50, 50)] },
    ],
    pre: { group: [], single: [] }, exclusiveTo: [], repeatable: false, inGuides: [],
  };
  it("questPins: givers, turn-ins and objectives (no placeholders, no rep)", () => {
    expect(questPins(q).map((p) => `${p.kind}:${p.id}`)).toEqual(["start:100", "end:101", "mob:200", "mob:200", "object:300"]);
  });
  it("stepPins: accept→start, turnin→end, complete→objective, filtered by map", () => {
    const s = step("s", {
      actions: [
        { type: "accept", questId: 7, label: "Q" },
        { type: "complete", questId: 7, objective: 1, label: "Boar" },
        { type: "turnin", questId: 7, label: "Q" },
        { type: "accept", questId: 999, label: "missing" },
      ],
    });
    expect(stepPins(s, { 7: q }, 1).map((p) => p.kind)).toEqual(["start", "mob", "mob", "end"]);
    expect(stepPins(s, { 7: q }, 2)).toEqual([]);
  });

  it("stepPins: omits pins for missing / locked quests when a filter is passed", () => {
    const locked = {
      ...q,
      id: 8,
      pre: { group: [1], single: [] },
      start: [{ kind: "npc" as const, id: 200, name: "Locked", at: [{ mapId: 1, x: 10, y: 10, zone: "Z", exact: true }] }],
      end: [],
      objectives: [],
    };
    const s = step("s", {
      actions: [
        { type: "accept", questId: 7, label: "Open" },
        { type: "accept", questId: 8, label: "Locked" },
        { type: "complete", questId: 9, objective: 1, label: "Missing" },
      ],
    });
    const profile = {
      id: "p",
      name: "T",
      race: "Orc" as const,
      cls: "Warrior" as const,
      routeStyle: "balanced" as const,
      options: { showOptional: true, hideDone: false },
      steps: {},
      quests: {},
      addedQuests: [],
      createdAt: 1,
      updatedAt: 1,
      schema: 1 as const,
    };
    const pins = stepPins(
      s,
      { 7: q, 8: locked },
      1,
      { profile, missing: [9], catalog: { 7: q, 8: locked } },
    );
    // Accept 7 → start pin only; locked 8 and missing 9 are omitted.
    expect(pins.map((p) => `${p.kind}:${p.questId}`)).toEqual(["start:7"]);
  });
});
