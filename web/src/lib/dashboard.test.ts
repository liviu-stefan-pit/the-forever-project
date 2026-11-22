import { describe, expect, it } from "vitest";
import type { Step, StepSim } from "../data/schema";
import { finishLevel, groupIntoStops, groupNotes, levelBefore, levelMilestones, stepRange } from "./dashboard";

function step(n: number, opts: { at?: [number, number]; level?: number; levelUp?: number; text?: string; id?: string } = {}): Step {
  return {
    id: opts.id ?? `g:${n}`,
    n,
    tags: {},
    text: [{ segments: [{ t: opts.text ?? `Step ${n} text` }] }],
    actions: opts.at ? [{ type: "goto", at: { mapId: 1, x: opts.at[0], y: opts.at[1], zone: "Z", exact: true } }] : [],
    conditions: [],
    sim: opts.level !== undefined ? { balanced: { level: opts.level, gained: 0, levelUp: opts.levelUp } as StepSim } : undefined,
  } as unknown as Step;
}

const spotOf = (s: Step) => {
  const g = s.actions.find((a) => a.type === "goto");
  return g && g.type === "goto" ? { x: g.at.x, y: g.at.y } : undefined;
};
const simOf = (s: Step) => s.sim?.balanced;

describe("groupIntoStops", () => {
  it("joins nearby spots and steps without a goto, splits far ones, numbers from 1", () => {
    const steps = [step(20, { at: [40.6, 62.6] }), step(21, { at: [44.2, 55.5], levelUp: 4, level: 4.1 }), step(22), step(23, { at: [44.3, 56] }), step(25, { at: [42.7, 67.2] })];
    const groups = groupIntoStops(steps, { spotOf, simOf });
    expect(groups.map((g) => g.steps.map((s) => s.n))).toEqual([[20], [21, 22, 23], [25]]);
    expect(groups.map((g) => g.n)).toEqual([1, 2, 3]);
    expect(groups[1]!.levelUp).toBe(4);
    expect(groups[0]!.title).toBe("Step 20 text");
  });

  it("uses the NPC name for the title and stops at maxStops", () => {
    const steps = [step(1, { at: [10, 10] }), step(2, { at: [30, 30] }), step(3, { at: [50, 50] })];
    const groups = groupIntoStops(steps, { spotOf, simOf, npcOf: (s) => (s.n === 1 ? "Gornek" : undefined), maxStops: 2 });
    expect(groups).toHaveLength(2);
    expect(groups[0]!.title).toBe("Gornek");
  });
});

describe("level goals", () => {
  const visible = [step(1, { level: 1 }), step(2, { level: 2.66 }), step(3, { level: 3.2, levelUp: 3 }), step(4, { level: 3.6 }), step(5, { level: 4.1, levelUp: 4 })];

  it("lists the next level-ups with steps away (0 = this step)", () => {
    const m = levelMilestones(visible.slice(2), simOf);
    expect(m.map((x) => [x.level, x.stepsAway])).toEqual([
      [3, 0],
      [4, 2],
    ]);
  });

  it("reads the level before a step and at the guide finish", () => {
    expect(levelBefore(visible, visible[2], simOf, 1)).toBe(2.66);
    expect(levelBefore(visible, visible[0], simOf, 1)).toBe(1);
    expect(finishLevel(visible, simOf)).toBe(4.1);
  });

  it("formats step ranges", () => {
    expect(stepRange([{ n: 21 }, { n: 22 }])).toBe("#21–22");
    expect(stepRange([{ n: 7 }])).toBe("#7");
  });
});

describe("groupNotes", () => {
  it("folds repeated messages into one line with distinct quests", () => {
    const steps = [step(94, { id: "a" }), step(95, { id: "b" }), step(109, { id: "c" })];
    const names: Record<string, string> = { a: "Ukor's Lost Pack", b: "Ukor's Lost Pack", c: "Threat from Below" };
    const msg = "Uses a WoW Forever quest; marked unverified until checked in game.";
    const notes = groupNotes(
      [
        { severity: "info", guide: "g", step: "a", msg },
        { severity: "info", guide: "g", step: "b", msg },
        { severity: "info", guide: "g", step: "c", msg },
        { severity: "warn", guide: "g", step: "c", msg: "Other" },
      ],
      steps,
      (s) => names[s.id],
    );
    expect(notes.map((n) => n.msg)).toEqual(["Other", msg]);
    const forever = notes[1]!;
    expect(forever.steps).toHaveLength(3);
    expect(forever.quests.map((q) => [q.name, q.steps.length])).toEqual([
      ["Ukor's Lost Pack", 2],
      ["Threat from Below", 1],
    ]);
  });
});
