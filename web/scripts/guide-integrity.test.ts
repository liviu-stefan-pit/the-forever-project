import { describe, expect, it } from "vitest";
import { evaluateGrindIntegrity, evaluateXpIntegrity } from "./guide-integrity.ts";
import type { BelowReqAccept, ChainModeSummary, LevelingChain, SimNpc } from "../src/lib/xp/simulate.ts";
import type { Step } from "../../contracts/schema.ts";

const chain: LevelingChain = {
  id: "test",
  title: "start → mid → end",
  packs: ["start-1-12", "mid-12-20", "end-40-60"],
  handoff: "test sequence",
};

const guides = new Map([
  ["start-1-12", { minLevel: 1 }],
  ["mid-12-20", { minLevel: 12 }],
  ["end-40-60", { minLevel: 40 }],
]);

function summary(mode: "balanced" | "speedrun", packEnds: Record<string, number>, endLevel = 60): ChainModeSummary {
  return {
    chainId: "test",
    mode,
    packEnds,
    packArrivals: {},
    endLevel,
    totalXp: 0,
    xpTo60: 0,
  };
}

const okEnds = { "start-1-12": 12, "mid-12-20": 39.5, "end-40-60": 60 };

function report(
  packEnds: Record<string, number> = okEnds,
  belowReqAccepts: BelowReqAccept[] = [],
  endLevel = 60,
) {
  return {
    chains: [summary("balanced", packEnds, endLevel), summary("speedrun", packEnds, endLevel)],
    belowReqAccepts,
  };
}

describe("evaluateXpIntegrity", () => {
  it("passes when last packs reach 59.5+ and handoffs meet the next minLevel", () => {
    const r = evaluateXpIntegrity(report({ "start-1-12": 11.5, "mid-12-20": 39.5, "end-40-60": 59.5 }, [], 59.5), guides, [chain]);
    expect(r.findings.filter((f) => f.severity === "error")).toEqual([]);
    expect(r.earlyFailCount).toBe(0);
    expect(r.earlyWarnCount).toBe(0);
  });

  it("allows a chain that finishes over 60", () => {
    const r = evaluateXpIntegrity(report({ ...okEnds, "end-40-60": 60 }, [], 60), guides, [chain]);
    expect(r.findings.filter((f) => f.category === "xp-end-level")).toEqual([]);
  });

  it("fails when any chain/mode last pack ends below 59.5", () => {
    const r = evaluateXpIntegrity(report({ ...okEnds, "end-40-60": 59.49 }, [], 59.49), guides, [chain]);
    const ends = r.findings.filter((f) => f.category === "xp-end-level");
    expect(ends).toHaveLength(2);
    expect(ends[0]?.severity).toBe("error");
    expect(ends[0]?.message).toMatch(/last pack end-40-60 ends at 59\.49/);
  });

  it("fails when an earlier pack ends below the next pack minLevel minus 0.5", () => {
    const r = evaluateXpIntegrity(report({ "start-1-12": 11.49, "mid-12-20": 20, "end-40-60": 60 }), guides, [chain]);
    const handoffs = r.findings.filter((f) => f.category === "xp-handoff");
    expect(handoffs.length).toBeGreaterThan(0);
    expect(handoffs[0]?.severity).toBe("error");
    expect(handoffs[0]?.message).toMatch(/start-1-12 ends at 11\.49; next mid-12-20 minLevel 12/);
  });

  it("fails accepts 3+ levels before reqLevel and warns on 1–2 levels early", () => {
    const below: BelowReqAccept[] = [
      { questId: 10, pack: "start-1-12", mode: "balanced", playerLevel: 5, reqLevel: 8 },
      { questId: 11, pack: "mid-12-20", mode: "speedrun", playerLevel: 14, reqLevel: 16 },
      { questId: 12, pack: "end-40-60", mode: "balanced", playerLevel: 41, reqLevel: 42 },
    ];
    const r = evaluateXpIntegrity(report(okEnds, below), guides, [chain]);
    expect(r.earlyFailCount).toBe(1);
    expect(r.earlyWarnCount).toBe(2);
    const fails = r.findings.filter((f) => f.category === "xp-accept-early");
    expect(fails).toEqual([
      expect.objectContaining({
        severity: "error",
        questId: 10,
        pack: "start-1-12",
        message: "quest 10 pack start-1-12 mode balanced player 5 reqLevel 8",
      }),
    ]);
    const warn = r.findings.filter((f) => f.category === "xp-accept-below-req");
    expect(warn).toHaveLength(1);
    expect(warn[0]?.severity).toBe("warning");
    expect(warn[0]?.message).toBe("2 accepts 1–2 levels before reqLevel");
    expect(r.findings.filter((f) => f.severity === "error")).toHaveLength(1);
  });

  it("warns on class-locked quests accepted 3+ levels early instead of failing", () => {
    // Trainer quests (quest.classes !== 0) show in the log before the player can turn them in.
    const below: BelowReqAccept[] = [
      { questId: 5649, pack: "start-1-12", mode: "balanced", playerLevel: 2, reqLevel: 5 },
      { questId: 10, pack: "start-1-12", mode: "balanced", playerLevel: 5, reqLevel: 8 },
    ];
    const quests = new Map([
      [5649, { classes: 16 }],
      [10, { classes: 0 }],
    ]);
    const r = evaluateXpIntegrity(report(okEnds, below), guides, [chain], quests);
    expect(r.earlyFailCount).toBe(1);
    expect(r.earlyWarnCount).toBe(1);
    expect(r.findings.filter((f) => f.severity === "error")).toEqual([
      expect.objectContaining({ category: "xp-accept-early", questId: 10, severity: "error" }),
    ]);
    const classWarn = r.findings.filter((f) => f.questId === 5649);
    expect(classWarn).toEqual([
      expect.objectContaining({
        severity: "warning",
        category: "xp-accept-early",
        questId: 5649,
        message: expect.stringMatching(/class-locked trainer quest/),
      }),
    ]);
  });
});

