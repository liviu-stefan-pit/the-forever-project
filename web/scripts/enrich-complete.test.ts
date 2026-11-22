import { describe, expect, it } from "vitest";
import type { QuestInfo, Step } from "../../contracts/schema.ts";
import { enrichCompleteSteps, formatCoord, howToSentence, isGenericQuestStep, objectiveSentence } from "./enrich-complete.ts";

const at = (x: number, y: number) => ({ mapId: 1421, x, y, zone: "Silverpine Forest", exact: true as const });

describe("howToSentence", () => {
  it("formats a coordinate to one decimal", () => {
    expect(formatCoord(51.52, 13.9)).toBe("51.5, 13.9");
  });

  it("builds the Ivar the Foul loot line from the item drop and spawn", () => {
    const sentence = howToSentence([
      {
        kind: "item",
        id: 3621,
        name: "Ivar's Head",
        at: [at(51.52, 13.9)],
        drops: [{ npcId: 1971, name: "Ivar the Foul" }],
      },
    ]);
    expect(sentence).toBe("Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head");
  });

  it("omits coordinates that are not on the objective", () => {
    expect(objectiveSentence({ kind: "kill", name: "Murloc", at: [] })).toBe("Kill Murloc");
  });

  it("uses a count only when the objective carries one", () => {
    expect(objectiveSentence({ kind: "kill", name: "Young Stranglethorn Tiger", count: 10, at: [at(40, 50)] })).toBe(
      "Kill 10 Young Stranglethorn Tiger (40.0, 50.0)",
    );
  });

  it("does not repeat a kill already named as the item's drop source", () => {
    const sentence = howToSentence([
      { kind: "kill", name: "Ivar the Foul", at: [at(51.52, 13.9)] },
      {
        kind: "item",
        name: "Ivar's Head",
        at: [at(51.52, 13.9)],
        drops: [{ npcId: 1971, name: "Ivar the Foul" }],
      },
    ]);
    expect(sentence).toBe("Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head");
  });

  it("joins separate objectives", () => {
    const sentence = howToSentence([
      { kind: "kill", name: "Tidehunter", count: 7, at: [] },
      { kind: "object", name: "Supply Crate", at: [at(10.14, 20)] },
    ]);
    expect(sentence).toBe("Kill 7 Tidehunter. Use Supply Crate (10.1, 20.0)");
  });
});

function step(text: string, actions: Step["actions"]): Step {
  return {
    id: "s",
    n: 1,
    tags: {},
    text: [{ segments: [{ t: text }] }],
    actions,
    conditions: [],
    sources: [],
    verified: true,
    tips: [{ kind: "general", text: "hand written", sources: [], verified: true }],
  };
}

const ivar: QuestInfo = {
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
  objectives: [
    {
      kind: "item",
      name: "Ivar's Head",
      at: [at(51.52, 13.9)],
      drops: [{ npcId: 1971, name: "Ivar the Foul" }],
    },
  ],
  pre: { group: [], single: [] },
  exclusiveTo: [],
  repeatable: false,
  inGuides: [],
};

describe("enrichCompleteSteps", () => {
  it("appends the how-to onto a generic complete step and leaves tips alone", () => {
    const s = step("Complete Ivar the Foul", [{ type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" }]);
    expect(isGenericQuestStep(s, "Ivar the Foul")).toBe(true);
    expect(enrichCompleteSteps([s], [ivar])).toBe(1);
    expect(s.text.map((l) => l.segments.map((x) => x.t).join(""))).toEqual([
      "Complete Ivar the Foul",
      "Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head",
    ]);
    expect(s.tips?.[0]?.text).toBe("hand written");
  });

  it("leaves a step that already describes the objective unchanged", () => {
    const s = step("Complete Ivar the Foul by killing him in the patch", [
      { type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" },
    ]);
    expect(enrichCompleteSteps([s], [ivar])).toBe(0);
    expect(s.text).toHaveLength(1);
  });
});
