import { describe, expect, it } from "vitest";
import type { Step } from "../../data/schema";
import { applyXpMods, grindKillXpForGap, initialRestedPool, wellRestedRank } from "./mods";
import { mobXp, questXpForPlayer, xpToNext } from "./rules";
import { simulateWalk, type SimNpc, type SimQuest } from "./simulate";

const SRC = [{ url: "https://example.com/t", label: "t" }];

function step(id: string, extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [{ segments: [{ t: id }] }],
    actions: [],
    conditions: [],
    sources: SRC,
    verified: true,
    routes: ["balanced", "speedrun"],
    ...extra,
  };
}

const quest: SimQuest = {
  id: 1,
  name: "Fake",
  level: 10,
  reqLevel: 1,
  xp: 1000,
  objectives: { creatures: [{ id: 50, count: 2 }] },
  objectivesText: ["Kill 2 Dummy Beasts."],
};

const npc: SimNpc = { id: 50, name: "Dummy Beast", minLevel: 10, maxLevel: 10 };

function tables() {
  return { quests: new Map([[1, quest]]), npcs: new Map([[50, npc]]) };
}

function walkItems() {
  return [
    { packId: "p", step: step("p:accept", { actions: [{ type: "accept" as const, questId: 1, label: "Fake" }] }), packFirst: true },
    {
      packId: "p",
      step: step("p:done", {
        actions: [
          { type: "complete" as const, questId: 1, objective: 1, label: "Fake" },
          { type: "turnin" as const, questId: 1, label: "Fake" },
        ],
      }),
      packFirst: false,
    },
  ];
}

const OFF = { wellFed: false, restedPolicy: "none" as const, legacyWellRestedRank: 0, sleepingBag: false };

