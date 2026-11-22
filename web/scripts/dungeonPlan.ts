/**
 * Integration-plan types, loaders, race filters, and validators for anchor-based dungeon insertion.
 * Plan/dossiers live under research/dungeons/; route-timeline.json supplies pack order / zone / hubs.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Filter, RaceKey, RouteStyle } from "../../contracts/schema.ts";

export type DungeonPart = "pickup" | "prep" | "run" | "turnin";
export type PlanRaceKey = "all" | "OrcTroll" | "Tauren" | "Undead" | "Skyborne" | string;

export interface PlanPickup {
  afterStepId: string;
  questIds: number[];
  dungeonStepIds: string[];
}

export interface PlanPrep {
  afterStepId: string;
  estLevel: number;
}

export interface PlanRun {
  afterStepId: string;
  estLevel: number;
  insideQuestIds?: number[];
}

export interface PlanTurnin {
  afterStepId: string;
  questIds: number[];
  dungeonStepIds: string[];
  sameHub?: boolean;
}

export interface PlanRaceBlock {
  includedQuestIds?: number[];
  droppedQuestIds?: { questId: number; why?: string }[];
  pickups?: PlanPickup[];
  prep?: PlanPrep;
  run?: PlanRun;
  turnins?: PlanTurnin[];
  /**
   * 1-20 run. When `earlyRun.afterStepId` is already a guide step, it replaces `run`
   * (and prep / pickups / turn-ins that sat on the later anchor). The later `run` is not inserted.
   */
  earlyRun?: PlanRun;
  earlyPrep?: PlanPrep;
  /** Pickup groups whose `afterStepId` should move onto `earlyRun` when the early anchor exists. */
  movePickupsFrom?: string[];
}

export interface PlanRouteBlock {
  byRace?: Record<string, PlanRaceBlock>;
  replaces?: string[];
}

export interface PlanDungeon {
  id: string;
  placement?: string;
  runAt?: number;
  levels: [number, number];
  byRoute: Partial<Record<RouteStyle, PlanRouteBlock>>;
}

export interface IntegrationPlan {
  _meta?: {
    dropped?: { id: string; route?: string; race?: string; why?: string }[];
    notes?: string[];
  };
  dungeons: PlanDungeon[];
}

export interface DossierQuest {
  questId: number;
  name?: string;
  giver?: { npc?: string; zone?: string; hub?: string | null; at?: unknown };
  turnIn?: { npc?: string; zone?: string; hub?: string | null; at?: unknown };
  itemStartInside?: boolean;
  stepIds?: { accept?: string | null; turnin?: string | null };
  prerequisites?: number[];
}

export interface DossierPrep {
  group?: string;
  consumables?: string[];
  hearth?: string;
  warnings?: string[];
  classQuests?: unknown[];
  keys?: string[];
}

export interface DungeonDossier {
  id: string;
  name: string;
  levels?: [number, number];
  runStepId?: string;
  quests?: DossierQuest[];
  prep?: DossierPrep;
  keys?: { name?: string; note?: string }[] | string[];
}

export interface TimelineStep {
  id: string;
  pack: string;
  zone?: string | null;
  hubs?: string[];
  n?: number;
  estLevel?: {
    balanced?: number;
    speedrun?: number;
    calibrated?: { balanced?: number; speedrun?: number };
  };
}

export interface RouteTimeline {
  packs: { id: string; file?: string; steps: TimelineStep[] }[];
}

/** One concrete race×route insertion block from the plan. */
export interface PlanBlock {
  dungeonId: string;
  name: string;
  levels: [number, number];
  route: RouteStyle;
  race: PlanRaceKey;
  includedQuestIds: number[];
  pickups: PlanPickup[];
  prep?: PlanPrep;
  run?: PlanRun;
  turnins: PlanTurnin[];
  earlyRun?: PlanRun;
  earlyPrep?: PlanPrep;
  movePickupsFrom?: string[];
  /** Set once `earlyRun` has replaced the later anchor so a second pack does not insert it. */
  earlyApplied?: boolean;
}

export function loadIntegrationPlan(researchDir: string): IntegrationPlan | undefined {
  const path = join(researchDir, "dungeons", "integration-plan.json");
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf-8")) as IntegrationPlan;
}

export function loadDossiers(researchDir: string): Map<string, DungeonDossier> {
  const dir = join(researchDir, "dungeons", "dossiers");
  const out = new Map<string, DungeonDossier>();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const d = JSON.parse(readFileSync(join(dir, f), "utf-8")) as DungeonDossier;
    if (d?.id) out.set(d.id, d);
  }
  return out;
}

