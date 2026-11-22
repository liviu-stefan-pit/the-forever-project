import { Link } from "react-router";
import { dataOf, useGuide } from "../../data/hooks";
import type { Guide, GuideIndex, Insights } from "../../data/schema";
import { bracketOf } from "../../lib/levels";
import {
  formatGuideStepCount,
  GUIDE_STEP_COUNT_TITLE,
  guideName,
  successorSlug,
} from "../../lib/nextGuide";
import { fmtPlayTime, guideMinutes } from "../../lib/timeEstimate";
import { useGuideCompletion, useRouteStyle } from "../../state/progress";
import { ExperimentalBadge } from "../ui/ExperimentalBadge";
import { Icon } from "../ui/Icon";
import { ProgressRing } from "../ui/ProgressRing";

export function GuideHeader({
  guide,
  index,
  insights,
  done: doneProp,
  total: totalProp,
  bonusHidden,
  onJumpCurrent,
  onMarkUpToHere,
  expectedLevel,
}: {
  guide: Guide;
  index: GuideIndex | undefined;
  insights: Insights | undefined;
  done?: number;
  total?: number;
  bonusHidden: number;
  onJumpCurrent: () => void;
  onMarkUpToHere?: () => void;
  /** Fractional expected level at the reader's current step (`step.sim[route].level`). */
  expectedLevel?: number;
}) {
  const routeStyle = useRouteStyle();
  const completion = useGuideCompletion(guide.slug, { defer: true });
  const done = doneProp ?? completion?.done ?? 0;
  const total = totalProp ?? completion?.total ?? 0;
  const bracket = index ? bracketOf(index, guide.slug) : undefined;
  const nextSlug = successorSlug(guide, routeStyle);
  const nextLoaded = dataOf(useGuide(nextSlug));
  const nextLabel = nextSlug ? guideName(nextSlug, nextLoaded?.displayName) : undefined;
  const nextInIndex = !!nextSlug && !!index?.brackets.some((b) => b.guides.includes(nextSlug));
  const nextComplete = total > 0 && done >= total;
  const added = insights?.added[guide.slug] ?? [];
  const bonusXp = added.reduce((n, a) => n + a.xp, 0);
  const frac = total ? done / total : 0;
  const bonusCount = guide.steps.filter((s) => s.bonus).length;
  const minutes = guideMinutes(index, guide.slug, routeStyle);

  return (
    <header className="panel-animate space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze-500/80">
        {bracket && <span className="text-bronze-400">Levels {bracket.replace("-", "–")}</span>}
        {bracket && <span aria-hidden="true">·</span>}
        <span>{guide.subgroup}</span>
        <ExperimentalBadge />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-bronze-400 sm:text-4xl">{guide.displayName}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bronze-300/70">
            <span>
              Level <span className="font-semibold text-ink">{guide.minLevel}–{guide.maxLevel}</span>
            </span>
            {expectedLevel != null && (
              <>
                <span aria-hidden="true">·</span>
                <span title="Where the route's XP estimate puts you at your current step">
                  You should be level <span className="font-semibold text-ink">{Math.floor(expectedLevel)}</span> here
                </span>
              </>
            )}
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              <ZoneList zones={guide.zones} />
            </span>
            <span aria-hidden="true">·</span>
            <span title={GUIDE_STEP_COUNT_TITLE}>{formatGuideStepCount(total, guide.steps.length)}</span>
            {minutes !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span title="Rough solo play time for this guide on your route">about {fmtPlayTime(minutes)}</span>
              </>
            )}
          </p>
        </div>
        <div className="wow-frame flex w-full items-center gap-3 px-3 py-2 sm:w-auto">
          <ProgressRing value={frac} size={40} stroke={4} label={`${Math.round(frac * 100)}%`} />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 text-xs leading-tight sm:block">
            <div className="w-full font-semibold text-ink">
              {done} / {total} done
            </div>
            <button type="button" onClick={onJumpCurrent} className="inline-flex min-h-touch items-center gap-1 text-bronze-400 transition hover:text-bronze-300 sm:mt-0.5">
              Jump to current <kbd className="hidden rounded-sm border border-stroke px-1 text-[10px] text-bronze-500/80 sm:inline touch:hidden">n</kbd>
            </button>
            {onMarkUpToHere && (
              <button type="button" onClick={onMarkUpToHere} className="flex min-h-touch items-center text-left text-[11px] text-bronze-500/80 transition hover:text-ink">
                Mark everything up to here
              </button>
            )}
          </div>
        </div>
      </div>

      {(bonusCount > 0 || nextSlug) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {bonusCount > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 ${
                routeStyle === "balanced" ? "border-bronze-500/35 bg-bronze-900/30 text-bronze-300" : "border-stroke text-bronze-500/80"
              }`}
            >
              <Icon name="sparkle" className="h-3.5 w-3.5" />
              {routeStyle === "balanced"
                ? `${bonusCount} bonus step${bonusCount === 1 ? "" : "s"}${bonusXp ? ` · +${bonusXp.toLocaleString()} XP` : ""}`
                : `Speedrun: ${bonusHidden} Balanced extra${bonusHidden === 1 ? "" : "s"} hidden`}
            </span>
          )}
          {nextSlug &&
            (nextInIndex ? (
              <Link
                to={`/guide/${nextSlug}`}
                className={`items-center gap-1.5 rounded-sm border px-2.5 py-1 transition ${nextComplete ? "inline-flex" : "hidden sm:inline-flex"} ${
                  nextComplete
                    ? "border-bronze-400 bg-bronze-500/25 font-semibold text-bronze-200 hover:border-bronze-300 hover:bg-bronze-500/35"
                    : "border-bronze-500/60 text-ink hover:border-bronze-400 hover:text-bronze-300"
                }`}
              >
                Next guide: {nextLabel} <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-stroke px-2.5 py-1 text-bronze-500/80" title="Not in the current data build">
                Next: {nextLabel} (not built yet)
              </span>
            ))}
        </div>
      )}
    </header>
  );
}

/** Long guides (e.g. 40–60 with 70+ zones) list the first few zones and fold the rest. */
export const ZONE_LIST_MAX = 6;

export function ZoneList({ zones }: { zones: readonly string[] }) {
  const unique = [...new Set(zones)];
  if (unique.length <= ZONE_LIST_MAX) return <span className="min-w-0 break-words">{unique.join(", ")}</span>;
  const rest = unique.length - ZONE_LIST_MAX;
  return (
    <span className="min-w-0 break-words" title={unique.join(", ")}>
      {unique.slice(0, ZONE_LIST_MAX).join(", ")} <span className="text-bronze-500/80">+{rest} more</span>
    </span>
  );
}
