/**
 * "Start at my level": for a character who is not level 1, find the guide and step on their chain
 * that matches their level, and the earlier steps to mark done.
 */
import type { Guide, GuideIndex, RouteStyle, Step } from "../data/schema";
import { ROUTE_CHAINS } from "./routeChains";

/** Guide slugs in play order for a race start on a route (the start alone when it is on no chain). */
export function chainFor(firstGuide: string, route: RouteStyle): readonly string[] {
  return ROUTE_CHAINS.find((c) => c.packs[route][0] === firstGuide)?.packs[route] ?? [firstGuide];
}

type Entry = NonNullable<GuideIndex["entries"]>[number];

/**
 * The guide to start in at `level`: the last guide on the chain whose first step the route's XP sim
 * puts at or below that level (guide level labels are rough; the sim is what the steps assume).
 * Without sim data, the first guide that ends above the level.
 */
export function guideForLevel(chain: readonly string[], entries: readonly Entry[], level: number, route: RouteStyle = "balanced"): string | undefined {
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  if (chain.every((slug) => bySlug.get(slug)?.startLevel?.[route] !== undefined)) {
    let pick = chain[0];
    for (const slug of chain) if (Math.floor(bySlug.get(slug)!.startLevel![route]!) <= level) pick = slug;
    return pick;
  }
  for (const slug of chain) {
    const e = bySlug.get(slug);
    if (e?.maxLevel !== undefined && level < e.maxLevel) return slug;
  }
  return chain[chain.length - 1];
}

/**
 * First step of `guide` where the route's XP sim says you are at least `level`. Steps are the ones
 * the reader can see. When the sim never reaches the level, the last visible step; with no sim at
 * all, the first.
 */
export function stepForLevel(guide: Guide, level: number, route: RouteStyle, visible: (s: Step) => boolean): Step | undefined {
  const steps = guide.steps.filter(visible);
  if (level <= guide.minLevel) return steps[0];
  const hit = steps.find((s) => {
    const lv = s.sim?.[route]?.level;
    return lv !== undefined && Math.floor(lv) >= level;
  });
  if (hit) return hit;
  // The sim never reaches the level in this guide: you are near its end (the next guide starts higher).
  const simmed = steps.some((s) => s.sim?.[route]?.level !== undefined);
  return simmed ? steps[steps.length - 1] : steps[0];
}

export interface StartPlan {
  guide: string;
  step: Step;
  /** Step ids to mark done: every step of earlier guides on the chain, then earlier steps of this one. */
  doneIds: string[];
}

export function startPlan(chain: readonly string[], entries: readonly Entry[], guide: Guide, step: Step): StartPlan {
  const doneIds: string[] = [];
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  for (const slug of chain) {
    if (slug === guide.slug) break;
    doneIds.push(...(bySlug.get(slug)?.stepIds ?? []));
  }
  for (const s of guide.steps) {
    if (s.id === step.id) break;
    doneIds.push(s.id);
  }
  return { guide: guide.slug, step, doneIds };
}
