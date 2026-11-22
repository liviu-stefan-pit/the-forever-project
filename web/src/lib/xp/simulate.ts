/**
 * Route XP simulator. Default is worst case: no rested, no food, no sleeping bag.
 * Pass `xpMods` to recompute with Well Fed, rested, and Cozy Sleeping Bag.
 *
 * Pure: given guides + quest/npc tables, walk each 1–60 chain × route style
 * with dungeons off and attach `step.sim[mode]`. Shared packs keep the chain
 * that arrives at the pack with the lowest fractional level.
 */
import type { Action, Guide, RouteStyle, Step, StepSim } from "../../data/schema";
import { HORDE_20_60_PACKS, ROUTE_CHAINS } from "../routeChains.ts";
import { applyXpMods, grindKillXpForGap, initialRestedPool, type XpMods } from "./mods.ts";
import { mobsForGap, mobXp, questXpForPlayer, xpToNext } from "./rules.ts";

export { applyXpMods, grindKillXpForGap, initialRestedPool, killPercentMultiplier, questPercentMultiplier, wellRestedFactor, wellRestedRank } from "./mods.ts";
export type { ApplyXpModsCtx, ApplyXpModsResult, GrindKillCtx, XpMods } from "./mods.ts";

export const TOTAL_XP_1_TO_60 = 4084700;
export const ROUTES: readonly RouteStyle[] = ["balanced", "speedrun"];

/** Same override ids as `web/scripts/build-data.ts` (`XP_CORRECT_QUESTS`). */
const XP_CORRECT_QUESTS = new Set([421, 8410]);

/**
 * Questie creature rank (sample from content/questie-db/npcs.json):
 * omitted = normal, 1 = elite (Hogger), 2 = rareelite (Marisa du'Paige),
 * 3 = worldboss (Thrall / Azuregos), 4 = rare (Thuros Lightfingers).
 * Kill XP doubles only elite / rareelite (1 and 2).
 */
export const NPC_RANK_SAMPLE = {
  omitted: "normal (most trash; rank field dropped when 0)",
  1: { example: "Hogger (448)", meaning: "elite" },
  2: { example: "Marisa du'Paige (599)", meaning: "rareelite" },
  3: { example: "Thrall (4949)", meaning: "worldboss" },
  4: { example: "Thuros Lightfingers (61)", meaning: "rare" },
} as const;

export function isEliteRank(rank: number | undefined): boolean {
  return rank === 1 || rank === 2;
}

/**
 * Dungeons-off filter, matching `dungeonMode` / `isDungeonHidden` in
 * `web/src/state/visibility.ts` (that module imports React, so it is mirrored).
 *
 * Hidden when `dungeonMode === "on"`: `step.dungeon` set, or a `.dungeon X`
 * condition whose args do not start with `!`. Open-world alternatives
 * (`dungeonsOff`, `.dungeon !X`) stay visible. `dungeonsOffRoutes` is ignored
 * while dungeons are off. `tags.dungeonPart` never hides a step.
 * The dungeon pack (`research/dungeons/steps-v2.json`) is not in any chain.
 */
export function dungeonMode(step: Step): "on" | "off" | "any" {
  if (step.dungeon) return "on";
  if (step.dungeonsOff) return "off";
  const c = step.conditions?.find((x) => x.cmd === "dungeon");
  if (!c) return "any";
  return /^\s*!/.test(c.args) ? "off" : "on";
}

export function stepRoutes(step: Step): RouteStyle[] {
  if (step.routes && step.routes.length) return step.routes;
  return step.bonus ? ["balanced"] : ["balanced", "speedrun"];
}

export function stepVisibleDungeonsOff(step: Step, mode: RouteStyle): boolean {
  if (dungeonMode(step) === "on") return false;
  return stepRoutes(step).includes(mode);
}

/** Dungeons-on walk: include dungeon steps, hide dungeons-off alternatives and `dungeonsOffRoutes`. */
export function stepVisibleDungeonsOn(step: Step, mode: RouteStyle): boolean {
  if (dungeonMode(step) === "off") return false;
  if (step.dungeonsOffRoutes?.includes(mode)) return false;
  return stepRoutes(step).includes(mode);
}

export interface SimQuest {
  id: number;
  name?: string;
  level: number;
  reqLevel: number;
  xp?: number;
  objectives?: {
    creatures?: { id: number; count?: number }[];
    items?: { id: number; count?: number }[];
  };
  objectivesText?: string[];
}

export interface SimNpc {
  id: number;
  name?: string;
  minLevel?: number;
  maxLevel?: number;
  rank?: number;
  /** Questie `friendlyToFaction`: A / H / AH. Omitted on most hostiles. */
  friendly?: string;
  spawns?: Record<string, [number, number][]>;
  services?: string[];
  zoneId?: number;
}

export interface SimItem {
  id: number;
  name?: string;
  npcDrops?: number[];
  /** Present only if a source actually recorded a rate. Questie items.json has none. */
  dropChance?: number;
}

export interface QuestXpOverride {
  xp?: number;
}

export function resolveQuestFullXp(id: number, dbXp: number | undefined, overrides: Record<string, QuestXpOverride>): number | undefined {
  const ov = overrides[String(id)];
  let xp = dbXp;
  if (ov?.xp != null && (xp == null || XP_CORRECT_QUESTS.has(id))) xp = ov.xp;
  return xp;
}

export function fractionalLevel(level: number, xpInto: number): number {
  if (level >= 60) return 60;
  const need = xpToNext(level);
  if (need <= 0) return level;
  return Math.round((level + xpInto / need) * 100) / 100;
}

export interface XpState {
  level: number;
  xpInto: number;
  total: number;
}

