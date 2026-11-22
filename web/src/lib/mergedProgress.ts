import type { Profile, Step } from "../data/schema";

/** Surviving step id for a stored id, or the id itself when it was not absorbed. */
export function remapMergedStepId(stepId: string, steps: readonly Step[]): string {
  for (const step of steps) {
    if (step.id === stepId) return stepId;
    if (step.mergedIds?.includes(stepId)) return step.id;
  }
  return stepId;
}

/**
 * Move ticks from absorbed step ids onto the surviving card.
 * Does not drop a check: a done absorbed id marks the survivor done.
 */
export function remapMergedStepRecords(
  stored: Profile["steps"],
  steps: readonly Step[],
): Profile["steps"] {
  const absorbedToSurvivor = new Map<string, string>();
  for (const step of steps) {
    for (const id of step.mergedIds ?? []) {
      if (id && id !== step.id) absorbedToSurvivor.set(id, step.id);
    }
  }
  if (absorbedToSurvivor.size === 0) return stored;

  let changed = false;
  const next: Profile["steps"] = { ...stored };
  for (const [id, rec] of Object.entries(stored)) {
    const survivor = absorbedToSurvivor.get(id);
    if (!survivor) continue;
    delete next[id];
    changed = true;
    const existing = next[survivor];
    if (!existing) {
      next[survivor] = rec;
      continue;
    }
    if ("done" in rec && rec.done) {
      if (!("done" in existing && existing.done)) next[survivor] = rec;
    }
  }
  return changed ? next : stored;
}

/** True when the surviving card or any absorbed id was ticked done. */
export function storedMergedStepIsDone(
  stored: Profile["steps"],
  stepId: string,
  mergedIds?: readonly string[],
): boolean {
  const ids = [stepId, ...(mergedIds ?? [])];
  return ids.some((id) => {
    const rec = stored[id];
    return !!rec && "done" in rec && rec.done === true;
  });
}

/** Apply merged-id remap to a profile's ticks and resume cursor. */
export function applyMergedProgress(profile: Profile, steps: readonly Step[], now: number): Profile {
  const remapped = remapMergedStepRecords(profile.steps, steps);
  const cursorStep = profile.current?.step ? remapMergedStepId(profile.current.step, steps) : undefined;
  const stepsChanged = remapped !== profile.steps;
  const cursorChanged = !!profile.current && cursorStep !== profile.current.step;
  if (!stepsChanged && !cursorChanged) return profile;
  return {
    ...profile,
    steps: remapped,
    current: profile.current && cursorChanged ? { ...profile.current, step: cursorStep! } : profile.current,
    updatedAt: now,
  };
}
