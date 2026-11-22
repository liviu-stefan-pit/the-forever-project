/**
 * Dungeon placeholder expansion (build time, registered in build-data.ts `PACK_TRANSFORMS`).
 *
 * Leveling packs mark a dungeon stop with a placeholder step: it has a `dungeon` object, a
 * `tags.dungeonId` (a `research/dungeons/dungeons.json` id such as `uldaman`, or a Forever slug such as
 * `kroldok-stronghold`) and a dungeons-off alternative (`dungeonsOff: true`, `alternativeTo: [placeholderId]`).
 * The dungeons pack (`research/dungeons/steps-v2.json`) holds the real steps per dungeon. This module splices
 * them into the leveling pack around the placeholder, keeping the dungeon pack's own order:
 *
 *   [dungeon steps before its run step…] → placeholder (unchanged) → [run step and everything after it…] → :off
 *
 * Rules:
 * - Inserted steps stay dungeon-gated: they keep (or inherit from the placeholder) the `dungeon` object, so
 *   `resolveRoute` only shows them with `options.dungeons` on. The dungeons pack's own `…:off` steps are never
 *   inserted (the placeholder already has its alternative).
 * - Ids: `<placeholderId>+<dungeonStepId>`, so they are deterministic and no existing id changes.
 * - Routes: an inserted step only goes on routes both the placeholder and the dungeon step allow; none → skipped.
 * - Dedupe (per route): an inserted turn-in is dropped from a route where the leveling packs (or an earlier
 *   expansion) already turn that quest in; an inserted accept also where it is already accepted. Dungeons-off
 *   steps don't count. A step left with no route is skipped.
 * - Prerequisites (per route, when `ctx.prereq` is set): walking each race start → leveling packs by level (the
 *   same walk as prereq-check.ts) with dungeons on, an inserted accept is dropped from a route when, for any
 *   race/class that sees the step and may take the quest, its QuestieDB `pre.single` (any one of) / `pre.group`
 *   (all of) is not turned in earlier on that route (allowlist entries count as satisfied). A dropped quest also
 *   drops its turn-in and objective-only steps on that route, and its objectives are removed from the run step
 *   when it is dropped on every route of that step; follow-ups cascade because the quest is never turned in.
 * - Inserted steps get `alternativeTo: [<placeholder's dungeons-off step ids>]`: they are the dungeons-on
 *   alternatives of that path, so duplicate checks treat the two paths as exclusive.
 * - A dungeonId is expanded once across all leveling packs (first occurrence in build order = by level); later
 *   placeholders for the same id keep their original form and log a warning.
 * - An unknown dungeonId keeps the placeholder as is and logs a warning (never fails the build).
 * The 79953/81951 strip and the Forever forced-unverified rule run afterwards (`enforceRulesTransform`), so they
 * apply to inserted steps too.
 */
import type { Filter, RouteStyle, Step } from "../../contracts/schema.ts";
import {
  calibratedLevelOf,
  flattenPlanBlocks,
  intersectFilters,
  planControlledDungeonIds,
  prepText,
  questNameMap,
  raceFilterForBlock,
  siblingRaceKeys,
  speedrunReplaceIds,
  type DungeonDossier,
  type IntegrationPlan,
  type PlanBlock,
  type PlanRaceKey,
  type RouteTimeline,
} from "./dungeonPlan.ts";
import {
  CLASSES,
  CLASS_MASK,
  RACE_MASK,
  RACE_STARTS,
  allowed,
  masked,
  sequenceFor,
  visible,
  type AllowlistEntry,
  type PrereqPack,
  type PrereqQuest,
} from "./prereq-check.ts";

export type DungeonStepKind = "accept" | "run" | "turnin" | "off" | "other";

export interface DungeonEntry {
  /** Steps before the dungeon's (first) run step, in pack order: they go before the placeholder. */
  before: Step[];
  /** The run step and everything after it, in pack order: they go after the placeholder. */
  after: Step[];
}

export type DungeonIndex = Map<string, DungeonEntry>;

const ALL_ROUTES: RouteStyle[] = ["balanced", "speedrun"];

/**
 * Dungeon id of a dungeons-pack step: `tags.dungeonId` when present, else parsed from the step id
 * (`dungeons:<id>:…`, or `dungeons:forever:<id>:…` for Forever dungeons).
 */
export function dungeonIdOf(step: Step): string | undefined {
  const tag = (step.tags as Record<string, unknown> | undefined)?.dungeonId;
  if (typeof tag === "string" && tag) return tag;
  const p = step.id.split(":");
  if (p[0] !== "dungeons" || p.length < 3) return undefined;
  return p[1] === "forever" ? p[2] : p[1];
}

/** accept / run / turnin / off, from the step content (falls back to the id segment). */
export function dungeonStepKind(step: Step): DungeonStepKind {
  if (step.dungeonsOff) return "off";
  const types = step.actions.map((a) => a.type);
  const seg = step.id.split(":");
  if (seg.includes("off")) return "off";
  if (seg.includes("run")) return "run";
  if (seg.includes("accept")) return "accept";
  if (seg.includes("turnin")) return "turnin";
  if (types.includes("turnin") && !types.includes("accept")) return "turnin";
  if (types.includes("accept") && !types.includes("turnin")) return "accept";
  if (types.some((t) => t === "collect" || t === "complete" || t === "mob")) return "run";
  return "other";
}

/** Group the steps of the dungeon pack(s) by dungeon id, in pack order, split at each dungeon's run step. */
export function indexDungeonSteps(steps: readonly Step[]): DungeonIndex {
  const lists = new Map<string, Step[]>();
  for (const s of steps) {
    const id = dungeonIdOf(s);
    if (!id) continue;
    const kind = dungeonStepKind(s);
    if (kind === "off" || kind === "other") continue;
    lists.set(id, [...(lists.get(id) ?? []), s]);
  }
  const idx: DungeonIndex = new Map();
  for (const [id, list] of lists) {
    const run = list.findIndex((s) => dungeonStepKind(s) === "run");
    if (run >= 0) idx.set(id, { before: list.slice(0, run), after: list.slice(run) });
    // No run step: accepts before the placeholder, the rest after it (pack order kept within each part).
    else idx.set(id, { before: list.filter((s) => dungeonStepKind(s) === "accept"), after: list.filter((s) => dungeonStepKind(s) !== "accept") });
  }
  return idx;
}

export function routesOf(step: Step): RouteStyle[] {
  if (step.routes?.length) return step.routes as RouteStyle[];
  return step.bonus ? ["balanced"] : [...ALL_ROUTES];
}

export function intersectRoutes(a: Step, b: Step): RouteStyle[] {
  const rb = new Set(routesOf(b));
  return routesOf(a).filter((r) => rb.has(r));
}

/** Placeholder = a dungeon-gated step with a string `tags.dungeonId`. */
export function placeholderDungeonId(step: Step): string | undefined {
  const id = (step.tags as Record<string, unknown> | undefined)?.dungeonId;
  return step.dungeon && typeof id === "string" && id ? id : undefined;
}

/** Per route: quests accepted / turned in. Dungeons-off steps are ignored (they are not on the dungeons-on path). */
export interface QuestSeen {
  accepts: Record<RouteStyle, Set<number>>;
  turnins: Record<RouteStyle, Set<number>>;
  /** Leveling (and prior) turn-in step ids per quest — used for alternativeTo on race copies. */
  turninSteps: Record<RouteStyle, Map<number, string[]>>;
}

export function emptySeen(): QuestSeen {
  return {
    accepts: { balanced: new Set(), speedrun: new Set() },
    turnins: { balanced: new Set(), speedrun: new Set() },
    turninSteps: { balanced: new Map(), speedrun: new Map() },
  };
}

export function markSeen(seen: QuestSeen, steps: readonly Step[]): QuestSeen {
  for (const s of steps) {
    if (s.dungeonsOff) continue;
    const routes = routesOf(s);
    for (const a of s.actions) {
      if ((a.type !== "accept" && a.type !== "turnin") || typeof a.questId !== "number") continue;
      for (const r of routes) {
        (a.type === "accept" ? seen.accepts : seen.turnins)[r].add(a.questId);
        if (a.type === "turnin") {
          const m = seen.turninSteps[r];
          const list = m.get(a.questId) ?? [];
          if (!list.includes(s.id)) list.push(s.id);
          m.set(a.questId, list);
        }
      }
    }
  }
  return seen;
}

/** One leveling pack in the prerequisite walk (same shape as prereq-check's PrereqPack). */
export type WalkPack = PrereqPack;

