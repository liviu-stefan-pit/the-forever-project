import type { StepSim } from "../../data/schema";
import { questXpForPlayer } from "./rules";

/** Awarded turn-in XP for a chip, or undefined when the reward is genuinely unknown. */
export function turninChipXp(
  questId: number,
  simQuestXp: StepSim["questXp"] | undefined,
  quest: { xp?: number; level: number } | undefined,
  playerLevel: number | undefined,
): { xp: number; fullXp: number } | undefined {
  const fromSim = simQuestXp?.find((q) => q.questId === questId);
  if (fromSim && fromSim.fullXp > 0) return fromSim;
  if (!quest || quest.xp == null || quest.xp <= 0) return undefined;
  const fullXp = quest.xp;
  const level = Math.floor(playerLevel ?? quest.level);
  return { xp: questXpForPlayer(fullXp, quest.level, level), fullXp };
}
