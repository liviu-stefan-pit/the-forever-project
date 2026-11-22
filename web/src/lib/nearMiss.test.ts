import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Guide, Insights, QuestInfo } from "../data/schema";
import { stepQuestIds } from "./actions";
import { nearMissCoords, nearMissesInSection, nearMissRowsByStep } from "./nearMiss";

const insights = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/insights.json", import.meta.url)), "utf-8"),
) as Insights;
const guide = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/guides/1-6-durotar.json", import.meta.url)), "utf-8"),
) as Guide;
const quests = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/quests.json", import.meta.url)), "utf-8"),
) as QuestInfo[];
const byId = new Map(quests.map((q) => [q.id, q]));

describe("nearMissesInSection", () => {
  it("keeps only misses whose insertAfterStep is in the section", () => {
    const miss = insights.nearMisses["1-6-durotar"]![0]!;
    const inSection = new Set(guide.steps.map((s) => s.id));
    expect(nearMissesInSection(insights.nearMisses["1-6-durotar"], inSection)).toEqual([miss]);
    expect(nearMissesInSection(insights.nearMisses["1-6-durotar"], new Set(["other"]))).toEqual([]);
    expect(nearMissesInSection(undefined, inSection)).toEqual([]);
  });
});

describe("nearMissRowsByStep", () => {
  it("inserts a compact row only when the profile added it and the guide has no step", () => {
    const miss = insights.nearMisses["1-6-durotar"]![0]!;
    const existing = new Set(guide.steps.flatMap(stepQuestIds));
    expect(existing.has(miss.questId)).toBe(false);

    const idle = nearMissRowsByStep([miss], [], existing);
    expect(idle.size).toBe(0);

    const added = nearMissRowsByStep([miss], [miss.questId], existing);
    expect(added.get(miss.insertAfterStep)?.map((m) => m.questId)).toEqual([miss.questId]);

    const alreadyInGuide = nearMissRowsByStep([miss], [miss.questId], new Set([miss.questId]));
    expect(alreadyInGuide.size).toBe(0);
  });
});

describe("nearMissCoords", () => {
  it("uses the quest record coordinates when present", () => {
    const q = byId.get(788)!;
    const at = nearMissCoords(q);
    expect(at).toMatchObject({ zone: "Durotar", x: expect.any(Number), y: expect.any(Number) });
    expect(nearMissCoords(undefined)).toBeUndefined();
  });
});