export interface PrereqGuard {
  quests: Readonly<Record<string, PrereqQuest>>;
  allowlist: readonly AllowlistEntry[];
  /** All leveling packs (race start packs carry `startZone`). Updated with each pack's expanded steps. */
  walk: WalkPack[];
  races?: readonly { race: string; zone: string }[];
  classes?: readonly string[];
}

export interface PrereqSkip {
  pack: string;
  dungeonId: string;
  questId: number;
  route: RouteStyle;
  /** "missing" = own prerequisite not met; "cascade" = a prerequisite that was itself dropped. */
  reason: "missing" | "cascade";
  missingPre: number[];
  /** Example race/class that lacks the prerequisite. */
  combo: string;
}

export interface ExpandContext {
  dungeons: DungeonIndex;
  /** dungeon pack steps by id (for anchor copies). */
  dungeonStepById: Map<string, Step>;
  /** Per route: quests accepted / turned in anywhere in the leveling packs, plus every step inserted so far. Shared across packs. */
  seen: QuestSeen;
  /** Every step id in the guide set (all packs). Inserted ids are added here. Shared across packs. */
  usedIds: Set<string>;
  /** dungeonId → placeholder id that already got expanded. Shared across packs. */
  expanded: Map<string, string>;
  warnings: string[];
  /** Prerequisite guard; off when absent. */
  prereq?: PrereqGuard;
  /** Quests dropped by the prerequisite guard, per route (shared across packs, used for cascades). */
  prereqDropped?: Record<RouteStyle, Set<number>>;
  /** Anchor integration plan; when set, planned dungeons insert at anchors instead of placeholders. */
  plan?: IntegrationPlan;
  dossiers?: Map<string, DungeonDossier>;
  /** Flattened once from the plan. */
  planBlocks?: PlanBlock[];
  /** Planned + dropped dungeon ids: placeholders for these are dropped, never expanded. */
  planControlledIds?: Set<string>;
  /** speedrun.replaces step ids → set dungeonsOffRoutes to include speedrun. */
  speedrunReplaces?: Set<string>;
  /** Shared: how many plan blocks contributed at least one inserted step. */
  anchorBlocksApplied?: number;
  /** Inserted anchor steps by id (merge routes only when the same race copy is requested again). */
  insertedById?: Map<string, Step>;
  /**
   * Planned pickup accepts skipped by the prereq guard (anchor too early in the pack).
   * Keyed by `${dungeonId}|${route}|${race}` → source step ids; retried only at a later
   * hub that matches the dossier giver (never a different-zone run/prep anchor).
   */
  deferredPickups?: Map<string, string[]>;
  /** Accepts already emitted while walking packs in order. Run text may name only these. */
  acceptsEmitted?: Record<RouteStyle, Set<number>>;
  /** Per plan-race accepts (run sentence / follow-up checks are race-scoped). */
  acceptsEmittedByRace?: Record<RouteStyle, Map<string, Set<number>>>;
  /** Per plan-race dungeon accepts/turn-ins (do not treat another race's take as a duplicate). */
  raceSeen?: {
    accepts: Record<RouteStyle, Map<string, Set<number>>>;
    turnins: Record<RouteStyle, Map<string, Set<number>>>;
  };
  /** Quest required level (QuestieDB / quests.json). */
  questReqLevel?: (questId: number) => number | undefined;
  /** Route timeline for calibrated levels at anchors. */
  timeline?: RouteTimeline;
}

export interface ExpandStats {
  placeholders: number;
  expanded: number;
  inserted: number;
  skippedDuplicateQuests: number;
  skippedRoutes: number;
  unmatched: string[];
  repeated: string[];
  /** Quest × route drops by the prerequisite guard (own prerequisite missing / cascade from a dropped one). */
  prereqSkippedQuests: number;
  prereqCascaded: number;
  /** Inserted steps (step × route) removed by the prerequisite guard. */
  prereqSkippedSteps: number;
  prereqSkips: PrereqSkip[];
  /** Placeholders dropped because the dungeon is plan-controlled. */
  placeholdersDropped: number;
  /** Steps inserted via anchors in this pack. */
  anchorInserted: number;
}

export function makeExpandContext(
  dungeonSteps: readonly Step[],
  levelingSteps: readonly Step[],
  allIds: Iterable<string>,
  warnings: string[],
  prereq?: PrereqGuard,
  plan?: IntegrationPlan,
  dossiers?: Map<string, DungeonDossier>,
  extras?: {
    questReqLevel?: (questId: number) => number | undefined;
    timeline?: RouteTimeline;
  },
): ExpandContext {
  const dungeonStepById = new Map<string, Step>();
  for (const s of dungeonSteps) dungeonStepById.set(s.id, s);
  const emptyRaceMaps = (): Record<RouteStyle, Map<string, Set<number>>> => ({
    balanced: new Map(),
    speedrun: new Map(),
  });
  const ctx: ExpandContext = {
    dungeons: indexDungeonSteps(dungeonSteps),
    dungeonStepById,
    seen: markSeen(emptySeen(), levelingSteps),
    usedIds: new Set(allIds),
    expanded: new Map(),
    warnings,
    prereq,
    prereqDropped: { balanced: new Set(), speedrun: new Set() },
    plan,
    dossiers,
    anchorBlocksApplied: 0,
    questReqLevel: extras?.questReqLevel,
    timeline: extras?.timeline,
  };
  if (plan) {
    ctx.planBlocks = flattenPlanBlocks(plan, dossiers ?? new Map());
    ctx.planControlledIds = planControlledDungeonIds(plan);
    ctx.speedrunReplaces = speedrunReplaceIds(plan);
    ctx.insertedById = new Map();
    ctx.deferredPickups = new Map();
    ctx.raceSeen = { accepts: emptyRaceMaps(), turnins: emptyRaceMaps() };
    ctx.acceptsEmittedByRace = emptyRaceMaps();
  }
  ctx.acceptsEmitted = { balanced: new Set(), speedrun: new Set() };
  return ctx;
}

/** Never name these in the run sentence (wrong hub / second trip / unverified extras). */
const NO_RUN_SENTENCE = new Set([95664, 98823, 96988, 7046]);

function raceBag(map: Map<string, Set<number>> | undefined, race: string): Set<number> {
  if (!map) return new Set();
  let s = map.get(race);
  if (!s) {
    s = new Set();
    map.set(race, s);
  }
  return s;
}

/** Inserted step id: `all` keeps unsuffixed; other race keys get `+${race}`. */
function insertedStepId(afterStepId: string, srcId: string, race: PlanRaceKey): string {
  const base = `${afterStepId}+${srcId}`;
  return race === "all" ? base : `${base}+${race}`;
}

function prepStepId(afterStepId: string, dungeonId: string, race: PlanRaceKey): string {
  const base = `${afterStepId}+prep:${dungeonId}`;
  return race === "all" ? base : `${base}+${race}`;
}

function markRaceSeen(ctx: ExpandContext, step: Step, race: PlanRaceKey, routes: RouteStyle[] | undefined): void {
  const rs = ctx.raceSeen;
  if (!rs || step.dungeonsOff) return;
  for (const r of routes ?? []) {
    for (const q of questIdsOf(step, "accept")) raceBag(rs.accepts[r], race).add(q);
    for (const q of questIdsOf(step, "turnin")) raceBag(rs.turnins[r], race).add(q);
  }
}

function normPlace(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Zone/hub names a step actually stands in: section, trailing "(Zone)", goto, and pin. */
function placeNames(step: Step | undefined): string[] {
  if (!step) return [];
  const names: string[] = [];
  const add = (s?: string | null) => {
    const n = normPlace(s ?? "");
    if (n.length >= 3) names.push(n);
  };
  add(step.section);
  for (const block of step.text ?? []) {
    for (const seg of block.segments ?? []) {
      const m = (seg.t ?? "").match(/\(([^)]+)\)\s*$/);
      if (m?.[1]) add(m[1]);
    }
  }
  for (const a of step.actions) {
    if (a.type === "goto" && "at" in a && a.at && typeof a.at === "object" && "zone" in a.at && a.at.zone) add(String(a.at.zone));
  }
  for (const pin of step.pins ?? []) {
    if ("at" in pin && pin.at?.zone) add(pin.at.zone);
  }
  return names;
}

/** Loose hub/zone match ("Orgrimmar" vs zone Orgrimmar, "Camp Taurajo" vs Taurajo). */
function giverMatchesPlace(giver: { hub?: string | null; zone?: string | null } | undefined, names: string[]): boolean {
  if (!giver || !names.length) return false;
  const keys = [giver.hub, giver.zone].map((s) => normPlace(s ?? "")).filter((s) => s.length >= 4);
  return keys.some((k) => names.some((n) => n === k || n.includes(k) || k.includes(n)));
}

