import { describe, expect, it } from "vitest";
import type { Action, MapPoint, Step } from "../../contracts/schema.ts";
import {
  compactSteps,
  isGenericVisit,
  mergeKind,
  type CompactQuest,
} from "./compact-steps.ts";

const at = (x: number, y: number, zone = "Silverpine Forest", mapId = 1421): MapPoint => ({
  mapId,
  x,
  y,
  zone,
  exact: true,
});

function step(id: string, text: string, actions: Action[], extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [{ segments: [{ t: text }] }],
    actions,
    conditions: [],
    sources: [],
    verified: true,
    ...extra,
  };
}

const goto = (x: number, y: number): Action => ({ type: "goto", at: at(x, y) });

const rane = { x: 53.5, y: 13.4 };
const ivar = { x: 51.5, y: 13.9 };
const sepulcherA = { x: 44.2, y: 39.8 };
const sepulcherB = { x: 43.4, y: 40.9 };

const quests: CompactQuest[] = [
  { id: 428, name: "Lost Deathstalkers", next: 429, objectives: [] },
  { id: 429, name: "Wild Hearts", next: 430, objectives: [] },
  { id: 435, name: "Escorting Erland", next: 449, objectives: [] },
  { id: 449, name: "The Deathstalkers' Report", objectives: [] },
  { id: 425, name: "Ivar the Foul", objectives: [{ kind: "item", name: "Ivar's Head", at: [at(ivar.x, ivar.y)] }] },
  { id: 421, name: "Prove Your Worth", objectives: [] },
  { id: 477, name: "Border Crossings", objectives: [] },
];

const catalog = new Map(quests.map((q) => [q.id, q]));