export function loadRouteTimeline(researchDir: string): RouteTimeline | undefined {
  const path = join(researchDir, "dungeons", "route-timeline.json");
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf-8")) as RouteTimeline;
}

/** Flatten plan into concrete blocks (skips route/race with no byRace entry). */
export function flattenPlanBlocks(plan: IntegrationPlan, dossiers: Map<string, DungeonDossier>): PlanBlock[] {
  const out: PlanBlock[] = [];
  for (const d of plan.dungeons) {
    const dossier = dossiers.get(d.id);
    for (const route of ["balanced", "speedrun"] as RouteStyle[]) {
      const rb = d.byRoute?.[route];
      if (!rb?.byRace) continue;
      for (const [race, block] of Object.entries(rb.byRace)) {
        if (!block) continue;
        out.push({
          dungeonId: d.id,
          name: dossier?.name ?? d.id,
          levels: d.levels,
          route,
          race,
          includedQuestIds: block.includedQuestIds ?? [],
          pickups: block.pickups ?? [],
          prep: block.prep,
          run: block.run,
          turnins: block.turnins ?? [],
          earlyRun: block.earlyRun,
          earlyPrep: block.earlyPrep,
          movePickupsFrom: block.movePickupsFrom,
        });
      }
    }
  }
  return out;
}

/** Dungeon ids that must never expand from leftovers (planned or explicitly dropped). */
export function planControlledDungeonIds(plan: IntegrationPlan): Set<string> {
  const ids = new Set<string>();
  for (const d of plan.dungeons) ids.add(d.id);
  for (const drop of plan._meta?.dropped ?? []) if (drop.id) ids.add(drop.id);
  return ids;
}

/** speedrun.replaces step ids across the plan. */
export function speedrunReplaceIds(plan: IntegrationPlan): Set<string> {
  const ids = new Set<string>();
  for (const d of plan.dungeons) {
    for (const id of d.byRoute?.speedrun?.replaces ?? []) ids.add(id);
  }
  return ids;
}

/** Race key → Filter. "all" → undefined (no race gate). */
export function raceFilterFor(race: PlanRaceKey): Filter | undefined {
  if (race === "all") return undefined;
  if (race === "OrcTroll") return { any: [[{ race: "Orc" }], [{ race: "Troll" }]] };
  return { any: [[{ race: race as RaceKey }]] };
}

/**
 * Race filter for a plan block. When `race === "all"` and other byRace keys exist for the same
 * dungeon/route, exclude those races so Tauren/Undead/… keep only their race-specific copy
 * (matchesFilter treats `{race, not:true}` correctly).
 */
export function raceFilterForBlock(
  dungeonId: string,
  race: PlanRaceKey,
  opts?: { excludeRaces?: PlanRaceKey[] },
): Filter | undefined {
  if (race !== "all") return raceFilterFor(race);
  const exclude = new Set(opts?.excludeRaces ?? []);
  if (dungeonId === "ruins-of-lordaeron") exclude.add("Undead");
  if (!exclude.size) return undefined;
  // One AND-group per exclusion would OR them (match if any exclusion holds). We need AND of
  // all exclusions: player must be not-Undead AND not-Tauren AND … → one group with every not-term.
  const group: Filter["any"][number] = [];
  for (const r of exclude) {
    if (r === "all") continue;
    if (r === "OrcTroll") {
      // Excluding the OrcTroll block means the all-block is for everyone else; Orc/Troll still
      // match `all` unless we exclude both. Prefer excluding named single races only.
      continue;
    }
    group.push({ race: r as RaceKey, not: true });
  }
  return group.length ? { any: [group] } : undefined;
}

/** Other byRace keys on the same dungeon/route (for excluding them from the `all` block). */
export function siblingRaceKeys(plan: IntegrationPlan | undefined, dungeonId: string, route: RouteStyle, self: PlanRaceKey): PlanRaceKey[] {
  if (!plan || self !== "all") return [];
  const d = plan.dungeons.find((x) => x.id === dungeonId);
  const keys = Object.keys(d?.byRoute?.[route]?.byRace ?? {});
  return keys.filter((k) => k !== "all");
}

/** Calibrated estLevel for a timeline step on a route, when present. */
export function calibratedLevelOf(
  timeline: RouteTimeline | undefined,
  stepId: string,
  route: RouteStyle,
): number | undefined {
  if (!timeline) return undefined;
  for (const p of timeline.packs) {
    const s = p.steps.find((x) => x.id === stepId);
    if (!s) continue;
    const c = s.estLevel?.calibrated?.[route];
    if (typeof c === "number") return c;
    const raw = s.estLevel?.[route];
    return typeof raw === "number" ? raw : undefined;
  }
  return undefined;
}

