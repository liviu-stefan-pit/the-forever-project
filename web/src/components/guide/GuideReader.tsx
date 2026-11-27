/**
 * The guide reader: header, zone sections (map header slot + steps), sticky right panel,
 * keyboard navigation, `?step=<id>` deep links and the mobile bottom bar.
 */
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { dataOf, useGuide, useQuestSteps } from "../../data/hooks";
import type { QuestMap, ZoneMap } from "../../data/loader";
import type { Guide, GuideIndex, Insights, RouteStyle, Step, StepSim, Stop } from "../../data/schema";
import { successorSlug, guideName } from "../../lib/nextGuide";
import { splitBySection } from "../../lib/grouping";
import { guideOffersSpeedrun, type TipContext } from "../../lib/stepExtras";
import { sectionStepPoints } from "../../lib/stepPoints";
import { linePlainText } from "../../lib/richtext";
import { commandForKey, navReducer, type NavCommand } from "../../state/keyboard";
import {
  useCurrentStepId,
  useEngine,
  useGuideCompletion,
  useProgressActions,
  useProfileUiKey,
  useRouteStyle,
} from "../../state/progress";
import { useUi } from "../../state/ui";
import { useVisibility, useVisibilityLayoutKey, type StepVisibility, type VisibilityEvaluator } from "../../state/visibility";
import { stepLeg, visibleRoutePolyline } from "../map/route";
import { QuestDrawer } from "../quest/QuestDrawer";
import { GuideCompleteCard } from "./GuideCompleteCard";
import { GuideHeader } from "./GuideHeader";
import { MobileGuideBar, SidePanel } from "./SidePanel";
import { ZoneSection } from "./ZoneSection";
import { useProgressiveSections } from "./useProgressiveSections";
import { isUserScrollIntent, mapAnchorAcrossVisibility, pickCurrentStepId, takeScrollRequest } from "../../lib/guideList";
import { stepPickShouldSkip, stopIsComplete } from "../../state/questProgress";
import { countsInProgress } from "../../state/stepRequirement";
import { useRecomputedSim } from "../../lib/xp/useRecomputedSim";

type ScrollMode = "center" | "nearest";

const EMPTY_ADDED: readonly number[] = [];

/**
 * A "show" reveal opens any hidden step, including one for another class or race, so the
 * player can read it. A deep link alone never opens a filter mismatch.
 */
export function stepIsShown(
  visibility: StepVisibility,
  opts: { revealed: boolean; deepLinked: boolean },
): boolean {
  if (!visibility.visible && visibility.reason === "filter") return opts.revealed;
  return visibility.visible || opts.revealed || opts.deepLinked;
}

/** Shown and part of the player's route: a revealed step for another character is read-only. */
export function stepIsRouted(
  visibility: StepVisibility,
  opts: { revealed: boolean; deepLinked: boolean },
): boolean {
  if (!visibility.visible && visibility.reason === "filter") return false;
  return stepIsShown(visibility, opts);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Last countable step's sim level — same visibility rules as the completion ring. */
function exitExpectedLevel(
  steps: readonly Step[],
  vis: VisibilityEvaluator,
  simByStep: Map<string, StepSim> | null,
  routeStyle: RouteStyle,
): number | undefined {
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i]!;
    const shown = vis.step(s);
    if (shown.reason === "not_applicable") continue;
    if (!shown.visible && shown.reason !== "done") continue;
    const level = simByStep?.get(s.id)?.level ?? s.sim?.[routeStyle]?.level;
    if (level != null) return level;
  }
  return undefined;
}

