import { describe, expect, it } from "vitest";
import type { QuestInfo, Step } from "../data/schema";
import type { MapPoint } from "../data/schema";
import { buildBlockedBanner, findAcceptStepId } from "./blockedBanner";

function quest(partial: Partial<QuestInfo> & { id: number; name: string }): QuestInfo {
  return {
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

function step(id: string, actions: Step["actions"]): Step {
  return { id, n: 1, tags: {}, text: [], actions, conditions: [] };
}

describe("findAcceptStepId / buildBlockedBanner", () => {
  const accept = step("silverpine-11-15:a1358", [{ type: "accept", questId: 1358, label: "Accept" }]);
  const turnin = step("silverpine-11-15:t1358", [{ type: "turnin", questId: 1358, label: "Turn in" }]);
  const byId = new Map<string, Step>([
    [accept.id, accept],
    [turnin.id, turnin],
  ]);
  const stepsForQuest = (qid: number) => (qid === 1358 ? [turnin.id, accept.id] : []);

  it("picks the accept step, preferring the current guide slug", () => {
    expect(findAcceptStepId(1358, stepsForQuest, (id) => byId.get(id), "silverpine-11-15")).toBe(accept.id);
  });

  it("formats banner copy with NPC and zone, and marks missing accept as not in guide", () => {
    const catalog = {
      1: quest({
        id: 1,
        name: "Sample for Helcular",
        zone: "Silverpine Forest",
        start: [{ kind: "npc", id: 10, name: "Apothecary Renferrel", at: [] }],
      }),
      2: quest({ id: 2, name: "Orphan Quest", start: [] }),
    };
    const model = buildBlockedBanner(
      [1, 2],
      catalog,
      (qid) => (qid === 1 ? [accept.id] : []),
      (id) => (id === accept.id ? accept : undefined),
      "other-guide",
    );
    expect(model.entries[0]!.detail).toBe(
      "pick up/finish Sample for Helcular first (Apothecary Renferrel, Silverpine Forest)",
    );
    expect(model.entries[0]!.notInGuide).toBe(true);
    expect(model.entries[1]!.notInGuide).toBe(true);
    expect(model.text).toContain("Blocked:");
    expect(model.text).toContain("not in this guide");
  });

  it("links the closest accept before this step and prefers that step's goto zone", () => {
    const at = (zone: string): MapPoint => ({ mapId: 1, x: 1, y: 1, zone, exact: true });
    const first = step("silverpine-11-15:early", [
      { type: "goto", at: at("Tirisfal Glades") },
      { type: "accept", questId: 425, label: "Ivar" },
    ]);
    first.pins = [{ kind: "npc", npcId: 1, name: "Early NPC", at: { mapId: 1, zone: "Tirisfal Glades", x: 1, y: 1 }, sources: [], verified: false }];
    const closer = step("silverpine-11-15:030", [
      { type: "goto", at: at("Silverpine Forest") },
      { type: "accept", questId: 425, label: "Ivar" },
    ]);
    const turnin = step("silverpine-11-15:turnin", [{ type: "turnin", questId: 425, label: "Turn in" }]);
    const later = step("silverpine-11-15:later", [{ type: "accept", questId: 425, label: "Ivar" }]);
    const speed = step("silverpine-11-15:spd", [{ type: "accept", questId: 425, label: "Ivar" }]);
    speed.routes = ["speedrun"];
    const steps = [first, speed, closer, turnin, later];
    const byId = new Map(steps.map((s) => [s.id, s]));
    const route = { route: "balanced" as const, steps };
    const catalog = {
      425: quest({
        id: 425,
        name: "Ivar the Foul",
        zone: "Hillsbrad",
        start: [{ kind: "npc", id: 1950, name: "Rane Yorick", at: [] }],
      }),
    };
    const model = buildBlockedBanner(
      [425],
      catalog,
      (qid) => (qid === 425 ? steps.map((s) => s.id) : []),
      (id) => byId.get(id),
      "silverpine-11-15",
      { beforeStepId: turnin.id, route },
    );
    expect(model.entries[0]!.acceptStepId).toBe(closer.id);
    expect(model.entries[0]!.detail).toBe("pick up/finish Ivar the Foul first (Rane Yorick, Silverpine Forest)");
    expect(model.entries[0]!.notInGuide).toBe(false);
    const onlyAfter = buildBlockedBanner(
      [425],
      catalog,
      () => [later.id],
      (id) => byId.get(id),
      "silverpine-11-15",
      { beforeStepId: turnin.id, route: { route: "balanced", steps: [turnin, later] } },
    );
    expect(onlyAfter.entries[0]!.acceptStepId).toBeUndefined();
    expect(onlyAfter.entries[0]!.notInGuide).toBe(false);
  });

  it("links when an accept step resolves in the guide", () => {
    const catalog = { 1358: quest({ id: 1358, name: "Sample", zone: "Silverpine Forest" }) };
    const model = buildBlockedBanner([1358], catalog, stepsForQuest, (id) => byId.get(id), "silverpine-11-15");
    expect(model.entries[0]).toMatchObject({ acceptStepId: accept.id, notInGuide: false });
    expect(model.text).toBe("Blocked: pick up/finish Sample first (NPC, Silverpine Forest)");
  });
});
