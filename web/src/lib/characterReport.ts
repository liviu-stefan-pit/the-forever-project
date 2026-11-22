import type { ProfessionKey, ProfessionMilestone } from "../data/schema";

/** Trainer rank caps in Classic (skill max on the bar). */
export const TRAINER_CAPS = [
  { name: "Apprentice", max: 75 },
  { name: "Journeyman", max: 150 },
  { name: "Expert", max: 225 },
  { name: "Artisan", max: 300 },
] as const;

const REACTION_NAMES = ["", "Hated", "Hostile", "Unfriendly", "Neutral", "Friendly", "Honored", "Revered", "Exalted"] as const;

/** A few continent ui map ids. Unknown ids stay as "Map N". */
const CONTINENT_NAMES: Record<number, string> = {
  1414: "Kalimdor",
  1415: "Eastern Kingdoms",
  1463: "Eastern Kingdoms",
  1464: "Kalimdor",
  1945: "Outland",
};

export function reactionName(reaction: number | undefined): string {
  if (reaction === undefined || reaction < 1 || reaction > 8) return "Unknown";
  return REACTION_NAMES[reaction] ?? "Unknown";
}

export function continentLabel(mapId: number | undefined): string {
  if (mapId === undefined) return "Unknown";
  return CONTINENT_NAMES[mapId] ?? `Map ${mapId}`;
}

/** Name of the trainer rank that matches this skill max, when it is a standard cap. */
export function trainerRankName(max: number): string | undefined {
  return TRAINER_CAPS.find((t) => t.max === max)?.name;
}

/** Next trainer cap above the current max. Undefined at Artisan (300) or above. */
export function nextTrainerCap(max: number): { name: string; max: number } | undefined {
  return TRAINER_CAPS.find((t) => t.max > max);
}

/** True when the bar is within 25 points of its cap and a higher rank still exists. */
export function trainNextRankSoon(cur: number, max: number): boolean {
  return max < 300 && cur >= max - 25;
}

/** Label under a skill bar when there is no class leveling plan. */
export function trainerTierLabel(cur: number, max: number): string | undefined {
  const rank = trainerRankName(max);
  const next = nextTrainerCap(max);
  const bits: string[] = [];
  if (rank) bits.push(rank);
  if (next) bits.push(`next ${next.name} ${next.max}`);
  if (trainNextRankSoon(cur, max)) bits.push("Train next rank soon");
  return bits.length ? bits.join(" · ") : undefined;
}

/** First leveling-plan target strictly above the current rank for this profession. */
export function nextProfessionMilestone(
  plan: readonly ProfessionMilestone[] | undefined,
  profession: ProfessionKey,
  cur: number,
): ProfessionMilestone | undefined {
  if (!plan?.length) return undefined;
  return plan
    .filter((m) => m.profession === profession && m.skillTarget > cur)
    .sort((a, b) => a.skillTarget - b.skillTarget)[0];
}

export function milestoneLabel(m: ProfessionMilestone): string {
  return m.note ? `Next milestone: ${m.skillTarget} — ${m.note}` : `Next milestone: ${m.skillTarget}`;
}
