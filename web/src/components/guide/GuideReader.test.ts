import { describe, expect, it } from "vitest";
import { stepIsShown } from "./GuideReader";

describe("stepIsShown", () => {
  it("keeps a race-filtered step hidden even when a link or reveal asks for it", () => {
    const hidden = { visible: false as const, reason: "filter" as const };
    expect(stepIsShown(hidden, { revealed: true, deepLinked: true })).toBe(false);
    expect(stepIsShown(hidden, { revealed: false, deepLinked: true })).toBe(false);
  });

  it("still opens dungeon and optional steps from an explicit link", () => {
    expect(stepIsShown({ visible: false, reason: "dungeons" }, { revealed: false, deepLinked: true })).toBe(true);
    expect(stepIsShown({ visible: false, reason: "optional" }, { revealed: true, deepLinked: false })).toBe(true);
  });

  it("shows steps the filter already allows", () => {
    expect(stepIsShown({ visible: true }, { revealed: false, deepLinked: false })).toBe(true);
  });
});
