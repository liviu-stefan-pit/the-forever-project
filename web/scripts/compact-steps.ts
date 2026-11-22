/**
 * Build-time compaction: merge consecutive same-hub accepts / turn-ins, chain
 * hand-offs, and overlapping complete/collect sweeps. Conservative: extra notes,
 * mixed visit kinds, disjoint routes, and unrelated turn-in-then-accept stay split.
 */
import type { Action, QuestInfo, RouteStyle, Step } from "../../contracts/schema.ts";

export const HUB_YARDS = 1.5;
export const SWEEP_YARDS = 8;

export type CompactQuest = Pick<QuestInfo, "id" | "next" | "name" | "objectives">;
export type MergeKind = "accept" | "turnin" | "chain" | "complete";
export type VisitKind = "accept" | "turnin" | "complete";

export interface CompactResult {
  steps: Step[];
  /** Number of steps absorbed into a surviving card (not counting survivors). */
  absorbed: number;
}

interface Hub {
  mapId: number;
  zone: string;
  x: number;
  y: number;
}

const QUEST_TYPES = new Set(["accept", "turnin", "complete", "collect"]);
const HOW_TO_LINE = /^(Kill|Collect|Use|Cast|Gain reputation with)\b/i;

export function routesOf(step: Step): RouteStyle[] {
  if (step.routes && step.routes.length) return step.routes.filter((r): r is RouteStyle => r === "balanced" || r === "speedrun");
  return step.bonus ? ["balanced"] : ["balanced", "speedrun"];
}

export function intersectRoutes(a: readonly RouteStyle[], b: readonly RouteStyle[]): RouteStyle[] {
  return a.filter((r) => b.includes(r));
}

export function hubOf(step: Step): Hub | null {
  for (const a of step.actions) {
    if (a.type !== "goto") continue;
    if (a.at && Number.isFinite(a.at.x) && Number.isFinite(a.at.y)) {
      return { mapId: a.at.mapId, zone: a.at.zone ?? "", x: a.at.x, y: a.at.y };
    }
    if (a.raw && a.raw.zone && Number.isFinite(a.raw.a) && Number.isFinite(a.raw.b)) {
      return { mapId: 0, zone: a.raw.zone, x: a.raw.a, y: a.raw.b };
    }
  }
  return null;
}

function sameMap(a: Hub, b: Hub): boolean {
  if (a.zone && b.zone) return a.zone === b.zone;
  return a.mapId !== 0 && a.mapId === b.mapId;
}