/**
 * Intersection of two Filters: player must match both.
 * Cartesian product of AND-groups (OR-of-AND ∧ OR-of-AND).
 */
export function intersectFilters(a: Filter | undefined, b: Filter | undefined): Filter | undefined {
  if (!a?.any?.length) return b;
  if (!b?.any?.length) return a;
  const any: Filter["any"] = [];
  for (const ga of a.any) for (const gb of b.any) any.push([...ga, ...gb]);
  return { any };
}

export function questNameMap(dossier: DungeonDossier | undefined): Map<number, string> {
  const m = new Map<number, string>();
  for (const q of dossier?.quests ?? []) if (q.name) m.set(q.questId, q.name);
  return m;
}

/** True when text is safe for player-facing UI (no quest-data product name). */
function playerFacing(s: string): boolean {
  return !!s && !/questie/i.test(s);
}

/** Build the single short prep step text from a dossier. */
export function prepText(dossier: DungeonDossier, dungeonName: string): string {
  const p = dossier.prep ?? {};
  const parts: string[] = [];
  parts.push(`Prep for ${dungeonName}: repair and sell`);
  if (p.hearth && playerFacing(p.hearth)) parts.push(`set hearth to ${p.hearth}`);
  if (p.consumables?.length) {
    const cons = p.consumables.filter(playerFacing);
    if (cons.length) parts.push(`bring ${cons.join(", ")}`);
  }
  let line = parts.join("; ") + ".";
  if (p.group && playerFacing(p.group)) line += ` ${p.group}`;
  // One short key line — names only, skip research notes.
  const keyNames = (dossier.keys ?? [])
    .map((k) => (typeof k === "string" ? k : k.name ?? ""))
    .map((s) => s.trim())
    .filter(playerFacing);
  if (keyNames.length) line += ` Keys: ${keyNames.slice(0, 2).join("; ")}.`;
  const tip = (p.warnings ?? []).find(playerFacing);
  if (tip) {
    // Keep the step short: first sentence of the first clean warning.
    const short = tip.split(/(?<=\.)\s+/)[0] ?? tip;
    if (short.length <= 180) line += ` ${short}`;
  }
  return line.replace(/\s+/g, " ").trim();
}

/** Global step order index from route-timeline packs (concatenated). */
export function timelineOrder(timeline: RouteTimeline): Map<string, { index: number; zone?: string | null; hubs: string[]; pack: string }> {
  const m = new Map<string, { index: number; zone?: string | null; hubs: string[]; pack: string }>();
  let i = 0;
  for (const pack of timeline.packs) {
    for (const s of pack.steps) {
      m.set(s.id, { index: i++, zone: s.zone, hubs: s.hubs ?? [], pack: pack.id });
    }
  }
  return m;
}

export interface PlanValidationError {
  code: string;
  message: string;
}

/**
 * Fail-the-build checks for the integration plan.
 * Trusts plan estLevel; uses route-timeline for order / zone / hubs.
 */
