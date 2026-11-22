import { describe, expect, it } from "vitest";
import type { Step } from "../../data/schema";
import { mobsForGap, mobXp, questXpForPlayer, xpToNext } from "./rules";
import {
  creatureKillCount,
  parseItemCounts,
  parseKillNumbers,
  simulateWalk,
  type SimItem,
  type SimNpc,
  type SimQuest,
} from "./simulate";

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

describe("simulateWalk", () => {
  it("locks turn-in penalty, kill XP via mobXp, grind to target, levelUp and next", () => {
    const quest: SimQuest = {
      id: 1,
      name: "Fake",
      level: 4,
      reqLevel: 1,
      xp: 1000,
      objectives: { creatures: [{ id: 50, count: 3 }] },
      objectivesText: ["Kill 3 Dummy Beasts."],
    };
    const npc: SimNpc = { id: 50, name: "Dummy Beast", minLevel: 10, maxLevel: 10, rank: undefined };
    const tables = {
      quests: new Map([[1, quest]]),
      npcs: new Map([[50, npc]]),
    };

    const s1 = step("p:accept", { actions: [{ type: "accept", questId: 1, label: "Fake" }] });
    const s2 = step("p:complete-turnin", {
      actions: [
        { type: "complete", questId: 1, objective: 1, label: "Fake" },
        { type: "turnin", questId: 1, label: "Fake" },
      ],
    });
    const s3 = step("p:grind", {
      actions: [{ type: "xp", level: 11, extra: 0, label: "grind to 11", mobId: 50, mobName: "Dummy Beast", mobLevel: 10 }],
    });

    const walk = simulateWalk(
      [
        { packId: "p", step: s1, packFirst: true },
        { packId: "p", step: s2, packFirst: false },
        { packId: "p", step: s3, packFirst: false },
      ],
      { mode: "balanced", start: { level: 10, xpInto: 0 }, tables },
    );

    const kill = 3 * mobXp(10, 10, false);
    const awarded = questXpForPlayer(1000, 4, 10);
    expect(awarded).toBe(800);
    expect(kill).toBe(3 * 95);

    const a = walk.steps[0]!;
    const b = walk.steps[1]!;
    const c = walk.steps[2]!;

    expect(a.sim.level).toBe(10);
    expect(a.sim.gained).toBe(0);
    expect(a.sim.levelUp).toBeUndefined();
    expect(a.sim.next).toEqual(
      expect.objectContaining({
        level: 11,
        quests: 1,
        xpGap: xpToNext(10) - awarded,
      }),
    );
    expect(a.sim.next!.mobs).toEqual(mobsForGap(xpToNext(10) - awarded, 10).mobs);

    expect(b.sim.questXp).toEqual([{ questId: 1, xp: awarded, fullXp: 1000 }]);
    expect(b.sim.gained).toBe(kill + awarded);
    expect(b.sim.level).toBe(Math.round((10 + (kill + awarded) / xpToNext(10)) * 100) / 100);
    expect(b.sim.levelUp).toBeUndefined();

    expect(c.sim.gained).toBe(xpToNext(10) - (kill + awarded));
    expect(c.sim.levelUp).toBe(11);
    expect(c.sim.level).toBe(11);
    expect(c.sim.next).toEqual(
      expect.objectContaining({
        level: 12,
        quests: 0,
        xpGap: xpToNext(11),
      }),
    );
    expect(walk.end.fractional).toBe(11);
    expect(walk.end.totalXp).toBe(xpToNext(10));
  });

  it("awards kill XP for drop-quest items with npcDrops at 1:1 when no drop chance exists", () => {
    const quest: SimQuest = {
      id: 844,
      name: "Plainstrider Menace",
      level: 12,
      reqLevel: 10,
      xp: 910,
      objectives: { items: [{ id: 5087 }] },
      objectivesText: ["Collect 7 Plainstrider Beaks and return them to Sergra Darkthorn in the Crossroads."],
    };
    const npc: SimNpc = { id: 3244, name: "Greater Plainstrider", minLevel: 12, maxLevel: 12 };
    const item: SimItem = { id: 5087, name: "Plainstrider Beak", npcDrops: [3244] };
    const tables = {
      quests: new Map([[844, quest]]),
      npcs: new Map([[3244, npc]]),
      items: new Map([[5087, item]]),
    };
    const s1 = step("p:turnin", { actions: [{ type: "turnin", questId: 844, label: "Plainstrider Menace" }] });
    const walk = simulateWalk([{ packId: "p", step: s1, packFirst: true }], {
      mode: "balanced",
      start: { level: 12, xpInto: 0 },
      tables,
    });
    const kill = 7 * mobXp(12, 12, false);
    const awarded = questXpForPlayer(910, 12, 12);
    expect(kill).toBe(7 * 105);
    expect(walk.steps[0]!.sim.gained).toBe(kill + awarded);
    expect(walk.unresolvedKills).toEqual([]);
  });

  it("uses a real dropChance when present and does not invent 60%", () => {
    const quest: SimQuest = {
      id: 2,
      name: "Drops",
      level: 12,
      reqLevel: 10,
      xp: 100,
      objectives: { items: [{ id: 9 }] },
      objectivesText: ["Collect 7 Things."],
    };
    const npc: SimNpc = { id: 1, name: "Thing", minLevel: 12, maxLevel: 12 };
    const item: SimItem = { id: 9, npcDrops: [1], dropChance: 0.5 };
    const tables = {
      quests: new Map([[2, quest]]),
      npcs: new Map([[1, npc]]),
      items: new Map([[9, item]]),
    };
    const s1 = step("p:t", { actions: [{ type: "turnin", questId: 2, label: "Drops" }] });
    const walk = simulateWalk([{ packId: "p", step: s1, packFirst: true }], {
      mode: "balanced",
      start: { level: 12, xpInto: 0 },
      tables,
    });
    expect(walk.steps[0]!.sim.gained).toBe(14 * mobXp(12, 12, false) + 100);
  });

  it("does not double-count drop NPCs already paid via creature objectives", () => {
    const quest: SimQuest = {
      id: 891,
      name: "Guns",
      level: 20,
      reqLevel: 13,
      xp: 1550,
      objectives: {
        creatures: [{ id: 3393 }, { id: 3455 }, { id: 3454 }],
        items: [{ id: 5078 }],
      },
      objectivesText: [
        "Captain Thalo'thas Brightsun of Ratchet wants you to collect 10 Theramore Medals and slay Captain Fairmount, Cannoneer Whessan and Cannoneer Smythe.",
      ],
    };
    const fairmount: SimNpc = { id: 3393, name: "Captain Fairmount", minLevel: 20, maxLevel: 20, friendly: "A", spawns: { "17": [[61.85, 54.65]] } };
    const whessan: SimNpc = { id: 3455, name: "Cannoneer Whessan", minLevel: 19, maxLevel: 19, friendly: "A", spawns: { "17": [[60.43, 54.77]] } };
    const smythe: SimNpc = { id: 3454, name: "Cannoneer Smythe", minLevel: 19, maxLevel: 19, friendly: "A", spawns: { "17": [[63.18, 56.64]] } };
    const marine: SimNpc = { id: 3385, name: "Theramore Marine", minLevel: 15, maxLevel: 16, friendly: "A" };
    const item: SimItem = { id: 5078, npcDrops: [3385, 3393, 3454, 3455] };
    const tables = {
      quests: new Map([[891, quest]]),
      npcs: new Map([
        [3393, fairmount],
        [3455, whessan],
        [3454, smythe],
        [3385, marine],
      ]),
      items: new Map([[5078, item]]),
    };
    const s1 = step("p:t", { actions: [{ type: "turnin", questId: 891, label: "Guns" }] });
    const walk = simulateWalk([{ packId: "p", step: s1, packFirst: true }], {
      mode: "balanced",
      start: { level: 16, xpInto: 0 },
      tables,
    });
    const named =
      mobXp(16, 20, false) + mobXp(16, 19, false) + mobXp(16, 19, false);
    const medals = 10 * mobXp(16, Math.round((15 + 16) / 2), false);
    expect(walk.steps[0]!.sim.gained).toBe(named + medals + questXpForPlayer(1550, 20, 16));
  });

  it("skips friendly drop NPCs and reports unresolved when none can be priced", () => {
    const quest: SimQuest = {
      id: 3,
      name: "Talk loot",
      level: 4,
      reqLevel: 1,
      xp: 100,
      objectives: { items: [{ id: 1 }] },
      objectivesText: ["Collect 2 Insignias."],
    };
    const npc: SimNpc = { id: 9, name: "Sergra Darkthorn", minLevel: 60, maxLevel: 60, friendly: "H", services: ["questGiver"] };
    const tables = {
      quests: new Map([[3, quest]]),
      npcs: new Map([[9, npc]]),
      items: new Map([[1, { id: 1, npcDrops: [9] }]]),
    };
    const s1 = step("p:t", { actions: [{ type: "turnin", questId: 3, label: "Talk loot" }] });
    const walk = simulateWalk([{ packId: "p", step: s1, packFirst: true }], {
      mode: "balanced",
      start: { level: 4, xpInto: 0 },
      tables,
    });
    expect(walk.steps[0]!.sim.gained).toBe(100);
    expect(walk.unresolvedKills).toEqual([
      expect.objectContaining({ questId: 3, reason: "missingNpc" }),
    ]);
  });
});

