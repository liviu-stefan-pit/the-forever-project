import { describe, expect, it } from "vitest";
import {
  completionFromStepIds,
  isStoredStepMarked,
  retainCompletion,
  retainRequirement,
  retainStatus,
} from "./progressSelectors";

describe("retainCompletion", () => {
  it("returns the previous object when done/total are unchanged", () => {
    const prev = { done: 2, total: 5 };
    expect(retainCompletion(prev, { done: 2, total: 5 })).toBe(prev);
    expect(retainCompletion(prev, { done: 3, total: 5 })).toEqual({ done: 3, total: 5 });
    expect(retainCompletion(prev, { done: 3, total: 5 })).not.toBe(prev);
    expect(retainCompletion(prev, undefined)).toBeUndefined();
  });
});

describe("retainStatus", () => {
  it("returns the previous object when status and missing match", () => {
    const prev = { status: "blocked" as const, missing: [1, 2] };
    expect(retainStatus(prev, { status: "blocked", missing: [1, 2] })).toBe(prev);
    expect(retainStatus(prev, { status: "blocked", missing: [1] })).not.toBe(prev);
    expect(retainStatus(prev, { status: "open" })).toEqual({ status: "open" });
  });
});

describe("retainRequirement", () => {
  it("returns the previous object when the requirement is unchanged", () => {
    const required = { kind: "required" as const };
    expect(retainRequirement(required, { kind: "required" })).toBe(required);
    const blocked = { kind: "blocked" as const, missing: [9] };
    expect(retainRequirement(blocked, { kind: "blocked", missing: [9] })).toBe(blocked);
  });
});

describe("completionFromStepIds", () => {
  it("counts marked ids without needing step objects", () => {
    const steps = { "g:a": { done: true }, "g:b": { done: false }, "g:c": { done: true } };
    const ids = ["g:a", "g:b", "g:d"];
    expect(completionFromStepIds(ids, (id) => isStoredStepMarked(steps, id))).toEqual({ done: 1, total: 3 });
  });
});
