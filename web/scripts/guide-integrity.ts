/**
 * Guide integrity check over built site data (`web/public/data`).
 *
 *   node --experimental-strip-types scripts/guide-integrity.ts [--data DIR] [--reports DIR]
 *
 * Race chains follow `guide_index.json` the way the app picks a start (`starts` order, first
 * entry whose `race` list includes the race → `firstGuide`), then shared non-dungeon guides
 * that are not some other race's `firstGuide`. Packs in the 20–60 play list stay in that order;
 * other shared packs stay in bracket order. Orc and Troll share one chain when they share a
 * start. Dungeon brackets are not part of the chain.
 *
 * Exit 0 when there are only warnings and info. Exit 1 when any finding is an error,
 * unless `runIntegrity({ failOnError: false })`.
 *
 * XP checks (via `simulateGuides`, same tables as `xp-sim.ts`) also fail the run when a
 * chain's last pack ends below 59.5, an earlier pack ends below the next pack's minLevel
 * minus 0.5 (handoffs from `LEVELING_CHAINS`), or a non-class-locked quest is accepted
 * 3+ levels early. Class-locked quests (`quest.classes !== 0`) accepted early are warnings.
 *
 * Race chains have no class, so a step is kept when its filter can match that race for at
 * least one class: class-only filters stay on every race chain, and a step with no filter
 * applies to every race. A race-only step (Tauren accept, Tauren turn-in) counts only on chains
 * that include that race. Guide, step, and action filters are AND-ed; a chain with several
 * races (Orc/Troll) keeps a step that can match any of them. A filter no class can satisfy
 * is omitted from every chain.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Action, Filter, Guide, GuideIndex, QuestInfo, Step } from "../../contracts/schema.ts";
import { horde2060Index } from "../src/lib/xp/leveling-chain.ts";
import {
  isHordeFriendlyNpc,
  LEVELING_CHAINS,
  npcSpawnCount,
  ROUTES,
  simulateGuides,
  type LevelingChain,
  type SimNpc,
  type SimReport,
} from "../src/lib/xp/simulate.ts";
import { loadDossiers, loadIntegrationPlan, loadRouteTimeline, validateDungeonPlan } from "./dungeonPlan.ts";
import { loadSimTables } from "./xp-sim.ts";

/** Vanilla classes used only to ask whether some class could see a race-filtered step. */
const RACE_CLASSES = ["Warrior", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Paladin"] as const;

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const LAST_PACK_MIN_END = 59.5;
export const HANDOFF_SLACK = 0.5;
const EARLY_ACCEPT_FAIL_LEVELS = 3;
const EARLY_ACCEPT_PRINT_CAP = 40;

export type Severity = "error" | "warning" | "info";

export type Category =
  | "missing-quest"
  | "turnin-without-accept"
  | "accept-without-turnin"
  | "prereq-group"
  | "prereq-single"
  | "missing-breadcrumb"
  | "exclusive-conflict"
  | "label-mismatch"
  | "multi-quest"
  | "missing-coordinates"
  | "xp-end-level"
  | "xp-handoff"
  | "xp-accept-early"
  | "xp-accept-below-req"
  | "GRIND_KILL_CAP"
  | "GRIND_KILL_UNDOCUMENTED"
  | "GRIND_MOB_FRIENDLY"
  | "GRIND_MOB_SPAWNS"
  | "GRIND_MOB_LEVEL"
  | "GRIND_PIN_FAR"
  | "GRIND_PIN_UNCHECKED"
  | "GRIND_COUNT_MISMATCH";

export interface Finding {
  severity: Severity;
  category: Category;
  pack: string;
  stepId: string;
  questId?: number;
  race?: string;
  message: string;
}

export interface IntegrityReport {
  generatedAt: string;
  errors: number;
  warnings: number;
  info: number;
  findings: Finding[];
  /** Accepts 1–2 levels before reqLevel (warning only). */
  xpEarlyWarnCount: number;
  /** Accepts 3+ levels before reqLevel that are not class-locked (integrity errors). */
  xpEarlyFailCount: number;
}

export interface IntegrityOptions {
  dataDir?: string;
  reportDir?: string;
  /** When false, content errors are reported and the process still exits 0. Default true. */
  failOnError?: boolean;
  now?: string;
}

interface Chain {
  /** Races that share this start, joined for the report. */
  race: string;
  guides: Guide[];
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function questIdOf(action: Action): number | undefined {
  if (action.type === "accept" || action.type === "turnin" || action.type === "complete") return action.questId;
  if (action.type === "collect" && typeof action.questId === "number") return action.questId;
  return undefined;
}

function actionLabel(action: Action): string | undefined {
  if (action.type === "accept" || action.type === "turnin" || action.type === "complete" || action.type === "collect") {
    return action.label;
  }
  return undefined;
}

/** Coordinates live on `.goto` `at`, other action `at` points, or step `pins` (`at` / mob-area center / polygon). */
export function stepHasCoordinates(step: Step): boolean {
  for (const action of step.actions) {
    if (action.type === "goto" && Number.isFinite(action.at?.x) && Number.isFinite(action.at?.y)) return true;
    if ("at" in action && action.at && typeof action.at === "object" && "x" in action.at && "y" in action.at) {
      const at = action.at as { x?: number; y?: number };
      if (Number.isFinite(at.x) && Number.isFinite(at.y)) return true;
    }
  }
  for (const pin of step.pins ?? []) {
    if ("at" in pin && pin.at && Number.isFinite(pin.at.x) && Number.isFinite(pin.at.y)) return true;
    if (pin.kind === "mobArea" && (pin.center || (pin.polygon && pin.polygon.length > 0))) return true;
  }
  return false;
}

function normName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isItemStart(quest: QuestInfo | undefined): boolean {
  return !!quest?.start?.some((giver) => giver.kind === "item");
}

function sameRace(a?: string, b?: string): boolean {
  if (!a || !b) return a === b;
  if (a === b) return true;
  return (a === "Undead" && b === "Scourge") || (a === "Scourge" && b === "Undead");
}

function termMatchesRaceClass(term: Filter["any"][number][number], race: string, cls: string): boolean {
  const raceOk = term.race === undefined || sameRace(term.race, race);
  const clsOk = term.cls === undefined || term.cls === cls;
  const pos = raceOk && clsOk;
  return term.not ? !pos : pos;
}

/** True when `filter` is absent or some class could see it on `race`. Class terms never drop a race by themselves. */
function filterMatchesRace(filter: Filter | undefined, race: string): boolean {
  if (!filter || filter.any.length === 0) return true;
  return RACE_CLASSES.some((cls) =>
    filter.any.some((group) => group.every((term) => termMatchesRaceClass(term, race, cls))),
  );
}

function chainRaces(chain: Chain): string[] {
  return chain.race.split("/").map((race) => race.trim()).filter(Boolean);
}

/** Guide, step, and action filters must all be able to match the same race on this chain. */
function actionOnChain(guide: Guide, step: Step, action: Action, races: readonly string[]): boolean {
  if (!races.length) return true;
  return races.some(
    (race) => filterMatchesRace(guide.filter, race) && filterMatchesRace(step.filter, race) && filterMatchesRace(action.filter, race),
  );
}

/**
 * One chain per `guide_index.starts` entry. Race `firstGuide` packs stay first.
 * Packs in `HORDE_20_60_PACKS` follow in that play order (bracket order would
 * scramble sub-packs that share a bracket). Other shared packs keep bracket order.
 * Dungeon brackets are left out.
 */
export function chainsFor(index: GuideIndex, guides: ReadonlyMap<string, Guide>): Chain[] {
  const startSlugs = new Set(index.starts.map((start) => start.firstGuide));
  const shared: string[] = [];
  for (const bracket of index.brackets) {
    if (/dungeon/i.test(bracket.label)) continue;
    for (const slug of bracket.guides) {
      if (startSlugs.has(slug) || /dungeon/i.test(slug)) continue;
      const guide = guides.get(slug);
      if (!guide || guide.subgroup === "Dungeons") continue;
      shared.push(slug);
    }
  }
  const other = shared.filter((slug) => horde2060Index(slug) === undefined);
  const listed = shared
    .filter((slug) => horde2060Index(slug) !== undefined)
    .sort((a, b) => horde2060Index(a)! - horde2060Index(b)!);
  return index.starts.map((start) => {
    const slugs = [
      start.firstGuide,
      ...other.filter((slug) => slug !== start.firstGuide),
      ...listed.filter((slug) => slug !== start.firstGuide),
    ];
    const out: Guide[] = [];
    for (const slug of slugs) {
      const guide = guides.get(slug);
      if (guide && guide.subgroup !== "Dungeons") out.push(guide);
    }
    return { race: start.race.join("/"), guides: out };
  });
}

function referencedOn(chain: Chain): Set<number> {
  const races = chainRaces(chain);
  const ids = new Set<number>();
  for (const guide of chain.guides) {
    for (const step of guide.steps) {
      // Dungeon-gated steps are optional (dungeons toggle); keep the open-world race chain clean.
      if (step.dungeon) continue;
      for (const action of step.actions) {
        if (!actionOnChain(guide, step, action, races)) continue;
        const id = questIdOf(action);
        if (id !== undefined) ids.add(id);
      }
    }
  }
  return ids;
}

function push(findings: Finding[], finding: Finding) {
  findings.push(finding);
}

function checkSteps(guides: readonly Guide[], quests: ReadonlyMap<number, QuestInfo>, findings: Finding[]) {
  for (const guide of guides) {
    for (const step of guide.steps) {
      const ids = new Set<number>();
      let acceptOrTurnin = false;
      for (const action of step.actions) {
        const id = questIdOf(action);
        if (id !== undefined) ids.add(id);
        if (action.type !== "accept" && action.type !== "turnin") continue;
        acceptOrTurnin = true;
        const quest = quests.get(action.questId);
        const label = actionLabel(action);
        if (quest && label && normName(label) !== normName(quest.name)) {
          push(findings, {
            severity: "warning",
            category: "label-mismatch",
            pack: guide.slug,
            stepId: step.id,
            questId: action.questId,
            message: `action label ${JSON.stringify(label)} does not match quest name ${JSON.stringify(quest.name)}`,
          });
        }
      }
      if (ids.size >= 2) {
        push(findings, {
          severity: "info",
          category: "multi-quest",
          pack: guide.slug,
          stepId: step.id,
          message: `step actions reference ${ids.size} quests: ${[...ids].sort((a, b) => a - b).join(", ")}`,
        });
      }
      if (acceptOrTurnin && !stepHasCoordinates(step)) {
        push(findings, {
          severity: "warning",
          category: "missing-coordinates",
          pack: guide.slug,
          stepId: step.id,
          message: `accept/turnin step has no goto, pin, or at coordinates`,
        });
      }
    }
  }
}

function checkChain(chain: Chain, quests: ReadonlyMap<number, QuestInfo>, findings: Finding[]) {
  const races = chainRaces(chain);
  const onRoute = referencedOn(chain);
  const accepted = new Map<number, { pack: string; stepId: string }>();
  const turnedIn = new Set<number>();
  const acceptOpen: { questId: number; pack: string; stepId: string }[] = [];
  const seenExclusive = new Set<string>();
  const itemPrereqChecked = new Set<number>();

  const checkPrereqs = (questId: number, pack: string, stepId: string) => {
    const quest = quests.get(questId);
    if (!quest) return;
    const group = quest.pre?.group ?? [];
    const missingFromRoute = group.filter((id) => !onRoute.has(id));
    const notTurnedIn = group.filter((id) => onRoute.has(id) && !turnedIn.has(id));
    if (missingFromRoute.length) {
      push(findings, {
        severity: "warning",
        category: "missing-breadcrumb",
        pack,
        stepId,
        questId,
        race: chain.race,
        message: `pre.group [${missingFromRoute.join(", ")}] is not on the ${chain.race} route`,
      });
    }
    if (notTurnedIn.length) {
      push(findings, {
        severity: "error",
        category: "prereq-group",
        pack,
        stepId,
        questId,
        race: chain.race,
        message: `pre.group [${notTurnedIn.join(", ")}] is not turned in earlier on the ${chain.race} chain`,
      });
    }
    const single = quest.pre?.single ?? [];
    if (!single.length) return;
    const present = single.filter((id) => onRoute.has(id));
    if (!present.length) {
      push(findings, {
        severity: "warning",
        category: "missing-breadcrumb",
        pack,
        stepId,
        questId,
        race: chain.race,
        message: `pre.single [${single.join(", ")}] is not on the ${chain.race} route`,
      });
      return;
    }
    if (!present.some((id) => turnedIn.has(id))) {
      push(findings, {
        severity: "error",
        category: "prereq-single",
        pack,
        stepId,
        questId,
        race: chain.race,
        message: `none of pre.single [${present.join(", ")}] is turned in earlier on the ${chain.race} chain`,
      });
    }
  };

  for (const guide of chain.guides) {
    for (const step of guide.steps) {
      if (step.dungeon) continue;
      for (const action of step.actions) {
        if (!actionOnChain(guide, step, action, races)) continue;
        if (action.type !== "accept" && action.type !== "turnin" && action.type !== "complete") continue;
        const quest = quests.get(action.questId);
        if ((action.type === "turnin" || action.type === "complete") && isItemStart(quest) && !accepted.has(action.questId) && !itemPrereqChecked.has(action.questId)) {
          itemPrereqChecked.add(action.questId);
          checkPrereqs(action.questId, guide.slug, step.id);
        }
        if (action.type !== "accept" && action.type !== "turnin") continue;
        if (action.type === "turnin") {
          if (!accepted.has(action.questId) && !isItemStart(quest)) {
            push(findings, {
              severity: "error",
              category: "turnin-without-accept",
              pack: guide.slug,
              stepId: step.id,
              questId: action.questId,
              race: chain.race,
              message: `turnin of ${action.questId} has no earlier accept on the ${chain.race} chain`,
            });
          }
          turnedIn.add(action.questId);
          const open = acceptOpen.findIndex((entry) => entry.questId === action.questId);
          if (open >= 0) acceptOpen.splice(open, 1);
        }
        if (action.type === "accept") {
          if (!accepted.has(action.questId)) {
            accepted.set(action.questId, { pack: guide.slug, stepId: step.id });
            acceptOpen.push({ questId: action.questId, pack: guide.slug, stepId: step.id });
          }
          const siblings = quest?.exclusiveTo ?? [];
          for (const other of siblings) {
            if (!accepted.has(other)) continue;
            const pair = [action.questId, other].sort((a, b) => a - b).join("+");
            const key = `${chain.race}|${pair}`;
            if (seenExclusive.has(key)) continue;
            seenExclusive.add(key);
            push(findings, {
              severity: "error",
              category: "exclusive-conflict",
              pack: guide.slug,
              stepId: step.id,
              questId: action.questId,
              race: chain.race,
              message: `exclusive quests ${action.questId} and ${other} are both accepted on the ${chain.race} chain`,
            });
          }
          checkPrereqs(action.questId, guide.slug, step.id);
        }
      }
    }
  }

  for (const open of acceptOpen) {
    push(findings, {
      severity: "error",
      category: "accept-without-turnin",
      pack: open.pack,
      stepId: open.stepId,
      questId: open.questId,
      race: chain.race,
      message: `accept of ${open.questId} has no later turnin on the ${chain.race} chain`,
    });
  }
}

export interface XpIntegrityResult {
  findings: Finding[];
  earlyWarnCount: number;
  earlyFailCount: number;
}

export type XpQuestClasses = ReadonlyMap<number, { classes?: number }>;

/**
 * XP gates used by `npm run integrity`. Handoff order comes from `LEVELING_CHAINS`.
 * 1–2 levels early are warnings, not failures: the sim currently reports 514 below-req accepts; most are one ding early and the route still reaches 60.
 * Class-locked quests (`classes` non-zero in content/questie-db/quests.json) are trainer
 * quests you see before you can turn them in, so 3+ early accepts are warnings, not failures.
 */
export function evaluateXpIntegrity(
  report: Pick<SimReport, "chains" | "belowReqAccepts">,
  guides: ReadonlyMap<string, Pick<Guide, "minLevel">>,
  chains: readonly LevelingChain[] = LEVELING_CHAINS,
  quests?: XpQuestClasses,
): XpIntegrityResult {
  const findings: Finding[] = [];

  for (const chain of chains) {
    for (const mode of ROUTES) {
      const summary = report.chains.find((row) => row.chainId === chain.id && row.mode === mode);
      const lastPack = chain.packs[chain.packs.length - 1] ?? chain.id;
      if (!summary) {
        findings.push({
          severity: "error",
          category: "xp-end-level",
          pack: lastPack,
          stepId: "-",
          race: chain.id,
          message: `missing XP sim for chain ${chain.id}/${mode}`,
        });
        continue;
      }
      const lastEnd = summary.packEnds[lastPack] ?? summary.endLevel;
      if (lastEnd < LAST_PACK_MIN_END) {
        findings.push({
          severity: "error",
          category: "xp-end-level",
          pack: lastPack,
          stepId: "-",
          race: chain.id,
          message: `chain ${chain.id}/${mode} last pack ${lastPack} ends at ${lastEnd.toFixed(2)} (< ${LAST_PACK_MIN_END})`,
        });
      }
      for (let i = 0; i < chain.packs.length - 1; i++) {
        const packId = chain.packs[i]!;
        const nextId = chain.packs[i + 1]!;
        const end = summary.packEnds[packId];
        const nextG = guides.get(nextId);
        if (end == null) {
          findings.push({
            severity: "error",
            category: "xp-handoff",
            pack: packId,
            stepId: "-",
            race: chain.id,
            message: `chain ${chain.id}/${mode} pack ${packId} has no simulated end level before ${nextId}`,
          });
          continue;
        }
        if (!nextG) {
          findings.push({
            severity: "error",
            category: "xp-handoff",
            pack: packId,
            stepId: "-",
            race: chain.id,
            message: `chain ${chain.id}/${mode} next pack ${nextId} is missing from built guides`,
          });
          continue;
        }
        if (end < nextG.minLevel - HANDOFF_SLACK) {
          findings.push({
            severity: "error",
            category: "xp-handoff",
            pack: packId,
            stepId: "-",
            race: chain.id,
            message: `chain ${chain.id}/${mode} pack ${packId} ends at ${end.toFixed(2)}; next ${nextId} minLevel ${nextG.minLevel}`,
          });
        }
      }
    }
  }

  const gapFails = report.belowReqAccepts.filter((a) => a.playerLevel <= a.reqLevel - EARLY_ACCEPT_FAIL_LEVELS);
  const gapWarns = report.belowReqAccepts.filter(
    (a) => a.playerLevel < a.reqLevel && a.playerLevel > a.reqLevel - EARLY_ACCEPT_FAIL_LEVELS,
  );
  const classLocked: typeof gapFails = [];
  const earlyFails: typeof gapFails = [];
  for (const a of gapFails) {
    const classes = quests?.get(a.questId)?.classes ?? 0;
    if (classes !== 0) {
      // Class-locked trainer quests appear in the log before the player can turn them in.
      classLocked.push(a);
    } else {
      earlyFails.push(a);
    }
  }
  for (const a of earlyFails) {
    findings.push({
      severity: "error",
      category: "xp-accept-early",
      pack: a.pack,
      stepId: "-",
      questId: a.questId,
      message: `quest ${a.questId} pack ${a.pack} mode ${a.mode} player ${a.playerLevel} reqLevel ${a.reqLevel}`,
    });
  }
  for (const a of classLocked) {
    findings.push({
      severity: "warning",
      category: "xp-accept-early",
      pack: a.pack,
      stepId: "-",
      questId: a.questId,
      message: `quest ${a.questId} pack ${a.pack} mode ${a.mode} player ${a.playerLevel} reqLevel ${a.reqLevel} (class-locked trainer quest)`,
    });
  }
  if (gapWarns.length) {
    findings.push({
      severity: "warning",
      category: "xp-accept-below-req",
      pack: "-",
      stepId: "-",
      message: `${gapWarns.length} accepts 1–2 levels before reqLevel`,
    });
  }

  return {
    findings,
    earlyWarnCount: gapWarns.length + classLocked.length,
    earlyFailCount: earlyFails.length,
  };
}

export interface SimZone {
  name?: string;
  uiMapId?: number;
  parent?: number;
}

function stepPlainText(step: Step): string {
  return step.text.flatMap((line) => line.segments.map((s) => s.t)).join(" ");
}

function isGrindStep(step: Step): boolean {
  if (step.actions.some((a) => a.type === "xp")) return true;
  return /grind/i.test(stepPlainText(step));
}

/** Kill counts from grind prose ("about 149 kills"), not quest objective digits. */
export function parseGrindKillCount(text: string): number | undefined {
  const matches = [...text.matchAll(/\b(\d+)\s+kills?\b/gi)];
  if (!matches.length) return undefined;
  return Number(matches[matches.length - 1]![1]);
}

function parseGrindTargetLevel(text: string): number | undefined {
  const m = /to level\s+(\d+)/i.exec(text) ?? /until about level\s+(\d+)/i.exec(text) ?? /last bit to\s+(\d+)/i.exec(text);
  return m ? Number(m[1]) : undefined;
}

function grindMobId(step: Step, text: string): number | undefined {
  for (const a of step.actions) {
    if (a.type === "xp" && a.mobId != null) return a.mobId;
  }
  for (const a of step.actions) {
    if (a.type === "mob" && a.npcIds?.[0] != null) return a.npcIds[0];
  }
  const m = /\bnpc\s+(\d+)\b/i.exec(text);
  return m ? Number(m[1]) : undefined;
}

function grindGoto(step: Step): { mapId?: number; x?: number; y?: number; zone?: string } | undefined {
  for (const a of step.actions) {
    if (a.type === "goto" && a.at) return a.at;
  }
  return undefined;
}

function resolveZoneId(
  at: { mapId?: number; zone?: string },
  zones: ReadonlyMap<number, SimZone>,
): number | undefined {
  const byName: number[] = [];
  const byMap: number[] = [];
  for (const [id, z] of zones) {
    if (at.zone && z.name === at.zone) byName.push(id);
    if (at.mapId != null && z.uiMapId === at.mapId) byMap.push(id);
  }
  const pick = (ids: number[]) => {
    if (!ids.length) return undefined;
    const root = ids.find((id) => zones.get(id)?.parent == null);
    return root ?? ids[0];
  };
  return pick(byName) ?? pick(byMap);
}

function spawnPointsForZone(
  npc: SimNpc,
  zoneId: number | undefined,
  at: { mapId?: number },
  zones: ReadonlyMap<number, SimZone>,
): [number, number][] {
  const out: [number, number][] = [];
  if (!npc.spawns) return out;
  if (zoneId != null && npc.spawns[String(zoneId)]) out.push(...npc.spawns[String(zoneId)]!);
  if (out.length) return out;
  if (at.mapId == null) return out;
  for (const [zid, pts] of Object.entries(npc.spawns)) {
    if (zones.get(Number(zid))?.uiMapId === at.mapId) out.push(...pts);
  }
  return out;
}

const GRIND_WHY = /\b(spawn count|spawns?\b|dense|fast respawn|respawn)/i;
const GRIND_PIN_MAX = 8;

export function evaluateGrindIntegrity(
  guides: readonly Pick<Guide, "slug" | "steps">[],
  npcs: ReadonlyMap<number, SimNpc>,
  zones: ReadonlyMap<number, SimZone> = new Map(),
): Finding[] {
  const findings: Finding[] = [];
  for (const guide of guides) {
    for (const step of guide.steps) {
      if (!isGrindStep(step)) continue;
      const text = stepPlainText(step);
      const proseKills = parseGrindKillCount(text);
      const xpAct = step.actions.find((a) => a.type === "xp");
      const xpKill = xpAct?.type === "xp" ? parseGrindKillCount(xpAct.label) : undefined;
      if (proseKills != null && xpKill != null && proseKills !== xpKill) {
        findings.push({
          severity: "error",
          category: "GRIND_COUNT_MISMATCH",
          pack: guide.slug,
          stepId: step.id,
          message: `GRIND_COUNT_MISMATCH prose ${proseKills} kills vs type:xp label ${xpKill}`,
        });
      }
      if (proseKills != null && proseKills > 50) {
        findings.push({
          severity: "error",
          category: "GRIND_KILL_CAP",
          pack: guide.slug,
          stepId: step.id,
          message: `GRIND_KILL_CAP parsed kill count ${proseKills} > 50`,
        });
      } else if (proseKills != null && proseKills > 30 && !GRIND_WHY.test(text)) {
        findings.push({
          severity: "error",
          category: "GRIND_KILL_UNDOCUMENTED",
          pack: guide.slug,
          stepId: step.id,
          message: `GRIND_KILL_UNDOCUMENTED parsed kill count ${proseKills} > 30 without spawn/dense/respawn reason in step text`,
        });
      }
      const mobId = grindMobId(step, text);
      const targetLevel = (xpAct?.type === "xp" ? xpAct.level : undefined) ?? parseGrindTargetLevel(text);
      if (mobId != null) {
        const npc = npcs.get(mobId);
        if (!npc) {
          findings.push({
            severity: "error",
            category: "GRIND_MOB_SPAWNS",
            pack: guide.slug,
            stepId: step.id,
            message: `GRIND_MOB_SPAWNS npc ${mobId} is missing from npcs.json`,
          });
        } else {
          if (isHordeFriendlyNpc(npc)) {
            findings.push({
              severity: "error",
              category: "GRIND_MOB_FRIENDLY",
              pack: guide.slug,
              stepId: step.id,
              message: `GRIND_MOB_FRIENDLY npc ${mobId} (${npc.name ?? "?"}) is friendly`,
            });
          }
          if (npcSpawnCount(npc) < 3) {
            findings.push({
              severity: "error",
              category: "GRIND_MOB_SPAWNS",
              pack: guide.slug,
              stepId: step.id,
              message: `GRIND_MOB_SPAWNS npc ${mobId} has ${npcSpawnCount(npc)} spawn points (need ≥ 3)`,
            });
          }
          if (targetLevel != null) {
            const min = npc.minLevel;
            const max = npc.maxLevel;
            const lo = targetLevel - 1;
            const hi = targetLevel + 2;
            const minOk = typeof min === "number";
            const maxOk = typeof max === "number";
            // Overlap of [min, max] with [lo, hi]. A missing side fails closed only when the known side is outside the window.
            const out = minOk && maxOk
              ? max < lo || min > hi
              : minOk
                ? min < lo || min > hi
                : maxOk
                  ? max < lo || max > hi
                  : false;
            if (out) {
              findings.push({
                severity: "error",
                category: "GRIND_MOB_LEVEL",
                pack: guide.slug,
                stepId: step.id,
                message: `GRIND_MOB_LEVEL npc ${mobId} level ${min ?? "?"}-${max ?? "?"} outside target ${targetLevel} window ${lo}..${hi}`,
              });
            }
          }
          const goto = grindGoto(step);
          if (!goto || (goto.x == null && goto.mapId == null && !goto.zone)) {
            findings.push({
              severity: "warning",
              category: "GRIND_PIN_UNCHECKED",
              pack: guide.slug,
              stepId: step.id,
              message: `GRIND_PIN_UNCHECKED no goto pin to compare against npc ${mobId} spawns`,
            });
          } else {
            const zoneId = resolveZoneId(goto, zones);
            if (zoneId == null && goto.mapId == null && !goto.zone) {
              findings.push({
                severity: "warning",
                category: "GRIND_PIN_UNCHECKED",
                pack: guide.slug,
                stepId: step.id,
                message: `GRIND_PIN_UNCHECKED cannot resolve zone for npc ${mobId}`,
              });
            } else if (zoneId == null && goto.mapId == null) {
              findings.push({
                severity: "warning",
                category: "GRIND_PIN_UNCHECKED",
                pack: guide.slug,
                stepId: step.id,
                message: `GRIND_PIN_UNCHECKED cannot resolve zone for npc ${mobId}`,
              });
            } else if (goto.x == null || goto.y == null) {
              findings.push({
                severity: "warning",
                category: "GRIND_PIN_UNCHECKED",
                pack: guide.slug,
                stepId: step.id,
                message: `GRIND_PIN_UNCHECKED goto pin missing percent coords for npc ${mobId}`,
              });
            } else {
              const pts = spawnPointsForZone(npc, zoneId, goto, zones);
              if (zoneId == null && !pts.length) {
                findings.push({
                  severity: "warning",
                  category: "GRIND_PIN_UNCHECKED",
                  pack: guide.slug,
                  stepId: step.id,
                  message: `GRIND_PIN_UNCHECKED cannot resolve zone for npc ${mobId}`,
                });
              } else {
                const far = pts.every(([x, y]) => Math.hypot(x - goto.x!, y - goto.y!) > GRIND_PIN_MAX);
                if (!pts.length || far) {
                  findings.push({
                    severity: "error",
                    category: "GRIND_PIN_FAR",
                    pack: guide.slug,
                    stepId: step.id,
                    message: `GRIND_PIN_FAR goto ${goto.x.toFixed(1)}, ${goto.y.toFixed(1)} is > ${GRIND_PIN_MAX} from every spawn of npc ${mobId}`,
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return findings;
}

function loadZones(root: string): Map<number, SimZone> {
  const path = join(root, "content/questie-db/zones.json");
  if (!existsSync(path)) return new Map();
  const raw = readJson(path) as Record<string, SimZone>;
  const out = new Map<number, SimZone>();
  for (const [k, z] of Object.entries(raw)) {
    const id = Number(k);
    if (Number.isFinite(id) && z) out.set(id, z);
  }
  return out;
}

export function printXpIntegrityConsole(report: Pick<IntegrityReport, "findings" | "xpEarlyWarnCount" | "xpEarlyFailCount">): void {
  for (const finding of report.findings) {
    if (finding.category === "xp-end-level" || finding.category === "xp-handoff") {
      console.error(`integrity: ${finding.message}`);
    }
  }
  if (report.xpEarlyFailCount) {
    const rows = report.findings.filter(
      (finding) => finding.category === "xp-accept-early" && finding.severity === "error",
    );
    console.error(`integrity: ${report.xpEarlyFailCount} accepts 3+ levels before reqLevel:`);
    for (const row of rows.slice(0, EARLY_ACCEPT_PRINT_CAP)) {
      console.error(`  ${row.message}`);
    }
    if (rows.length > EARLY_ACCEPT_PRINT_CAP) {
      console.error(`  … ${rows.length - EARLY_ACCEPT_PRINT_CAP} more`);
    }
  }
  if (report.xpEarlyWarnCount) {
    console.warn(`integrity: ${report.xpEarlyWarnCount} accepts below reqLevel (warning, not a failure)`);
  }
}

function sortFindings(findings: Finding[]): Finding[] {
  const rank: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  findings.sort(
    (a, b) =>
      rank[a.severity] - rank[b.severity] ||
      a.category.localeCompare(b.category) ||
      (a.race ?? "").localeCompare(b.race ?? "") ||
      a.pack.localeCompare(b.pack) ||
      a.stepId.localeCompare(b.stepId) ||
      (a.questId ?? 0) - (b.questId ?? 0),
  );
  return findings;
}

export function findIntegrityIssues(guides: readonly Guide[], index: GuideIndex, quests: readonly QuestInfo[]): Finding[] {
  const byId = new Map(quests.map((quest) => [quest.id, quest]));
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const findings: Finding[] = [];

  for (const guide of guides) {
    for (const step of guide.steps) {
      for (const action of step.actions) {
        const id = questIdOf(action);
        if (id === undefined || byId.has(id)) continue;
        push(findings, {
          severity: "error",
          category: "missing-quest",
          pack: guide.slug,
          stepId: step.id,
          questId: id,
          message: `quest ${id} is not in quests.json`,
        });
      }
    }
  }

  checkSteps(guides, byId, findings);
  for (const chain of chainsFor(index, bySlug)) checkChain(chain, byId, findings);
  return sortFindings(findings);
}

function counts(findings: readonly Finding[]): Pick<IntegrityReport, "errors" | "warnings" | "info"> {
  return {
    errors: findings.filter((finding) => finding.severity === "error").length,
    warnings: findings.filter((finding) => finding.severity === "warning").length,
    info: findings.filter((finding) => finding.severity === "info").length,
  };
}

function toMarkdown(report: IntegrityReport): string {
  const lines = [
    "# Guide integrity",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `| Severity | Count |`,
    `| --- | ---: |`,
    `| error | ${report.errors} |`,
    `| warning | ${report.warnings} |`,
    `| info | ${report.info} |`,
    "",
  ];
  const categories = [...new Set(report.findings.map((finding) => finding.category))];
  for (const category of categories) {
    const rows = report.findings.filter((finding) => finding.category === category);
    lines.push(`## ${category}`, "");
    lines.push(`| Severity | Race | Pack | Step | Quest | Message |`, `| --- | --- | --- | --- | --- | --- |`);
    for (const row of rows) {
      const message = row.message.replace(/\|/g, "\\|");
      lines.push(`| ${row.severity} | ${row.race ?? ""} | ${row.pack} | ${row.stepId} | ${row.questId ?? ""} | ${message} |`);
    }
    lines.push("");
  }
  if (!report.findings.length) lines.push("No findings.", "");
  return lines.join("\n");
}

export function loadBuiltData(dataDir: string): { guides: Guide[]; index: GuideIndex; quests: QuestInfo[] } {
  const indexPath = join(dataDir, "guide_index.json");
  const questsPath = join(dataDir, "quests-min.json");
  const guideDir = join(dataDir, "guides");
  if (!existsSync(indexPath) || !existsSync(questsPath) || !existsSync(guideDir)) {
    throw new Error(`built data not found under ${dataDir} (need guide_index.json, quests-min.json, guides/)`);
  }
  const index = readJson(indexPath) as GuideIndex;
  const questsRaw = readJson(questsPath);
  if (!Array.isArray(questsRaw)) throw new Error("quests-min.json: expected an array");
  const guides: Guide[] = [];
  for (const name of readdirSync(guideDir).filter((file) => file.endsWith(".json")).sort()) {
    const parsed = readJson(join(guideDir, name)) as Guide;
    if (!parsed || !Array.isArray(parsed.steps)) throw new Error(`guides/${name}: expected a guide with steps`);
    guides.push(parsed);
  }
  return { guides, index, quests: questsRaw as QuestInfo[] };
}

/** Run the check, write `integrity.md` and `integrity.json`, and return counts. */
export function runIntegrity(opts: IntegrityOptions = {}): IntegrityReport & { exitCode: number } {
  const dataDir = opts.dataDir ?? join(ROOT, "web/public/data");
  const reportDir = opts.reportDir ?? join(ROOT, "data/reports");
  const { guides, index, quests } = loadBuiltData(dataDir);
  const findings = findIntegrityIssues(guides, index, quests);
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const tables = loadSimTables(ROOT);
  const { report: xpReport } = simulateGuides(guides, tables, opts.now ?? new Date().toISOString());
  const questById = new Map(quests.map((quest) => [quest.id, quest]));
  const xp = evaluateXpIntegrity(xpReport, bySlug, LEVELING_CHAINS, questById);
  findings.push(...xp.findings);
  findings.push(...evaluateGrindIntegrity(guides, tables.npcs, loadZones(ROOT)));
  sortFindings(findings);
  const report: IntegrityReport = {
    generatedAt: opts.now ?? new Date().toISOString(),
    ...counts(findings),
    findings,
    xpEarlyWarnCount: xp.earlyWarnCount,
    xpEarlyFailCount: xp.earlyFailCount,
  };
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(join(reportDir, "integrity.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(reportDir, "integrity.md"), toMarkdown(report));
  const failOnError = opts.failOnError !== false;
  const exitCode = failOnError && report.errors > 0 ? 1 : 0;
  return { ...report, exitCode };
}

function main(argv: string[]): number {
  const arg = (name: string, dflt: string) => {
    const i = argv.indexOf(name);
    return i >= 0 && argv[i + 1] ? argv[i + 1]! : dflt;
  };
  try {
    // Fail fast on dungeon integration-plan violations (same checks as `npm run data`).
    const researchDir = join(ROOT, "research");
    const plan = loadIntegrationPlan(researchDir);
    if (plan) {
      const planErrors = validateDungeonPlan(plan, loadDossiers(researchDir), loadRouteTimeline(researchDir));
      if (planErrors.length) {
        console.error(`integrity: dungeon plan validation failed:\n- ${planErrors.map((e) => e.message).join("\n- ")}`);
        return 1;
      }
    }

    const result = runIntegrity({
      dataDir: arg("--data", join(ROOT, "web/public/data")),
      reportDir: arg("--reports", join(ROOT, "data/reports")),
    });
    const where = relative(ROOT, arg("--reports", join(ROOT, "data/reports")));
    console.log(`integrity: ${result.errors} errors, ${result.warnings} warnings, ${result.info} info → ${where}/integrity.md`);
    printXpIntegrityConsole(result);
    const grind = result.findings.filter((f) => f.category.startsWith("GRIND_"));
    if (grind.length) {
      const ge = grind.filter((f) => f.severity === "error").length;
      const gw = grind.filter((f) => f.severity === "warning").length;
      console.error(`integrity: ${ge} grind errors, ${gw} grind warnings (${grind.length} GRIND_ findings)`);
    }
    return result.exitCode;
  } catch (error) {
    console.error(`integrity: ${(error as Error).message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
