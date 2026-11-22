/**
 * XP modifiers for a live recompute. Omitted mods are worst case (no buffs).
 *
 * Kill XP (objective kills, drop kills, and the mob XP a grind stands for):
 *   afterPercents = round(baseMobXp * wellFed * sleepingBag)
 *   wellFed      = 1.05 when on, else 1
 *   sleepingBag  = 1.03 when on AND player level >= 14, else 1
 *   rested doubles `afterPercents` and consumes min(pool, afterPercents),
 *   so gained = afterPercents + consumed. Quests do not touch the pool.
 *
 * Quest XP: outlevel penalty first (`questXpForPlayer`), then * sleepingBag
 * (same level gate), rounded. Rested does not apply.
 *
 * Grind steps still move the character to the authored level. `grindKillXp`
 * is the base mob XP (before these multipliers) required to receive that gap.
 * Rested on that injected kill XP is consumed so later steps see the pool.
 */
import type { XpMods } from "../../data/schema";
import { xpToNext } from "./rules.ts";

export type { XpMods };

export interface ApplyXpModsCtx {
  kind: "kill" | "quest";
  /** Kill: summed `mobXp`. Quest: XP after the outlevel penalty. */
  amount: number;
  level: number;
  restedPool: number;
}

export interface ApplyXpModsResult {
  amount: number;
  restedPool: number;
  restedConsumed: number;
}

/** Legacy Well Rested is an integer rank 0–5. */
export function wellRestedRank(mods: XpMods | undefined): number {
  const n = mods?.legacyWellRestedRank ?? 0;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(5, Math.floor(n));
}

/** +4% rested rate and cap per rank. Rank 0 → 1, rank 5 → 1.2. */
export function wellRestedFactor(mods: XpMods | undefined): number {
  return 1 + 0.04 * wellRestedRank(mods);
}

export function killPercentMultiplier(mods: XpMods | undefined, level: number): number {
  if (!mods) return 1;
  let m = 1;
  if (mods.wellFed) m *= 1.05;
  if (mods.sleepingBag && level >= 14) m *= 1.03;
  return m;
}

export function questPercentMultiplier(mods: XpMods | undefined, level: number): number {
  if (!mods?.sleepingBag || level < 14) return 1;
  return 1.03;
}

/**
 * Rested pool at the start of a walk.
 * `none` → 0. `fromGame` → `xpRested`. `perSession` → 5% of xp-to-next at
 * `level`, times the Well Rested factor. The 150% cap is not applied to this
 * 5% slice (it stays under the cap at every rank).
 */
export function initialRestedPool(mods: XpMods | undefined, ctx: { level: number; xpRested?: number }): number {
  const policy = mods?.restedPolicy ?? "none";
  if (policy === "fromGame") return Math.max(0, ctx.xpRested ?? 0);
  if (policy === "perSession") return 0.05 * wellRestedFactor(mods) * xpToNext(ctx.level);
  return 0;
}

/** Apply percent buffs and rested to one kill or quest award. Pure. */
export function applyXpMods(mods: XpMods | undefined, ctx: ApplyXpModsCtx): ApplyXpModsResult {
  const pool = Math.max(0, ctx.restedPool);
  if (!(ctx.amount > 0)) return { amount: 0, restedPool: pool, restedConsumed: 0 };
  if (ctx.kind === "quest") {
    const mult = questPercentMultiplier(mods, ctx.level);
    const amount = mult === 1 ? ctx.amount : Math.round(ctx.amount * mult);
    return { amount, restedPool: pool, restedConsumed: 0 };
  }
  const mult = killPercentMultiplier(mods, ctx.level);
  const after = mult === 1 ? ctx.amount : Math.round(ctx.amount * mult);
  const restedConsumed = Math.min(pool, after);
  return { amount: after + restedConsumed, restedPool: pool - restedConsumed, restedConsumed };
}

export interface GrindKillCtx {
  /** Character XP the `.xp` step must still grant to hit the authored checkpoint. */
  gain: number;
  level: number;
  restedPool: number;
}

/**
 * Base mob XP required so that, after percent buffs and rested, the character
 * gains `gain`. Consumes rested the same way a real kill of that size would.
 */
export function grindKillXpForGap(mods: XpMods | undefined, ctx: GrindKillCtx): { grindKillXp: number; restedPool: number; restedConsumed: number } {
  const pool = Math.max(0, ctx.restedPool);
  const gain = Math.max(0, ctx.gain);
  if (gain === 0) return { grindKillXp: 0, restedPool: pool, restedConsumed: 0 };
  const mult = killPercentMultiplier(mods, ctx.level);
  let after: number;
  let restedConsumed: number;
  if (gain <= pool * 2) {
    after = Math.ceil(gain / 2);
    restedConsumed = Math.min(pool, after);
  } else {
    restedConsumed = pool;
    after = gain - pool;
  }
  return {
    grindKillXp: Math.ceil(after / mult - 1e-9),
    restedPool: pool - restedConsumed,
    restedConsumed,
  };
}
