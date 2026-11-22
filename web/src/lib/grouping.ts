/**
 * Splitting a guide into zone sections and grouping `completeWith` steps.
 *
 * Semantics: a `completeWith: "next"` step is done *while* doing the next step
 * (e.g. "kill boars on the way"); `completeWith: <label>` runs until the step with
 * `#label <label>`. We render such a step as a compact **companion** above the step it
 * completes with, inside one visual group. If the target is not the next visible
 * step (or is in another guide), the step stays on its own and carries an `until` hint.
 *
 * Hidden steps (filtered out by profile / Speedrun mode) are transparent for grouping and
 * are emitted as collapsed `hidden` runs so the reader can reveal them on demand.
 */
import type { Guide, Section, Step } from "../data/schema";

export interface StepGroup {
  /** Stable React key (the main step id). */
  key: string;
  main: Step;
  /** Steps done alongside `main`, in route order. */
  companions: Step[];
}

export type SectionItem =
  | { kind: "group"; group: StepGroup }
  | { kind: "hidden"; key: string; steps: Step[] };

export interface SectionBlock {
  /** Section id (or a synthetic `_unsectioned-N` id for steps without one). */
  id: string;
  section: Section | undefined;
  steps: Step[];
}

/** Does `step` complete together with `target` (the next visible non-companion step)? */
function completesWith(step: Step, target: Step | undefined): boolean {
  const cw = step.tags.completeWith;
  if (!cw || !target) return false;
  if (cw.toLowerCase() === "next") return true;
  return target.tags.label !== undefined && target.tags.label === cw;
}

/**
 * Group a run of steps (usually one section). `isVisible` decides which steps render;
 * hidden steps become `hidden` items at their route position.
 */
export function buildSectionItems(steps: readonly Step[], isVisible: (s: Step) => boolean = () => true): SectionItem[] {
  const visible = steps.filter(isVisible);

  // Backward pass: decide which visible steps are companions, and of which main step.
  const companionOf = new Map<string, string>();
  let nextMain: Step | undefined;
  for (let i = visible.length - 1; i >= 0; i--) {
    const s = visible[i]!;
    if (completesWith(s, nextMain)) companionOf.set(s.id, nextMain!.id);
    else nextMain = s;
  }

  // Forward pass: emit groups and hidden runs in route order.
  const items: SectionItem[] = [];
  let pending: Step[] = [];
  let hidden: Step[] = [];
  const flushHidden = () => {
    if (hidden.length) items.push({ kind: "hidden", key: `hidden:${hidden[0]!.id}`, steps: hidden });
    hidden = [];
  };
  for (const s of steps) {
    if (!isVisible(s)) {
      hidden.push(s);
      continue;
    }
    if (companionOf.has(s.id)) {
      flushHidden();
      pending.push(s);
      continue;
    }
    flushHidden();
    items.push({ kind: "group", group: { key: s.id, main: s, companions: pending } });
    pending = [];
  }
  flushHidden();
  // Defensive: companions without a main (cannot happen with the backward pass) stay visible.
  for (const s of pending) items.push({ kind: "group", group: { key: s.id, main: s, companions: [] } });
  return items;
}

/** Split guide steps into section blocks in route order (P4 sets `step.section`). */
export function splitBySection(guide: Pick<Guide, "sections" | "steps">): SectionBlock[] {
  const byId = new Map(guide.sections.map((s) => [s.id, s]));
  const blocks: SectionBlock[] = [];
  let unsectioned = 0;
  for (const step of guide.steps) {
    const last = blocks[blocks.length - 1];
    const id = step.section ?? (last && !last.section ? last.id : `_unsectioned-${++unsectioned}`);
    if (last && last.id === id) last.steps.push(step);
    else blocks.push({ id, section: step.section ? byId.get(step.section) : undefined, steps: [step] });
  }
  return blocks;
}

/**
 * Where a `completeWith: <label>` step ends when it is not grouped: the first later step
 * carrying that label. `undefined` stepId = the label lives in another guide.
 */
export function resolveCompleteWith(step: Step, steps: readonly Step[]): { label: string; stepId?: string } | undefined {
  const cw = step.tags.completeWith;
  if (!cw) return undefined;
  const idx = steps.findIndex((s) => s.id === step.id);
  if (cw.toLowerCase() === "next") {
    const next = steps[idx + 1];
    return next ? { label: "next step", stepId: next.id } : { label: "next step" };
  }
  const target = steps.slice(idx + 1).find((s) => s.tags.label === cw);
  return target ? { label: cw, stepId: target.id } : { label: cw };
}