describe("parseKillNumbers / creatureKillCount", () => {
  it("does not treat item counts as kill counts when a slay clause is present", () => {
    const texts = [
      "Captain Thalo'thas Brightsun of Ratchet wants you to collect 10 Theramore Medals and slay Captain Fairmount, Cannoneer Whessan and Cannoneer Smythe.",
    ];
    expect(parseKillNumbers(texts)).toEqual([]);
    expect(parseItemCounts(texts)).toEqual([10]);
  });

  it("defaults a leftover named unique to 1 kill (Benedict)", () => {
    const texts = ["Kill 10 Kul Tiras Sailors, 8 Kul Tiras Marines and Lieutenant Benedict and return to Gar'Thok in Razor Hill."];
    expect(parseKillNumbers(texts)).toEqual([10, 8]);
    const sailor: SimNpc = { id: 3128, name: "Kul Tiras Sailor", minLevel: 5, maxLevel: 6, spawns: { "14": Array.from({ length: 10 }, () => [1, 1] as [number, number]) } };
    const marine: SimNpc = { id: 3129, name: "Kul Tiras Marine", minLevel: 6, maxLevel: 7, spawns: { "14": Array.from({ length: 10 }, () => [1, 1] as [number, number]) } };
    const benedict: SimNpc = { id: 3192, name: "Lieutenant Benedict", minLevel: 8, maxLevel: 8, spawns: { "14": [[59.72, 58.27]] } };
    expect(creatureKillCount({ id: 3128 }, texts, 0, 3, sailor)).toBe(10);
    expect(creatureKillCount({ id: 3129 }, texts, 1, 3, marine)).toBe(8);
    expect(creatureKillCount({ id: 3192 }, texts, 2, 3, benedict)).toBe(1);
  });

  it("does not default missing counts to 1 for unnamed packs", () => {
    const texts = ["Slay Alliance soldiers encroaching into the Barrens at the border to Dustwallow Marsh."];
    const soldier: SimNpc = {
      id: 268622,
      name: "Encroaching Soldier",
      minLevel: 22,
      maxLevel: 23,
      spawns: { "17": Array.from({ length: 8 }, () => [1, 1] as [number, number]) },
    };
    expect(creatureKillCount({ id: 268622 }, texts, 0, 2, soldier)).toBeUndefined();
  });

  it("filters talk/use objectives to 0 kills", () => {
    const peon: SimNpc = { id: 10556, name: "Lazy Peon", minLevel: 4, maxLevel: 4, friendly: "H" };
    expect(
      creatureKillCount(
        { id: 10556 },
        ["Use the Foreman's Blackjack on Lazy Peons when they're sleeping. Wake up 5 peons, then return the Foreman's Blackjack to Foreman Thazz'ril in the Valley of Trials."],
        0,
        1,
        peon,
      ),
    ).toBe(0);
    expect(
      creatureKillCount(
        { id: 3216 },
        ["Take the Lieutenant's Insignia to Neeru Fireblade and speak to him."],
        0,
        1,
        { id: 3216, name: "Neeru Fireblade", friendly: "H" },
      ),
    ).toBe(0);
  });
});
