import { memo, type MouseEvent, type ReactNode } from "react";
import type { Filter, Step, StepSim } from "../../data/schema";
import type { QuestNameLookup } from "../../lib/actions";
import { buildBlockedBanner } from "../../lib/blockedBanner";
import { checkpointNextSentence } from "../../lib/xp/checkpointText";
import { cardTips, hookReached, hookSkillWarning, hookText, isUnverified, routeMembership, type TipContext } from "../../lib/stepExtras";
import { useEngine, useIsCurrent, useStepDone, useStepRequirement, useStepStatus } from "../../state/progress";
import type { ActiveRoute, StepsForQuest } from "../../state/questProgress";
import { unavailableTag as tagFromRequirement } from "../../state/stepRequirement";
import { Icon } from "../ui/Icon";
import { ActionChips, ConditionBadges, FilterTag } from "./ActionChips";
import { RichLine } from "./RichLine";
import { StopBadge } from "./StopBadge";

export interface BlockedBannerProps {
  /** Full banner text from `buildBlockedBanner`. */
  text: string;
  entries: {
    questId: number;
    detail: string;
    acceptStepId?: string;
    notInGuide: boolean;
  }[];
  onJumpStep?: (stepId: string) => void;
}

export interface StepCardProps {
  step: Step;
  /** Tests may pass these; the reader reads them from the progress store. */
  isCurrent?: boolean;
  isDone?: boolean;
  /** Rendered inside a `completeWith` group, above the step it completes with. */
  companion?: boolean;
  /** Unresolved `completeWith` label target (label in another guide, or not adjacent). */
  until?: { label: string; stepId?: string };
  questName?: QuestNameLookup;
  lineVisible: (f: Filter | undefined) => boolean;
  onToggle: (step: Step) => void;
  onSelect: (step: Step) => void;
  /** Live recompute for the active route. Absent = baked `step.sim`. */
  simOverride?: StepSim;
  /** Pins and scrolls to a step. Absent callers keep the one-shot scrollIntoView. */
  onJump?: (stepId: string) => void;
  /** Character + route context: picks the matching tips and profession hooks. */
  tipCtx?: TipContext;
  /** When the step is blocked on missing prereqs / log quests. */
  blocked?: BlockedBannerProps;
  /** Display-only: the step looks done and collapsed, without writing the quest complete. */
  unavailableTag?: "Breadcrumb" | "Unavailable";
  requirementKind?: "required" | "done" | "blocked" | "not_applicable";
  /** Used to build the blocked banner inside the card so the section does not re-render. */
  stepsForQuest?: StepsForQuest;
  resolveStep?: (id: string) => Step | undefined;
  guideSlug?: string;
  guideSteps?: readonly Step[];
}

const NO_CTX: TipContext = { route: "balanced", dungeons: false };

