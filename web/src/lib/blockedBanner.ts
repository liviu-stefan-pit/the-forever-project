/**
 * Pure helpers for the blocked-step banner (Workstream B).
 * Copy: "Blocked: pick up/finish X first (NPC, zone)".
 */
import type { Step } from "../data/schema";
import { lookupQuest, type QuestLookup } from "../state/questAvailability";
import { closestPriorAcceptStepId, type ActiveRoute, type StepsForQuest } from "../state/questProgress";

export interface BlockedQuestEntry {
  questId: number;
  /** "pick up/finish Name first (Npc, Zone)" */
  detail: string;
  /** Guide step that accepts this quest, when known. */
  acceptStepId?: string;
  /** True when no accept step is resolvable in the loaded catalog. */
  notInGuide: boolean;
}

export interface BlockedBannerModel {
  /** Full banner sentence(s). */
  text: string;
  entries: BlockedQuestEntry[];
}

export interface AcceptStepQuery {
  preferSlug?: string;
  /** When set with `route`, link the closest accept strictly before this step on that route. */
  beforeStepId?: string;
  route?: ActiveRoute;
}

/** Accept step for `questId`. With a viewed route, the closest accept before `beforeStepId`. */
export function findAcceptStepId(
  questId: number,
  stepsForQuest: StepsForQuest,
  resolveStep: (id: string) => Step | undefined,
  preferSlug?: string,
  query?: AcceptStepQuery,
): string | undefined {
  if (query?.beforeStepId && query.route) {
    return closestPriorAcceptStepId(questId, query.beforeStepId, query.route);
  }
  const candidates = stepsForQuest(questId);
  const accepts = candidates.filter((id) => {
    const step = resolveStep(id);
    return !!step?.actions.some((a) => a.type === "accept" && a.questId === questId);
  });
  if (preferSlug) {
    const prefix = `${preferSlug}:`;
    const local = accepts.find((id) => id.startsWith(prefix));
    if (local) return local;
  }
  return accepts[0];
}

function placeFromAcceptStep(step: Step | undefined): { npc?: string; zone?: string } {
  if (!step) return {};
  let npc: string | undefined;
  let zone: string | undefined;
  for (const a of step.actions) {
    if (a.type === "goto" && !zone) {
      const z = a.at.zone?.trim();
      if (z) zone = z;
    }
    if ((a.type === "mob" || a.type === "target" || a.type === "unitscan") && !npc) {
      const name = a.name?.trim();
      if (name) npc = name;
    }
  }
  for (const pin of step.pins ?? []) {
    if (pin.kind === "npc" && !npc && pin.name.trim()) npc = pin.name.trim();
    if ((pin.kind === "npc" || pin.kind === "object") && !zone && pin.at.zone.trim()) zone = pin.at.zone.trim();
  }
  return { npc, zone };
}

function questDetail(questId: number, quests: QuestLookup | undefined, acceptStep?: Step): string {
  const info = lookupQuest(quests, questId);
  const name = info?.name?.trim() || `Quest ${questId}`;
  const fromStep = placeFromAcceptStep(acceptStep);
  const npc = fromStep.npc || info?.start[0]?.name?.trim();
  const zone = fromStep.zone || (info?.zone ?? info?.start[0]?.at[0]?.zone)?.trim();
  const where = npc && zone ? ` (${npc}, ${zone})` : npc ? ` (${npc})` : zone ? ` (${zone})` : "";
  return `pick up/finish ${name} first${where}`;
}

export function blockedQuestEntry(
  questId: number,
  quests: QuestLookup | undefined,
  stepsForQuest: StepsForQuest,
  resolveStep: (id: string) => Step | undefined,
  preferSlug?: string,
  query?: AcceptStepQuery,
): BlockedQuestEntry {
  const acceptStepId = findAcceptStepId(questId, stepsForQuest, resolveStep, preferSlug, query);
  const anywhere = findAcceptStepId(questId, stepsForQuest, resolveStep, preferSlug);
  return {
    questId,
    detail: questDetail(questId, quests, acceptStepId ? resolveStep(acceptStepId) : undefined),
    acceptStepId,
    notInGuide: !acceptStepId && !anywhere,
  };
}

/** Build banner model for `stepStatus(...).missing`. */
export function buildBlockedBanner(
  missing: readonly number[],
  quests: QuestLookup | undefined,
  stepsForQuest: StepsForQuest,
  resolveStep: (id: string) => Step | undefined,
  preferSlug?: string,
  query?: AcceptStepQuery,
): BlockedBannerModel {
  const entries = missing.map((id) => blockedQuestEntry(id, quests, stepsForQuest, resolveStep, preferSlug, query));
  const parts = entries.map((e) => {
    if (e.notInGuide) return `${e.detail} — not in this guide`;
    return e.detail;
  });
  const text =
    parts.length === 0 ? "Blocked" : parts.length === 1 ? `Blocked: ${parts[0]}` : `Blocked: ${parts.join("; ")}`;
  return { text, entries };
}
