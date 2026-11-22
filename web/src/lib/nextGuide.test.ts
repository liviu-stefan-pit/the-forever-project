import { describe, expect, it } from "vitest";
import {
  formatGuideStepCount,
  guideName,
  isBalancedOnlyPack,
  successorSlug,
} from "./nextGuide";
import { resolveNextGuide } from "./routeChains";

describe("successorSlug", () => {
  it("uses resolveNextGuide when it returns a slug (Tirisfal speedrun skips Silverpine)", () => {
    expect(resolveNextGuide("tirisfal-1-12", "speedrun")).toBe("barrens-12-20");
    expect(
      successorSlug(
        {
          slug: "tirisfal-1-12",
          next: "silverpine-11-15",
          nextByRoute: { speedrun: "barrens-12-20", balanced: "silverpine-11-15" },
        },
        "speedrun",
      ),
    ).toBe("barrens-12-20");
    expect(
      successorSlug(
        {
          slug: "tirisfal-1-12",
          next: "silverpine-11-15",
          nextByRoute: { speedrun: "barrens-12-20", balanced: "silverpine-11-15" },
        },
        "balanced",
      ),
    ).toBe("silverpine-11-15");
  });

  it("falls through to guide.next when Silverpine is opened on speedrun", () => {
    expect(resolveNextGuide("silverpine-11-15", "speedrun")).toBeUndefined();
    expect(successorSlug({ slug: "silverpine-11-15", next: "barrens-12-20" }, "speedrun")).toBe(
      "barrens-12-20",
    );
  });

  it("falls through to nextByRoute then next for a dungeon that is not on a chain", () => {
    expect(resolveNextGuide("rfc", "speedrun")).toBeUndefined();
    expect(
      successorSlug({ slug: "rfc", next: "fallback", nextByRoute: { speedrun: "barrens-12-20" } }, "speedrun"),
    ).toBe("barrens-12-20");
    expect(successorSlug({ slug: "rfc", next: "barrens-12-20" }, "speedrun")).toBe("barrens-12-20");
  });

  it("has no successor for the wrapup pack", () => {
    expect(successorSlug({ slug: "horde-40-60-09-wrapup" }, "speedrun")).toBeUndefined();
    expect(successorSlug({ slug: "horde-40-60-09-wrapup" }, "balanced")).toBeUndefined();
  });
});

describe("guideName", () => {
  it("prefers a real displayName over prettifySlug", () => {
    expect(guideName("barrens-12-20", "The Barrens 12-20")).toBe("The Barrens 12-20");
    expect(guideName("barrens-12-20")).toBe("Barrens 12 20");
  });
});

describe("formatGuideStepCount", () => {
  it("shows the ring total first and the full length as secondary", () => {
    expect(formatGuideStepCount(95, 154)).toBe("95 steps (154 total)");
  });

  it("falls back to the full length when the ring total is 0", () => {
    expect(formatGuideStepCount(0, 154)).toBe("154 steps");
  });
});

describe("isBalancedOnlyPack", () => {
  it("flags Silverpine and not Barrens or a dungeon slug", () => {
    expect(isBalancedOnlyPack("silverpine-11-15")).toBe(true);
    expect(isBalancedOnlyPack("barrens-12-20")).toBe(false);
    expect(isBalancedOnlyPack("rfc")).toBe(false);
  });
});
