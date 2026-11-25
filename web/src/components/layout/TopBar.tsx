import { Link, useLocation, useNavigate } from "react-router";
import { HORDE_HOME, SITE_NAME } from "../../config";
import { MainNavLinks } from "./MainNav";
import { useHideOnScroll } from "./scrollHide";
import { dataOf, useGuide, useQuests } from "../../data/hooks";
import { useCurrentGuideSlug, useEngine, useGuideCompletion, useProgressActions, useRouteStyle } from "../../state/progress";
import { useRoutePosition } from "../../state/position";
import { useGameSyncUi } from "../../state/gameSyncClient";
import { readDungeons, writeDungeons } from "../../lib/profileExtras";
import { currentZone } from "../../lib/currentZone";
import { pickCurrentStepId } from "../../lib/guideList";
import { guideNearestInput, nearestGotoStep } from "../../lib/profileHints";
import { stepPickShouldSkip } from "../../state/questProgress";
import { setStepPickQuestCatalog } from "../../state/profileStore";
import { useVisibility } from "../../state/visibility";
import { isSpeedrun, ROUTE_OPTIONS } from "../../lib/routeStyle";
import { guideXpProgress } from "../../lib/xp/guideXp";
import { xpModsActive } from "../../lib/xp/recomputeSim";
import { useRecomputedSim } from "../../lib/xp/useRecomputedSim";
import { useActiveProfileSummary, useProfileApi } from "../../state/profile";
import { useUi } from "../../state/ui";
import { Emblem, Icon } from "../ui/Icon";