function noteAccepts(ctx: ExpandContext, s: Step, race?: PlanRaceKey): void {
  const bag = ctx.acceptsEmitted;
  if (!bag || s.dungeonsOff) return;
  for (const r of routesOf(s)) for (const q of questIdsOf(s, "accept")) bag[r].add(q);
  if (race && ctx.acceptsEmittedByRace) {
    for (const r of routesOf(s)) for (const q of questIdsOf(s, "accept")) raceBag(ctx.acceptsEmittedByRace[r], race).add(q);
  }
}

/** Timeline hubs for an anchor id (Orgrimmar / Undercity / …). */
function timelinePlaces(ctx: ExpandContext, stepId: string): string[] {
  if (!ctx.timeline) return [];
  for (const p of ctx.timeline.packs) {
    const s = p.steps.find((x) => x.id === stepId);
    if (!s) continue;
    const names: string[] = [];
    const add = (x?: string | null) => {
      const n = normPlace(x ?? "");
      if (n.length >= 3) names.push(n);
    };
    add(s.zone);
    for (const h of s.hubs ?? []) add(h);
    return names;
  }
  return [];
}

function anchorPlaces(ctx: ExpandContext, step: Step | undefined, stepId?: string): string[] {
  return [...placeNames(step), ...(stepId ? timelinePlaces(ctx, stepId) : [])];
}

function walkIndex(walk: { steps: { id: string }[] }[] | undefined, stepId: string): number | undefined {
  if (!walk) return undefined;
  let i = 0;
  for (const p of walk) {
    for (const s of p.steps) {
      if (s.id === stepId) return i;
      i++;
    }
  }
  return undefined;
}

/**
 * Latest step in this pack before `runId` whose timeline zone/hubs match the giver and
 * whose calibrated level is at least `minReq` (0 = no level gate).
 */
function latestMatchingHubBeforeRun(
  ctx: ExpandContext,
  stepIndex: Map<string, number>,
  runId: string,
  route: RouteStyle,
  giver: { hub?: string | null; zone?: string | null } | undefined,
  minReq: number,
): string | undefined {
  if (!ctx.timeline || !giver) return undefined;
  const runIdx = walkIndex(ctx.timeline.packs, runId);
  if (runIdx == null) return undefined;
  let best: string | undefined;
  let i = 0;
  for (const p of ctx.timeline.packs) {
    for (const s of p.steps) {
      const idx = i++;
      if (idx >= runIdx) return best;
      if (!stepIndex.has(s.id)) continue;
      if (!giverMatchesPlace(giver, timelinePlaces(ctx, s.id))) continue;
      const cal = calibratedLevelOf(ctx.timeline, s.id, route);
      if (minReq > 0 && (cal == null || cal < minReq)) continue;
      best = s.id;
    }
  }
  return best;
}

/** Union of route lists. */
function unionRoutes(a: RouteStyle[] | undefined, b: RouteStyle[] | undefined): RouteStyle[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}

// ---------- prerequisite walk state ----------

interface Combo {
  route: RouteStyle;
  race: string;
  cls: string;
  done: Set<number>;
}

const questIdsOf = (s: Step, type?: string) =>
  s.actions.filter((a) => (type ? a.type === type : true) && "questId" in a && typeof a.questId === "number").map((a) => (a as { questId: number }).questId);

function addTurnins(c: Combo, s: Step) {
  if (!visible(s, c.route, "on", c.race, c.cls)) return;
  for (const q of questIdsOf(s, "turnin")) c.done.add(q);
}

/** Per route × race start × class: quests turned in (dungeons on) by the packs walked before `packId`. */
function startCombos(g: PrereqGuard, packId: string): Combo[] {
  const out: Combo[] = [];
  for (const { race, zone } of g.races ?? RACE_STARTS) {
    const seq = sequenceFor(g.walk, zone);
    const i = seq.findIndex((p) => p.id === packId);
    if (i < 0) continue; // this race never walks the pack (another race's start zone)
    for (const cls of g.classes ?? CLASSES)
      for (const route of ALL_ROUTES) {
        const c: Combo = { route, race, cls, done: new Set() };
        for (const p of seq.slice(0, i)) for (const s of p.steps) addTurnins(c, s);
        out.push(c);
      }
  }
  return out;
}

/** Can this character take the quest (QuestieDB race/class mask)? */
function mayTake(g: PrereqGuard, q: number, c: Combo): boolean {
  const info = g.quests[String(q)];
  return !info || !(masked(info.races, RACE_MASK[c.race]) || masked(info.classes, CLASS_MASK[c.cls]));
}

/** Missing prerequisites of quest `q` for this combo, or null when satisfied (or allowlisted). */
function missingPre(g: PrereqGuard, q: number, c: Combo): number[] | null {
  const pre = g.quests[String(q)]?.pre;
  const single = pre?.single ?? [];
  if (single.length && !single.some((x) => c.done.has(x)) && !allowed(g.allowlist, q, single)) return single;
  const group = (pre?.group ?? []).filter((x) => !c.done.has(x));
  if (group.length && !allowed(g.allowlist, q, group)) return group;
  return null;
}


function insertedStep(ph: Step, src: Step, routes: RouteStyle[], offIds: string[]): Step {
  const { n: _n, section: _section, dungeonsOff: _off, alternativeTo: _alt, ...rest } = src;
  const out: Step = {
    ...rest,
    id: `${ph.id}+${src.id}`,
    n: 0,
    tags: { ...(src.tags ?? {}), dungeonId: placeholderDungeonId(ph)!, expandedFrom: ph.id, dungeonStep: src.id } as Step["tags"],
    routes,
    dungeon: src.dungeon ?? ph.dungeon,
  };
  // Dungeons-on alternative of the placeholder's dungeons-off step(s), so duplicate checks pair them up.
  if (offIds.length) out.alternativeTo = offIds;
  return out;
}

function emptyStats(): ExpandStats {
  return {
    placeholders: 0, expanded: 0, inserted: 0, skippedDuplicateQuests: 0, skippedRoutes: 0, unmatched: [], repeated: [],
    prereqSkippedQuests: 0, prereqCascaded: 0, prereqSkippedSteps: 0, prereqSkips: [],
    placeholdersDropped: 0, anchorInserted: 0,
  };
}

type PlaceFn = (args: {
  src: Step;
  afterStepId: string;
  anchor: Step;
  routes: RouteStyle[];
  dungeonId: string;
  part: "pickup" | "run" | "turnin";
  filter?: Filter;
  race: PlanRaceKey;
  textPrepend?: string;
  actions?: Step["actions"];
  /** When set, a prereq-skipped accept is recorded for retry at a later matching giver hub. */
  deferKey?: string;
}) => Step | undefined;

