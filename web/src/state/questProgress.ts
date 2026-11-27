import type { Action, Profile, RouteStyle, Step } from "../data/schema";
import { FLIGHT_PATH_ALIASES } from "../data/flightPathAliases.ts";
import {
  hasQuestLogSnapshot,
  isItemStarted,
  isQuestExcluded,
  lookupQuest,
  questAvailability,
  unmetPrereqs,
  type QuestLookup,
} from "./questAvailability.ts";
import { isActionable, type Requirement } from "./stepRequirement.ts";

export type StepsForQuest = (questId: number) => readonly string[];

const EMPTY_STEP_IDS: readonly string[] = [];
/** Shared empty lookup so `isStepDone` / `stepStatus` never allocate `withLoadedSteps`. */
export const NO_QUEST_STEPS: StepsForQuest = () => EMPTY_STEP_IDS;

/** Step progress for the guide UI (Workstream B consumes this). */
export type StepStatus = "done" | "open" | "blocked" | "not_applicable";

export interface StepStatusResult {
  status: StepStatus;
  /** Quest ids still needed when `status` is `blocked`. */
  missing?: number[];
}

export function stepProgressQuestIds(step: Step): number[] {
  const ids: number[] = [];
  const add = (id: number | undefined) => {
    if (id !== undefined && !ids.includes(id)) ids.push(id);
  };
  for (const a of step.actions) {
    if (a.type === "accept" || a.type === "turnin" || a.type === "complete") add(a.questId);
    else if (a.type === "collect") add(a.questId);
  }
  for (const c of step.conditions) c.questIds?.forEach(add);
  return ids;
}

export function turninQuestIds(step: Step): number[] {
  const ids: number[] = [];
  for (const a of step.actions) {
    if (a.type === "turnin" && !ids.includes(a.questId)) ids.push(a.questId);
  }
  return ids;
}

type QuestAction = Extract<Action, { type: "accept" | "turnin" | "complete" | "collect" }>;

/** Accept / turnin / complete / collect-with-quest. Travel and trainer steps are not quest-backed. */
export function isQuestBackedStep(step: Step): boolean {
  return step.actions.some((a) => {
    if (a.type === "accept" || a.type === "turnin" || a.type === "complete") return true;
    return a.type === "collect" && a.questId !== undefined;
  });
}

/**
 * Goto, trainer, hearth, and other non-quest steps stay not-done in the list, but they are
 * not a place to resume once a later quest-backed step in this guide is already done.
 * `guideSteps` is the guide's own route order (every step, including ones the current route hides).
 */
export function skippedForNavigation(
  step: Step,
  guideSteps: readonly Step[],
  isDone: (id: string) => boolean,
  knownIndex?: number,
): boolean {
  if (isQuestBackedStep(step)) return false;
  const index = knownIndex ?? guideSteps.findIndex((s) => s.id === step.id);
  if (index < 0) return false;
  for (let i = index + 1; i < guideSteps.length; i++) {
    const later = guideSteps[i]!;
    if (isQuestBackedStep(later) && isDone(later.id)) return true;
  }
  return false;
}

/**
 * Navigation skip flags for one guide, one reverse pass.
 * Non-quest steps before a later done quest-backed step are skipped.
 */
export function skipFlagsForGuide(
  guideSteps: readonly Step[],
  isDone: (id: string) => boolean,
): Map<string, boolean> {
  const flags = new Map<string, boolean>();
  let laterQuestDone = false;
  for (let i = guideSteps.length - 1; i >= 0; i--) {
    const s = guideSteps[i]!;
    if (isQuestBackedStep(s)) {
      if (isDone(s.id)) laterQuestDone = true;
      flags.set(s.id, false);
    } else {
      flags.set(s.id, laterQuestDone);
    }
  }
  return flags;
}

function requirementForStatus(status: StepStatus): Requirement {
  if (status === "done") return { kind: "done" };
  if (status === "blocked") return { kind: "blocked", missing: [] };
  if (status === "not_applicable") return { kind: "not_applicable", reason: { type: "exclusive", questId: 0 } };
  return { kind: "required" };
}