export function RouteStyleSwitch({ className = "" }: { className?: string }) {
  const routeStyle = useRouteStyle();
  const { setRouteStyle } = useProgressActions();
  return (
    <div role="radiogroup" aria-label="Route" className={`flex shrink-0 rounded-sm border border-stroke bg-frame/80 p-0.5 text-sm font-semibold ${className}`}>
      {ROUTE_OPTIONS.map((o) => {
        const on = routeStyle === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.title}
            onClick={() => setRouteStyle(o.v)}
            className={`press inline-flex min-h-touch items-center gap-1 rounded-sm px-2 sm:px-2.5 ${
              on ? (isSpeedrun(o.v) ? "bg-horde-600/60 text-ink ring-1 ring-horde-400/60" : "bg-bronze-500/15 text-bronze-300 ring-1 ring-bronze-500/50") : "text-muted hover:text-ink"
            }`}
          >
            <Icon name={isSpeedrun(o.v) ? "zap" : "sparkle"} className="hidden h-3.5 w-3.5 sm:inline" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const DUNGEON_LABEL = "Include dungeons (off = fully solo route)";
/** Visible text stays short so the top bar row does not overflow; the full wording is in aria-label/title. */
const DUNGEON_LABEL_SHORT = "Dungeons";

export function DungeonToggleView({ on, onChange, className = "", compact = false }: { on: boolean; onChange: (on: boolean) => void; className?: string; compact?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={DUNGEON_LABEL}
      title={on ? "Dungeon steps are shown. Click for a fully solo route." : "Fully solo route. Click to include dungeons."}
      onClick={() => onChange(!on)}
      className={`press inline-flex min-h-touch shrink-0 items-center gap-2 rounded-sm border px-2.5 text-sm font-semibold ${
        on ? "border-horde-400/70 bg-horde-700/50 text-ink" : "border-stroke bg-frame/80 text-muted hover:text-ink"
      } ${className}`}
    >
      <Icon name="skull" className="h-4 w-4" />
      <span className={`whitespace-nowrap ${compact ? "sr-only sm:not-sr-only" : ""}`}>{DUNGEON_LABEL_SHORT}</span>
      <SwitchPill on={on} />
      <span className="sr-only">{on ? "on" : "off"}</span>
    </button>
  );
}

function SwitchPill({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${on ? "bg-horde-400" : "bg-stroke"}`}>
      <span className={`absolute left-0 top-0.5 h-3 w-3 rounded-full bg-ink shadow transition-transform duration-200 ${on ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
    </span>
  );
}

/** Dungeons on/off: profile option `dungeons`. Filtering is the route engine's job. */
export function DungeonToggle({ className, compact }: { className?: string; compact?: boolean }) {
  const api = useProfileApi();
  if (!api.active) {
    return (
      <Link
        to="/profile"
        title="Create a character profile to include dungeons. Off is a fully solo route."
        aria-label={`${DUNGEON_LABEL}: off`}
        className={`press inline-flex min-h-touch shrink-0 items-center gap-2 rounded-sm border border-stroke bg-frame/80 px-2.5 text-sm font-semibold text-muted hover:text-ink ${className ?? ""}`}
      >
        <Icon name="skull" className="h-4 w-4" />
        <span className={`whitespace-nowrap ${compact ? "sr-only sm:not-sr-only" : ""}`}>{DUNGEON_LABEL_SHORT}</span>
        <SwitchPill on={false} />
      </Link>
    );
  }
  return <DungeonToggleView on={readDungeons(api.active)} onChange={(v) => writeDungeons(api, v)} className={className} compact={compact} />;
}

/** Quiet label when the profile is off the worst-case XP sim. Hidden when every bonus is off. */
export function XpBonusChip({ className = "" }: { className?: string }) {
  const api = useProfileApi();
  if (!xpModsActive(api.active?.options.xpMods)) return null;
  return (
    <span
      title="Expected levels use the XP bonuses set on the profile."
      className={`inline-flex min-h-touch shrink-0 items-center rounded-sm border border-bronze-500/50 bg-frame/80 px-2.5 text-sm font-semibold text-bronze-300 ${className}`}
    >
      XP bonuses on
    </span>
  );
}

const fmtFull = (n: number) => n.toLocaleString("en-US");
const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const fmtCompact = (n: number) => (n < 10_000 ? fmtFull(n) : COMPACT.format(n).toLowerCase());

/** Compact guide XP meter (presentational; used in both toolbar clusters). */
export function GuideXpMeter({
  earned,
  total,
  bracket,
  title,
  className = "",
  compact = false,
}: {
  earned: number;
  total: number;
  bracket: string;
  title: string;
  className?: string;
  /** Short numbers (12.3k) for the crowded main row; exact values stay in the tooltip. */
  compact?: boolean;
}) {
  const pct = total > 0 ? (earned / total) * 100 : 0;
  const fmt = compact ? fmtCompact : fmtFull;
  return (
    <div className={`flex min-w-0 shrink flex-col justify-center gap-0.5 ${className}`} title={compact ? `${title} · ${fmtFull(earned)} / ${fmtFull(total)} XP` : title}>
      <div className="flex items-baseline justify-end gap-1.5 overflow-hidden whitespace-nowrap text-[10px] leading-none">
        <span className="hidden font-semibold uppercase tracking-wider text-bronze-500/80 min-[400px]:inline">{bracket}</span>
        <span className="tabular-nums font-semibold text-ink">
          {fmt(earned)} / {fmt(total)} XP
        </span>
      </div>
      <div
        className="h-1 w-full min-w-[4rem] overflow-hidden rounded-full bg-stroke"
        role="progressbar"
        aria-label="Guide XP"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={earned}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-bronze-500 via-bronze-400 to-bronze-400 transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GuideXpBar({ className = "", compact }: { className?: string; compact?: boolean }) {
  const pos = useRoutePosition();
  const location = useLocation();
  const engine = useEngine();
  const routeStyle = useRouteStyle();
  const vis = useVisibility();
  const openSlug = location.pathname.match(/^\/guide\/([^/?]+)/)?.[1];
  const openGuide = dataOf(useGuide(openSlug));
  useGuideCompletion(openSlug ?? pos.guideSlug, { defer: true });
  const guide = openGuide ?? pos.guide;
  const simByStep = useRecomputedSim(guide?.steps, routeStyle);
  if (!guide) return null;
  const { earned, total } = guideXpProgress(guide.steps, routeStyle, (id) => engine?.isDone(id) ?? false, (s) => {
    const v = vis.step(s);
    if (v.reason === "not_applicable") return false;
    if (!v.visible && v.reason !== "done") return false;
    return true;
  }, simByStep);
  return (
    <GuideXpMeter
      earned={earned}
      total={total}
      bracket={`${guide.minLevel}–${guide.maxLevel}`}
      title={`${guide.displayName} · XP from completed steps in this guide`}
      className={className}
      compact={compact}
    />
  );
}

function OverallProgress() {
  const pos = useRoutePosition();
  const progress = useProgressActions();
  const quests = dataOf(useQuests());
  const vis = useVisibility();
  const api = useProfileApi();
  const navigate = useNavigate();
  const location = useLocation();
  const pct = Math.round(pos.overall * 100);
  const guideZone = currentZone(pos.guide, pos.stepId);
  const liveZone = api.active?.position?.zone;
  const zone = liveZone || guideZone;
  if (quests) setStepPickQuestCatalog(quests);
  const nearest = (() => {
    const guide = pos.guide;
    if (!guide || !quests) return undefined;
    const steps = guide.steps;
    const visible = steps.filter((s) => vis.step(s).visible);
    const isDone = (id: string) => progress.isDone(id, quests);
    const byId = new Map(steps.map((s) => [s.id, s]));
    const shouldSkip = (id: string) => {
      const step = byId.get(id);
      if (!step) return false;
      return stepPickShouldSkip(step, steps, isDone, progress.stepStatus(step, quests).status);
    };
    const onThisGuide = !!pos.guideSlug && location.pathname.startsWith(`/guide/${pos.guideSlug}`);
    const deep = onThisGuide ? (new URLSearchParams(location.search).get("step") ?? undefined) : undefined;
    const current = pickCurrentStepId(
      visible.map((s) => s.id),
      { deepStep: deep, cursorStep: pos.stepId, isDone, shouldSkip },
    );
    return nearestGotoStep(
      guideNearestInput(steps, isDone, {
        visibleIds: visible.map((s) => s.id),
        status: (step) => progress.stepStatus(step, quests).status,
      }),
      api.active?.position,
      { currentId: current },
    );
  })();
  const jump = () => {
    if (!nearest || !pos.guideSlug) return;
    progress.setCurrent({ guide: pos.guideSlug, step: nearest });
    const params = new URLSearchParams(location.search);
    params.set("step", nearest);
    if (api.active?.id) params.set("stepFor", api.active.id);
    const path = location.pathname.startsWith(`/guide/${pos.guideSlug}`) ? `${location.pathname}?${params}` : `/guide/${pos.guideSlug}?${params}`;
    navigate(path);
  };
  return (
    // Level, zone, overall % and this guide's XP in one cluster. It is the part of the main row that shrinks
    // (zone truncates first), so Search and Profile always keep their place on screen.
    <div className="hidden min-w-0 shrink items-center gap-3 overflow-hidden whitespace-nowrap md:flex" title={`Estimated level ${pos.level.toFixed(1)} of 60${guideZone ? ` · guide zone ${guideZone}` : ""}`}>
      <div className="min-w-0 overflow-hidden text-right leading-tight">
        <div className="flex min-w-0 items-baseline justify-end gap-1 text-xs font-semibold text-ink">
          <span className="shrink-0">
            Lv <span className="tabular-nums">{Math.floor(pos.level)}</span>
          </span>
          {zone && (
            <span className="min-w-0 max-w-[10rem] truncate font-normal text-bronze-300" data-testid="topbar-zone" title={guideZone && liveZone && guideZone !== liveZone ? `Guide zone: ${guideZone}` : undefined}>
              · {zone}
            </span>
          )}
          {nearest && (
            <button
              type="button"
              onClick={jump}
              title="Jump to nearest step"
              aria-label="Jump to nearest step"
              className="press inline-flex shrink-0 items-center gap-0.5 self-center font-semibold text-bronze-400 hover:text-bronze-300"
              data-testid="jump-nearest-step"
            >
              <Icon name="crosshair" className="h-3.5 w-3.5" />
              <span className="hidden 2xl:inline">Nearest step</span>
            </button>
          )}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-bronze-500/80" role="progressbar" aria-label="Overall route progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          {pos.bracket && <>{pos.bracket.replace("-", "–")} · </>}
          {pct}% of 1–60
        </div>
      </div>
      <GuideXpBar compact className="w-28 shrink-0 border-l border-stroke/60 pl-3 3xl:w-40" />
    </div>
  );
}

/** Second row below 2xl. Never scrolls sideways: items shrink (class chip truncates) instead. */
export const ROUTE_TOOLBAR_CLASS =
  "flex h-[49px] min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden border-t border-stroke/50 px-2 sm:gap-2 sm:px-4 3xl:hidden";

export function TopBar() {
  const ui = useUi();
  const sync = useGameSyncUi();
  const profile = useActiveProfileSummary();
  const guideSlug = useCurrentGuideSlug();
  const pos = useRoutePosition();
  // Phones: the guide is read one-handed while playing, so the bar gets out of the way on scroll down.
  const onGuide = useLocation().pathname.startsWith("/guide/");
  const scrollHidden = useHideOnScroll(onGuide && !ui.drawerOpen && !ui.searchOpen);
  return (
    <header
      data-scroll-hidden={scrollHidden ? "true" : undefined}
      className="topbar sticky top-0 z-40 border-b border-stroke bg-canvas/85 backdrop-blur-md"
    >
      <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={() => ui.setDrawerOpen(true)}
          className="-ml-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-sm p-2 text-ink transition hover:bg-frame hover:text-bronze-300 lg:hidden"
          aria-label="Open level timeline"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <Link
          to="/"
          title="Home: choose your faction"
          aria-label="Home: choose your faction"
          className="press -mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center gap-1 rounded-sm px-1.5 text-sm font-semibold text-bronze-500/80 transition hover:bg-frame hover:text-bronze-300 2xl:pr-2.5"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
          <span className="hidden 2xl:inline">Home</span>
        </Link>
        <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-stroke sm:block" />
        <Link to={HORDE_HOME} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label="Horde guide: dashboard">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-bronze-500 bg-gradient-to-br from-horde-500 to-horde-700 text-bronze-300">
            <Emblem className="h-5 w-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-base font-bold tracking-wide text-bronze-400">
              {SITE_NAME}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-bronze-400">Horde guide · 1–60</span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 xl:flex">
          <MainNavLinks guideSlug={guideSlug} />
        </nav>

        <div className="flex-1" />
        <OverallProgress />
        <div className="hidden shrink-0 items-center gap-2 3xl:flex">
          <RouteStyleSwitch />
          <DungeonToggle />
          <XpBonusChip />
        </div>
        {sync.available && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={sync.sync}
            disabled={sync.busy}
            aria-busy={sync.busy}
            title={sync.title}
            className="press inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-sm border border-bronze-500/60 bg-frame/80 px-3 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="loop" className={`h-4 w-4 ${sync.busy ? "animate-spin motion-reduce:animate-none" : ""}`} />
            Sync
          </button>
          {/* Only on very wide screens: below that the main row has no room and the status lives in the second row. */}
          <span className="hidden w-[15rem] text-[11px] leading-tight text-muted min-[2200px]:line-clamp-2" title={sync.title} aria-live="polite">
            {sync.barText}
          </span>
        </div>
        )}
        <button
          type="button"
          onClick={ui.openSearch}
          className="flex min-h-touch min-w-touch shrink-0 items-center justify-center gap-2 rounded-sm border border-bronze-500/60 bg-frame/80 p-2 text-ink transition hover:border-bronze-400 hover:text-bronze-300 sm:px-2.5 sm:py-1.5"
          aria-label="Search (Ctrl+K)"
          aria-keyshortcuts="Control+K /"
        >
          <Icon name="search" className="h-4 w-4" />
          <span className="hidden text-sm lg:inline">Search</span>
          <kbd className="hidden rounded-sm border border-stroke bg-canvas px-1.5 font-sans text-[10px] text-bronze-500/80 lg:inline touch:hidden">Ctrl K</kbd>
        </button>
        <Link
          to="/profile"
          className="flex shrink-0 items-center gap-2 rounded-sm border border-bronze-500/60 bg-frame/80 p-1 pr-1 text-sm text-ink transition hover:border-bronze-400 hover:text-bronze-300 sm:pr-2.5"
          title="Profiles"
          aria-label={profile ? `Profile: ${profile.name}` : "Profiles"}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-horde-700 to-stroke font-display text-xs font-bold text-bronze-300">
            {profile ? profile.name.charAt(0).toUpperCase() : <Icon name="user" className="h-4 w-4" />}
          </span>
          <span className="hidden max-w-[8rem] truncate sm:inline">{profile ? profile.name : "Guest"}</span>
          <Icon name="chevronDown" className="hidden h-3.5 w-3.5 opacity-60 sm:inline" />
        </Link>
      </div>
      <div className={ROUTE_TOOLBAR_CLASS} role="toolbar" aria-label="Route options">
        <RouteStyleSwitch />
        <DungeonToggle compact />
        <XpBonusChip />
        {/* From md up the guide XP sits with the level in the main row. */}
        <GuideXpBar className="ml-auto md:hidden" />
        {sync.available && (
          <span className="hidden min-w-0 flex-1 truncate text-xs text-muted sm:block" title={sync.title}>
            {sync.barText}
          </span>
        )}
      </div>
      {/* Overall 1–60 progress drawn as the header's bottom edge (the % is in the level cluster). */}
      <div className="absolute inset-x-0 bottom-0 h-px" aria-hidden="true">
        <div className="h-px bg-gradient-to-r from-bronze-500 via-bronze-400 to-bronze-400 transition-[width] duration-700" style={{ width: `${Math.max(1, pos.overall * 100)}%` }} />
      </div>
    </header>
  );
}