function makePlaceEmitter(
  packId: string,
  ctx: ExpandContext,
  stats: ExpandStats,
  combos: Combo[],
  emit: (s: Step) => void,
): PlaceFn {
  const g = ctx.prereq;
  const dropped = (ctx.prereqDropped ??= { balanced: new Set(), speedrun: new Set() });
  return ({ src, afterStepId, anchor, routes: wantRoutes, dungeonId, part, filter, race, textPrepend, actions, deferKey }) => {
    // Plan is the authority for route membership on anchor copies (Forever steps-v2 is often
    // balanced-only; speedrun plan blocks must still place). Legacy placeholder expansion keeps
    // source∩placeholder intersection in expandWithPlaceholders / expandOnePlaceholder.
    let routes = [...wantRoutes];
    if (!routes.length) {
      stats.skippedRoutes++;
      return;
    }
    const kind = dungeonStepKind(src);
    const priorTurninAlts: string[] = [];
    if (kind === "accept" || kind === "turnin") {
      const qids = questIdsOf(src, kind);
      const dup = (r: RouteStyle) => {
        if (!qids.length) return false;
        const raceMap = kind === "accept" ? ctx.raceSeen?.accepts[r] : ctx.raceSeen?.turnins[r];
        if (raceMap?.get(race) && qids.every((q) => raceMap.get(race)!.has(q))) return true;
        // Same race already took this via an earlier dungeon insert.
        // Leveling-pack global seen: skip only for race keys that share the early leveling accept
        // (OrcTroll Hidden Enemies in Durotar). Other races still need their own copy.
        if (race === "OrcTroll" || race === "all") {
          return qids.every((q) => ctx.seen.turnins[r].has(q) || (kind === "accept" && ctx.seen.accepts[r].has(q)));
        }
        return false;
      };
      const kept = routes.filter((r) => !dup(r));
      if (!kept.length) {
        stats.skippedDuplicateQuests++;
        return;
      }
      routes = kept;
      if (kind === "turnin") {
        for (const r of routes) {
          for (const q of qids) {
            for (const id of ctx.seen.turninSteps[r].get(q) ?? []) {
              if (!priorTurninAlts.includes(id)) priorTurninAlts.push(id);
            }
          }
        }
      }
    }
    const { n: _n, section: _section, dungeonsOff: _off, alternativeTo: _alt, ...rest } = src;
    let step: Step = {
      ...rest,
      id: insertedStepId(afterStepId, src.id, race),
      n: 0,
      section: anchor.section,
      tags: {
        ...(src.tags ?? {}),
        dungeonId,
        dungeonPart: part,
        expandedFrom: afterStepId,
        dungeonStep: src.id,
        planRace: race,
      } as Step["tags"],
      routes,
      dungeon: src.dungeon ?? anchor.dungeon,
      filter: intersectFilters(src.filter, filter),
    };
    if (priorTurninAlts.length) {
      step = { ...step, alternativeTo: [...new Set([...(step.alternativeTo ?? []), ...priorTurninAlts])] };
    }
    if (actions) step = { ...step, actions };
    if (textPrepend) {
      step = {
        ...step,
        text: [{ segments: [{ t: textPrepend }] }, ...(step.text ?? [])],
      };
    }
    const isRunStep = part === "run" || src.id.split(":").includes("run");
    if (g) {
      const keep: RouteStyle[] = [];
      let deferred = false;
      const failedAccepts = new Set<number>();
      for (const r of routes) {
        let ok = true;
        for (const q of questIdsOf(step, "accept")) {
          if (dropped[r].has(q)) {
            failedAccepts.add(q);
            // Run steps keep the route; only pickups/turn-ins are dropped when an accept is gone.
            if (!isRunStep) ok = false;
            continue;
          }
          for (const c of combos) {
            if (c.route !== r || !visible(step, r, "on", c.race, c.cls) || !mayTake(g, q, c)) continue;
            const miss = missingPre(g, q, c);
            if (!miss) continue;
            const cascade = miss.some((m) => dropped[r].has(m));
            // Pickup accepts that are merely early: defer to the run hub instead of dropping forever.
            if (part === "pickup" && deferKey && !cascade) {
              deferred = true;
              ok = false;
              break;
            }
            // On a run step, strip the failed accept from this step only — do not permanently
            // drop the quest (a same-hub follow-up after the prereq turn-in may still place it).
            failedAccepts.add(q);
            if (!isRunStep) {
              dropped[r].add(q);
              if (cascade) stats.prereqCascaded++;
              else stats.prereqSkippedQuests++;
              const skip: PrereqSkip = { pack: packId, dungeonId, questId: q, route: r, reason: cascade ? "cascade" : "missing", missingPre: miss, combo: `${c.race}/${c.cls}` };
              stats.prereqSkips.push(skip);
              ctx.warnings.push(
                `${packId}: ${r}: skipped dungeon quest ${q} (${dungeonId}) — prerequisite ${miss.join(miss.length > 1 ? "/" : "")} not turned in earlier` +
                  `${cascade ? " (it was itself skipped)" : ""}, e.g. ${skip.combo}`,
              );
              ok = false;
            }
            break;
          }
        }
        const qs = questIdsOf(step);
        if (!isRunStep && qs.length && qs.every((q) => dropped[r].has(q))) ok = false;
        if (ok) keep.push(r);
        else stats.prereqSkippedSteps++;
      }
      if (!keep.length) {
        if (deferred && deferKey && part === "pickup") {
          const list = ctx.deferredPickups?.get(deferKey) ?? [];
          if (!list.includes(src.id)) {
            list.push(src.id);
            ctx.deferredPickups?.set(deferKey, list);
          }
        }
        return;
      }
      step = { ...step, routes: keep };
      if (isRunStep && failedAccepts.size) {
        // Keep the run; drop only the failed accept actions and their objectives.
        const nextActions = step.actions.filter((a) => !("questId" in a && typeof a.questId === "number" && failedAccepts.has(a.questId as number)));
        if (nextActions.length !== step.actions.length) step = { ...step, actions: nextActions };
      } else if (isRunStep) {
        const nextActions = step.actions.filter((a) => !("questId" in a && typeof a.questId === "number" && keep.every((r) => dropped[r].has(a.questId as number))));
        if (nextActions.length !== step.actions.length) step = { ...step, actions: nextActions };
      }
    }
    const existing = ctx.insertedById?.get(step.id);
    if (existing) {
      // Same race key / same id: merge routes only. Never union filters across race blocks.
      const beforeRoutes = new Set(existing.routes ?? []);
      const mergedRoutes = unionRoutes(existing.routes, step.routes);
      existing.routes = mergedRoutes;
      markRaceSeen(ctx, step, race, mergedRoutes);
      if (race === "all") markSeen(ctx.seen, [step]);
      for (const r of mergedRoutes) {
        if (beforeRoutes.has(r)) continue;
        // Replay emit side-effects for the newly added route (acceptsEmitted + prereq turn-ins).
        noteAccepts(ctx, { ...existing, routes: [r], actions: step.actions }, race);
        for (const c of combos) if (c.route === r) addTurnins(c, { ...existing, routes: [r] });
      }
      return existing;
    }
    if (ctx.usedIds.has(step.id)) {
      ctx.warnings.push(`${packId}: inserted step id ${step.id} already exists; skipped`);
      return;
    }
    ctx.usedIds.add(step.id);
    ctx.insertedById?.set(step.id, step);
    // Race-keyed inserts track via raceSeen only so one race's take does not hide another's.
    markRaceSeen(ctx, step, race, step.routes);
    if (race === "all") markSeen(ctx.seen, [step]);
    stats.inserted++;
    stats.anchorInserted++;
    emit(step);
    return step;
  };
}

/** Insertions scheduled after a given leveling step id. */
interface AnchorBatch {
  dungeonId: string;
  levels0: number;
  block: PlanBlock;
  pickups: string[];
  prep: boolean;
  run: boolean;
  turnins: string[];
  /** Accepts for included quests not listed as pickups/inside (same-hub chain follow-ups). */
  followupAccepts: string[];
}

/**
 * Expand every placeholder in one leveling pack. Returns new steps (input is not mutated) and stats.
 * Call packs in level order with one shared context so cross-pack rules (dedupe, expand-once, unique ids,
 * prerequisite walk) hold.
 *
 * When `ctx.plan` is set, planned dungeons insert at plan anchors (pickups / prep / run / turn-ins) and
 * their placeholders are dropped; unplanned dungeon placeholders still use the legacy splice.
 */
export function expandDungeonPlaceholders(packId: string, steps: readonly Step[], ctx: ExpandContext): { steps: Step[]; stats: ExpandStats } {
  if (ctx.plan && ctx.planBlocks) return expandWithAnchors(packId, steps, ctx);
  return expandWithPlaceholders(packId, steps, ctx);
}

