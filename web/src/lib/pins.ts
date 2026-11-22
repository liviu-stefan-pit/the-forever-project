/**
 * Map pins derived from quest data (route schema v2): quest givers (start), turn-ins (end) and
 * objective locations (mobs, objects, items), so authors never hand-place quest NPC pins.
 */
import type { Giver, MapPoint, Profile, QuestInfo, Step } from "../data/schema";
import { questAvailability, type QuestLookup } from "../state/questAvailability";

export type DerivedPinKind = "start" | "end" | "mob" | "object" | "item";

export interface DerivedPin {
  kind: DerivedPinKind;
  questId: number;
  /** NPC / object / item id when known. */
  id?: number;
  name: string;
  mapId: number;
  zone: string;
  x: number;
  y: number;
  exact: boolean;
}

function usable(p: MapPoint): boolean {
  return !(p.x === 0 && p.y === 0) && p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
}

function giverPins(kind: "start" | "end", questId: number, givers: readonly Giver[]): DerivedPin[] {
  return givers.flatMap((g) =>
    (g.at ?? []).filter(usable).map((p) => ({ kind, questId, id: g.id, name: g.name, mapId: p.mapId, zone: p.zone, x: p.x, y: p.y, exact: p.exact })),
  );
}

const OBJECTIVE_KIND: Record<QuestInfo["objectives"][number]["kind"], DerivedPinKind | null> = {
  kill: "mob",
  killcredit: "mob",
  object: "object",
  item: "item",
  rep: null,
  spell: null,
  trigger: null,
  extra: null,
};

/** Every pin for one quest: start + end givers and objective locations. */
export function questPins(q: QuestInfo): DerivedPin[] {
  const out = [...giverPins("start", q.id, q.start ?? []), ...giverPins("end", q.id, q.end ?? [])];
  for (const o of q.objectives ?? []) {
    const kind = OBJECTIVE_KIND[o.kind];
    if (!kind || !o.at) continue;
    for (const p of o.at.filter(usable)) {
      out.push({ kind, questId: q.id, id: o.id, name: o.name, mapId: p.mapId, zone: p.zone, x: p.x, y: p.y, exact: p.exact });
    }
  }
  return out;
}

export interface StepPinFilter {
  /** When set (open / blocked steps), omit pins for locked / excluded / missing quests. */
  profile: Profile;
  /** Quest ids from `stepStatus(...).missing`. */
  missing?: readonly number[];
  /** Full catalog for `questAvailability` (Record or Map). Defaults to `quests`. */
  catalog?: QuestLookup;
}

function actionQuestBlocked(questId: number, filter: StepPinFilter | undefined, quests: QuestLookup): boolean {
  if (!filter) return false;
  if (filter.missing?.includes(questId)) return true;
  const avail = questAvailability(questId, filter.profile, filter.catalog ?? quests);
  return avail === "locked" || avail === "excluded";
}

/**
 * Pins for one step on one map: accept → start givers, turn-in → end givers,
 * complete/collect → objective locations. Duplicates (same kind/id/cell) are dropped.
 * Pass `filter` for open/blocked steps so locked / excluded / missing quests get no pins;
 * omit it for done steps (keep current pin behavior).
 */
export function stepPins(
  step: Step,
  quests: Readonly<Record<number, QuestInfo>>,
  mapId: number,
  filter?: StepPinFilter,
): DerivedPin[] {
  const out: DerivedPin[] = [];
  const seen = new Set<string>();
  const add = (pins: DerivedPin[]) => {
    for (const p of pins) {
      if (p.mapId !== mapId) continue;
      const key = `${p.kind}:${p.id ?? p.name}:${p.x.toFixed(1)}:${p.y.toFixed(1)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
  };
  for (const a of step.actions) {
    if (a.type !== "accept" && a.type !== "turnin" && a.type !== "complete" && a.type !== "collect") continue;
    const qid = a.questId;
    if (qid === undefined) continue;
    if (actionQuestBlocked(qid, filter, quests)) continue;
    const q = quests[qid];
    if (!q) continue;
    const all = questPins(q);
    if (a.type === "accept") add(all.filter((p) => p.kind === "start"));
    else if (a.type === "turnin") add(all.filter((p) => p.kind === "end"));
    else {
      const objIdx = "objective" in a ? a.objective : undefined;
      const objectives = q.objectives ?? [];
      const objs = objIdx !== undefined && objectives[objIdx - 1] ? [objectives[objIdx - 1]!] : objectives;
      const names = new Set(objs.map((o) => o.name));
      add(all.filter((p) => p.kind !== "start" && p.kind !== "end" && names.has(p.name)));
    }
  }
  return out;
}
