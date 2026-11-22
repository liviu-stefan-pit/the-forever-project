/** `/` — resume button, next 5 steps, position on the 1→60 timeline. */
import { Link } from "react-router";
import { ExperimentalBadge } from "../components/ui/ExperimentalBadge";
import { RichLine } from "../components/step/RichLine";
import { StopBadge } from "../components/step/StopBadge";
import { Icon } from "../components/ui/Icon";
import { ProgressRing } from "../components/ui/ProgressRing";
import { ErrorState, Skeleton } from "../components/ui/States";
import { dataOf, useGuide, useGuideIndex, useInsights, useQuests } from "../data/hooks";
import type { GuideIndex, Step } from "../data/schema";
import { actionChip } from "../lib/actions";
import { pickNextOpenSteps } from "../lib/guideList";
import { levelToFraction, parseRange, prettifySlug } from "../lib/levels";
import { useProgress } from "../state/progress";
import { useRoutePosition, type RoutePosition } from "../state/position";
import { useVisibility } from "../state/visibility";
import { ROLE_LABEL } from "../lib/profileExtras";
import { routeLabel } from "../lib/routeStyle";
import { cardTips, type TipContext } from "../lib/stepExtras";
import { useProfileApi } from "../state/profile";
import { stepPickShouldSkip } from "../state/questProgress";