function expandWithPlaceholders(packId: string, steps: readonly Step[], ctx: ExpandContext): { steps: Step[]; stats: ExpandStats } {
  const stats = emptyStats();
  const g = ctx.prereq;
  const dropped = (ctx.prereqDropped ??= { balanced: new Set(), speedrun: new Set() });
  const combos = g ? startCombos(g, packId) : [];
  const out: Step[] = [];
  const emit = (s: Step) => {
    out.push(s);
    for (const c of combos) addTurnins(c, s);
    noteAccepts(ctx, s);
  };
  for (const ph of steps) {
    const did = placeholderDungeonId(ph);
    if (!did) {
      emit(ph);
      continue;
    }
    stats.placeholders++;
    const entry = ctx.dungeons.get(did);
    if (!entry) {
      stats.unmatched.push(did);
      ctx.warnings.push(`${packId}: placeholder ${ph.id} has dungeonId "${did}" with no steps in the dungeons pack; kept as is`);
      emit(ph);
      continue;
    }
    const prev = ctx.expanded.get(did);
    if (prev) {
      stats.repeated.push(did);
      ctx.warnings.push(`${packId}: placeholder ${ph.id} repeats dungeonId "${did}" (already expanded at ${prev}); kept as is`);
      emit(ph);
      continue;
    }
    ctx.expanded.set(did, ph.id);
    stats.expanded++;

    const offIds = steps.filter((x) => x.dungeonsOff && x.alternativeTo?.includes(ph.id)).map((x) => x.id);
    const place = (src: Step) => {
      let routes = intersectRoutes(ph, src);
      if (!routes.length) {
        stats.skippedRoutes++;
        return;
      }
      const kind = dungeonStepKind(src);
      if (kind === "accept" || kind === "turnin") {
        const qids = questIdsOf(src, kind);
        const dup = (r: RouteStyle) =>
          qids.length > 0 && qids.every((q) => ctx.seen.turnins[r].has(q) || (kind === "accept" && ctx.seen.accepts[r].has(q)));
        const kept = routes.filter((r) => !dup(r));
        if (!kept.length) {
          stats.skippedDuplicateQuests++;
          return;
        }
        routes = kept;
      }
      let step = insertedStep(ph, src, routes, offIds);
      const isRunStep = src.id.split(":").includes("run");
      if (g) {
        const keep: RouteStyle[] = [];
        for (const r of routes) {
          let ok = true;
          for (const q of questIdsOf(step, "accept")) {
            if (dropped[r].has(q)) {
              ok = false;
              continue;
            }
            for (const c of combos) {
              if (c.route !== r || !visible(step, r, "on", c.race, c.cls) || !mayTake(g, q, c)) continue;
              const miss = missingPre(g, q, c);
              if (!miss) continue;
              const cascade = miss.some((m) => dropped[r].has(m));
              dropped[r].add(q);
              ok = false;
              if (cascade) stats.prereqCascaded++;
              else stats.prereqSkippedQuests++;
              const skip: PrereqSkip = { pack: packId, dungeonId: did, questId: q, route: r, reason: cascade ? "cascade" : "missing", missingPre: miss, combo: `${c.race}/${c.cls}` };
              stats.prereqSkips.push(skip);
              ctx.warnings.push(
                `${packId}: ${r}: skipped dungeon quest ${q} (${did}) — prerequisite ${miss.join(miss.length > 1 ? "/" : "")} not turned in earlier` +
                  `${cascade ? " (it was itself skipped)" : ""}, e.g. ${skip.combo}`,
              );
              break;
            }
          }
          const qs = questIdsOf(step);
          if (!isRunStep && qs.length && qs.every((q) => dropped[r].has(q))) ok = false;
          if (ok) keep.push(r);
          else stats.prereqSkippedSteps++;
        }
        if (!keep.length) return;
        step = { ...step, routes: keep };
        if (isRunStep) {
          const actions = step.actions.filter((a) => !("questId" in a && typeof a.questId === "number" && keep.every((r) => dropped[r].has(a.questId as number))));
          if (actions.length !== step.actions.length) step = { ...step, actions };
        }
      }
      if (ctx.usedIds.has(step.id)) {
        ctx.warnings.push(`${packId}: inserted step id ${step.id} already exists; skipped`);
        return;
      }
      ctx.usedIds.add(step.id);
      markSeen(ctx.seen, [step]);
      stats.inserted++;
      return step;
    };
    for (const src of entry.before) {
      const s = place(src);
      if (s) emit(s);
    }
    emit(ph);
    for (const src of entry.after) {
      const s = place(src);
      if (s) emit(s);
    }
  }
  if (g) {
    const w = g.walk.find((p) => p.id === packId);
    if (w) w.steps = out;
  }
  return { steps: out, stats };
}

/** Legacy splice for one unplanned placeholder (fallback when the plan has no entry for that dungeon). */
function expandOnePlaceholder(
  packId: string,
  ph: Step,
  packSteps: readonly Step[],
  ctx: ExpandContext,
  stats: ExpandStats,
  combos: Combo[],
  emit: (s: Step) => void,
): void {
  const did = placeholderDungeonId(ph)!;
  stats.placeholders++;
  const entry = ctx.dungeons.get(did);
  if (!entry) {
    stats.unmatched.push(did);
    ctx.warnings.push(`${packId}: placeholder ${ph.id} has dungeonId "${did}" with no steps in the dungeons pack; kept as is`);
    emit(ph);
    return;
  }
  const prev = ctx.expanded.get(did);
  if (prev) {
    stats.repeated.push(did);
    ctx.warnings.push(`${packId}: placeholder ${ph.id} repeats dungeonId "${did}" (already expanded at ${prev}); kept as is`);
    emit(ph);
    return;
  }
  ctx.expanded.set(did, ph.id);
  stats.expanded++;
  const g = ctx.prereq;
  const dropped = (ctx.prereqDropped ??= { balanced: new Set(), speedrun: new Set() });
  const offIds = packSteps.filter((x) => x.dungeonsOff && x.alternativeTo?.includes(ph.id)).map((x) => x.id);
  const place = (src: Step) => {
    let routes = intersectRoutes(ph, src);
    if (!routes.length) {
      stats.skippedRoutes++;
      return;
    }
    const kind = dungeonStepKind(src);
    if (kind === "accept" || kind === "turnin") {
      const qids = questIdsOf(src, kind);
      const dup = (r: RouteStyle) =>
        qids.length > 0 && qids.every((q) => ctx.seen.turnins[r].has(q) || (kind === "accept" && ctx.seen.accepts[r].has(q)));
      const kept = routes.filter((r) => !dup(r));
      if (!kept.length) {
        stats.skippedDuplicateQuests++;
        return;
      }
      routes = kept;
    }
    let step = insertedStep(ph, src, routes, offIds);
    const isRunStep = src.id.split(":").includes("run");
    if (g) {
      const keep: RouteStyle[] = [];
      for (const r of routes) {
        let ok = true;
        for (const q of questIdsOf(step, "accept")) {
          if (dropped[r].has(q)) {
            ok = false;
            continue;
          }
          for (const c of combos) {
            if (c.route !== r || !visible(step, r, "on", c.race, c.cls) || !mayTake(g, q, c)) continue;
            const miss = missingPre(g, q, c);
            if (!miss) continue;
            const cascade = miss.some((m) => dropped[r].has(m));
            dropped[r].add(q);
            ok = false;
            if (cascade) stats.prereqCascaded++;
            else stats.prereqSkippedQuests++;
            const skip: PrereqSkip = { pack: packId, dungeonId: did, questId: q, route: r, reason: cascade ? "cascade" : "missing", missingPre: miss, combo: `${c.race}/${c.cls}` };
            stats.prereqSkips.push(skip);
            ctx.warnings.push(
              `${packId}: ${r}: skipped dungeon quest ${q} (${did}) — prerequisite ${miss.join(miss.length > 1 ? "/" : "")} not turned in earlier` +
                `${cascade ? " (it was itself skipped)" : ""}, e.g. ${skip.combo}`,
            );
            break;
          }
        }
        const qs = questIdsOf(step);
        if (!isRunStep && qs.length && qs.every((q) => dropped[r].has(q))) ok = false;
        if (ok) keep.push(r);
        else stats.prereqSkippedSteps++;
      }
      if (!keep.length) return;
      step = { ...step, routes: keep };
      if (isRunStep) {
        const actions = step.actions.filter((a) => !("questId" in a && typeof a.questId === "number" && keep.every((r) => dropped[r].has(a.questId as number))));
        if (actions.length !== step.actions.length) step = { ...step, actions };
      }
    }
    if (ctx.usedIds.has(step.id)) {
      ctx.warnings.push(`${packId}: inserted step id ${step.id} already exists; skipped`);
      return;
    }
    ctx.usedIds.add(step.id);
    markSeen(ctx.seen, [step]);
    stats.inserted++;
    return step;
  };
  for (const src of entry.before) {
    const s = place(src);
    if (s) emit(s);
  }
  emit(ph);
  for (const src of entry.after) {
    const s = place(src);
    if (s) emit(s);
  }
}

