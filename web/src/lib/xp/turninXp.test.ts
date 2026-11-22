import { describe, expect, it } from "vitest";
import { questXpForPlayer } from "./rules";
import { turninChipXp } from "./turninXp";

describe("turninChipXp", () => {
  it("prefers the sim award and still returns a badge when fullXp === xp", () => {
    const sim = [{ questId: 10, xp: 840, fullXp: 840 }];
    expect(turninChipXp(10, sim, { xp: 840, level: 10 }, 10)).toEqual({ questId: 10, xp: 840, fullXp: 840 });
  });

  it("falls back to questXpForPlayer when the sim entry is missing", () => {
    const quest = { xp: 1000, level: 4 };
    expect(turninChipXp(10, undefined, quest, 10)).toEqual({
      xp: questXpForPlayer(1000, 4, 10),
      fullXp: 1000,
    });
    expect(turninChipXp(10, [], quest, 10)?.xp).toBe(800);
  });

  it("hides the badge when XP is genuinely unknown", () => {
    expect(turninChipXp(10, [{ questId: 10, xp: 0, fullXp: 0 }], { level: 10 }, 10)).toBeUndefined();
    expect(turninChipXp(10, undefined, { level: 10 }, 10)).toBeUndefined();
  });
});
