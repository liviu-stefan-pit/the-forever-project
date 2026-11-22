import type { Insights, QuestInfo } from "../data/schema";

export type NearMiss = Insights["nearMisses"][string][number];

export function nearMissesInSection(
  misses: readonly NearMiss[] | undefined,
  stepIds: ReadonlySet<string>,
): NearMiss[] {
  if (!misses?.length) return [];
  return misses.filter((m) => stepIds.has(m.insertAfterStep));
}

/** Compact bonus rows to splice after a step: added in the profile, and not already a guide step. */
export function nearMissRowsByStep(
  misses: readonly NearMiss[],
  addedQuests: readonly number[],
  existingQuestIds: ReadonlySet<number>,
): Map<string, NearMiss[]> {
  const added = new Set(addedQuests);
  const out = new Map<string, NearMiss[]>();
  for (const miss of misses) {
    if (!added.has(miss.questId) || existingQuestIds.has(miss.questId)) continue;
    const list = out.get(miss.insertAfterStep);
    if (list) list.push(miss);
    else out.set(miss.insertAfterStep, [miss]);
  }
  return out;
}

export function nearMissCoords(
  quest: Pick<QuestInfo, "start" | "end"> | undefined,
): { zone: string; x: number; y: number } | undefined {
  const at = quest?.start[0]?.at[0] ?? quest?.end[0]?.at[0];
  if (!at || (at.x === 0 && at.y === 0)) return undefined;
  return { zone: at.zone, x: at.x, y: at.y };
}