function expandWithAnchors(packId: string, steps: readonly Step[], ctx: ExpandContext): { steps: Step[]; stats: ExpandStats } {
  const stats = emptyStats();
  const g = ctx.prereq;
  const combos = g ? startCombos(g, packId) : [];
  const out: Step[] = [];
  const emit = (s: Step) => {
    out.push(s);
    for (const c of combos) addTurnins(c, s);
    const planRace = (s.tags as Record<string, unknown> | undefined)?.planRace as PlanRaceKey | undefined;
    noteAccepts(ctx, s, planRace);
  };
  const controlled = ctx.planControlledIds ?? new Set<string>();
  const replaces = ctx.speedrunReplaces ?? new Set<string>();
  const stepIndex = new Map(steps.map((s, i) => [s.id, i]));
  const byId = new Map(steps.map((s) => [s.id, s]));

  // Collect insertions that land in this pack, keyed by afterStepId.
  const batches = new Map<string, AnchorBatch[]>();
  const touchedBlocks = new Set<PlanBlock>();
  /** Quest ids stripped from this block's run sentence / objectives (wrong hub, second trip, etc.). */
  const strippedForRun = new Map<PlanBlock, Set<number>>();
  const stripRun = (block: PlanBlock, qid: number) => {
    let s = strippedForRun.get(block);
    if (!s) {
      s = new Set();
      strippedForRun.set(block, s);
    }
    s.add(qid);
  };

  for (const block of ctx.planBlocks ?? []) {
    // 1-20 anchor wins. The later 20-40 run/prep (and pickups listed in movePickupsFrom,
    // plus turn-ins that shared the later run step) are retargeted so they are not spliced again.
    if (block.earlyRun && !block.earlyApplied && ctx.usedIds.has(block.earlyRun.afterStepId)) {
      const lateRun = block.run?.afterStepId;
      const latePrep = block.prep?.afterStepId;
      const earlyId = block.earlyRun.afterStepId;
      const movePu = new Set(block.movePickupsFrom ?? []);
      for (const pu of block.pickups) {
        if (movePu.has(pu.afterStepId)) pu.afterStepId = earlyId;
      }
      for (const ti of block.turnins) {
        if (ti.afterStepId === lateRun || ti.afterStepId === latePrep) ti.afterStepId = earlyId;
      }
      if (block.prep && (block.prep.afterStepId === lateRun || block.prep.afterStepId === latePrep || block.earlyPrep)) {
        block.prep = block.earlyPrep ?? { afterStepId: earlyId, estLevel: block.earlyRun.estLevel };
      } else if (!block.prep) {
        block.prep = block.earlyPrep ?? { afterStepId: earlyId, estLevel: block.earlyRun.estLevel };
      }
      block.run = block.earlyRun;
      block.earlyApplied = true;
    }
    const dossier = ctx.dossiers?.get(block.dungeonId);
    const ensure = (afterStepId: string): AnchorBatch | undefined => {
      if (!stepIndex.has(afterStepId)) return undefined;
      let list = batches.get(afterStepId);
      if (!list) {
        list = [];
        batches.set(afterStepId, list);
      }
      let b = list.find((x) => x.block === block);
      if (!b) {
        b = {
          dungeonId: block.dungeonId,
          levels0: block.levels[0],
          block,
          pickups: [],
          prep: false,
          run: false,
          turnins: [],
          followupAccepts: [],
        };
        list.push(b);
      }
      touchedBlocks.add(block);
      return b;
    };
    for (const pu of block.pickups) {
      const b = ensure(pu.afterStepId);
      if (b) b.pickups.push(...pu.dungeonStepIds);
    }
    if (block.prep && ensure(block.prep.afterStepId)) ensure(block.prep.afterStepId)!.prep = true;
    if (block.run && ensure(block.run.afterStepId)) ensure(block.run.afterStepId)!.run = true;
    for (const ti of block.turnins) {
      const b = ensure(ti.afterStepId);
      if (b) b.turnins.push(...ti.dungeonStepIds);
    }

    // Move accepts off anchors below the quest required level onto a later matching-hub step.
    // Never park them on a run/prep hub in a different zone (e.g. RFK 1109 → Undercity, not Dustwallow).
    if (block.run) {
      const runBatch = ensure(block.run.afterStepId);
      const runNames = anchorPlaces(ctx, byId.get(block.run.afterStepId), block.run.afterStepId);
      const runCal = calibratedLevelOf(ctx.timeline, block.run.afterStepId, block.route);
      // Snapshot keys so ensure()-created batches are not re-walked mid-loop.
      const earlyBatches = [...batches.entries()];
      for (const [afterId, list] of earlyBatches) {
        for (const b of list) {
          if (b.block !== block || b === runBatch) continue;
          const kept: string[] = [];
          for (const sid of b.pickups) {
            const src = ctx.dungeonStepById.get(sid);
            const qids = src ? questIdsOf(src, "accept") : [];
            const cal = calibratedLevelOf(ctx.timeline, afterId, block.route);
            const minReq = qids.reduce((m, q) => Math.max(m, ctx.questReqLevel?.(q) ?? 0), 0);
            const tooEarly = minReq > 0 && cal != null && cal < minReq;
            if (!tooEarly) {
              kept.push(sid);
              continue;
            }
            const qmeta = dossier?.quests?.find((q) => qids.includes(q.questId));
            const hubTarget = latestMatchingHubBeforeRun(
              ctx,
              stepIndex,
              block.run.afterStepId,
              block.route,
              qmeta?.giver,
              minReq,
            );
            if (hubTarget && hubTarget !== afterId) {
              const dest = ensure(hubTarget);
              if (dest && !dest.pickups.includes(sid)) dest.pickups.push(sid);
            } else if (
              runBatch &&
              qmeta &&
              giverMatchesPlace(qmeta.giver, runNames) &&
              (minReq <= 0 || runCal == null || runCal >= minReq)
            ) {
              // Giver hub is the run hub itself — only then may the accept sit on the run.
              if (!runBatch.pickups.includes(sid)) runBatch.pickups.push(sid);
            } else {
              for (const q of qids) stripRun(block, q);
            }
          }
          b.pickups = kept;
        }
      }
      // Prep too early for the dungeon band → move to the run anchor.
      if (block.prep && block.prep.afterStepId !== block.run.afterStepId) {
        const prepCal = calibratedLevelOf(ctx.timeline, block.prep.afterStepId, block.route);
        if (prepCal != null && prepCal < block.levels[0] && runBatch) {
          for (const list of batches.values()) {
            for (const b of list) {
              if (b.block === block && b !== runBatch && b.prep) b.prep = false;
            }
          }
          runBatch.prep = true;
        }
      }
    }

    // Prefer accepting at the run hub when the giver is there (e.g. Undead/Skyborne RFC in Orgrimmar at fp-3310).
    if (block.run) {
      const runNames = anchorPlaces(ctx, byId.get(block.run.afterStepId), block.run.afterStepId);
      const runBatch = ensure(block.run.afterStepId);
      if (runBatch && runNames.length) {
        for (const list of batches.values()) {
          for (const b of list) {
            if (b.block !== block || b === runBatch) continue;
            const kept: string[] = [];
            for (const sid of b.pickups) {
              const src = ctx.dungeonStepById.get(sid);
              const qmeta = dossier?.quests?.find((q) => (src ? questIdsOf(src, "accept") : []).includes(q.questId));
              if (qmeta && giverMatchesPlace(qmeta.giver, runNames)) {
                if (!runBatch.pickups.includes(sid)) runBatch.pickups.push(sid);
              } else kept.push(sid);
            }
            b.pickups = kept;
          }
        }
      }
    }

    // Chain follow-ups: accept at the prerequisite turn-in when that step's hub matches the giver.
    // Do not park them on the run anchor (that accepts them before the prerequisite, or in the wrong zone).
    const inside = new Set(block.run?.insideQuestIds ?? []);
    const relocate = new Set<string>();
    for (const qid of block.includedQuestIds) {
      // Maraudon 7046 would be a return trip after 7044 at Thunder Bluff — never emit / name it.
      if (qid === 7046) {
        stripRun(block, 7046);
        const dropAid = dossier?.quests?.find((x) => x.questId === 7046)?.stepIds?.accept;
        if (dropAid) relocate.add(dropAid);
        continue;
      }
      const q = dossier?.quests?.find((x) => x.questId === qid);
      const aid = q?.stepIds?.accept;
      const pres = q?.prerequisites ?? [];
      // Inside or pickup chain follow-ups: accept at the prereq turn-in when hubs match.
      if (!aid || !pres.length || !ctx.dungeonStepById.has(aid)) continue;
      let matchedAnchor: string | undefined;
      for (const ti of block.turnins) {
        for (const sid of ti.dungeonStepIds) {
          const src = ctx.dungeonStepById.get(sid);
          if (!src || !questIdsOf(src, "turnin").some((turned) => pres.includes(turned))) continue;
          const names = [...placeNames(src), ...anchorPlaces(ctx, byId.get(ti.afterStepId), ti.afterStepId)];
          if (!giverMatchesPlace(q.giver, names)) continue;
          matchedAnchor = ti.afterStepId;
          break;
        }
        if (matchedAnchor) break;
      }
      if (!matchedAnchor) {
        // No same-hub follow-up — do not leave a dangling early pickup or name it on the run.
        // Keep true inside-during-run accepts (no post-run prereq turn-in) on the run.
        if (!inside.has(qid)) {
          relocate.add(aid);
          stripRun(block, qid);
        }
        continue;
      }
      // Always take chain follow-ups after the prereq turn-in, never as an early/on-run pickup.
      // Do not stripRun here: turn-ins for these quests must still emit; the run sentence already
      // omits them via acceptsEmittedByRace (they are not accepted yet at run time).
      relocate.add(aid);
      const b = ensure(matchedAnchor);
      if (b && !b.followupAccepts.includes(aid)) b.followupAccepts.push(aid);
    }
    if (relocate.size) {
      for (const list of batches.values()) {
        for (const b of list) {
          if (b.block !== block) continue;
          b.pickups = b.pickups.filter((id) => !relocate.has(id));
        }
      }
    }

    // Scholomance: 5529 only if giver is Undercity/Bulwark; offer 838 on the run when giver matches those hubs.
    if (block.run && block.dungeonId === "scholomance") {
      const runBatch = ensure(block.run.afterStepId);
      if (runBatch) {
        const kept: string[] = [];
        for (const sid of runBatch.pickups) {
          const src = ctx.dungeonStepById.get(sid);
          const qids = src ? questIdsOf(src, "accept") : [];
          if (qids.includes(5529)) {
            const q = dossier?.quests?.find((x) => x.questId === 5529);
            const hub = normPlace(q?.giver?.hub ?? q?.giver?.zone ?? "");
            if (!(hub.includes("undercity") || hub.includes("bulwark"))) {
              stripRun(block, 5529);
              continue;
            }
          }
          kept.push(sid);
        }
        runBatch.pickups = kept;
        const q838 = dossier?.quests?.find((x) => x.questId === 838);
        if (q838?.stepIds?.accept && block.includedQuestIds.includes(838)) {
          const hub = normPlace(q838.giver?.hub ?? q838.giver?.zone ?? "");
          if (hub.includes("undercity") || hub.includes("bulwark")) {
            if (!runBatch.pickups.includes(q838.stepIds.accept)) runBatch.pickups.push(q838.stepIds.accept);
          } else stripRun(block, 838);
        } else if (block.includedQuestIds.includes(838)) {
          stripRun(block, 838);
        }
      }
    }
  }

  const place = makePlaceEmitter(packId, ctx, stats, combos, emit);

  const emitAfter = (anchor: Step) => {
    const list = batches.get(anchor.id);
    if (!list?.length) return;
    list.sort((a, b) => a.levels0 - b.levels0 || a.dungeonId.localeCompare(b.dungeonId));
    // Phase order: pickups → prep → run → turn-ins (follow-up accepts interleaved before their turn-in).
    const phases: ("pickups" | "prep" | "run" | "turnins")[] = ["pickups", "prep", "run", "turnins"];
    for (const phase of phases) {
      for (const batch of list) {
        const block = batch.block;
        const dossier = ctx.dossiers?.get(block.dungeonId);
        const race = block.race;
        const raceF = raceFilterForBlock(block.dungeonId, race, {
          excludeRaces: siblingRaceKeys(ctx.plan, block.dungeonId, block.route, race),
        });
        const stripped = strippedForRun.get(block) ?? new Set<number>();
        if (phase === "pickups") {
          for (const sid of batch.pickups) {
            const src = ctx.dungeonStepById.get(sid);
            if (!src) {
              ctx.warnings.push(`${packId}: plan pickup step ${sid} missing from dungeons pack`);
              continue;
            }
            if (questIdsOf(src, "accept").some((q) => stripped.has(q))) continue;
            place({
              src,
              afterStepId: anchor.id,
              anchor,
              routes: [block.route],
              dungeonId: block.dungeonId,
              part: "pickup",
              filter: raceF,
              race,
              deferKey: `${block.dungeonId}|${block.route}|${block.race}`,
            });
          }
          // Retry deferred pickups only when this hub matches the dossier giver (not a later foreign run hub).
          const deferKey = `${block.dungeonId}|${block.route}|${block.race}`;
          const deferred = [...(ctx.deferredPickups?.get(deferKey) ?? [])];
          if (deferred.length) {
            ctx.deferredPickups?.delete(deferKey);
            const here = anchorPlaces(ctx, anchor, anchor.id);
            for (const sid of deferred) {
              const src = ctx.dungeonStepById.get(sid);
              if (!src) continue;
              const qids = questIdsOf(src, "accept");
              if (qids.some((q) => stripped.has(q))) continue;
              const qmeta = dossier?.quests?.find((q) => qids.includes(q.questId));
              if (qmeta && !giverMatchesPlace(qmeta.giver, here)) {
                // Wrong hub for this anchor — keep deferred for a later matching hub / run check.
                const list = ctx.deferredPickups?.get(deferKey) ?? [];
                if (!list.includes(sid)) {
                  list.push(sid);
                  ctx.deferredPickups?.set(deferKey, list);
                }
                continue;
              }
              // place() re-queues via deferKey when the prereq is still missing.
              place({
                src,
                afterStepId: anchor.id,
                anchor,
                routes: [block.route],
                dungeonId: block.dungeonId,
                part: "pickup",
                filter: raceF,
                race,
                deferKey,
              });
            }
          }
        } else if (phase === "prep" && batch.prep) {
          emitPrep(packId, ctx, stats, emit, {
            afterStepId: anchor.id,
            anchor,
            block,
            dossier,
            filter: raceF,
            race,
          });
        } else if (phase === "run" && batch.run && block.run) {
          emitRun(packId, ctx, stats, place, {
            afterStepId: block.run.afterStepId,
            anchor,
            block,
            dossier,
            filter: raceF,
            race,
            stripped,
          });
          // Retry deferred pickups only when the run hub matches the giver; otherwise drop them.
          const deferKey = `${block.dungeonId}|${block.route}|${block.race}`;
          const here = anchorPlaces(ctx, anchor, anchor.id);
          for (const sid of ctx.deferredPickups?.get(deferKey) ?? []) {
            const src = ctx.dungeonStepById.get(sid);
            if (!src) continue;
            const qids = questIdsOf(src, "accept");
            if (qids.some((q) => stripped.has(q))) continue;
            const qmeta = dossier?.quests?.find((q) => qids.includes(q.questId));
            if (qmeta && !giverMatchesPlace(qmeta.giver, here)) {
              for (const q of qids) stripRun(block, q);
              continue;
            }
            place({ src, afterStepId: anchor.id, anchor, routes: [block.route], dungeonId: block.dungeonId, part: "pickup", filter: raceF, race });
          }
          ctx.deferredPickups?.delete(deferKey);
        } else if (phase === "turnins") {
          const pendingFollowups = new Set(batch.followupAccepts);
          const questForAccept = (aid: string) => dossier?.quests?.find((q) => q.stepIds?.accept === aid);
          for (const sid of batch.turnins) {
            const src = ctx.dungeonStepById.get(sid);
            if (!src) {
              ctx.warnings.push(`${packId}: plan turnin step ${sid} missing from dungeons pack`);
              continue;
            }
            const emitted = raceBag(ctx.acceptsEmittedByRace?.[block.route], race);
            const turnedIds = questIdsOf(src, "turnin").filter((q) => !stripped.has(q));
            // A turn-in whose accept step exists but was never taken would block the real accept later
            // (seen turn-ins count as already done). Skip it instead of sending the player there.
            const unaccepted = turnedIds.filter((q) => {
              const meta = dossier?.quests?.find((x) => x.questId === q);
              return !!meta?.stepIds?.accept && !emitted.has(q);
            });
            if (turnedIds.length && unaccepted.length === turnedIds.length) continue;
            if (!turnedIds.length && questIdsOf(src, "turnin").length) continue;
            const placedTi = place({
              src: turnedIds.length && turnedIds.length < questIdsOf(src, "turnin").length
                ? { ...src, actions: src.actions.filter((a) => !(a.type === "turnin" && "questId" in a && typeof a.questId === "number" && stripped.has(a.questId))) }
                : src,
              afterStepId: anchor.id,
              anchor,
              routes: [block.route],
              dungeonId: block.dungeonId,
              part: "turnin",
              filter: raceF,
              race,
            });
            if (!placedTi) continue;
            const turned = new Set(questIdsOf(placedTi, "turnin"));
            for (const aid of [...pendingFollowups]) {
              const q = questForAccept(aid);
              const pres = q?.prerequisites ?? [];
              // Only after this turn-in, and only if every prerequisite was actually accepted earlier.
              if (!pres.length || !pres.some((p) => turned.has(p)) || !pres.every((p) => emitted.has(p))) continue;
              const aSrc = ctx.dungeonStepById.get(aid);
              if (!aSrc) continue;
              place({ src: aSrc, afterStepId: anchor.id, anchor, routes: [block.route], dungeonId: block.dungeonId, part: "pickup", filter: raceF, race });
              pendingFollowups.delete(aid);
            }
          }
        }
      }
    }
  };

  // Drop planned placeholders and their dungeonsOff partners; apply speedrun replaces; insert after anchors.
  const dropIds = new Set<string>();
  for (const s of steps) {
    const did = placeholderDungeonId(s);
    if (did && controlled.has(did)) {
      dropIds.add(s.id);
      stats.placeholdersDropped++;
      stats.placeholders++;
    }
  }
  for (const s of steps) {
    if (s.dungeonsOff && s.alternativeTo?.some((id) => dropIds.has(id))) {
      dropIds.add(s.id);
      stats.placeholdersDropped++;
    }
  }

  for (const s of steps) {
    if (dropIds.has(s.id)) continue;
    let step = s;
    if (replaces.has(s.id)) {
      const cur = new Set(s.dungeonsOffRoutes ?? []);
      cur.add("speedrun");
      step = { ...s, dungeonsOffRoutes: [...cur] as RouteStyle[] };
    }
    // Fallback: unplanned placeholders still use the legacy splice (no plan entry at all).
    const did = placeholderDungeonId(step);
    if (did && !controlled.has(did)) {
      expandOnePlaceholder(packId, step, steps, ctx, stats, combos, emit);
      emitAfter(step);
      continue;
    }
    emit(step);
    emitAfter(step);
  }

  // Count plan blocks that had at least one anchor in this pack (once per block globally).
  const seenBlocks = (ctx as ExpandContext & { _blockSeen?: Set<string> });
  seenBlocks._blockSeen ??= new Set();
  for (const b of touchedBlocks) {
    const key = `${b.dungeonId}|${b.route}|${b.race}`;
    if (seenBlocks._blockSeen.has(key)) continue;
    const anchors = [
      ...b.pickups.map((p) => p.afterStepId),
      b.prep?.afterStepId,
      b.run?.afterStepId,
      ...b.turnins.map((t) => t.afterStepId),
    ].filter(Boolean) as string[];
    if (!anchors.some((id) => byId.has(id))) continue;
    seenBlocks._blockSeen.add(key);
    ctx.anchorBlocksApplied = (ctx.anchorBlocksApplied ?? 0) + 1;
  }

  if (g) {
    const w = g.walk.find((p) => p.id === packId);
    if (w) w.steps = out;
  }
  return { steps: out, stats };
}