/** Zone-percent distance, or null when the points are not on the same zone map. */
export function zoneDistance(a: Hub, b: Hub): number | null {
  if (!sameMap(a, b)) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function linesOf(step: Step): string[] {
  return step.text
    .map((line) => line.segments.map((s) => s.t).join("").trim())
    .filter(Boolean);
}

type QuestAction = Extract<Action, { type: "accept" | "turnin" | "complete" | "collect" }> & { questId: number };

function questActions(step: Step): QuestAction[] {
  return step.actions.filter((a): a is QuestAction => QUEST_TYPES.has(a.type) && "questId" in a && typeof a.questId === "number");
}

function otherActions(step: Step): Action[] {
  return step.actions.filter((a) => a.type !== "goto" && !QUEST_TYPES.has(a.type));
}

export function visitKind(step: Step): VisitKind | null {
  const quests = questActions(step);
  if (!quests.length || otherActions(step).length) return null;
  if (quests.every((a) => a.type === "accept")) return "accept";
  if (quests.every((a) => a.type === "turnin")) return "turnin";
  if (quests.every((a) => a.type === "complete" || a.type === "collect")) return "complete";
  return null;
}

function questLabels(step: Step): string[] {
  const out: string[] = [];
  for (const a of questActions(step)) {
    if ("label" in a && typeof a.label === "string" && a.label.trim()) out.push(a.label.trim());
  }
  return out;
}

function stripNames(part: string, labels: readonly string[]): string {
  let rest = part;
  for (const label of [...labels].filter(Boolean).sort((a, b) => b.length - a.length)) {
    rest = rest.split(label).join(" ");
  }
  return rest.replace(/[^a-z0-9]+/gi, "");
}

function matchesGenericTemplate(text: string, kind: VisitKind, labels: readonly string[]): boolean {
  const trimmed = text.trim();
  if (kind === "accept") {
    const m = /^accept\s+(.+?)\s+from\s+([^,]+?)\s*[.!]?\s*$/i.exec(trimmed);
    return !!m && stripNames(m[1]!, labels).length === 0;
  }
  if (kind === "turnin") {
    const m = /^turn\s*in\s+(.+?)\s+to\s+([^,]+?)\s*[.!]?\s*$/i.exec(trimmed);
    return !!m && stripNames(m[1]!, labels).length === 0;
  }
  const m = /^(?:complete|collect|finish|do)\s+(.+?)\s*[.!]?\s*$/i.exec(trimmed);
  return !!m && stripNames(m[1]!, labels).length === 0;
}

/**
 * True when step text is only a generic Accept/Complete/Turn-in (or Collect) template.
 * How-to lines from enrich-complete (Kill/Collect/Use/…) are allowed on complete/collect cards.
 * A comma after the NPC (extra notes) fails the template, so hand-written lines stay intact.
 */
export function isGenericVisit(step: Step): boolean {
  const kind = visitKind(step);
  if (!kind) return false;
  const labels = questLabels(step);
  if (!labels.length) return false;
  const lines = linesOf(step);
  if (!lines.length) return false;
  const main: string[] = [];
  const howto: string[] = [];
  for (const line of lines) {
    if (HOW_TO_LINE.test(line)) howto.push(line);
    else main.push(line);
  }
  if (main.length !== 1) return false;
  if (howto.length && kind !== "complete") return false;
  return matchesGenericTemplate(main[0]!, kind, labels);
}

function zoneKey(step: Step): string | null {
  const hub = hubOf(step);
  if (hub?.zone) return `z:${hub.zone}`;
  if (hub && hub.mapId) return `m:${hub.mapId}`;
  for (const p of step.pins ?? []) {
    if (p.kind === "mobArea" && p.zone) return `z:${p.zone}`;
    if (p.kind !== "mobArea" && p.at.zone) return `z:${p.at.zone}`;
  }
  return null;
}

function tagsEqual(a: Step, b: Step): boolean {
  return JSON.stringify(a.tags ?? {}) === JSON.stringify(b.tags ?? {});
}

function mergeCompatible(a: Step, b: Step): boolean {
  if (!tagsEqual(a, b)) return false;
  if (JSON.stringify(a.filter ?? null) !== JSON.stringify(b.filter ?? null)) return false;
  if (JSON.stringify(a.classes ?? null) !== JSON.stringify(b.classes ?? null)) return false;
  if (JSON.stringify(a.roles ?? null) !== JSON.stringify(b.roles ?? null)) return false;
  if (!!a.dungeon !== !!b.dungeon) return false;
  if (!!a.dungeonsOff !== !!b.dungeonsOff) return false;
  if (JSON.stringify(a.dungeonsOffRoutes ?? null) !== JSON.stringify(b.dungeonsOffRoutes ?? null)) return false;
  if (!!a.bonus !== !!b.bonus) return false;
  if (JSON.stringify(a.conditions ?? []) !== JSON.stringify(b.conditions ?? [])) return false;
  return true;
}

function hubClose(a: Step, b: Step, max: number): boolean {
  const ha = hubOf(a);
  const hb = hubOf(b);
  if (!ha || !hb) return false;
  const d = zoneDistance(ha, hb);
  return d !== null && d <= max;
}

function sweepPoints(step: Step, catalog: ReadonlyMap<number, CompactQuest>): Hub[] {
  const goto = hubOf(step);
  if (goto) return [goto];
  const pts: Hub[] = [];
  for (const a of questActions(step)) {
    if ((a.type !== "complete" && a.type !== "collect") || typeof a.questId !== "number") continue;
    const quest = catalog.get(a.questId);
    for (const obj of quest?.objectives ?? []) {
      for (const at of obj.at ?? []) {
        if (!Number.isFinite(at.x) || !Number.isFinite(at.y)) continue;
        pts.push({ mapId: at.mapId, zone: at.zone ?? "", x: at.x, y: at.y });
      }
    }
  }
  return pts;
}

function sweepOverlap(a: Step, b: Step, catalog: ReadonlyMap<number, CompactQuest>, max: number): boolean {
  const pa = sweepPoints(a, catalog);
  const pb = sweepPoints(b, catalog);
  if (!pa.length || !pb.length) return false;
  for (const x of pa) {
    for (const y of pb) {
      const d = zoneDistance(x, y);
      if (d !== null && d <= max) return true;
    }
  }
  return false;
}

function turninIds(step: Step): number[] {
  const ids: number[] = [];
  for (const a of questActions(step)) {
    if (a.type === "turnin" && !ids.includes(a.questId)) ids.push(a.questId);
  }
  return ids;
}

function acceptIds(step: Step): number[] {
  const ids: number[] = [];
  for (const a of questActions(step)) {
    if (a.type === "accept" && !ids.includes(a.questId)) ids.push(a.questId);
  }
  return ids;
}

function isChainHandoff(turnins: readonly Step[], accept: Step, catalog: ReadonlyMap<number, CompactQuest>): boolean {
  const turned = turnins.flatMap(turninIds);
  const accepted = acceptIds(accept);
  if (!turned.length || !accepted.length) return false;
  return accepted.some((aq) => turned.some((tq) => catalog.get(tq)?.next === aq));
}

/**
 * Why two consecutive steps may merge, or null. Does not look past the pair:
 * callers grow a run by testing the new neighbour against the first and last of the run.
 */
function isQuestList(catalog: ReadonlyMap<number, CompactQuest> | readonly CompactQuest[]): catalog is readonly CompactQuest[] {
  return Array.isArray(catalog);
}

export function mergeKind(a: Step, b: Step, catalog: ReadonlyMap<number, CompactQuest> | readonly CompactQuest[]): MergeKind | null {
  const map: ReadonlyMap<number, CompactQuest> = isQuestList(catalog)
    ? new Map(catalog.map((q) => [q.id, q]))
    : catalog;
  if (!isGenericVisit(a) || !isGenericVisit(b)) return null;
  if (!mergeCompatible(a, b)) return null;
  if (intersectRoutes(routesOf(a), routesOf(b)).length === 0) return null;
  const za = zoneKey(a);
  const zb = zoneKey(b);
  if (!za || !zb || za !== zb) return null;

  const ka = visitKind(a);
  const kb = visitKind(b);
  if (!ka || !kb) return null;

  if (ka === "accept" && kb === "accept") {
    return hubClose(a, b, HUB_YARDS) ? "accept" : null;
  }
  if (ka === "turnin" && kb === "turnin") {
    return hubClose(a, b, HUB_YARDS) ? "turnin" : null;
  }
  if (ka === "complete" && kb === "complete") {
    return sweepOverlap(a, b, map, SWEEP_YARDS) ? "complete" : null;
  }
  if (ka === "turnin" && kb === "accept") {
    if (!hubClose(a, b, HUB_YARDS)) return null;
    return isChainHandoff([a], b, map) ? "chain" : null;
  }
  return null;
}

function canAppend(run: readonly Step[], next: Step, catalog: ReadonlyMap<number, CompactQuest>, routesSoFar: readonly RouteStyle[]): MergeKind | null {
  if (intersectRoutes(routesSoFar, routesOf(next)).length === 0) return null;
  const first = run[0]!;
  const last = run[run.length - 1]!;
  const vsFirst = mergeKind(first, next, catalog);
  const vsLast = mergeKind(last, next, catalog);
  if (!vsLast) return null;

  const firstKind = visitKind(first);
  const lastKind = visitKind(last);
  const nextKind = visitKind(next);

  if (nextKind === "accept" && lastKind === "accept" && firstKind === "accept") {
    return vsFirst === "accept" && vsLast === "accept" ? "accept" : null;
  }
  if (nextKind === "turnin" && lastKind === "turnin" && firstKind === "turnin") {
    return vsFirst === "turnin" && vsLast === "turnin" ? "turnin" : null;
  }
  if (nextKind === "complete" && lastKind === "complete" && firstKind === "complete") {
    return vsFirst === "complete" && vsLast === "complete" ? "complete" : null;
  }
  if (nextKind === "accept" && lastKind === "turnin" && firstKind === "turnin" && run.every((s) => visitKind(s) === "turnin")) {
    if (!hubClose(first, next, HUB_YARDS) || !hubClose(last, next, HUB_YARDS)) return null;
    return isChainHandoff(run, next, catalog) ? "chain" : null;
  }
  return null;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function npcFromText(text: string, prep: "from" | "to"): string | undefined {
  const m = new RegExp(`\\b${prep}\\s+(.+?)\\s*[.!?]?\\s*$`, "i").exec(text.trim());
  const name = m?.[1]?.replace(/\s+/g, " ").trim();
  return name || undefined;
}

function mainLine(step: Step): string {
  return linesOf(step).find((l) => !HOW_TO_LINE.test(l)) ?? "";
}

function howToLines(step: Step): string[] {
  return linesOf(step).filter((l) => HOW_TO_LINE.test(l));
}

function listNames(names: readonly string[]): string {
  return names.join(", ");
}

function acceptLabel(step: Step): { name: string; npc?: string }[] {
  const npc = npcFromText(mainLine(step), "from");
  return questActions(step)
    .filter((a): a is QuestAction & { type: "accept" } => a.type === "accept")
    .map((a) => ({ name: a.label, npc }));
}

function turninLabel(step: Step): { name: string; npc?: string }[] {
  const npc = npcFromText(mainLine(step), "to");
  return questActions(step)
    .filter((a): a is QuestAction & { type: "turnin" } => a.type === "turnin")
    .map((a) => ({ name: a.label, npc }));
}

function completeNames(step: Step): string[] {
  return questActions(step)
    .filter((a) => a.type === "complete" || a.type === "collect")
    .map((a) => a.label);
}

function formatAccepts(parts: { name: string; npc?: string }[]): string {
  const names = uniqueBy(parts, (p) => p.name.toLowerCase());
  const npcs = uniqueBy(
    names.map((p) => p.npc).filter((n): n is string => !!n),
    (n) => n.toLowerCase(),
  );
  if (npcs.length === 1) return `Accept ${listNames(names.map((p) => p.name))} from ${npcs[0]}`;
  if (names.every((p) => p.npc)) {
    return `Accept ${names.map((p) => `${p.name} from ${p.npc}`).join(", ")}`;
  }
  return `Accept ${listNames(names.map((p) => p.name))}`;
}

function formatTurnins(parts: { name: string; npc?: string }[]): string {
  const names = uniqueBy(parts, (p) => p.name.toLowerCase());
  const npcs = uniqueBy(
    names.map((p) => p.npc).filter((n): n is string => !!n),
    (n) => n.toLowerCase(),
  );
  if (npcs.length === 1) return `Turn in ${listNames(names.map((p) => p.name))} to ${npcs[0]}`;
  if (names.every((p) => p.npc)) {
    return `Turn in ${names.map((p) => `${p.name} to ${p.npc}`).join(", ")}`;
  }
  return `Turn in ${listNames(names.map((p) => p.name))}`;
}

function formatCompletes(run: readonly Step[]): { title: string; howto: string[] } {
  const names = uniqueBy(run.flatMap(completeNames), (n) => n.toLowerCase());
  const allCollect = run.every((s) => questActions(s).every((a) => a.type === "collect"));
  const verb = allCollect ? "Collect" : "Complete";
  const howto = uniqueBy(run.flatMap(howToLines), (l) => l.toLowerCase());
  return { title: `${verb} ${listNames(names)}`, howto };
}

function formatChain(run: readonly Step[]): string {
  const turnins = formatTurnins(run.flatMap(turninLabel));
  const accepts = formatAccepts(run.flatMap(acceptLabel));
  const acceptBody = accepts.replace(/^Accept\s+/i, "");
  return `${turnins}, accept ${acceptBody}`;
}

function firstGoto(run: readonly Step[]): Action | undefined {
  for (const step of run) {
    const goto = step.actions.find((a) => a.type === "goto");
    if (goto) return goto;
  }
  return undefined;
}

function combinedQuestActions(run: readonly Step[]): Action[] {
  const out: Action[] = [];
  const seen = new Set<string>();
  for (const step of run) {
    for (const a of questActions(step)) {
      const qid = "questId" in a ? a.questId : 0;
      const key = `${a.type}:${qid}:${a.type === "complete" || a.type === "collect" ? a.objective ?? "" : ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(a);
    }
  }
  return out;
}

function collapse(run: readonly Step[], routes: RouteStyle[]): Step {
  const first = run[0]!;
  const kind = run.some((s) => visitKind(s) === "accept") && run.some((s) => visitKind(s) === "turnin")
    ? "chain"
    : visitKind(first)!;
  const goto = firstGoto(run);
  const actions: Action[] = [];
  if (goto) actions.push(goto);
  actions.push(...combinedQuestActions(run));

  let textLines: string[];
  if (kind === "accept") textLines = [formatAccepts(run.flatMap(acceptLabel))];
  else if (kind === "turnin") textLines = [formatTurnins(run.flatMap(turninLabel))];
  else if (kind === "complete") {
    const { title, howto } = formatCompletes(run);
    textLines = [title, ...howto];
  } else {
    textLines = [formatChain(run)];
  }

  const mergedIds = uniqueBy(
    run.slice(1).flatMap((s) => [s.id, ...(s.mergedIds ?? [])]),
    (id) => id,
  );
  const pins = uniqueBy(
    run.flatMap((s) => s.pins ?? []),
    (p) => JSON.stringify(p),
  );
  const tips = uniqueBy(
    run.flatMap((s) => s.tips ?? []),
    (t) => JSON.stringify(t),
  );
  const professionHooks = uniqueBy(
    run.flatMap((s) => s.professionHooks ?? []),
    (h) => JSON.stringify(h),
  );
  const elite = uniqueBy(
    run.flatMap((s) => s.elite ?? []),
    (e) => JSON.stringify(e),
  );
  const sources = uniqueBy(
    run.flatMap((s) => s.sources ?? []),
    (s) => s.url,
  );
  const alternativeTo = uniqueBy(
    run.flatMap((s) => s.alternativeTo ?? []),
    (id) => id,
  );

  const merged: Step = {
    ...first,
    routes,
    actions,
    text: textLines.map((t) => ({ segments: [{ t }] })),
    mergedIds,
    verified: run.every((s) => s.verified === true),
  };
  if (pins.length) merged.pins = pins;
  else delete merged.pins;
  if (tips.length) merged.tips = tips;
  else delete merged.tips;
  if (professionHooks.length) merged.professionHooks = professionHooks;
  else delete merged.professionHooks;
  if (elite.length) merged.elite = elite;
  else delete merged.elite;
  if (sources.length) merged.sources = sources;
  else delete merged.sources;
  if (alternativeTo.length) merged.alternativeTo = alternativeTo;
  else delete merged.alternativeTo;
  return merged;
}

/** Merge consecutive same-visit steps. Recomputes `n` so numbers stay contiguous. */
export function compactSteps(steps: readonly Step[], quests: readonly CompactQuest[] = []): CompactResult {
  const catalog = new Map(quests.map((q) => [q.id, q]));
  const out: Step[] = [];
  let absorbed = 0;
  let i = 0;
  while (i < steps.length) {
    const run: Step[] = [steps[i]!];
    let routes = routesOf(steps[i]!);
    let j = i + 1;
    while (j < steps.length) {
      const next = steps[j]!;
      const kind = canAppend(run, next, catalog, routes);
      if (!kind) break;
      routes = intersectRoutes(routes, routesOf(next));
      run.push(next);
      j++;
    }
    if (run.length === 1) {
      out.push(run[0]!);
    } else {
      out.push(collapse(run, routes));
      absorbed += run.length - 1;
    }
    i = j;
  }
  return { steps: out.map((s, n) => ({ ...s, n: n + 1 })), absorbed };
}
