/**
 * Build-time data wiring (runs on `predev` / `prebuild`).
 *
 *   node --experimental-strip-types scripts/build-data.ts [--research DIR] [--out DIR]
 *
 * Discovers every route-v2 pack under `research/` (segment folders with a `pack.json` manifest, see
 * docs/ROUTE_FILES.md, and any `*.json` whose top level is
 * `{ "schema": "project-forever/route", "version": 2 }`; `tools/`, `catalog/` and `node_modules/` are skipped),
 * validates each against `contracts/route-v2.schema.json` (errors fail the build), enforces the route rules,
 * joins `research/professions/profession_hooks.json` onto steps, and writes the site data the UI loads from
 * `web/public/data/` (git-ignored; never commit it):
 *
 *   landing.json             steps / quests / zones totals for the landing page
 *   manifest.json            packs by level range + route counts (DataManifest below)
 *   guide_index.json         GuideIndex (brackets + race starts) for the timeline / overview
 *   guides/<packId>.json     one Guide per pack (steps untouched apart from n / section / enforced fields)
 *   quests-min.json, quests-geo.json, quests-detail.json, zones.json
 *   class_professions.json, profession_hooks.json (tips_matrix.json is not published)
 *   search-index.json        MiniSearch corpus
 *
 * Rules: quests 79953 and 81951 (low-confidence Forever quests) are stripped from every route with a warning;
 * any step that uses a `forever: true` quest is forced to `verified: false` (warning when it said true).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import type {
  ClassProfessionsFile,
  Giver,
  Guide,
  GuideIndex,
  QuestDetail,
  QuestGeo,
  QuestMin,
  Insights,
  MapPoint,
  Pin,
  ProfessionHook,
  QuestInfo,
  RoutePack,
  RouteStyle,
  Section,
  Step,
  TipsMatrixFile,
  ZoneInfo,
} from "../../contracts/schema.ts";
import { buildSearchDocs } from "../src/search/build.ts";
import { assertNoDuplicateTurnIns, type TurnInPack } from "./turnin-check.ts";
import { expandDungeonPlaceholders, makeExpandContext, routesOf, type ExpandContext, type ExpandStats } from "./expandDungeons.ts";
import { assertBuiltPickupHubs, assertPlannedRunsPresent, loadDossiers, loadIntegrationPlan, loadRouteTimeline, validateDungeonPlan } from "./dungeonPlan.ts";
import { RACE_STARTS, checkPrereqs, formatPrereqViolations, validateAllowlist, type AllowlistEntry, type PrereqPack } from "./prereq-check.ts";
import { runIntegrity } from "./guide-integrity.ts";
import { enrichCompleteSteps } from "./enrich-complete.ts";
import { compactSteps } from "./compact-steps.ts";
import { runXpSimPipeline, writeDungeonOnSim } from "./xp-sim.ts";
import { discoverPacks as discoverRoutePacks } from "./routeSource.ts";
import { isChainTerminal, resolveNextGuide } from "../src/lib/routeChains.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const EXCLUDED_QUESTS: ReadonlySet<number> = new Set([79953, 81951]);

// ---------- types ----------

export interface ManifestPack {
  id: string;
  title: string;
  levels: [number, number];
  /** Path under `web/public/data/`. */
  file: string;
  /** Source file, repo-relative. */
  source: string;
  kind: "leveling" | "dungeons";
  steps: number;
  routes: Record<RouteStyle, number>;
  dungeonSteps: number;
  zones: string[];
}

export interface DataManifest {
  schema: "project-forever/data-manifest";
  version: 1;
  generatedAt: string;
  packs: ManifestPack[];
  /** Pack ids grouped by "<min>-<max>" label, in level order. */
  byLevel: { label: string; levels: [number, number]; packs: string[] }[];
  /** Pack ids per route (a pack is listed when it has at least one step on that route). */
  routes: Record<RouteStyle, string[]>;
  files: { guideIndex: string; questsMin: string; questsGeo: string; questsDetail: string; questSteps: string; insights: string; zones: string; classProfessions: string; professionHooks: string; trainers: string; goldPlan: string; searchIndex: string };
  stats: { strippedSteps: number; forcedUnverified: number; hooksJoined: number; hooksSkipped: number };
  /** Dungeon placeholder expansion per leveling pack (see expandDungeons.ts). */
  dungeonExpansion: Record<string, ExpandStats>;
  /** How many integration-plan race×route blocks contributed anchors during the build. */
  anchorBlocks?: number;
  warnings: string[];
}

interface QdbQuest {
  id: number; name?: string; level?: number; reqLevel?: number; races?: number; classes?: number; zoneId?: number; zone?: string;
  start?: { npc?: number[]; object?: number[]; item?: number[] }; end?: { npc?: number[]; object?: number[] };
  objectives?: { creatures?: { id: number }[]; items?: { id: number }[]; objects?: { id: number }[] };
  objectivesText?: string[]; pre?: { single?: number[]; group?: number[] }; next?: number; breadcrumbFor?: number;
  exclusiveTo?: number[]; xp?: number; repeatable?: boolean; forever?: boolean;
}
interface QdbSpawned { id: number; name?: string; spawns?: Record<string, number[][]>; npcDrops?: number[] }
interface QdbZone { name?: string; uiMapId?: number; parent?: number; continent?: number }
export interface QuestDb {
  quests: Record<string, QdbQuest>;
  npcs: Record<string, QdbSpawned>;
  objects: Record<string, QdbSpawned>;
  items: Record<string, QdbSpawned>;
  zones: Record<string, QdbZone>;
}

/** Raw entry of research/professions/profession_hooks.json. */
export interface HookEntry {
  hookId?: string;
  zone?: string;
  levels?: string;
  kind?: string;
  professionHook: ProfessionHook & Record<string, unknown>;
}

// ---------- discovery + validation ----------

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

/** Every route-v2 pack under `dir`: single files and segment folders (see routeSource.ts). */
export function discoverPacks(dir: string): { path: string; pack: RoutePack }[] {
  return discoverRoutePacks(dir) as unknown as { path: string; pack: RoutePack }[];
}

export function makeValidators(schemaPath = join(ROOT, "contracts/route-v2.schema.json")) {
  const AjvCtor = ((Ajv2020 as unknown as { default?: unknown }).default ?? Ajv2020) as typeof Ajv2020;
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  const schema = readJson<{ $id: string }>(schemaPath);
  ajv.addSchema(schema);
  const ref = (def: string) => ajv.getSchema(`${schema.$id}#/$defs/${def}`)!;
  return {
    pack: ajv.getSchema(schema.$id)!,
    hook: ref("ProfessionHook"),
    classProfessions: ref("ClassProfessionsFile"),
    tipsMatrix: ref("TipsMatrixFile"),
  };
}

