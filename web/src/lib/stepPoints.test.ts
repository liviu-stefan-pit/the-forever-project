import { describe, expect, it } from "vitest";
import type { Step } from "../data/schema";
import { sectionStepPoints, stepSpot } from "./stepPoints";

const goto = (x: number, y: number, extra: object = {}) => ({ type: "goto" as const, at: { mapId: 1411, zone: "Z", x, y, exact: true }, ...extra });
const step = (n: number, actions: Step["actions"]): Step => ({ id: `s${n}`, n, tags: {}, conditions: [], text: [], actions });

const steps: Step[] = [
  step(1, [goto(10, 10)]),
  step(2, [goto(20, 20)]),
  step(3, [goto(30, 30)]),
  step(4, [goto(30.1, 30.1)]), // same 0.5 % cell as step 3
  step(5, [goto(40, 40, { hidden: true })]), // hidden waypoint only: no mark
  step(6, [goto(50, 50)]),
];

describe("sectionStepPoints", () => {
  const done = new Set(["s1", "s3"]);
  const pts = sectionStepPoints({ steps, mapId: 1411, isShown: (s) => s.id !== "s6", isDone: (id) => done.has(id), currentId: "s2" });

  it("marks the current step, done steps and the rest", () => {
    expect(pts.map((p) => [p.ns.join("+"), p.state])).toEqual([
      ["1", "done"],
      ["2", "current"],
      ["3+4", "todo"],
    ]);
  });

  it("skips hidden waypoints and steps the route hides", () => {
    expect(pts.some((p) => p.stepIds.includes("s5"))).toBe(false);
    expect(pts.some((p) => p.stepIds.includes("s6"))).toBe(false);
  });

  it("a shared spot is done only when every step there is done", () => {
    const all = sectionStepPoints({ steps, mapId: 1411, isShown: () => true, isDone: (id) => id === "s3" || id === "s4" });
    expect(all.find((p) => p.stepIds.includes("s3"))!.state).toBe("done");
  });

  it("uses the step's last visible goto on this map", () => {
    expect(stepSpot(step(9, [goto(1, 1), goto(2, 2), goto(3, 3, { hidden: true })]), 1411)).toEqual({ x: 2, y: 2 });
    expect(stepSpot(step(9, [goto(1, 1)]), 1412)).toBeUndefined();
  });
});
