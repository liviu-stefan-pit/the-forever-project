/**
 * Pure live hints from a synced profile: trainer tiers, riding, chip notes, nearest goto.
 * UI renders the strings; nothing here writes progress.
 */
import type { Action, Profile, Step } from "../data/schema";
import { formatMoney } from "../state/gameSync";
import { lookupQuest, type QuestLookup } from "../state/questAvailability";
import { objectiveCountLabel, skippedForNavigation, type StepStatus } from "../state/questProgress";

export interface TrainerTier {
  profession: string;
  tier: string;
  minLevel: number;
  minSkill: number;
  skillCap: number;
}

/** Classic training caps used when trainers.json has no row for the profession. */
export const CLASSIC_TRAINER_TIERS: readonly Omit<TrainerTier, "profession">[] = [
  { tier: "Apprentice", minLevel: 5, minSkill: 0, skillCap: 75 },
  { tier: "Journeyman", minLevel: 10, minSkill: 50, skillCap: 150 },
  { tier: "Expert", minLevel: 20, minSkill: 125, skillCap: 225 },
  { tier: "Artisan", minLevel: 35, minSkill: 200, skillCap: 300 },
];

const RIDING_COPPER = 1_000_000;

function tiersFor(profession: string, rows: readonly TrainerTier[]): TrainerTier[] {
  const matched = rows.filter((r) => r.profession === profession);
  if (matched.length) return matched;
  return CLASSIC_TRAINER_TIERS.map((t) => ({ ...t, profession }));
}

/** "Train {Tier} now" when rank is within 25 of the current cap and level allows the next tier. */
export function trainerNudge(
  profession: string,
  skill: { cur: number; max: number } | undefined,
  level: number | undefined,
  rows: readonly TrainerTier[],
): string | undefined {
  if (!skill || level == null) return undefined;
  const tiers = tiersFor(profession, rows)
    .filter((t) => t.skillCap > 0)
    .sort((a, b) => a.skillCap - b.skillCap);
  const next = tiers.find((t) => t.skillCap > skill.max);
  if (!next) return undefined;
  if (skill.cur < skill.max - 25) return undefined;
  if (level < next.minLevel) return undefined;
  return `Train ${next.tier} now`;
}

export function trainerNudges(profile: Profile, rows: readonly TrainerTier[]): string[] {
  const out: string[] = [];
  for (const [name, skill] of Object.entries(profile.skills ?? {})) {
    const text = trainerNudge(name, skill, profile.level, rows);
    if (text) out.push(`${name}: ${text}`);
  }
  return out;
}

/** Apprentice riding at 40 with no riding skill. Mentions gold only when money is known and short. */
export function ridingNudge(profile: Pick<Profile, "level" | "money" | "spells">): string | undefined {
  if ((profile.level ?? 0) < 40) return undefined;
  if ((profile.spells?.riding ?? 0) !== 0) return undefined;
  const base = "Apprentice riding (100g)";
  if (profile.money == null) return base;
  if (profile.money < RIDING_COPPER) return `${base} — need 100g, you have ${formatMoney(profile.money)}`;
  return base;
}

export interface ChipLive {
  /** Fulfilled/required for a complete or collect chip. */
  count?: string;
  /** Soft level warning. The step stays visible. */
  warn?: string;
  /** Extra title text (hearth bind). */
  title?: string;
}

export function chipLive(action: Action, profile: Profile | null | undefined, quests?: QuestLookup): ChipLive {
  if (!profile) return {};
  const live: ChipLive = {};
  if (action.type === "complete" || (action.type === "collect" && action.questId !== undefined)) {
    const qid = action.questId;
    if (qid !== undefined) {
      const count = objectiveCountLabel(profile, qid, action.objective);
      if (count) live.count = count;
    }
  }
  if (action.type === "accept" || action.type === "turnin") {
    const req = lookupQuest(quests, action.questId)?.reqLevel;
    if (req != null && profile.level != null && req > profile.level) {
      live.warn = `needs level ${req}`;
    }
  }
  if (action.type === "hs" && profile.hearth) {
    live.title = `Hearth is bound to ${profile.hearth}`;
  }
  return live;
}

/** Map a coordinate to 0–1. Values above 1 are zone percent (0–100). */
export function normCoord(n: number): number {
  return Math.abs(n) > 1 ? n / 100 : n;
}

export interface NearestStep {
  id: string;
  actions: readonly Action[];
  done: boolean;
  /** Blocked, not applicable, or a non-quest step already passed by a later done quest step. */
  skip?: boolean;
}

/**
 * Unfinished step whose goto on this map is closest to the player.
 * Hidden when position or map gotos are missing.
 * When `currentId` is set, only steps at or after that id (in `steps` order) are considered.
 */
export function nearestGotoStep(
  steps: readonly NearestStep[],
  position: { mapId?: number; x?: number; y?: number } | undefined,
  opts?: { currentId?: string },
): string | undefined {
  if (position?.mapId == null || position.x == null || position.y == null) return undefined;
  const px = normCoord(position.x);
  const py = normCoord(position.y);
  let pool = steps;
  if (opts?.currentId) {
    const at = steps.findIndex((s) => s.id === opts.currentId);
    if (at >= 0) pool = steps.slice(at);
  }
  let best: { id: string; d: number } | undefined;
  for (const step of pool) {
    if (step.done || step.skip) continue;
    for (const action of step.actions) {
      if (action.type !== "goto" || action.at.mapId !== position.mapId) continue;
      const dx = normCoord(action.at.x) - px;
      const dy = normCoord(action.at.y) - py;
      const d = dx * dx + dy * dy;
      if (!best || d < best.d) best = { id: step.id, d };
    }
  }
  return best?.id;
}

export interface GuideNearestOpts {
  /** When set, only these ids are candidates. Later-done checks still use the full `steps` list. */
  visibleIds?: readonly string[];
  status?: (step: Step) => StepStatus;
}

/** Steps of the current guide, for the nearest-step picker. */
export function guideNearestInput(
  steps: readonly Step[],
  isDone: (id: string) => boolean,
  opts?: GuideNearestOpts,
): NearestStep[] {
  const visible = opts?.visibleIds ? new Set(opts.visibleIds) : undefined;
  const out: NearestStep[] = [];
  for (const step of steps) {
    if (visible && !visible.has(step.id)) continue;
    const status = opts?.status?.(step);
    out.push({
      id: step.id,
      actions: step.actions,
      done: isDone(step.id) || status === "done",
      skip: status === "blocked" || status === "not_applicable" || skippedForNavigation(step, steps, isDone),
    });
  }
  return out;
}