function emitPrep(
  packId: string,
  ctx: ExpandContext,
  stats: ExpandStats,
  emit: (s: Step) => void,
  args: {
    afterStepId: string;
    anchor: Step;
    block: PlanBlock;
    dossier: DungeonDossier | undefined;
    filter?: Filter;
    race: PlanRaceKey;
  },
): void {
  const { afterStepId, anchor, block, dossier, filter, race } = args;
  const id = prepStepId(afterStepId, block.dungeonId, race);
  const existing = ctx.insertedById?.get(id);
  if (existing) {
    existing.routes = unionRoutes(existing.routes, [block.route]);
    return;
  }
  if (ctx.usedIds.has(id)) {
    ctx.warnings.push(`${packId}: inserted step id ${id} already exists; skipped`);
    return;
  }
  const dungeon = ctx.dungeonStepById.get(dossier?.runStepId ?? "")?.dungeon
    ?? [...ctx.dungeonStepById.values()].find((s) => dungeonIdOf(s) === block.dungeonId)?.dungeon
    ?? { name: block.name, levels: block.levels };
  const text = dossier ? prepText(dossier, block.name) : `Prep for ${block.name}: repair, sell, restock, and form a group.`;
  const step: Step = {
    id,
    n: 0,
    section: anchor.section,
    tags: { dungeonId: block.dungeonId, dungeonPart: "prep", planRace: race } as Step["tags"],
    text: [{ segments: [{ t: text }] }],
    actions: [],
    conditions: [],
    routes: [block.route],
    dungeon,
    filter,
    sources: [{ url: "https://www.wowhead.com/classic", label: `${block.name} dossier prep` }],
    verified: false,
  };
  ctx.usedIds.add(id);
  ctx.insertedById?.set(id, step);
  stats.inserted++;
  stats.anchorInserted++;
  emit(step);
}

