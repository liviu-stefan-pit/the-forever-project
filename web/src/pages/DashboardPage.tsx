/**
 * `/` — where you are on the map, the step to do now, the next stops, level goals from the
 * XP sim, and folded route notes. Route settings, the 1→60 timeline and shortcuts live in the
 * top bar and sidebar, so they are not repeated here.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { GoldGoal } from "../components/dashboard/GoldGoal";
import { QuickStart } from "../components/dashboard/QuickStart";
import { StartHere } from "../components/dashboard/StartHere";
import { RouteMap } from "../components/dashboard/RouteMap";
import { TONE } from "../components/step/ActionChips";
import { RichLine } from "../components/step/RichLine";
import { ExperimentalBadge } from "../components/ui/ExperimentalBadge";
import { Icon } from "../components/ui/Icon";
import { ErrorState, Skeleton } from "../components/ui/States";
import { publicAsset, type ZonePoint } from "../components/map/route";
import { dataOf, useGuide, useGuideIndex, useGuideTitle, useInsights, useQuests, useZones } from "../data/hooks";
import type { Guide, Step, StepSim } from "../data/schema";
import type { QuestMap } from "../data/loader";
import { actionChip } from "../lib/actions";
import {
  finishLevel,
  groupIntoStops,
  groupNotes,
  levelBefore,
  levelMilestones,
  stepRange,
  type NoteGroup,
  type StopGroup,
} from "../lib/dashboard";
import { pickNextOpenSteps } from "../lib/guideList";
import { cardTips, type TipContext } from "../lib/stepExtras";
import { stepSpot } from "../lib/stepPoints";
import { fmtDays, fmtPlayTime, minutesToSixty } from "../lib/timeEstimate";
import { useRecomputedSim } from "../lib/xp/useRecomputedSim";
import { useProfileApi } from "../state/profile";
import { useProgress } from "../state/progress";
import { useRoutePosition, type RoutePosition } from "../state/position";
import { stepPickShouldSkip } from "../state/questProgress";
import { useVisibility } from "../state/visibility";

const MAX_STOPS = 5;

function questNameOf(step: Step, quests: QuestMap): string | undefined {
  for (const a of step.actions) {
    if (!("questId" in a) || typeof a.questId !== "number") continue;
    const name = quests.get(a.questId)?.name ?? ("label" in a && typeof a.label === "string" ? a.label : undefined);
    if (name) return name;
  }
  return undefined;
}

function npcOf(step: Step, quests: QuestMap): string | undefined {
  for (const a of step.actions) {
    if (a.type === "turnin") return quests.get(a.questId)?.end[0]?.name;
    if (a.type === "accept") return quests.get(a.questId)?.start[0]?.name;
  }
  return undefined;
}

function fmtCoord(p: { x: number; y: number }): string {
  return `${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;
}

/** Everything the dashboard derives from the current guide. Undefined until the guide and quests load. */
function useDashboardModel(pos: RoutePosition, guide: Guide | undefined, quests: QuestMap | undefined) {
  const progress = useProgress();
  const vis = useVisibility();
  const active = useProfileApi().active;
  const route = progress.routeStyle;
  const recomputed = useRecomputedSim(guide?.steps, route);
  const dungeons = active?.options.dungeons === true;

  return useMemo(() => {
    if (!guide || !quests) return undefined;
    const simOf = (s: Step): StepSim | undefined =>
      recomputed?.get(s.id) ?? (dungeons ? s.simDungeons?.[route] : undefined) ?? s.sim?.[route];
    const sectionMap = new Map(guide.sections.map((sec) => [sec.id, sec.mapId]));
    const mapOf = (s: Step) => (s.section ? sectionMap.get(s.section) : undefined);
    const spotOf = (s: Step) => {
      const mapId = mapOf(s);
      return mapId === undefined ? undefined : stepSpot(s, mapId, vis.line);
    };

    const visible = guide.steps.filter((s) => vis.step(s).visible);
    const byId = new Map(guide.steps.map((s) => [s.id, s]));
    const isDone = (id: string) => progress.isDone(id, quests);
    const open = pickNextOpenSteps(
      visible.map((s) => s.id),
      {
        startId: pos.stepId,
        isDone,
        shouldSkip: (id) => {
          const step = byId.get(id);
          return step ? stepPickShouldSkip(step, guide.steps, isDone, progress.stepStatus(step, quests).status) : false;
        },
        limit: visible.length,
      },
    )
      .map((id) => byId.get(id))
      .filter((s): s is Step => !!s);

    const now = open[0];
    const stops = groupIntoStops(open.slice(1), {
      spotOf,
      simOf,
      npcOf: (s) => npcOf(s, quests),
      maxStops: MAX_STOPS,
    });

    // Map: the zone of the current step (else the first stop), with the recent trail on that map.
    const heroMapId = (now && mapOf(now)) ?? (stops[0]?.steps[0] && mapOf(stops[0].steps[0]));
    const nowSpot = now ? spotOf(now) : undefined;
    const trail: ZonePoint[] = [];
    if (now && heroMapId !== undefined) {
      const at = visible.indexOf(now);
      for (let i = Math.max(0, at - 10); i < at; i++) {
        const s = visible[i]!;
        if (mapOf(s) !== heroMapId) continue;
        const p = spotOf(s);
        const last = trail[trail.length - 1];
        if (p && !(last && last.x === p.x && last.y === p.y)) trail.push(p);
      }
    }
    const mapStops = stops
      .filter((g) => g.spot && g.steps.some((s) => mapOf(s) === heroMapId))
      .map((g) => ({ n: g.n, spot: g.spot!, title: g.title }));

    const levelNow = levelBefore(visible, now, simOf, pos.level);
    const hasSim = visible.some((s) => simOf(s)?.level !== undefined);
    const upcomingIds = new Set(stops.flatMap((g) => g.steps.map((s) => s.id)).concat(now ? [now.id] : []));

    return {
      now,
      nowSpot,
      stops,
      trail,
      mapStops,
      heroMapId,
      levelNow,
      hasSim,
      milestones: levelMilestones(open, simOf, 4),
      finish: finishLevel(visible, simOf),
      fraction: now ? Math.max(0, visible.indexOf(now)) / Math.max(1, visible.length) : 1,
      lastN: guide.steps[guide.steps.length - 1]?.n ?? guide.steps.length,
      upcomingIds,
      nextGuide: guide.nextByRoute?.[route] ?? guide.next,
    };
  }, [guide, quests, recomputed, dungeons, route, vis, progress, pos.stepId, pos.level]);
}

