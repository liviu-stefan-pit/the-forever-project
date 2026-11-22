import { describe, expect, it } from "vitest";
import { resetScrollIfPathChanged } from "./scrollReset";

describe("resetScrollIfPathChanged", () => {
  it("does not scroll on the first page (no previous path)", () => {
    const calls: [number, number][] = [];
    expect(resetScrollIfPathChanged(undefined, "/", (x, y) => calls.push([x, y]))).toBe(false);
    expect(calls).toEqual([]);
  });

  it("scrolls to the top when the path changes", () => {
    const calls: [number, number][] = [];
    expect(resetScrollIfPathChanged("/", "/overview", (x, y) => calls.push([x, y]))).toBe(true);
    expect(calls).toEqual([[0, 0]]);
  });

  it("does not scroll when only the path is unchanged (query/hash updates)", () => {
    const calls: [number, number][] = [];
    expect(resetScrollIfPathChanged("/guide/durotar-1-12", "/guide/durotar-1-12", (x, y) => calls.push([x, y]))).toBe(
      false,
    );
    expect(calls).toEqual([]);
  });

  it("does not scroll when only the query string changes, even if it is baked into the path", () => {
    const calls: [number, number][] = [];
    expect(
      resetScrollIfPathChanged("/guide/horde-40-60-09-wrapup?step=a", "/guide/horde-40-60-09-wrapup?step=b", (x, y) => calls.push([x, y])),
    ).toBe(false);
    expect(resetScrollIfPathChanged("/guide/horde-40-60-09-wrapup?step=a", "/guide/horde-40-60-09-wrapup", (x, y) => calls.push([x, y]))).toBe(
      false,
    );
    expect(calls).toEqual([]);
  });
});
