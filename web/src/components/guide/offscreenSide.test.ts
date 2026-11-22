import { describe, expect, it } from "vitest";
import { offscreenSide } from "./SidePanel";

describe("offscreenSide", () => {
  it("reports where the current step card is relative to the view", () => {
    expect(offscreenSide({ top: -400, bottom: -20 }, 24, 700)).toBe("above");
    expect(offscreenSide({ top: 900, bottom: 1100 }, 24, 700)).toBe("below");
    expect(offscreenSide({ top: 100, bottom: 300 }, 24, 700)).toBeNull();
    expect(offscreenSide({ top: 650, bottom: 900 }, 24, 700)).toBeNull();
    expect(offscreenSide(null, 24, 700)).toBeNull();
  });
});
