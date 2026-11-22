import { describe, expect, it } from "vitest";
import type { Guide, Step } from "../data/schema";
import { chainFor, guideForLevel, startPlan, stepForLevel } from "./startHere";
import { fmtPlayTime, minutesToSixty } from "./timeEstimate";

const entries = [
  { slug: "durotar-1-12", stepIds: ["d1", "d2"], stepCount: 2, minLevel: 1, maxLevel: 12, minutes: { balanced: 300, speedrun: 200 } },
  { slug: "barrens-12-20", stepIds: ["b1", "b2", "b3"], stepCount: 3, minLevel: 12, maxLevel: 20, minutes: { balanced: 240, speedrun: 200 } },
  { slug: "horde-20-40-01-barrens-a", stepIds: ["x"], stepCount: 1, minLevel: 20, maxLevel: 22, minutes: { balanced: 60, speedrun: 60 } },
];

const step = (id: string, level?: number): Step =>
  ({ id, n: 0, tags: {}, text: [], actions: [], conditions: [], ...(level !== undefined ? { sim: { balanced: { level, gained: 0 } } } : {}) }) as unknown as Step;

const barrens = { slug: "barrens-12-20", minLevel: 12, maxLevel: 20, steps: [step("b1", 12.2), step("b2", 14.1), step("b3", 15.5)] } as unknown as Guide;

describe("start at my level", () => {
  it("follows the race chain", () => {
    expect(chainFor("durotar-1-12", "balanced").slice(0, 2)).toEqual(["durotar-1-12", "barrens-12-20"]);
    expect(chainFor("tirisfal-1-12", "balanced")[1]).toBe("silverpine-11-15");
  });

  it("leaves the start zone at its last level", () => {
    const chain = chainFor("durotar-1-12", "balanced");
    expect(guideForLevel(chain, entries, 5)).toBe("durotar-1-12");
    expect(guideForLevel(chain, entries, 12)).toBe("barrens-12-20");
    expect(guideForLevel(chain, entries, 60)).toBe("horde-40-60-09-wrapup");
  });

  it("uses the XP sim's start level when every guide has one", () => {
    const chain = ["durotar-1-12", "barrens-12-20", "horde-20-40-01-barrens-a"];
    const sim = entries.map((e, i) => ({ ...e, startLevel: { balanced: [1, 12.4, 21.3][i]! } }));
    expect(guideForLevel(chain, sim, 11, "balanced")).toBe("durotar-1-12");
    expect(guideForLevel(chain, sim, 20, "balanced")).toBe("barrens-12-20");
    expect(guideForLevel(chain, sim, 21, "balanced")).toBe("horde-20-40-01-barrens-a");
  });

  it("finds the first step at the level and marks the rest done", () => {
    const s = stepForLevel(barrens, 14, "balanced", () => true)!;
    expect(s.id).toBe("b2");
    const plan = startPlan(chainFor("durotar-1-12", "balanced"), entries, barrens, s);
    expect(plan.doneIds).toEqual(["d1", "d2", "b1"]);
  });

  it("falls back to the last step past the sim, the first without one", () => {
    expect(stepForLevel(barrens, 19, "balanced", () => true)!.id).toBe("b3");
    expect(stepForLevel(barrens, 19, "speedrun", () => true)!.id).toBe("b1");
    expect(stepForLevel(barrens, 14, "balanced", (x) => x.id !== "b1" && x.id !== "b2")!.id).toBe("b3");
  });
});

describe("time estimates", () => {
  it("adds the rest of the route", () => {
    expect(minutesToSixty(entries, "durotar-1-12", 0.5, "balanced")).toBe(150 + 240 + 60);
  });
  it("formats play time", () => {
    expect(fmtPlayTime(40)).toBe("40 min");
    expect(fmtPlayTime(299)).toBe("5 h");
    expect(fmtPlayTime(6600)).toBe("110 h");
  });
});
