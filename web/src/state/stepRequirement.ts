import type { Action, Profile, Step } from "../data/schema";
import { lookupQuest, questExclusion, type QuestLookup } from "./questAvailability.ts";
import { stepStatus, type ActiveRoute, type StepIndexes, type StepStatusResult, type StepsForQuest } from "./questProgress.ts";

export type Requirement =
  | { kind: "required" }
  | { kind: "done" }
  | {
      kind: "not_applicable";
      reason: { type: "breadcrumb_target" | "exclusive" | "race_class"; questId: number; byQuestId?: number };
    }
  | { kind: "blocked"; missing: number[] };

export const countsInProgress = (r: Requirement) => r.kind !== "not_applicable";
export const isActionable = (r: Requirement) => r.kind === "required";

function questActionId(action: Action): number | undefined {
  if (action.type === "accept" || action.type === "turnin" || action.type === "complete" || action.type === "collect") {
    return action.questId;
  }
  return undefined;
}

/** Tag for one excluded quest action. Breadcrumb only when the target was taken. */
export function actionUnavailableTag(
  profile: Profile,
  action: Action,
  quests: QuestLookup | undefined,
): "Breadcrumb" | "Unavailable" | undefined {
  const questId = questActionId(action);
  if (questId === undefined) return undefined;
  const info = lookupQuest(quests, questId);
  if (!info) return undefined;
  const reason = questExclusion(info, profile);
  if (!reason) return undefined;
  return reason.type === "breadcrumb_target" ? "Breadcrumb" : "Unavailable";
}

function stepReason(
  profile: Profile,
  step: Step,
  quests: QuestLookup | undefined,
): { type: "breadcrumb_target" | "exclusive" | "race_class"; questId: number; byQuestId?: number } {
  let fallback: { type: "breadcrumb_target" | "exclusive" | "race_class"; questId: number; byQuestId?: number } | undefined;
  for (const action of step.actions) {
    const questId = questActionId(action);
    if (questId === undefined) continue;
    const info = lookupQuest(quests, questId);
    if (!info) continue;
    const reason = questExclusion(info, profile);
    if (!reason) continue;
    if (reason.type === "breadcrumb_target") return reason;
    fallback ??= reason;
  }
  return fallback ?? { type: "exclusive", questId: 0 };
}

export function requirementFromStatus(
  status: StepStatusResult,
  profile: Profile,
  step: Step,
  quests?: QuestLookup,
): Requirement {
  if (status.status === "done") return { kind: "done" };
  if (status.status === "blocked") return { kind: "blocked", missing: status.missing ?? [] };
  if (status.status === "not_applicable") return { kind: "not_applicable", reason: stepReason(profile, step, quests) };
  return { kind: "required" };
}

export function stepRequirement(
  profile: Profile,
  step: Step,
  stepsForQuest: StepsForQuest,
  quests?: QuestLookup,
  route?: ActiveRoute,
  indexes?: StepIndexes,
): Requirement {
  const status = stepStatus(profile, step, stepsForQuest, quests, route, indexes);
  return requirementFromStatus(status, profile, step, quests);
}

export function unavailableTag(requirement: Requirement): "Breadcrumb" | "Unavailable" | undefined {
  if (requirement.kind !== "not_applicable") return undefined;
  return requirement.reason.type === "breadcrumb_target" ? "Breadcrumb" : "Unavailable";
}
