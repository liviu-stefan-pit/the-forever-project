import { describe, expect, it } from "vitest";
import { commandForKey, firstUncheckedFrom, navReducer, type NavContext } from "./keyboard";

const order = ["s1", "s2", "s3", "s4", "s5"];
const ctx = (done: string[] = [], skip: string[] = []): NavContext => ({
  order,
  isDone: (id) => done.includes(id),
  shouldSkip: skip.length ? (id) => skip.includes(id) : undefined,
});

describe("commandForKey", () => {
  it("maps the documented keys", () => {
    expect(commandForKey({ key: "j" })).toBe("next");
    expect(commandForKey({ key: "k" })).toBe("prev");
    expect(commandForKey({ key: " " })).toBe("toggle");
    expect(commandForKey({ key: "n" })).toBe("nextUnchecked");
    expect(commandForKey({ key: "/" })).toBe("search");
    expect(commandForKey({ key: "k", ctrlKey: true })).toBe("search");
    expect(commandForKey({ key: "K", metaKey: true })).toBe("search");
    expect(commandForKey({ key: "x" })).toBeNull();
  });

  it("ignores keys while typing, except Ctrl+K", () => {
    expect(commandForKey({ key: "j", targetTag: "INPUT" })).toBeNull();
    expect(commandForKey({ key: "/", targetTag: "TEXTAREA" })).toBeNull();
    expect(commandForKey({ key: "n", targetEditable: true })).toBeNull();
    expect(commandForKey({ key: "k", ctrlKey: true, targetTag: "INPUT" })).toBe("search");
  });

  it("leaves space to focused buttons and links, and ignores modified keys", () => {
    expect(commandForKey({ key: " ", targetTag: "BUTTON" })).toBeNull();
    expect(commandForKey({ key: " ", targetTag: "A" })).toBeNull();
    expect(commandForKey({ key: "j", targetTag: "BUTTON" })).toBe("next");
    expect(commandForKey({ key: "j", altKey: true })).toBeNull();
    expect(commandForKey({ key: "n", ctrlKey: true })).toBeNull();
  });
});

describe("navReducer", () => {
  it("moves with next/prev and clamps at the ends", () => {
    expect(navReducer("s2", "next", ctx()).current).toBe("s3");
    expect(navReducer("s5", "next", ctx()).current).toBe("s5");
    expect(navReducer("s2", "prev", ctx()).current).toBe("s1");
    expect(navReducer("s1", "prev", ctx()).current).toBe("s1");
  });

  it("starts at the first step without a cursor (or with an unknown one)", () => {
    expect(navReducer(undefined, "next", ctx()).current).toBe("s1");
    expect(navReducer("gone", "next", ctx()).current).toBe("s1");
    expect(navReducer(undefined, "toggle", ctx())).toEqual({ current: "s1" });
  });

  it("jumps to the next unchecked step and wraps", () => {
    expect(navReducer("s1", "nextUnchecked", ctx(["s2", "s3"])).current).toBe("s4");
    expect(navReducer("s4", "nextUnchecked", ctx(["s5", "s1"])).current).toBe("s2");
    expect(navReducer("s3", "nextUnchecked", ctx(["s1", "s2", "s4", "s5"])).current).toBe("s3");
  });

  it("toggle ticks the current step and moves to the next unchecked one", () => {
    expect(navReducer("s2", "toggle", ctx(["s3"]))).toEqual({ current: "s4", toggle: "s2" });
  });

  it("toggle on a done step unticks it and stays", () => {
    expect(navReducer("s2", "toggle", ctx(["s2"]))).toEqual({ current: "s2", toggle: "s2" });
  });

  it("toggle on the last unchecked step stays put", () => {
    expect(navReducer("s5", "toggle", ctx(["s1", "s2", "s3", "s4"]))).toEqual({ current: "s5", toggle: "s5" });
  });

  it("handles an empty order", () => {
    expect(navReducer(undefined, "next", { order: [], isDone: () => false })).toEqual({ current: undefined });
  });

  it("nextUnchecked and firstUncheckedFrom skip blocked / not_applicable", () => {
    expect(firstUncheckedFrom(order, 0, () => false, undefined, (id) => id === "s1" || id === "s2")).toBe("s3");
    expect(navReducer("s1", "nextUnchecked", ctx([], ["s2", "s3"])).current).toBe("s4");
    expect(navReducer("s2", "toggle", ctx([], ["s3"]))).toEqual({ current: "s4", toggle: "s2" });
  });

  it("mixed turnin+accept with only turnin done is not treated as finished (still selectable)", () => {
    // Mirrors silverpine turnin 1359 + accept 1358: not done, not skipped.
    const mixedOrder = ["before", "mixed", "after"];
    const isDone = (id: string) => id === "before";
    const shouldSkip = () => false;
    expect(firstUncheckedFrom(mixedOrder, 0, isDone, undefined, shouldSkip)).toBe("mixed");
    expect(navReducer("before", "nextUnchecked", { order: mixedOrder, isDone, shouldSkip }).current).toBe("mixed");
  });
});
