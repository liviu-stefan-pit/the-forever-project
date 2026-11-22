import type { StepSim } from "../../data/schema";

export type StepSimNext = NonNullable<StepSim["next"]>;

function formatMobRange(mobs: [number, number]): string {
  return mobs[0] === mobs[1] ? String(mobs[0]) : `${mobs[0]}–${mobs[1]}`;
}

function questsPhrase(count: number): string {
  return `${count} ${count === 1 ? "quest" : "quests"}`;
}

function mobPhrase(next: StepSimNext): string {
  return next.mobName ? next.mobName : "mobs of your level";
}

/** Next-checkpoint sentence, or undefined when there is nothing to add after the level-up line. */
export function checkpointNextSentence(next: StepSimNext | undefined): string | undefined {
  if (!next) return undefined;
  const { quests, xpGap, level } = next;
  if (xpGap <= 0) {
    if (quests <= 0) return undefined;
    return `Next: ${questsPhrase(quests)} to reach ${level}.`;
  }
  if (quests <= 0) {
    return `Next: ~${formatMobRange(next.mobs)} ${mobPhrase(next)} to reach ${level}.`;
  }
  if (next.mobs[1] > 0) {
    const named = next.mobName ? next.mobName : "mobs";
    const ofLevel = next.mobName ? "" : " of your level";
    return `Next: ${questsPhrase(quests)} + ~${formatMobRange(next.mobs)} ${named}${ofLevel} (lvl ${next.mobLevel}) to reach ${level}.`;
  }
  return `Next: ${questsPhrase(quests)} to reach ${level}.`;
}

/** Level-up banner copy: `"Level {n}!"` plus the next-checkpoint sentence when present. */
export function checkpointBannerText(levelUp: number, next?: StepSim["next"]): string {
  const follow = checkpointNextSentence(next);
  return follow ? `Level ${levelUp}! ${follow}` : `Level ${levelUp}!`;
}

/** `floor(level)` plus one truncated decimal, e.g. 13.42 → `"13.4"`. */
export function formatExpectedLevel(level: number): string {
  const whole = Math.floor(level);
  const tenth = Math.min(9, Math.floor((level - whole) * 10 + 1e-6));
  return `${whole}.${tenth}`;
}
