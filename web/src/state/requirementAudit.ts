/**
 * All-guides requirement audit. Pure: no printing, no profile writes.
 *
 * A quest-backed step is a violation when every accept/turn-in/complete/collect on it is
 * excluded (breadcrumb target taken, exclusive sibling taken, or race/class mask) but the
 * step is still required / open / blocked. An open quest-backed step whose prerequisites
 * are unmet is also a violation. Mixed steps (another quest action still available) are not.
 */
import type { ClassKey, Guide, Profile, QuestInfo, RaceKey, RouteStyle, Step } from "../data/schema.ts";
import {
  hasQuestLogSnapshot,
  lookupQuest,
  questExclusion,
  unmetPrereqs,
  type QuestLookup,
} from "./questAvailability.ts";
import { isQuestBackedStep, stepStatus, type StepsForQuest } from "./questProgress.ts";
import { isActionable, stepRequirement } from "./stepRequirement.ts";
import { CLASS_MASK, RACE_MASK, maskExcludes } from "./raceClassMask.ts";

const RACES = ["Orc", "Undead", "Tauren", "Troll"] as const satisfies readonly RaceKey[];
const CLASSES = ["Warrior", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Paladin"] as const satisfies readonly ClassKey[];
const BASE_RACE: RaceKey = "Undead";
const BASE_CLASS: ClassKey = "Warrior";
const SYNC = "2026-11-21T00:00:00.000Z";

export interface AuditViolation {
  guide: string;
  route: string;
  stepId: string;
  scenario: string;
  rule: "excluded-but-required" | "open-with-unmet-prereqs";
  detail: string;
}

export interface GotoCandidate {
  guide: string;
  route: string;
  stepId: string;
  nextStepId: string;
  breadcrumbQuestId: number;
  targetQuestId: number;
  /** True when the step itself has a goto action. */
  goto: boolean;
}

export interface AuditResult {
  violations: AuditViolation[];
  gotoCandidates: GotoCandidate[];
}

function questActionIds(step: Step): number[] {
  const ids: number[] = [];
  for (const action of step.actions) {
    if (action.type === "accept" || action.type === "turnin" || action.type === "complete" || action.type === "collect") {
      if (typeof action.questId === "number" && !ids.includes(action.questId)) ids.push(action.questId);
    }
  }
  return ids;
}

function stepRoutes(step: Step): RouteStyle[] {
  if (step.routes && step.routes.length) return step.routes;
  return step.bonus ? ["balanced"] : ["balanced", "speedrun"];
}

function guideRoutes(steps: readonly Step[]): { routes: RouteStyle[]; split: boolean } {
  let split = false;
  const all = new Set<RouteStyle>();
  for (const step of steps) {
    if (step.routes && step.routes.length) split = true;
    for (const route of stepRoutes(step)) all.add(route);
  }
  if (!split) return { routes: ["balanced"], split: false };
  return { routes: [...all], split: true };
}

function stepsForQuestFactory(steps: readonly Step[]): StepsForQuest {
  const map = new Map<number, string[]>();
  for (const step of steps) {
    for (const id of questActionIds(step)) {
      const list = map.get(id);
      if (list) list.push(step.id);
      else map.set(id, [step.id]);
    }
  }
  return (questId) => map.get(questId) ?? [];
}

function blank(race: RaceKey, cls: ClassKey, route: RouteStyle): Profile {
  return {
    id: "audit",
    name: "audit",
    race,
    cls,
    routeStyle: route,
    options: { showOptional: true, hideDone: false, dungeons: false },
    steps: {},
    quests: {},
    addedQuests: [],
    createdAt: 1,
    updatedAt: 1,
    schema: 1,
  };
}

function withLog(base: Profile, questIds: readonly number[]): Profile {
  return {
    ...base,
    questLogSyncedAt: SYNC,
    questLog: questIds.map((questId) => ({ questId, complete: 0 })),
  };
}

function withDone(base: Profile, questIds: readonly number[]): Profile {
  const quests: Profile["quests"] = { ...base.quests };
  for (const id of questIds) quests[id] = "done";
  return { ...base, quests };
}

function inLog(profile: Profile, questId: number): boolean {
  return hasQuestLogSnapshot(profile) && (profile.questLog?.some((entry) => entry.questId === questId) ?? false);
}

function maskFails(info: QuestInfo, race: RaceKey, cls: ClassKey): boolean {
  if (!info.races && !info.classes) return false;
  return maskExcludes(info.races, RACE_MASK[race]) || maskExcludes(info.classes, CLASS_MASK[cls]);
}

function excluded(profile: Profile, questId: number, quests: QuestLookup): boolean {
  const info = lookupQuest(quests, questId);
  return !!info && questExclusion(info, profile) !== undefined;
}

function shownRequired(profile: Profile, step: Step, stepsForQuest: StepsForQuest, quests: QuestLookup): boolean {
  const requirement = stepRequirement(profile, step, stepsForQuest, quests);
  return requirement.kind === "required" || isActionable(requirement);
}

interface BreadcrumbPair {
  breadcrumbId: number;
  targetId: number;
}

function breadcrumbsIn(steps: readonly Step[], quests: QuestLookup): BreadcrumbPair[] {
  const seen = new Set<string>();
  const pairs: BreadcrumbPair[] = [];
  for (const step of steps) {
    for (const id of questActionIds(step)) {
      const info = lookupQuest(quests, id);
      if (info?.breadcrumbFor === undefined) continue;
      const key = `${info.id}:${info.breadcrumbFor}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ breadcrumbId: info.id, targetId: info.breadcrumbFor });
    }
  }
  return pairs;
}

function exclusivesIn(steps: readonly Step[], quests: QuestLookup): { questId: number; siblingId: number }[] {
  const seen = new Set<string>();
  const pairs: { questId: number; siblingId: number }[] = [];
  for (const step of steps) {
    for (const id of questActionIds(step)) {
      const info = lookupQuest(quests, id);
      if (!info) continue;
      for (const siblingId of info.exclusiveTo) {
        const key = `${info.id}:${siblingId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ questId: info.id, siblingId });
      }
    }
  }
  return pairs;
}

