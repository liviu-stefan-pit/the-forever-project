import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Guide, QuestInfo, Step } from "../data/schema";
import { ProgressRing } from "../components/ui/ProgressRing";
import { createMemoryStorage, createProfileEngine } from "./profileStore";
import { guideCompletion, guideListFraction } from "./position";
import { createDefaultEvaluator, createProfileEvaluator } from "./visibility";

function step(id: string, questId: number, extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [],
    actions: [{ type: "turnin", questId, label: "Turn in" }],
    conditions: [],
    ...extra,
  };
}

function guide(slug: string, steps: Step[]): Guide {
  return {
    slug,
    name: slug,
    displayName: slug,
    subgroup: "Test",
    minLevel: 1,
    maxLevel: 10,
    zones: ["Test zone"],
    source: "builtin",
    sections: [],
    steps,
  };
}

describe("guide list completion", () => {
  it("is 1 for every loaded guide whose quests are done, not just one slug", () => {
    const first = guide("alpha-route", [step("alpha-route:a", 100), step("alpha-route:b", 100)]);
    const second = guide("beta-route", [step("beta-route:a", 200)]);
    const engine = createProfileEngine({
      storage: createMemoryStorage(),
      now: () => 1000,
      id: () => "p1",
    });
    engine.create({ name: "A", race: "Orc", cls: "Warrior" });
    engine.markQuestsDone([100, 200]);
    engine.setKnownSteps([...first.steps, ...second.steps]);
    const vis = createDefaultEvaluator("balanced");
    const isDone = (id: string) => engine.isDone(id);

    expect(guideListFraction(first, isDone, vis)).toBe(1);
    expect(guideListFraction(second, isDone, vis)).toBe(1);
    expect(guideCompletion(first, isDone, vis)).toEqual({ done: 2, total: 2 });
    expect(guideCompletion(second, isDone, vis)).toEqual({ done: 1, total: 1 });
  });

  it("does not treat an unloaded guide as fraction 0", () => {
    const vis = createDefaultEvaluator("balanced");
    expect(guideListFraction(undefined, () => true, vis)).toBeUndefined();
    const unknown = renderToStaticMarkup(createElement(ProgressRing, { value: undefined }));
    const zero = renderToStaticMarkup(createElement(ProgressRing, { value: 0 }));
    expect(unknown).toContain('data-progress="unknown"');
    expect(unknown).not.toContain('data-progress="0"');
    expect(zero).toContain('data-progress="0"');
  });

  it("counts steps hidden only as done and skips steps hidden for another reason", () => {
    const finished = step("any-guide:done", 1);
    const otherClass = step("any-guide:mage", 1, { classes: ["Mage"] });
    const g = guide("any-guide", [finished, otherClass]);
    const vis = createProfileEvaluator({
      race: "Orc",
      cls: "Warrior",
      routeStyle: "balanced",
      hideDone: true,
      isDone: () => true,
    });
    expect(vis.step(finished)).toEqual({ visible: false, reason: "done" });
    expect(vis.step(otherClass).reason).toBe("filter");
    expect(guideCompletion(g, () => true, vis)).toEqual({ done: 1, total: 1 });
    expect(guideListFraction(g, () => true, vis)).toBe(1);
  });

  it("counts a completed exclusive as done without a catalog, and not when a sibling is also done", () => {
    const g = guide("alpha-route", [step("alpha-route:a", 10)]);
    const engine = createProfileEngine({
      storage: createMemoryStorage(),
      now: () => 1000,
      id: () => "p1",
    });
    engine.create({ name: "A", race: "Orc", cls: "Warrior" });
    engine.markQuestsDone([10, 11]);
    engine.setKnownSteps(g.steps);
    const vis = createDefaultEvaluator("balanced");
    const quests: Record<number, QuestInfo> = {
      10: {
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
      },
    };
    expect(guideCompletion(g, (id) => engine.isDone(id), vis)).toEqual({ done: 1, total: 1 });
    expect(guideListFraction(g, (id) => engine.isDone(id), vis)).toBe(1);
    expect(guideCompletion(g, (id) => engine.isDone(id, quests), vis)).toEqual({ done: 0, total: 1 });
    expect(guideListFraction(g, (id) => engine.isDone(id, quests), vis)).toBe(0);
  });

  it("does not count an uncompleted exclusive as done when a sibling is already taken", () => {
    const g = guide("alpha-route", [step("alpha-route:a", 10)]);
    const engine = createProfileEngine({
      storage: createMemoryStorage(),
      now: () => 1000,
      id: () => "p1",
    });
    engine.create({ name: "A", race: "Orc", cls: "Warrior" });
    engine.markQuestsDone([11]);
    engine.setKnownSteps(g.steps);
    const vis = createDefaultEvaluator("balanced");
    const quests: Record<number, QuestInfo> = {
      10: {
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
      },
    };
    expect(guideCompletion(g, (id) => engine.isDone(id), vis)).toEqual({ done: 0, total: 1 });
    expect(guideCompletion(g, (id) => engine.isDone(id, quests), vis)).toEqual({ done: 0, total: 1 });
    expect(guideListFraction(g, (id) => engine.isDone(id, quests), vis)).toBe(0);
  });
});