type Model = NonNullable<ReturnType<typeof useDashboardModel>>;

function stepLink(slug: string, step: Step) {
  return `/guide/${slug}?step=${encodeURIComponent(step.id)}`;
}

function LevelBadge({ level }: { level: number }) {
  return <span className="shrink-0 rounded-sm bg-bronze-400 px-1.5 py-px text-[11px] font-bold text-canvas">Level {level}</span>;
}

function NowCard({ guide, model, quests }: { guide: Guide; model: Model; quests: QuestMap }) {
  const guideTitle = useGuideTitle();
  const progress = useProgress();
  const active = useProfileApi().active;
  const now = model.now;
  if (!now) {
    return (
      <div className="rounded-sm border border-done/50 bg-canvas/40 p-4 text-sm text-ink">
        <p className="font-semibold">This guide is done.</p>
        {model.nextGuide && (
          <Link to={`/guide/${model.nextGuide}`} className="mt-1 inline-block font-semibold text-bronze-400 hover:text-bronze-300">
            On to {guideTitle(model.nextGuide)} →
          </Link>
        )}
      </div>
    );
  }
  const ctx: TipContext = { route: progress.routeStyle, dungeons: active?.options.dungeons ?? false, cls: active?.cls, role: active?.role, professions: active?.professions };
  const tip = cardTips(now, ctx).tip;
  const up = model.milestones[0]?.stepsAway === 0 ? model.milestones[0].level : undefined;
  const lines = now.text.slice(0, 3);
  return (
    <div className="flex flex-col gap-2.5 rounded-sm border border-bronze-500 bg-bronze-900/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">Now · #{now.n}</span>
        {up !== undefined && <span className="rounded-sm bg-bronze-400 px-2 py-0.5 text-xs font-bold text-canvas">Level {up} when done</span>}
      </div>
      {lines.length ? (
        <div className="space-y-1">
          <p className="text-lg font-semibold leading-snug text-ink">
            <RichLine line={lines[0]!} />
          </p>
          {lines.length > 1 && (
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink/90">
              {lines.slice(1).map((l, i) => (
                <li key={i}>
                  <RichLine line={l} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-lg font-semibold text-ink">Step {now.n}</p>
      )}
      {tip && (
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-tip">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{tip.text}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          to={stepLink(guide.slug, now)}
          className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-5 py-2.5 font-semibold text-ink shadow-lg shadow-horde-700/40 hover:bg-horde-400 focus-visible:outline-white"
        >
          <Icon name="play" className="h-4 w-4" strokeWidth={0} fill="currentColor" />
          {progress.current ? `Resume at #${now.n}` : "Start leveling"}
        </Link>
        <button
          type="button"
          onClick={() => progress.toggle(now.id, now, quests)}
          className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-stroke px-4 py-2.5 text-sm font-semibold text-ink hover:border-bronze-500"
        >
          <Icon name="check" className="h-4 w-4" /> Mark done
        </button>
      </div>
    </div>
  );
}

function StopRow({ slug, stop, quests }: { slug: string; stop: StopGroup; quests: QuestMap }) {
  const progress = useProgress();
  const active = useProfileApi().active;
  const ctx: TipContext = { route: progress.routeStyle, dungeons: active?.options.dungeons ?? false, cls: active?.cls, role: active?.role, professions: active?.professions };
  const questName = (id: number) => quests.get(id)?.name;
  const chips = stop.steps.flatMap((s) => s.actions.map((a, j) => actionChip(a, j, questName)).filter((c) => c && !c.secondary)).filter((c) => !!c);
  const shown = chips.slice(0, 3);
  const tip = stop.steps.map((s) => cardTips(s, ctx).tip).find(Boolean);
  const first = stop.steps[0]!;
  return (
    <li>
      <Link to={stepLink(slug, first)} className="group flex gap-3 border-t border-bronze-900 py-3 transition hover:bg-canvas/40">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-bronze-400 text-xs font-bold tabular-nums text-bronze-300">
          {stop.n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="line-clamp-2 font-semibold text-ink">{stop.title}</span>
            <span className="text-xs tabular-nums text-muted">
              {stop.spot ? `${fmtCoord(stop.spot)} · ` : ""}
              {stepRange(stop.steps)}
            </span>
          </span>
          {shown.length > 0 && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {shown.map((c, i) => (
                <span key={i} className={`inline-flex max-w-full items-center gap-1 rounded-sm border px-1.5 py-px text-xs ${TONE[c.tone]}`}>
                  <span className="font-semibold">{c.verb}</span>
                  {c.text && <span className="truncate">{c.text}</span>}
                </span>
              ))}
              {chips.length > shown.length && <span className="text-xs text-muted">+{chips.length - shown.length} more</span>}
              {stop.levelUp !== undefined && <LevelBadge level={stop.levelUp} />}
            </span>
          )}
          {!shown.length && stop.levelUp !== undefined && (
            <span className="mt-1.5 block">
              <LevelBadge level={stop.levelUp} />
            </span>
          )}
          {tip && <span className="mt-1 line-clamp-1 text-xs text-tip">{tip.text}</span>}
        </span>
        <Icon name="chevronRight" className="mt-1 h-4 w-4 shrink-0 text-bronze-500/60 transition group-hover:translate-x-0.5 group-hover:text-bronze-300" />
      </Link>
    </li>
  );
}

function TimeLeft({ slug, fraction }: { slug: string; fraction: number }) {
  const index = dataOf(useGuideIndex());
  const route = useProgress().routeStyle;
  if (!index?.entries) return null;
  const left = minutesToSixty(index.entries, slug, fraction, route);
  if (left === undefined) return null;
  return (
    <div className="flex flex-col gap-1 rounded-sm border border-bronze-900 bg-canvas/50 px-3.5 py-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">Time to 60</span>
      <span className="text-ink">
        About <strong>{fmtPlayTime(left)}</strong> played on {route === "speedrun" ? "Speedrun" : "Balanced"}
      </span>
      <span className="text-xs text-muted">
        {fmtDays(left, 2)} at 2 h a day, {fmtDays(left, 4)} at 4 h. Solo questing pace; dungeons, deaths and breaks add more.
      </span>
    </div>
  );
}

function Goals({ model, slug }: { model: Model; slug: string }) {
  const guideTitle = useGuideTitle();
  const next = model.milestones[0];
  const rest = model.milestones.slice(1);
  const lvl = Math.floor(model.levelNow);
  const frac = Math.min(1, Math.max(0, model.levelNow - lvl));
  return (
    <section className="wow-frame flex flex-col gap-4 p-5 lg:col-span-2" aria-labelledby="goals">
      <h2 id="goals" className="font-display text-lg font-bold text-bronze-400">
        Goals
      </h2>
      {model.hasSim && (
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold leading-none text-ink">Level {next?.level ?? lvl + 1}</span>
            {next && <span className="text-sm font-semibold text-bronze-300">{next.stepsAway === 0 ? "this step" : `in ${next.stepsAway} step${next.stepsAway === 1 ? "" : "s"}`}</span>}
          </div>
          <div
            role="progressbar"
            aria-label={`XP toward level ${lvl + 1}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(frac * 100)}
            className="mt-2 h-2.5 overflow-hidden rounded-full border border-stroke bg-canvas"
          >
            <div className="h-full bg-bronze-500" style={{ width: `${frac * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            Level {lvl}, {Math.round(frac * 100)}% to {lvl + 1}
          </p>
        </div>
      )}
      {rest.length > 0 && (
        <ol className="text-sm">
          {rest.map((m) => (
            <li key={m.level} className="flex items-center gap-3 border-t border-bronze-900 py-2">
              <span className="w-11 shrink-0 font-bold text-bronze-400">Lv {m.level}</span>
              <span className="flex-1 text-ink">step #{m.step.n}</span>
              <span className="text-xs text-muted">
                {m.stepsAway} step{m.stepsAway === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ol>
      )}
      <GoldGoal level={model.levelNow} />
      <TimeLeft slug={slug} fraction={model.fraction} />
      <div className="flex flex-col gap-1 rounded-sm border border-bronze-900 bg-canvas/50 px-3.5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">Guide finish</span>
        <span className="text-ink">
          {model.finish !== undefined ? `Level ${Math.floor(model.finish)} at step #${model.lastN}` : `Step #${model.lastN}`}
        </span>
        {model.nextGuide && (
          <span className="text-sm text-muted">
            Then:{" "}
            <Link to={`/guide/${model.nextGuide}`} className="font-semibold text-bronze-400 hover:text-bronze-300">
              {guideTitle(model.nextGuide)} →
            </Link>
          </span>
        )}
      </div>
    </section>
  );
}

function NoteLine({ slug, note, upcoming, questName }: { slug: string; note: NoteGroup; upcoming: ReadonlySet<string>; questName: (id: number) => string | undefined }) {
  const [open, setOpen] = useState(false);
  const soon = note.steps.filter((s) => upcoming.has(s.id)).length;
  const counts = note.steps.length
    ? `${note.steps.length} step${note.steps.length === 1 ? "" : "s"}${note.quests.length > 1 ? `, ${note.quests.length} quests` : ""}`
    : note.questIds.length
      ? `${note.questIds.length} quest${note.questIds.length === 1 ? "" : "s"}`
      : undefined;
  const expandable = note.quests.length > 0 || note.questIds.length > 0;
  return (
    <li className="border-t border-bronze-900 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={!expandable}
        className="flex min-h-touch w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink enabled:hover:bg-canvas/40"
      >
        <Icon name={note.severity === "warn" ? "alert" : "info"} className={`h-4 w-4 shrink-0 ${note.severity === "warn" ? "text-rt-warn" : "text-bronze-400"}`} />
        <span className="min-w-0 flex-1">
          {note.msg}
          {counts && <span className="text-muted"> · {counts}</span>}
          <span className={soon ? " text-rt-warn" : " text-muted"}>{soon ? ` · ${soon} in your next stops` : note.steps.length ? " · none in your next stops" : ""}</span>
        </span>
        {expandable && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-bronze-400">
            {open ? "Hide" : "Show"}
            <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        )}
      </button>
      {open && (
        <ul className="columns-1 gap-6 px-4 pb-3 pl-11 text-[13px] leading-relaxed text-muted sm:columns-2">
          {note.quests.map((q) => (
            <li key={q.name} className="break-inside-avoid">
              {q.name} ·{" "}
              <Link to={stepLink(slug, q.steps[0]!)} className="font-semibold text-bronze-400 hover:text-bronze-300">
                {stepRange(q.steps)}
              </Link>
            </li>
          ))}
          {note.questIds.map((id) => (
            <li key={`q${id}`} className="break-inside-avoid">
              <Link to={`/quest/${id}`} className="font-semibold text-bronze-400 hover:text-bronze-300">
                {questName(id) ?? note.questNames[id] ?? `Quest ${id}`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function DashboardPage() {
  const indexRes = useGuideIndex();
  const pos = useRoutePosition();
  const guideRes = useGuide(pos.guideSlug);
  const insights = dataOf(useInsights());
  const quests = dataOf(useQuests());
  const zones = dataOf(useZones());
  const progress = useProgress();
  const active = useProfileApi().active;
  const guideTitle = useGuideTitle();
  const guide = pos.guide;
  const model = useDashboardModel(pos, guide, quests);

  const notes = useMemo(() => {
    if (!guide || !insights || !quests) return [];
    return groupNotes(
      insights.issues.filter((i) => i.guide === guide.slug),
      guide.steps,
      (s) => questNameOf(s, quests),
    );
  }, [guide, insights, quests]);

  if (indexRes.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState title="Could not load the route" error={indexRes.error} retry={indexRes.retry} />
      </div>
    );
  }

  const guideError = guideRes.status === "error" ? guideRes : null;
  const guideName = guideError ? "Guide unavailable" : (guide?.displayName ?? (pos.guideSlug ? guideTitle(pos.guideSlug) : ""));
  const added = pos.guideSlug ? (insights?.added[pos.guideSlug] ?? []) : [];
  const started = !!progress.current;
  const zone = model?.heroMapId !== undefined ? zones?.get(model.heroMapId) : undefined;
  const nowLevelLine =
    model?.hasSim
      ? `Level ${Math.floor(model.levelNow)}, ${Math.round((model.levelNow - Math.floor(model.levelNow)) * 100)}% to ${Math.floor(model.levelNow) + 1}`
      : `Estimated level ${Math.floor(pos.level)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-6 sm:px-6 sm:py-8">
      {/* Hero: the map of where you are + the one step that matters */}
      <section className="wow-frame panel-animate relative grid overflow-hidden shadow-card md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" aria-labelledby="hero-title">
        <div className="border-b border-bronze-900 md:border-b-0 md:border-r">
          {model && zone ? (
            <RouteMap zoneImage={publicAsset(zone.image)} zoneName={zone.name} trail={model.trail} current={model.nowSpot} stops={model.mapStops} />
          ) : guideError ? (
            <div className="map-grid aspect-[3/2] w-full" />
          ) : (
            <Skeleton className="aspect-[3/2] h-auto w-full" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">{started ? "Welcome back" : "Your journey starts here"}</p>
              <ExperimentalBadge />
            </div>
            <h1 id="hero-title" className="font-display text-3xl font-bold leading-tight text-bronze-400 sm:text-4xl">
              {guideName ? guideName : <Skeleton className="h-9 w-56" />}
            </h1>
            <p className="text-sm text-muted">
              {model?.now ? `Step ${model.now.n} of ${model.lastN} · ` : ""}
              {nowLevelLine}
            </p>
          </div>
          {guideError ? null : model && guide && quests ? (
            <NowCard guide={guide} model={model} quests={quests} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
          {active ? <StartHere defaultOpen={!started && (active.level ?? 1) > 1} /> : <QuickStart />}
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-5">
        <section className="wow-frame p-5 lg:col-span-3" aria-labelledby="up-next">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 id="up-next" className="font-display text-lg font-bold text-bronze-400">
              Up next
            </h2>
            {model && model.stops.length > 0 && (
              <span className="text-xs text-muted">
                {model.stops.length} stop{model.stops.length === 1 ? "" : "s"} · steps {stepRange(model.stops.flatMap((g) => g.steps)).slice(1)}
              </span>
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
          ) : !model || !guide || !quests ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : model.stops.length ? (
            <>
              <ol>
                {model.stops.map((g) => (
                  <StopRow key={g.n} slug={guide.slug} stop={g} quests={quests} />
                ))}
              </ol>
              <Link to={`/guide/${guide.slug}`} className="mt-2 inline-block text-xs font-semibold text-bronze-400 hover:text-bronze-300">
                Open the full guide →
              </Link>
            </>
          ) : (
            <p className="text-sm text-bronze-300/70">Nothing left in this guide after this step — on to the next one.</p>
          )}
        </section>

        {model && guide && !guideError ? (
          <Goals model={model} slug={guide.slug} />
        ) : (
          <section className="wow-frame p-5 lg:col-span-2" aria-label="Goals">
            {guideError ? <p className="text-sm text-muted">Goals appear once the guide loads.</p> : <Skeleton className="h-40 w-full" />}
          </section>
        )}
      </div>

      {guide && (added.length > 0 || notes.length > 0) && (
        <section className="wow-frame" aria-label="Route notes">
          <ul>
            {added.map((a, i) => (
              <li key={`a${i}`} className="flex gap-3 border-b border-bronze-900 px-4 py-2.5 text-sm text-bronze-300">
                <Icon name="sparkle" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>+{a.xp} XP</strong> bonus ({a.detour}, ~{a.minutes} min) <span className="text-bronze-300/75">· {a.why}</span>
                </span>
              </li>
            ))}
            {notes.map((n) => (
              <NoteLine key={n.msg} slug={guide.slug} note={n} upcoming={model?.upcomingIds ?? new Set()} questName={(id) => quests?.get(id)?.name} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