function addXp(state: XpState, amount: number): number {
  if (amount <= 0 || state.level >= 60) return 0;
  let leveledTo = 0;
  let left = amount;
  while (left > 0 && state.level < 60) {
    const need = xpToNext(state.level);
    if (need <= 0) {
      state.level = 60;
      state.xpInto = 0;
      break;
    }
    const room = need - state.xpInto;
    if (left < room) {
      state.xpInto += left;
      state.total += left;
      left = 0;
    } else {
      state.total += room;
      left -= room;
      state.xpInto = 0;
      state.level += 1;
      leveledTo = state.level;
      if (state.level >= 60) {
        state.level = 60;
        state.xpInto = 0;
        left = 0;
      }
    }
  }
  return leveledTo;
}

function xpToReach(state: XpState, targetLevel: number, targetXpInto: number): number {
  let toL = Math.min(60, Math.max(1, Math.floor(targetLevel)));
  let toXp = toL >= 60 ? 0 : Math.max(0, targetXpInto);
  if (state.level > toL || (state.level === toL && state.xpInto >= toXp) || state.level >= 60) return 0;
  if (state.level === toL) return toXp - state.xpInto;
  let sum = xpToNext(state.level) - state.xpInto;
  for (let l = state.level + 1; l < toL; l++) sum += xpToNext(l);
  if (toL < 60) sum += toXp;
  return Math.max(0, sum);
}

const KILL_VERB = /\b(kill|slay|dispatch|defeat|destroy|eliminate|slaughter|hunt)\b/i;
const TALK_USE = /\b(speak to|talk to|heal|use |find |wake up|blackjack)\b/i;
const ITEM_VERB = /\b(collect|get|bring|loot|retrieve|gather|obtain|recover)\b/i;
const UNIQUE_TITLE = /^(Lieutenant|Captain|Cannoneer|Sergeant|Commander|Warlord|Baron|Lord|Lady|King|Prince|Private|Scout|Agent)\b/i;
const GENERIC_MOB = /\b(Sailors?|Marines?|Soldiers?|Workers?|Guards?|Peons?|Bandits?|Gnolls?|Spiders?|Wolves|Wolf|Boars?|Raptors?|Beasts?|Watchers?|Shamans?|Arcanists?|Reanimators?|Prowlers?|Hatchlings?|Drones?)\b/i;