function Tag({ children, tone = "slate", title }: { children: ReactNode; tone?: "slate" | "gold" | "teal" | "red" | "dungeon" | "warn"; title?: string }) {
  const tones = {
    slate: "border-stroke text-muted",
    gold: "border-bronze-500/40 text-bronze-300",
    teal: "border-horde-500/40 text-bronze-300",
    red: "border-horde-500/40 text-horde-300",
    dungeon: "border-horde-400/60 bg-horde-700/40 text-horde-300",
    warn: "border-warn/50 text-warn",
  };
  return (
    <span title={title} className={`inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StepCardImpl({
  step,
  isCurrent: isCurrentProp,
  isDone: isDoneProp,
  companion = false,
  until,
  questName,
  lineVisible,
  onToggle,
  onSelect,
  onJump,
  tipCtx = NO_CTX,
  blocked: blockedProp,
  unavailableTag: unavailableTagProp,
  requirementKind,
  stepsForQuest,
  resolveStep,
  guideSlug,
  guideSteps,
  simOverride,
}: StepCardProps) {
  const engine = useEngine();
  const storeDone = useStepDone(step.id);
  const storeCurrent = useIsCurrent(step.id);
  const status = useStepStatus(step.id);
  const storeRequirement = useStepRequirement(step.id);
  const isCurrent = engine ? storeCurrent : (isCurrentProp ?? storeCurrent);
  const isDone = engine ? storeDone : (isDoneProp ?? storeDone);
  const blocked =
    blockedProp ??
    (status.status === "blocked" && status.missing?.length && stepsForQuest && resolveStep && guideSlug
      ? {
          ...buildBlockedBanner(status.missing, tipCtx.quests, stepsForQuest, resolveStep, guideSlug, {
            beforeStepId: step.id,
            route:
              tipCtx.profile || guideSteps
                ? ({
                    route: tipCtx.route,
                    steps: guideSteps ?? [],
                    dungeons: tipCtx.dungeons,
                  } satisfies ActiveRoute)
                : undefined,
          }),
          onJumpStep: (stepId: string) => {
            const target = resolveStep(stepId);
            if (target && onJump) onJump(stepId);
            else document.getElementById(`step-${stepId}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
          },
        }
      : undefined);
  const unavailableTag = unavailableTagProp ?? tagFromRequirement(storeRequirement);
  const lines = step.text.filter((l) => lineVisible(l.filter));
  const { tags } = step;
  const bonus = step.bonus;
  const sim = simOverride ?? step.sim?.[tipCtx.route];
  const levelUpNext = sim?.levelUp != null ? checkpointNextSentence(sim.next) : undefined;
  const { tip, advice, elite, hooks, professionTips } = cardTips(step, tipCtx);
  const dungeon = step.dungeon;
  const membership = routeMembership(step);
  const showBalancedExtra = membership === "balanced" && !!tipCtx.guideHasSpeedrun;
  const unverified = isUnverified(step);
  const xpBadge = sim && sim.gained > 0 ? sim : undefined;
  const collapsed = !!unavailableTag;
  const displayDone = isDone || collapsed;
  const requirement =
    requirementKind ??
    (engine ? storeRequirement.kind : undefined) ??
    (collapsed ? "not_applicable" : isDone ? "done" : blocked ? "blocked" : "required");

  const onCardClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    onSelect(step);
  };

  const frame = [
    "wow-frame step-card lift group/step relative scroll-mt-[calc(var(--topbar-h)+4.5rem)] overflow-hidden transition-[border-color,background-color,opacity] duration-200",
    isCurrent ? "step-active" : bonus ? "hover:border-bronze-400/60" : "hover:border-bronze-500/50",
    displayDone && !isCurrent ? "opacity-70 hover:opacity-95" : "",
    tags.optional && !isDone && !isCurrent ? "opacity-75" : "",
  ].join(" ");

  return (
    <article
      id={`step-${step.id}`}
      data-step-id={step.id}
      data-requirement={requirement}
      data-done={displayDone ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      aria-current={isCurrent ? "step" : undefined}
      aria-label={`Step ${step.n}${displayDone ? ", done" : ""}`}
      className={frame}
      onClick={onCardClick}
    >
      {xpBadge && (
        <span
          data-testid="step-xp"
          title={gainedTooltip(xpBadge)}
          className="absolute right-2 top-2 z-10 rounded border border-bronze-500/50 bg-canvas/95 px-2 py-0.5 text-sm font-bold tabular-nums leading-5 text-bronze-300"
        >
          +{xpBadge.gained.toLocaleString("en-US")} XP
        </span>
      )}
      {bonus && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-bronze-400 via-bronze-500 to-bronze-900" />}
      <div className={`flex gap-3 ${companion ? "px-3 py-2.5" : "px-3.5 py-3 sm:px-4 sm:py-3.5"} ${bonus ? "pl-4 sm:pl-5" : ""} ${xpBadge ? "pr-24 sm:pr-28" : ""}`}>
        {/* done toggle */}
        <button
          type="button"
          disabled={collapsed}
          onClick={() => {
            if (collapsed) return;
            onToggle(step);
          }}
          aria-pressed={displayDone}
          aria-label={collapsed ? `Step ${step.n} unavailable` : displayDone ? `Mark step ${step.n} not done` : `Mark step ${step.n} done`}
          className="press -m-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <span
            key={displayDone ? "done" : "todo"}
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
              displayDone
                ? "tick-pop border-done bg-done text-canvas"
                : isCurrent
                  ? "border-bronze-400 bg-bronze-900/40 text-transparent group-hover/step:text-bronze-300/60"
                  : "border-stroke bg-canvas/40 text-transparent hover:border-bronze-400 hover:text-bronze-400"
            }`}
          >
            <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          {/* meta row */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-bronze-500/80">
            <span className="font-mono tabular-nums text-muted">#{step.n}</span>
            {step.stop !== undefined && <StopBadge n={step.stop} bonus={!!bonus} size="sm" />}
            {displayDone && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-done">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} /> Done
              </span>
            )}
            {unavailableTag && <Tag tone="slate">{unavailableTag}</Tag>}
            {dungeon && (
              <Tag tone="dungeon" title="Dungeon step: shown because dungeons are on">
                <Icon name="skull" className="h-3 w-3" /> Dungeon{dungeon.name ? ` · ${dungeon.name}` : ""}
              </Tag>
            )}
            {tags.dungeonPart && (
              <Tag tone="dungeon" title={`Dungeon ${tags.dungeonPart}`}>
                {tags.dungeonPart === "pickup"
                  ? "Pickup"
                  : tags.dungeonPart === "prep"
                    ? "Prep"
                    : tags.dungeonPart === "run"
                      ? "Run"
                      : tags.dungeonPart === "turnin"
                        ? "Turn-in"
                        : tags.dungeonPart}
              </Tag>
            )}
            {unverified && lines.length === 0 && <UnverifiedChip />}
            {showBalancedExtra && (
              <Tag title="Not on the Speedrun route">
                <Icon name="sparkle" className="h-3 w-3" /> Balanced extra
              </Tag>
            )}
            {membership === "speedrun" && (
              <Tag title="Only on the Speedrun route">
                <Icon name="zap" className="h-3 w-3" /> Speedrun only
              </Tag>
            )}
            {tags.label && <Tag tone="teal">{tags.label}</Tag>}
            {tags.loop && (
              <Tag title="Loop along the path until done">
                <Icon name="loop" className="h-3 w-3" /> loop
              </Tag>
            )}
            {tags.sticky && (
              <Tag title="Stays relevant while you continue">
                <Icon name="pinTag" className="h-3 w-3" /> sticky
              </Tag>
            )}
            {tags.optional && <Tag>Optional</Tag>}
            {tags.softcore && <Tag title="Softcore only (skip on hardcore)">softcore</Tag>}
            {tags.requires && <Tag title="Requires">needs {tags.requires}</Tag>}
            <FilterTag filter={step.filter} />
            {until && (
              <span className="inline-flex items-center gap-1 text-[11px] text-bronze-500/80">
                <Icon name="hourglass" className="h-3 w-3" />
                {until.stepId ? (
                  <a href={`#step-${until.stepId}`} onClick={(e) => { e.preventDefault(); if (onJump) onJump(until.stepId!); else document.getElementById(`step-${until.stepId}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} className="underline decoration-dotted underline-offset-2 hover:text-ink">
                    until {until.label}
                  </a>
                ) : (
                  <span>until “{until.label}”</span>
                )}
              </span>
            )}
          </div>

          {/* text */}
          {!collapsed && lines.length > 0 && (
            <div className={`space-y-1 ${companion ? "text-[13px]" : "text-sm sm:text-[15px]"} leading-relaxed text-ink`}>
              {lines.map((l, i) => (
                <p key={i} className="break-words">
                  <RichLine line={l} />
                  {l.filter && (
                    <span className="ml-1.5 align-middle">
                      <FilterTag filter={l.filter} />
                    </span>
                  )}
                  {unverified && i === lines.length - 1 && <UnverifiedChip className="ml-2 align-middle" />}
                </p>
              ))}
            </div>
          )}

          {!collapsed && sim?.grindSkip && (
            <p className="text-xs text-muted">Already at this level — skip this grind.</p>
          )}
          {!collapsed && !sim?.grindSkip && sim?.grindKillXp != null && step.actions.some((a) => a.type === "xp") && (
            <p className="text-xs text-muted">Remaining kill experience: {sim.grindKillXp.toLocaleString("en-US")}.</p>
          )}
          {!collapsed && blocked && (
            <div
              data-testid="step-blocked"
              className="flex items-start gap-1.5 rounded-sm border border-warn/40 bg-warn/10 px-2.5 py-1.5 text-xs text-ink"
            >
              <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-warn">Blocked</p>
                <ul className="space-y-0.5">
                  {blocked.entries.map((e) => (
                    <li key={e.questId}>
                      <span>{e.detail}</span>
                      {e.acceptStepId ? (
                        <>
                          {" "}
                          <a
                            href={`#step-${e.acceptStepId}`}
                            onClick={(ev) => {
                              ev.preventDefault();
                              if (blocked.onJumpStep) blocked.onJumpStep(e.acceptStepId!);
                              else document.getElementById(`step-${e.acceptStepId}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
                            }}
                            className="font-semibold text-bronze-400 underline decoration-dotted underline-offset-2 hover:text-bronze-300"
                          >
                            Go to accept step
                          </a>
                        </>
                      ) : e.notInGuide ? (
                        <span className="text-muted"> — not in this guide</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <span className="sr-only">{blocked.text}</span>
              </div>
            </div>
          )}
          {!collapsed && bonus && (
            <p className="flex items-start gap-1.5 rounded-sm border border-bronze-500/25 bg-bronze-900/25 px-2.5 py-1.5 text-xs text-bronze-300">
              <Icon name="star" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <strong className="font-semibold">+{bonus.xp.toLocaleString()} XP</strong>
                <span className="text-bronze-300/80"> · {bonus.why}</span>
              </span>
            </p>
          )}
          {!collapsed && step.mayBeSkipped && (
            <p className="flex items-start gap-1.5 rounded-sm border border-horde-500/20 bg-horde-700/20 px-2.5 py-1.5 text-xs text-bronze-300">
              <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Skip once you are level {step.mayBeSkipped.expectedLevel}
                <span className="text-bronze-300/70"> — {step.mayBeSkipped.reason}</span>
              </span>
            </p>
          )}
          {!collapsed && sim?.levelUp != null && (
            <p
              data-testid="step-level-up"
              className="flex items-start gap-1.5 rounded-sm border border-done/35 bg-done/10 px-2.5 py-1.5 text-xs text-ink"
            >
              <Icon name="star" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-done" />
              <span>
                <strong className="font-semibold text-done">Level {sim.levelUp}!</strong>
                {levelUpNext ? ` ${levelUpNext}` : null}
              </span>
            </p>
          )}

          {!collapsed && tip && (
            <p className="flex items-start gap-2 text-[13px] leading-snug text-ink sm:text-sm" data-testid="step-tip">
              <span className="mt-px inline-flex shrink-0 items-center gap-1 rounded border border-tip/40 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-tip">
                <Icon name={tip.kind === "speed" ? "zap" : "info"} className="h-3 w-3" />
                {tip.kind === "speed" ? "Speed" : "Tip"}
                {tip.classes?.length ? ` · ${tip.classes.join("/")}` : tip.roles?.length ? ` · ${tip.roles.join("/")}` : ""}
              </span>
              <span className="min-w-0">{tip.text}</span>
            </p>
          )}
          {!collapsed && advice && (
            <p className="flex items-start gap-2 text-[13px] leading-snug text-ink sm:text-sm" data-testid="step-advice">
              <span className="mt-px inline-flex shrink-0 items-center gap-1 rounded border border-tip/40 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-tip">
                <Icon name="shield" className="h-3 w-3" />
                {advice.roles?.join("/")}
                {advice.classes?.length ? ` · ${advice.classes.join("/")}` : ""}
              </span>
              <span className="min-w-0">{advice.text}</span>
            </p>
          )}
          {!collapsed && elite.map((e, i) => (
            <p key={`elite-${i}`} className="flex items-start gap-2 text-[13px] leading-snug text-ink sm:text-sm" data-testid="step-elite">
              <span className="mt-px inline-flex shrink-0 items-center gap-1 rounded border border-danger/50 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-danger">
                <Icon name="skull" className="h-3 w-3" /> Elite
              </span>
              <span className="min-w-0">
                {e.name && (
                  <strong className="font-semibold">
                    {e.name}
                    {e.level ? ` (${e.level})` : ""}
                    {e.groupSize && e.groupSize > 1 ? ` · group of ${e.groupSize}` : ""}
                    {e.tip ? ": " : ""}
                  </strong>
                )}
                {e.tip?.text}
              </span>
            </p>
          ))}
          {!collapsed && hooks.map((h, i) => {
            const reached = hookReached(h, tipCtx?.skills);
            const warn = hookSkillWarning(h, tipCtx?.skills);
            return (
            <p key={`hook-${i}`} className={`flex items-start gap-2 rounded-sm border border-profession/30 bg-profession/10 px-2.5 py-1.5 text-xs text-ink ${reached ? "text-muted opacity-70" : ""}`} data-testid="step-profession">
              <span className={`inline-flex shrink-0 items-center gap-1 font-semibold text-profession ${reached ? "line-through" : ""}`}>
                <Icon name="bag" className="h-3.5 w-3.5" />
                {h.profession}
              </span>
              <span className="min-w-0">
                <span className={reached ? "line-through" : undefined}>{hookText(h, tipCtx?.skills)}</span>
                {warn && <span className="text-bronze-400"> · {warn}</span>}
                {h.npc && (
                  <span className="text-muted no-underline">
                    {" "}
                    · {h.npc.name}, {h.npc.x.toFixed(1)}, {h.npc.y.toFixed(1)} {h.npc.zone}
                  </span>
                )}
              </span>
            </p>
            );
          })}
          {!collapsed && professionTips.map((t, i) => (
            <p key={`ptip-${i}`} className="flex items-start gap-2 rounded-sm border border-profession/30 bg-profession/10 px-2.5 py-1.5 text-xs text-ink" data-testid="step-profession">
              <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-profession">
                <Icon name="bag" className="h-3.5 w-3.5" /> Profession
              </span>
              <span className="min-w-0">{t.text}</span>
            </p>
          ))}

          {!collapsed && (
            <>
              <ActionChips actions={step.actions} questName={questName} lineVisible={lineVisible} profile={tipCtx?.profile} quests={tipCtx?.quests} stepId={step.id} />
              <ConditionBadges conditions={step.conditions} stepId={step.id} />
            </>
          )}

        </div>
      </div>
    </article>
  );
}

function gainedTooltip(sim: StepSim): string | undefined {
  if (!sim?.gained) return undefined;
  const quest = (sim.questXp ?? []).reduce((n, q) => n + q.xp, 0);
  const rest = sim.gained - quest;
  const parts: string[] = [];
  if (quest > 0) parts.push(`Turn-ins +${quest.toLocaleString("en-US")} XP`);
  if (rest > 0) parts.push(`Kills/grind +${rest.toLocaleString("en-US")} XP`);
  return parts.join(" · ") || undefined;
}

export const StepCard = memo(StepCardImpl);

/** Quiet "not yet checked in game" marker; sits after the objective line (muted outline, never amber/red). */
function UnverifiedChip({ className = "" }: { className?: string }) {
  return (
    <span title="From WoW Forever data, not yet checked in game." data-testid="step-unverified" className={`inline-flex items-center gap-1 whitespace-nowrap rounded border border-stroke px-1.5 py-px text-[10px] font-medium leading-4 text-muted ${className}`}>
      <Icon name="question" className="h-3 w-3" /> Unverified
    </span>
  );
}
