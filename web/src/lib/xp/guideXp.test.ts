import { describe, expect, it } from "vitest";
import type { Step } from "../../data/schema";
import { guideXpProgress } from "./guideXp";

function step(id: string, gained: number | undefined, extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [],
    actions: [],
    conditions: [],
    sim: gained == null ? undefined : { balanced: { level: 2, gained } },
    ...extra,
  };
}

describe("guideXpProgress", () => {
  it("sums visible-route gained and counts only done steps as earned", () => {
    const steps = [step("a", 1000), step("b", 3000)];
    const { earned, total } = guideXpProgress(steps, "balanced", (id) => id === "a");
    expect(total).toBe(4000);
    expect(earned).toBe(1000);
    expect(earned / total).toBe(0.25);
  });

  it("skips steps with missing gained and hidden steps", () => {
    const steps = [step("a", 500), step("b", undefined), step("c", 700)];
    const { earned, total } = guideXpProgress(steps, "balanced", () => false, (s) => s.id !== "c");
    expect(total).toBe(500);
    expect(earned).toBe(0);
  });
});
