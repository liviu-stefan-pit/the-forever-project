import { describe, expect, it } from "vitest";
import { TONE } from "../step/ActionChips";
import { hiddenReasonText, hiddenRunRevealed } from "./ZoneSection";

describe("hidden-run copy", () => {
  it("says why dungeon steps are hidden", () => {
    expect(hiddenReasonText("dungeons")).toBe("hidden because dungeons are off");
  });

  it("is open only when every step in the run was revealed", () => {
    const revealed = new Set(["a", "b"]);
    expect(hiddenRunRevealed(["a", "b"], revealed)).toBe(true);
    expect(hiddenRunRevealed(["a"], revealed)).toBe(true);
    expect(hiddenRunRevealed(["a", "c"], revealed)).toBe(false);
    expect(hiddenRunRevealed([], revealed)).toBe(false);
  });
});

describe("chip tones", () => {
  it("turn-in chips use the horde token, not amber", () => {
    expect(TONE.turnin).toContain("horde-");
    expect(TONE.turnin).not.toMatch(/amber/);
  });
});
