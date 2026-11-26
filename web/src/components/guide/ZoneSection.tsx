/** One zone section: map header slot (P8) followed by its steps, with completeWith groups and hidden runs. */
import { memo, useMemo } from "react";
import type { Filter, Guide, Profile, Step, StepSim, Stop } from "../../data/schema";
import type { QuestMap, ZoneMap } from "../../data/loader";
import type { QuestNameLookup } from "../../lib/actions";
import { stepQuestIds } from "../../lib/actions";
import { buildSectionItems, resolveCompleteWith, type SectionBlock, type StepGroup } from "../../lib/grouping";
import { nearMissesInSection, nearMissRowsByStep, type NearMiss } from "../../lib/nearMiss";
import { linePlainText } from "../../lib/richtext";
import { stopIsComplete, type ActiveRoute, type StepsForQuest } from "../../state/questProgress";
import { countsInProgress, stepRequirement } from "../../state/stepRequirement";
import { HIDDEN_REASON_TEXT, type HiddenReason, type VisibilityEvaluator } from "../../state/visibility";
import type { StepLeg } from "../map/route";
import { ZoneMapSlot } from "../map/ZoneMapSlot";
import { visibleRoutePolyline } from "../map/route";
import { stepMarkers } from "../../lib/mapMarkers";
import { sectionStepPoints } from "../../lib/stepPoints";
import { StepCard } from "../step/StepCard";
import type { TipContext } from "../../lib/stepExtras";
import { Icon } from "../ui/Icon";
import { NearMissBlock, NearMissStepRow } from "./NearMissBlock";
import type { ProgressStore } from "../../state/progress";

export interface ZoneSectionProps {
  guide: Guide;
  block: SectionBlock;
  position: { index: number; total: number };
  zones: ZoneMap | undefined;
  vis: VisibilityEvaluator;
  isShown: (s: Step) => boolean;
  isDone: (id: string) => boolean;
  currentId: string | undefined;
  questName: QuestNameLookup;
  lineVisible: (f: Filter | undefined) => boolean;
  onToggle: (s: Step, via?: "tap") => void;
  onSelect: (s: Step) => void;
  onJump: (id: string) => void;
  onStopSelect: (s: Stop) => void;
  onReveal: (ids: string[]) => void;
  quests?: QuestMap;
  nearMisses?: readonly NearMiss[];
  addedQuests?: readonly number[];
  hasProfile?: boolean;
  onToggleNearMiss?: (questId: number) => void;
  /** Selected step's leg, only for the section that contains that step. */
  leg?: StepLeg;
  caption?: string;
  /** Character + route context for tip selection. */
  tipCtx?: TipContext;
  /** Progress profile + status for blocked banners and pin filtering. */
  progressProfile?: Profile | null;
  stepStatus?: ProgressStore["stepStatus"];
  stepsForQuest?: StepsForQuest;
  resolveStep?: (id: string) => Step | undefined;
  /** Live sim for the open guide. Null keeps baked `step.sim`. */
  simByStep?: ReadonlyMap<string, StepSim> | null;
}

/** UI wording for hidden reasons (DESIGN.md §6); falls back to the engine's text. */
const REASON_UI: Partial<Record<HiddenReason, string>> = {
  speedrun: "not on the Speedrun route",
  route: "Speedrun only",
  dungeons: "hidden because dungeons are off",
};

export function hiddenReasonText(r: HiddenReason): string {
  return REASON_UI[r] ?? HIDDEN_REASON_TEXT[r];
}

const questIdsBySteps = new WeakMap<readonly Step[], Set<number>>();

export function questIdsInGuide(steps: readonly Step[]): Set<number> {
  let ids = questIdsBySteps.get(steps);
  if (!ids) {
    ids = new Set(steps.flatMap(stepQuestIds));
    questIdsBySteps.set(steps, ids);
  }
  return ids;
}

