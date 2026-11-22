import { memo } from "react";
import { Link, useSearchParams } from "react-router";
import { Icon } from "../components/ui/Icon";
import { ProgressRing } from "../components/ui/ProgressRing";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { dataOf, useGuideIndex, useInsights } from "../data/hooks";
import type { GuideIndex } from "../data/schema";
import { issueHref, overviewIssues, overviewZoneMatch } from "../lib/overview";
import { prettifySlug } from "../lib/levels";
import { useGuideCompletion } from "../state/progress";
import { ExperimentalBadge } from "../components/ui/ExperimentalBadge";

const OverviewGuideRow = memo(function OverviewGuideRow({
  slug,
  zoneFilter,
  stepIds,
}: {
  slug: string;
  zoneFilter: string;
  stepIds: readonly string[] | undefined;
}) {
  const stats = useGuideCompletion(slug, { stepIds, defer: true });
  if (!overviewZoneMatch(slug, undefined, zoneFilter)) return null;
  const value = stats && stats.total > 0 ? stats.done / stats.total : undefined;
  const name = prettifySlug(slug);
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
          </span>
        </span>
        <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-bronze-500/60" />
      </Link>
    </li>
  );
});

function BracketList({ index, zoneFilter }: { index: GuideIndex; zoneFilter: string }) {
  return (
    <section className="space-y-3">
      {index.brackets.map((b) => (
        <div key={b.label} className="wow-frame p-4">
          <h2 className="font-display text-base font-bold text-bronze-400">Levels {b.label.replace("-", "–")}</h2>
          <ul className="mt-2 space-y-2">
            {b.guides.map((g) => (
              <OverviewGuideRow key={g} slug={g} zoneFilter={zoneFilter} stepIds={index.entries?.find((e) => e.slug === g)?.stepIds} />
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

  if (indexRes.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
        <ErrorState title="Could not load the route" error={indexRes.error} retry={indexRes.retry} />
      </div>
    );
  }

  const issues = overviewIssues(insights);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-7 sm:px-6">
      <header className="panel-animate space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">Route</p>
          <ExperimentalBadge />
        </div>
        <h1 className="font-display text-3xl font-bold text-bronze-400">Overview</h1>
        {zoneFilter && <p className="text-sm text-bronze-300/70">Showing guides that mention {zoneFilter}.</p>}
      </header>

      {indexRes.status === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <BracketList index={indexRes.data} zoneFilter={zoneFilter} />
      )}

      <section className="wow-frame p-4">
        <h2 className="font-display text-base font-bold text-bronze-400">Issues</h2>
        {insightsRes.status === "loading" ? (
          <Skeleton className="mt-3 h-16 w-full" />
        ) : issues.length === 0 ? (
          <div className="mt-3">
            <EmptyState icon="info" title="No route issues">
              Insights has nothing to report for this build.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-ink">
            {issues.map((i, n) => {
              const href = issueHref(i);
              return (
                <li key={n} className="flex gap-2">
                  <Icon
                    name={i.severity === "warn" ? "alert" : "info"}
                    className={`mt-0.5 h-4 w-4 shrink-0 ${i.severity === "warn" ? "text-rt-warn" : "text-bronze-400"}`}
                  />
                  {href ? (
                    <Link to={href} className="hover:text-bronze-300 hover:underline">
                      {i.msg}
                    </Link>
                  ) : (
                    <span>{i.msg}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
