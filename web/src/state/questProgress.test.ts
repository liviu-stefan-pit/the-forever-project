import { describe, expect, it } from "vitest";
import type { Profile, QuestInfo, Step } from "../data/schema";
import { isQuestExcluded } from "./questAvailability";
import {
  applyToggle,
  buildStepIndexes,
  closestPriorAcceptStepId,
  countDoneForGuide,
  isStepDone,
  routeTurnsInByStep,
  stepStatus,
  stopIsComplete,
} from "./questProgress";

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

function step(partial: Partial<Step> & { id: string }): Step {
  return {
    n: 1,
    tags: {},
    text: [],
    actions: [],
    conditions: [],
    ...partial,
  };
}

const accept = step({
  id: "g:accept",
  actions: [{ type: "accept", questId: 788, label: "Accept Cutting Teeth" }],
});
const complete = step({
  id: "g:complete",
  actions: [{ type: "complete", questId: 788, objective: 1, label: "Kill 10 boars" }],
});
const collect = step({
  id: "g:collect",
  actions: [{ type: "collect", itemId: 1, count: 1, questId: 788, label: "Boar meat" }],
});
const cond = step({
  id: "g:cond",
  conditions: [{ cmd: "isOnQuest", args: "788", questIds: [788], label: "On quest" }],
});
const turnin = step({
  id: "g:turnin",
  actions: [{ type: "turnin", questId: 788, label: "Turn in Cutting Teeth" }],
});
const other = step({
  id: "g:other",
  actions: [{ type: "hs", label: "Hearth" }],
});

const catalog = new Map<number, string[]>([
  [788, [accept.id, complete.id, collect.id, cond.id, turnin.id]],
]);

function stepsForQuest(id: number): readonly string[] {
  return catalog.get(id) ?? [];
}

