/**
 * Live XP recompute from baked `step.sim` (worst case, no buffs).
 *
 * Questie (`quests.json` / `npcs.json`) is build-only and is not shipped to the
 * client, so this does not call `simulateWalk`. It splits each baked step into
 * quest XP (`sim.questXp`) and kill XP (`gained` minus that), then runs
 * `applyXpMods` / `grindKillXpForGap`. A `.xp` step still ends on its authored
 * checkpoint; `grindKillXp` is the pre-multiplier kill XP for the remaining gap.
 *
 * Known limits: only the open guide is walked, starting from the baked arrival
 * of its first simulated step (earlier packs are not refetched). Outlevel
 * penalties and mob-XP curves stay at the baked values; food, the bag, and
 * rested scale those numbers. On a grind step, objective-kill XP is not split
 * out from the gap — the checkpoint still wins.
 */
import type { RouteStyle, Step, StepSim, XpMods } from "../../data/schema";
import { applyXpMods, grindKillXpForGap, initialRestedPool } from "./mods";
import { xpToNext } from "./rules";

/** True when a recompute can move levels off the baked worst case. Rank alone does not. */
export function xpModsActive(mods: XpMods | undefined): boolean {
  if (!mods) return false;
  if (mods.wellFed || mods.sleepingBag) return true;
  const policy = mods.restedPolicy ?? "none";
  return policy === "fromGame" || policy === "perSession";
}

/** Drop empty / off fields so stored profiles stay on the worst-case path. */
export function packXpMods(mods: XpMods | undefined): XpMods | undefined {
  if (!mods) return undefined;
  const out: XpMods = {};
  if (mods.wellFed) out.wellFed = true;
  if (mods.sleepingBag) out.sleepingBag = true;
  if (mods.restedPolicy === "fromGame" || mods.restedPolicy === "perSession") out.restedPolicy = mods.restedPolicy;
  const rank = mods.legacyWellRestedRank;
  if (typeof rank === "number" && Number.isFinite(rank) && rank > 0) {
    out.legacyWellRestedRank = Math.min(5, Math.floor(rank));
  }
  return xpModsActive(out) || out.legacyWellRestedRank ? out : undefined;
}

/** Safe read for old profiles whose `options` has no `xpMods`. */
export function readXpMods(raw: unknown): XpMods {
  if (!raw || typeof raw !== "object") return {};
  const m = raw as XpMods;
  return {
    wellFed: m.wellFed === true,
    sleepingBag: m.sleepingBag === true,
    restedPolicy: m.restedPolicy === "fromGame" || m.restedPolicy === "perSession" ? m.restedPolicy : "none",
    legacyWellRestedRank:
      typeof m.legacyWellRestedRank === "number" && Number.isFinite(m.legacyWellRestedRank)
        ? Math.min(5, Math.max(0, Math.floor(m.legacyWellRestedRank)))
        : 0,
  };
}

interface XpCursor {
  level: number;
  xpInto: number;
}

function splitFractional(f: number): XpCursor {
  if (f >= 60) return { level: 60, xpInto: 0 };
  const level = Math.max(1, Math.min(59, Math.floor(f + 1e-6)));
  const need = xpToNext(level);
  const frac = Math.max(0, f - level);
  return { level, xpInto: Math.min(need, Math.round(frac * need)) };
}

function fractional(level: number, xpInto: number): number {
  if (level >= 60) return 60;
  const need = xpToNext(level);
  if (need <= 0) return level;
  return Math.round((level + xpInto / need) * 100) / 100;
}

/** Returns the level just reached, or 0 when this grant did not cross a level. */
function addXp(state: XpCursor, amount: number): number {
  if (amount <= 0 || state.level >= 60) return 0;
  let leveledTo = 0;
  let left = amount;
  while (left > 0 && state.level < 60) {
    const need = xpToNext(state.level);
    if (need <= 0) {
      state.level = 60;
      state.xpInto = 0;
      break;
    }
    const room = need - state.xpInto;
    if (left < room) {
      state.xpInto += left;
      left = 0;
    } else {
      left -= room;
      state.xpInto = 0;
      state.level += 1;
      leveledTo = state.level;
      if (state.level >= 60) {
        state.level = 60;
        state.xpInto = 0;
        left = 0;
      }
    }
  }
  return leveledTo;
}