function extraMaskProfiles(steps: readonly Step[], quests: QuestLookup): { race: RaceKey; cls: ClassKey }[] {
  const found = new Map<string, { race: RaceKey; cls: ClassKey }>();
  for (const step of steps) {
    for (const id of questActionIds(step)) {
      const info = lookupQuest(quests, id);
      if (!info || (!info.races && !info.classes)) continue;
      if (maskFails(info, BASE_RACE, BASE_CLASS)) continue;
      if ([...found.values()].some((pair) => maskFails(info, pair.race, pair.cls))) continue;
      for (const race of RACES) {
        let added = false;
        for (const cls of CLASSES) {
          if (race === BASE_RACE && cls === BASE_CLASS) continue;
          if (!maskFails(info, race, cls)) continue;
          const key = `${race}/${cls}`;
          if (!found.has(key)) found.set(key, { race, cls });
          added = true;
          break;
        }
        if (added) break;
      }
    }
  }
  return [...found.values()];
}

function stepHasQuest(step: Step, questId: number): boolean {
  return questActionIds(step).includes(questId);
}

function hasGoto(step: Step): boolean {
  return step.actions.some((action) => action.type === "goto");
}

/**
 * Audit every guide. `live` is applied as-is (route filtering is separate from profile.routeStyle).
 * Synthetic profiles are built in memory and never written.
 */
export function auditRequirements(guides: readonly Guide[], quests: QuestLookup, live: Profile): AuditResult {
  const violations: AuditViolation[] = [];
  const gotoCandidates: GotoCandidate[] = [];
  const seenGoto = new Set<string>();

  const push = (violation: AuditViolation) => {
    violations.push(violation);
  };

  for (const guide of guides) {
    const { routes, split } = guideRoutes(guide.steps);
    const stepsForQuest = stepsForQuestFactory(guide.steps);
    for (const route of routes) {
      const steps = split ? guide.steps.filter((step) => stepRoutes(step).includes(route)) : guide.steps;
      const base = blank(BASE_RACE, BASE_CLASS, route);

      const inspect = (profile: Profile, scenario: string, onlyQuestId?: number) => {
        for (const step of steps) {
          if (onlyQuestId !== undefined && !stepHasQuest(step, onlyQuestId)) continue;
          const ids = questActionIds(step);
          if (ids.length === 0) continue;
          const status = stepStatus(profile, step, stepsForQuest, quests);
          const allExcluded = ids.every((id) => excluded(profile, id, quests));
          if (allExcluded && (status.status === "open" || status.status === "blocked" || shownRequired(profile, step, stepsForQuest, quests))) {
            push({
              guide: guide.slug,
              route,
              stepId: step.id,
              scenario,
              rule: "excluded-but-required",
              detail: `${profile.race}/${profile.cls} status ${status.status} quests ${ids.join(",")}`,
            });
          }
          if (status.status !== "open") continue;
          const unmet = ids.some((id) => {
            if (excluded(profile, id, quests)) return false;
            if (profile.quests[id] === "done" || inLog(profile, id)) return false;
            const info = lookupQuest(quests, id);
            return !!info && unmetPrereqs(info, profile).length > 0;
          });
          if (unmet) {
            push({
              guide: guide.slug,
              route,
              stepId: step.id,
              scenario,
              rule: "open-with-unmet-prereqs",
              detail: `${profile.race}/${profile.cls} quests ${ids.join(",")}`,
            });
          }
        }
      };

      inspect(live, "live");
      inspect(base, "nothing");
      for (const pair of extraMaskProfiles(steps, quests)) {
        inspect(blank(pair.race, pair.cls, route), `mask:${pair.race}/${pair.cls}`);
      }

      for (const { breadcrumbId, targetId } of breadcrumbsIn(steps, quests)) {
        inspect(withLog(base, [breadcrumbId]), `breadcrumb-in-log:${breadcrumbId}`, breadcrumbId);
        inspect(withLog(base, [targetId]), `target-in-log:${targetId}`, breadcrumbId);
        const targetDone = withDone(base, [targetId]);
        inspect(targetDone, `target-done:${targetId}`, breadcrumbId);

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]!;
          if (isQuestBackedStep(step)) continue;
          let next: Step | undefined;
          for (let j = i + 1; j < steps.length; j++) {
            if (isQuestBackedStep(steps[j]!)) {
              next = steps[j];
              break;
            }
          }
          if (!next || !stepHasQuest(next, breadcrumbId)) continue;
          const nextStatus = stepStatus(targetDone, next, stepsForQuest, quests);
          if (nextStatus.status !== "not_applicable") continue;
          const key = `${guide.slug}|${route}|${step.id}|${breadcrumbId}`;
          if (seenGoto.has(key)) continue;
          seenGoto.add(key);
          gotoCandidates.push({
            guide: guide.slug,
            route,
            stepId: step.id,
            nextStepId: next.id,
            breadcrumbQuestId: breadcrumbId,
            targetQuestId: targetId,
            goto: hasGoto(step),
          });
        }
      }

      for (const { questId, siblingId } of exclusivesIn(steps, quests)) {
        inspect(withDone(base, [siblingId]), `exclusive-done:${siblingId}`, questId);
        inspect(withLog(base, [siblingId]), `exclusive-in-log:${siblingId}`, questId);
      }
    }
  }

  return { violations, gotoCandidates };
}