function emitRun(
  packId: string,
  ctx: ExpandContext,
  stats: ExpandStats,
  place: PlaceFn,
  args: {
    afterStepId: string;
    anchor: Step;
    block: PlanBlock;
    dossier: DungeonDossier | undefined;
    filter?: Filter;
    race: PlanRaceKey;
    stripped: Set<number>;
  },
): void {
  const { afterStepId, anchor, block, dossier, filter, race, stripped } = args;
  const runId = dossier?.runStepId ?? `dungeons:${block.dungeonId}:run`;
  const src = ctx.dungeonStepById.get(runId);
  if (!src) {
    ctx.warnings.push(`${packId}: plan run step ${runId} missing from dungeons pack`);
    return;
  }
  const names = questNameMap(dossier);
  const already = new Set(raceBag(ctx.acceptsEmittedByRace?.[block.route], race));
  // OrcTroll/all may have taken included quests on the leveling path (raceSeen skipped the dungeon copy).
  if (race === "OrcTroll" || race === "all") {
    for (const q of block.includedQuestIds) {
      if (ctx.seen.accepts[block.route].has(q)) already.add(q);
    }
  }
  const drop = new Set(stripped);

  // Zul'Farrak 3527 only if 3520 was turned in before this run for this race.
  if (block.includedQuestIds.includes(3527) || (block.run?.insideQuestIds ?? []).includes(3527)) {
    const turned3520 = ctx.raceSeen?.turnins[block.route]?.get(race)?.has(3520) ?? false;
    if (!turned3520) drop.add(3527);
  }

  // Inside accepts that still need a prior turn-in stay off the run unless that turn-in already happened.
  // (Accepting the prereq is not enough — Questie pre requires the turn-in.)
  for (const qid of block.run?.insideQuestIds ?? []) {
    if (drop.has(qid)) continue;
    const q = dossier?.quests?.find((x) => x.questId === qid);
    const pres = q?.prerequisites ?? [];
    if (!pres.length) continue;
    const done = pres.every((p) => ctx.raceSeen?.turnins[block.route]?.get(race)?.has(p));
    // 5251/7044 complete during the run — still do not auto-accept follow-ups that need a post-run hub.
    if (qid === 5262 || qid === 5263 || qid === 7046) {
      drop.add(qid);
      continue;
    }
    if (!done) drop.add(qid);
  }

  // Tauren 5724 on-run accept only when giver hub matches Thunder Bluff or this run step.
  if ((block.run?.insideQuestIds ?? []).includes(5724)) {
    const q = dossier?.quests?.find((x) => x.questId === 5724);
    const here = anchorPlaces(ctx, anchor, afterStepId);
    if (!giverMatchesPlace(q?.giver, here) && !giverMatchesPlace(q?.giver, ["thunder bluff"])) drop.add(5724);
  }

  const included: string[] = [];
  const seenNames = new Set<string>();
  for (const q of block.includedQuestIds) {
    if (NO_RUN_SENTENCE.has(q) || drop.has(q) || !already.has(q)) continue;
    // Handed in before the run (plan turn-in with beforeRun, e.g. ZF 3520): not "in your log" any more.
    if (ctx.raceSeen?.turnins[block.route]?.get(race)?.has(q)) continue;
    const name = names.get(q) ?? `#${q}`;
    if (seenNames.has(name)) continue;
    seenNames.add(name);
    included.push(name);
  }
  const minGo = block.levels[0] + 2;
  const est = block.run?.estLevel ?? minGo;
  const have = included.length ? included.join(", ") : "your dungeon quests";
  const prepend = `You are about level ${est} (go at ${minGo} or higher). Good moment to run ${block.name}; you already have: ${have}.`;
  const inside = new Set((block.run?.insideQuestIds ?? []).filter((q) => !drop.has(q)));
  const keepQ = new Set([...block.includedQuestIds.filter((q) => !drop.has(q)), ...inside]);
  let actions = src.actions.filter((a) => {
    if (!("questId" in a) || typeof a.questId !== "number") return true;
    if (drop.has(a.questId)) return false;
    if (a.type === "accept") return inside.has(a.questId);
    // Complete/collect only for quests this race already has (or takes inside).
    // `mob` has no questId, so it already returned above.
    if (a.type === "complete") return already.has(a.questId) || inside.has(a.questId);
    if (a.type === "collect") return already.has(a.questId) || inside.has(a.questId);
    return keepQ.size === 0 || keepQ.has(a.questId);
  });
  // Fold inside-accept actions from the dungeon pack onto the run (no travel pickup).
  for (const qid of inside) {
    if (actions.some((a) => a.type === "accept" && "questId" in a && a.questId === qid)) continue;
    const acceptId = dossier?.quests?.find((q) => q.questId === qid)?.stepIds?.accept;
    const acceptSrc = acceptId ? ctx.dungeonStepById.get(acceptId) : undefined;
    if (!acceptSrc) continue;
    for (const a of acceptSrc.actions) {
      if (a.type === "accept" && "questId" in a && a.questId === qid) actions = [...actions, a];
    }
  }
  place({
    src,
    afterStepId,
    anchor,
    routes: [block.route],
    dungeonId: block.dungeonId,
    part: "run",
    filter,
    race,
    textPrepend: prepend,
    actions,
  });
  void stats;
  void packId;
}