describe("isGenericVisit", () => {
  it("accepts the Accept/Turn-in/Complete templates", () => {
    expect(
      isGenericVisit(step("a", "Accept Wild Hearts from Rane Yorick", [goto(rane.x, rane.y), { type: "accept", questId: 429, label: "Wild Hearts" }])),
    ).toBe(true);
    expect(
      isGenericVisit(step("t", "Turn in Ivar the Foul to Rane Yorick", [goto(rane.x, rane.y), { type: "turnin", questId: 425, label: "Ivar the Foul" }])),
    ).toBe(true);
    expect(
      isGenericVisit(step("c", "Complete Ivar the Foul", [{ type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" }])),
    ).toBe(true);
  });

  it("allows a how-to line on a complete card", () => {
    const s = step("c", "Complete Ivar the Foul", [{ type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" }]);
    s.text.push({ segments: [{ t: "Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head" }] });
    expect(isGenericVisit(s)).toBe(true);
  });

  it("rejects extra notes after the NPC", () => {
    expect(
      isGenericVisit(
        step("a", "Accept Supplying the Sepulcher from Deathguard Podrig, then turn it in to Karos Razok", [
          goto(43.4, 41.7),
          { type: "accept", questId: 6321, label: "Supplying the Sepulcher" },
        ]),
      ),
    ).toBe(false);
  });
});

describe("mergeKind", () => {
  it("merges back-to-back accepts at the same hub", () => {
    const a = step("s:1", "Accept Prove Your Worth from Dalar Dawnweaver", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "accept", questId: 421, label: "Prove Your Worth" },
    ]);
    const b = step("s:2", "Accept Lost Deathstalkers from High Executor Hadrec", [
      goto(sepulcherB.x, sepulcherB.y),
      { type: "accept", questId: 428, label: "Lost Deathstalkers" },
    ]);
    expect(mergeKind(a, b, catalog)).toBe("accept");
  });

  it("does not merge accepts whose gotos are farther than 1.5%", () => {
    const a = step("s:1", "Accept Wild Hearts from Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "accept", questId: 429, label: "Wild Hearts" },
    ]);
    const b = step("s:2", "Accept Escorting Erland from Deathstalker Erland", [
      goto(56.2, 9.2),
      { type: "accept", questId: 435, label: "Escorting Erland" },
    ]);
    expect(mergeKind(a, b, catalog)).toBeNull();
  });

  it("does not merge a balanced-only step with a speedrun-only step", () => {
    const a = step(
      "s:1",
      "Accept Prove Your Worth from Dalar Dawnweaver",
      [goto(sepulcherA.x, sepulcherA.y), { type: "accept", questId: 421, label: "Prove Your Worth" }],
      { routes: ["balanced"] },
    );
    const b = step(
      "s:2",
      "Accept Lost Deathstalkers from High Executor Hadrec",
      [goto(sepulcherB.x, sepulcherB.y), { type: "accept", questId: 428, label: "Lost Deathstalkers" }],
      { routes: ["speedrun"] },
    );
    expect(mergeKind(a, b, catalog)).toBeNull();
  });

  it("merges a both-routes step with a balanced-only neighbour", () => {
    const a = step("s:1", "Accept Prove Your Worth from Dalar Dawnweaver", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "accept", questId: 421, label: "Prove Your Worth" },
    ]);
    const b = step(
      "s:2",
      "Accept Lost Deathstalkers from High Executor Hadrec",
      [goto(sepulcherB.x, sepulcherB.y), { type: "accept", questId: 428, label: "Lost Deathstalkers" }],
      { routes: ["balanced"] },
    );
    expect(mergeKind(a, b, catalog)).toBe("accept");
  });

  it("merges a turn-in with the catalog next accept at the same hub", () => {
    const t = step("s:9", "Turn in Lost Deathstalkers to Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "turnin", questId: 428, label: "Lost Deathstalkers" },
    ]);
    const a = step("s:10", "Accept Wild Hearts from Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "accept", questId: 429, label: "Wild Hearts" },
    ]);
    expect(mergeKind(t, a, catalog)).toBe("chain");
  });

  it("does not merge an unrelated turn-in then accept at the same hub", () => {
    const t = step("s:t", "Turn in Ivar the Foul to Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "turnin", questId: 425, label: "Ivar the Foul" },
    ]);
    const a = step("s:a", "Accept Border Crossings from Shadow Priest Allister", [
      goto(rane.x, rane.y),
      { type: "accept", questId: 477, label: "Border Crossings" },
    ]);
    expect(mergeKind(t, a, catalog)).toBeNull();
  });

  it("merges overlapping complete steps and refuses far-apart ones", () => {
    const a = step("s:c1", "Complete Wild Hearts", [
      goto(56.2, 13.6),
      { type: "complete", questId: 429, objective: 1, label: "Wild Hearts" },
    ]);
    const near = step("s:c2", "Complete Ivar the Foul", [
      goto(ivar.x, ivar.y),
      { type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" },
    ]);
    const far = step("s:c3", "Complete Prove Your Worth", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "complete", questId: 421, objective: 1, label: "Prove Your Worth" },
    ]);
    expect(mergeKind(a, near, catalog)).toBe("complete");
    expect(mergeKind(a, far, catalog)).toBeNull();
  });

  it("does not merge a complete into an accept or a turn-in", () => {
    const accept = step("s:a", "Accept Ivar the Foul from Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "accept", questId: 425, label: "Ivar the Foul" },
    ]);
    const complete = step("s:c", "Complete Ivar the Foul", [
      goto(ivar.x, ivar.y),
      { type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" },
    ]);
    const turnin = step("s:t", "Turn in Ivar the Foul to Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "turnin", questId: 425, label: "Ivar the Foul" },
    ]);
    expect(mergeKind(accept, complete, catalog)).toBeNull();
    expect(mergeKind(complete, turnin, catalog)).toBeNull();
    expect(mergeKind(accept, turnin, catalog)).toBeNull();
  });

  it("does not merge across zones", () => {
    const a = step("s:1", "Accept Prove Your Worth from Dalar Dawnweaver", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "accept", questId: 421, label: "Prove Your Worth" },
    ]);
    const b = step("s:2", "Accept Lost Deathstalkers from High Executor Hadrec", [
      { type: "goto", at: at(sepulcherB.x, sepulcherB.y, "Tirisfal Glades", 1420) },
      { type: "accept", questId: 428, label: "Lost Deathstalkers" },
    ]);
    expect(mergeKind(a, b, catalog)).toBeNull();
  });
});