/** True when the reader should not land on this step (blocked, not applicable, or passed travel). */
export function stepPickShouldSkip(
  step: Step,
  guideSteps: readonly Step[],
  isDone: (id: string) => boolean,
  status: StepStatus,
): boolean {
  const requirement = requirementForStatus(status);
  if (!isActionable(requirement) && requirement.kind !== "done") return true;
  return skippedForNavigation(step, guideSteps, isDone);
}

function questActions(step: Step): QuestAction[] {
  const out: QuestAction[] = [];
  for (const a of step.actions) {
    if (a.type === "accept" || a.type === "turnin" || a.type === "complete") out.push(a);
    else if (a.type === "collect" && a.questId !== undefined) out.push(a as QuestAction);
  }
  return out;
}

function actionQuestId(a: QuestAction): number | undefined {
  return a.questId;
}

/** Lowercase, strip punctuation, collapse spaces. */
export function normalizePlace(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function placeHits(nodeName: string, place: string): boolean {
  const target = normalizePlace(place);
  if (!target) return false;
  const aliases = (FLIGHT_PATH_ALIASES[target] ?? []).map(normalizePlace).filter(Boolean);
  const targets = [target, ...aliases];
  const parts = nodeName
    .split(",")
    .map(normalizePlace)
    .filter(Boolean);
  const whole = normalizePlace(nodeName);
  return targets.some(
    (t) => t === whole || parts.some((part) => part === t || part.includes(t) || t.includes(part)),
  );
}

/** True when a known taxi node matches the guide place or label. */
export function flightPathKnown(profile: Profile, action: { place?: string; label?: string }): boolean {
  const nodes = profile.flightPaths ?? [];
  return nodes.some((node) => {
    if (typeof node.name !== "string") return false;
    return (action.place ? placeHits(node.name, action.place) : false) || (action.label ? placeHits(node.name, action.label) : false);
  });
}

export function hearthKnown(profile: Profile, action: { place?: string; label?: string }): boolean {
  if (!profile.hearth) return false;
  const parts = profile.hearth
    .split(",")
    .map(normalizePlace)
    .filter(Boolean);
  const whole = normalizePlace(profile.hearth);
  if (!whole) return false;
  const hits = (value: string | undefined) => {
    const target = value ? normalizePlace(value) : "";
    if (!target) return false;
    if (whole.includes(target) || target.includes(whole)) return true;
    return parts.some((part) => part.includes(target) || target.includes(part));
  };
  return hits(action.place) || hits(action.label);
}

function travelSatisfied(profile: Profile, action: Action): boolean {
  if (action.type === "fp") return flightPathKnown(profile, action);
  if (action.type === "home") return hearthKnown(profile, action);
  return false;
}

type LogObjective = NonNullable<NonNullable<Profile["questLog"]>[number]["objectives"]>[number];

/**
 * Quest-log objective for a complete/collect chip.
 * Uses the 1-based `objective` index, or the only objective when the log has one.
 * No snapshot → undefined (do not treat a missing log as empty progress).
 */
export function logObjective(profile: Profile, questId: number, objective?: number): LogObjective | undefined {
  if (!hasQuestLogSnapshot(profile)) return undefined;
  const entry = profile.questLog?.find((e) => e.questId === questId);
  const objs = entry?.objectives;
  if (!objs?.length) return undefined;
  if (objs.length === 1) return objs[0];
  if (objective == null || objective < 1) return undefined;
  return objs[objective - 1];
}

export function objectiveMet(obj: LogObjective | undefined): boolean {
  if (!obj) return false;
  if (obj.finished === true) return true;
  const req = obj.numRequired;
  const got = obj.numFulfilled;
  return typeof req === "number" && req > 0 && typeof got === "number" && got >= req;
}

/** "3/10" when the known log has both counts for the matching objective. */
export function objectiveCountLabel(profile: Profile, questId: number, objective?: number): string | undefined {
  const obj = logObjective(profile, questId, objective);
  if (!obj) return undefined;
  if (typeof obj.numFulfilled !== "number" || typeof obj.numRequired !== "number") return undefined;
  return `${obj.numFulfilled}/${obj.numRequired}`;
}

function isExcludedAction(profile: Profile, questId: number, quests: QuestLookup | undefined): boolean {
  const info = lookupQuest(quests, questId);
  return !!info && isQuestExcluded(info, profile);
}

/**
 * Whether a single quest action is satisfied for step-done purposes.
 *
 * Without a quest-log snapshot, accept / complete / collect are satisfied only if the quest is
 * already marked done (the step may still be manually ticked via `rec.done`).
 */
function actionSatisfied(
  profile: Profile,
  action: QuestAction,
  quests: QuestLookup | undefined,
): boolean {
  const qid = actionQuestId(action);
  if (qid === undefined) return true;
  if (isExcludedAction(profile, qid, quests)) return true;

  const avail = questAvailability(qid, profile, quests);
  if (avail === "done") return true;

  const logKnown = hasQuestLogSnapshot(profile);
  if (action.type === "turnin") return false;
  if (action.type === "accept") {
    // No snapshot: accept only if done (handled above) or manual step tick.
    if (!logKnown) return false;
    return avail === "in_log" || avail === "ready";
  }
  // complete / collect: ready to turn in, or this objective finished in a known log.
  if (!logKnown) return false;
  if (avail === "ready") return true;
  const index = action.type === "complete" || action.type === "collect" ? action.objective : undefined;
  return objectiveMet(logObjective(profile, qid, index));
}

/**
 * A step is done only when every quest action is satisfied, or the user manually ticked it.
 * `{ skipped: true }` is never done. There is no any-quest or quest-steps.json shortcut.
 * If every quest action is excluded, the step is done only when those quests were actually
 * completed and the exclusion is not because an exclusiveTo sibling is done. A breadcrumb
 * the character finished (breadcrumbFor only) stays done. Otherwise it is not done
 * (callers treat it as not_applicable via stepStatus). Without quest info, a completed
 * quest still counts.
 */
export function isStepDone(
  profile: Profile,
  stepId: string,
  _stepsForQuest: StepsForQuest,
  step?: Step,
  quests?: QuestLookup,
): boolean {
  const rec = profile.steps[stepId];
  if (rec && "skipped" in rec && rec.skipped) return false;
  if (rec && "done" in rec && rec.done) return true;
  if (!step) return false;
  const actions = questActions(step);
  if (actions.length === 0) {
    const travel = step.actions.filter((a) => a.type === "fp" || a.type === "home");
    if (travel.length === 0) return false;
    return travel.every((a) => travelSatisfied(profile, a));
  }
  const required = requiredQuestActions(step, profile, quests);
  // Every quest action is excluded. Count it done only when the character finished those
  // quests and no exclusiveTo sibling is done. Breadcrumb-only exclusion still counts.
  // No quest info: keep the completed-quest check alone.
  if (actions.length > 0 && required.length === 0) {
    return actions.every((a) => {
      const qid = actionQuestId(a);
      if (qid === undefined || profile.quests[qid] !== "done") return false;
      const info = lookupQuest(quests, qid);
      if (!info) return true;
      return !info.exclusiveTo.some((id) => profile.quests[id] === "done");
    });
  }
  return actions.every((a) => actionSatisfied(profile, a, quests));
}

function requiredQuestActions(step: Step, profile: Profile, quests: QuestLookup | undefined): QuestAction[] {
  return questActions(step).filter((a) => {
    const qid = actionQuestId(a);
    if (qid === undefined) return false;
    return !isExcludedAction(profile, qid, quests);
  });
}

/** Ordered steps of the guide the user is viewing, plus the route filter already used by the guide. */
export interface ActiveRoute {
  route: RouteStyle;
  /** Guide order (step.n / file order). Steps off `route` are ignored. */
  steps: readonly Step[];
  /** Matches the guide dungeon toggle. Missing = dungeons off. */
  dungeons?: boolean;
}

function stepOnActiveRoute(step: Step, route: ActiveRoute): boolean {
  const routes: readonly RouteStyle[] = step.routes?.length ? step.routes : step.bonus ? ["balanced"] : ["balanced", "speedrun"];
  if (!routes.includes(route.route)) return false;
  const dungeons = !!route.dungeons;
  const dungeonOn =
    !!step.dungeon || step.conditions.some((c) => c.cmd === "dungeon" && !/^\s*!/.test(c.args));
  const dungeonOff =
    !!step.dungeonsOff || step.conditions.some((c) => c.cmd === "dungeon" && /^\s*!/.test(c.args));
  if ((dungeonOn && !dungeons) || (dungeonOff && dungeons)) return false;
  if (dungeons && step.dungeonsOffRoutes?.includes(route.route)) return false;
  return true;
}

const ROUTE_STYLES: readonly RouteStyle[] = ["balanced", "speedrun"];

/** Per-quest accept/turnin positions on one (slug, route, dungeons) combination. */
export interface GuideRouteIndex {
  acceptAt: Map<number, number[]>;
  acceptIdAt: Map<number, string[]>;
  turninAt: Map<number, number[]>;
}

/**
 * Built once from known steps / guide membership. Invalidated only when those change.
 * `routeFor` is a lookup; `closestPriorAcceptStepId` / `routeTurnsInByStep` are O(log).
 */
export interface StepIndexes {
  orderedBySlug: Map<string, Step[]>;
  stepIdToSlug: Map<string, string>;
  stepIdToSlugs: Map<string, string[]>;
  stepIdToIndex: Map<string, number>;
  questIdToStepIds: Map<number, string[]>;
  routeIndex: Map<string, GuideRouteIndex>;
}

export function emptyStepIndexes(): StepIndexes {
  return {
    orderedBySlug: new Map(),
    stepIdToSlug: new Map(),
    stepIdToSlugs: new Map(),
    stepIdToIndex: new Map(),
    questIdToStepIds: new Map(),
    routeIndex: new Map(),
  };
}

export function routeIndexKey(slug: string, route: RouteStyle, dungeons: boolean): string {
  return `${slug}\0${route}\0${dungeons ? "1" : "0"}`;
}

function stepIdPrefix(id: string): string {
  const i = id.indexOf(":");
  return i === -1 ? id : id.slice(0, i);
}

function sortGuideSteps(steps: Step[]): Step[] {
  steps.sort((a, b) => a.n - b.n || a.id.localeCompare(b.id));
  return steps;
}

function lastIndexLessThan(sorted: readonly number[], bound: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid]! < bound) lo = mid + 1;
    else hi = mid;
  }
  return lo - 1;
}

