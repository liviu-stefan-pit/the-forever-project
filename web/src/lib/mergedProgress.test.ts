import { describe, expect, it } from "vitest";
import type { Profile, Step } from "../data/schema";
import {
  applyMergedProgress,
  remapMergedStepId,
  remapMergedStepRecords,
  storedMergedStepIsDone,
} from "./mergedProgress";

function step(id: string, mergedIds?: string[]): Step {
  return { id, n: 1, tags: {}, text: [], actions: [], conditions: [], ...(mergedIds ? { mergedIds } : {}) };
}

function profile(steps: Profile["steps"], current?: Profile["current"]): Profile {
  return {
    id: "p1",
    name: "Thrall",
    race: "Orc",
    cls: "Warrior",
    routeStyle: "balanced",
    options: { showOptional: true, hideDone: false },
    steps,
    quests: {},
    addedQuests: [],
    current,
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
  };
}

describe("remapMergedStepId", () => {
  const steps = [step("keep:a", ["keep:b", "keep:c"]), step("keep:d")];

  it("maps an absorbed id onto the surviving card", () => {
    expect(remapMergedStepId("keep:b", steps)).toBe("keep:a");
    expect(remapMergedStepId("keep:c", steps)).toBe("keep:a");
  });

  it("leaves a surviving or unknown id unchanged", () => {
    expect(remapMergedStepId("keep:a", steps)).toBe("keep:a");
    expect(remapMergedStepId("keep:d", steps)).toBe("keep:d");
    expect(remapMergedStepId("other:x", steps)).toBe("other:x");
  });
});

describe("remapMergedStepRecords", () => {
  const steps = [step("g:survive", ["g:old"])];

  it("migrates a checked absorbed id onto the surviving step", () => {
    const next = remapMergedStepRecords({ "g:old": { done: true, at: 9 } }, steps);
    expect(next["g:old"]).toBeUndefined();
    expect(next["g:survive"]).toEqual({ done: true, at: 9 });
  });

  it("keeps an already-done survivor and still drops the absorbed id", () => {
    const next = remapMergedStepRecords(
      { "g:survive": { done: true, at: 3 }, "g:old": { done: true, at: 9 } },
      steps,
    );
    expect(next["g:old"]).toBeUndefined();
    expect(next["g:survive"]).toEqual({ done: true, at: 3 });
  });

  it("does not overwrite a done survivor with a skipped absorbed record", () => {
    const next = remapMergedStepRecords(
      { "g:survive": { done: true, at: 3 }, "g:old": { skipped: true, at: 9 } },
      steps,
    );
    expect(next["g:old"]).toBeUndefined();
    expect(next["g:survive"]).toEqual({ done: true, at: 3 });
  });
});

describe("storedMergedStepIsDone", () => {
  it("treats the surviving card as done when an absorbed id was ticked", () => {
    const stored = { "g:old": { done: true, at: 4 } as const };
    expect(storedMergedStepIsDone(stored, "g:survive", ["g:old"])).toBe(true);
    expect(storedMergedStepIsDone(stored, "g:survive")).toBe(false);
  });
});

describe("applyMergedProgress", () => {
  it("rewrites ticks and the resume cursor in one pass", () => {
    const p = profile({ "g:old": { done: true, at: 4 } }, { guide: "g", step: "g:old" });
    const next = applyMergedProgress(p, [step("g:survive", ["g:old"])], 50);
    expect(next.steps["g:survive"]).toEqual({ done: true, at: 4 });
    expect(next.steps["g:old"]).toBeUndefined();
    expect(next.current).toEqual({ guide: "g", step: "g:survive" });
    expect(next.updatedAt).toBe(50);
  });
});
