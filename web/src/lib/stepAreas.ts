import type { Action, RichText } from "../data/schema";

/** One place in a step: a waypoint, the line that says what to do there, and the actions done there. */
export interface StepArea {
  /** "West grove", "Rorian the Dayseeker". */
  label: string;
  /** The line with its "Label:" prefix removed. */
  line: RichText;
  /** Visible goto that starts this area. */
  goto: Extract<Action, { type: "goto" }>;
  /** Index of that goto in the step's visible actions (stable React key). */
  gotoIndex: number;
  /** Actions between this goto and the next visible one. */
  actions: Action[];
}

export interface StepLayout {
  /** Lines that are not tied to one place (a step's opening sentence). */
  intro: RichText[];
  /** Actions before the first visible goto. */
  lead: Action[];
  areas: StepArea[];
  /** Hidden path waypoints (shape the map line only). */
  hiddenCount: number;
}

const PREFIX = /^\s*([^:.!?]{2,40}?):\s+(\S.*)$/s;

/** Splits "West grove: kill …" into the label and the rest. Only the first segment can hold the label. */
function splitLabel(line: RichText): { label: string; line: RichText } | null {
  const first = line.segments[0];
  if (!first || first.kind === "link" || first.kind === "icon") return null;
  const m = PREFIX.exec(first.t);
  if (!m) return null;
  return { label: m[1]!.trim(), line: { ...line, segments: [{ ...first, t: m[2]! }, ...line.segments.slice(1)] } };
}

/**
 * Pairs a step's "Place: what to do" lines with its waypoints, in order.
 * Returns null when they don't line up one to one, so the card falls back to the plain layout.
 */
export function stepLayout(lines: readonly RichText[], actions: readonly Action[]): StepLayout | null {
  const lead: Action[] = [];
  const groups: { goto: Extract<Action, { type: "goto" }>; gotoIndex: number; actions: Action[] }[] = [];
  let hiddenCount = 0;
  actions.forEach((a, i) => {
    if (a.type === "goto" && a.hidden) {
      hiddenCount++;
      return;
    }
    if (a.type === "goto") groups.push({ goto: a, gotoIndex: i, actions: [] });
    else (groups.length ? groups[groups.length - 1]!.actions : lead).push(a);
  });
  if (groups.length === 0) return null;

  const intro: RichText[] = [];
  const labelled: { label: string; line: RichText }[] = [];
  for (const l of lines) {
    const split = splitLabel(l);
    if (split) labelled.push(split);
    else if (labelled.length === 0) intro.push(l);
    else return null; // an unlabelled line between places: we can't tell where it belongs
  }
  if (labelled.length !== groups.length) return null;

  return {
    intro,
    lead,
    hiddenCount,
    areas: groups.map((g, i) => ({ ...g, label: labelled[i]!.label, line: labelled[i]!.line })),
  };
}

/** Accept / turn-in only: the quest chips say everything the line says. */
export function isQuestOnly(actions: readonly Action[]): boolean {
  return actions.length > 0 && actions.every((a) => a.type === "accept" || a.type === "turnin");
}