export function validateDungeonPlan(
  plan: IntegrationPlan,
  dossiers: Map<string, DungeonDossier>,
  timeline: RouteTimeline | undefined,
): PlanValidationError[] {
  const errors: PlanValidationError[] = [];
  const order = timeline ? timelineOrder(timeline) : new Map();
  const blocks = flattenPlanBlocks(plan, dossiers);

  for (const b of blocks) {
    if (b.run && b.run.estLevel < b.levels[0] + 2) {
      errors.push({
        code: "run-level-too-low",
        message: `${b.dungeonId}/${b.route}/${b.race}: run.estLevel ${b.run.estLevel} < levels[0]+2 (${b.levels[0] + 2})`,
      });
    }
    const runId = b.run?.afterStepId;
    const runIdx = runId != null ? order.get(runId)?.index : undefined;

    for (const pu of b.pickups) {
      if (runId && pu.afterStepId === runId) continue;
      if (runIdx == null) continue;
      const puIdx = order.get(pu.afterStepId)?.index;
      if (puIdx == null) {
        errors.push({
          code: "pickup-anchor-missing",
          message: `${b.dungeonId}/${b.route}/${b.race}: pickup afterStepId ${pu.afterStepId} not in route-timeline`,
        });
        continue;
      }
      if (!(puIdx < runIdx)) {
        errors.push({
          code: "pickup-after-run",
          message: `${b.dungeonId}/${b.route}/${b.race}: pickup ${pu.afterStepId} is not strictly before run ${runId}`,
        });
      }
    }

    for (const ti of b.turnins) {
      if (!runId || runIdx == null) continue;
      if (ti.afterStepId === runId && ti.sameHub) continue;
      if (ti.afterStepId === runId) continue; // same id allowed even without sameHub flag for ordering
      const tiIdx = order.get(ti.afterStepId)?.index;
      if (tiIdx == null) {
        errors.push({
          code: "turnin-anchor-missing",
          message: `${b.dungeonId}/${b.route}/${b.race}: turnin afterStepId ${ti.afterStepId} not in route-timeline`,
        });
        continue;
      }
      // Turn-in before run is illegal unless sameHub and same id (handled above).
      if (tiIdx < runIdx) {
        errors.push({
          code: "turnin-before-run",
          message: `${b.dungeonId}/${b.route}/${b.race}: turnin ${ti.afterStepId} is before run ${runId}`,
        });
      }
    }

    // Pickup hub/zone vs dossier giver
    const dossier = dossiers.get(b.dungeonId);
    if (!dossier || !timeline) continue;
    const dungeonName = (dossier.name ?? b.dungeonId).toLowerCase();
    const hubsInZone = new Map<string, Set<string>>();
    for (const pack of timeline.packs) {
      for (const s of pack.steps) {
        const z = (s.zone ?? "").toLowerCase();
        if (!z) continue;
        let set = hubsInZone.get(z);
        if (!set) {
          set = new Set();
          hubsInZone.set(z, set);
        }
        for (const h of s.hubs ?? []) set.add(h.toLowerCase());
      }
    }
    const qById = new Map((dossier.quests ?? []).map((q) => [q.questId, q]));
    for (const pu of b.pickups) {
      const anchor = order.get(pu.afterStepId);
      if (!anchor) continue;
      for (const qid of pu.questIds) {
        const q = qById.get(qid);
        if (!q) continue;
        const hub = (q.giver?.hub ?? "").trim();
        const zone = (q.giver?.zone ?? "").trim();
        // Skip inside starts: empty hub + itemStartInside, or giver zone is the instance itself.
        if (q.itemStartInside && !hub) continue;
        if (zone && zone.toLowerCase() === dungeonName) continue;
        if (!hub && !zone) continue;
        const hubs = anchor.hubs ?? [];
        const az = anchor.zone ?? "";
        const azL = az.toLowerCase();
        const hubL = hub.toLowerCase();
        const zoneL = zone.toLowerCase();
        const hubOk =
          !!hub &&
          (hubs.some((h: string) => h.toLowerCase() === hubL) ||
            azL === hubL ||
            (azL !== "" && (hubsInZone.get(azL)?.has(hubL) ?? false)));
        const zoneOk =
          !!zone && (azL === zoneL || hubs.some((h: string) => h.toLowerCase() === zoneL));
        if (!(hubOk || zoneOk)) {
          errors.push({
            code: "pickup-hub-mismatch",
            message: `${b.dungeonId}/${b.route}/${b.race}: pickup quest ${qid} giver hub/zone (${hub || "∅"}/${zone || "∅"}) does not match anchor ${pu.afterStepId} (${az}; hubs=${hubs.join("|") || "∅"})`,
          });
        }
      }
    }
  }
  return errors;
}

/**
 * After expansion: every built pickup step (tags.dungeonPart === "pickup") must sit on an
 * anchor whose timeline zone/hubs match the dossier giver. Plan-file checks alone miss
 * expander deferrals that move accepts onto a foreign run hub.
 */