function pushUniqueIndex(at: Map<number, number[]>, ids: Map<number, string[]> | undefined, questId: number, index: number, stepId: string): void {
  const arr = at.get(questId);
  if (!arr) {
    at.set(questId, [index]);
    ids?.set(questId, [stepId]);
    return;
  }
  if (arr[arr.length - 1] === index) return;
  arr.push(index);
  ids?.get(questId)!.push(stepId);
}

function buildGuideRouteIndex(steps: readonly Step[], route: RouteStyle, dungeons: boolean): GuideRouteIndex {
  const dummy: ActiveRoute = { route, steps, dungeons };
  const acceptAt = new Map<number, number[]>();
  const acceptIdAt = new Map<number, string[]>();
  const turninAt = new Map<number, number[]>();
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]!;
    if (!stepOnActiveRoute(s, dummy)) continue;
    for (const a of s.actions) {
      if (a.type === "accept") pushUniqueIndex(acceptAt, acceptIdAt, a.questId, i, s.id);
      else if (a.type === "turnin") pushUniqueIndex(turninAt, undefined, a.questId, i, s.id);
    }
  }
  return { acceptAt, acceptIdAt, turninAt };
}

/** Indexes for `setKnownSteps` / `noteGuides`. Membership from `stepsByGuide` wins over id prefix. */
export function buildStepIndexes(
  knownSteps: Iterable<Step>,
  stepsByGuide: ReadonlyMap<string, ReadonlySet<string>>,
): StepIndexes {
  const indexes = emptyStepIndexes();
  const byId = new Map<string, Step>();
  for (const step of knownSteps) {
    byId.set(step.id, step);
    for (const qid of stepProgressQuestIds(step)) {
      const ids = indexes.questIdToStepIds.get(qid);
      if (ids) {
        if (!ids.includes(step.id)) ids.push(step.id);
      } else indexes.questIdToStepIds.set(qid, [step.id]);
    }
  }

  const owners = new Map<string, string[]>();
  if (stepsByGuide.size > 0) {
    for (const [slug, ids] of stepsByGuide) {
      const ordered: Step[] = [];
      for (const id of ids) {
        const step = byId.get(id);
        if (step) ordered.push(step);
        const list = owners.get(id);
        if (list) list.push(slug);
        else owners.set(id, [slug]);
      }
      indexes.orderedBySlug.set(slug, sortGuideSteps(ordered));
    }
  } else {
    for (const step of byId.values()) {
      const slug = stepIdPrefix(step.id);
      const list = indexes.orderedBySlug.get(slug);
      if (list) list.push(step);
      else indexes.orderedBySlug.set(slug, [step]);
      owners.set(step.id, [slug]);
    }
    for (const steps of indexes.orderedBySlug.values()) sortGuideSteps(steps);
  }

  for (const [id, slugs] of owners) {
    if (slugs.length === 1) indexes.stepIdToSlug.set(id, slugs[0]!);
    else indexes.stepIdToSlugs.set(id, slugs);
  }

  for (const [slug, steps] of indexes.orderedBySlug) {
    for (let i = 0; i < steps.length; i++) {
      const id = steps[i]!.id;
      if (!indexes.stepIdToIndex.has(id)) indexes.stepIdToIndex.set(id, i);
    }
    for (const route of ROUTE_STYLES) {
      for (const dungeons of [false, true]) {
        indexes.routeIndex.set(routeIndexKey(slug, route, dungeons), buildGuideRouteIndex(steps, route, dungeons));
      }
    }
  }

  return indexes;
}

