/**
 * Play-tested status per route pack (`pack.json` `status` / `playtested`, copied into the guide index and
 * each guide JSON by build-data). Missing status = experimental, so older data builds keep the amber pill.
 */
import type { ClassKey, GuideIndex, GuidePlaytest, GuideStatus, QuestDataStatus, Step } from "../data/schema";
import { lookupQuest, type QuestLookup } from "../state/questAvailability";

/**
 * One status for a page that mixes several packs (landing Horde card, dashboard, overview, gold plan):
 * play-tested only when every pack in it is. No index or no entries yet = experimental.
 */
export function routeStatus(index: GuideIndex | undefined): GuideStatus {
  const entries = index?.entries ?? [];
  return entries.length > 0 && entries.every((e) => e.status === "play-tested") ? "play-tested" : "experimental";
}

/**
 * Classes a step is limited to, from `classes` or the positive class terms of a `step << …` filter.
 * Undefined = every class. A filter group without a positive class term lets every class through.
 */
export function stepClasses(step: Step): ClassKey[] | undefined {
  if (step.classes?.length) return step.classes;
  const groups = step.filter?.any;
  if (!groups?.length) return undefined;
  const out = new Set<ClassKey>();
  for (const g of groups) {
    const pos = g.filter((t) => t.cls && !t.not);
    if (pos.length === 0) return undefined;
    for (const t of pos) out.add(t.cls!);
  }
  return [...out];
}

const QUEST_ACTIONS = new Set(["accept", "turnin", "complete", "collect"]);

/** `dataStatus` per quest on the step: on the action itself, else on the loaded quest data. */
function questStatuses(step: Step, quests: QuestLookup | undefined): QuestDataStatus[] {
  const out: QuestDataStatus[] = [];
  for (const a of step.actions) {
    if (!QUEST_ACTIONS.has(a.type)) continue;
    const act = a as { questId?: number; dataStatus?: QuestDataStatus };
    const s = act.dataStatus ?? (act.questId !== undefined ? (lookupQuest(quests, act.questId) as { dataStatus?: QuestDataStatus } | undefined)?.dataStatus : undefined);
    if (s) out.push(s);
  }
  return out;
}

/** Why a step in a play-tested guide is not covered by the run, or undefined when it is. */
export type UnconfirmedReason = "class" | "quest";

/**
 * A step in a play-tested guide is unconfirmed when it is a class step for a class other than the one the run
 * was played on and `verified` is not true, or when any quest on it has `dataStatus: "unconfirmed"`.
 * Outside play-tested guides this returns undefined (the green badge is what could overpromise).
 */
export function unconfirmedReason(step: Step, playtested: GuidePlaytest | undefined, quests?: QuestLookup): UnconfirmedReason | undefined {
  if (!playtested) return undefined;
  const classes = stepClasses(step);
  if (classes && !classes.includes(playtested.class) && step.verified !== true) return "class";
  if (questStatuses(step, quests).includes("unconfirmed")) return "quest";
  return undefined;
}

export function unconfirmedText(reason: UnconfirmedReason, playtested: GuidePlaytest): string {
  return reason === "class"
    ? `Class step: the play-test was on a ${playtested.class}, so this step has not been checked in game yet.`
    : "A quest on this step has not been seen in game yet. Its details come from WoW Forever data.";
}
