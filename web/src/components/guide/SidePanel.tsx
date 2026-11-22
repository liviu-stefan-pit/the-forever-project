/**
 * Right panel content (sticky on wide screens, bottom sheet on narrow ones):
 * current section map slot (P8) + quest details slot (P9).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { stepMarkers } from "../../lib/mapMarkers";
import type { TipContext } from "../../lib/stepExtras";
import type { StepPoint } from "../../lib/stepPoints";
import { useStepDone } from "../../state/progress";
import { useProfileApi } from "../../state/profile";
import { CharacterNudges } from "./CharacterNudges";
import { ProfessionPanel, StepTipsPanel } from "./ProfessionPanel";
import type { QuestMap, ZoneMap } from "../../data/loader";
import type { Section, Step, Stop } from "../../data/schema";
import type { StepLeg } from "../map/route";
import { ZoneMapSlot } from "../map/ZoneMapSlot";
import { QuestDetailsSlot } from "../quest/QuestDetailsSlot";
import { Icon } from "../ui/Icon";

export interface SidePanelProps {
  section: Section | undefined;
  stepCount: number;
  doneStops: ReadonlySet<number>;
  step: Step | undefined;
  quests: QuestMap | undefined;
  zones: ZoneMap | undefined;
  onStopSelect: (s: Stop) => void;
  leg?: StepLeg;
  caption?: string;
  /** Visible-goto polyline of the current section (route engine). */
  sectionRoute?: readonly { x: number; y: number }[];
  tipCtx?: TipContext;
  stepPoints?: readonly StepPoint[];
  onStepPointSelect?: (stepId: string) => void;
}

export function SidePanel(p: SidePanelProps) {
  const mapId = p.section?.mapId;
  const profile = useProfileApi().active;
  const ctx: TipContext = p.tipCtx ?? { route: "balanced", dungeons: false };
  const markers = useMemo(() => (mapId === undefined ? [] : stepMarkers(p.step, p.quests, mapId)), [p.step, p.quests, mapId]);
  return (
    <div className="space-y-4">
      {p.section && (
        <ZoneMapSlot
          section={p.section}
          zone={p.zones?.get(p.section.mapId)}
          variant="panel"
          stepCount={p.stepCount}
          activeStop={p.step?.stop}
          doneStops={p.doneStops}
          onStopSelect={p.onStopSelect}
          leg={p.leg}
          caption={p.caption}
          markers={markers}
          sectionRoute={p.sectionRoute}
          stepPoints={p.stepPoints}
          onStepPointSelect={p.onStepPointSelect}
        />
      )}
      <StepTipsPanel step={p.step} ctx={ctx} />
      <CharacterNudges profile={profile} />
      <ProfessionPanel profile={profile} step={p.step} ctx={{ ...ctx, skills: profile?.skills }} />
      <QuestDetailsSlot step={p.step} quests={p.quests} />
    </div>
  );
}

/** Bottom bar + sheet for screens below `xl` (phones, tablets, second monitors). */
export function MobileGuideBar({
  panel,
  stepLabel,
  isDone,
  currentId,
  open,
  setOpen,
  onPrev,
  onNext,
  onToggle,
  onJumpCurrent,
}: {
  panel: ReactNode;
  stepLabel: string;
  isDone?: boolean;
  currentId?: string;
  open: boolean;
  setOpen: (o: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  /** Scroll back to the current step (shown as a pill when it is off screen). */
  onJumpCurrent?: () => void;
}) {
  const away = useCurrentStepOffscreen(currentId, !open);
  const storeDone = useStepDone(currentId ?? "");
  const done = isDone ?? (!!currentId && storeDone);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const btn = "flex h-10 items-center justify-center gap-1.5 rounded-sm border border-bronze-500/60 bg-frame/90 px-3 text-sm text-ink transition active:scale-[0.97] hover:border-bronze-400";
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stroke bg-canvas/90 px-3 py-2 backdrop-blur-md xl:hidden" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {away && onJumpCurrent && (
          <button
            type="button"
            onClick={onJumpCurrent}
            data-testid="back-to-current"
            className="fade-in absolute bottom-full left-1/2 mb-2 inline-flex min-h-touch -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-bronze-500/70 bg-frame/95 px-4 text-sm font-semibold text-bronze-300 shadow-lg shadow-black/50 backdrop-blur-md active:scale-[0.97]"
          >
            <Icon name="arrowRight" className={`h-4 w-4 ${away === "above" ? "-rotate-90" : "rotate-90"}`} />
            Back to {stepLabel}
          </button>
        )}
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button type="button" className={btn} onClick={onPrev} aria-label="Previous step">
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={done}
            className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-sm border px-3 text-sm font-semibold transition active:scale-[0.98] ${
              done ? "border-horde-500/50 bg-horde-700/40 text-bronze-300" : "border-bronze-500 bg-horde-500 text-ink shadow-lg shadow-horde-700/40"
            }`}
          >
            <Icon name="check" className="h-4 w-4 shrink-0" strokeWidth={3} />
            <span className="truncate">{done ? `${stepLabel} done` : `Done · ${stepLabel}`}</span>
          </button>
          <button type="button" className={btn} onClick={onNext} aria-label="Next step">
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
          <button type="button" className={btn} onClick={() => setOpen(true)} aria-label="Show map and quest details" aria-expanded={open}>
            <Icon name="map" className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Map and quest details">
          <div className="fade-in absolute inset-0 bg-canvas/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="sheet-in absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-sm border-t border-stroke bg-frame px-3 pb-6 pt-2 shadow-2xl sm:px-6">
            <div className="sticky top-0 z-10 -mx-3 mb-2 flex items-center justify-between bg-frame/95 px-3 py-2 sm:-mx-6 sm:px-6">
              <span className="mx-auto h-1 w-10 rounded-full bg-stroke" aria-hidden="true" />
              <button type="button" onClick={() => setOpen(false)} className="absolute right-2 rounded-sm p-1.5 text-bronze-500/80 hover:text-bronze-300" aria-label="Close">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
            <div className="mx-auto max-w-2xl">{panel}</div>
          </div>
        </div>
      )}
    </>
  );
}

export type OffscreenSide = "above" | "below" | null;

/** Where the step card sits relative to the visible area (between the top bar and the bottom bar). */
export function offscreenSide(rect: { top: number; bottom: number } | null, viewTop: number, viewBottom: number): OffscreenSide {
  if (!rect) return null;
  if (rect.bottom < viewTop) return "above";
  if (rect.top > viewBottom) return "below";
  return null;
}

/** Tracks whether the current step card has been scrolled out of view (phones read and scroll a lot). */
function useCurrentStepOffscreen(currentId: string | undefined, enabled: boolean): OffscreenSide {
  const [side, setSide] = useState<OffscreenSide>(null);
  useEffect(() => {
    if (!currentId || !enabled) {
      setSide(null);
      return;
    }
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = document.getElementById(`step-${currentId}`);
      // 96px ≈ the bottom bar plus the pill itself.
      const next = offscreenSide(el ? el.getBoundingClientRect() : null, 24, window.innerHeight - 96);
      // Still reading the guide intro at the top: the step is simply further down, no need to nag.
      setSide(next === "below" && window.scrollY < 240 ? null : next);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [currentId, enabled]);
  return side;
}