export function lookupClosestPriorAccept(
  questId: number,
  stepId: string,
  indexes: StepIndexes,
  route: RouteStyle,
  dungeons: boolean,
): string | undefined {
  const slug = indexes.stepIdToSlug.get(stepId);
  const idx = indexes.stepIdToIndex.get(stepId);
  if (slug === undefined || idx === undefined || idx <= 0) return undefined;
  const ri = indexes.routeIndex.get(routeIndexKey(slug, route, !!dungeons));
  const at = ri?.acceptAt.get(questId);
  if (!at?.length) return undefined;
  const pos = lastIndexLessThan(at, idx);
  if (pos < 0) return undefined;
  return ri!.acceptIdAt.get(questId)![pos];
}

export function lookupRouteTurnsIn(
  questId: number,
  stepId: string,
  indexes: StepIndexes,
  route: RouteStyle,
  dungeons: boolean,
): boolean {
  const slug = indexes.stepIdToSlug.get(stepId);
  const idx = indexes.stepIdToIndex.get(stepId);
  if (slug === undefined || idx === undefined) return false;
  const ri = indexes.routeIndex.get(routeIndexKey(slug, route, !!dungeons));
  const at = ri?.turninAt.get(questId);
  if (!at?.length) return false;
  return lastIndexLessThan(at, idx + 1) >= 0;
}