function hiddenSummary(steps: Step[], vis: VisibilityEvaluator): string {
  const reasons = new Set<HiddenReason>();
  for (const s of steps) {
    const r = vis.step(s).reason;
    if (r) reasons.add(r);
  }
  return [...reasons].map(hiddenReasonText).join(", ") || "hidden";
}

function ZoneSectionImpl(p: ZoneSectionProps) {
  const { guide, block, vis, isShown, isDone, currentId } = p;
  const items = useMemo(() => buildSectionItems(block.steps, isShown), [block.steps, isShown]);
  const visibleSteps = useMemo(() => block.steps.filter(isShown), [block.steps, isShown]);

  const currentStep = currentId ? block.steps.find((s) => s.id === currentId) : undefined;
  const mapId = block.section?.mapId;
  const sectionRoute = useMemo(
    () => (mapId === undefined ? [] : visibleRoutePolyline(block.steps, mapId, isShown, p.lineVisible)),
    [block.steps, mapId, isShown, p.lineVisible],
  );
  const stepPoints = useMemo(
    () =>
      mapId === undefined
        ? []
        : sectionStepPoints({
            steps: block.steps,
            mapId,
            isShown,
            isDone,
            omit: (s) => {
              if (!p.progressProfile) return false;
              const route: ActiveRoute = {
                route: p.progressProfile.routeStyle,
                steps: guide.steps,
                dungeons: p.progressProfile.options.dungeons,
              };
              return !countsInProgress(stepRequirement(p.progressProfile, s, p.stepsForQuest ?? (() => []), p.quests, route));
            },
            currentId,
            lineVisible: p.lineVisible,
          }),
    [block.steps, mapId, isShown, currentId, p.lineVisible, p.progressProfile, p.quests, p.stepsForQuest, guide.steps],
  );
  const selectById = (id: string) => {
    const s = block.steps.find((x) => x.id === id);
    if (s) p.onSelect(s);
  };
  const markers = useMemo(() => {
    if (mapId === undefined || !p.leg || !currentStep) return [];
    const status = p.stepStatus?.(currentStep, p.quests);
    return stepMarkers(currentStep, p.quests, mapId, {
      profile: p.progressProfile ?? undefined,
      status,
    });
  }, [currentStep, p.quests, mapId, p.leg, p.progressProfile, p.stepStatus]);
  const activeStop = currentStep?.stop;
  const stepLabels = useMemo(() => {
    const o: Record<string, string> = {};
    for (const s of block.steps) {
      const t = s.text[0] ? linePlainText(s.text[0]) : "";
      o[s.id] = t || `Step ${s.n}`;
    }
    return o;
  }, [block.steps]);
  const existingQuestIds = questIdsInGuide(guide.steps);
  const sectionIds = useMemo(() => new Set(block.steps.map((s) => s.id)), [block.steps]);
  const sectionMisses = useMemo(
    () => nearMissesInSection(p.nearMisses, sectionIds),
    [p.nearMisses, sectionIds],
  );
  const extraRows = useMemo(
    () => nearMissRowsByStep(sectionMisses, p.addedQuests ?? [], existingQuestIds),
    [sectionMisses, p.addedQuests, existingQuestIds],
  );

  const doneStops = useMemo(() => {
    const set = new Set<number>();
    const byId = new Map(block.steps.map((s) => [s.id, s]));
    for (const stop of block.section?.stops ?? []) {
      const ids = stop.steps.filter((id) => visibleSteps.some((s) => s.id === id));
      const notApplicable = (id: string) => {
        const step = byId.get(id);
        if (!step || !p.stepStatus) return false;
        return p.stepStatus(step, p.quests).status === "not_applicable";
      };
      if (stopIsComplete(ids, isDone, notApplicable)) set.add(stop.n);
    }
    return set;
  }, [block.section, visibleSteps, p.stepStatus, p.quests]);

  const extrasAfter = (id: string) =>
    extraRows.get(id)?.map((m) => <NearMissStepRow key={`nm-${m.questId}`} miss={m} quests={p.quests} />);

  const renderCard = (s: Step, companion: boolean) => {
    return (
      <div key={s.id} className="space-y-2">
        <StepCard
          step={s}
          companion={companion}
          isCurrent={s.id === currentId}
          isDone={isDone(s.id)}
          preview={vis.step(s).reason === "filter"}
          until={!companion && s.tags.completeWith ? resolveCompleteWith(s, guide.steps) : undefined}
          questName={p.questName}
          lineVisible={p.lineVisible}
          onToggle={p.onToggle}
          onSelect={p.onSelect}
          onJump={p.onJump}
          tipCtx={p.tipCtx}
          stepsForQuest={p.stepsForQuest}
          resolveStep={p.resolveStep}
          guideSlug={guide.slug}
          guideSteps={guide.steps}
          simOverride={p.simByStep?.get(s.id)}
        />
        {extrasAfter(s.id)}
      </div>
    );
  };

  const renderGroup = (g: StepGroup) => {
    if (!g.companions.length) return <li key={g.key}>{renderCard(g.main, false)}</li>;
    return (
      <li key={g.key} className="wow-frame border-dashed p-1.5 sm:p-2">
        <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-bronze-500/80">
          <Icon name="layers" className="h-3 w-3" />
          Do together
        </div>
        <div className="space-y-1.5">
          <div className="space-y-1.5 border-l-2 border-stroke pl-1.5 sm:ml-1 sm:pl-2">
            {g.companions.map((c) => renderCard(c, true))}
          </div>
          <div className="flex items-center gap-1.5 px-2 text-[10px] uppercase tracking-wider text-bronze-500/80">
            <Icon name="chevronDown" className="h-3 w-3" /> while completing
          </div>
          {renderCard(g.main, false)}
        </div>
      </li>
    );
  };

  return (
    <section id={`section-${block.id}`} aria-label={block.section?.zone ?? "Steps"} className="scroll-mt-[calc(var(--topbar-h)+1.5rem)] space-y-3">
      {block.section ? (
        <ZoneMapSlot
          section={block.section}
          zone={p.zones?.get(block.section.mapId)}
          variant="header"
          stepCount={visibleSteps.length}
          position={p.position}
          activeStop={activeStop}
          doneStops={doneStops}
          stepLabels={stepLabels}
          onStopSelect={p.onStopSelect}
          leg={p.leg}
          caption={p.caption}
          markers={markers}
          sectionRoute={sectionRoute}
          stepPoints={stepPoints}
          onStepPointSelect={selectById}
        />
      ) : (
        <h2 className="font-display text-lg font-bold text-bronze-400">Steps</h2>
      )}
      <ol className="space-y-2.5">
        {items.map((it) =>
          it.kind === "group" ? (
            renderGroup(it.group)
          ) : (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => p.onReveal(it.steps.map((s) => s.id))}
                className="flex w-full items-center gap-2 rounded-sm border border-dashed border-stroke px-3.5 py-2 text-left text-xs text-bronze-500/80 transition hover:border-bronze-500/50 hover:text-ink"
              >
                <Icon name="eyeOff" className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  {it.steps.length} step{it.steps.length === 1 ? "" : "s"} hidden <span className="text-bronze-500/60">·</span> {hiddenSummary(it.steps, vis)}
                </span>
                <span className="font-semibold text-bronze-400">Show</span>
              </button>
              {it.steps.flatMap((s) => extrasAfter(s.id) ?? [])}
            </li>
          ),
        )}
      </ol>
      {p.onToggleNearMiss && (
        <NearMissBlock
          misses={sectionMisses}
          added={p.addedQuests ?? []}
          quests={p.quests}
          hasProfile={!!p.hasProfile}
          onToggle={p.onToggleNearMiss}
        />
      )}
    </section>
  );
}

export const ZoneSection = memo(ZoneSectionImpl);
