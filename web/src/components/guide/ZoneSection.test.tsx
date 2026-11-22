import { describe, expect, it } from "vitest";
import { TONE } from "../step/ActionChips";
import { hiddenReasonText } from "./ZoneSection";

describe("hidden-run copy", () => {
  it("says why dungeon steps are hidden", () => {
    expect(hiddenReasonText("dungeons")).toBe("hidden because dungeons are off");
  });
});

describe("chip tones", () => {
  it("turn-in chips use the horde token, not amber", () => {
    expect(TONE.turnin).toContain("horde-");
    expect(TONE.turnin).not.toMatch(/amber/);
  });
});