describe("compactSteps", () => {
  it("keeps the first id, records mergedIds, and renumbers", () => {
    const a = step("s:1", "Accept Prove Your Worth from Dalar Dawnweaver", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "accept", questId: 421, label: "Prove Your Worth" },
    ]);
    const b = step("s:2", "Accept Lost Deathstalkers from High Executor Hadrec", [
      goto(sepulcherB.x, sepulcherB.y),
      { type: "accept", questId: 428, label: "Lost Deathstalkers" },
    ]);
    const travel = step("s:3", "Run north along the road to Rane Yorick at the coast", [goto(rane.x, rane.y)]);
    const { steps, absorbed } = compactSteps([a, b, travel], quests);
    expect(absorbed).toBe(1);
    expect(steps).toHaveLength(2);
    expect(steps[0]!.id).toBe("s:1");
    expect(steps[0]!.mergedIds).toEqual(["s:2"]);
    expect(steps[0]!.n).toBe(1);
    expect(steps[1]!.n).toBe(2);
    expect(stepPlain(steps[0]!)).toMatch(/Accept Prove Your Worth from Dalar Dawnweaver, Lost Deathstalkers from High Executor Hadrec/);
    expect(steps[0]!.actions.filter((x) => x.type === "goto")).toHaveLength(1);
    expect(steps[0]!.actions.filter((x) => x.type === "accept")).toHaveLength(2);
  });

  it("intersects routes so a speedrun reader does not see a balanced-only quest", () => {
    const both = step("s:1", "Accept Prove Your Worth from Dalar Dawnweaver", [
      goto(sepulcherA.x, sepulcherA.y),
      { type: "accept", questId: 421, label: "Prove Your Worth" },
    ]);
    const balanced = step(
      "s:2",
      "Accept Lost Deathstalkers from High Executor Hadrec",
      [goto(sepulcherB.x, sepulcherB.y), { type: "accept", questId: 428, label: "Lost Deathstalkers" }],
      { routes: ["balanced"] },
    );
    const { steps } = compactSteps([both, balanced], quests);
    expect(steps[0]!.routes).toEqual(["balanced"]);
  });

  it("keeps how-to lines on a merged complete card", () => {
    const a = step("s:c1", "Complete Wild Hearts", [
      goto(56.2, 13.6),
      { type: "complete", questId: 429, objective: 1, label: "Wild Hearts" },
    ]);
    a.text.push({ segments: [{ t: "Kill Mottled Worg (56.2, 13.6) and loot Discolored Worg Heart" }] });
    const b = step("s:c2", "Complete Ivar the Foul", [
      goto(ivar.x, ivar.y),
      { type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" },
    ]);
    b.text.push({ segments: [{ t: "Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head" }] });
    const { steps, absorbed } = compactSteps([a, b], quests);
    expect(absorbed).toBe(1);
    const lines = steps[0]!.text.map((l) => l.segments.map((s) => s.t).join(""));
    expect(lines[0]).toBe("Complete Wild Hearts, Ivar the Foul");
    expect(lines).toContain("Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head");
    expect(lines).toContain("Kill Mottled Worg (56.2, 13.6) and loot Discolored Worg Heart");
  });

  it("does not collapse the Ivar accept / complete / turn-in sequence", () => {
    const accept = step("s:a", "Accept Ivar the Foul from Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "accept", questId: 425, label: "Ivar the Foul" },
    ]);
    const complete = step("s:c", "Complete Ivar the Foul", [
      goto(ivar.x, ivar.y),
      { type: "complete", questId: 425, objective: 1, label: "Ivar the Foul" },
    ]);
    complete.text.push({ segments: [{ t: "Kill Ivar the Foul (51.5, 13.9) and loot Ivar's Head" }] });
    const turnin = step("s:t", "Turn in Ivar the Foul to Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "turnin", questId: 425, label: "Ivar the Foul" },
    ]);
    const { steps, absorbed } = compactSteps([accept, complete, turnin], quests);
    expect(absorbed).toBe(0);
    expect(steps.map((s) => s.id)).toEqual(["s:a", "s:c", "s:t"]);
  });

  it("merges a chain hand-off at Rane and keeps tips from both cards", () => {
    const t = step("s:9", "Turn in Lost Deathstalkers to Rane Yorick", [
      goto(rane.x, rane.y),
      { type: "turnin", questId: 428, label: "Lost Deathstalkers" },
    ]);
    const a = step(
      "s:10",
      "Accept Wild Hearts from Rane Yorick",
      [goto(rane.x, rane.y), { type: "accept", questId: 429, label: "Wild Hearts" }],
      { tips: [{ kind: "general", text: "Hearts note", sources: [], verified: true }] },
    );
    const { steps, absorbed } = compactSteps([t, a], quests);
    expect(absorbed).toBe(1);
    expect(steps[0]!.id).toBe("s:9");
    expect(steps[0]!.mergedIds).toEqual(["s:10"]);
    expect(stepPlain(steps[0]!)).toMatch(/Turn in Lost Deathstalkers to Rane Yorick, accept Wild Hearts from Rane Yorick/);
    expect(steps[0]!.tips?.some((tip) => tip.text === "Hearts note")).toBe(true);
  });
});

function stepPlain(s: Step): string {
  return s.text.map((l) => l.segments.map((x) => x.t).join("")).join("\n");
}
