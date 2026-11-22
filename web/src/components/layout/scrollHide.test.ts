import { describe, expect, it } from "vitest";
import { nextScrollHidden, SCROLL_HIDE_TOP } from "./scrollHide";

describe("nextScrollHidden", () => {
  const y = SCROLL_HIDE_TOP + 400;
  it("hides on a scroll down and shows on a scroll up", () => {
    expect(nextScrollHidden(false, y, y + 50).hidden).toBe(true);
    expect(nextScrollHidden(true, y + 50, y).hidden).toBe(false);
  });
  it("ignores small jitter and keeps the anchor", () => {
    expect(nextScrollHidden(true, y, y - 3)).toEqual({ hidden: true, anchorY: y });
  });
  it("always shows near the top", () => {
    expect(nextScrollHidden(true, 0, SCROLL_HIDE_TOP).hidden).toBe(false);
  });
});
