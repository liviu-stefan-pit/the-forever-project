/** Source CSVs: content/game-data/QuestXP.1.60.1.71037.csv and LevelExperience.1.60.1.71037.csv (client build 1.60.1.71037). */
import { QUEST_XP, XP_TO_NEXT } from "./rules-data.ts";

/** XP required to go from `level` to level+1. 0 at the level-60 cap and for invalid levels. */
export function xpToNext(level: number): number {
  if (level < 1 || level >= 60) return 0;
  return XP_TO_NEXT[level] ?? 0;
}

/** QuestXP table: row = quest level, column = Difficulty_`tier`. Unused/out-of-range tiers are 0. */
export function questXp(questLevel: number, tier: number): number {
  if (!Number.isInteger(tier) || tier < 0 || tier > 9) return 0;
  const row = QUEST_XP[questLevel];
  if (!row) return 0;
  return row[tier] ?? 0;
}

/** Outlevel penalty on quest XP. Quests at or above the player stay at 100%. */
export function questXpForPlayer(baseXp: number, questLevel: number, playerLevel: number): number {
  const diff = Math.floor(playerLevel) - questLevel;
  if (diff <= 5) return baseXp;
  const mult = diff === 6 ? 0.8 : diff === 7 ? 0.6 : diff === 8 ? 0.4 : diff === 9 ? 0.2 : 0.1;
  return Math.round(baseXp * mult);
}

/** Zero Difference used in lower-mob kill XP. */
export function zd(level: number): number {
  if (level >= 60) return 17;
  if (level >= 55) return 16;
  if (level >= 50) return 15;
  if (level >= 45) return 14;
  if (level >= 40) return 13;
  if (level >= 30) return 12;
  if (level >= 20) return 11;
  if (level >= 16) return 9;
  if (level >= 12) return 8;
  if (level >= 10) return 7;
  if (level >= 8) return 6;
  return 5;
}

/** Highest mob level that awards 0 XP. */
export function grayLevel(level: number): number {
  if (level <= 5) return 0;
  if (level <= 39) return level - Math.floor(level / 10) - 5;
  return level - Math.floor(level / 5) - 1;
}

/** WoW Forever kill XP (mob-level base for weaker mobs). Never negative. */
export function mobXp(charLevel: number, mobLevel: number, elite = false): number {
  if (mobLevel <= grayLevel(charLevel)) return 0;
  const diff = mobLevel - charLevel;
  let xp: number;
  if (diff >= 0) {
    const base = charLevel * 5 + 45;
    xp = base * (1 + 0.05 * Math.min(diff, 4));
  } else {
    const base = mobLevel * 5 + 45;
    xp = base * (1 - (charLevel - mobLevel) / zd(charLevel));
  }
  if (elite) xp *= 2;
  return Math.max(0, Math.round(xp));
}

/**
 * Kill counts that close `xpGap`. Index 0 is the fewer (same-level) kills;
 * index 1 is the more (about two levels below, or just above gray).
 */
export function mobsForGap(xpGap: number, charLevel: number): { mobs: [number, number]; mobLevel: number } {
  const mobLevel = Math.max(charLevel - 2, grayLevel(charLevel) + 1);
  if (xpGap <= 0) return { mobs: [0, 0], mobLevel };
  const sameXp = mobXp(charLevel, charLevel);
  const lowerXp = mobXp(charLevel, mobLevel);
  const sameCount = sameXp > 0 ? Math.ceil(xpGap / sameXp) : 0;
  const lowerCount = lowerXp > 0 ? Math.ceil(xpGap / lowerXp) : 0;
  const mobs: [number, number] = sameCount <= lowerCount ? [sameCount, lowerCount] : [lowerCount, sameCount];
  return { mobs, mobLevel };
}