function grindStep(id: string, text: string, extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [{ segments: [{ t: text }] }],
    actions: extra.actions ?? [],
    conditions: [],
    sources: [{ url: "https://example.com/t", label: "t" }],
    verified: true,
    routes: ["balanced", "speedrun"],
    ...extra,
  };
}

describe("evaluateGrindIntegrity", () => {
  it("fails prose grind kill counts above 50, and above 30 without dense/spawn documentation", () => {
    const over50 = grindStep(
      "h4060:tanaris:grind-speedrun-before-2605",
      "Grind Scorpid Dunestalker until about level 46.0 (model: from 45.6, about 149 kills, 60 minutes).",
      {
        actions: [
          { type: "goto", at: { mapId: 1446, x: 43.7, y: 57.6, zone: "Tanaris", exact: true } },
          { type: "mob", name: "Scorpid Dunestalker", npcIds: [5424] },
        ],
      },
    );
    const over30 = grindStep(
      "h4060:the-hinterlands:grind-speedrun-before-7845",
      "Grind Witch Doctor Ti'ik until about level 48.0 (model: from 47.9, about 32 kills, 13 minutes).",
      {
        actions: [
          { type: "goto", at: { mapId: 1425, x: 25.8, y: 65.8, zone: "The Hinterlands", exact: true } },
          { type: "mob", name: "Witch Doctor Ti'ik", npcIds: [270772] },
        ],
      },
    );
    const ok = grindStep("pack:grind-ok", "Grind Dummy Beast, about 12 kills.", {
      actions: [
        { type: "goto", at: { mapId: 1413, x: 50, y: 50, zone: "The Barrens", exact: true } },
        { type: "mob", name: "Dummy Beast", npcIds: [50] },
      ],
    });
    const npcs = new Map<number, SimNpc>([
      [5424, { id: 5424, name: "Scorpid Dunestalker", minLevel: 46, maxLevel: 47, spawns: { "440": Array.from({ length: 5 }, (_, i) => [43.7 + i * 0.1, 57.6] as [number, number]) } }],
      [270772, { id: 270772, name: "Witch Doctor Ti'ik", minLevel: 49, maxLevel: 49, spawns: { "47": Array.from({ length: 8 }, (_, i) => [25.8, 65.8 + i * 0.1] as [number, number]) } }],
      [50, { id: 50, name: "Dummy Beast", minLevel: 12, maxLevel: 12, spawns: { "17": [[50, 50], [50.1, 50], [50.2, 50]] } }],
    ]);
    const zones = new Map([
      [440, { name: "Tanaris", uiMapId: 1446 }],
      [47, { name: "The Hinterlands", uiMapId: 1425 }],
      [17, { name: "The Barrens", uiMapId: 1413 }],
    ]);
    const r = evaluateGrindIntegrity(
      [{ slug: "horde-40-60-03-tanaris-feralas", steps: [over50, over30, ok] }],
      npcs,
      zones,
    );
    expect(r.filter((f) => f.category === "GRIND_KILL_CAP").map((f) => f.stepId)).toEqual([
      "h4060:tanaris:grind-speedrun-before-2605",
    ]);
    expect(r.filter((f) => f.category === "GRIND_KILL_UNDOCUMENTED").map((f) => f.stepId)).toEqual([
      "h4060:the-hinterlands:grind-speedrun-before-7845",
    ]);
    expect(r.filter((f) => f.stepId === "pack:grind-ok" && f.severity === "error")).toEqual([]);
  });

  it("flags friendly, sparse-spawn, out-of-level, far pin, and kill-count mismatch", () => {
    const step = grindStep("p:grind", "Grind Friendly Vendor about 8 kills vs type xp.", {
      actions: [
        { type: "xp", level: 12, extra: 0, label: "grind 40 kills", mobId: 9, mobName: "Vendor", mobLevel: 12 },
        { type: "goto", at: { mapId: 1413, x: 10, y: 10, zone: "The Barrens", exact: true } },
      ],
    });
    const npcs = new Map<number, SimNpc>([
      [
        9,
        {
          id: 9,
          name: "Vendor",
          minLevel: 60,
          maxLevel: 60,
          friendly: "H",
          services: ["vendor"],
          spawns: { "17": [[52, 31]] },
        },
      ],
    ]);
    const zones = new Map([[17, { name: "The Barrens", uiMapId: 1413 }]]);
    const r = evaluateGrindIntegrity([{ slug: "p", steps: [step] }], npcs, zones);
    expect(r.map((f) => f.category).sort()).toEqual([
      "GRIND_COUNT_MISMATCH",
      "GRIND_MOB_FRIENDLY",
      "GRIND_MOB_LEVEL",
      "GRIND_MOB_SPAWNS",
      "GRIND_PIN_FAR",
    ].sort());
  });

  it("accepts a mob whose level range overlaps the target window", () => {
    const overlap = grindStep("p:overlap", "Grind Razormane until about level 12.0, about 8 kills.", {
      actions: [
        { type: "xp", level: 12, extra: 0, label: "grind", mobId: 3118, mobName: "Razormane", mobLevel: 11 },
        { type: "goto", at: { mapId: 1413, x: 50, y: 50, zone: "The Barrens", exact: true } },
      ],
    });
    const miss = grindStep("p:miss", "Grind Lowbeast until about level 12.0, about 8 kills.", {
      actions: [
        { type: "xp", level: 12, extra: 0, label: "grind", mobId: 1, mobName: "Lowbeast", mobLevel: 6 },
        { type: "goto", at: { mapId: 1413, x: 50, y: 50, zone: "The Barrens", exact: true } },
      ],
    });
    const npcs = new Map<number, SimNpc>([
      [3118, { id: 3118, name: "Razormane", minLevel: 10, maxLevel: 11, spawns: { "17": [[50, 50], [50.1, 50], [50.2, 50]] } }],
      [1, { id: 1, name: "Lowbeast", minLevel: 5, maxLevel: 6, spawns: { "17": [[50, 50], [50.1, 50], [50.2, 50]] } }],
    ]);
    const zones = new Map([[17, { name: "The Barrens", uiMapId: 1413 }]]);
    const r = evaluateGrindIntegrity([{ slug: "p", steps: [overlap, miss] }], npcs, zones);
    expect(r.filter((f) => f.stepId === "p:overlap" && f.category === "GRIND_MOB_LEVEL")).toEqual([]);
    expect(r.filter((f) => f.stepId === "p:miss" && f.category === "GRIND_MOB_LEVEL")).toHaveLength(1);
  });

  it("warns GRIND_PIN_UNCHECKED when the zone cannot be resolved", () => {
    const step = grindStep("p:grind", "Grind Dummy about 5 kills.", {
      actions: [
        { type: "goto", at: { mapId: 9999, x: 1, y: 1, zone: "Nowhere", exact: true } },
        { type: "mob", name: "Dummy", npcIds: [50] },
      ],
    });
    const npcs = new Map<number, SimNpc>([
      [50, { id: 50, name: "Dummy", minLevel: 10, maxLevel: 10, spawns: { "17": [[50, 50], [51, 50], [52, 50]] } }],
    ]);
    const r = evaluateGrindIntegrity([{ slug: "p", steps: [step] }], npcs, new Map());
    expect(r.filter((f) => f.category === "GRIND_PIN_UNCHECKED")).toHaveLength(1);
    expect(r.filter((f) => f.category === "GRIND_PIN_UNCHECKED")[0]?.severity).toBe("warning");
  });
});