/**
 * Closest accept for `questId` that sits strictly before `stepId` on the active route.
 * Guide order is the source of truth: a later accept, or an accept only on the other route, does not count.
 * Pass `indexes` from `buildStepIndexes` to avoid an O(G) scan; tests that supply a custom `route.steps` omit it.
 */
export function closestPriorAcceptStepId(
  questId: number,
  stepId: string,
  route: ActiveRoute | undefined,
  indexes?: StepIndexes,
): string | undefined {
  if (!route) return undefined;
  if (indexes && indexes.stepIdToSlug.has(stepId)) {
    return lookupClosestPriorAccept(questId, stepId, indexes, route.route, !!route.dungeons);
  }
  const idx = route.steps.findIndex((s) => s.id === stepId);
  if (idx <= 0) return undefined;
  let found: string | undefined;
  for (let i = 0; i < idx; i++) {
    const s = route.steps[i]!;
    if (!stepOnActiveRoute(s, route)) continue;
    if (s.actions.some((a) => a.type === "accept" && a.questId === questId)) found = s.id;
  }
  return found;
}

/**
 * True when the active route turns in `questId` on `stepId` or on a step strictly before it.
 * Accept-only does not count: the game unlocks the next quest on turn-in.
 * A turn-in only on the other route, or only after this step, does not count.
 */