describe("xp mods", () => {
  it("omitted modifiers match an explicit all-off walk", () => {
    const bare = simulateWalk(walkItems(), { mode: "balanced", start: { level: 10, xpInto: 0 }, tables: tables() });
    const off = simulateWalk(walkItems(), { mode: "balanced", start: { level: 10, xpInto: 0 }, tables: tables(), xpMods: OFF });
    expect(off.steps.map((s) => [s.sim.level, s.sim.gained, s.sim.questXp])).toEqual(
      bare.steps.map((s) => [s.sim.level, s.sim.gained, s.sim.questXp]),
    );
    expect(off.end).toEqual(bare.end);
    expect(bare.steps[1]!.sim.grindKillXp).toBeUndefined();
  });

  it("Well Fed multiplies kill xp only", () => {
    const baseKill = 2 * mobXp(10, 10, false);
    const walk = simulateWalk(walkItems(), {
      mode: "balanced",
      start: { level: 10, xpInto: 0 },
      tables: tables(),
      xpMods: { wellFed: true },
    });
    const questXp = questXpForPlayer(1000, 10, 10);
    expect(walk.steps[1]!.sim.gained).toBe(Math.round(baseKill * 1.05) + questXp);
    expect(walk.steps[1]!.sim.questXp?.[0]?.xp).toBe(questXp);
  });

  it("rested doubles kill xp until the pool is empty and ignores quests", () => {
    const baseKill = 2 * mobXp(10, 10, false);
    const pool = 50;
    const applied = applyXpMods({ restedPolicy: "fromGame" }, { kind: "kill", amount: baseKill, level: 10, restedPool: pool });
    expect(applied.restedConsumed).toBe(50);
    expect(applied.amount).toBe(baseKill + 50);
    const questAward = applyXpMods(
      { restedPolicy: "fromGame" },
      { kind: "quest", amount: questXpForPlayer(1000, 10, 10), level: 10, restedPool: applied.restedPool },
    );
    expect(questAward.restedConsumed).toBe(0);
    expect(questAward.restedPool).toBe(applied.restedPool);
    expect(questAward.amount).toBe(1000);

    const walk = simulateWalk(walkItems(), {
      mode: "balanced",
      start: { level: 10, xpInto: 0 },
      tables: tables(),
      xpMods: { restedPolicy: "fromGame" },
      xpRested: pool,
    });
    expect(walk.steps[1]!.sim.gained).toBe(baseKill + 50 + 1000);
  });

  it("sleeping bag is inert below 14 and 1.03 on kills and quests at 14", () => {
    const below = applyXpMods({ sleepingBag: true }, { kind: "kill", amount: 200, level: 13, restedPool: 0 });
    const belowQ = applyXpMods({ sleepingBag: true }, { kind: "quest", amount: 1000, level: 13, restedPool: 0 });
    expect(below.amount).toBe(200);
    expect(belowQ.amount).toBe(1000);

    const kill = applyXpMods({ sleepingBag: true }, { kind: "kill", amount: 200, level: 14, restedPool: 0 });
    const questAward = applyXpMods({ sleepingBag: true }, { kind: "quest", amount: 1000, level: 14, restedPool: 80 });
    expect(kill.amount).toBe(Math.round(200 * 1.03));
    expect(questAward.amount).toBe(Math.round(1000 * 1.03));
    expect(questAward.restedPool).toBe(80);

    const walk = simulateWalk(walkItems(), {
      mode: "balanced",
      start: { level: 14, xpInto: 0 },
      tables: tables(),
      xpMods: { sleepingBag: true },
    });
    const baseKill = 2 * mobXp(14, 10, false);
    const penalized = questXpForPlayer(1000, 10, 14);
    expect(walk.steps[1]!.sim.questXp?.[0]?.xp).toBe(Math.round(penalized * 1.03));
    expect(walk.steps[1]!.sim.gained).toBe(Math.round(baseKill * 1.03) + Math.round(penalized * 1.03));
  });

  it("stacks percent buffs then rested on the percent-adjusted kill", () => {
    const base = 2 * mobXp(14, 10, false);
    const after = Math.round(base * 1.05 * 1.03);
    const pool = 30;
    const kill = applyXpMods(
      { wellFed: true, sleepingBag: true, restedPolicy: "fromGame" },
      { kind: "kill", amount: base, level: 14, restedPool: pool },
    );
    expect(kill.amount).toBe(after + pool);
    expect(kill.restedPool).toBe(0);
    const questAward = applyXpMods(
      { wellFed: true, sleepingBag: true, restedPolicy: "fromGame" },
      { kind: "quest", amount: questXpForPlayer(1000, 10, 14), level: 14, restedPool: kill.restedPool },
    );
    expect(questAward.amount).toBe(Math.round(questXpForPlayer(1000, 10, 14) * 1.03));
    expect(questAward.restedConsumed).toBe(0);
  });

  it("perSession banks 5% of a level, and rank 5 scales that by 1.2", () => {
    const level = 1;
    const slice = 0.05 * xpToNext(level);
    expect(initialRestedPool({ restedPolicy: "perSession" }, { level })).toBe(slice);
    expect(initialRestedPool({ restedPolicy: "perSession", legacyWellRestedRank: 5 }, { level })).toBe(slice * 1.2);
    expect(initialRestedPool({ restedPolicy: "none" }, { level, xpRested: 999 })).toBe(0);
    expect(initialRestedPool(undefined, { level, xpRested: 999 })).toBe(0);
  });

  it("grind still hits the authored level and reports less kill xp when rested doubles", () => {
    const grind = step("p:grind", {
      actions: [{ type: "xp", level: 11, extra: 0, label: "grind to 11" }],
    });
    const items = [{ packId: "p", step: grind, packFirst: true }];
    const start = { level: 10, xpInto: 0 };
    const gap = xpToNext(10);
    const bare = simulateWalk(items, { mode: "balanced", start, tables: tables() });
    const rested = simulateWalk(items, {
      mode: "balanced",
      start,
      tables: tables(),
      xpMods: { restedPolicy: "fromGame" },
      xpRested: gap,
    });
    expect(bare.end.level).toBe(11);
    expect(rested.end.level).toBe(11);
    expect(rested.end.xpInto).toBe(bare.end.xpInto);
    expect(rested.steps[0]!.sim.gained).toBe(gap);
    expect(rested.steps[0]!.sim.grindKillXp).toBe(Math.ceil(gap / 2));
    expect(bare.steps[0]!.sim.grindKillXp).toBeUndefined();
    expect(bare.steps[0]!.sim.grindSkip).toBeUndefined();

    const ahead = simulateWalk(items, {
      mode: "balanced",
      start: { level: 11, xpInto: 0 },
      tables: tables(),
      xpMods: OFF,
    });
    expect(ahead.steps[0]!.sim.gained).toBe(0);
    expect(ahead.steps[0]!.sim.grindSkip).toBe(true);
    expect(ahead.steps[0]!.sim.grindKillXp).toBe(0);

    const fed = grindKillXpForGap({ wellFed: true }, { gain: 1050, level: 10, restedPool: 0 });
    expect(fed.grindKillXp).toBe(Math.ceil(1050 / 1.05));
    expect(wellRestedRank({ legacyWellRestedRank: 6 })).toBe(5);
    expect(wellRestedRank({ legacyWellRestedRank: -1 })).toBe(0);
  });
});
