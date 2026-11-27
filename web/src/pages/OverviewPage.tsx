import { memo } from "react";
import { Link, useSearchParams } from "react-router";
import { Icon } from "../components/ui/Icon";
import { ProgressRing } from "../components/ui/ProgressRing";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { dataOf, guideTitleOf, useGuideIndex, useGuideTitle, useInsights, useQuests } from "../data/hooks";
import type { GuideIndex } from "../data/schema";
import { groupOverviewNotes, overviewIssues, overviewZoneMatch } from "../lib/overview";
import { routeStatus } from "../lib/packStatus";
import { useGuideCompletion, useRouteStyle } from "../state/progress";
import { fmtPlayTime, guideMinutes } from "../lib/timeEstimate";
import { StatusBadge } from "../components/ui/ExperimentalBadge";

const OverviewGuideRow = memo(function OverviewGuideRow({
  slug,
  name,
  zoneFilter,
  stepIds,
  minutes,
}: {
  slug: string;
  name: string;
  zoneFilter: string;
  stepIds: readonly string[] | undefined;
  minutes?: number;
}) {
  const stats = useGuideCompletion(slug, { stepIds, defer: true });
  if (!overviewZoneMatch(slug, undefined, zoneFilter)) return null;
  const value = stats && stats.total > 0 ? stats.done / stats.total : undefined;
  const stepsLabel = stats && stats.total > 0 ? `${stats.done}/${stats.total} steps` : undefined;

  return (
    <li>
      <Link
        to={`/guide/${slug}`}
        className="flex items-center gap-3 rounded-sm border border-stroke bg-canvas/40 px-3 py-2.5 transition hover:border-bronze-500/50 hover:text-ink"
      >
        <ProgressRing value={value} size={32} stroke={3} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{name}</span>
          <span className="block truncate text-[11px] text-bronze-500/80">
            {stepsLabel ?? "Guide"}
            {minutes !== undefined && ` · about ${fmtPlayTime(minutes)}`}
          </span>
        </span>
        <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-bronze-500/60" />
      </Link>
    </li>
  );
});

function BracketList({ index, zoneFilter }: { index: GuideIndex; zoneFilter: string }) {
  const route = useRouteStyle();
  return (
    <section className="space-y-3">
      {index.brackets.map((b) => (
        <div key={b.label} className="wow-frame p-4">
          <h2 className="font-display text-base font-bold text-bronze-400">Levels {b.label.replace("-", "–")}</h2>
          <ul className="mt-2 space-y-2">
            {b.guides.map((g) => (
              <OverviewGuideRow key={g} slug={g} name={guideTitleOf(index, g)} zoneFilter={zoneFilter} stepIds={index.entries?.find((e) => e.slug === g)?.stepIds} minutes={guideMinutes(index, g, route)} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function OverviewPage() {
  const indexRes = useGuideIndex();
  const insightsRes = useInsights();
  const insights = dataOf(insightsRes);
  const [params] = useSearchParams();
  const zoneFilter = params.get("zone") ?? "";
  const quests = dataOf(useQuests());
  const guideTitle = useGuideTitle();

  if (indexRes.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
        <ErrorState title="Could not load the route" error={indexRes.error} retry={indexRes.retry} />
      </div>
    );
  }

  const notes = groupOverviewNotes(overviewIssues(insights));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-7 sm:px-6">
      <header className="panel-animate space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">Route</p>
          <StatusBadge status={routeStatus(dataOf(indexRes))} />
        </div>
        <h1 className="font-display text-3xl font-bold text-bronze-400">Overview</h1>
        {zoneFilter && <p className="text-sm text-bronze-300/70">Showing guides that mention {zoneFilter}.</p>}
      </header>

      {indexRes.status === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <BracketList index={indexRes.data} zoneFilter={zoneFilter} />
      )}

      <section className="wow-frame p-4" aria-labelledby="route-notes">
        <h2 id="route-notes" className="font-display text-base font-bold text-bronze-400">
          Route notes
        </h2>
        <p className="mt-1 text-sm text-muted">Things worth knowing before you play a guide. Open a guide to see the exact steps.</p>
        {insightsRes.status === "loading" ? (
          <Skeleton className="mt-3 h-16 w-full" />
        ) : notes.length === 0 ? (
          <div className="mt-3">
            <EmptyState icon="info" title="Nothing to note">
              Every guide in the route is checked.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-3 space-y-4 text-sm text-ink">
            {notes.map((note) => (
              <li key={note.msg} className="flex gap-2.5">
                <Icon
                  name={note.severity === "warn" ? "alert" : "info"}
                  className={`mt-0.5 h-4 w-4 shrink-0 ${note.severity === "warn" ? "text-rt-warn" : "text-bronze-400"}`}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p>{note.msg}</p>
                  {note.questIds.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {note.questIds.map((id) => (
                        <li key={id}>
                          <Link to={`/quest/${id}`} className="inline-flex min-h-touch items-center rounded-sm border border-stroke px-2 text-xs font-semibold text-bronze-400 hover:border-bronze-500 hover:text-bronze-300">
                            {quests?.get(id)?.name ?? note.questNames[id] ?? `Quest ${id}`}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {note.questIds.length === 0 && note.guides.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {note.guides.map((g) => (
                        <li key={g.slug}>
                          <Link
                            to={g.firstStep ? `/guide/${g.slug}?step=${encodeURIComponent(g.firstStep)}` : `/guide/${g.slug}`}
                            className="inline-flex min-h-touch items-center gap-1 rounded-sm border border-stroke px-2 text-xs hover:border-bronze-500"
                          >
                            <span className="font-semibold text-bronze-400">{guideTitle(g.slug)}</span>
                            {g.count > 0 && <span className="text-muted">· {g.count} step{g.count === 1 ? "" : "s"}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
