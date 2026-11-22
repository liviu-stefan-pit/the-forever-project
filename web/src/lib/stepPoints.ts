/**
 * Progress marks on the zone map (DESIGN.md §4): one point per visible step with a goto on this
 * map — the current step gets a pulsing ring, completed steps a small done check, the rest a dot.
 * Steps sharing a spot (same 0.5 % cell) merge: current wins, then "todo", then "done".
 */
import type { Filter, Step } from "../data/schema";

export type StepPointState = "current" | "done" | "todo";

export interface StepPoint {
  x: number;
  y: number;
  state: StepPointState;
  /** Step ids at this spot, in route order. */
  stepIds: string[];
  /** 1-based step numbers for the label. */
  ns: number[];
}

/** Last visible, non-hidden goto of a step on `mapId` (where the step sends you). */
export function stepSpot(step: Step, mapId: number, lineVisible: (f: Filter | undefined) => boolean = () => true): { x: number; y: number } | undefined {
  let spot: { x: number; y: number } | undefined;
  for (const a of step.actions) {
    if (a.type !== "goto" || a.hidden || a.at.mapId !== mapId) continue;
    if (a.at.x === 0 && a.at.y === 0) continue;
    if (!lineVisible(a.filter)) continue;
    spot = { x: a.at.x, y: a.at.y };
  }
  return spot;
}

const RANK: Record<StepPointState, number> = { current: 2, todo: 1, done: 0 };

export function sectionStepPoints(opts: {
  steps: readonly Step[];
  mapId: number;
  isShown: (s: Step) => boolean;
  isDone: (id: string) => boolean;
  /** Omit not-applicable steps so they are not drawn as todo dots. */
  omit?: (step: Step) => boolean;
  currentId?: string;
  lineVisible?: (f: Filter | undefined) => boolean;
}): StepPoint[] {
  const cells = new Map<string, StepPoint>();
  const out: StepPoint[] = [];
  for (const s of opts.steps) {
    if (!opts.isShown(s) || opts.omit?.(s)) continue;
    const spot = stepSpot(s, opts.mapId, opts.lineVisible);
    if (!spot) continue;
    const state: StepPointState = s.id === opts.currentId ? "current" : opts.isDone(s.id) ? "done" : "todo";
    const key = `${Math.round(spot.x * 2)}:${Math.round(spot.y * 2)}`;
    const hit = cells.get(key);
    if (hit) {
      hit.stepIds.push(s.id);
      hit.ns.push(s.n);
      if (RANK[state] > RANK[hit.state]) hit.state = state;
      continue;
    }
    const p: StepPoint = { ...spot, state, stepIds: [s.id], ns: [s.n] };
    cells.set(key, p);
    out.push(p);
  }
  return out;
}
