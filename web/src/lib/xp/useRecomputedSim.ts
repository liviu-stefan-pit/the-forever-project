/**
 * Reader hook over `recomputeGuideSims`.
 * Questie tables are not in the client bundle (they are huge and build-only),
 * so this does not call `simulateWalk` / `simulateGuides`.
 * When `options.dungeons` is on and steps carry `simDungeons` (written by the data build's
 * dungeons-on walk), that payload is the base. Solo `step.sim` is left untouched.
 * Buffs scale baked quest and kill XP via `applyXpMods`. Rested is spent in
 * step order. A Durotar buff does not move Barrens: only the open guide is
 * walked, from the baked arrival of its first simulated step.
 */
import { useMemo } from "react";
import type { RouteStyle, Step, StepSim } from "../../data/schema";
import { useProfileApi } from "../../state/profile";
import { recomputeGuideSims } from "./recomputeSim";

/** `null` when bonuses are off — callers keep the baked `step.sim`. */
export function useRecomputedSim(steps: readonly Step[] | undefined, route: RouteStyle): Map<string, StepSim> | null {
  const api = useProfileApi();
  const mods = api.active?.options.xpMods;
  const xpRested = api.active?.xpRested;
  const dungeons = api.progressProfile.options.dungeons === true;
  return useMemo(() => {
    if (!steps) return null;
    if (!dungeons) return recomputeGuideSims(steps, route, mods, mods?.restedPolicy === "fromGame" ? xpRested : undefined);
    const has = steps.some((s) => s.simDungeons?.[route]);
    if (!has) return recomputeGuideSims(steps, route, mods, mods?.restedPolicy === "fromGame" ? xpRested : undefined);
    const view = steps.map((s) => (s.simDungeons ? { ...s, sim: s.simDungeons } : s));
    const recomputed = recomputeGuideSims(view, route, mods, mods?.restedPolicy === "fromGame" ? xpRested : undefined);
    if (recomputed) return recomputed;
    const map = new Map<string, StepSim>();
    for (const s of steps) {
      const sim = s.simDungeons?.[route];
      if (sim) map.set(s.id, sim);
    }
    return map;
  }, [steps, route, mods, xpRested, dungeons]);
}
