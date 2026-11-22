/**
 * Dashboard helpers (pure): group upcoming steps into map stops, list the next level-ups from the
 * XP sim, and fold repeated route notes into one line each.
 */
import type { Insights, RichText, Step, StepSim } from "../data/schema";

export type Spot = { x: number; y: number };

export function richPlain(line: RichText | undefined): string {
  return line ? line.segments.map((s) => s.t).join("").trim() : "";
}

export interface StopGroup {
  /** 1-based, matches the number drawn on the map. */
  n: number;
  steps: Step[];
  /** Where the stop is (zone %), from the first step in it that has a goto. */
  spot?: Spot;
  title: string;
  /** Highest level reached during this stop, when a step in it levels up. */
  levelUp?: number;
}

/**
 * Consecutive steps at (about) the same place become one stop. A step with no goto joins the
 * stop before it. Stops after `maxStops` are dropped.
 */
export function groupIntoStops(
  steps: readonly Step[],
  opts: {
    spotOf: (step: Step) => Spot | undefined;
    simOf: (step: Step) => StepSim | undefined;
    /** NPC name for the stop title (giver / ender of an accept or turn-in). */
    npcOf?: (step: Step) => string | undefined;
    maxStops?: number;
    /** Two spots closer than this (zone %) are the same stop. */
    near?: number;
  },
): StopGroup[] {
  const max = opts.maxStops ?? 5;
  const near = opts.near ?? 2.5;
  const out: StopGroup[] = [];
  for (const step of steps) {
    const spot = opts.spotOf(step);
    const last = out[out.length - 1];
    const joins = last && (!spot || !last.spot || Math.hypot(spot.x - last.spot.x, spot.y - last.spot.y) <= near);
    if (joins) {
      last.steps.push(step);
      if (!last.spot && spot) last.spot = spot;
      continue;
    }
    if (out.length >= max) break;
    out.push({ n: out.length + 1, steps: [step], spot, title: "" });
  }
  for (const g of out) {
    g.title = g.steps.map((s) => opts.npcOf?.(s)).find(Boolean) ?? (richPlain(g.steps[0]!.text[0]) || `Step ${g.steps[0]!.n}`);
    const ups = g.steps.map((s) => opts.simOf(s)?.levelUp).filter((v): v is number => v !== undefined);
    if (ups.length) g.levelUp = Math.max(...ups);
  }
  return out;
}

/** "#21" or "#21–22" for a stop's step numbers. */
export function stepRange(steps: readonly Pick<Step, "n">[]): string {
  if (!steps.length) return "";
  const lo = Math.min(...steps.map((s) => s.n));
  const hi = Math.max(...steps.map((s) => s.n));
  return lo === hi ? `#${lo}` : `#${lo}–${hi}`;
}

export interface LevelMilestone {
  level: number;
  step: Step;
  /** Open steps from the current one up to and including this one (0 = the current step). */
  stepsAway: number;
}

/** Next `limit` level-ups from `open` (the open visible steps, current first). */
export function levelMilestones(open: readonly Step[], simOf: (step: Step) => StepSim | undefined, limit = 4): LevelMilestone[] {
  const out: LevelMilestone[] = [];
  open.forEach((step, i) => {
    if (out.length >= limit) return;
    const up = simOf(step)?.levelUp;
    if (up !== undefined) out.push({ level: up, step, stepsAway: i });
  });
  return out;
}

/** Level before `step`, from the sim of the step just before it (fractional, e.g. 2.66). */
export function levelBefore(visible: readonly Step[], step: Step | undefined, simOf: (s: Step) => StepSim | undefined, fallback: number): number {
  if (!step) return fallback;
  const i = visible.indexOf(step);
  for (let j = i - 1; j >= 0; j--) {
    const lvl = simOf(visible[j]!)?.level;
    if (lvl !== undefined) return lvl;
  }
  return fallback;
}

/** Level at the end of the guide: the last visible step with a sim. */
export function finishLevel(visible: readonly Step[], simOf: (s: Step) => StepSim | undefined): number | undefined {
  for (let j = visible.length - 1; j >= 0; j--) {
    const lvl = simOf(visible[j]!)?.level;
    if (lvl !== undefined) return lvl;
  }
  return undefined;
}

export interface NoteGroup {
  msg: string;
  severity: Insights["issues"][number]["severity"];
  /** Flagged steps, in guide order. */
  steps: Step[];
  /** Distinct quest names over those steps, each with its step numbers. */
  quests: { name: string; steps: Step[] }[];
  /** Quests named by notes with no step in this guide (a quest left out of the route). */
  questIds: number[];
  /** Names the build carried for those quests. */
  questNames: Record<number, string>;
}

/** Fold route issues sharing a message into one line. Issues whose step is not in the guide are dropped. */
export function groupNotes(issues: Insights["issues"], guideSteps: readonly Step[], questName: (step: Step) => string | undefined): NoteGroup[] {
  const byId = new Map<string, Step>();
  for (const s of guideSteps) {
    byId.set(s.id, s);
    for (const m of s.mergedIds ?? []) if (!byId.has(m)) byId.set(m, s);
  }
  const groups = new Map<string, NoteGroup>();
  for (const it of issues) {
    const step = it.step ? byId.get(it.step) : undefined;
    let g = groups.get(it.msg);
    if (!g) {
      g = { msg: it.msg, severity: it.severity, steps: [], quests: [], questIds: [], questNames: {} };
      groups.set(it.msg, g);
    }
    if (it.severity === "warn") g.severity = "warn";
    if (step && !g.steps.includes(step)) g.steps.push(step);
    if (!it.step && it.questId != null && !g.questIds.includes(it.questId)) g.questIds.push(it.questId);
    if (it.questId != null && it.questName) g.questNames[it.questId] = it.questName;
  }
  for (const g of groups.values()) {
    g.steps.sort((a, b) => a.n - b.n);
    const quests = new Map<string, Step[]>();
    for (const s of g.steps) {
      const name = questName(s) ?? (richPlain(s.text[0]) || `Step ${s.n}`);
      quests.set(name, [...(quests.get(name) ?? []), s]);
    }
    g.quests = [...quests].map(([name, steps]) => ({ name, steps }));
  }
  return [...groups.values()].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "warn" ? -1 : 1));
}
