import { describe, expect, it } from "vitest";
import type { ProfessionHook } from "../data/schema";
import { hookReached, hookSkillWarning, hookText } from "./stepExtras";
import { nearestGotoStep, normCoord, ridingNudge, trainerNudge, type TrainerTier } from "./profileHints";

const hook = (partial: Partial<ProfessionHook> = {}): ProfessionHook => ({
  profession: "Mining",
  note: "Mine copper",
  skillTarget: 65,
  sources: [],
  verified: true,
  ...partial,
});

describe("hook progress text", () => {
  it("keeps today's text when the profession skill is missing", () => {
    expect(hookText(hook())).toBe("Mine copper · to 65");
    expect(hookText(hook(), { Skinning: { cur: 1, max: 75 } })).toBe("Mine copper · to 65");
    expect(hookSkillWarning(hook(), {})).toBeUndefined();
    expect(hookReached(hook(), undefined)).toBe(false);
  });

  it("shows you are cur/target and a shortfall warning", () => {
    const skills = { Mining: { cur: 42, max: 75 } };
    expect(hookText(hook(), skills)).toBe("Mine copper · to 65 · you are 42/65");
    expect(hookSkillWarning(hook(), skills)).toBe("needs Mining 65 (you have 42)");
    expect(hookReached(hook(), skills)).toBe(false);
  });

  it("marks the hook reached once cur meets the target", () => {
    const skills = { Mining: { cur: 65, max: 75 } };
    expect(hookReached(hook(), skills)).toBe(true);
    expect(hookSkillWarning(hook(), skills)).toBeUndefined();
    expect(hookText(hook(), skills)).toContain("you are 65/65");
  });
});

describe("riding nudge", () => {
  it("is quiet below 40 or when riding is already trained", () => {
    expect(ridingNudge({ level: 39, spells: { riding: 0 } })).toBeUndefined();
    expect(ridingNudge({ level: 40, spells: { riding: 75 } })).toBeUndefined();
  });

  it("names the cost, and the shortfall only when money is known", () => {
    expect(ridingNudge({ level: 40, spells: { riding: 0 } })).toBe("Apprentice riding (100g)");
    expect(ridingNudge({ level: 40, money: 500_000, spells: { riding: 0 } })).toBe(
      "Apprentice riding (100g) — need 100g, you have 50g 0s 0c",
    );
    expect(ridingNudge({ level: 40, money: 1_000_000, spells: { riding: 0 } })).toBe("Apprentice riding (100g)");
  });
});

const tiers: TrainerTier[] = [
  { profession: "Mining", tier: "Apprentice", minLevel: 5, minSkill: 0, skillCap: 75 },
  { profession: "Mining", tier: "Journeyman", minLevel: 10, minSkill: 50, skillCap: 150 },
  { profession: "Mining", tier: "Expert", minLevel: 20, minSkill: 125, skillCap: 225 },
];

describe("trainer nudge predicate", () => {
  it("asks for the next tier within 25 skill of the cap once level allows it", () => {
    expect(trainerNudge("Mining", { cur: 50, max: 75 }, 10, tiers)).toBe("Train Journeyman now");
    expect(trainerNudge("Mining", { cur: 49, max: 75 }, 10, tiers)).toBeUndefined();
    expect(trainerNudge("Mining", { cur: 60, max: 75 }, 9, tiers)).toBeUndefined();
    expect(trainerNudge("Mining", { cur: 200, max: 225 }, 20, tiers)).toBeUndefined();
  });

  it("uses classic caps when the profession is absent from the trainer list", () => {
    expect(trainerNudge("Alchemy", { cur: 130, max: 150 }, 20, tiers)).toBe("Train Expert now");
  });
});

describe("nearest goto step", () => {
  const steps = [
    {
      id: "a",
      done: false,
      actions: [{ type: "goto" as const, at: { mapId: 1411, x: 40, y: 60, zone: "Durotar", exact: true }, label: "a" }],
    },
    {
      id: "b",
      done: false,
      actions: [{ type: "goto" as const, at: { mapId: 1411, x: 50, y: 50, zone: "Durotar", exact: true }, label: "b" }],
    },
    {
      id: "c",
      done: true,
      actions: [{ type: "goto" as const, at: { mapId: 1411, x: 42, y: 40, zone: "Durotar", exact: true }, label: "c" }],
    },
    {
      id: "other",
      done: false,
      actions: [{ type: "goto" as const, at: { mapId: 1412, x: 42, y: 40, zone: "Mulgore", exact: true }, label: "m" }],
    },
  ];

  it("normalizes 0–100 guide coords against a 0–1 position", () => {
    expect(normCoord(40)).toBeCloseTo(0.4);
    expect(normCoord(0.4)).toBeCloseTo(0.4);
    expect(nearestGotoStep(steps, { mapId: 1411, x: 0.41, y: 0.58 })).toBe("a");
    expect(nearestGotoStep(steps, { mapId: 1411, x: 0.42, y: 0.4 })).toBe("b");
  });

  it("hides when position or a goto on that map is missing", () => {
    expect(nearestGotoStep(steps, undefined)).toBeUndefined();
    expect(nearestGotoStep(steps, { mapId: 999, x: 0.5, y: 0.5 })).toBeUndefined();
    expect(nearestGotoStep(steps, { mapId: 1411, x: 0.5 })).toBeUndefined();
  });
});