describe("turnin propagation", () => {
  it("checking a turnin sets the quest done; other steps need their own actions satisfied", () => {
    let p = profile();
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest, now: 10 });
    expect(p.quests[788]).toBe("done");
    expect(isStepDone(p, turnin.id, stepsForQuest, turnin)).toBe(true);
    // Quest done satisfies accept / complete / collect / turnin actions.
    expect(isStepDone(p, accept.id, stepsForQuest, accept)).toBe(true);
    expect(isStepDone(p, complete.id, stepsForQuest, complete)).toBe(true);
    expect(isStepDone(p, collect.id, stepsForQuest, collect)).toBe(true);
    // Conditions-only and non-quest steps are not implied done.
    expect(isStepDone(p, cond.id, stepsForQuest, cond)).toBe(false);
    expect(isStepDone(p, other.id, stepsForQuest, other)).toBe(false);
  });

  it("unchecking a turnin clears quest-implied steps but keeps hand-ticked ones", () => {
    let p = profile();
    p = applyToggle(p, accept.id, accept, { stepsForQuest, now: 5 });
    expect(p.steps[accept.id]).toEqual({ done: true, at: 5 });
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest, now: 10 });
    expect(isStepDone(p, complete.id, stepsForQuest, complete)).toBe(true);
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest, now: 11 });
    expect(p.quests[788]).toBeUndefined();
    expect(isStepDone(p, turnin.id, stepsForQuest, turnin)).toBe(false);
    expect(isStepDone(p, complete.id, stepsForQuest, complete)).toBe(false);
    expect(isStepDone(p, collect.id, stepsForQuest, collect)).toBe(false);
    expect(isStepDone(p, cond.id, stepsForQuest, cond)).toBe(false);
    expect(isStepDone(p, accept.id, stepsForQuest, accept)).toBe(true);
    expect(p.steps[accept.id]).toEqual({ done: true, at: 5 });
  });

  it("checking a non-turnin marks only that step", () => {
    let p = profile();
    p = applyToggle(p, accept.id, accept, { stepsForQuest, now: 5 });
    expect(p.quests[788]).toBeUndefined();
    expect(isStepDone(p, accept.id, stepsForQuest, accept)).toBe(true);
    expect(isStepDone(p, turnin.id, stepsForQuest, turnin)).toBe(false);
    expect(isStepDone(p, complete.id, stepsForQuest, complete)).toBe(false);
  });

  it("a finished objective satisfies that complete or collect action without writing the step", () => {
    const none = () => [];
    const logged = profile({
      questLogSyncedAt: "2026-11-21T00:00:00.000Z",
      questLog: [
        {
          questId: 788,
          complete: 0,
          objectives: [{ text: "Boars", finished: true, numFulfilled: 10, numRequired: 10 }],
        },
      ],
    });
    expect(isStepDone(logged, complete.id, none, complete)).toBe(true);
    expect(isStepDone(logged, collect.id, none, collect)).toBe(true);
    expect(logged.steps[complete.id]).toBeUndefined();
    expect(stepStatus(logged, complete, none).status).toBe("done");

    const partial = profile({
      questLogSyncedAt: "2026-11-21T00:00:00.000Z",
      questLog: [{ questId: 788, complete: 0, objectives: [{ finished: false, numFulfilled: 3, numRequired: 10 }] }],
    });
    expect(isStepDone(partial, complete.id, none, complete)).toBe(false);

    const unknown = profile({
      questLog: [{ questId: 788, complete: 0, objectives: [{ finished: true, numFulfilled: 10, numRequired: 10 }] }],
    });
    expect(isStepDone(unknown, complete.id, none, complete)).toBe(false);
  });

  it("a quest already done satisfies action steps for that quest, not unrelated steps", () => {
    const p = profile({ quests: { 788: "done" } });
    expect(isStepDone(p, accept.id, stepsForQuest, accept)).toBe(true);
    expect(isStepDone(p, complete.id, stepsForQuest, complete)).toBe(true);
    expect(isStepDone(p, turnin.id, stepsForQuest, turnin)).toBe(true);
    expect(isStepDone(p, cond.id, stepsForQuest, cond)).toBe(false);
    expect(isStepDone(p, other.id, stepsForQuest, other)).toBe(false);
  });

  it("without a step object, quest-done alone does not mark the step (no quest-steps shortcut)", () => {
    const p = profile({ quests: { 788: "done" } });
    const none = () => [];
    expect(isStepDone(p, accept.id, none)).toBe(false);
    expect(isStepDone(p, accept.id, none, accept)).toBe(true);
    expect(isStepDone(p, complete.id, none, complete)).toBe(true);
    expect(isStepDone(p, collect.id, none, collect)).toBe(true);
    expect(isStepDone(p, turnin.id, none, turnin)).toBe(true);
    expect(isStepDone(p, cond.id, none, cond)).toBe(false);
    expect(isStepDone(p, other.id, none, other)).toBe(false);
  });

  it("checking a turnin without a quest dump marks the quest; referencing steps need the step object", () => {
    const none = () => [];
    const loaded = [accept, complete, collect, cond, turnin, other];
    let p = profile();
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest: none, now: 10, loadedSteps: loaded });
    expect(p.quests[788]).toBe("done");
    expect(p.steps[turnin.id]).toEqual({ done: true, at: 10 });
    expect(p.steps[accept.id]).toBeUndefined();
    expect(isStepDone(p, turnin.id, none, turnin)).toBe(true);
    expect(isStepDone(p, accept.id, none, accept)).toBe(true);
    expect(isStepDone(p, complete.id, none, complete)).toBe(true);
    expect(isStepDone(p, collect.id, none, collect)).toBe(true);
    expect(isStepDone(p, cond.id, none, cond)).toBe(false);
    expect(isStepDone(p, other.id, none, other)).toBe(false);
  });

  it("unchecking a turnin without a quest dump keeps hand-ticked steps", () => {
    const none = () => [];
    const loaded = [accept, complete, collect, cond, turnin, other];
    let p = profile();
    p = applyToggle(p, accept.id, accept, { stepsForQuest: none, now: 5, loadedSteps: loaded });
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest: none, now: 10, loadedSteps: loaded });
    p = applyToggle(p, turnin.id, turnin, { stepsForQuest: none, now: 11, loadedSteps: loaded });
    expect(p.quests[788]).toBeUndefined();
    expect(isStepDone(p, turnin.id, none, turnin)).toBe(false);
    expect(isStepDone(p, complete.id, none, complete)).toBe(false);
    expect(isStepDone(p, accept.id, none, accept)).toBe(true);
    expect(p.steps[accept.id]).toEqual({ done: true, at: 5 });
  });

  it("manual turn-in of quest A does not satisfy a different quest accept on the same step", () => {
    const mixed = step({
      id: "silverpine-11-15:038",
      actions: [
        { type: "turnin", questId: 1359, label: "Turn in" },
        { type: "accept", questId: 1358, label: "Accept" },
      ],
    });
    // Marking 1359 done (as sync would) without a log snapshot: accept 1358 still open.
    const p = profile({ quests: { 1359: "done" } });
    expect(isStepDone(p, mixed.id, () => [], mixed)).toBe(false);
    expect(stepStatus(p, mixed, () => []).status).toBe("open");
  });
});

