import { describe, expect, it } from "vitest";
import { LAST_20_40_PACK } from "../src/lib/xp/leveling-chain.ts";
import type { ChainModeSummary, LevelingChain } from "../src/lib/xp/simulate.ts";
import { evaluateXpGate, formatXpGateMarkdown } from "./xp-gate.ts";

const chain: LevelingChain = {
  id: "test",
  title: "start → band end → end",
  packs: ["start-1-20", LAST_20_40_PACK, "end-40-60"],
  handoff: "test sequence",
};

// The 40–60 pack declares 38 so the 39.5 band floor is stricter than the hand-off floor.
const guides = new Map([
  ["start-1-20", { minLevel: 1 }],
  [LAST_20_40_PACK, { minLevel: 20 }],
  ["end-40-60", { minLevel: 38 }],
]);

function report(packEnds: Record<string, number>) {
  const summary = (mode: "balanced" | "speedrun"): ChainModeSummary => ({
    chainId: "test",
    mode,
    packEnds,
    packArrivals: {},
    endLevel: 60,
    totalXp: 0,
    xpTo60: 0,
  });
  return { chains: [summary("balanced"), summary("speedrun")] };
}

const run = (ends: Record<string, number>) => evaluateXpGate(report(ends), guides, [chain]);
const failing = (ends: Record<string, number>) => run(ends).filter((r) => !r.ok);

describe("evaluateXpGate", () => {
  it("passes when every pack ends exactly on its floor", () => {
    expect(failing({ "start-1-20": 19.5, [LAST_20_40_PACK]: 39.5, "end-40-60": 59.5 })).toEqual([]);
  });

  it("never fails for ending higher than needed", () => {
    expect(failing({ "start-1-20": 30, [LAST_20_40_PACK]: 45, "end-40-60": 60 })).toEqual([]);
  });

  it("fails a hand-off below next minLevel − 0.5, once per mode", () => {
    const f = failing({ "start-1-20": 19.49, [LAST_20_40_PACK]: 39.5, "end-40-60": 60 });
    expect(f.map((r) => [r.pack, r.mode])).toEqual([
      ["start-1-20", "balanced"],
      ["start-1-20", "speedrun"],
    ]);
    expect(f[0]!.floor).toBe(19.5);
    expect(f[0]!.margin).toBeCloseTo(-0.01);
  });

  it("holds the last 20–40 pack to 39.5 even when the next pack starts lower", () => {
    const f = failing({ "start-1-20": 20, [LAST_20_40_PACK]: 38, "end-40-60": 60 });
    expect(f).toHaveLength(2);
    expect(f[0]!.floor).toBe(39.5);
  });

  it("fails the chain end below 59.5", () => {
    const f = failing({ "start-1-20": 20, [LAST_20_40_PACK]: 40, "end-40-60": 59.4 });
    expect(f.map((r) => r.pack)).toEqual(["end-40-60", "end-40-60"]);
  });

  it("fails when the sim has no end level for a pack or a chain is missing", () => {
    expect(failing({ [LAST_20_40_PACK]: 40, "end-40-60": 60 }).map((r) => r.pack)).toEqual(["start-1-20", "start-1-20"]);
    const none = evaluateXpGate({ chains: [] }, guides, [chain]);
    expect(none.every((r) => !r.ok)).toBe(true);
  });

  it("fails when the next pack is not built", () => {
    const partial = new Map([...guides].filter(([slug]) => slug !== "end-40-60"));
    const f = evaluateXpGate(report({ "start-1-20": 20, [LAST_20_40_PACK]: 40, "end-40-60": 60 }), partial, [chain]).filter((r) => !r.ok);
    expect(f.map((r) => r.pack)).toEqual([LAST_20_40_PACK, LAST_20_40_PACK]);
  });

  it("summarises failures in markdown", () => {
    const md = formatXpGateMarkdown(run({ "start-1-20": 19, [LAST_20_40_PACK]: 40, "end-40-60": 60 }));
    expect(md).toContain("❌ **2 of 6**");
    expect(md).toContain("| test | balanced | start-1-20 | 19.00 | 19.50 | -0.50 |");
  });
});
