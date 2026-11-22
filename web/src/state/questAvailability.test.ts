import { describe, expect, it } from "vitest";
import type { Profile, QuestInfo } from "../data/schema";
import { questAvailability } from "./questAvailability";

function profile(partial: Partial<Profile> = {}): Profile {
  return {
    id: "p1",
    name: "Thrall",
    race: "Orc",
    cls: "Warrior",
    routeStyle: "balanced",
    options: { showOptional: true, hideDone: false },
    steps: {},
    quests: {},
    addedQuests: [],
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
    ...partial,
  };
}

function quest(partial: Partial<QuestInfo> & { id: number }): QuestInfo {
  return {
    name: `Q${partial.id}`,
    level: 1,
    reqLevel: 1,
    races: 0,
    classes: 0,
    custom: false,
    start: [{ kind: "npc", id: 1, name: "NPC", at: [] }],
    end: [],
    objectivesText: [],
    objectives: [],
    pre: { group: [], single: [] },
    exclusiveTo: [],
    repeatable: false,
    inGuides: [],
    ...partial,
  };
}

describe("questAvailability", () => {
  it("pre.group requires every listed quest (AND)", () => {
    const info = quest({ id: 10, pre: { group: [1, 2], single: [] } });
    const quests = { 10: info };
    expect(questAvailability(10, profile(), quests)).toBe("locked");
    expect(questAvailability(10, profile({ quests: { 1: "done" } }), quests)).toBe("locked");
    expect(questAvailability(10, profile({ quests: { 1: "done", 2: "done" } }), quests)).toBe("available");
  });

  it("pre.single requires any one listed quest (OR)", () => {
    const info = quest({ id: 10, pre: { group: [], single: [1, 2] } });
    const quests = { 10: info };
    expect(questAvailability(10, profile(), quests)).toBe("locked");
    expect(questAvailability(10, profile({ quests: { 2: "done" } }), quests)).toBe("available");
  });

  it("exclusive sibling done => excluded", () => {
    const info = quest({ id: 10, exclusiveTo: [11] });
    expect(questAvailability(10, profile({ quests: { 11: "done" } }), { 10: info })).toBe("excluded");
  });

  it("breadcrumbFor target done => excluded", () => {
    const info = quest({ id: 10, breadcrumbFor: 99 });
    expect(questAvailability(10, profile({ quests: { 99: "done" } }), { 10: info })).toBe("excluded");
  });

  it("item-start is not locked when absent from a known log", () => {
    const info = quest({
      id: 883,
      start: [{ kind: "item", id: 50, name: "Note", at: [] }],
    });
    const p = profile({
      questLog: [],
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(questAvailability(883, p, { 883: info })).toBe("available");
  });

  it("no snapshot does not lock merely because the quest is absent from the log", () => {
    const info = quest({ id: 10 });
    // No questLogSyncedAt: empty or missing log must not force locked.
    expect(questAvailability(10, profile({ questLog: [] }), { 10: info })).toBe("available");
    expect(questAvailability(10, profile(), { 10: info })).toBe("available");
  });

  it("ready vs in_log from complete flag (including -1 failed)", () => {
    const info = quest({ id: 10 });
    const quests = { 10: info };
    const synced = { questLogSyncedAt: "2026-01-01T00:00:00.000Z" };
    expect(
      questAvailability(10, profile({ ...synced, questLog: [{ questId: 10, complete: 1 }] }), quests),
    ).toBe("ready");
    expect(
      questAvailability(10, profile({ ...synced, questLog: [{ questId: 10, complete: 0 }] }), quests),
    ).toBe("in_log");
    expect(
      questAvailability(10, profile({ ...synced, questLog: [{ questId: 10, complete: -1 }] }), quests),
    ).toBe("in_log");
  });

  it("done and unknown", () => {
    expect(questAvailability(10, profile({ quests: { 10: "done" } }), { 10: quest({ id: 10 }) })).toBe("done");
    expect(questAvailability(10, profile(), {})).toBe("unknown");
  });
});
