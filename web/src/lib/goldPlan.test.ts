import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bracketFor, isHonoredHome, milestoneDone, milestonePrice, nextMilestone, paceTarget, paceVerdict, spotsNear, type GoldPlan } from "./goldPlan";

const plan = JSON.parse(readFileSync(join(__dirname, "../../../research/gold/gold-plan.json"), "utf8")) as GoldPlan;

describe("gold plan", () => {
  it("points a new character at the level 40 mount", () => {
    expect(nextMilestone(plan, { cls: "Warrior", level: 12 })?.id).toBe("riding40");
  });

  it("skips the mount for Warlocks and Paladins", () => {
    expect(milestoneDone(plan.milestones[0]!, { cls: "Warlock" })).toBe(true);
    expect(nextMilestone(plan, { cls: "Warlock", level: 20 })?.id).toBe("riding60");
    expect(nextMilestone(plan, { cls: "Warlock", level: 42 })?.id).toBe("dualspec");
  });

  it("moves on to dual spec once riding is trained", () => {
    expect(nextMilestone(plan, { cls: "Mage", level: 41, spells: { riding: 75 } })?.id).toBe("dualspec");
    expect(nextMilestone(plan, { cls: "Mage", level: 41 })?.id).toBe("riding40");
  });

  it("applies the Honored price", () => {
    const r40 = plan.milestones.find((m) => m.id === "riding40")!;
    expect(milestonePrice(r40, false)).toBe(100);
    expect(milestonePrice(r40, true)).toBe(90);
    expect(isHonoredHome({ reputation: [{ factionID: 76, name: "Orgrimmar", reaction: 6 }] })).toBe(true);
    expect(isHonoredHome({ reputation: [{ factionID: 76, name: "Orgrimmar", reaction: 5 }] })).toBe(false);
  });

  it("interpolates the savings pace and stops after 40", () => {
    expect(paceTarget(plan, 1)).toBe(0);
    expect(paceTarget(plan, 30)).toBe(20);
    expect(paceTarget(plan, 35)).toBe(60);
    expect(paceTarget(plan, 40)).toBe(100);
    expect(paceTarget(plan, 45)).toBeUndefined();
  });

  it("judges pace with some slack", () => {
    expect(paceVerdict(19, 20)).toBe("on");
    expect(paceVerdict(10, 20)).toBe("behind");
    expect(paceVerdict(30, 20)).toBe("ahead");
  });

  it("finds the bracket and nearby spots", () => {
    expect(bracketFor(plan, 30)?.levels).toEqual([30, 40]);
    expect(bracketFor(plan, 7)?.levels).toEqual([1, 15]);
    const b = bracketFor(plan, 38)!;
    expect(spotsNear(b, 38).map((s) => s.name)).toContain("Elemental Exiles");
  });
});
