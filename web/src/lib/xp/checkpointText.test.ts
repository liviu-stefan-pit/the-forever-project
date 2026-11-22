import { describe, expect, it } from "vitest";
import { checkpointBannerText } from "./checkpointText";

const next = (partial: {
  level?: number;
  quests: number;
  xpGap: number;
  mobs: [number, number];
  mobLevel?: number;
  mobName?: string;
}) => ({
  level: partial.level ?? 15,
  quests: partial.quests,
  xpGap: partial.xpGap,
  mobs: partial.mobs,
  mobLevel: partial.mobLevel ?? 14,
  ...(partial.mobName ? { mobName: partial.mobName } : {}),
});

describe("checkpointBannerText", () => {
  it("range with a named mob", () => {
    expect(
      checkpointBannerText(
        14,
        next({ quests: 3, xpGap: 1200, mobs: [4, 6], mobName: "Mottled Boar" }),
      ),
    ).toBe("Level 14! Next: 3 quests + ~4–6 Mottled Boar (lvl 14) to reach 15.");
  });

  it("collapsed range", () => {
    expect(
      checkpointBannerText(
        14,
        next({ quests: 2, xpGap: 400, mobs: [5, 5], mobName: "Mottled Boar" }),
      ),
    ).toBe("Level 14! Next: 2 quests + ~5 Mottled Boar (lvl 14) to reach 15.");
  });

  it("quests only", () => {
    expect(checkpointBannerText(14, next({ quests: 2, xpGap: 0, mobs: [0, 0] }))).toBe(
      "Level 14! Next: 2 quests to reach 15.",
    );
  });

  it("kills only", () => {
    expect(
      checkpointBannerText(
        14,
        next({ quests: 0, xpGap: 800, mobs: [3, 5], mobName: "Mottled Boar" }),
      ),
    ).toBe("Level 14! Next: ~3–5 Mottled Boar to reach 15.");
  });

  it("no next", () => {
    expect(checkpointBannerText(14)).toBe("Level 14!");
    expect(checkpointBannerText(14, next({ quests: 0, xpGap: 0, mobs: [0, 0] }))).toBe("Level 14!");
  });
});
