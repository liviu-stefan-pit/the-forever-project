/**
 * Where the reader is on the 1→60 route: current guide, estimated level, bracket and
 * overall fraction. Cheap: only the current guide is loaded (lazy), other guides use
 * their slug's level range.
 */
import { dataOf, useGuide, useGuideIndex } from "../data/hooks";
import type { Guide, GuideIndex, Step } from "../data/schema";
import { bracketOf, estimateLevel, levelToFraction, slugRange } from "../lib/levels";
import { useCurrentCursor, useEngine, useGuideCompletion } from "./progress";
import { countsInProgress } from "./stepRequirement";
import { pickRaceStart, useActiveProfileSummary } from "./profile";
import { useVisibility, type VisibilityEvaluator } from "./visibility";

export interface RoutePosition {
  index?: GuideIndex;
  /** Current guide slug (cursor, else the race start). */
  guideSlug?: string;
  guide?: Guide;
  stepId?: string;
  level: number;
  /** 0..1 along 1→60. */
  overall: number;
  /**
   * 0..1 within the current guide (countable steps done).
   * Undefined until that guide's JSON and the quest database are both loaded.
   * 0 when the loaded guide has no countable steps.
   */
  guideFraction: number | undefined;
  bracket?: string;
}

export function guideCompletion(
  guide: Guide,
  isDone: (id: string) => boolean,
  vis: VisibilityEvaluator,
  /** Steps that return false are in neither the done count nor the total. Default: count every listed step. */
  counts: (step: Step) => boolean = () => true,
  /** When passed, use the engine's per-revision snapshot instead of walking every step. */
  engine?: { guideCompletion?(slug: string): { done: number; total: number } | undefined },
): { done: number; total: number } {
  const cached = engine?.guideCompletion?.(guide.slug);
  if (cached) return cached;
  let done = 0;
  let total = 0;
  for (const s of guide.steps) {
    const shown = vis.step(s);
    // Hide done only collapses the reader list. Those steps still belong in the ratio.
    // not_applicable is in neither count, whether hidden or still rendered.
    if (shown.reason === "not_applicable") continue;
    if (!shown.visible && shown.reason !== "done") continue;
    if (!counts(s)) continue;
    total++;
    if (isDone(s.id)) done++;
  }
  return { done, total };
}

/**
 * List / overview / timeline ring. `undefined` until that guide's JSON is loaded
 * (and when it has no countable steps). Never a fake 0 from `countDone`.
 */
export function guideListFraction(
  guide: Guide | undefined,
  isDone: (id: string) => boolean,
  vis: VisibilityEvaluator,
  counts?: (step: Step) => boolean,
  engine?: { guideCompletion?(slug: string): { done: number; total: number } | undefined },
): number | undefined {
  if (!guide) return undefined;
  const { done, total } = guideCompletion(guide, isDone, vis, counts, engine);
  return total > 0 ? done / total : undefined;
}

export function useRoutePosition(): RoutePosition {
  const index = dataOf(useGuideIndex());
  const cursor = useCurrentCursor();
  const vis = useVisibility();
  const profile = useActiveProfileSummary();
  const engine = useEngine();
  const guideSlug = cursor?.guide ?? (index ? pickRaceStart(index, profile?.race)?.firstGuide : undefined);
  const guide = dataOf(useGuide(guideSlug));
  const completion = useGuideCompletion(guideSlug, { defer: true });

  let guideFraction: number | undefined;
  let level = profile?.level ?? 1;
  if (guide && completion) {
    guideFraction = completion.total ? completion.done / completion.total : 0;
    level = Math.max(level, estimateLevel(guide.minLevel, guide.maxLevel, guideFraction));
  } else if (guide && engine) {
    const isDone = (id: string) => engine.isDone(id);
    const counts = (step: Step) => countsInProgress(engine.requirement(step));
    const stats = guideCompletion(guide, isDone, vis, counts, engine);
    guideFraction = stats.total ? stats.done / stats.total : 0;
    level = Math.max(level, estimateLevel(guide.minLevel, guide.maxLevel, guideFraction));
  } else if (guideSlug) {
    const r = slugRange(guideSlug);
    if (r) level = Math.max(level, r[0]);
  }
  return {
    index,
    guideSlug,
    guide,
    stepId: cursor?.guide === guideSlug ? cursor?.step : undefined,
    level,
    overall: levelToFraction(level),
    guideFraction,
    bracket: index && guideSlug ? bracketOf(index, guideSlug) : undefined,
  };
}
