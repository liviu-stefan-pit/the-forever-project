import { describe, expect, it } from "vitest";
import type { Step } from "../../data/schema";
import { xpToNext } from "./rules";
import { recomputeGuideSims } from "./recomputeSim";

function step(partial: Pick<Step, "id" | "actions" | "sim"> & { n?: number }): Step {
  return {
    n: partial.n ?? 1,
    text: [],
    tags: {},
    conditions: [],
    ...partial,
  };
}

describe("recomputeGuideSims", () => {
  it("returns null when bonuses are off", () => {
    const steps = [step({ id: "a", actions: [], sim: { balanced: { level: 2, gained: 400 } } })];
    expect(recomputeGuideSims(steps, "balanced", undefined)).toBeNull();
    expect(recomputeGuideSims(steps, "balanced", { restedPolicy: "none", legacyWellRestedRank: 3 })).toBeNull();
  });

  it("applies the kill multiplier and spends rested across a step boundary", () => {
    const need = xpToNext(1);
    const steps = [
      step({
        id: "k1",
        actions: [],
        sim: { balanced: { level: 1 + 100 / need, gained: 100 } },
      }),
      step({
        id: "k2",
        actions: [],
        sim: { balanced: { level: 1 + 200 / need, gained: 100 } },
      }),
    ];
    const map = recomputeGuideSims(steps, "balanced", { restedPolicy: "fromGame" }, 150);
    expect(map).not.toBeNull();
    // 100 kill XP doubled by rested (pool 150 → 50), then 100 + the remaining 50.
    expect(map!.get("k1")!.gained).toBe(200);
    expect(map!.get("k2")!.gained).toBe(150);
    expect(map!.get("k2")!.level).toBeGreaterThan(steps[1]!.sim!.balanced!.level);
  });

  it("marks a grind skipped once earlier buffs pass its checkpoint", () => {
    const need = xpToNext(1);
    const steps = [
      step({
        id: "kills",
        actions: [],
        sim: { balanced: { level: 1 + 300 / need, gained: 300 } },
      }),
      step({
        id: "grind",
        actions: [{ type: "xp", level: 2, label: "Grind to 2" }],
        sim: { balanced: { level: 2, gained: need - 300 } },
      }),
    ];
    const map = recomputeGuideSims(steps, "balanced", { restedPolicy: "fromGame" }, 300);
    const grind = map!.get("grind")!;
    expect(grind.grindSkip).toBe(true);
    expect(grind.grindKillXp).toBe(0);
    expect(grind.gained).toBe(0);
    expect(grind.level).toBeGreaterThanOrEqual(2);
  });

  it("shrinks grind kill XP when food is on but still hits the checkpoint", () => {
    const need = xpToNext(1);
    const steps = [
      step({
        id: "grind",
        actions: [{ type: "xp", level: 2, label: "Grind to 2" }],
        sim: { balanced: { level: 2, gained: need } },
      }),
    ];
    const map = recomputeGuideSims(steps, "balanced", { wellFed: true });
    const grind = map!.get("grind")!;
    expect(grind.grindSkip).toBeUndefined();
    expect(grind.grindKillXp).toBeLessThan(need);
    expect(grind.gained).toBe(need);
    expect(grind.level).toBe(2);
  });

  it("does not spend rested on quest XP, and the bag waits until level 14", () => {
    const at10 = 10 + 1000 / xpToNext(10);
    const low = [
      step({
        id: "q",
        actions: [],
        sim: { balanced: { level: at10, gained: 1000, questXp: [{ questId: 1, xp: 1000, fullXp: 1000 }] } },
      }),
    ];
    const bagLow = recomputeGuideSims(low, "balanced", { sleepingBag: true, restedPolicy: "fromGame" }, 500);
    expect(bagLow!.get("q")!.gained).toBe(1000);
    expect(bagLow!.get("q")!.questXp![0]!.xp).toBe(1000);

    const at14 = 14 + 1000 / xpToNext(14);
    const high = [
      step({
        id: "q",
        actions: [],
        sim: { balanced: { level: at14, gained: 1000, questXp: [{ questId: 1, xp: 1000, fullXp: 1000 }] } },
      }),
    ];
    const bagHigh = recomputeGuideSims(high, "balanced", { sleepingBag: true, restedPolicy: "fromGame" }, 500);
    expect(bagHigh!.get("q")!.questXp![0]!.xp).toBe(1030);
    expect(bagHigh!.get("q")!.gained).toBe(1030);
  });
});