function TimelineStrip({ index, level }: { index: GuideIndex; level: number }) {
  const marker = levelToFraction(level) * 100;
  const ticks = [1, 10, 20, 30, 40, 50, 60];
  return (
    <div>
      <div className="relative h-10">
        {/* brackets */}
        <div className="absolute inset-x-0 top-3 h-4 overflow-hidden rounded-full border border-stroke bg-canvas/70">
          {index.brackets.map((b, i) => {
            const [lo, hi] = parseRange(b.label);
            const left = levelToFraction(lo) * 100;
            const width = Math.max(1, levelToFraction(hi) * 100 - left);
            const passed = level >= hi;
            const here = level >= lo && level < hi;
            return (
              <div
                key={b.label}
                className={`absolute inset-y-0 border-r border-canvas ${here ? "bg-gradient-to-r from-bronze-500 to-bronze-400" : passed ? "bg-bronze-900" : i % 2 ? "bg-stroke/60" : "bg-stroke/30"}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`Levels ${b.label}: ${b.guides.length} guide${b.guides.length === 1 ? "" : "s"}`}
              />
            );
          })}
        </div>
        <div className="absolute top-0 -translate-x-1/2" style={{ left: `${marker}%` }}>
          <div className="mx-auto h-10 w-0.5 bg-ink/90 shadow-[0_0_10px_rgba(255,209,0,0.5)]" />
        </div>
      </div>
      <div className="relative mt-1 h-4 text-[10px] tabular-nums text-bronze-500/80">
        {ticks.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${levelToFraction(t) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {index.brackets.map((b) => (
          <span key={b.label} className="rounded-sm border border-stroke bg-frame/60 px-2 py-0.5 text-[11px] text-bronze-300/70">
            {b.label.replace("-", "–")} · {b.guides.length} guide{b.guides.length === 1 ? "" : "s"}
          </span>
        ))}
      </div>
    </div>
  );
}

function NextSteps({ pos }: { pos: RoutePosition }) {
  const progress = useProgress();
  const vis = useVisibility();
  const active = useProfileApi().active;
  const quests = dataOf(useQuests());
  const ctx: TipContext = { route: progress.routeStyle, dungeons: active?.options.dungeons ?? false, cls: active?.cls, role: active?.role, professions: active?.professions };
  const guide = pos.guide;
  if (!guide || !quests) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  const visible = guide.steps.filter((s) => vis.step(s).visible);
  const isDone = (id: string) => progress.isDone(id, quests);
  const byId = new Map(guide.steps.map((s) => [s.id, s]));
  const next: Step[] = pickNextOpenSteps(
    visible.map((s) => s.id),
    {
      startId: pos.stepId,
      isDone,
      shouldSkip: (id) => {
        const step = byId.get(id);
        if (!step) return false;
        return stepPickShouldSkip(step, guide.steps, isDone, progress.stepStatus(step, quests).status);
      },
      limit: 5,
    },
  )
    .map((id) => byId.get(id))
    .filter((s): s is Step => !!s);
  if (!next.length) return <p className="text-sm text-bronze-300/70">Nothing left in this guide — on to the next one.</p>;

  return (
    <ol className="space-y-2">
      {next.map((s, i) => {
        const chip = s.actions.map((a, j) => actionChip(a, j)).find((c) => c && !c.secondary);
        const tip = cardTips(s, ctx).tip;
        return (
          <li key={s.id}>
            <Link
              to={`/guide/${guide.slug}?step=${encodeURIComponent(s.id)}`}
              className={`group flex items-start gap-3 rounded-sm border px-3 py-2.5 transition ${
                i === 0 ? "border-bronze-500/50 bg-bronze-900/20 hover:border-bronze-400" : "border-stroke bg-canvas/40 hover:border-bronze-500/50"
              } ${s.bonus ? "border-l-2 border-l-bronze-500" : ""}`}
            >
              <span className="mt-0.5 w-7 shrink-0 font-mono text-[11px] tabular-nums text-bronze-500/80">#{s.n}</span>
              {s.stop !== undefined && <StopBadge n={s.stop} bonus={!!s.bonus} size="sm" />}
              <span className="min-w-0 flex-1 text-sm leading-snug text-ink">
                {s.text[0] ? <RichLine line={s.text[0]} /> : <span className="text-bronze-500/80">{chip?.verb ?? "Step"}</span>}
                {chip && (
                  <span className="mt-0.5 block truncate text-[11px] text-bronze-300/70">
                    {chip.verb} {chip.text}
                  </span>
                )}
                {tip && (
                  <span className="mt-0.5 flex items-start gap-1 text-[11px] text-tip">
                    <Icon name="info" className="mt-px h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{tip.text}</span>
                  </span>
                )}
              </span>
              <Icon name="chevronRight" className="mt-0.5 h-4 w-4 shrink-0 text-bronze-500/60 transition group-hover:translate-x-0.5 group-hover:text-bronze-300" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function DashboardPage() {
  const indexRes = useGuideIndex();
  const pos = useRoutePosition();
  const guideRes = useGuide(pos.guideSlug);
  const insights = dataOf(useInsights());
  const progress = useProgress();
  const active = useProfileApi().active;

  if (indexRes.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState title="Could not load the route" error={indexRes.error} retry={indexRes.retry} />
      </div>
    );
  }

  const guideError = guideRes.status === "error" ? guideRes : null;
  const guideName = guideError ? "Guide unavailable" : (pos.guide?.displayName ?? (pos.guideSlug ? prettifySlug(pos.guideSlug) : ""));
  const resumeTo =
    !guideError && pos.guideSlug ? `/guide/${pos.guideSlug}${pos.stepId ? `?step=${encodeURIComponent(pos.stepId)}` : ""}` : undefined;
  const added = pos.guideSlug ? insights?.added[pos.guideSlug] ?? [] : [];
  const issues = insights?.issues.filter((i) => !pos.guideSlug || i.guide === pos.guideSlug) ?? [];
  const started = !!progress.current;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="wow-frame panel-animate relative overflow-hidden p-5 shadow-card sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-horde-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">{started ? "Welcome back" : "Your journey starts here"}</p>
              <ExperimentalBadge />
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-bronze-400 sm:text-4xl">
              {guideName ? guideName : <Skeleton className="h-9 w-56" />}
            </h1>
            <p className="text-sm text-ink">
              Estimated level <span className="font-semibold text-bronze-300">{Math.floor(pos.level)}</span>
              {pos.bracket && <> · bracket {pos.bracket.replace("-", "–")}</>} · <span className="text-horde-400">Horde</span> route to 60
            </p>
            <ul aria-label="Route settings" className="flex flex-wrap gap-2 pt-1 text-xs">
              <li className="inline-flex items-center gap-1 rounded-sm border border-stroke px-2 py-1 text-ink">
                <Icon name={progress.routeStyle === "speedrun" ? "zap" : "sparkle"} className="h-3.5 w-3.5 text-bronze-400" /> {routeLabel(progress.routeStyle)}
              </li>
              <li className="inline-flex items-center gap-1 rounded-sm border border-stroke px-2 py-1 text-ink">
                <Icon name="shield" className="h-3.5 w-3.5 text-bronze-400" /> {active ? `${active.cls}${active.role ? ` · ${ROLE_LABEL[active.role]}` : ""}` : "No class picked"}
              </li>
              <li className="inline-flex items-center gap-1 rounded-sm border border-stroke px-2 py-1 text-ink">
                <Icon name="skull" className="h-3.5 w-3.5 text-bronze-400" /> Dungeons {active?.options.dungeons ? "on" : "off"}
              </li>
            </ul>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <ProgressRing
              value={pos.guideFraction}
              size={64}
              stroke={5}
              label={pos.guideFraction !== undefined ? `${Math.round(pos.guideFraction * 100)}%` : undefined}
            />
            {resumeTo && (
              <Link
                to={resumeTo}
                className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-5 py-3 font-semibold text-ink shadow-lg shadow-horde-700/40 hover:bg-horde-400 focus-visible:outline-white"
              >
                <Icon name="play" className="h-4 w-4" strokeWidth={0} fill="currentColor" />
                {started ? "Resume" : "Start leveling"}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-5">
        <section className="wow-frame p-5 lg:col-span-3" aria-labelledby="next-steps">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="next-steps" className="font-display text-lg font-bold text-bronze-400">
              Next 5 steps
            </h2>
            {resumeTo && (
              <Link to={resumeTo} className="text-xs font-semibold text-bronze-400 hover:text-bronze-300">
                Open guide →
              </Link>
            )}
          </div>
          {guideError ? (
            <div className="space-y-3">
              <ErrorState title="Could not load this guide" error={guideError.error} retry={guideError.retry} />
              <p className="text-sm text-bronze-300/80">
                <Link to="/overview" className="font-semibold text-bronze-400 hover:text-bronze-300">
                  Open the guide list
                </Link>
              </p>
            </div>
          ) : (
            <NextSteps pos={pos} />
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="wow-frame p-5" aria-labelledby="timeline-pos">
            <h2 id="timeline-pos" className="mb-4 font-display text-lg font-bold text-bronze-400">
              Where you are · 1–60
            </h2>
            {indexRes.status === "ready" ? <TimelineStrip index={indexRes.data} level={pos.level} /> : <Skeleton className="h-16 w-full" />}
          </section>

          {(added.length > 0 || issues.length > 0) && (
            <section className="wow-frame p-5" aria-labelledby="route-notes">
              <h2 id="route-notes" className="mb-3 font-display text-lg font-bold text-bronze-400">
                Route notes
              </h2>
              <ul className="space-y-2 text-sm">
                {added.map((a, i) => (
                  <li key={`a${i}`} className="flex gap-2 rounded-sm border border-bronze-500/25 bg-bronze-900/20 p-2.5 text-bronze-300">
                    <Icon name="sparkle" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      <strong>+{a.xp} XP</strong> bonus ({a.detour}, ~{a.minutes} min)
                      <span className="block text-xs text-bronze-300/75">{a.why}</span>
                    </span>
                  </li>
                ))}
                {issues.map((it, i) => (
                  <li key={`i${i}`} className="flex gap-2 rounded-sm border border-stroke bg-canvas/40 p-2.5 text-ink">
                    <Icon name={it.severity === "warn" ? "alert" : "info"} className={`mt-0.5 h-4 w-4 shrink-0 ${it.severity === "warn" ? "text-rt-warn" : "text-bronze-400"}`} />
                    <span className="text-xs leading-relaxed">{it.msg}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="wow-frame p-5 text-xs text-bronze-500/80">
            <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-bronze-400">
              <Icon name="keyboard" className="h-4 w-4" /> Shortcuts
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                ["j / k", "next / previous step"],
                ["space", "tick step, move on"],
                ["n", "next unchecked step"],
                ["/ or Ctrl K", "search"],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt>
                    <kbd className="rounded-sm border border-stroke bg-canvas px-1.5 py-px text-ink">{k}</kbd>
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