function fmtErrors(errors: unknown): string {
  return ((errors as { instancePath: string; message?: string }[] | null) ?? [])
    .slice(0, 8)
    .map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`)
    .join("; ");
}

// ---------- rules ----------

export function stepQuestIds(step: Step): number[] {
  const ids = new Set<number>();
  for (const a of step.actions) if ("questId" in a && typeof a.questId === "number") ids.add(a.questId);
  for (const id of step.bonus?.questIds ?? []) ids.add(id);
  return [...ids];
}

/** Strip excluded quests and force `verified: false` on steps using Forever quests. Returns new steps. */
export function enforceRules(
  packId: string,
  steps: readonly Step[],
  isForever: (questId: number) => boolean,
  warnings: string[],
  issues: Insights["issues"] = [],
): { steps: Step[]; stripped: number; forced: number } {
  let stripped = 0;
  let forced = 0;
  const out: Step[] = [];
  for (const s of steps) {
    const ids = stepQuestIds(s);
    const bad = ids.filter((id) => EXCLUDED_QUESTS.has(id));
    if (bad.length) {
      stripped++;
      warnings.push(`${packId}: stripped step ${s.id} (excluded quest ${bad.join(", ")})`);
      for (const q of bad) issues.push({ severity: "warn", guide: packId, questId: q, msg: ISSUE_LEFT_OUT });
      continue;
    }
    if (ids.some(isForever) && s.verified !== false) {
      forced++;
      warnings.push(`${packId}: step ${s.id} uses a Forever quest; verified forced to false`);
      issues.push({ severity: "info", guide: packId, step: s.id, msg: ISSUE_UNCHECKED });
      out.push({ ...s, verified: false });
      continue;
    }
    out.push(s);
  }
  return { steps: out, stripped, forced };
}

// ---------- step zone / level ----------

export function stepZone(step: Step): string | undefined {
  for (const a of step.actions) if (a.type === "goto" && a.at.zone) return a.at.zone;
  for (const p of step.pins ?? []) if (p.kind !== "mobArea" && p.at.zone) return p.at.zone;
  for (const p of step.pins ?? []) if (p.kind === "mobArea") return p.zone;
  return undefined;
}

function stepMapId(step: Step): number | undefined {
  for (const a of step.actions) if (a.type === "goto" && a.at.mapId) return a.at.mapId;
  for (const p of step.pins ?? []) if (p.kind !== "mobArea") return p.at.mapId;
  return undefined;
}

/** Estimated character level per step: highest quest level / xp target seen so far, starting at the pack minimum. */
export function stepLevels(steps: readonly Step[], packMin: number, questLevel: (id: number) => number | undefined): number[] {
  let cur = packMin;
  return steps.map((s) => {
    let lv: number | undefined;
    for (const a of s.actions) {
      if (a.type === "xp") lv = Math.max(lv ?? 0, a.level);
      if ((a.type === "accept" || a.type === "turnin" || a.type === "complete") && typeof a.questId === "number") {
        const q = questLevel(a.questId);
        if (q && q > 0 && q <= 60) lv = Math.max(lv ?? 0, q);
      }
    }
    if (lv && lv > cur) cur = lv;
    return cur;
  });
}

/** "4810 (cascade), 6135 (missing; balanced only)" style list of every unique quest the prerequisite guard dropped. */
export function skippedQuestSummary(skips: readonly { questId: number; route: string; reason: string }[]): string {
  const by = new Map<number, { routes: Set<string>; reasons: Set<string> }>();
  for (const s of skips) {
    const e = by.get(s.questId) ?? { routes: new Set<string>(), reasons: new Set<string>() };
    e.routes.add(s.route);
    e.reasons.add(s.reason);
    by.set(s.questId, e);
  }
  const allRoutes = new Set(skips.map((s) => s.route));
  return [...by.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([q, e]) => {
      const routeNote = e.routes.size < allRoutes.size || allRoutes.size === 1 ? `; ${[...e.routes].sort().join("+")} only` : "";
      return `${q} (${[...e.reasons].sort().join("/")}${routeNote})`;
    })
    .join(", ");
}

// ---------- profession hook join ----------

export function parseLevels(s: string | undefined): [number, number] | null {
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(s ?? "");
  return m ? [Number(m[1]), Number(m[2])] : null;
}

function hookKey(h: ProfessionHook): string {
  return [h.profession, h.itemId ?? h.itemName ?? "", h.npc?.id ?? "", h.note].join("|");
}

/**
 * Attach each hook to the first step (per pack) whose zone matches the hook zone (or, failing that, the hook
 * NPC's zone, e.g. writ turn-ins) and whose estimated level lies in the hook level range. No duplicates.
 * Hooks with an NPC with coordinates also add an NPC pin; hooks without one get no pin. Verified flags are kept.
 */
export function joinHooks(
  steps: Step[],
  levels: readonly number[],
  hooks: readonly HookEntry[],
  mapIdForZone: (zone: string) => number | undefined,
): number {
  let joined = 0;
  for (const h of hooks) {
    const range = parseLevels(h.levels);
    const hook = cleanHook(h.professionHook);
    const zones = [h.zone, hook.npc?.zone].filter((z): z is string => !!z);
    let idx = -1;
    for (const z of zones) {
      idx = steps.findIndex((s, i) => stepZone(s) === z && (!range || (levels[i]! >= range[0] && levels[i]! <= range[1])));
      if (idx >= 0) break;
    }
    if (idx < 0) continue;
    const step = steps[idx]!;
    const list = step.professionHooks ?? [];
    const already = list.some((x) => hookKey(x) === hookKey(hook));
    const next: Step = already ? { ...step } : { ...step, professionHooks: [...list, hook] };
    const npc = hook.npc;
    const mapId = npc ? (npc.mapId ?? mapIdForZone(npc.zone)) : undefined;
    if (npc && mapId && Number.isFinite(npc.x) && Number.isFinite(npc.y)) {
      const pins = step.pins ?? [];
      if (!pins.some((p) => p.kind === "npc" && p.npcId === npc.id)) {
        const pin: Pin = { kind: "npc", npcId: npc.id, name: npc.name, at: { mapId, zone: npc.zone, x: npc.x, y: npc.y }, sources: hook.sources, verified: hook.verified };
        next.pins = [...pins, pin];
      }
    }
    steps[idx] = next;
    if (!already) joined++;
  }
  return joined;
}

/**
 * Every hook on a step whose NPC has coordinates gets an NPC pin, including hooks that research packs embed
 * directly on their steps (which joinHooks never sees). Returns the number of pins added.
 */
export function ensureHookPins(steps: Step[], mapIdForZone: (zone: string) => number | undefined): number {
  let added = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    let pins = step.pins ?? [];
    let changed = false;
    for (const hook of step.professionHooks ?? []) {
      const npc = hook.npc;
      if (!npc || !Number.isFinite(npc.x) || !Number.isFinite(npc.y)) continue;
      const mapId = npc.mapId ?? mapIdForZone(npc.zone);
      if (!mapId || pins.some((p) => p.kind === "npc" && p.npcId === npc.id)) continue;
      pins = [...pins, { kind: "npc", npcId: npc.id, name: npc.name, at: { mapId, zone: npc.zone, x: npc.x, y: npc.y }, sources: hook.sources, verified: hook.verified }];
      changed = true;
      added++;
    }
    if (changed) steps[i] = { ...step, pins };
  }
  return added;
}

/** Keep only ProfessionHook schema fields (research rows carry extra bookkeeping). */
export function cleanHook(h: ProfessionHook & Record<string, unknown>): ProfessionHook {
  const out: ProfessionHook = { profession: h.profession, note: h.note, sources: h.sources ?? [], verified: h.verified === true };
  if (typeof h.itemId === "number") out.itemId = h.itemId;
  if (typeof h.itemName === "string") out.itemName = h.itemName;
  if (typeof h.qty === "number") out.qty = h.qty;
  if (typeof h.skillTarget === "number") out.skillTarget = h.skillTarget;
  if (h.npc && typeof h.npc.id === "number" && typeof h.npc.x === "number" && typeof h.npc.y === "number") {
    out.npc = { id: h.npc.id, name: h.npc.name, zone: h.npc.zone, x: h.npc.x, y: h.npc.y };
    if (typeof h.npc.mapId === "number") out.npc.mapId = h.npc.mapId;
  }
  return out;
}

// ---------- pack → Guide ----------

function sectionsFor(packId: string, steps: Step[]): Section[] {
  const sections: Section[] = [];
  let cur: Section | undefined;
  let lastZone: string | undefined;
  let lastMap: number | undefined;
  for (const s of steps) {
    const zone = stepZone(s) ?? lastZone ?? "Unknown";
    const mapId = stepMapId(s) ?? lastMap ?? 0;
    if (!cur || cur.zone !== zone) {
      const n = sections.filter((x) => x.zone === zone).length + 1;
      cur = { id: `${packId}:${zone.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${n}`, mapId, zone, firstStep: s.id, lastStep: s.id, stops: [], route: [] };
      sections.push(cur);
    }
    cur.lastStep = s.id;
    for (const a of s.actions) if (a.type === "goto" && a.at.mapId === cur.mapId && !(a.at.x === 0 && a.at.y === 0)) cur.route.push({ x: a.at.x, y: a.at.y });
    s.section = cur.id;
    lastZone = zone;
    lastMap = mapId;
  }
  return sections;
}

/** Route notes players read on the dashboard and Overview: plain words, no step or quest ids. */
export const ISSUE_UNCHECKED = "New WoW Forever quest, not checked in game yet. Names, spots or counts may be slightly off.";
export const ISSUE_LEFT_OUT = "Left out of the route: a new WoW Forever quest we could not confirm yet.";

/**
 * Reader-facing guide title. Pack titles carry authoring hints ("(Horde)", "13-60", "(dungeons toggle)")
 * the site already shows elsewhere: every page is in the Horde section, and headers and the timeline show
 * the level range. "Durotar 1-12 (Horde)" → "Durotar", "Horde dungeon quests 13-60 (dungeons toggle)" → "Dungeon quests".
 */
export function guideTitle(raw: string): string {
  const t = raw
    .replace(/\s*\((?:[^)]*\bhorde\b[^)]*|[^)]*\btoggle\b[^)]*)\)/gi, "")
    .replace(/^\s*horde\s+/i, "")
    .replace(/\s+\d+\s*[-–]\s*\d+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : raw.trim();
}

export function packToGuide(pack: RoutePack, steps: Step[]): Guide {
  const numbered = steps.map((s, i) => ({ ...s, n: i + 1 }));
  const sections = sectionsFor(pack.id ?? "pack", numbered);
  const zones = [...new Set(sections.map((s) => s.zone).filter((z) => z !== "Unknown"))];
  const [min, max] = pack.levels ?? [1, 60];
  return {
    slug: pack.id ?? "pack",
    name: pack.title ?? pack.id ?? "pack",
    displayName: guideTitle(pack.title ?? pack.id ?? "pack"),
    subgroup: isDungeonPack(pack, numbered) ? "Dungeons" : "Leveling",
    minLevel: min,
    maxLevel: max,
    zones,
    source: "builtin",
    sections,
    steps: numbered,
  };
}

function isDungeonPack(pack: RoutePack, steps: readonly Step[]): boolean {
  return steps.length > 0 && steps.filter((s) => s.dungeon).length / steps.length > 0.5 || /dungeon/i.test(pack.id ?? "");
}

export function routeCounts(steps: readonly Step[]): Record<RouteStyle, number> {
  const c = { balanced: 0, speedrun: 0 };
  for (const s of steps) {
    const r = s.routes?.length ? s.routes : s.bonus ? ["balanced"] : ["balanced", "speedrun"];
    for (const x of r) c[x as RouteStyle]++;
  }
  return c;
}

/** Race starts for packs that begin at level 1 (vanilla Horde starting zones). */
const START_ZONES: Record<string, string[]> = {
  "Durotar": ["Orc", "Troll"],
  "Valley of Trials": ["Orc", "Troll"],
  "Mulgore": ["Tauren"],
  "Red Cloud Mesa": ["Tauren"],
  "Tirisfal Glades": ["Undead"],
  "Deathknell": ["Undead"],
  "Zephras Isle": ["Skyborne"],
};

/** Distinct step-id prefixes for one guide. The slug is always first; other prefixes are sorted. */
export function guideIdPrefixes(g: Guide): string[] {
  const rest = new Set<string>();
  for (const s of g.steps) {
    const i = s.id.indexOf(":");
    const prefix = i === -1 ? s.id : s.id.slice(0, i);
    if (prefix && prefix !== g.slug) rest.add(prefix);
  }
  return [g.slug, ...[...rest].sort()];
}

/**
 * Fill `idPrefixes` on each bracket from that guide's own step list.
 * A prefix may be shared by several guides; the map is slug → prefixes, not prefix → slug.
 */
export function attachIdPrefixes(index: GuideIndex, guides: readonly Guide[]): void {
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  for (const bracket of index.brackets) {
    const idPrefixes: NonNullable<(typeof bracket)["idPrefixes"]> = {};
    for (const slug of bracket.guides) {
      const g = bySlug.get(slug);
      idPrefixes[slug] = g ? guideIdPrefixes(g) : [slug];
    }
    bracket.idPrefixes = idPrefixes;
  }
}

export function buildIndex(guides: Guide[], generatedAt: string, packBracket?: ReadonlyMap<string, string>): GuideIndex {
  // Still build dungeon packs (steps are copied into leveling guides) but hide the standalone dungeon bracket.
  const indexed = guides.filter((g) => g.subgroup !== "Dungeons");
  const dng = (g: Guide) => (g.subgroup === "Dungeons" ? 1 : 0);
  const ordered = [...indexed].sort((a, b) => dng(a) - dng(b) || a.minLevel - b.minLevel || a.maxLevel - b.maxLevel || a.slug.localeCompare(b.slug));
  const brackets: GuideIndex["brackets"] = [];
  for (const g of ordered) {
    const fromPack = packBracket?.get(g.slug)?.trim();
    const label = fromPack ? fromPack : `${g.minLevel}-${g.maxLevel}`;
    const b = brackets.find((x) => x.label === label);
    if (b) b.guides.push(g.slug);
    else brackets.push({ label, guides: [g.slug] });
  }
  const starts: GuideIndex["starts"] = [];
  for (const g of ordered) {
    if (g.minLevel !== 1 || g.subgroup === "Dungeons") continue;
    const zone = g.zones.find((z) => START_ZONES[z]);
    if (zone) starts.push({ race: START_ZONES[zone]!, label: zone, firstGuide: g.slug });
  }
  // `next`: a non-empty pack `next` wins. `nextByRoute` comes from the shared route chains.
  // Leveling guides that are still unlinked fall back to the next later level band, with a warning.
  // The final wrapup pack has no successor and does not warn. Dungeon packs are not in `ordered`.
  for (const g of ordered) {
    const byRoute: Partial<Record<RouteStyle, string>> = {};
    for (const style of ["balanced", "speedrun"] as const) {
      const slug = resolveNextGuide(g.slug, style);
      if (slug) byRoute[style] = slug;
    }
    if (byRoute.balanced || byRoute.speedrun) g.nextByRoute = byRoute;
    if (g.next?.trim()) {
      g.next = g.next.trim();
      continue;
    }
    if (isChainTerminal(g.slug)) continue;
    console.warn(`buildIndex: ${g.slug} has no next; fell back to the minLevel guess`);
    const nxt = ordered.find((x) => x.minLevel > g.minLevel && x.minLevel <= g.maxLevel + 1 && x !== g);
    if (nxt) g.next = nxt.slug;
  }
  return { generatedAt, brackets, starts };
}

/** Step ids for every guide the index lists, in bracket order. */
export function guideIndexEntries(index: GuideIndex, guides: readonly Guide[]): GuideIndex["entries"] {
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const fallback = fallbackStepMinutes(guides);
  const entries: NonNullable<GuideIndex["entries"]> = [];
  for (const bracket of index.brackets) {
    for (const slug of bracket.guides) {
      const g = bySlug.get(slug);
      const stepIds = g?.steps.map((s) => s.id) ?? [];
      entries.push({
        slug,
        ...(g ? { title: g.displayName, minLevel: g.minLevel, maxLevel: g.maxLevel, ...guideMinutes(g, fallback), ...guideStartLevel(g) } : {}),
        stepIds,
        stepCount: stepIds.length,
      });
    }
  }
  return entries;
}

/** XP-sim level at the first simulated step, per route (the start picker places a level on the route with it). */
export function guideStartLevel(g: Guide): { startLevel?: Partial<Record<RouteStyle, number>> } {
  const out: Partial<Record<RouteStyle, number>> = {};
  for (const r of ["balanced", "speedrun"] as const) {
    const lv = g.steps.find((s) => s.sim?.[r]?.level !== undefined)?.sim?.[r]?.level;
    if (lv !== undefined) out[r] = Math.round(lv * 100) / 100;
  }
  return Object.keys(out).length ? { startLevel: out } : {};
}

/**
 * Minutes per step for steps with no authored `minutes`: the mean of the authored ones (the
 * 20–60 packs carry per-step minutes; the 1–20 packs do not yet). The mean, not the median: many
 * authored steps are 0.5-minute hand-ins, and the long kill loops are what make up the time.
 * 1.5 when nothing is authored.
 */
export function fallbackStepMinutes(guides: readonly Guide[]): number {
  const all = guides.flatMap((g) => g.steps.map((s) => s.minutes).filter((m): m is number => typeof m === "number" && m > 0));
  if (!all.length) return 1.5;
  return Math.round((all.reduce((a, b) => a + b, 0) / all.length) * 100) / 100;
}

/**
 * Expected play minutes for a guide on each route, solo (dungeon steps left out). `minutesEstimated`
 * is true when some steps had no authored minutes and used the fallback.
 */
export function guideMinutes(g: Guide, fallback: number): { minutes: Record<RouteStyle, number>; minutesEstimated?: true } {
  const minutes = { balanced: 0, speedrun: 0 } as Record<RouteStyle, number>;
  let estimated = false;
  for (const s of g.steps) {
    // Dungeons off (the default): same rule as `isDungeonHidden` in src/state/visibility.ts.
    const dungeonCond = s.conditions.find((c) => c.cmd === "dungeon");
    if (s.dungeon || (!s.dungeonsOff && dungeonCond && !/^\s*!/.test(dungeonCond.args))) continue;
    const m = typeof s.minutes === "number" && s.minutes > 0 ? s.minutes : ((estimated = true), fallback);
    // Route membership: same rule as `stepRoutes` (explicit routes, else bonus → balanced only).
    const routes = s.routes?.length ? s.routes : s.bonus ? (["balanced"] as const) : (["balanced", "speedrun"] as const);
    for (const r of routes) minutes[r] += m;
  }
  minutes.balanced = Math.round(minutes.balanced);
  minutes.speedrun = Math.round(minutes.speedrun);
  return estimated ? { minutes, minutesEstimated: true } : { minutes };
}

/** Published guides omit `step.sources`. A source list with no `verified: true` stays unverified. */
export function publishGuide(guide: Guide): Guide {
  const copy = structuredClone(guide);
  for (const step of copy.steps) {
    if (step.sources !== undefined && step.verified !== true) step.verified = false;
    delete step.sources;
  }
  return copy;
}

export function splitQuestFiles(quests: readonly QuestInfo[]): { min: QuestMin[]; geo: QuestGeo[]; detail: QuestDetail[] } {
  const min: QuestMin[] = [];
  const geo: QuestGeo[] = [];
  const detail: QuestDetail[] = [];
  const giver = (g: Giver): QuestMin["start"][number] => ({ kind: g.kind, id: g.id, name: g.name });
  for (const q of quests) {
    const row: QuestMin = {
      id: q.id,
      name: q.name,
      level: q.level,
      reqLevel: q.reqLevel,
      races: q.races,
      classes: q.classes,
      custom: q.custom,
      pre: q.pre,
      exclusiveTo: q.exclusiveTo,
      start: q.start.map(giver),
      end: q.end.map(giver),
    };
    if (q.zone) row.zone = q.zone;
    if (q.breadcrumbFor != null) row.breadcrumbFor = q.breadcrumbFor;
    if (q.xp != null) row.xp = q.xp;
    min.push(row);
    geo.push({
      id: q.id,
      start: q.start.map((g) => ({ at: g.at })),
      end: q.end.map((g) => ({ at: g.at })),
      objectives: q.objectives.map((o) => {
        const row: QuestGeo["objectives"][number] = { kind: o.kind, name: o.name, at: o.at };
        if (o.id != null) row.id = o.id;
        return row;
      }),
    });
    const d: QuestDetail = {
      id: q.id,
      objectivesText: q.objectivesText,
      repeatable: q.repeatable,
      drops: q.objectives.map((o) => (o.drops && o.drops.length ? o.drops : null)),
    };
    if (q.next != null) d.next = q.next;
    if (q.mapId != null) d.mapId = q.mapId;
    if (q.xpTier != null) d.xpTier = q.xpTier;
    detail.push(d);
  }
  return { min, geo, detail };
}

// ---------- quest-steps / insights ----------

/**
 * `quest-steps.json`: quest id → ids of every step (in every served guide, guide order) that accepts, completes,
 * turns in or bonus-lists the quest. Keys in ascending quest id order. Published quest files do not repeat this.
 */
export function buildQuestSteps(guides: readonly Guide[]): Record<string, string[]> {
  const m = new Map<number, string[]>();
  for (const g of guides) for (const s of g.steps) for (const q of stepQuestIds(s)) m.set(q, [...(m.get(q) ?? []), s.id]);
  const out: Record<string, string[]> = {};
  for (const id of [...m.keys()].sort((a, b) => a - b)) out[String(id)] = m.get(id)!;
  return out;
}

/**
 * `insights.json`. The old P5 bonus / near-miss analysis ran on the removed guide import, so `added` and
 * `nearMisses` stay empty (research packs carry their own `bonus` steps). `issues` lists what the build changed:
 * steps stripped for excluded quests (warn) and steps forced to `verified: false` (info).
 */
export function buildInsights(issues: Insights["issues"]): Insights {
  return { added: {}, nearMisses: {}, issues: [...issues] };
}

// ---------- quests / zones from content/questie-db ----------

export function loadQuestDb(dir = join(ROOT, "content/questie-db")): QuestDb {
  const r = <T>(f: string) => (existsSync(join(dir, f)) ? readJson<T>(join(dir, f)) : ({} as T));
  return { quests: r("quests.json"), npcs: r("npcs.json"), objects: r("objects.json"), items: r("items.json"), zones: r("zones.json") };
}

/** QuestXP.1.60.1.71037.csv: table[questLevel][tier] = Difficulty_`tier`. */
export type QuestXpTable = number[][];

export interface QuestXpOverride {
  level?: number;
  xp?: number;
  tier?: number;
  estimated?: boolean;
  note?: string;
}

const XP_CORRECT_QUESTS = new Set([421, 8410]);

export function loadQuestXpTable(csvPath = join(ROOT, "content/game-data/QuestXP.1.60.1.71037.csv")): QuestXpTable {
  const table: QuestXpTable = [];
  if (!existsSync(csvPath)) return table;
  const lines = readFileSync(csvPath, "utf-8").trim().split(/\r?\n/);
  const header = lines[0]?.split(",") ?? [];
  const col = (name: string) => header.indexOf(name);
  const idCol = col("ID");
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const id = Number(cols[idCol]);
    if (!Number.isFinite(id)) continue;
    const row: number[] = [];
    for (let t = 0; t <= 9; t++) row[t] = Number(cols[col(`Difficulty_${t}`)] ?? 0) || 0;
    table[id] = row;
  }
  return table;
}

export function loadQuestXpOverrides(path = join(ROOT, "content/game-data/quest-xp-overrides.json")): Record<string, QuestXpOverride> {
  if (!existsSync(path)) return {};
  return readJson(path);
}

export function matchQuestXpTier(row: number[] | undefined, xp: number): number | undefined {
  if (!row) return undefined;
  for (let t = 1; t <= 7; t++) if (row[t] === xp) return t;
  return undefined;
}

function points(db: QuestDb, spawns: Record<string, number[][]> | undefined, cap: number): MapPoint[] {
  const out: MapPoint[] = [];
  for (const [area, pts] of Object.entries(spawns ?? {})) {
    const z = db.zones[area];
    if (!z?.uiMapId) continue;
    for (const p of pts) {
      if (out.length >= cap) return out;
      const [x, y] = p;
      if (x === undefined || y === undefined || x < 0 || y < 0) continue;
      out.push({ mapId: z.uiMapId, x, y, zone: z.name ?? String(area), exact: true });
    }
  }
  return out;
}

export function buildQuests(db: QuestDb, questIds: Iterable<number>): QuestInfo[] {
  const out: QuestInfo[] = [];
  const missingFromDb: number[] = [];
  const questXpTable = loadQuestXpTable();
  const overrides = loadQuestXpOverrides();
  const mismatches: string[] = [];
  let withTier = 0;
  for (const id of [...new Set(questIds)].sort((a, b) => a - b)) {
    const q = db.quests[String(id)];
    if (!q) {
      missingFromDb.push(id);
      continue;
    }
    const giver = (kind: "npc" | "object", ids: number[] | undefined): Giver[] =>
      (ids ?? []).map((gid) => {
        const e = (kind === "npc" ? db.npcs : db.objects)[String(gid)];
        return { kind, id: gid, name: e?.name ?? `${kind} ${gid}`, at: points(db, e?.spawns, 5) };
      });
    const objectives: QuestInfo["objectives"] = [];
    for (const c of q.objectives?.creatures ?? []) {
      const n = db.npcs[String(c.id)];
      objectives.push({ kind: "kill", id: c.id, name: n?.name ?? `npc ${c.id}`, at: points(db, n?.spawns, 10) });
    }
    for (const it of q.objectives?.items ?? []) {
      const item = db.items[String(it.id)];
      const drops = (item?.npcDrops ?? []).slice(0, 8).map((nid) => ({ npcId: nid, name: db.npcs[String(nid)]?.name ?? `npc ${nid}` }));
      const at = (item?.npcDrops ?? []).slice(0, 8).flatMap((nid) => points(db, db.npcs[String(nid)]?.spawns, 3)).slice(0, 12);
      objectives.push({ kind: "item", id: it.id, name: item?.name ?? `item ${it.id}`, at, drops });
    }
    for (const o of q.objectives?.objects ?? []) {
      const obj = db.objects[String(o.id)];
      objectives.push({ kind: "object", id: o.id, name: obj?.name ?? `object ${o.id}`, at: points(db, obj?.spawns, 10) });
    }
    const z = q.zoneId !== undefined ? db.zones[String(q.zoneId)] : undefined;
    const info: QuestInfo = {
      id,
      name: q.name ?? `Quest ${id}`,
      level: q.level ?? 0,
      reqLevel: q.reqLevel ?? 0,
      races: q.races ?? 0,
      classes: q.classes ?? 0,
      custom: !!q.forever,
      start: [
        ...giver("npc", q.start?.npc),
        ...giver("object", q.start?.object),
        ...(q.start?.item ?? []).map((gid) => {
          const e = db.items[String(gid)];
          return { kind: "item" as const, id: gid, name: e?.name ?? `item ${gid}`, at: [] as MapPoint[] };
        }),
      ],
      end: [...giver("npc", q.end?.npc), ...giver("object", q.end?.object)],
      objectivesText: q.objectivesText ?? [],
      objectives,
      pre: { group: q.pre?.group ?? [], single: q.pre?.single ?? [] },
      exclusiveTo: q.exclusiveTo ?? [],
      repeatable: !!q.repeatable,
    };
    if (q.zone) info.zone = q.zone;
    if (z?.uiMapId) info.mapId = z.uiMapId;
    if (q.next) info.next = q.next;
    if (q.breadcrumbFor) info.breadcrumbFor = q.breadcrumbFor;
    const ov = overrides[String(id)];
    let xp = q.xp;
    if (ov?.xp != null && (xp == null || XP_CORRECT_QUESTS.has(id))) xp = ov.xp;
    if (xp != null) info.xp = xp;
    if (ov?.tier != null) info.xpTier = ov.tier;
    else if (xp) {
      const tier = matchQuestXpTier(questXpTable[info.level], xp);
      if (tier != null) info.xpTier = tier;
      else mismatches.push(`${id} ${q.name ?? ""} level=${info.level} xp=${xp}`);
    }
    if (info.xpTier != null) withTier++;
    out.push(info);
  }
  if (missingFromDb.length) {
    console.warn(`[data] guide quest ids missing from QuestieDB (skipped, not written to quests.json): ${missingFromDb.join(", ")}`);
  }
  console.warn(`[data] quest XP tiers: ${withTier}/${out.length} matched; ${mismatches.length} mismatches`);
  if (mismatches.length) console.warn(`[data] quest XP mismatches: ${mismatches.join("; ")}`);
  return out;
}

const BREADCRUMB_ROUTES: RouteStyle[] = ["balanced", "speedrun"];

/**
 * Build-time breadcrumb checks for quests a guide actually uses. Prints nothing and never fails the build;
 * callers warn on each returned line. Step order is the route's action order (steps that omit `routes` follow
 * the same default as dungeon expansion: every route, or balanced-only when the step is a bonus).
 */
export function breadcrumbWarnings(
  guides: readonly { slug: string; steps: readonly Step[] }[],
  db: QuestDb,
  usedQuestIds: Iterable<number>,
): string[] {
  const used = [...new Set(usedQuestIds)].filter((id) => db.quests[String(id)]?.breadcrumbFor).sort((a, b) => a - b);
  const lines: string[] = [];
  for (const id of used) {
    const target = db.quests[String(id)]!.breadcrumbFor!;
    if (!db.quests[String(target)]) lines.push(`[breadcrumb] missing: quest ${id} breadcrumbFor ${target} is not in Questie`);
  }
  for (const g of guides) {
    for (const route of BREADCRUMB_ROUTES) {
      const acceptedAt = new Map<number, number>();
      const turnedAt = new Map<number, number>();
      let n = 0;
      for (const s of g.steps) {
        if (!routesOf(s).includes(route)) continue;
        for (const a of s.actions) {
          if ((a.type !== "accept" && a.type !== "turnin") || typeof a.questId !== "number") continue;
          n++;
          const at = a.type === "accept" ? acceptedAt : turnedAt;
          if (!at.has(a.questId)) at.set(a.questId, n);
        }
      }
      for (const b of used) {
        const target = db.quests[String(b)]!.breadcrumbFor!;
        const acceptT = acceptedAt.get(target);
        const acceptB = acceptedAt.get(b);
        const turnB = turnedAt.get(b);
        if (acceptB !== undefined && turnB === undefined) {
          lines.push(`[breadcrumb] open: ${g.slug} ${route} accepts ${b} (breadcrumbFor ${target}) but never turns it in`);
        } else if (acceptT !== undefined && turnB !== undefined && acceptT < turnB) {
          lines.push(`[breadcrumb] order: ${g.slug} ${route} accepts ${target} before turnin of breadcrumb ${b}`);
        }
      }
    }
  }
  return lines;
}

/** Headline numbers for the landing page's Horde card (`landing.json`, a few bytes, so the landing page loads nothing else). */
export interface LandingStats { steps: number; quests: number; zones: number }
export function buildLandingStats(guides: readonly Guide[], questSteps: Readonly<Record<string, readonly string[]>>): LandingStats {
  const zones = new Set<string>();
  let steps = 0;
  for (const g of guides) {
    steps += g.steps.length;
    for (const z of g.zones) zones.add(z);
  }
  return { steps, quests: Object.keys(questSteps).length, zones: zones.size };
}

export function buildZones(db: QuestDb, guides: Guide[]): ZoneInfo[] {
  const byMap = new Map<number, ZoneInfo>();
  for (const [area, z] of Object.entries(db.zones)) {
    if (!z.uiMapId || z.parent !== undefined || (z.continent !== 0 && z.continent !== 1)) continue;
    if (byMap.has(z.uiMapId)) continue;
    byMap.set(z.uiMapId, { mapId: z.uiMapId, areaId: Number(area), name: z.name ?? area, continent: z.continent });
  }
  for (const g of guides) {
    for (const s of g.sections) {
      if (!byMap.has(s.mapId) && s.mapId) byMap.set(s.mapId, { mapId: s.mapId, areaId: 0, name: s.zone, continent: 1 });
      const zi = byMap.get(s.mapId);
      if (zi && g.subgroup !== "Dungeons") zi.levels = zi.levels ? [Math.min(zi.levels[0], g.minLevel), Math.max(zi.levels[1], g.maxLevel)] : [g.minLevel, g.maxLevel];
    }
  }
  return [...byMap.values()].sort((a, b) => a.mapId - b.mapId);
}

/** One row of `data/build/maps/zones.json` (only the fields this build copies). */
export interface MapZoneAsset {
  mapId: number;
  image?: string;
  bounds?: ZoneInfo["bounds"];
}

/**
 * Copy `image` and `bounds` from map-zone records (matched by `mapId`).
 * When a zone still has no image and its mapId is in `webpMapIds`, set `image` to `maps/<mapId>.webp`.
 * Missing records and an empty webp set leave zones unchanged.
 */
export function applyMapAssets(
  zones: readonly ZoneInfo[],
  mapZones: readonly MapZoneAsset[] | undefined,
  webpMapIds: ReadonlySet<number>,
): ZoneInfo[] {
  const byId = new Map<number, MapZoneAsset>();
  for (const row of mapZones ?? []) {
    if (row && typeof row.mapId === "number") byId.set(row.mapId, row);
  }
  return zones.map((z) => {
    const src = byId.get(z.mapId);
    const image = src?.image || z.image || (webpMapIds.has(z.mapId) ? `maps/${z.mapId}.webp` : undefined);
    const bounds = src?.bounds ?? z.bounds;
    if (image === undefined && bounds === undefined) return z;
    if (image === z.image && bounds === z.bounds) return z;
    return { ...z, ...(bounds !== undefined ? { bounds } : {}), ...(image !== undefined ? { image } : {}) };
  });
}

/** `data/build/maps/zones.json` when present; absent file or unreadable JSON → undefined (fresh clone / optional artifact). */
export function loadMapZoneAssets(path = join(ROOT, "data/build/maps/zones.json")): MapZoneAsset[] | undefined {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
  if (!Array.isArray(raw)) return undefined;
  return raw.filter((row): row is MapZoneAsset => !!row && typeof row === "object" && typeof (row as MapZoneAsset).mapId === "number");
}

/** mapIds that have `web/public/maps/<mapId>.webp`. Missing directory → empty set. */
export function webpMapIds(dir = join(ROOT, "web/public/maps")): Set<number> {
  const ids = new Set<number>();
  if (!existsSync(dir)) return ids;
  for (const name of readdirSync(dir)) {
    const m = /^(\d+)\.webp$/i.exec(name);
    if (m) ids.add(Number(m[1]));
  }
  return ids;
}

// ---------- main build ----------

export function parsePrereqMode(v: string | undefined): PrereqMode {
  if (v === undefined || v === "") return "fail";
  if (v === "fail" || v === "warn" || v === "off") return v;
  throw new Error(`PF_PREREQ_CHECK must be fail, warn or off (got ${JSON.stringify(v)})`);
}

/** A pack between load and output. `steps` is what later stages see. */
export interface LoadedPack {
  path: string;
  pack: RoutePack;
  steps: Step[];
  /** Reference packs (the dungeon pack) are left out of the duplicate turn-in check. */
  kind: "leveling" | "dungeons";
}

export interface TransformCtx {
  isForever: (questId: number) => boolean;
  warnings: string[];
  /** Structured findings for `insights.json` issues. */
  issues: Insights["issues"];
  stats: { strippedSteps: number; forcedUnverified: number };
  /** All packs as they enter the current transform (for transforms that need cross-pack context). */
  packs?: readonly LoadedPack[];
  /** Per-build scratch space shared by all transform calls (e.g. state kept across packs). */
  shared?: Map<string, unknown>;
  /** QuestieDB quests (prerequisites, race/class masks) and the prerequisite allowlist, for transforms. */
  quests?: QuestDb["quests"];
  prereqAllowlist?: readonly AllowlistEntry[];
  /** Research root (for loading dungeon integration plan / dossiers). */
  researchDir?: string;
}

/** A pack-level transform: gets one pack, returns it (or a new one). Runs in order, before the checks. */
export type PackTransform = (pack: LoadedPack, ctx: TransformCtx) => LoadedPack;

/** Route rules: strip excluded quests, force `verified: false` on Forever-quest steps. */
export const enforceRulesTransform: PackTransform = (p, ctx) => {
  const r = enforceRules(p.pack.id!, p.steps, ctx.isForever, ctx.warnings, ctx.issues);
  ctx.stats.strippedSteps += r.stripped;
  ctx.stats.forcedUnverified += r.forced;
  return { ...p, steps: r.steps };
};

/**
 * Dungeon placeholder expansion (expandDungeons.ts): leveling-pack placeholders with `tags.dungeonId` get the
 * dungeon pack's accept / run / turn-in steps spliced around them. State (dungeon index, quests already accepted /
 * turned in per route, used step ids, expanded dungeon ids) is built once per build from `ctx.packs` and shared
 * across packs through `ctx.shared`, so packs must be visited in level order (they are). Runs before
 * `enforceRulesTransform` so the 79953/81951 strip and the Forever unverified rule cover inserted steps.
 */
export const expandDungeonsTransform: PackTransform = (p, ctx) => {
  const shared = ctx.shared ?? new Map<string, unknown>();
  let st = shared.get("expandDungeons") as { ex: ExpandContext; stats: Record<string, ExpandStats> } | undefined;
  if (!st) {
    const packs = ctx.packs ?? [p];
    const starts = new Set(startPackIds(packs));
    // Prerequisite guard: same walk as checkPrereqsForPacks (race start pack, then the rest by level).
    const prereq = ctx.quests
      ? {
          quests: ctx.quests,
          allowlist: ctx.prereqAllowlist ?? [],
          walk: packs
            .filter((x) => x.kind === "leveling")
            .map((x) => ({ id: x.pack.id!, levels: (x.pack.levels ?? [1, 60]) as [number, number], steps: x.steps, startZone: raceStartZone(x, starts) })),
        }
      : undefined;
    const researchDir = ctx.researchDir;
    const plan = researchDir ? loadIntegrationPlan(researchDir) : undefined;
    const dossiers = researchDir ? loadDossiers(researchDir) : new Map();
    const timeline = researchDir ? loadRouteTimeline(researchDir) : undefined;
    if (researchDir && !plan) {
      ctx.warnings.push("research/dungeons/integration-plan.json missing; using legacy dungeon placeholder expansion");
    }
    st = {
      ex: makeExpandContext(
        packs.filter((x) => x.kind === "dungeons").flatMap((x) => x.steps),
        packs.filter((x) => x.kind === "leveling").flatMap((x) => x.steps),
        packs.flatMap((x) => x.steps.map((s) => s.id)),
        ctx.warnings,
        prereq,
        plan,
        dossiers,
        {
          timeline,
          questReqLevel: (id) => ctx.quests?.[String(id)]?.reqLevel,
        },
      ),
      stats: {},
    };
    shared.set("expandDungeons", st);
  }
  if (p.kind !== "leveling") return p;
  // One leveling pack's step list only; dungeon steps are spliced into this pack, not merged across packs.
  const r = expandDungeonPlaceholders(p.pack.id!, p.steps, st.ex);
  st.stats[p.pack.id!] = r.stats;
  return r.stats.inserted > 0 || r.stats.placeholdersDropped > 0 || r.steps !== p.steps ? { ...p, steps: r.steps } : p;
};

/**
 * Default pack transforms, in order. HOOK POINT: step-expanding transforms go here, or are passed via
 * `BuildOptions.transforms`; the duplicate turn-in check always runs on the output of the whole chain.
 * The dungeon expansion sits before `enforceRulesTransform` so the route rules also apply to the steps it adds.
 */
export const PACK_TRANSFORMS: readonly PackTransform[] = [expandDungeonsTransform, enforceRulesTransform];

/** Race start packs (level-1 leveling packs in a start zone): one character only ever runs one of them. */
export function startPackIds(packs: readonly LoadedPack[]): string[] {
  return packs
    .filter((p) => p.kind === "leveling" && (p.pack.levels?.[0] ?? 0) === 1 && p.steps.some((s) => START_ZONES[stepZone(s) ?? ""]))
    .map((p) => p.pack.id!);
}

/** Duplicate turn-in check over the leveling packs (dungeon reference packs excluded). Throws on any duplicate. */
export function checkTurnIns(packs: readonly LoadedPack[]): void {
  const leveling: TurnInPack[] = packs.filter((p) => p.kind === "leveling").map((p) => ({ id: p.pack.id!, steps: p.steps }));
  assertNoDuplicateTurnIns(leveling, { exclusive: [startPackIds(packs)], label: "duplicate turn-in check (leveling packs)" });
}

export type PrereqMode = "fail" | "warn" | "off";

/** Start zone (Durotar / Mulgore / Tirisfal Glades) of a race start pack, else undefined. */
function raceStartZone(p: LoadedPack, starts: ReadonlySet<string>): string | undefined {
  if (!starts.has(p.pack.id!)) return undefined;
  for (const s of p.steps) {
    const races = START_ZONES[stepZone(s) ?? ""];
    if (races) return RACE_STARTS.find((r) => races.includes(r.race))?.zone;
  }
  return undefined;
}

/**
 * Quest-prerequisite check over the leveling packs (race start pack, then the rest by level). Mode "fail"
 * throws; "warn" returns the formatted report for the manifest warnings; "off" skips.
 */
export function checkPrereqsForPacks(
  packs: readonly LoadedPack[],
  quests: QuestDb["quests"],
  allowlist: readonly AllowlistEntry[],
  mode: PrereqMode,
): string[] {
  const starts = new Set(startPackIds(packs));
  const leveling: PrereqPack[] = packs
    .filter((p) => p.kind === "leveling")
    .map((p) => ({ id: p.pack.id!, levels: (p.pack.levels ?? [1, 60]) as [number, number], steps: p.steps, startZone: raceStartZone(p, starts) }));
  const vs = checkPrereqs(leveling, quests, { allowlist, mode });
  return vs.length ? formatPrereqViolations(vs).split("\n") : [];
}

export interface BuildOptions {
  research: string;
  out: string;
  questDb?: QuestDb;
  now?: string;
  /** Override profession files (tests). */
  hooks?: HookEntry[];
  /** Pack transforms (default `PACK_TRANSFORMS`). The duplicate turn-in check runs after all of them. */
  transforms?: readonly PackTransform[];
  /** Quest-prerequisite check mode; default env `PF_PREREQ_CHECK`, else "fail". */
  prereqMode?: PrereqMode;
  /** Allowlist override (default `research/prereq-allowlist.json` if present). */
  prereqAllowlist?: AllowlistEntry[];
}

/**
 * `research/gold/gold-plan.json` (gold milestones, savings pace, per-bracket tips) passed through after a
 * shape check. Missing or malformed file → null (the site hides the gold plan).
 */
export function loadGoldPlan(goldDir: string): unknown {
  const path = join(goldDir, "gold-plan.json");
  if (!existsSync(path)) return null;
  const raw = readJson<Record<string, unknown>>(path);
  const ok =
    raw &&
    Array.isArray(raw.milestones) &&
    Array.isArray(raw.brackets) &&
    Array.isArray(raw.sources) &&
    (raw.milestones as { level?: unknown; gold?: unknown }[]).every((m) => typeof m.level === "number" && typeof m.gold === "number") &&
    (raw.brackets as { levels?: unknown }[]).every((b) => Array.isArray(b.levels) && b.levels.length === 2);
  if (!ok) throw new Error(`${path}: not a gold plan (needs milestones[{level,gold}], brackets[{levels:[a,b]}], sources[])`);
  const ids = new Set((raw.sources as { id: string }[]).map((x) => x.id));
  const cited = [
    ...(raw.milestones as { sources?: string[] }[]),
    ...(raw.brackets as { sources?: string[] }[]),
    ...((raw.pace as { sources?: string[] }[] | undefined) ?? []),
    ...((raw.habits as { sources?: string[] }[] | undefined) ?? []),
    { sources: raw.avoidSources as string[] | undefined },
  ].flatMap((x) => x.sources ?? []);
  const missing = cited.filter((id) => !ids.has(id));
  if (missing.length) throw new Error(`${path}: unknown source ids ${[...new Set(missing)].join(", ")}`);
  return raw;
}

/** Unique profession tiers from research/professions/trainers.json. Missing file → []. */
export function loadTrainerTiers(profDir: string): { profession: string; tier: string; minLevel: number; minSkill: number; skillCap: number }[] {
  const path = join(profDir, "trainers.json");
  if (!existsSync(path)) return [];
  let raw: unknown;
  try {
    raw = readJson(path);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const seen = new Map<string, { profession: string; tier: string; minLevel: number; minSkill: number; skillCap: number }>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.profession !== "string" || typeof r.tier !== "string") continue;
    const tier = {
      profession: r.profession,
      tier: r.tier,
      minLevel: Number(r.min_level ?? 0),
      minSkill: Number(r.min_skill ?? 0),
      skillCap: Number(r.skill_cap ?? 0),
    };
    if (!Number.isFinite(tier.minLevel) || !Number.isFinite(tier.skillCap)) continue;
    const key = `${tier.profession}|${tier.tier}|${tier.skillCap}`;
    const prev = seen.get(key);
    if (!prev || tier.minLevel < prev.minLevel) seen.set(key, tier);
  }
  return [...seen.values()];
}

export function buildData(opts: BuildOptions): DataManifest {
  const v = makeValidators();
  const db = opts.questDb ?? loadQuestDb();
  const warnings: string[] = [];
  const errors: string[] = [];
  // Leveling packs first (by level), dungeon packs last: hooks join to leveling steps before dungeon steps.
  const found = discoverPacks(opts.research).sort(
    (a, b) =>
      Number(isDungeonPack(a.pack, a.pack.steps)) - Number(isDungeonPack(b.pack, b.pack.steps)) ||
      (a.pack.levels?.[0] ?? 1) - (b.pack.levels?.[0] ?? 1) ||
      a.path.localeCompare(b.path),
  );
  const ids = new Set<string>();
  for (const { path, pack } of found) {
    if (!v.pack(pack)) errors.push(`${relative(opts.research, path)}: ${fmtErrors(v.pack.errors)}`);
    const id = pack.id ?? "";
    if (!id) errors.push(`${relative(ROOT, path)}: pack has no id`);
    if (ids.has(id)) errors.push(`${relative(ROOT, path)}: duplicate pack id ${id}`);
    ids.add(id);
    const stepIds = new Set<string>();
    for (const s of pack.steps) {
      if (stepIds.has(s.id)) errors.push(`${relative(ROOT, path)}: duplicate step id ${s.id}`);
      stepIds.add(s.id);
    }
  }

  const profDir = join(opts.research, "professions");
  const classProf: ClassProfessionsFile = existsSync(join(profDir, "class_professions.json")) ? readJson(join(profDir, "class_professions.json")) : {};
  const tips: TipsMatrixFile = existsSync(join(profDir, "tips_matrix.json")) ? readJson(join(profDir, "tips_matrix.json")) : {};
  const rawHooks: HookEntry[] = opts.hooks ?? (existsSync(join(profDir, "profession_hooks.json")) ? readJson(join(profDir, "profession_hooks.json")) : []);
  if (!v.classProfessions(classProf)) errors.push(`research/professions/class_professions.json: ${fmtErrors(v.classProfessions.errors)}`);
  if (!v.tipsMatrix(tips)) errors.push(`research/professions/tips_matrix.json: ${fmtErrors(v.tipsMatrix.errors)}`);
  if (errors.length) throw new Error(`route data validation failed:\n- ${errors.join("\n- ")}`);

  let hooksSkipped = 0;
  const hooks = rawHooks.filter((h) => {
    const ok = !!h?.professionHook && v.hook(cleanHook(h.professionHook));
    if (!ok) {
      hooksSkipped++;
      warnings.push(`profession hook ${h?.hookId ?? "?"} skipped: ${fmtErrors(v.hook.errors)}`);
    }
    return ok;
  });

  const zoneMap = new Map<string, number>();
  for (const z of Object.values(db.zones)) if (z.name && z.uiMapId && !zoneMap.has(z.name)) zoneMap.set(z.name, z.uiMapId);
  const isForever = (id: number) => db.quests[String(id)]?.forever === true;
  const questLevel = (id: number) => db.quests[String(id)]?.level;

  // 1. load (above)  2. pack transforms  3. checks  4. enrich + write
  const issues: Insights["issues"] = [];
  const allowPath = join(opts.research, "prereq-allowlist.json");
  const allowlist = opts.prereqAllowlist ?? (existsSync(allowPath) ? validateAllowlist(readJson(allowPath)) : []);
  // Anchor-plan validators (fail the build on violation). Missing plan → warn and keep legacy expansion.
  const plan = loadIntegrationPlan(opts.research);
  const dossiers = loadDossiers(opts.research);
  const timeline = loadRouteTimeline(opts.research);
  if (plan) {
    const planErrors = validateDungeonPlan(plan, dossiers, timeline);
    if (planErrors.length) {
      throw new Error(`dungeon integration plan validation failed:\n- ${planErrors.map((e) => e.message).join("\n- ")}`);
    }
  } else {
    warnings.push("research/dungeons/integration-plan.json missing; using legacy dungeon placeholder expansion");
  }

  const ctx: TransformCtx = {
    isForever,
    warnings,
    issues,
    stats: { strippedSteps: 0, forcedUnverified: 0 },
    shared: new Map(),
    quests: db.quests,
    prereqAllowlist: allowlist,
    researchDir: opts.research,
  };
  let loaded: LoadedPack[] = found.map(({ path, pack }) => ({ path, pack, steps: [...pack.steps], kind: isDungeonPack(pack, pack.steps) ? "dungeons" : "leveling" }));
  for (const t of opts.transforms ?? PACK_TRANSFORMS) {
    const before = loaded;
    loaded = before.map((p) => t(p, { ...ctx, packs: before }));
  }
  // Transforms may add steps: re-validate any pack whose steps changed (beyond the enforced fields).
  for (const p of loaded) {
    if (p.steps.length === p.pack.steps.length || p.kind !== "leveling") continue;
    const changed = { ...p.pack, steps: p.steps.map((s, i) => ({ ...s, n: i + 1 })) };
    if (!v.pack(changed)) throw new Error(`${relative(ROOT, p.path)}: pack fails route-v2 after transforms: ${fmtErrors(v.pack.errors)}`);
  }
  const expandState = ctx.shared!.get("expandDungeons") as { ex: ExpandContext; stats: Record<string, ExpandStats> } | undefined;
  const dungeonExpansion = expandState?.stats ?? {};
  const anchorBlocks = expandState?.ex.anchorBlocksApplied ?? 0;
  if (plan) {
    const levelingSteps = loaded.filter((p) => p.kind === "leveling").flatMap((p) => p.steps);
    const runErrors = assertPlannedRunsPresent(plan, dossiers, levelingSteps);
    if (runErrors.length) {
      throw new Error(`planned dungeon runs missing after expansion:\n- ${runErrors.map((e) => e.message).join("\n- ")}`);
    }
    const pickupHubErrors = assertBuiltPickupHubs(dossiers, timeline, levelingSteps);
    if (pickupHubErrors.length) {
      throw new Error(`built dungeon pickup hub mismatch after expansion:\n- ${pickupHubErrors.map((e) => e.message).join("\n- ")}`);
    }
  }
  checkTurnIns(loaded);
  const prereqMode = opts.prereqMode ?? parsePrereqMode(process.env.PF_PREREQ_CHECK);
  for (const line of checkPrereqsForPacks(loaded, db.quests, allowlist, prereqMode)) warnings.push(`prereq: ${line}`);
  const stripped = ctx.stats.strippedSteps;
  const forced = ctx.stats.forcedUnverified;

  let hooksJoined = 0;
  const guides: Guide[] = [];
  const packBracket = new Map<string, string>();
  const manifestPacks: ManifestPack[] = [];
  const joinedHookIds = new Set<string>();
  for (const { path, pack, steps } of loaded) {
    const lv = stepLevels(steps, pack.levels?.[0] ?? 1, questLevel);
    const pending = hooks.filter((h) => !joinedHookIds.has(h.hookId ?? JSON.stringify(h.professionHook)));
    const before = steps.map((s) => s.professionHooks?.length ?? 0);
    hooksJoined += joinHooks(steps, lv, pending, (z) => zoneMap.get(z));
    ensureHookPins(steps, (z) => zoneMap.get(z));
    // Remember which hooks landed so each hook joins once across packs (leveling packs first).
    for (const h of pending) {
      const key = hookKey(cleanHook(h.professionHook));
      if (steps.some((s, i) => (s.professionHooks?.length ?? 0) > before[i]! && s.professionHooks!.some((x) => hookKey(x) === key))) {
        joinedHookIds.add(h.hookId ?? JSON.stringify(h.professionHook));
      }
    }
    const guide = packToGuide(pack, steps);
    const explicitNext = pack.next?.trim();
    if (explicitNext) guide.next = explicitNext;
    const bracket = pack.bracket?.trim();
    if (bracket) packBracket.set(guide.slug, bracket);
    guides.push(guide);
    if (pack.classProfessions) for (const [k, val] of Object.entries(pack.classProfessions)) if (!(k in classProf)) (classProf as Record<string, unknown>)[k] = val;
    if (pack.tipsMatrix) for (const [k, val] of Object.entries(pack.tipsMatrix)) if (!(k in tips)) (tips as Record<string, unknown>)[k] = val;
    manifestPacks.push({
      id: guide.slug,
      title: guide.displayName,
      levels: [guide.minLevel, guide.maxLevel],
      file: `guides/${guide.slug}.json`,
      source: `research/${relative(opts.research, path).split("\\").join("/")}`,
      kind: guide.subgroup === "Dungeons" ? "dungeons" : "leveling",
      steps: guide.steps.length,
      routes: routeCounts(guide.steps),
      dungeonSteps: guide.steps.filter((s) => s.dungeon).length,
      zones: guide.zones,
    });
  }

  const generatedAt = opts.now ?? new Date().toISOString();
  const index = buildIndex(guides, generatedAt, packBracket);
  let questSteps = buildQuestSteps(guides);
  const inGuides = new Map<number, string[]>(Object.entries(questSteps).map(([k, v]) => [Number(k), v]));
  const quests = buildQuests(db, inGuides.keys());
  let howToSteps = 0;
  for (const g of guides) howToSteps += enrichCompleteSteps(g.steps, quests);
  if (howToSteps) console.log(`[data] complete/collect how-to lines added: ${howToSteps}`);

  const compactByPack: { id: string; absorbed: number }[] = [];
  for (const g of guides) {
    // Compaction stays inside this guide's step list; it never merges steps from another pack.
    const { steps, absorbed } = compactSteps(g.steps, quests);
    compactByPack.push({ id: g.slug, absorbed });
    const rebuilt = packToGuide(
      { schema: "project-forever/route", version: 2, id: g.slug, title: g.displayName, levels: [g.minLevel, g.maxLevel], steps },
      steps,
    );
    g.steps = rebuilt.steps;
    g.sections = rebuilt.sections;
    g.zones = rebuilt.zones;
  }
  const compactAbsorbed = compactByPack.reduce((n, r) => n + r.absorbed, 0);
  if (compactAbsorbed) {
    console.log(
      `[data] compact: ${compactAbsorbed} steps merged (${compactByPack
        .filter((r) => r.absorbed)
        .map((r) => `${r.id} -${r.absorbed}`)
        .join(", ")})`,
    );
  }
  questSteps = buildQuestSteps(guides);
  const inGuidesAfter = new Map<number, string[]>(Object.entries(questSteps).map(([k, v]) => [Number(k), v]));
  for (const p of manifestPacks) {
    const g = guides.find((x) => x.slug === p.id);
    if (!g) continue;
    p.steps = g.steps.length;
    p.routes = routeCounts(g.steps);
    p.dungeonSteps = g.steps.filter((s) => s.dungeon).length;
    p.zones = g.zones;
  }
  // Prefixes come from the served step ids (after compaction).
  attachIdPrefixes(index, guides);
  index.entries = guideIndexEntries(index, guides);
  assertNoDuplicateTurnIns(
    guides.filter((g) => g.subgroup !== "Dungeons").map((g) => ({ id: g.slug, steps: g.steps })),
    { exclusive: [startPackIds(loaded)], label: "duplicate turn-in check (after compact)" },
  );

  for (const line of breadcrumbWarnings(guides, db, inGuidesAfter.keys())) console.warn(line);
  const zones = applyMapAssets(buildZones(db, guides), loadMapZoneAssets(), webpMapIds());

  const byLevel: DataManifest["byLevel"] = [];
  for (const p of [...manifestPacks].sort((a, b) => a.levels[0] - b.levels[0] || a.levels[1] - b.levels[1])) {
    const label = `${p.levels[0]}-${p.levels[1]}`;
    const e = byLevel.find((x) => x.label === label);
    if (e) e.packs.push(p.id);
    else byLevel.push({ label, levels: p.levels, packs: [p.id] });
  }
  const manifest: DataManifest = {
    schema: "project-forever/data-manifest",
    version: 1,
    generatedAt,
    packs: manifestPacks,
    byLevel,
    routes: {
      balanced: manifestPacks.filter((p) => p.routes.balanced > 0).map((p) => p.id),
      speedrun: manifestPacks.filter((p) => p.routes.speedrun > 0).map((p) => p.id),
    },
    files: {
      guideIndex: "guide_index.json",
      questsMin: "quests-min.json",
      questsGeo: "quests-geo.json",
      questsDetail: "quests-detail.json",
      questSteps: "quest-steps.json",
      insights: "insights.json",
      zones: "zones.json",
      classProfessions: "class_professions.json",
      professionHooks: "profession_hooks.json",
      trainers: "trainers.json",
      goldPlan: "gold-plan.json",
      searchIndex: "search-index.json",
    },
    stats: { strippedSteps: stripped, forcedUnverified: forced, hooksJoined, hooksSkipped },
    dungeonExpansion,
    anchorBlocks,
    warnings,
  };

  // write (guides/ is fully regenerated so stale guides never linger)
  const out = opts.out;
  rmSync(join(out, "guides"), { recursive: true, force: true });
  mkdirSync(join(out, "guides"), { recursive: true });
  const w = (rel: string, data: unknown) => writeFileSync(join(out, rel), JSON.stringify(data));
  const drop = (rel: string) => {
    const p = join(out, rel);
    if (existsSync(p)) unlinkSync(p);
  };
  for (const g of guides) w(`guides/${g.slug}.json`, publishGuide(g));
  w("guide_index.json", index);
  const split = splitQuestFiles(quests);
  w("quests-min.json", split.min);
  w("quests-geo.json", split.geo);
  w("quests-detail.json", split.detail);
  drop("quests.json");
  drop("tips_matrix.json");
  w("quest-steps.json", questSteps);
  // A quest left out of the route is not in quests-min.json: carry its name so the note can show it.
  for (const it of issues) if (!it.step && it.questId != null) it.questName ??= db.quests[String(it.questId)]?.name;
  w("insights.json", buildInsights(issues));
  w("zones.json", zones);
  w("class_professions.json", classProf);
  w("profession_hooks.json", rawHooks);
  w("trainers.json", loadTrainerTiers(profDir));
  w("gold-plan.json", loadGoldPlan(join(opts.research, "gold")));
  w("search-index.json", buildSearchDocs({ index, guides, quests, zones, questSteps }));
  w("landing.json", buildLandingStats(guides, questSteps));
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

function main(argv: string[]): number {
  const arg = (name: string, dflt: string) => {
    const i = argv.indexOf(name);
    return i >= 0 && argv[i + 1] ? resolve(argv[i + 1]!) : dflt;
  };
  const research = arg("--research", join(ROOT, "research"));
  const out = arg("--out", join(ROOT, "web/public/data"));
  try {
    const m = buildData({ research, out });
    for (const wmsg of m.warnings.slice(0, 20)) console.warn(`[data] warn: ${wmsg}`);
    if (m.warnings.length > 20) console.warn(`[data] … ${m.warnings.length - 20} more warnings in manifest.json`);
    console.log(
      `[data] ${m.packs.length} packs (${m.packs.map((p) => p.id).join(", ")}) → ${relative(ROOT, out)}; ` +
        `stripped ${m.stats.strippedSteps}, forced unverified ${m.stats.forcedUnverified}, hooks joined ${m.stats.hooksJoined}, skipped ${m.stats.hooksSkipped}`,
    );
    let anchorInserted = 0;
    let placeholdersDropped = 0;
    for (const [id, e] of Object.entries(m.dungeonExpansion)) {
      anchorInserted += e.anchorInserted ?? 0;
      placeholdersDropped += e.placeholdersDropped ?? 0;
      if (!e.placeholders && !e.anchorInserted && !e.placeholdersDropped) continue;
      console.log(
        `[data] ${id}: placeholders ${e.expanded}/${e.placeholders} expanded` +
          (e.placeholdersDropped ? `, ${e.placeholdersDropped} plan-controlled dropped` : "") +
          `, ${e.inserted} steps inserted` +
          (e.anchorInserted ? ` (${e.anchorInserted} via anchors)` : "") +
          ` (dup quests skipped ${e.skippedDuplicateQuests}, route-skipped ${e.skippedRoutes})` +
          (e.unmatched.length ? `; unmatched: ${e.unmatched.join(", ")}` : "") +
          (e.repeated.length ? `; repeated: ${e.repeated.join(", ")}` : "") +
          `; prereq guard: ${e.prereqSkippedQuests} quest×route skipped, ${e.prereqCascaded} cascaded, ${e.prereqSkippedSteps} step×route removed`,
      );
      const skipped = skippedQuestSummary(e.prereqSkips ?? []);
      if (skipped) console.warn(`[data] ${id}: dungeon quests skipped by the prereq guard (all, unique): ${skipped}`);
    }
    if (m.anchorBlocks != null || anchorInserted || placeholdersDropped) {
      console.log(
        `[data] dungeon anchors: ${m.anchorBlocks ?? 0} plan blocks applied, ${anchorInserted} steps inserted, ${placeholdersDropped} placeholders dropped`,
      );
    }
    const integrity = runIntegrity({ dataDir: out, failOnError: false });
    console.log(`[data] integrity: ${integrity.errors} errors, ${integrity.warnings} warnings, ${integrity.info} info`);
    const sim = runXpSimPipeline({ dataDir: out, root: ROOT });
    writeDungeonOnSim({ dataDir: out, root: ROOT });
    console.log(
      `[data] xp-sim: ${sim.chainEnds.map((e) => `${e.chainId}/${e.mode}=${e.endLevel.toFixed(2)}`).join(" ")}; ` +
        `below-req ${sim.belowReq}, sub-70% ${sim.sub70} → ${relative(ROOT, sim.reportDir)}`,
    );
    return 0;
  } catch (e) {
    console.error(`[data] ${(e as Error).message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
