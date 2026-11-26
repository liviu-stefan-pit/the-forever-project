import { describe, expect, it } from "vitest";
import { stepIsRouted, stepIsShown } from "./GuideReader";

describe("stepIsShown", () => {
  const filtered = { visible: false as const, reason: "filter" as const };

  it("opens a step for another class when the player presses Show", () => {
    expect(stepIsShown(filtered, { revealed: true, deepLinked: false })).toBe(true);
  });

  it("keeps a class or race step hidden when only a link asks for it", () => {
    expect(stepIsShown(filtered, { revealed: false, deepLinked: true })).toBe(false);
    expect(stepIsShown(filtered, { revealed: false, deepLinked: false })).toBe(false);
  });

  it("still opens dungeon and optional steps from an explicit link", () => {
    expect(stepIsShown({ visible: false, reason: "dungeons" }, { revealed: false, deepLinked: true })).toBe(true);
    expect(stepIsShown({ visible: false, reason: "optional" }, { revealed: true, deepLinked: false })).toBe(true);
  });

  it("shows steps the filter already allows", () => {
    expect(stepIsShown({ visible: true }, { revealed: false, deepLinked: false })).toBe(true);
  });
});

describe("stepIsRouted", () => {
  it("keeps a revealed step for another class out of navigation and the map", () => {
    expect(stepIsRouted({ visible: false, reason: "filter" }, { revealed: true, deepLinked: true })).toBe(false);
  });

  it("routes revealed steps hidden for other reasons", () => {
    expect(stepIsRouted({ visible: false, reason: "optional" }, { revealed: true, deepLinked: false })).toBe(true);
    expect(stepIsRouted({ visible: true }, { revealed: false, deepLinked: false })).toBe(true);
  });
});