export function routeTurnsInByStep(
  questId: number,
  stepId: string,
  route: ActiveRoute | undefined,
  indexes?: StepIndexes,
): boolean {
  if (!route) return false;
  if (indexes && indexes.stepIdToSlug.has(stepId)) {
    return lookupRouteTurnsIn(questId, stepId, indexes, route.route, !!route.dungeons);
  }
  const idx = route.steps.findIndex((s) => s.id === stepId);
  if (idx < 0) return false;
  for (let i = 0; i <= idx; i++) {
    const s = route.steps[i]!;
    if (!stepOnActiveRoute(s, route)) continue;
    if (s.actions.some((a) => a.type === "turnin" && a.questId === questId)) return true;
  }
  return false;
}

/**
 * Guide-facing status for a step. Export for Workstream B (routing UI); do not wire StepCard here.
 * `route`, when set, is the route the user is viewing. A complete/turnin is not blocked merely
 * because a quest-log snapshot lacks the quest when an earlier step on that route accepts it.
 * A locked follow-up is not blocked when this route already turns in the unmet prerequisite
 * on this step or earlier. A snapshot that has not caught up does not override that route order.
 */
export function stepStatus(
  profile: Profile,
  step: Step,
  stepsForQuest: StepsForQuest,
  quests?: QuestLookup,
  route?: ActiveRoute,
  indexes?: StepIndexes,
): StepStatusResult {
  const allActions = questActions(step);
  const required = requiredQuestActions(step, profile, quests);
  // A breadcrumb the character actually completed is done, even when its target is also done.
  // An exclusive alternative the game marked done is not (isStepDone is false when an
  // exclusiveTo sibling is done), so it falls through to not_applicable below.
  if (isStepDone(profile, step.id, stepsForQuest, step, quests)) {
    return { status: "done" };
  }
  // All quest actions excluded and the step is not done → not applicable.
  if (allActions.length > 0 && required.length === 0) {
    return { status: "not_applicable" };
  }

  const logKnown = hasQuestLogSnapshot(profile);
  const missing: number[] = [];
  // Following the viewed route turns this prerequisite in before this step.
  const routeDone = (id: number) => routeTurnsInByStep(id, step.id, route, indexes);

  for (const action of required) {
    const qid = actionQuestId(action)!;
    const avail = questAvailability(qid, profile, quests);
    const info = lookupQuest(quests, qid);

    if (action.type === "accept") {
      if (avail === "locked" && info) {
        for (const id of unmetPrereqs(info, profile, routeDone, quests)) {
          if (!missing.includes(id)) missing.push(id);
        }
      }
      continue;
    }

    // complete / collect / turnin
    if (avail === "locked" && info) {
      for (const id of unmetPrereqs(info, profile, routeDone, quests)) {
        if (!missing.includes(id)) missing.push(id);
      }
      continue;
    }

    if (avail === "done" || avail === "ready") continue;
    if (action.type === "complete" || action.type === "collect") {
      if (avail === "in_log") continue; // objectives not finished yet → stay open
    }

    if (!logKnown) continue; // absence from the log is not blocking without a snapshot

    if (avail === "in_log") continue;
    // Not done and not in the log.
    if (info && isItemStarted(info)) continue; // item-starts are not blocked for absence
    // Following the guide already accepts this quest on an earlier step of the viewed route.
    if (
      (action.type === "complete" || action.type === "turnin") &&
      closestPriorAcceptStepId(qid, step.id, route, indexes)
    ) {
      continue;
    }
    if (!missing.includes(qid)) missing.push(qid);
  }

  if (missing.length > 0) return { status: "blocked", missing };
  return { status: "open" };
}

export function withLoadedSteps(base: StepsForQuest, loaded?: readonly Step[]): StepsForQuest {
  if (!loaded?.length) return base;
  return (qid) => {
    const ids = [...base(qid)];
    for (const s of loaded) {
      if (stepProgressQuestIds(s).includes(qid) && !ids.includes(s.id)) ids.push(s.id);
    }
    return ids;
  };
}

function touch(profile: Profile, now: number): Profile {
  return { ...profile, updatedAt: now };
}

function setStepDone(profile: Profile, stepId: string, now: number): Profile {
  const prev = profile.steps[stepId];
  if (prev && "done" in prev && prev.done) return profile;
  return touch({ ...profile, steps: { ...profile.steps, [stepId]: { done: true, at: now } } }, now);
}

function clearStep(profile: Profile, stepId: string, now: number): Profile {
  if (!profile.steps[stepId]) return profile;
  const steps = { ...profile.steps };
  delete steps[stepId];
  return touch({ ...profile, steps }, now);
}