export function assertBuiltPickupHubs(
  dossiers: Map<string, DungeonDossier>,
  timeline: RouteTimeline | undefined,
  levelingSteps: readonly {
    id: string;
    tags?: { dungeonPart?: string; dungeonId?: string; expandedFrom?: string };
    actions?: { type: string; questId?: number; at?: { zone?: string } }[];
  }[],
): PlanValidationError[] {
  if (!timeline) return [];
  const errors: PlanValidationError[] = [];
  const order = timelineOrder(timeline);
  const hubsInZone = new Map<string, Set<string>>();
  for (const pack of timeline.packs) {
    for (const s of pack.steps) {
      const z = (s.zone ?? "").toLowerCase();
      if (!z) continue;
      let set = hubsInZone.get(z);
      if (!set) {
        set = new Set();
        hubsInZone.set(z, set);
      }
      for (const h of s.hubs ?? []) set.add(h.toLowerCase());
    }
  }
  for (const step of levelingSteps) {
    if (step.tags?.dungeonPart !== "pickup") continue;
    const dungeonId = step.tags.dungeonId;
    if (!dungeonId) continue;
    const dossier = dossiers.get(dungeonId);
    if (!dossier) continue;
    const dungeonName = (dossier.name ?? dungeonId).toLowerCase();
    const anchorId = step.tags.expandedFrom ?? step.id.split("+")[0];
    if (!anchorId) continue;
    const anchor = order.get(anchorId);
    if (!anchor) continue;
    const qById = new Map((dossier.quests ?? []).map((q) => [q.questId, q]));
    const qids = (step.actions ?? [])
      .filter((a) => a.type === "accept" && typeof a.questId === "number")
      .map((a) => a.questId as number);
    for (const qid of qids) {
      const q = qById.get(qid);
      if (!q) continue;
      const hub = (q.giver?.hub ?? "").trim();
      const zone = (q.giver?.zone ?? "").trim();
      if (q.itemStartInside && !hub) continue;
      if (zone && zone.toLowerCase() === dungeonName) continue;
      if (!hub && !zone) continue;
      const hubs = anchor.hubs ?? [];
      const az = anchor.zone ?? "";
      const azL = az.toLowerCase();
      const hubL = hub.toLowerCase();
      const zoneL = zone.toLowerCase();
      const hubOk =
        !!hub &&
        (hubs.some((h: string) => h.toLowerCase() === hubL) ||
          azL === hubL ||
          (azL !== "" && (hubsInZone.get(azL)?.has(hubL) ?? false)));
      const zoneOk = !!zone && (azL === zoneL || hubs.some((h: string) => h.toLowerCase() === zoneL));
      const gotoOk = (step.actions ?? []).some((a) => {
        const z = a.at?.zone?.toLowerCase() ?? "";
        return a.type === "goto" && !!z && (z === hubL || z === zoneL);
      });
      if (!(hubOk || zoneOk || gotoOk)) {
        errors.push({
          code: "built-pickup-hub-mismatch",
          message: `${dungeonId}: built pickup ${step.id} quest ${qid} giver hub/zone (${hub || "∅"}/${zone || "∅"}) does not match anchor ${anchorId} (${az}; hubs=${hubs.join("|") || "∅"})`,
        });
      }
    }
  }
  return errors;
}

/**
 * After expansion: every plan block with run.afterStepId must produce a built leveling step
 * whose id contains that anchor and ":run", with routes including the block's route.
 */
export function assertPlannedRunsPresent(
  plan: IntegrationPlan,
  dossiers: Map<string, DungeonDossier>,
  levelingSteps: readonly { id: string; routes?: RouteStyle[] }[],
): PlanValidationError[] {
  const errors: PlanValidationError[] = [];
  const byId = new Map(levelingSteps.map((s) => [s.id, s]));
  const blocks = flattenPlanBlocks(plan, dossiers);
  const seen = new Set<string>();
  for (const b of blocks) {
    if (!b.run?.afterStepId) continue;
    const dossier = dossiers.get(b.dungeonId);
    const runSrc = dossier?.runStepId ?? `dungeons:${b.dungeonId}:run`;
    const earlyHit =
      b.earlyRun &&
      levelingSteps.some(
        (s) => s.id.startsWith(`${b.earlyRun!.afterStepId}+`) && s.id.includes(":run") && s.id.includes(b.dungeonId),
      );
    const anchorId = earlyHit ? b.earlyRun!.afterStepId : b.run.afterStepId;
    const id = `${anchorId}+${runSrc}`;
    const key = `${id}|${b.route}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const step = byId.get(id);
    // Also accept forever-prefixed run ids if the dossier points there.
    const alt =
      step ??
      levelingSteps.find(
        (s) =>
          s.id.startsWith(`${anchorId}+`) &&
          s.id.includes(":run") &&
          (s.id.includes(b.dungeonId) || s.id.includes(runSrc)),
      );
    const found = step ?? alt;
    if (!found) {
      errors.push({
        code: "planned-run-missing",
        message: `${b.dungeonId}/${b.route}/${b.race}: planned run after ${anchorId} missing (expected id ${id})`,
      });
      continue;
    }
    const routes = found.routes?.length ? found.routes : (["balanced", "speedrun"] as RouteStyle[]);
    if (!routes.includes(b.route)) {
      errors.push({
        code: "planned-run-route",
        message: `${b.dungeonId}/${b.route}/${b.race}: run step ${found.id} routes [${routes.join(",")}] missing ${b.route}`,
      });
    }
  }
  return errors;
}