describe("mixed-step regressions", () => {
  const none = () => [] as const;

  it("silverpine-11-15:038 / :sr16 — turnin 1359 + accept 1358 stays OPEN when only 1359 is done", () => {
    const mixed = step({
      id: "silverpine-11-15:038",
      actions: [
        { type: "turnin", questId: 1359, label: "Turn in Zombies" },
        { type: "accept", questId: 1358, label: "Accept Sample" },
      ],
    });
    const p = profile({ quests: { 1359: "done" } });
    expect(isStepDone(p, mixed.id, none, mixed)).toBe(false);
    // With a known log that does not include 1358, still open (accept not done / not in log).
    const withLog = profile({
      quests: { 1359: "done" },
      questLog: [],
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(isStepDone(withLog, mixed.id, none, mixed)).toBe(false);
    expect(stepStatus(withLog, mixed, none).status).toBe("open");
  });

  it("durotar-1-12:076 — complete 784 AND 96822 stays OPEN when only 784 is done", () => {
    const mixed = step({
      id: "durotar-1-12:076",
      actions: [
        { type: "complete", questId: 784, objective: 1, label: "Complete A" },
        { type: "complete", questId: 96822, objective: 1, label: "Complete B" },
      ],
    });
    const p = profile({ quests: { 784: "done" } });
    expect(isStepDone(p, mixed.id, none, mixed)).toBe(false);
  });

  it("dungeons:ragefire-chasm:run — complete 5723, 5728 + collect 5761 stays OPEN when only 5723 is done", () => {
    const mixed = step({
      id: "dungeons:ragefire-chasm:run",
      actions: [
        { type: "complete", questId: 5723, objective: 1, label: "A" },
        { type: "complete", questId: 5728, objective: 1, label: "B" },
        { type: "collect", itemId: 1, count: 1, questId: 5761, label: "C" },
      ],
    });
    const p = profile({ quests: { 5723: "done" } });
    expect(isStepDone(p, mixed.id, none, mixed)).toBe(false);
  });

  it("accept needs in_log when a snapshot exists; complete needs ready", () => {
    const acceptStep = step({
      id: "g:a",
      actions: [{ type: "accept", questId: 10, label: "A" }],
    });
    const completeStep = step({
      id: "g:c",
      actions: [{ type: "complete", questId: 10, objective: 1, label: "C" }],
    });
    const inLog = profile({
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
      questLog: [{ questId: 10, complete: 0 }],
    });
    expect(isStepDone(inLog, acceptStep.id, none, acceptStep)).toBe(true);
    expect(isStepDone(inLog, completeStep.id, none, completeStep)).toBe(false);
    const ready = profile({
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
      questLog: [{ questId: 10, complete: 1 }],
    });
    expect(isStepDone(ready, completeStep.id, none, completeStep)).toBe(true);
    expect(isStepDone(ready, acceptStep.id, none, acceptStep)).toBe(true);
  });

  it("{skipped:true} stays not done even if the quest is done", () => {
    const p = profile({
      quests: { 788: "done" },
      steps: { [accept.id]: { skipped: true, at: 1 } },
    });
    expect(isStepDone(p, accept.id, stepsForQuest, accept)).toBe(false);
  });

  it("stepStatus: complete/turnin is open when an earlier step on the viewed route accepts the quest", () => {
    const acceptBal = step({
      id: "g:a",
      n: 1,
      routes: ["balanced"],
      actions: [
        { type: "goto", at: { mapId: 1, x: 1, y: 1, zone: "Silverpine Forest", exact: true } },
        { type: "accept", questId: 425, label: "Ivar" },
      ],
    });
    const completeStep = step({
      id: "g:c",
      n: 2,
      routes: ["balanced"],
      actions: [{ type: "complete", questId: 425, objective: 1, label: "C" }],
    });
    const turnin = step({
      id: "g:t",
      n: 3,
      routes: ["balanced"],
      actions: [{ type: "turnin", questId: 425, label: "T" }],
    });
    const speedOnly = step({
      id: "g:spd",
      n: 1,
      routes: ["speedrun"],
      actions: [{ type: "accept", questId: 425, label: "Ivar" }],
    });
    const logged = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    const route = { route: "balanced" as const, steps: [acceptBal, completeStep, turnin] };
    expect(stepStatus(logged, turnin, () => [], undefined, route).status).toBe("open");
    expect(stepStatus(logged, completeStep, () => [], undefined, route).status).toBe("open");
    expect(closestPriorAcceptStepId(425, turnin.id, route)).toBe(acceptBal.id);
    expect(
      stepStatus(logged, turnin, () => [], undefined, { route: "balanced", steps: [speedOnly, turnin] }).status,
    ).toBe("blocked");
    expect(
      stepStatus(logged, turnin, () => [], undefined, { route: "balanced", steps: [turnin, acceptBal] }).status,
    ).toBe("blocked");
  });

  it("stepStatus: unmet prerequisite still blocks when this quest was accepted earlier", () => {
    const acceptBal = step({
      id: "g:a",
      n: 1,
      actions: [{ type: "accept", questId: 425, label: "Ivar" }],
    });
    const turnin = step({
      id: "g:t",
      n: 2,
      actions: [{ type: "turnin", questId: 425, label: "T" }],
    });
    const info: QuestInfo = {
      id: 425,
      name: "Ivar the Foul",
      level: 12,
      reqLevel: 10,
      races: 0,
      classes: 0,
      custom: false,
      start: [],
      end: [],
      objectivesText: [],
      objectives: [],
      pre: { group: [], single: [99] },
      exclusiveTo: [],
      repeatable: false,
      inGuides: [],
    };
    const logged = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    expect(
      stepStatus(logged, turnin, () => [], { 425: info }, { route: "balanced", steps: [acceptBal, turnin] }),
    ).toEqual({ status: "blocked", missing: [99] });
  });

  const ivarInfo = (): QuestInfo => ({
    id: 425,
    name: "Ivar the Foul",
    level: 12,
    reqLevel: 10,
    races: 0,
    classes: 0,
    custom: false,
    start: [],
    end: [],
    objectivesText: [],
    objectives: [],
    pre: { group: [], single: [91921] },
    exclusiveTo: [],
    repeatable: false,
    inGuides: [],
  });

  it("stepStatus: follow-up stays open when the route already turned in the unmet prerequisite", () => {
    const prereqTurnin = step({
      id: "silverpine-11-15:029",
      n: 29,
      routes: ["balanced"],
      actions: [{ type: "turnin", questId: 91921, label: "Return to Quinn (Again)" }],
    });
    const acceptFollow = step({
      id: "silverpine-11-15:030",
      n: 30,
      routes: ["balanced"],
      actions: [{ type: "accept", questId: 425, label: "Ivar the Foul" }],
    });
    const completeFollow = step({
      id: "silverpine-11-15:031",
      n: 31,
      routes: ["balanced"],
      actions: [{ type: "complete", questId: 425, objective: 1, label: "Kill Ivar" }],
    });
    const turninFollow = step({
      id: "silverpine-11-15:032",
      n: 32,
      routes: ["balanced"],
      actions: [{ type: "turnin", questId: 425, label: "Ivar the Foul" }],
    });
    const logged = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    const route = {
      route: "balanced" as const,
      steps: [prereqTurnin, acceptFollow, completeFollow, turninFollow],
    };
    const quests = { 425: ivarInfo() };
    expect(routeTurnsInByStep(91921, acceptFollow.id, route)).toBe(true);
    expect(stepStatus(logged, acceptFollow, () => [], quests, route).status).toBe("open");
    expect(stepStatus(logged, completeFollow, () => [], quests, route).status).toBe("open");
    expect(stepStatus(logged, turninFollow, () => [], quests, route).status).toBe("open");
    const sameCard = step({
      id: "g:same",
      n: 1,
      actions: [
        { type: "turnin", questId: 91921, label: "Quinn" },
        { type: "accept", questId: 425, label: "Ivar" },
      ],
    });
    const sameRoute = { route: "balanced" as const, steps: [sameCard] };
    expect(routeTurnsInByStep(91921, sameCard.id, sameRoute)).toBe(true);
    const prereqInLog = profile({
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
      questLog: [{ questId: 91921, complete: 1 }],
    });
    expect(stepStatus(prereqInLog, sameCard, () => [], quests, sameRoute).status).toBe("open");
  });

  it("stepStatus: follow-up accept stays blocked when the prerequisite turn-in is later", () => {
    const acceptFollow = step({
      id: "g:accept",
      n: 1,
      routes: ["balanced"],
      actions: [{ type: "accept", questId: 425, label: "Ivar" }],
    });
    const prereqTurnin = step({
      id: "g:pre",
      n: 2,
      routes: ["balanced"],
      actions: [{ type: "turnin", questId: 91921, label: "Quinn" }],
    });
    const logged = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    const route = { route: "balanced" as const, steps: [acceptFollow, prereqTurnin] };
    expect(routeTurnsInByStep(91921, acceptFollow.id, route)).toBe(false);
    expect(stepStatus(logged, acceptFollow, () => [], { 425: ivarInfo() }, route)).toEqual({
      status: "blocked",
      missing: [91921],
    });
  });

  it("stepStatus: follow-up stays blocked when the route never turns in the prerequisite", () => {
    const prereqAccept = step({
      id: "g:pre-a",
      n: 1,
      routes: ["balanced"],
      actions: [{ type: "accept", questId: 91921, label: "Quinn" }],
    });
    const acceptFollow = step({
      id: "g:accept",
      n: 2,
      routes: ["balanced"],
      actions: [{ type: "accept", questId: 425, label: "Ivar" }],
    });
    const otherRouteTurnin = step({
      id: "g:spd",
      n: 1,
      routes: ["speedrun"],
      actions: [{ type: "turnin", questId: 91921, label: "Quinn" }],
    });
    const logged = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    const route = { route: "balanced" as const, steps: [prereqAccept, acceptFollow] };
    expect(stepStatus(logged, acceptFollow, () => [], { 425: ivarInfo() }, route)).toEqual({
      status: "blocked",
      missing: [91921],
    });
    expect(
      stepStatus(logged, acceptFollow, () => [], { 425: ivarInfo() }, {
        route: "balanced",
        steps: [otherRouteTurnin, acceptFollow],
      }),
    ).toEqual({ status: "blocked", missing: [91921] });
  });

  it("stepStatus: complete not in a known log is blocked; in_log but not ready stays open", () => {
    const s = step({
      id: "g:c",
      actions: [{ type: "complete", questId: 10, objective: 1, label: "C" }],
    });
    const blocked = profile({ questLog: [], questLogSyncedAt: "2026-01-01T00:00:00.000Z" });
    expect(stepStatus(blocked, s, () => [])).toEqual({ status: "blocked", missing: [10] });
    const open = profile({
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
      questLog: [{ questId: 10, complete: 0 }],
    });
    expect(stepStatus(open, s, () => []).status).toBe("open");
  });

  it("exclusive sibling already done => isStepDone false and stepStatus not_applicable", () => {
    const exclusiveStep = step({
      id: "g:exclusive",
      actions: [{ type: "accept", questId: 10, label: "Accept A" }],
    });
    const questInfo: QuestInfo = {
      id: 10,
      name: "Q10",
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
      exclusiveTo: [11],
      repeatable: false,
      inGuides: [],
    };
    const quests = { 10: questInfo };
    const p = profile({ quests: { 11: "done" } });
    expect(isStepDone(p, exclusiveStep.id, none, exclusiveStep, quests)).toBe(false);
    expect(stepStatus(p, exclusiveStep, none, quests).status).toBe("not_applicable");
  });

  it("is done from a marked quest without a lookup, and not done when an exclusive sibling is also done", () => {
    const none = () => [];
    const exclusiveStep = step({
      id: "g:marked-excluded",
      actions: [{ type: "accept", questId: 10, label: "Accept A" }],
    });
    const questInfo: QuestInfo = {
      id: 10,
      name: "Q10",
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
      exclusiveTo: [11],
      repeatable: false,
      inGuides: [],
    };
    const p = profile({ quests: { 10: "done", 11: "done" } });
    expect(isQuestExcluded(questInfo, p)).toBe(true);
    // No catalog: a marked quest still counts as done.
    expect(isStepDone(p, exclusiveStep.id, none, exclusiveStep)).toBe(true);
    // With a lookup, an exclusiveTo sibling that is also done means this step is not done.
    expect(isStepDone(p, exclusiveStep.id, none, exclusiveStep, { 10: questInfo })).toBe(false);
    expect(stepStatus(p, exclusiveStep, none, { 10: questInfo }).status).toBe("not_applicable");
  });

  it("mutually exclusive pair both completed is not done for either step", () => {
    const quest = (id: number, exclusiveTo: number[]): QuestInfo => ({
      id,
      name: `Q${id}`,
      level: 1,
      reqLevel: 1,
      races: 0,
      classes: 0,
      custom: true,
      start: [{ kind: "npc", id: 1, name: "NPC", at: [] }],
      end: [],
      objectivesText: [],
      objectives: [],
      pre: { group: [], single: [] },
      exclusiveTo,
      repeatable: false,
      inGuides: [],
    });
    const quests = {
      96652: quest(96652, [96638]),
      96638: quest(96638, [96652]),
    };
    const stepA = step({
      id: "durotar-1-12:156",
      actions: [{ type: "accept", questId: 96652, label: "Accept A" }],
    });
    const stepB = step({
      id: "zephras-isle:055",
      actions: [{ type: "turnin", questId: 96638, label: "Turn in B" }],
    });
    const p = profile({ quests: { 96652: "done", 96638: "done" } });
    expect(isStepDone(p, stepA.id, none, stepA, quests)).toBe(false);
    expect(isStepDone(p, stepB.id, none, stepB, quests)).toBe(false);
    expect(stepStatus(p, stepA, none, quests).status).toBe("not_applicable");
    expect(stepStatus(p, stepB, none, quests).status).toBe("not_applicable");
  });

  it("breadcrumb completed with its target completed stays done", () => {
    const breadcrumb: QuestInfo = {
      id: 363,
      name: "Rude Awakening",
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
      breadcrumbFor: 364,
      repeatable: false,
      inGuides: [],
    };
    const target: QuestInfo = {
      id: 364,
      name: "The Mindless Ones",
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
    };
    const quests = { 363: breadcrumb, 364: target };
    const crumb = step({
      id: "tirisfal:breadcrumb",
      actions: [{ type: "turnin", questId: 363, label: "Turn in Rude Awakening" }],
    });
    const p = profile({ quests: { 363: "done", 364: "done" } });
    expect(isQuestExcluded(breadcrumb, p)).toBe(true);
    expect(isStepDone(p, crumb.id, none, crumb, quests)).toBe(true);
    expect(stepStatus(p, crumb, none, quests).status).toBe("done");
  });

  it("auto-completes fp and home, and leaves accept open when the log is unknown", () => {
    const fp = step({
      id: "g:fp",
      actions: [{ type: "fp", label: "Stonetalon Mountains flight path", place: "Stonetalon Mountains" }],
    });
    const home = step({
      id: "g:home",
      actions: [{ type: "home", label: "Set your hearth", place: "The Crossroads" }],
    });
    const hs = step({
      id: "g:hs",
      actions: [{ type: "hs", label: "Hearth", place: "The Crossroads" }],
    });
    const known = profile({
      flightPaths: [{ id: 29, name: "Sun Rock Retreat, Stonetalon Mountains", mapId: 1442 }],
      hearth: "Crossroads, The Barrens",
    });
    expect(isStepDone(known, fp.id, none, fp)).toBe(true);
    expect(isStepDone(known, home.id, none, home)).toBe(true);
    expect(isStepDone(known, hs.id, none, hs)).toBe(false);
    expect(isStepDone(profile(), fp.id, none, fp)).toBe(false);

    const acceptStep = step({
      id: "g:a",
      actions: [{ type: "accept", questId: 788, label: "Accept Cutting Teeth" }],
    });
    const unknown = profile({ questLog: [] });
    expect(isStepDone(unknown, acceptStep.id, none, acceptStep)).toBe(false);
    expect(stepStatus(unknown, acceptStep, none).status).toBe("open");
    const inLog = profile({
      questLogSyncedAt: "2026-01-01T00:00:00.000Z",
      questLog: [{ questId: 788, complete: 0 }],
    });
    expect(isStepDone(inLog, acceptStep.id, none, acceptStep)).toBe(true);
  });

  it("treats not_applicable like done only for the stop check", () => {
    expect(stopIsComplete(["a", "b"], (id) => id === "a", (id) => id === "b")).toBe(true);
    expect(stopIsComplete(["a", "b"], () => false, (id) => id === "b")).toBe(false);
    expect(stopIsComplete([], () => true, () => true)).toBe(false);
  });

  it("counts a ticked step only for the sub-pack that contains it", () => {
    const a = step({ id: "horde-20-40:a" });
    const b = step({ id: "horde-20-40:b" });
    const p = profile({ steps: { [a.id]: { done: true, at: 1 }, [b.id]: { done: true, at: 1 } } });
    const none = () => [];
    expect(countDoneForGuide(p, "horde-20-40-01-barrens-a", none, [a, b], undefined, new Set([a.id]))).toBe(1);
    expect(countDoneForGuide(p, "horde-20-40-04-needles", none, [a, b], undefined, new Set([b.id]))).toBe(1);
    expect(countDoneForGuide(p, "horde-20-40-04-needles", none, [a, b], undefined, new Set([b.id]))).not.toBe(2);
  });

  it("indexes match a full-route scan for prior accept and turn-in", () => {
    const acceptBal = step({
      id: "g:a",
      n: 1,
      routes: ["balanced"],
      actions: [{ type: "accept", questId: 425, label: "Ivar" }],
    });
    const completeStep = step({
      id: "g:c",
      n: 2,
      routes: ["balanced"],
      actions: [{ type: "complete", questId: 425, objective: 1, label: "C" }],
    });
    const turnin = step({
      id: "g:t",
      n: 3,
      routes: ["balanced"],
      actions: [{ type: "turnin", questId: 425, label: "T" }],
    });
    const route = { route: "balanced" as const, steps: [acceptBal, completeStep, turnin] };
    const indexes = buildStepIndexes([acceptBal, completeStep, turnin], new Map([["g", new Set([acceptBal.id, completeStep.id, turnin.id])]]));
    expect(closestPriorAcceptStepId(425, turnin.id, route, indexes)).toBe(acceptBal.id);
    expect(closestPriorAcceptStepId(425, turnin.id, route)).toBe(acceptBal.id);
    expect(routeTurnsInByStep(425, turnin.id, route, indexes)).toBe(true);
    expect(routeTurnsInByStep(425, completeStep.id, route, indexes)).toBe(false);
    expect(routeTurnsInByStep(425, completeStep.id, route)).toBe(false);
  });
});