/** Stop check only: not_applicable counts as finished. It does not write quest or step done. */
export function stopIsComplete(
  stepIds: readonly string[],
  isDone: (id: string) => boolean,
  isNotApplicable: (id: string) => boolean,
): boolean {
  return stepIds.length > 0 && stepIds.every((id) => isDone(id) || isNotApplicable(id));
}

export function applyToggle(
  profile: Profile,
  stepId: string,
  step: Step | undefined,
  opts: { stepsForQuest: StepsForQuest; now: number; loadedSteps?: readonly Step[]; quests?: QuestLookup },
): Profile {
  const { now } = opts;
  const stepsForQuest = opts.loadedSteps?.length
    ? withLoadedSteps(opts.stepsForQuest, opts.loadedSteps)
    : opts.stepsForQuest;
  if (step && stepStatus(profile, step, stepsForQuest, opts.quests).status === "not_applicable") {
    return profile;
  }
  const done = isStepDone(profile, stepId, stepsForQuest, step, opts.quests);
  const qids = step ? turninQuestIds(step) : [];

  if (qids.length > 0) {
    if (!done) {
      let next = setStepDone(profile, stepId, now);
      const quests = { ...next.quests };
      for (const qid of qids) quests[qid] = "done";
      next = touch({ ...next, quests }, now);
      return next;
    }
    let next = clearStep(profile, stepId, now);
    const quests = { ...next.quests };
    for (const qid of qids) delete quests[qid];
    next = touch({ ...next, quests }, now);
    return next;
  }

  if (done) return clearStep(profile, stepId, now);
  return setStepDone(profile, stepId, now);
}

export function applySetDone(profile: Profile, stepIds: readonly string[], done: boolean, now: number): Profile {
  const steps = { ...profile.steps };
  let changed = false;
  for (const id of stepIds) {
    if (done) {
      if (!(steps[id] && "done" in steps[id]! && steps[id]!.done)) {
        steps[id] = { done: true, at: now };
        changed = true;
      }
    } else if (steps[id]) {
      delete steps[id];
      changed = true;
    }
  }
  return changed ? touch({ ...profile, steps }, now) : profile;
}

export function applyMarkQuestsDone(profile: Profile, questIds: readonly number[], now: number): Profile {
  const quests = { ...profile.quests };
  let changed = false;
  for (const qid of questIds) {
    if (quests[qid] !== "done") {
      quests[qid] = "done";
      changed = true;
    }
  }
  return changed ? touch({ ...profile, quests }, now) : profile;
}

/**
 * A step counts for a guide when it is one of that guide's step ids.
 * Without that set, fall back to `<slug>:` — only safe when the prefix is unique to the guide.
 * Do not use a shared prefix (`horde-20-40`, `h4060`) as the membership test.
 */
export function stepBelongsToGuide(stepId: string, slug: string, guideStepIds?: ReadonlySet<string>): boolean {
  if (guideStepIds) return guideStepIds.has(stepId);
  return stepId.startsWith(`${slug}:`);
}

export function countDoneForGuide(
  profile: Profile,
  slug: string,
  stepsForQuest: StepsForQuest,
  loadedSteps?: readonly Step[],
  quests?: QuestLookup,
  guideStepIds?: ReadonlySet<string>,
): number {
  const byId = new Map<string, Step>();
  if (loadedSteps) for (const s of loadedSteps) byId.set(s.id, s);

  const counted = new Set<string>();
  const consider = (id: string) => {
    if (!stepBelongsToGuide(id, slug, guideStepIds)) return;
    if (isStepDone(profile, id, stepsForQuest, byId.get(id), quests)) counted.add(id);
  };

  // Prefer the guide's own members (O(G)). The old profile.quests × stepsForQuest
  // scan was O(Q×S) and is unused once known steps / membership are available.
  if (guideStepIds && guideStepIds.size > 0) {
    for (const id of guideStepIds) consider(id);
    return counted.size;
  }
  if (loadedSteps?.length) {
    for (const s of loadedSteps) consider(s.id);
    return counted.size;
  }
  for (const id of Object.keys(profile.steps)) consider(id);
  return counted.size;
}
