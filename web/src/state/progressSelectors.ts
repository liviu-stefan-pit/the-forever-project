import type { StepStatusResult } from "./questProgress";
import type { Requirement } from "./stepRequirement";

export interface GuideCompletion {
  done: number;
  total: number;
}

/** Keep the previous completion object when counts did not change (useSyncExternalStore identity). */
export function retainCompletion(
  prev: GuideCompletion | undefined,
  next: GuideCompletion | undefined,
): GuideCompletion | undefined {
  if (!next) return undefined;
  if (prev && prev.done === next.done && prev.total === next.total) return prev;
  return next;
}

export function sameMissing(a: readonly number[] | undefined, b: readonly number[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return !a?.length && !b?.length;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Keep the previous status object when status + missing quests did not change. */
export function retainStatus(prev: StepStatusResult | undefined, next: StepStatusResult): StepStatusResult {
  if (prev && prev.status === next.status && sameMissing(prev.missing, next.missing)) return prev;
  return next;
}

export function retainRequirement(prev: Requirement | undefined, next: Requirement): Requirement {
  if (!prev || prev.kind !== next.kind) return next;
  if (prev.kind === "blocked" && next.kind === "blocked" && sameMissing(prev.missing, next.missing)) return prev;
  if (prev.kind === "not_applicable" && next.kind === "not_applicable") {
    if (
      prev.reason.type === next.reason.type &&
      prev.reason.questId === next.reason.questId &&
      prev.reason.byQuestId === next.reason.byQuestId
    ) {
      return prev;
    }
  }
  if (prev.kind === next.kind && prev.kind !== "blocked" && prev.kind !== "not_applicable") return prev;
  return next;
}

/**
 * Ring counts from index `stepIds` and profile ticks only — no guide JSON.
 * Quest-implied done is unavailable until that guide is loaded.
 */
export function completionFromStepIds(
  stepIds: readonly string[],
  isMarked: (id: string) => boolean,
): GuideCompletion {
  let done = 0;
  for (const id of stepIds) if (isMarked(id)) done++;
  return { done, total: stepIds.length };
}

export function isStoredStepMarked(steps: Readonly<Record<string, { done?: boolean } | { skipped?: boolean }>>, id: string): boolean {
  const rec = steps[id];
  return !!rec && "done" in rec && rec.done === true;
}