function subtractXp(level: number, xpInto: number, amount: number): XpCursor {
  let left = Math.max(0, amount);
  while (left > 0) {
    if (xpInto >= left) {
      xpInto -= left;
      break;
    }
    left -= xpInto;
    if (level <= 1) {
      xpInto = 0;
      break;
    }
    level -= 1;
    xpInto = xpToNext(level);
  }
  return { level, xpInto };
}

function xpGap(level: number, xpInto: number, targetLevel: number, targetXpInto: number): number {
  const toL = Math.min(60, Math.max(1, Math.floor(targetLevel)));
  const toXp = toL >= 60 ? 0 : Math.max(0, targetXpInto);
  if (level > toL || (level === toL && xpInto >= toXp) || level >= 60) return 0;
  if (level === toL) return toXp - xpInto;
  let sum = xpToNext(level) - xpInto;
  for (let l = level + 1; l < toL; l++) sum += xpToNext(l);
  if (toL < 60) sum += toXp;
  return Math.max(0, sum);
}

/**
 * Recompute one guide's route. `null` means callers should keep `step.sim`.
 * Steps with no baked sim for `route` are left out of the walk.
 */
export function recomputeGuideSims(
  steps: readonly Step[],
  route: RouteStyle,
  mods: XpMods | undefined,
  xpRested?: number,
): Map<string, StepSim> | null {
  if (!xpModsActive(mods)) return null;
  const withSim = steps.filter((s) => s.sim?.[route]);
  if (!withSim.length) return null;

  const first = withSim[0]!.sim![route]!;
  const end = splitFractional(first.level);
  const state = subtractXp(end.level, end.xpInto, first.gained);
  let pool = initialRestedPool(mods, { level: state.level, xpRested });
  const out = new Map<string, StepSim>();

  for (const step of withSim) {
    const base = step.sim![route]!;
    let levelUp = 0;
    let gained = 0;
    const grant = (amount: number) => {
      if (amount <= 0) return;
      gained += amount;
      const up = addXp(state, amount);
      if (up) levelUp = Math.max(levelUp, up);
    };

    const questRows = (base.questXp ?? []).map((q) => ({ ...q }));
    for (const q of questRows) {
      const applied = applyXpMods(mods, { kind: "quest", amount: q.xp, level: state.level, restedPool: pool });
      pool = applied.restedPool;
      q.xp = applied.amount;
      grant(applied.amount);
    }

    const bakedQuest = (base.questXp ?? []).reduce((n, q) => n + q.xp, 0);
    const killBase = Math.max(0, base.gained - bakedQuest);
    const grind = step.actions.find((a) => a.type === "xp");
    const sim: StepSim = { level: 0, gained: 0 };

    if (grind && grind.type === "xp") {
      const gap = xpGap(state.level, state.xpInto, grind.level, grind.extra ?? 0);
      if (gap <= 0) {
        sim.grindSkip = true;
        sim.grindKillXp = 0;
      } else {
        const g = grindKillXpForGap(mods, { gain: gap, level: state.level, restedPool: pool });
        pool = g.restedPool;
        sim.grindKillXp = g.grindKillXp;
        grant(gap);
      }
    } else if (killBase > 0) {
      const applied = applyXpMods(mods, { kind: "kill", amount: killBase, level: state.level, restedPool: pool });
      pool = applied.restedPool;
      grant(applied.amount);
    }

    sim.level = fractional(state.level, state.xpInto);
    sim.gained = gained;
    if (levelUp) sim.levelUp = levelUp;
    if (questRows.length) sim.questXp = questRows;
    if (base.next && sim.levelUp === base.levelUp) sim.next = base.next;
    out.set(step.id, sim);
  }
  return out;
}