/** Strip collect/get N-item clauses so medal counts are not treated as kill counts. */
function stripItemCountClauses(line: string): string {
  return line.replace(
    /\b(?:collect|get|bring|loot|retrieve|gather|obtain|recover)\s+\d+\s+[A-Za-z][\w' -]*?(?=\s+(?:and|then|,|\.|$))/gi,
    "",
  );
}

export function parseKillNumbers(texts: readonly string[]): number[] {
  const out: number[] = [];
  for (const line of texts) {
    const stripped = stripItemCountClauses(line);
    if (!KILL_VERB.test(stripped)) continue;
    for (const m of stripped.matchAll(/\d+/g)) {
      const n = Number(m[0]);
      if (n > 0) out.push(n);
    }
  }
  return out;
}

export function parseItemCounts(texts: readonly string[]): number[] {
  const out: number[] = [];
  for (const line of texts) {
    if (!ITEM_VERB.test(line)) continue;
    for (const m of line.matchAll(/\b(?:collect|get|bring|loot|retrieve|gather|obtain|recover)\s+(\d+)\b/gi)) {
      const n = Number(m[1]);
      if (n > 0) out.push(n);
    }
  }
  return out;
}

export function isTalkUseObjective(texts: readonly string[]): boolean {
  const t = texts.join(" ");
  if (KILL_VERB.test(t)) return false;
  return TALK_USE.test(t);
}

export function npcSpawnCount(npc: SimNpc | undefined): number {
  if (!npc?.spawns) return 0;
  let n = 0;
  for (const pts of Object.values(npc.spawns)) n += pts.length;
  return n;
}

/** Horde-friendly NPCs you should not grind or credit as kills. AH beasts without services stay hostile. */
export function isHordeFriendlyNpc(npc: SimNpc | undefined): boolean {
  if (!npc) return false;
  if (npc.friendly === "H") return true;
  if (npc.friendly === "AH" && (npc.services?.length ?? 0) > 0) return true;
  return false;
}

export function looksNamedUnique(npc: SimNpc | undefined): boolean {
  const name = npc?.name ?? "";
  if (!name) return false;
  if (UNIQUE_TITLE.test(name)) return true;
  if (GENERIC_MOB.test(name)) return false;
  return npcSpawnCount(npc) === 1 && /[A-Z][a-z]+ \S/.test(name);
}

export function creatureKillCount(
  creature: { id: number; count?: number },
  texts: readonly string[],
  index: number,
  total: number,
  npc?: SimNpc,
): number | undefined {
  if (isTalkUseObjective(texts)) return 0;
  if (typeof creature.count === "number" && creature.count > 0) return creature.count;
  const nums = parseKillNumbers(texts);
  if (total === 1 && nums.length >= 1) return nums[0];
  if (index < nums.length) return nums[index];
  if (looksNamedUnique(npc)) return 1;
  return undefined;
}

export function npcMobLevel(npc: SimNpc | undefined): number | undefined {
  if (!npc) return undefined;
  const min = npc.minLevel;
  const max = npc.maxLevel;
  if (typeof min === "number" && typeof max === "number") return Math.round((min + max) / 2);
  if (typeof min === "number") return min;
  if (typeof max === "number") return max;
  return undefined;
}

export interface SimTables {
  quests: Map<number, SimQuest>;
  npcs: Map<number, SimNpc>;
  items?: Map<number, SimItem>;
  overrides?: Record<string, QuestXpOverride>;
}

export interface BelowReqAccept {
  questId: number;
  pack: string;
  mode: RouteStyle;
  playerLevel: number;
  reqLevel: number;
}

export interface Sub70TurnIn {
  questId: number;
  pack: string;
  mode: RouteStyle;
  awarded: number;
  fullXp: number;
  playerLevel: number;
}

export interface UnresolvedKill {
  questId: number;
  npcId?: number;
  reason: "missingNpc" | "missingCount" | "missingLevel";
  pack: string;
  mode: RouteStyle;
}

export interface WalkedStep {
  packId: string;
  step: Step;
  packFirst: boolean;
  sim: StepSim;
  turninAwards: { questId: number; xp: number }[];
  acceptedAfter: number[];
  grindMob?: { mobId?: number; mobName?: string; mobLevel?: number };
  multiLevel?: { from: number; to: number };
}

export interface WalkResult {
  mode: RouteStyle;
  steps: WalkedStep[];
  end: { level: number; xpInto: number; fractional: number; totalXp: number };
  packEnds: Record<string, { fractional: number; totalXp: number }>;
  packArrivals: Record<string, number>;
  belowReq: BelowReqAccept[];
  sub70: Sub70TurnIn[];
  missingXp: number[];
  unresolvedKills: UnresolvedKill[];
}

function grindMobFromActions(actions: readonly Action[]): { mobId?: number; mobName?: string; mobLevel?: number } | undefined {
  for (const a of actions) {
    if (a.type === "xp" && (a.mobId != null || a.mobName || a.mobLevel != null)) {
      return { mobId: a.mobId, mobName: a.mobName, mobLevel: a.mobLevel };
    }
  }
  for (const a of actions) {
    if (a.type === "mob") {
      return { mobName: a.name, mobId: a.npcIds?.[0] };
    }
  }
  return undefined;
}

/** Questie items.json has npcDrops ids only — no drop rate — so 1 kill per required item. */
function killsForItemCount(itemCount: number, dropChance?: number): number {
  if (typeof dropChance === "number" && dropChance > 0 && dropChance <= 1) {
    return Math.ceil(itemCount / dropChance);
  }
  return itemCount;
}

function itemNeedCount(
  item: { id: number; count?: number },
  texts: readonly string[],
  index: number,
  total: number,
): number {
  if (typeof item.count === "number" && item.count > 0) return item.count;
  const nums = parseItemCounts(texts);
  if (total === 1 && nums.length >= 1) return nums[0]!;
  if (index < nums.length) return nums[index]!;
  return 1;
}

function dropKillXpForQuest(
  quest: SimQuest,
  playerLevel: number,
  packId: string,
  mode: RouteStyle,
  unresolved: UnresolvedKill[],
  npcs: Map<number, SimNpc>,
  items: Map<number, SimItem> | undefined,
  paidNpcIds: ReadonlySet<number>,
): number {
  const itemRows = quest.objectives?.items ?? [];
  if (!itemRows.length || !items) return 0;
  const texts = quest.objectivesText ?? [];
  let xp = 0;
  for (let i = 0; i < itemRows.length; i++) {
    const row = itemRows[i]!;
    const item = items.get(row.id);
    const drops = item?.npcDrops ?? [];
    if (!drops.length) continue;
    const usable: SimNpc[] = [];
    let sawMissingLevel = false;
    for (const npcId of drops) {
      if (paidNpcIds.has(npcId)) continue;
      const npc = npcs.get(npcId);
      if (!npc) {
        continue;
      }
      if (isHordeFriendlyNpc(npc)) continue;
      if (npcMobLevel(npc) == null) {
        sawMissingLevel = true;
        continue;
      }
      usable.push(npc);
    }
    if (!usable.length) {
      const reason = sawMissingLevel ? "missingLevel" : "missingNpc";
      unresolved.push({ questId: quest.id, npcId: drops[0], reason, pack: packId, mode });
      continue;
    }
    const need = itemNeedCount(row, texts, i, itemRows.length);
    const kills = killsForItemCount(need, item?.dropChance);
    const avg = usable.reduce((s, n) => s + (npcMobLevel(n) ?? 0), 0) / usable.length;
    const mobLevel = Math.round(avg);
    const rep = usable.reduce((best, n) => {
      const d = Math.abs((npcMobLevel(n) ?? 0) - avg);
      const bd = Math.abs((npcMobLevel(best) ?? 0) - avg);
      return d < bd ? n : best;
    });
    xp += kills * mobXp(playerLevel, mobLevel, isEliteRank(rep.rank));
  }
  return xp;
}

function killXpForQuest(
  quest: SimQuest | undefined,
  playerLevel: number,
  packId: string,
  mode: RouteStyle,
  unresolved: UnresolvedKill[],
  tables: SimTables,
): number {
  if (!quest) return 0;
  const npcs = tables.npcs;
  const creatures = quest.objectives?.creatures ?? [];
  const texts = quest.objectivesText ?? [];
  let xp = 0;
  const paidNpcIds = new Set<number>();
  for (let i = 0; i < creatures.length; i++) {
    const c = creatures[i]!;
    const npc = npcs.get(c.id);
    const count = creatureKillCount(c, texts, i, creatures.length, npc);
    const mobLevel = npcMobLevel(npc);
    if (count === 0) continue;
    if (count == null) {
      unresolved.push({ questId: quest.id, npcId: c.id, reason: "missingCount", pack: packId, mode });
      continue;
    }
    if (!npc) {
      unresolved.push({ questId: quest.id, npcId: c.id, reason: "missingNpc", pack: packId, mode });
      continue;
    }
    if (isHordeFriendlyNpc(npc)) continue;
    if (mobLevel == null) {
      unresolved.push({ questId: quest.id, npcId: c.id, reason: "missingLevel", pack: packId, mode });
      continue;
    }
    paidNpcIds.add(c.id);
    xp += count * mobXp(playerLevel, mobLevel, isEliteRank(npc.rank));
  }
  xp += dropKillXpForQuest(quest, playerLevel, packId, mode, unresolved, npcs, tables.items, paidNpcIds);
  return xp;
}

function pickLookaheadMob(
  L: number,
  accepted: ReadonlySet<number>,
  following: readonly WalkedStep[],
  tables: SimTables,
): { mobName: string; mobId: number } | undefined {
  const questIds = new Set(accepted);
  for (const w of following.slice(0, 8)) {
    for (const a of w.step.actions) if (a.type === "accept") questIds.add(a.questId);
  }
  type Cand = { mobId: number; mobName: string; kills: number; mobLevel: number };
  const cands: Cand[] = [];
  for (const qid of questIds) {
    const q = tables.quests.get(qid);
    const creatures = q?.objectives?.creatures ?? [];
    const texts = q?.objectivesText ?? [];
    for (let i = 0; i < creatures.length; i++) {
      const c = creatures[i]!;
      const npc = tables.npcs.get(c.id);
      const mobLevel = npcMobLevel(npc);
      if (!npc?.name || mobLevel == null) continue;
      if (Math.abs(mobLevel - L) > 3) continue;
      if (mobXp(L, mobLevel, isEliteRank(npc.rank)) <= 0) continue;
      const kills = creatureKillCount(c, texts, i, creatures.length, npc) ?? 0;
      cands.push({ mobId: c.id, mobName: npc.name, kills, mobLevel });
    }
  }
  cands.sort((a, b) => b.kills - a.kills);
  const best = cands[0];
  if (best) return { mobName: best.mobName, mobId: best.mobId };
  return undefined;
}

function attachNext(walked: WalkedStep[], tables: SimTables): void {
  for (let i = 0; i < walked.length; i++) {
    const w = walked[i]!;
    const isCheckpoint = !!w.sim.levelUp || (w.packFirst && !w.sim.levelUp);
    if (!isCheckpoint) continue;
    const L = w.sim.levelUp ?? Math.min(60, Math.floor(w.sim.level));
    if (L >= 60) continue;
    const frac = w.sim.level;
    const level = Math.floor(frac);
    const need = xpToNext(level);
    const xpInto = need > 0 ? Math.round((frac - level) * need) : 0;
    const xpNeeded = Math.max(0, need - xpInto);
    const following = walked.slice(i + 1);
    let quests = 0;
    let covered = 0;
    for (const nxt of following) {
      if (nxt.sim.levelUp) break;
      for (const t of nxt.turninAwards) {
        quests += 1;
        covered += t.xp;
      }
      if (covered >= xpNeeded) break;
    }
    const xpGap = Math.max(0, xpNeeded - covered);
    const gap = mobsForGap(xpGap, L);
    const next: NonNullable<StepSim["next"]> = {
      level: L + 1,
      quests,
      xpGap,
      mobs: gap.mobs,
      mobLevel: gap.mobLevel,
    };
    const fromQuests = pickLookaheadMob(L, new Set(w.acceptedAfter), following, tables);
    if (fromQuests) {
      next.mobName = fromQuests.mobName;
      next.mobId = fromQuests.mobId;
    } else {
      const grindHere = w.grindMob;
      const grindNext = following[0]?.grindMob;
      const g = grindHere?.mobName || grindHere?.mobId != null ? grindHere : grindNext;
      if (g?.mobName) next.mobName = g.mobName;
      if (g?.mobId != null) next.mobId = g.mobId;
    }
    w.sim.next = next;
  }
}

export interface SimulateWalkOpts {
  mode: RouteStyle;
  start?: { level: number; xpInto?: number; total?: number };
  tables: SimTables;
  /** Omit for the build-time worst case. Present (even all-off) enables grind metadata. */
  xpMods?: XpMods;
  /** `Profile.xpRested`. Used when `xpMods.restedPolicy` is `"fromGame"`. */
  xpRested?: number;
  /**
   * Include dungeon steps. Kill XP awarded on a dungeon step is 60% of the Classic
   * mob table (Forever dungeon mobs). Quest XP is not scaled. Build-time xp-sim leaves this off.
   */
  dungeons?: boolean;
}

/**
 * Walk `items` (already filtered to one route, dungeons off) from `start`.
 * Mutates nothing on the original steps; returns per-step sim payloads.
 */
export function simulateWalk(
  items: { packId: string; step: Step; packFirst: boolean }[],
  opts: SimulateWalkOpts,
): WalkResult {
  const mode = opts.mode;
  const tables = opts.tables;
  const overrides = tables.overrides ?? {};
  const state: XpState = { level: opts.start?.level ?? 1, xpInto: opts.start?.xpInto ?? 0, total: opts.start?.total ?? 0 };
  const useMods = opts.xpMods !== undefined;
  let restedPool = useMods ? initialRestedPool(opts.xpMods, { level: state.level, xpRested: opts.xpRested }) : 0;
  const turnedIn = new Set<number>();
  const killAwarded = new Set<number>();
  const accepted = new Set<number>();
  const hasComplete = new Set<number>();
  for (const it of items) {
    for (const a of it.step.actions) if (a.type === "complete") hasComplete.add(a.questId);
  }

  const belowReq: BelowReqAccept[] = [];
  const sub70: Sub70TurnIn[] = [];
  const missingXp: number[] = [];
  const unresolvedKills: UnresolvedKill[] = [];
  const walked: WalkedStep[] = [];
  const packArrivals: Record<string, number> = {};
  const packEnds: Record<string, { fractional: number; totalXp: number }> = {};

  for (const it of items) {
    if (packArrivals[it.packId] === undefined) {
      packArrivals[it.packId] = fractionalLevel(state.level, state.xpInto);
    }
    const startLevel = state.level;
    const startTotal = state.total;
    let levelUp = 0;
    const questXp: NonNullable<StepSim["questXp"]> = [];
    const turninAwards: { questId: number; xp: number }[] = [];
    let xpActions = 0;
    let xpZeros = 0;
    let grindKillXp = 0;

    const awardKills = (questId: number) => {
      if (killAwarded.has(questId)) return;
      killAwarded.add(questId);
      const q = tables.quests.get(questId);
      let xp = killXpForQuest(q, state.level, it.packId, mode, unresolvedKills, tables);
      if (opts.dungeons && dungeonMode(it.step) === "on") xp = Math.round(xp * 0.6);
      if (useMods) {
        const applied = applyXpMods(opts.xpMods, { kind: "kill", amount: xp, level: state.level, restedPool });
        xp = applied.amount;
        restedPool = applied.restedPool;
      }
      const up = addXp(state, xp);
      if (up) levelUp = Math.max(levelUp, up);
    };

    for (const a of it.step.actions) {
      if (a.type === "accept") {
        const q = tables.quests.get(a.questId);
        const req = q?.reqLevel ?? 0;
        if (req > 0 && state.level < req) {
          belowReq.push({ questId: a.questId, pack: it.packId, mode, playerLevel: state.level, reqLevel: req });
        }
        accepted.add(a.questId);
      } else if (a.type === "complete") {
        awardKills(a.questId);
      } else if (a.type === "turnin") {
        if (!hasComplete.has(a.questId)) awardKills(a.questId);
        if (!turnedIn.has(a.questId)) {
          turnedIn.add(a.questId);
          accepted.delete(a.questId);
          const q = tables.quests.get(a.questId);
          const fullXp = q ? resolveQuestFullXp(q.id, q.xp, overrides) : undefined;
          if (fullXp == null) missingXp.push(a.questId);
          let awarded = fullXp ? questXpForPlayer(fullXp, q?.level ?? 0, state.level) : 0;
          if (useMods && awarded > 0) {
            const applied = applyXpMods(opts.xpMods, { kind: "quest", amount: awarded, level: state.level, restedPool });
            awarded = applied.amount;
          }
          questXp.push({ questId: a.questId, xp: awarded, fullXp: fullXp ?? 0 });
          turninAwards.push({ questId: a.questId, xp: awarded });
          if (fullXp && awarded < 0.7 * fullXp) {
            sub70.push({ questId: a.questId, pack: it.packId, mode, awarded, fullXp, playerLevel: state.level });
          }
          const up = addXp(state, awarded);
          if (up) levelUp = Math.max(levelUp, up);
        }
      } else if (a.type === "xp") {
        const extra = a.extra ?? 0;
        const gain = xpToReach(state, a.level, extra);
        if (useMods || opts.dungeons) {
          xpActions += 1;
          if (gain <= 0) {
            xpZeros += 1;
          } else if (useMods) {
            const grind = grindKillXpForGap(opts.xpMods, { gain, level: state.level, restedPool });
            grindKillXp += grind.grindKillXp;
            restedPool = grind.restedPool;
          }
        }
        const up = addXp(state, gain);
        if (up) levelUp = Math.max(levelUp, up);
      }
    }

    const sim: StepSim = { level: fractionalLevel(state.level, state.xpInto), gained: state.total - startTotal };
    if ((useMods || opts.dungeons) && xpActions > 0) {
      if (useMods) sim.grindKillXp = grindKillXp;
      if (xpZeros === xpActions) sim.grindSkip = true;
    }
    if (levelUp) sim.levelUp = levelUp;
    if (questXp.length) sim.questXp = questXp;
    const multi = levelUp && levelUp - startLevel > 1 ? { from: startLevel, to: levelUp } : undefined;
    walked.push({
      packId: it.packId,
      step: it.step,
      packFirst: it.packFirst,
      sim,
      turninAwards,
      acceptedAfter: [...accepted],
      grindMob: grindMobFromActions(it.step.actions),
      multiLevel: multi,
    });
    packEnds[it.packId] = { fractional: sim.level, totalXp: state.total };
  }

  attachNext(walked, tables);

  return {
    mode,
    steps: walked,
    end: { level: state.level, xpInto: state.xpInto, fractional: fractionalLevel(state.level, state.xpInto), totalXp: state.total },
    packEnds,
    packArrivals,
    belowReq,
    sub70,
    missingXp: [...new Set(missingXp)].sort((a, b) => a - b),
    unresolvedKills,
  };
}

export interface LevelingChain {
  id: string;
  title: string;
  /**
   * Canonical play order for XP simulation and integrity.
   * This is the speedrun list from `routeChains.ts` (Undead is Tirisfal → Barrens, not Silverpine).
   */
  packs: string[];
  /** How this chain was discovered from pack endings. */
  handoff: string;
}

export const LEVELING_CHAINS: readonly LevelingChain[] = ROUTE_CHAINS.map((chain) => ({
  id: chain.id,
  title: chain.title,
  packs: [...chain.packs.speedrun],
  handoff: chain.handoff,
}));

export const SHARED_PACKS = ["barrens-12-20", ...HORDE_20_60_PACKS] as const;

export interface GrindActionNeed {
  stepId: string;
  pack: string;
  routes: RouteStyle[];
  level: number;
  extra?: number;
  mobId?: number;
  mobName?: string;
  mobLevel?: number;
  label: string;
}

export interface ChainModeSummary {
  chainId: string;
  mode: RouteStyle;
  packEnds: Record<string, number>;
  packArrivals: Record<string, number>;
  /** Sum of step `sim.gained` inside each pack on this chain walk. */
  packGained?: Record<string, number>;
  /** Accepts in each pack where integer player level < quest reqLevel (same rule as `belowReq`). */
  earlyAcceptsByPack?: Record<string, number>;
  endLevel: number;
  totalXp: number;
  xpTo60: number;
}

export interface PackFlag {
  pack: string;
  mode: RouteStyle;
  chainId: string;
  endLevel: number;
  declared: [number, number];
  belowPackMax: boolean;
  belowNextStart: boolean;
  nextPack?: string;
  nextStart?: number;
}

export interface SimReport {
  generatedAt: string;
  dungeonFilter: string;
  npcRankSample: typeof NPC_RANK_SAMPLE;
  eliteRanks: number[];
  chains: ChainModeSummary[];
  packFlags: PackFlag[];
  belowReqAccepts: BelowReqAccept[];
  sub70TurnIns: Sub70TurnIn[];
  missingXp: number[];
  unresolvedKills: { count: number; samples: UnresolvedKill[] };
  worstCaseChain: Record<string, Partial<Record<RouteStyle, string>>>;
  arrivalLevels: Record<string, Partial<Record<RouteStyle, Record<string, number>>>>;
  multiLevelCrossings: { pack: string; mode: RouteStyle; stepId: string; from: number; to: number }[];
  grindActionsPhase3: GrindActionNeed[];
}

export interface SimulateGuidesResult {
  report: SimReport;
  /** Per pack id, sim payloads to write onto matching steps. */
  simByPack: Record<string, Record<string, Partial<Record<RouteStyle, StepSim>>>>;
}

function chainItems(
  guides: Map<string, Guide>,
  packIds: string[],
  mode: RouteStyle,
  dungeons = false,
): { packId: string; step: Step; packFirst: boolean }[] {
  const visible = dungeons ? stepVisibleDungeonsOn : stepVisibleDungeonsOff;
  const out: { packId: string; step: Step; packFirst: boolean }[] = [];
  for (const packId of packIds) {
    const g = guides.get(packId);
    if (!g) throw new Error(`xp-sim: missing guide pack ${packId}`);
    let first = true;
    for (const step of g.steps) {
      if (!visible(step, mode)) continue;
      out.push({ packId, step, packFirst: first });
      first = false;
    }
  }
  return out;
}

function parseGrindTarget(step: Step): { level: number; extra?: number; label: string } | undefined {
  const text = step.text.flatMap((t) => t.segments.map((s) => s.t)).join(" ");
  const m = /to level\s+(\d+)(?:\.(\d+))?/i.exec(text) ?? /until about level\s+(\d+)(?:\.(\d+))?/i.exec(text);
  if (!m) return undefined;
  const level = Number(m[1]);
  const fracDigit = m[2] ? Number(m[2][0]) : 0;
  const extra = fracDigit > 0 && level < 60 ? Math.round((fracDigit / 10) * xpToNext(level)) : undefined;
  return { level, extra, label: text.slice(0, 120) };
}

export function grindFieldsForPhase3(guides: readonly Guide[], npcs: Map<number, SimNpc>): GrindActionNeed[] {
  const out: GrindActionNeed[] = [];
  for (const g of guides) {
    if (g.subgroup === "Dungeons") continue;
    for (const step of g.steps) {
      const isGrind = /grind/i.test(step.id) || step.text.some((t) => t.segments.some((s) => /grind/i.test(s.t)));
      if (!isGrind) continue;
      if (step.actions.some((a) => a.type === "xp")) continue;
      const target = parseGrindTarget(step);
      const mobAct = step.actions.find((a) => a.type === "mob");
      const mobId = mobAct && mobAct.type === "mob" ? mobAct.npcIds?.[0] : undefined;
      const mobName = mobAct && mobAct.type === "mob" ? mobAct.name : undefined;
      const npc = mobId != null ? npcs.get(mobId) : undefined;
      const mobLevel = npcMobLevel(npc);
      if (!target && mobId == null) continue;
      const row: GrindActionNeed = {
        stepId: step.id,
        pack: g.slug,
        routes: stepRoutes(step),
        level: target?.level ?? Math.round(g.minLevel),
        label: target?.label ?? step.id,
      };
      if (target?.extra) row.extra = target.extra;
      if (mobId != null) row.mobId = mobId;
      if (mobName) row.mobName = mobName;
      if (mobLevel != null) row.mobLevel = mobLevel;
      out.push(row);
    }
  }
  return out;
}

const DUNGEON_FILTER =
  "Dungeons OFF. Skip a step when dungeonMode(step)==='on' (step.dungeon set, or a .dungeon condition whose args do not start with '!'). Keep dungeonsOff / .dungeon !X alternatives. dungeonsOffRoutes is ignored while dungeons are off. tags.dungeonPart never hides a step. research/dungeons/steps-v2.json (guide subgroup Dungeons) is not part of any chain.";

export function simulateGuides(
  guidesIn: readonly Guide[],
  tables: SimTables,
  now = new Date().toISOString(),
  live?: { xpMods?: XpMods; xpRested?: number; dungeons?: boolean },
): SimulateGuidesResult {
  const guides = new Map(guidesIn.filter((g) => g.subgroup !== "Dungeons").map((g) => [g.slug, g]));
  const chainWalks: { chain: LevelingChain; mode: RouteStyle; walk: WalkResult }[] = [];
  const belowReq: BelowReqAccept[] = [];
  const sub70: Sub70TurnIn[] = [];
  const missingXp = new Set<number>();
  const unresolved: UnresolvedKill[] = [];
  const multiLevel: SimReport["multiLevelCrossings"] = [];
  const chains: ChainModeSummary[] = [];
  const packFlags: PackFlag[] = [];
  const arrivalLevels: SimReport["arrivalLevels"] = {};
  const worstCaseChain: SimReport["worstCaseChain"] = {};

  for (const chain of LEVELING_CHAINS) {
    for (const mode of ROUTES) {
      const items = chainItems(guides, chain.packs, mode, !!live?.dungeons);
      const walk = simulateWalk(items, {
        mode,
        start: { level: 1, xpInto: 0 },
        tables,
        ...(live?.dungeons ? { dungeons: true } : {}),
        ...(live?.xpMods !== undefined ? { xpMods: live.xpMods, xpRested: live.xpRested } : {}),
      });
      chainWalks.push({ chain, mode, walk });
      belowReq.push(...walk.belowReq);
      sub70.push(...walk.sub70);
      for (const id of walk.missingXp) missingXp.add(id);
      unresolved.push(...walk.unresolvedKills);
      for (const w of walk.steps) {
        if (w.multiLevel) {
          multiLevel.push({ pack: w.packId, mode, stepId: w.step.id, from: w.multiLevel.from, to: w.multiLevel.to });
        }
      }
      const packGained: Record<string, number> = {};
      for (const w of walk.steps) packGained[w.packId] = (packGained[w.packId] ?? 0) + w.sim.gained;
      const earlyAcceptsByPack: Record<string, number> = {};
      for (const a of walk.belowReq) earlyAcceptsByPack[a.pack] = (earlyAcceptsByPack[a.pack] ?? 0) + 1;
      chains.push({
        chainId: chain.id,
        mode,
        packEnds: Object.fromEntries(Object.entries(walk.packEnds).map(([k, v]) => [k, v.fractional])),
        packArrivals: walk.packArrivals,
        packGained,
        earlyAcceptsByPack,
        endLevel: walk.end.fractional,
        totalXp: walk.end.totalXp,
        xpTo60: Math.max(0, TOTAL_XP_1_TO_60 - walk.end.totalXp),
      });
      for (let i = 0; i < chain.packs.length; i++) {
        const packId = chain.packs[i]!;
        const g = guides.get(packId);
        const end = walk.packEnds[packId]?.fractional;
        if (!g || end == null) continue;
        const nextId = chain.packs[i + 1];
        const nextG = nextId ? guides.get(nextId) : undefined;
        const belowPackMax = end < g.maxLevel - 0.5;
        const belowNextStart = nextG ? end < nextG.minLevel - 0.5 : false;
        if (belowPackMax || belowNextStart) {
          packFlags.push({
            pack: packId,
            mode,
            chainId: chain.id,
            endLevel: end,
            declared: [g.minLevel, g.maxLevel],
            belowPackMax,
            belowNextStart,
            nextPack: nextId,
            nextStart: nextG?.minLevel,
          });
        }
      }
    }
  }

  const simByPack: SimulateGuidesResult["simByPack"] = {};
  const packOwners = new Map<string, Set<string>>();
  for (const c of LEVELING_CHAINS) for (const p of c.packs) {
    const s = packOwners.get(p) ?? new Set();
    s.add(c.id);
    packOwners.set(p, s);
  }

  for (const mode of ROUTES) {
    const walksFor = chainWalks.filter((x) => x.mode === mode);
    const packIds = new Set(LEVELING_CHAINS.flatMap((c) => c.packs));
    for (const packId of packIds) {
      const candidates = walksFor.filter((x) => x.chain.packs.includes(packId));
      if (!candidates.length) continue;
      const uniqueChains = packOwners.get(packId)?.size ?? 1;
      let chosen = candidates[0]!;
      if (uniqueChains > 1) {
        chosen = candidates.reduce((best, cur) => {
          const a = cur.walk.packArrivals[packId] ?? 99;
          const b = best.walk.packArrivals[packId] ?? 99;
          return a < b ? cur : best;
        });
      }
      worstCaseChain[packId] ??= {};
      worstCaseChain[packId]![mode] = chosen.chain.id;
      arrivalLevels[packId] ??= {};
      arrivalLevels[packId]![mode] = Object.fromEntries(candidates.map((c) => [c.chain.id, c.walk.packArrivals[packId] ?? 0]));
      simByPack[packId] ??= {};
      for (const w of chosen.walk.steps) {
        if (w.packId !== packId) continue;
        simByPack[packId]![w.step.id] ??= {};
        simByPack[packId]![w.step.id]![mode] = w.sim;
      }
    }
  }

  const report: SimReport = {
    generatedAt: now,
    dungeonFilter: live?.dungeons
      ? "Dungeons ON. Include dungeon steps. Skip dungeonsOff / .dungeon !X. Hide dungeonsOffRoutes for the active style. Dungeon-step kill XP ×0.6 (Classic mob table). Quest XP unchanged."
      : DUNGEON_FILTER,
    npcRankSample: NPC_RANK_SAMPLE,
    eliteRanks: [1, 2],
    chains,
    packFlags,
    belowReqAccepts: belowReq,
    sub70TurnIns: sub70,
    missingXp: [...missingXp].sort((a, b) => a - b),
    unresolvedKills: { count: unresolved.length, samples: unresolved.slice(0, 40) },
    worstCaseChain,
    arrivalLevels,
    multiLevelCrossings: multiLevel,
    grindActionsPhase3: grindFieldsForPhase3([...guides.values()], tables.npcs),
  };

  return { report, simByPack };
}

export function applySimToGuides(guides: Guide[], simByPack: SimulateGuidesResult["simByPack"]): void {
  for (const g of guides) {
    const bag = simByPack[g.slug];
    if (!bag) continue;
    for (const step of g.steps) {
      const sim = bag[step.id];
      if (sim) step.sim = sim;
    }
  }
}

export function formatReportMarkdown(report: SimReport): string {
  const lines: string[] = [];
  lines.push("# XP sim report");
  lines.push("");
  lines.push(`Generated ${report.generatedAt}. Worst case: no rested, no food buff. Dungeons off.`);
  lines.push("");
  lines.push("## Dungeon filter");
  lines.push("");
  lines.push(report.dungeonFilter);
  lines.push("");
  lines.push("## NPC rank (Questie)");
  lines.push("");
  lines.push("| rank | meaning | sample | elite XP? |");
  lines.push("| --- | --- | --- | --- |");
  lines.push("| omitted | normal | most trash | no |");
  lines.push("| 1 | elite | Hogger (448) | yes |");
  lines.push("| 2 | rareelite | Marisa du'Paige (599) | yes |");
  lines.push("| 3 | worldboss | Thrall (4949) | no (not elite/rareelite) |");
  lines.push("| 4 | rare | Thuros Lightfingers (61) | no |");
  lines.push("");
  lines.push("## Chain end levels");
  lines.push("");
  lines.push("| chain | mode | end | total XP | XP to 60 | pack ends |");
  lines.push("| --- | --- | ---: | ---: | ---: | --- |");
  for (const c of report.chains) {
    const ends = Object.entries(c.packEnds)
      .map(([p, lv]) => `${p} ${lv.toFixed(2)}`)
      .join(", ");
    lines.push(`| ${c.chainId} | ${c.mode} | ${c.endLevel.toFixed(2)} | ${c.totalXp} | ${c.xpTo60} | ${ends} |`);
  }
  lines.push("");
  lines.push("## Shared-pack worst case (lowest arrival)");
  lines.push("");
  lines.push("| pack | balanced | speedrun | arrivals |");
  lines.push("| --- | --- | --- | --- |");
  for (const pack of Object.keys(report.worstCaseChain).sort()) {
    const w = report.worstCaseChain[pack]!;
    const arr = report.arrivalLevels[pack];
    const fmt = (mode: RouteStyle) =>
      Object.entries(arr?.[mode] ?? {})
        .map(([ch, lv]) => `${ch} ${lv.toFixed(2)}`)
        .join(", ");
    lines.push(`| ${pack} | ${w.balanced ?? "—"} | ${w.speedrun ?? "—"} | bal: ${fmt("balanced")}; spd: ${fmt("speedrun")} |`);
  }
  lines.push("");
  lines.push("## Pack end vs declared range");
  lines.push("");
  if (!report.packFlags.length) {
    lines.push("No pack ended more than 0.5 below its max, or 0.5 below the next pack start.");
  } else {
    lines.push("| pack | mode | chain | end | declared | below max | below next start |");
    lines.push("| --- | --- | --- | ---: | --- | --- | --- |");
    for (const f of report.packFlags) {
      lines.push(
        `| ${f.pack} | ${f.mode} | ${f.chainId} | ${f.endLevel.toFixed(2)} | ${f.declared[0]}–${f.declared[1]} | ${f.belowPackMax ? "yes" : ""} | ${f.belowNextStart ? `${f.nextPack} ${f.nextStart}` : ""} |`,
      );
    }
  }
  lines.push("");
  lines.push("## Accepts below reqLevel");
  lines.push("");
  lines.push(`${report.belowReqAccepts.length} accepts while integer player level < quest.reqLevel.`);
  if (report.belowReqAccepts.length) {
    lines.push("");
    lines.push("| quest | pack | mode | player | req |");
    lines.push("| ---: | --- | --- | ---: | ---: |");
    for (const a of report.belowReqAccepts.slice(0, 80)) {
      lines.push(`| ${a.questId} | ${a.pack} | ${a.mode} | ${a.playerLevel} | ${a.reqLevel} |`);
    }
    if (report.belowReqAccepts.length > 80) lines.push(`| … | ${report.belowReqAccepts.length - 80} more | | | |`);
  }
  lines.push("");
  lines.push("## Turn-ins under 70% of full XP");
  lines.push("");
  lines.push(`${report.sub70TurnIns.length} turn-ins awarded < 0.7 × fullXp.`);
  if (report.sub70TurnIns.length) {
    lines.push("");
    lines.push("| quest | pack | mode | awarded | full | player |");
    lines.push("| ---: | --- | --- | ---: | ---: | ---: |");
    for (const t of report.sub70TurnIns.slice(0, 80)) {
      lines.push(`| ${t.questId} | ${t.pack} | ${t.mode} | ${t.awarded} | ${t.fullXp} | ${t.playerLevel} |`);
    }
    if (report.sub70TurnIns.length > 80) lines.push(`| … | ${report.sub70TurnIns.length - 80} more | | | |`);
  }
  lines.push("");
  lines.push("## Missing quest XP / unresolved kills");
  lines.push("");
  lines.push(`missingXp quest ids (${report.missingXp.length}): ${report.missingXp.slice(0, 40).join(", ") || "none"}${report.missingXp.length > 40 ? "…" : ""}`);
  lines.push("");
  lines.push(`unresolvedKills: ${report.unresolvedKills.count} (npc or count missing; awarded 0).`);
  lines.push("");
  if (report.multiLevelCrossings.length) {
    lines.push("## Multi-level crossings");
    lines.push("");
    lines.push("| pack | mode | step | from → to |");
    lines.push("| --- | --- | --- | --- |");
    for (const m of report.multiLevelCrossings.slice(0, 40)) {
      lines.push(`| ${m.pack} | ${m.mode} | ${m.stepId} | ${m.from} → ${m.to} |`);
    }
    lines.push("");
  }
  lines.push("## Grind actions for phase 3");
  lines.push("");
  lines.push("Text-only grinds (id/text contains grind, no `type:\"xp\"` action). Phase 3 should add an xp action with these fields; do not invent XP in the sim until then.");
  lines.push("");
  if (!report.grindActionsPhase3.length) {
    lines.push("None found.");
  } else {
    lines.push("| step | routes | `{ type:\"xp\", level, extra?, mobId, mobName, mobLevel }` |");
    lines.push("| --- | --- | --- |");
    for (const g of report.grindActionsPhase3) {
      const extra = g.extra != null ? `, extra: ${g.extra}` : "";
      const mob = [g.mobId != null ? `mobId: ${g.mobId}` : null, g.mobName ? `mobName: \"${g.mobName}\"` : null, g.mobLevel != null ? `mobLevel: ${g.mobLevel}` : null]
        .filter(Boolean)
        .join(", ");
      lines.push(`| ${g.stepId} | ${g.routes.join("+")} | \`{ type: \"xp\", level: ${g.level}${extra}${mob ? `, ${mob}` : ""}, label: \"…\" }\` |`);
    }
  }
  lines.push("");
  return lines.join("\n");
}
