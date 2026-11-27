/** Left level timeline: 1→60 scale, race start, brackets → guides with progress rings. */
import { memo } from "react";
import { NavLink } from "react-router";
import { guideTitleOf, useGuideIndex } from "../../data/hooks";
import { parseRange, levelToFraction } from "../../lib/levels";
import { isBalancedOnlyPack } from "../../lib/nextGuide";
import { useCurrentGuideSlug, useGuideCompletion, useRouteStyle } from "../../state/progress";
import { useRoutePosition } from "../../state/position";
import { pickRaceStart, useActiveProfileSummary } from "../../state/profile";
import { PLAYTESTED_LABEL } from "../ui/ExperimentalBadge";
import { Icon } from "../ui/Icon";
import { ProgressRing } from "../ui/ProgressRing";
import { Skeleton } from "../ui/States";

const GuideRow = memo(function GuideRow({
  slug,
  name,
  collapsed,
  current,
  offRoute,
  tested,
}: {
  slug: string;
  name: string;
  collapsed: boolean;
  current: boolean;
  /** On speedrun, Silverpine is not part of the route — dimmed but still clickable. */
  offRoute: boolean;
  /** The pack's status is play-tested: a small green "Tested" tag next to the name (a check would read as "you finished it"). */
  tested: boolean;
}) {
  const stats = useGuideCompletion(slug, { defer: true });
  const value = stats && stats.total > 0 ? stats.done / stats.total : undefined;
  const pct = value === undefined ? undefined : Math.round(value * 100);
  const stepsLabel = stats && stats.total > 0 ? `${stats.done}/${stats.total} steps` : undefined;
  const titleBits = [name, tested ? PLAYTESTED_LABEL : undefined, offRoute ? "Balanced" : undefined, pct !== undefined ? `${pct}%` : undefined].filter(Boolean);

  return (
    <li>
      <NavLink
        to={`/guide/${slug}`}
        title={collapsed ? titleBits.join(" · ") : undefined}
        className={({ isActive }) =>
          `group relative flex items-center gap-2.5 rounded-sm py-1.5 transition ${collapsed ? "justify-center px-1" : "px-2"} ${
            offRoute ? "opacity-55" : ""
          } ${
            isActive ? "bg-horde-700/40 text-ink" : current ? "text-ink hover:bg-canvas/50" : "text-bronze-300/70 hover:bg-canvas/50 hover:text-ink"
          }`
        }
      >
        {current && !collapsed && <span aria-hidden="true" className="absolute -left-[11px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-canvas bg-bronze-400 shadow-[0_0_10px_rgba(255,209,0,0.7)]" />}
        <ProgressRing value={value} size={collapsed ? 30 : 26} label={collapsed ? "" : undefined} />
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="min-w-0 truncate text-[13px] font-medium">{name}</span>
              {tested && (
                <span
                  title={`${PLAYTESTED_LABEL}: we played this route in the game and checked it`}
                  data-testid="timeline-tested"
                  className="shrink-0 rounded-sm border border-done/50 bg-done/10 px-1 text-[9px] font-semibold uppercase tracking-wider text-done"
                >
                  Tested
                </span>
              )}
              {offRoute && (
                <span className="shrink-0 rounded-sm border border-stroke px-1 text-[9px] font-semibold uppercase tracking-wider text-bronze-500/90">
                  Balanced
                </span>
              )}
            </span>
            <span className="block text-[10px] text-bronze-500/80">
              {stepsLabel ?? ""}
              {current && <span className="text-bronze-400"> · you are here</span>}
            </span>
          </span>
        )}
      </NavLink>
    </li>
  );
});

function LevelScale({ level }: { level: number }) {
  const f = levelToFraction(level);
  return (
    <div className="px-1">
      <div className="relative h-1.5 rounded-full bg-stroke">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-bronze-500 via-bronze-400 to-bronze-400" style={{ width: `${Math.max(1.5, f * 100)}%` }} />
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-bronze-400 shadow-[0_0_8px_rgba(255,209,0,0.8)]" style={{ left: `${f * 100}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-bronze-500/80">
        <span>1</span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
      </div>
    </div>
  );
}

