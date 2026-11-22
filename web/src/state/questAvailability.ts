import type { Profile, QuestInfo } from "../data/schema";
import { CLASS_MASK, RACE_MASK, maskExcludes } from "./raceClassMask.ts";

export type QuestAvailability =
  | "done"
  | "in_log"
  | "ready"
  | "available"
  | "locked"
  | "excluded"
  | "unknown";

export type QuestLookup = ReadonlyMap<number, QuestInfo> | Readonly<Record<number, QuestInfo>>;

export function lookupQuest(quests: QuestLookup | undefined, id: number): QuestInfo | undefined {
  if (!quests) return undefined;
  if (quests instanceof Map) return quests.get(id);
  return (quests as Readonly<Record<number, QuestInfo>>)[id];
}

/** True when any giver that starts the quest is an item (item-started quests). */
export function isItemStarted(info: QuestInfo): boolean {
  return info.start.some((g) => g.kind === "item");
}

export function hasQuestLogSnapshot(profile: Profile): boolean {
  return typeof profile.questLogSyncedAt === "string" && profile.questLogSyncedAt.length > 0;
}

const questLogIndexCache = new WeakMap<object, Map<number, NonNullable<Profile["questLog"]>[number]>>();

function logEntry(profile: Profile, questId: number): NonNullable<Profile["questLog"]>[number] | undefined {
  const log = profile.questLog;
  if (!log?.length) return undefined;
  let index = questLogIndexCache.get(log);
  if (!index) {
    index = new Map();
    for (const e of log) {
      if (!index.has(e.questId)) index.set(e.questId, e);
    }
    questLogIndexCache.set(log, index);
  }
  return index.get(questId);
}

/** Unmet prerequisite quest ids (group = all required; single = at least one when non-empty). */
export function unmetPrereqs(info: QuestInfo, profile: Profile): number[] {
  const missing: number[] = [];
  for (const id of info.pre.group) {
    if (profile.quests[id] !== "done") missing.push(id);
  }
  if (info.pre.single.length > 0 && !info.pre.single.some((id) => profile.quests[id] === "done")) {
    for (const id of info.pre.single) {
      if (profile.quests[id] !== "done" && !missing.includes(id)) missing.push(id);
    }
  }
  return missing;
}

/**
 * Done, or present in a known quest log (in_log / ready).
 * Without a snapshot, log entries are not evidence the quest was taken.
 */
function targetTaken(profile: Profile, questId: number): boolean {
  if (profile.quests[questId] === "done") return true;
  if (!hasQuestLogSnapshot(profile)) return false;
  return logEntry(profile, questId) !== undefined;
}

export type QuestExclusion =
  | { type: "breadcrumb_target"; questId: number; byQuestId: number }
  | { type: "exclusive"; questId: number; byQuestId: number }
  | { type: "race_class"; questId: number };

/** Race/class masks apply only while the character has not taken the quest. Mask 0 is unrestricted. */
export function raceClassExcludes(info: QuestInfo, profile: Profile): boolean {
  if (profile.quests[info.id] === "done") return false;
  if (hasQuestLogSnapshot(profile) && logEntry(profile, info.id)) return false;
  return maskExcludes(info.races, RACE_MASK[profile.race]) || maskExcludes(info.classes, CLASS_MASK[profile.cls]);
}

/**
 * Why this quest can no longer be taken, if it is excluded.
 * Breadcrumb target wins over an exclusive sibling, which wins over a race/class mask.
 */
export function questExclusion(info: QuestInfo, profile: Profile): QuestExclusion | undefined {
  if (info.breadcrumbFor !== undefined && targetTaken(profile, info.breadcrumbFor)) {
    return { type: "breadcrumb_target", questId: info.id, byQuestId: info.breadcrumbFor };
  }
  const sibling = info.exclusiveTo.find((id) => targetTaken(profile, id));
  if (sibling !== undefined) return { type: "exclusive", questId: info.id, byQuestId: sibling };
  if (raceClassExcludes(info, profile)) return { type: "race_class", questId: info.id };
  return undefined;
}

export function isQuestExcluded(info: QuestInfo, profile: Profile): boolean {
  return questExclusion(info, profile) !== undefined;
}

/**
 * One availability state per quest id.
 *
 * - `done` / log states come from the profile.
 * - `excluded` when an exclusiveTo sibling or breadcrumbFor target is done, or (only with a quest-log snapshot) in_log / ready.
 * - `locked` only when prerequisites fail (never merely because the quest is absent from the log).
 * - Without a quest-log snapshot, absence from the log is not meaningful for locking.
 */
export function questAvailability(
  questId: number,
  profile: Profile,
  quests: QuestLookup | undefined,
): QuestAvailability {
  // Done and log state do not require QuestInfo.
  if (profile.quests[questId] === "done") return "done";

  const entry = logEntry(profile, questId);
  if (entry) {
    // complete === 1 → ready; complete === -1 (failed) and 0 → still in_log, not ready.
    return entry.complete === 1 ? "ready" : "in_log";
  }

  const info = lookupQuest(quests, questId);
  if (!info) return "unknown";
  if (isQuestExcluded(info, profile)) return "excluded";
  if (unmetPrereqs(info, profile).length > 0) return "locked";
  return "available";
}