export function GuideReader({
  guide,
  index,
  quests,
  zones,
  insights,
  ignoreDeepStep = false,
}: {
  guide: Guide;
  index: GuideIndex | undefined;
  quests: QuestMap | undefined;
  zones: ZoneMap | undefined;
  insights: Insights | undefined;
  /** Profile just changed; do not adopt the previous profile's `?step=` into this cursor. */
  ignoreDeepStep?: boolean;
}) {
  const engine = useEngine();
  const progress = useProgressActions();
  const vis = useVisibility();
  const layoutKey = useVisibilityLayoutKey();
  const profileKey = useProfileUiKey();
  const routeStyle = useRouteStyle();
  const simByStep = useRecomputedSim(guide.steps, routeStyle);
  const completion = useGuideCompletion(guide.slug, { defer: true });
  const nextSlug = successorSlug(guide, routeStyle);
  const nextLoaded = dataOf(useGuide(nextSlug));
  const ui = useUi();
  const questStepsMap = dataOf(useQuestSteps());
  const [params, setParams] = useSearchParams();
  const paramStep = params.get("step") ?? undefined;
  const questParam = params.get("quest");
  const drawerQuestId = questParam && Number.isFinite(Number(questParam)) ? Number(questParam) : undefined;
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const scrollReq = useRef<{ id: string; mode: ScrollMode } | null>(null);
  const [scrollTick, setScrollTick] = useState(0);
  const userMoved = useRef(false);

  const progressProfile = engine ? engine.progressProfile() : undefined;
  const active = engine?.active() ?? null;
  const profileId = active?.id ?? "guest";
  const guideHasSpeedrun = useMemo(() => guideOffersSpeedrun(guide.steps), [guide]);
  const tipCtx = useMemo<TipContext>(
    () => ({
      route: routeStyle,
      dungeons: progressProfile?.options.dungeons ?? false,
      cls: active?.cls,
      role: active?.role,
      professions: active?.professions,
      skills: active?.skills,
      profile: active,
      quests,
      guideHasSpeedrun,
      playtested: guide.status === "play-tested" ? guide.playtested : undefined,
    }),
    // profileKey covers character / options identity without step ticks
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeStyle, profileKey, quests, guideHasSpeedrun, guide.status, guide.playtested],
  );

  const slug = guide.slug;
  const stepById = useMemo(() => new Map(guide.steps.map((s) => [s.id, s])), [guide]);
  const blocks = useMemo(() => splitBySection(guide), [guide]);
  const stepsForQuest = useCallback(
    (qid: number) => questStepsMap?.get(qid) ?? [],
    [questStepsMap],
  );
  const resolveStep = useCallback((id: string) => stepById.get(id), [stepById]);
  const isDone = useCallback((id: string) => (engine ? engine.isDone(id, quests) : progress.isDone(id, quests)), [engine, progress, quests]);
  const shouldSkip = useCallback(
    (id: string) => {
      const step = stepById.get(id);
      if (!step) return false;
      const st = progress.stepStatus(step, quests).status;
      return stepPickShouldSkip(step, guide.steps, (sid) => progress.isDone(sid, quests), st);
    },
    [progress, quests, stepById, guide.steps],
  );

  // Reset reveals when the list shape changes (e.g. Balanced ↔ Speedrun), not on every tick.
  useEffect(() => setRevealed(new Set()), [layoutKey, slug]);

  const storedCurrent = useCurrentStepId(slug);
  const cursorStep = storedCurrent && stepById.has(storedCurrent) ? storedCurrent : undefined;
  const deepStep = !ignoreDeepStep && paramStep && stepById.has(paramStep) ? paramStep : undefined;

  const isShown = useCallback(
    (s: Step) => stepIsShown(vis.step(s), { revealed: revealed.has(s.id), deepLinked: s.id === deepStep }),
    [vis, revealed, deepStep],
  );
  // Navigation, the map and the step counter skip revealed steps meant for another character.
  const isRouted = useCallback(
    (s: Step) => stepIsRouted(vis.step(s), { revealed: revealed.has(s.id), deepLinked: s.id === deepStep }),
    [vis, revealed, deepStep],
  );
  const order = useMemo(() => guide.steps.filter(isRouted).map((s) => s.id), [guide, isRouted]);

  const allStepIds = useMemo(() => guide.steps.map((s) => s.id), [guide]);
  const mappedDeep = useMemo(
    () => mapAnchorAcrossVisibility(deepStep, order, allStepIds) ?? deepStep,
    [deepStep, order, allStepIds],
  );
  const mappedCursor = useMemo(
    () => mapAnchorAcrossVisibility(cursorStep, order, allStepIds) ?? cursorStep,
    [cursorStep, order, allStepIds],
  );
  const currentId = useMemo(
    () => pickCurrentStepId(order, { deepStep: mappedDeep, cursorStep: mappedCursor, isDone, shouldSkip }),
    [mappedDeep, mappedCursor, order, isDone, shouldSkip, quests],
  );
  const currentStep = currentId ? stepById.get(currentId) : undefined;
  const visibleInBlock = useCallback((block: (typeof blocks)[number]) => block.steps.filter(isShown).length, [isShown]);
  const progressive = useProgressiveSections({
    slug,
    layoutKey,
    blocks,
    order,
    currentId,
    pinnedStepId: scrollReq.current?.id,
    allStepIds,
    visibleIn: visibleInBlock,
  });

  const select = useCallback(
    (id: string, mode: ScrollMode | null) => {
      progress.setCurrent({ guide: slug, step: id });
      if (mode) {
        userMoved.current = false;
        scrollReq.current = { id, mode };
        setScrollTick((n) => n + 1);
      }
      if (params.get("step") !== id || params.get("stepFor") !== profileId) {
        setParams(
          (p) => {
            const next = new URLSearchParams(p);
            next.set("step", id);
            next.set("stepFor", profileId);
            return next;
          },
          { replace: true, preventScrollReset: true },
        );
      }
    },
    [progress, slug, params, setParams, profileId],
  );

  // Deep link (?step=) → cursor + centre scroll. Also on first mount with a stored cursor.
  const mounted = useRef<string | null>(null);
  useEffect(() => {
    if (ignoreDeepStep) {
      // Highlighted step: stored cursor when it is visible, otherwise the first visible step.
      // Scroll only while ignoring a stale deep link, not on a normal mount of a pasted ?step=.
      if (currentId) {
        userMoved.current = false;
        scrollReq.current = { id: currentId, mode: "center" };
        setScrollTick((n) => n + 1);
      }
      mounted.current = slug;
      return;
    }
    if (deepStep && deepStep !== cursorStep) {
      const land = shouldSkip(deepStep) && currentId ? currentId : deepStep;
      progress.setCurrent({ guide: slug, step: land });
      userMoved.current = false;
      scrollReq.current = { id: deepStep, mode: "center" };
      setScrollTick((n) => n + 1);
    } else if (mounted.current !== slug && (deepStep ?? cursorStep)) {
      userMoved.current = false;
      scrollReq.current = { id: (deepStep ?? cursorStep)!, mode: "center" };
      setScrollTick((n) => n + 1);
    }
    mounted.current = slug;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepStep, slug, ignoreDeepStep]);

  // A manual scroll drops any in-flight jump / deep-link retry.
  useEffect(() => {
    const onUser = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!isUserScrollIntent({ type: e.type, key: (e as KeyboardEvent).key, targetTag: t?.tagName, targetEditable: t?.isContentEditable })) {
        return;
      }
      userMoved.current = true;
      scrollReq.current = null;
    };
    for (const ev of ["wheel", "touchstart", "touchmove", "keydown"] as const) {
      window.addEventListener(ev, onUser, { passive: true });
    }
    return () => {
      for (const ev of ["wheel", "touchstart", "touchmove", "keydown"] as const) {
        window.removeEventListener(ev, onUser);
      }
    };
  }, []);

  // Perform requested scrolls once the target is rendered (keep the request if it is still a placeholder).
  useEffect(() => {
    const decision = takeScrollRequest(
      scrollReq.current,
      currentId,
      (id) => document.getElementById(`step-${id}`),
      userMoved.current,
    );
    if ("skip" in decision) {
      if (userMoved.current) scrollReq.current = null;
      return;
    }
    if ("keep" in decision) return;
    const req = decision.consume;
    scrollReq.current = null;
    const el = document.getElementById(`step-${req.id}`);
    if (!el) return;
    // Effects run after commit, so layout is ready; no rAF (it never fires in background tabs).
    el.scrollIntoView({ block: req.mode, behavior: prefersReducedMotion() || req.mode === "center" ? "auto" : "smooth" });
  }, [scrollTick, currentId]);

  const runNav = useCallback(
    (cmd: NavCommand) => {
      const res = navReducer(currentId, cmd, { order, isDone, shouldSkip });
      if (res.toggle) progress.toggle(res.toggle, stepById.get(res.toggle), quests);
      if (res.current) {
        const advance = () => select(res.current!, res.current !== currentId ? "nearest" : null);
        if (cmd === "toggle") startTransition(advance);
        else advance();
      }
    },
    [currentId, order, progress, stepById, select, isDone, shouldSkip, quests],
  );

  // Keyboard: j/k/space/n (search is handled by the shell).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ui.searchOpen || ui.drawerOpen || sheetOpen || drawerQuestId != null || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      const cmd = commandForKey({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, targetTag: t?.tagName, targetEditable: t?.isContentEditable });
      if (!cmd || cmd === "search") return;
      e.preventDefault();
      runNav(cmd);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runNav, ui.searchOpen, ui.drawerOpen, sheetOpen, drawerQuestId]);

  const onToggle = useCallback(
    (s: Step, via?: "tap") => {
      if (progress.requirement(s, quests).kind === "not_applicable") return;
      if (via === "tap") {
        // Card tap on a phone: tick it and move the cursor to the next open step; tap again to undo.
        try {
          navigator.vibrate?.(10);
        } catch {
          // Haptics are optional.
        }
        if (isDone(s.id) || !order.includes(s.id)) {
          progress.toggle(s.id, s, quests);
          select(s.id, null);
          return;
        }
        const res = navReducer(s.id, "toggle", { order, isDone, shouldSkip });
        if (res.toggle) progress.toggle(res.toggle, stepById.get(res.toggle), quests);
        const next = res.current;
        if (next) startTransition(() => select(next, null));
        return;
      }
      if (s.id === currentId && !isDone(s.id)) runNav("toggle");
      else progress.toggle(s.id, s, quests);
    },
    [currentId, progress, runNav, isDone, quests, order, shouldSkip, stepById, select],
  );
  const onSelect = useCallback((s: Step) => select(s.id, null), [select]);
  const onJump = useCallback((id: string) => select(id, "center"), [select]);
  const onStopSelect = useCallback(
    (stop: Stop) => {
      const id = stop.steps.find((sid) => order.includes(sid));
      if (id) select(id, "center");
    },
    [order, select],
  );
  const onReveal = useCallback((ids: string[]) => setRevealed((r) => new Set([...r, ...ids])), []);
  const questName = useCallback((id: number) => quests?.get(id)?.name, [quests]);
  const addedQuests = progressProfile?.addedQuests ?? EMPTY_ADDED;
  const onToggleNearMiss = useCallback(
    (questId: number) => {
      if (!engine) return;
      if (addedQuests.includes(questId)) engine.removeNearMiss(questId);
      else engine.addNearMiss(questId);
    },
    [addedQuests, engine],
  );
  const closeQuestDrawer = useCallback(() => {
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.delete("quest");
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setParams]);

  // Stats. Header ratio includes steps hidden only because Hide done is on.
  const visibleSteps = useMemo(() => guide.steps.filter((s) => vis.step(s).visible), [guide, vis]);
  const countsStep = useCallback((s: Step) => countsInProgress(progress.requirement(s, quests)), [progress, quests]);
  const bonusHidden = guide.steps.filter((s) => s.bonus && vis.step(s).reason === "speedrun").length;
  const sectionPositions = useMemo(
    () => blocks.map((_, i) => ({ index: i + 1, total: blocks.length })),
    [blocks],
  );

  // Right panel: the current step's section.
  const panelBlock = blocks.find((b) => b.steps.some((s) => s.id === currentId)) ?? blocks[0];
  const panelDoneStops = useMemo(() => {
    const set = new Set<number>();
    for (const stop of panelBlock?.section?.stops ?? []) {
      const ids = stop.steps.filter((id) => order.includes(id));
      const notApplicable = (id: string) => {
        const step = stepById.get(id);
        return !!step && progress.stepStatus(step, quests).status === "not_applicable";
      };
      if (stopIsComplete(ids, isDone, notApplicable)) set.add(stop.n);
    }
    return set;
  }, [panelBlock, order, isDone, progress, quests, stepById]);

  const selectedLeg = useMemo(() => {
    if (!currentStep || !panelBlock?.section) return undefined;
    if (!panelBlock.steps.some((s) => s.id === currentStep.id)) return undefined;
    const idx = visibleSteps.findIndex((s) => s.id === currentStep.id);
    const prev = idx > 0 ? visibleSteps[idx - 1] : undefined;
    const previous = prev && prev.section === currentStep.section ? prev : undefined;
    const section = panelBlock.section;
    const stop = currentStep.stop != null ? section.stops.find((s) => s.n === currentStep.stop) : undefined;
    const previousStop = previous?.stop != null ? section.stops.find((s) => s.n === previous.stop) : undefined;
    return stepLeg({
      step: currentStep,
      previous,
      previousStop: previousStop ? { x: previousStop.x, y: previousStop.y } : undefined,
      stop: stop ? { x: stop.x, y: stop.y } : undefined,
      mapId: section.mapId,
      lineVisible: vis.line,
    });
  }, [currentStep, panelBlock, visibleSteps, vis.line]);

  const stepCaption = currentStep
    ? (currentStep.text[0] ? linePlainText(currentStep.text[0]) : "") || `Step ${currentStep.n}`
    : undefined;

  const panelMapId = panelBlock?.section?.mapId;
  const panelPoints = useMemo(
    () =>
      panelBlock && panelMapId !== undefined
        ? sectionStepPoints({
            steps: panelBlock.steps,
            mapId: panelMapId,
            isShown: isRouted,
            isDone,
            omit: (s) => !countsStep(s),
            currentId,
            lineVisible: vis.line,
          })
        : undefined,
    [panelBlock, panelMapId, isRouted, currentId, vis.line, isDone, countsStep],
  );
  const panelRoute = useMemo(
    () => (panelBlock && panelMapId !== undefined ? visibleRoutePolyline(panelBlock.steps, panelMapId, isRouted, vis.line) : undefined),
    [panelBlock, panelMapId, isRouted, vis.line],
  );
  const panel = (
    <SidePanel
      section={panelBlock?.section}
      stepCount={panelBlock ? panelBlock.steps.filter(isShown).length : 0}
      doneStops={panelDoneStops}
      step={currentStep}
      leg={selectedLeg}
      caption={selectedLeg ? stepCaption : undefined}
      sectionRoute={panelRoute}
      tipCtx={tipCtx}
      stepPoints={panelPoints}
      onStepPointSelect={(id) => {
        const s = stepById.get(id);
        if (s) {
          setSheetOpen(false);
          onSelect(s);
        }
      }}
      quests={quests}
      zones={zones}
      onStopSelect={(s) => {
        setSheetOpen(false);
        onStopSelect(s);
      }}
    />
  );

  const posInOrder = currentId ? order.indexOf(currentId) + 1 : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-3 pb-28 pt-5 sm:px-6 sm:pt-7 xl:pb-12">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,370px)] xl:gap-7">
        <div className="mx-auto w-full min-w-0 max-w-3xl space-y-8 xl:max-w-none">
          <GuideHeader
            guide={guide}
            index={index}
            insights={insights}
            done={completion?.done}
            total={completion?.total}
            bonusHidden={bonusHidden}
            expectedLevel={(currentStep && simByStep?.get(currentStep.id)?.level) ?? currentStep?.sim?.[routeStyle]?.level}
            onJumpCurrent={() => { if (currentId) select(currentId, "center"); }}
            onMarkUpToHere={
              currentStep
                ? () => {
                    const ids = visibleSteps.filter((s) => s.n <= currentStep.n).map((s) => s.id);
                    if (ids.length) progress.setDone(ids, true);
                  }
                : undefined
            }
          />
          {blocks.map((b, i) =>
            progressive.isMounted(i) ? (
              <div key={b.id} ref={(el) => progressive.setMeasureNode(b.id, el)}>
                <ZoneSection
                  guide={guide}
                  simByStep={simByStep}
                  block={b}
                  position={sectionPositions[i]!}
                  zones={zones}
                  vis={vis}
                  isShown={isShown}
                  isDone={isDone}
                  currentId={currentId}
                  questName={questName}
                  lineVisible={vis.line}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  onJump={onJump}
                  onStopSelect={onStopSelect}
                  onReveal={onReveal}
                  quests={quests}
                  nearMisses={insights?.nearMisses[guide.slug]}
                  addedQuests={addedQuests}
                  hasProfile={!!active}
                  onToggleNearMiss={onToggleNearMiss}
                  leg={b.steps.some((s) => s.id === currentId) ? selectedLeg : undefined}
                  caption={b.steps.some((s) => s.id === currentId) ? stepCaption : undefined}
                  tipCtx={tipCtx}
                  progressProfile={progressProfile}
                  stepStatus={progress.stepStatus}
                  stepsForQuest={stepsForQuest}
                  resolveStep={resolveStep}
                />
              </div>
            ) : (
              <div
                key={b.id}
                ref={(el) => progressive.setMeasureNode(b.id, el)}
                id={`section-${b.id}`}
                aria-hidden="true"
                data-section-placeholder={b.id}
                data-section-first-step={b.steps.find((s) => order.includes(s.id))?.id ?? b.steps[0]?.id}
                style={{
                  minHeight: progressive.placeholderHeight(b),
                  contentVisibility: "auto",
                  containIntrinsicSize: `auto ${progressive.placeholderHeight(b)}px`,
                }}
              />
            ),
          )}
          {completion && completion.total > 0 && completion.done >= completion.total && (
            <GuideCompleteCard
              nextSlug={nextSlug}
              nextName={nextSlug ? guideName(nextSlug, nextLoaded?.displayName) : undefined}
              expectedLevel={exitExpectedLevel(guide.steps, vis, simByStep, routeStyle)}
            />
          )}
        </div>
        <aside aria-label="Current section" className="hidden xl:block">
          <div className="sticky top-[calc(var(--topbar-h)+1.25rem)] max-h-[calc(100vh-var(--topbar-h)-2.5rem)] overflow-y-auto pb-2 pr-1">{panel}</div>
        </aside>
      </div>
      <MobileGuideBar
        panel={panel}
        stepLabel={currentStep ? `Step ${currentStep.n}` : "—"}
        currentId={currentId}
        open={sheetOpen}
        setOpen={setSheetOpen}
        onPrev={() => runNav("prev")}
        onNext={() => runNav("next")}
        onToggle={() => runNav("toggle")}
        onJumpCurrent={() => { if (currentId) select(currentId, "center"); }}
      />
      <span className="sr-only" aria-live="polite">
        {currentStep ? `Step ${posInOrder} of ${order.length}${isDone(currentStep.id) ? ", done" : ""}` : ""}
      </span>
      {drawerQuestId != null && (
        <QuestDrawer questId={drawerQuestId} quests={quests} zones={zones} onClose={closeQuestDrawer} />
      )}
    </div>
  );
}
