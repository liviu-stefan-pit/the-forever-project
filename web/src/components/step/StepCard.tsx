import { memo, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { Filter, Step, StepSim } from "../../data/schema";
import type { QuestNameLookup } from "../../lib/actions";
import { buildBlockedBanner } from "../../lib/blockedBanner";
import { checkpointNextSentence } from "../../lib/xp/checkpointText";
import { cardHooks, cardTips, hookReached, hookSkillWarning, hookText, isUnverified, routeMembership, type TipContext } from "../../lib/stepExtras";
import { useEngine, useIsCurrent, useStepDone, useStepRequirement, useStepStatus } from "../../state/progress";
import type { ActiveRoute, StepsForQuest } from "../../state/questProgress";
import { unavailableTag as tagFromRequirement } from "../../state/stepRequirement";
import { Icon, type IconName } from "../ui/Icon";
import { isTouchOnly } from "../../lib/touch";
import { ConditionBadges, FilterTag } from "./ActionChips";
import { RichLine } from "./RichLine";
import { StepLines } from "./StepLines";
import { StopBadge } from "./StopBadge";
import { stepLines } from "../../lib/stepLines";

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
  /** `via: "tap"` = the whole card was tapped on a touch device. */
  onToggle: (step: Step, via?: "tap") => void;
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
  /** Read-only: a step for another class or race that the player opened with Show. */
  preview?: boolean;
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
  preview = false,
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
  const { tip, advice, elite, professionTips } = cardTips(step, tipCtx);
  const hooks = cardHooks(step, tipCtx);
  const [xpOpen, setXpOpen] = useState(false);
  const dungeon = step.dungeon;
  const membership = routeMembership(step);
  const showBalancedExtra = membership === "balanced" && !!tipCtx.guideHasSpeedrun;
  const unverified = isUnverified(step);
  const xpBadge = sim && sim.gained > 0 ? sim : undefined;
  // Hover tooltip on desktop; tapping the badge shows the same breakdown on phones.
  const xpBreakdown = xpBadge ? gainedTooltip(xpBadge) : undefined;
  // A preview shows its full text but can't be ticked: it isn't on this character's route.
  const collapsed = !!unavailableTag && !preview;
  const displayDone = !preview && (isDone || collapsed);
  // Finished steps fold to one line; the chevron (or a click on the card) opens them again.
  const [openDone, setOpenDone] = useState(false);
  const foldable = displayDone && !collapsed && !isCurrent;
  const folded = foldable && !openDone;
  const hidden = collapsed || folded;
  const model = hidden ? null : stepLines(lines, step.actions.filter((a) => lineVisible(a.filter)));
  const requirement =
    requirementKind ??
    (engine ? storeRequirement.kind : undefined) ??
    (collapsed ? "not_applicable" : isDone ? "done" : blocked ? "blocked" : "required");

  const onCardClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a,button,[data-no-tap]")) return;
    if (folded) {
      setOpenDone(true);
      return;
    }
    // Phones: tapping anywhere on the card ticks it (no mouse to aim at the small circle).
    if (!collapsed && !preview && isTouchOnly() && !window.getSelection()?.toString()) {
      onToggle(step, "tap");
      return;
    }
    onSelect(step);
  };

  const frame = [
    "wow-frame step-card lift group/step relative scroll-mt-[calc(var(--topbar-h)+4.5rem)] overflow-hidden transition-[border-color,background-color,opacity] duration-200",
    isCurrent ? "step-active" : bonus ? "hover:border-bronze-400/60" : "hover:border-bronze-500/50",
    displayDone && !isCurrent ? "opacity-70 hover:opacity-95" : "",
    tags.optional && !isDone && !isCurrent ? "opacity-75" : "",
  ].join(" ");

  const tagRow = (
    <>
      {step.stop !== undefined && <StopBadge n={step.stop} bonus={!!bonus} size="sm" />}
      {preview ? (
        <Tag tone="slate" title="Shown because you pressed Show. It is not on your character's route.">
          Not for your character
        </Tag>
      ) : (
        unavailableTag && <Tag tone="slate">{unavailableTag}</Tag>
      )}
      {unverified && <UnverifiedChip />}
      {dungeon && (
        <Tag tone="dungeon" title="Dungeon step: shown because dungeons are on">
          <Icon name="skull" className="h-3 w-3" /> Dungeon{dungeon.name ? ` · ${dungeon.name}` : ""}
        </Tag>
      )}
      {tags.dungeonPart && <Tag tone="dungeon" title={`Dungeon ${tags.dungeonPart}`}>{DUNGEON_PART[tags.dungeonPart] ?? tags.dungeonPart}</Tag>}
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
    </>
  );

  const notes: ReactNode[] = [];
  if (sim?.levelUp != null)
    notes.push(
      <Note key="lvl" icon="star" tone="text-done" testId="step-level-up">
        <strong className="font-semibold text-done">Level {sim.levelUp}!</strong>
        {levelUpNext ? ` ${levelUpNext}` : null}
      </Note>,
    );
  if (sim?.grindSkip) notes.push(<Note key="gskip" icon="info" tone="text-muted">Already at this level — skip this grind.</Note>);
  else if (sim?.grindKillXp != null && step.actions.some((a) => a.type === "xp"))
    notes.push(<Note key="gxp" icon="info" tone="text-muted">Remaining kill experience: {sim.grindKillXp.toLocaleString("en-US")}.</Note>);
  if (bonus)
    notes.push(
      <Note key="bonus" icon="star" tone="text-bronze-400">
        <strong className="font-semibold text-bronze-300">+{bonus.xp.toLocaleString()} XP</strong> · {bonus.why}
      </Note>,
    );
  if (step.mayBeSkipped)
    notes.push(
      <Note key="skip" icon="info" tone="text-muted">
        Skip once you are level {step.mayBeSkipped.expectedLevel} — {step.mayBeSkipped.reason}
      </Note>,
    );
  if (blocked)
    notes.push(
      <Note key="blocked" icon="alert" tone="text-warn" testId="step-blocked">
        <strong className="font-semibold text-warn">Blocked:</strong>{" "}
        {blocked.entries.map((e, k) => (
          <span key={e.questId}>
            {k > 0 ? "; " : ""}
            {e.detail}
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
              <span className="text-muted"> (not in this guide)</span>
            ) : null}
          </span>
        ))}
      </Note>,
    );
  if (tip)
    notes.push(
      <Note key="tip" icon={tip.kind === "speed" ? "zap" : "alert"} tone="text-tip" testId="step-tip">
        <span className="sr-only">{tip.kind === "speed" ? "Speed tip: " : "Tip: "}</span>
        {tip.classes?.length ? <span className="text-tip">{tip.classes.join("/")}: </span> : tip.roles?.length ? <span className="text-tip">{tip.roles.join("/")}: </span> : null}
        {tip.text}
      </Note>,
    );
  if (advice)
    notes.push(
      <Note key="advice" icon="shield" tone="text-tip" testId="step-advice">
        <span className="text-tip">
          {advice.roles?.join("/")}
          {advice.classes?.length ? ` · ${advice.classes.join("/")}` : ""}:{" "}
        </span>
        {advice.text}
      </Note>,
    );
  elite.forEach((e, i) =>
    notes.push(
      <Note key={`elite-${i}`} icon="skull" tone="text-danger" testId="step-elite">
        <span className="font-semibold text-danger">Elite: </span>
        {e.name && (
          <strong className="font-semibold">
            {e.name}
            {e.level ? ` (${e.level})` : ""}
            {e.groupSize && e.groupSize > 1 ? ` · group of ${e.groupSize}` : ""}
            {e.tip ? " — " : ""}
          </strong>
        )}
        {e.tip?.text}
      </Note>,
    ),
  );
  hooks.forEach((h, i) => {
    const reached = hookReached(h, tipCtx?.skills);
    const warn = hookSkillWarning(h, tipCtx?.skills);
    notes.push(
      <Foldable key={`hook-${i}`} className={`text-[13px] leading-5 ${reached ? "text-muted opacity-70" : "text-ink"}`} testId="step-profession">
        <span className={`mr-1.5 inline-flex items-center gap-1 align-[-2px] font-semibold text-profession ${reached ? "line-through" : ""}`}>
          <Icon name="bag" className="h-3.5 w-3.5" />
          {h.profession}
        </span>
        <span>
          <span className={reached ? "line-through" : undefined}>{hookText(h, tipCtx?.skills)}</span>
          {warn && <span className="text-bronze-400"> · {warn}</span>}
          {h.npc && (
            <span className="text-muted no-underline">
              {" "}
              · {h.npc.name}, {h.npc.x.toFixed(1)}, {h.npc.y.toFixed(1)} {h.npc.zone}
            </span>
          )}
        </span>
      </Foldable>,
    );
  });
  professionTips.forEach((t, i) =>
    notes.push(
      <Foldable key={`ptip-${i}`} className="text-[13px] leading-5 text-ink" testId="step-profession">
        <span className="mr-1.5 inline-flex items-center gap-1 align-[-2px] font-semibold text-profession">
          <Icon name="bag" className="h-3.5 w-3.5" /> Profession
        </span>
        <span>{t.text}</span>
      </Foldable>,
    ),
  );

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
      {bonus && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-bronze-400 via-bronze-500 to-bronze-900" />}
      <div className={`flex gap-3 ${companion ? "px-3 py-2" : "px-3.5 py-2.5 sm:px-4 sm:py-3"} ${bonus ? "pl-4 sm:pl-5" : ""}`}>
        <button
          type="button"
          disabled={collapsed || preview}
          onClick={() => {
            if (collapsed || preview) return;
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

        <div className="min-w-0 flex-1">
          {/* header: number, tags (or the folded summary), XP, fold */}
          <div className="flex min-h-6 items-center gap-1.5 text-[11px]">
            <span className="shrink-0 font-mono tabular-nums text-muted">#{step.n}</span>
            {folded ? (
              <span data-testid="step-summary" className="min-w-0 flex-1 truncate text-[13px] text-muted">
                {lines[0] ? <RichLine line={lines[0]} /> : null}
              </span>
            ) : (
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{tagRow}</span>
            )}
            {xpBadge && (
              <button
                type="button"
                data-testid="step-xp"
                title={xpBreakdown}
                aria-expanded={xpBreakdown ? xpOpen : undefined}
                aria-label={`+${xpBadge.gained.toLocaleString("en-US")} XP${xpBreakdown ? ", show breakdown" : ""}`}
                onClick={() => xpBreakdown && setXpOpen((o) => !o)}
                className={`shrink-0 font-mono text-xs font-bold tabular-nums ${folded ? "text-muted" : "text-bronze-300"} hover:text-bronze-300`}
              >
                +{xpBadge.gained.toLocaleString("en-US")} XP
              </button>
            )}
            {foldable && (
              <button
                type="button"
                data-testid="step-fold"
                aria-expanded={!folded}
                aria-label={folded ? `Show step ${step.n}` : `Hide step ${step.n}`}
                onClick={() => setOpenDone((o) => !o)}
                className="-my-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:text-bronze-300"
              >
                <Icon name="chevronDown" className={`h-4 w-4 transition ${folded ? "" : "rotate-180"}`} />
              </button>
            )}
          </div>
          {xpOpen && xpBreakdown && !folded && (
            <p data-testid="step-xp-breakdown" className="fade-in text-right text-xs tabular-nums text-bronze-300/80">
              {xpBreakdown}
            </p>
          )}

          {model && (
            <div className="mt-1.5">
              <StepLines model={model} questName={questName} profile={tipCtx?.profile} quests={tipCtx?.quests} stepId={step.id} compact={companion} />
              {step.conditions.length > 0 && (
                <div className="mt-1.5">
                  <ConditionBadges conditions={step.conditions} stepId={step.id} />
                </div>
              )}
            </div>
          )}

          {!hidden && notes.length > 0 && (
            <div data-testid="step-notes" className="mt-2.5 space-y-1 border-t border-stroke/50 pt-2">
              {notes}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const DUNGEON_PART: Record<string, string> = { pickup: "Pickup", prep: "Prep", run: "Run", turnin: "Turn-in" };

/** One line in the notes block under a card: icon, then text. */
function Note({ icon, tone, testId, children }: { icon: IconName; tone: string; testId?: string; children: ReactNode }) {
  return (
    <p data-testid={testId} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
      <Icon name={icon} className={`mt-[3px] h-3.5 w-3.5 shrink-0 ${tone}`} />
      <span className="min-w-0">{children}</span>
    </p>
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

/**
 * Long side notes (profession hooks) fold to two lines on phones so the step itself stays easy to scan
 * while scrolling. "More" opens the full note; wider screens always show it in full.
 */
function Foldable({ children, className, testId }: { children: ReactNode; className: string; testId?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const measure = () => setOverflows(el.scrollHeight - el.clientHeight > 2);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);
  return (
    <div className={className} data-testid={testId}>
      <p ref={ref} className={open ? undefined : "line-clamp-2 sm:line-clamp-none"}>
        {children}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="-mb-1 mt-0.5 inline-flex min-h-[32px] items-center gap-1 font-semibold text-profession sm:hidden"
        >
          {open ? "Less" : "More"}
          <Icon name="chevronDown" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