export function Timeline({ collapsed = false, onToggleCollapsed }: { collapsed?: boolean; onToggleCollapsed?: () => void }) {
  const indexRes = useGuideIndex();
  const currentSlug = useCurrentGuideSlug();
  const routeStyle = useRouteStyle();
  const profile = useActiveProfileSummary();
  const pos = useRoutePosition();

  return (
    <nav aria-label="Level timeline" className="flex h-full flex-col">
      <div className={`flex items-center gap-2 border-b border-stroke/70 py-3 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {!collapsed && <h2 className="font-display text-sm font-bold tracking-wider text-bronze-400">Route 1–60</h2>}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-sm p-1.5 text-bronze-500/80 transition hover:bg-canvas/50 hover:text-bronze-300"
            aria-label={collapsed ? "Expand timeline" : "Collapse timeline"}
            aria-expanded={!collapsed}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? "px-1.5 py-3" : "px-3 py-4"}`}>
        {indexRes.status === "loading" && (
          <div className="space-y-3 px-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        )}
        {indexRes.status === "error" && !collapsed && (
          <p className="px-1 text-xs text-rt-warn">
            Could not load the route index.{" "}
            <button type="button" className="underline" onClick={indexRes.retry}>
              Retry
            </button>
          </p>
        )}
        {indexRes.status === "ready" && (
          <div className="space-y-5">
            {!collapsed && <LevelScale level={pos.level} />}

            {!collapsed && (
              <section aria-labelledby="tl-start">
                <h3 id="tl-start" className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-500/80">
                  Race start
                </h3>
                <ul className="space-y-1">
                  {indexRes.data.starts.map((s) => {
                    const mine = pickRaceStart(indexRes.data, profile?.race) === s;
                    return (
                      <li key={s.label}>
                        <NavLink
                          to={`/guide/${s.firstGuide}`}
                          className={`flex items-center gap-2 rounded-sm border px-2.5 py-2 text-[13px] transition ${
                            mine ? "border-horde-500/40 bg-horde-700/25 text-bronze-300" : "border-transparent text-bronze-500/80 hover:border-stroke hover:text-ink"
                          }`}
                        >
                          <Icon name="flag" className="h-3.5 w-3.5 shrink-0" />
                          <span className="min-w-0 truncate">{s.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {indexRes.data.brackets.map((b) => {
              const [lo, hi] = parseRange(b.label);
              const active = pos.level >= lo && pos.level < hi + 1;
              return (
                <section key={b.label} aria-label={`Levels ${b.label}`}>
                  {collapsed ? (
                    <div className={`mb-1 text-center text-[10px] font-bold tabular-nums ${active ? "text-bronze-400" : "text-bronze-500/80"}`}>{b.label}</div>
                  ) : (
                    <h3 className="mb-1.5 flex items-center gap-2 px-1">
                      <span className={`font-display text-xs font-bold tracking-wider ${active ? "text-bronze-400" : "text-bronze-300/70"}`}>Lv {lo}–{hi}</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-stroke to-transparent" />
                    </h3>
                  )}
                  <ul className={`space-y-0.5 ${collapsed ? "" : "ml-1.5 border-l border-stroke/80 pl-2"}`}>
                    {b.guides.map((slug) => (
                      <GuideRow
                        key={slug}
                        slug={slug}
                        name={guideTitleOf(indexRes.data, slug)}
                        collapsed={collapsed}
                        current={slug === currentSlug}
                        offRoute={routeStyle === "speedrun" && isBalancedOnlyPack(slug)}
                        tested={indexRes.data.entries?.find((e) => e.slug === slug)?.status === "play-tested"}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="border-t border-stroke/70 px-4 py-3 text-[11px] text-bronze-500/80 touch:hidden">
          <div className="flex items-center gap-1.5">
            <Icon name="keyboard" className="h-3.5 w-3.5" />
            <span>
              <kbd className="text-ink">j</kbd>/<kbd className="text-ink">k</kbd> move · <kbd className="text-ink">space</kbd> done ·{" "}
              <kbd className="text-ink">n</kbd> next · <kbd className="text-ink">/</kbd> search
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
