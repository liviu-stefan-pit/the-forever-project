/**
 * Play-time estimates from the guide index (`entries[].minutes`, solo, per route). Step minutes are
 * authored for the 20–60 packs; the 1–20 packs use the route-wide average per step, so treat
 * every figure as a rough guide, not a promise.
 */
import type { GuideIndex, RouteStyle } from "../data/schema";
import { resolveNextGuide } from "./routeChains";

type Entry = NonNullable<GuideIndex["entries"]>[number];

export function guideMinutes(index: GuideIndex | undefined, slug: string, route: RouteStyle): number | undefined {
  return index?.entries?.find((e) => e.slug === slug)?.minutes?.[route];
}

/** Minutes left: the undone share of the current guide plus every later guide on the route. */
export function minutesToSixty(
  entries: readonly Entry[],
  currentSlug: string,
  fractionDone: number,
  route: RouteStyle,
): number | undefined {
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const here = bySlug.get(currentSlug)?.minutes?.[route];
  if (here === undefined) return undefined;
  let total = here * (1 - Math.min(1, Math.max(0, fractionDone)));
  const seen = new Set([currentSlug]);
  for (let slug = resolveNextGuide(currentSlug, route); slug && !seen.has(slug); slug = resolveNextGuide(slug, route)) {
    seen.add(slug);
    total += bySlug.get(slug)?.minutes?.[route] ?? 0;
  }
  return Math.round(total);
}

/** "40 min", "5 h", "5.5 h", "112 h". */
export function fmtPlayTime(minutes: number): string {
  if (minutes < 55) return `${Math.max(5, Math.round(minutes / 5) * 5)} min`;
  const h = minutes / 60;
  if (h < 10) return `${Math.round(h * 2) / 2} h`;
  return `${Math.round(h)} h`;
}

/** "about 2 weeks at 2 h a day". */
export function fmtDays(minutes: number, hoursPerDay: number): string {
  const days = Math.ceil(minutes / 60 / hoursPerDay);
  if (days <= 1) return "a day";
  if (days < 14) return `${days} days`;
  return `${Math.round(days / 7)} weeks`;
}
