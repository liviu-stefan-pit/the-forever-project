import type { Guide, RouteStyle } from "../data/schema";
import { prettifySlug } from "./levels";
import { ROUTE_CHAINS, resolveNextGuide } from "./routeChains";

export type GuideSuccessor = Pick<Guide, "slug" | "next" | "nextByRoute">;

/**
 * Route-aware next guide. Prefer `resolveNextGuide` when it returns a slug.
 * When it returns undefined (off-chain dungeon, terminal wrapup, or a pack that
 * is not on this style — Silverpine on speedrun), fall through to
 * `nextByRoute[style]` then `guide.next` so a player who opened that pack can
 * still continue.
 */
export function successorSlug(guide: GuideSuccessor, routeStyle: RouteStyle): string | undefined {
  const resolved = resolveNextGuide(guide.slug, routeStyle);
  if (resolved) return resolved;
  return guide.nextByRoute?.[routeStyle] ?? guide.next;
}

/** Real `displayName` from loaded guide JSON; `prettifySlug` only when the name is unknown. */
export function guideName(slug: string, displayName?: string): string {
  const name = displayName?.trim();
  return name ? name : prettifySlug(slug);
}

export const GUIDE_STEP_COUNT_TITLE =
  "The first number is steps in the current route for this race and class. The number in parentheses is every step in the guide including other routes, classes, and dungeon steps.";

/** Visible (ring) count first; full `guide.steps.length` in parentheses when they differ. */
export function formatGuideStepCount(visibleTotal: number, fullCount: number): string {
  if (visibleTotal <= 0) return `${fullCount} steps`;
  if (visibleTotal === fullCount) return `${visibleTotal} steps`;
  return `${visibleTotal} steps (${fullCount} total)`;
}

/** Pack on the balanced chain but not speedrun (Silverpine 11–15). */
export function isBalancedOnlyPack(slug: string): boolean {
  const onBalanced = ROUTE_CHAINS.some((c) => c.packs.balanced.includes(slug));
  const onSpeedrun = ROUTE_CHAINS.some((c) => c.packs.speedrun.includes(slug));
  return onBalanced && !onSpeedrun;
}
