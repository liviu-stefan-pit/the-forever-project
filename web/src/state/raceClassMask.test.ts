import { describe, expect, it } from "vitest";
import type { Profile, QuestInfo, Step } from "../data/schema";
import { stepStatus, type StepsForQuest } from "./questProgress";
import { RACE_MASK, maskExcludes } from "./raceClassMask";

/** 2^33. Questie quest 93836 is 8589934770 (Horde 178 + this bit); 98340 is 8589934624 (Tauren 32 + this bit). */
const SKYBORNE = 8589934592;
const none: StepsForQuest = () => [];

function profile(race: string): Profile {
  return {
    id: "p",
    name: "Wind",
    race,
    cls: "Warrior",
    routeStyle: "balanced",
    options: { showOptional: true, hideDone: false },
    steps: {},
    quests: {},
    addedQuests: [],
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
  };
}

function quest(races: number): QuestInfo {
  return {
    id: 1,
    name: "Race gate",
    level: 1,
    reqLevel: 1,
    races,
    classes: 0,
    custom: false,
    start: [],
    end: [],
    objectivesText: [],
    objectives: [],
    pre: { group: [], single: [] },
    exclusiveTo: [],
    repeatable: false,
    inGuides: [],
  };
}

const step: Step = {
  id: "race:001",
  n: 1,
  tags: {},
  text: [],
  actions: [{ type: "accept", questId: 1, label: "Accept" }],
  conditions: [],
};

describe("raceClassMask", () => {
  it("keeps the Skyborne bit confirmed on more than one quest", () => {
    expect(RACE_MASK.Skyborne).toBe(SKYBORNE);
    expect(maskExcludes(8589934770, RACE_MASK.Skyborne)).toBe(false);
    expect(maskExcludes(8589934770, RACE_MASK.Undead)).toBe(false);
    expect(maskExcludes(8589934624, RACE_MASK.Skyborne)).toBe(false);
    expect(maskExcludes(8589934624, RACE_MASK.Tauren)).toBe(false);
    expect(maskExcludes(8589934624, RACE_MASK.Orc)).toBe(true);
    expect(maskExcludes(SKYBORNE, RACE_MASK.Skyborne)).toBe(false);
    expect(maskExcludes(16, RACE_MASK.Skyborne)).toBe(true);
    expect(maskExcludes(0, RACE_MASK.Skyborne)).toBe(false);
    expect(maskExcludes(0, 1)).toBe(false);
  });

  it("excludes an Undead-only quest for Skyborne and keeps a quest that includes the high bit", () => {
    const sky = profile("Skyborne");
    const undeadOnly = new Map<number, QuestInfo>([[1, quest(16)]]);
    expect(stepStatus(sky, step, none, undeadOnly).status).toBe("not_applicable");
    const withSkyborne = new Map<number, QuestInfo>([[1, quest(16 + SKYBORNE)]]);
    expect(stepStatus(sky, step, none, withSkyborne).status).not.toBe("not_applicable");
    expect(maskExcludes(16 + SKYBORNE, RACE_MASK.Skyborne)).toBe(false);
  });
});
