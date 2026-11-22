import type { ClassKey, Guide, GuideIndex, ProfessionKey, Profile, RaceKey, Role, Step } from "../data/schema";
import { packXpMods } from "../lib/xp/recomputeSim";

const CLASS_KEYS: readonly ClassKey[] = [
  "Warrior", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Paladin",
];
const RACE_KEYS: readonly RaceKey[] = ["Orc", "Troll", "Tauren", "Undead", "Skyborne"];
import type { GameExport, GameExportCharacter } from "./luaExport";
import {
  evaluateGameSync,
  linkFor,
  mergeFlightPaths,
  mergeProfessions,
  summarizeProfileSync,
  syncedFields,
  type CharacterLink,
  type GameSyncResult,
} from "./gameSync";
import type { QuestLookup } from "./questAvailability";
import { pickCurrentStepId } from "../lib/guideList";
import { applyMergedProgress, storedMergedStepIsDone } from "../lib/mergedProgress";
import { createProfileEvaluator } from "./visibility";
import {
  applyMarkQuestsDone,
  applySetDone,
  applyToggle,
  buildStepIndexes,
  emptyStepIndexes,
  isStepDone,
  NO_QUEST_STEPS,
  skipFlagsForGuide,
  stepProgressQuestIds,
  stepStatus as computeStepStatus,
  type StepIndexes,
  type StepStatusResult,
  type StepsForQuest,
} from "./questProgress";
import type { ProgressCursor, RouteStyle } from "./progress";
import {
  completionFromStepIds,
  isStoredStepMarked,
  retainCompletion,
  retainRequirement,
  retainStatus,
  type GuideCompletion,
} from "./progressSelectors";
import { countsInProgress, requirementFromStatus, stepRequirement, type Requirement } from "./stepRequirement";

/**
 * Quest catalog for cursor repair inside `syncFromGame`. The shell sets this when
 * `quests.json` has loaded (same catalog the reader uses). Absent catalog: breadcrumb
 * exclusion cannot run, so a cursor is only moved off steps that are done without it.
 */
let stepPickQuests: QuestLookup | undefined;

export function setStepPickQuestCatalog(quests: QuestLookup | undefined): void {
  stepPickQuests = quests;
}

export const STORAGE_KEY = "hgw:profiles:v1";
export const PRESERVED_KEY = "hgw:profiles:preserved";
export const SCHEMA = 1;
export const BACKUP_LIMIT = 5;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface StoredState {
  schema: 1;
  activeId: string | null;
  profiles: Profile[];
  guestRouteStyle: RouteStyle;
}

export interface BackupEntry {
  at: number;
  raw: unknown;
}

export interface MigrateResult {
  state: StoredState;
  backups: BackupEntry[];
  loadError: string | null;
  preserve: boolean;
}

export function createMemoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  };
}

export function emptyState(): StoredState {
  return { schema: SCHEMA, activeId: null, profiles: [], guestRouteStyle: "balanced" };
}

/** Legacy "lean" (pre route-schema v2) is the speedrun route. */
export function normalizeRouteStyle(v: unknown): RouteStyle | undefined {
  if (v === "lean") return "speedrun";
  return isRouteStyle(v) ? v : undefined;
}

function upgradeProfile(v: unknown): unknown {
  if (!v || typeof v !== "object") return v;
  const p = v as Record<string, unknown>;
  return p.routeStyle === "lean" ? { ...p, routeStyle: "speedrun" } : v;
}

function isRouteStyle(v: unknown): v is RouteStyle {
  return v === "balanced" || v === "speedrun";
}

function isProfile(v: unknown): v is Profile {
  if (!v || typeof v !== "object") return false;
  const p = v as Profile;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.race === "string" &&
    typeof p.cls === "string" &&
    isRouteStyle(p.routeStyle) &&
    !!p.options &&
    typeof p.options.showOptional === "boolean" &&
    typeof p.options.hideDone === "boolean" &&
    p.steps !== null &&
    typeof p.steps === "object" &&
    p.quests !== null &&
    typeof p.quests === "object" &&
    Array.isArray(p.addedQuests) &&
    p.schema === 1
  );
}

function snapshotOf(state: StoredState): unknown {
  return {
    schema: state.schema,
    activeId: state.activeId,
    profiles: state.profiles,
    guestRouteStyle: state.guestRouteStyle,
  };
}

export function migrate(raw: unknown): MigrateResult {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { state: emptyState(), backups: [], loadError: "Saved profile data was corrupt and could not be read.", preserve: false };
    }
  }
  if (raw === null || raw === undefined) {
    return { state: emptyState(), backups: [], loadError: null, preserve: false };
  }
  if (typeof raw !== "object") {
    return { state: emptyState(), backups: [], loadError: "Saved profile data was corrupt and could not be read.", preserve: false };
  }
  const doc = raw as Record<string, unknown>;
  const schema = doc.schema;
  if (typeof schema === "number" && schema > SCHEMA) {
    return {
      state: emptyState(),
      backups: [{ at: Date.now(), raw }],
      loadError: `Profile data uses schema ${schema}, which this app cannot read yet. A backup of the original data was kept.`,
      preserve: true,
    };
  }
  const existingBackups: BackupEntry[] = [];
  if (Array.isArray(doc.backups)) {
    for (const b of doc.backups) {
      if (b && typeof b === "object" && "raw" in (b as BackupEntry)) {
        existingBackups.push({ at: Number((b as BackupEntry).at) || 0, raw: (b as BackupEntry).raw });
      }
    }
  }
  const rawList = Array.isArray(doc.profiles) ? doc.profiles : [];
  const profiles = rawList.map(upgradeProfile).filter(isProfile);
  const dropped = Array.isArray(doc.profiles) && rawList.length !== profiles.length;
  const activeId = typeof doc.activeId === "string" && profiles.some((p) => p.id === doc.activeId) ? doc.activeId : (profiles[0]?.id ?? null);
  const guestRouteStyle = normalizeRouteStyle(doc.guestRouteStyle) ?? "balanced";
  return {
    state: { schema: SCHEMA, activeId, profiles, guestRouteStyle },
    backups: existingBackups.slice(0, BACKUP_LIMIT),
    loadError: dropped ? "Some saved profiles could not be read and were skipped. The original data was kept." : null,
    preserve: dropped,
  };
}

function isCharacterLink(v: unknown): v is CharacterLink {
  if (!v || typeof v !== "object") return false;
  const l = v as CharacterLink;
  return typeof l.name === "string" && typeof l.realm === "string";
}

function nonemptyGuid(guid: string | undefined): string | undefined {
  return typeof guid === "string" && guid.trim() ? guid : undefined;
}

/** Keep a stored guid when the incoming link has none. A new non-empty guid replaces the old one. */
function characterToStore(incoming: CharacterLink, previous?: CharacterLink): CharacterLink {
  const guid = nonemptyGuid(incoming.guid) ?? nonemptyGuid(previous?.guid);
  const next: CharacterLink = { name: incoming.name, realm: incoming.realm };
  if (guid) next.guid = guid;
  return next;
}

function sameCharacterLink(stored: CharacterLink | undefined, next: CharacterLink): boolean {
  return !!stored && stored.name === next.name && stored.realm === next.realm && stored.guid === next.guid;
}

function numberRecord(v: unknown): Record<string, number> | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, x] of Object.entries(v)) if (typeof x === "number" && Number.isFinite(x)) out[k] = x;
  return out;
}

function skillRecord(v: unknown): Profile["skills"] {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, { cur: number; max: number }> = {};
  for (const [k, x] of Object.entries(v)) {
    const r = x as { cur?: unknown; max?: unknown };
    if (r && typeof r.cur === "number" && typeof r.max === "number") out[k] = { cur: r.cur, max: r.max };
  }
  return out as Profile["skills"];
}

function questLogEntries(v: unknown): Profile["questLog"] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: NonNullable<Profile["questLog"]> = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as {
      questId?: unknown;
      id?: unknown;
      title?: unknown;
      complete?: unknown;
      objectives?: unknown;
    };
    const questId = typeof e.questId === "number" ? e.questId : typeof e.id === "number" ? e.id : undefined;
    if (questId === undefined || !Number.isFinite(questId) || questId <= 0) continue;
    const entry: NonNullable<Profile["questLog"]>[number] = { questId };
    if (typeof e.title === "string" && e.title) entry.title = e.title;
    if (typeof e.complete === "number" && Number.isFinite(e.complete)) entry.complete = e.complete;
    const objectives = objectivesOf(e.objectives);
    if (objectives.length) entry.objectives = objectives;
    out.push(entry);
  }
  return out;
}

function objectivesOf(v: unknown): NonNullable<NonNullable<Profile["questLog"]>[number]["objectives"]> {
  if (!Array.isArray(v)) return [];
  const out: NonNullable<NonNullable<Profile["questLog"]>[number]["objectives"]> = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as { text?: unknown; finished?: unknown; numFulfilled?: unknown; numRequired?: unknown; done?: unknown; total?: unknown };
    const row: NonNullable<NonNullable<Profile["questLog"]>[number]["objectives"]>[number] = {};
    if (typeof o.text === "string" && o.text) row.text = o.text;
    if (typeof o.finished === "boolean") row.finished = o.finished;
    const fulfilled = typeof o.numFulfilled === "number" ? o.numFulfilled : typeof o.done === "number" ? o.done : undefined;
    const required = typeof o.numRequired === "number" ? o.numRequired : typeof o.total === "number" ? o.total : undefined;
    if (fulfilled !== undefined) row.numFulfilled = fulfilled;
    if (required !== undefined) row.numRequired = required;
    out.push(row);
  }
  return out;
}

/** Map an addon quest-log snapshot onto the profile shape (complete: 1 ready, -1 failed, 0 otherwise). */
export function profileQuestLogFromGame(ch: GameExportCharacter): Profile["questLog"] | undefined {
  if (ch.questLog === undefined) return undefined;
  return ch.questLog.map((e) => {
    const entry: NonNullable<Profile["questLog"]>[number] = {
      questId: e.id,
      complete: e.failed ? -1 : e.complete ? 1 : 0,
    };
    if (e.title) entry.title = e.title;
    const objectives = (e.objectives ?? []).map((o) => {
      const row: NonNullable<NonNullable<Profile["questLog"]>[number]["objectives"]>[number] = { finished: o.finished };
      if (o.text) row.text = o.text;
      const fulfilled = o.numFulfilled ?? o.done;
      const required = o.numRequired ?? o.total;
      if (fulfilled !== undefined) row.numFulfilled = fulfilled;
      if (required !== undefined) row.numRequired = required;
      return row;
    });
    if (objectives.length) entry.objectives = objectives;
    return entry;
  });
}

/** v4: a missing Ok flag is unknown. Before v4, an empty quest log is a false empty (Forever). */
function questLogIsKnown(ch: GameExportCharacter): boolean {
  const ver = ch.schemaVersion ?? 0;
  if (ver >= 4) return ch.questLogOk === true;
  return ch.questLog !== undefined && ch.questLog.length > 0;
}

function skillsAreKnown(ch: GameExportCharacter): boolean {
  const ver = ch.schemaVersion ?? 0;
  if (ver >= 4) return ch.skillsOk === true;
  return (ch.skills?.length ?? 0) > 0;
}

function exportWarningsFor(ch: GameExportCharacter): string[] | undefined {
  if ((ch.schemaVersion ?? 0) < 4) return undefined;
  const warnings: string[] = [];
  if (ch.questLogOk !== true) warnings.push("quest log");
  if (ch.skillsOk !== true) warnings.push("professions");
  if (ch.durabilityOk !== true) warnings.push("durability");
  return warnings;
}

/** Synced fields carried through a JSON import (all optional). */
function importedSync(p: Partial<Profile>): Partial<Profile> {
  const out: Partial<Profile> = {};
  if (isCharacterLink(p.character)) out.character = characterToStore(p.character);
  const skills = skillRecord(p.skills);
  if (skills) out.skills = skills;
  if (typeof p.money === "number" && Number.isFinite(p.money)) out.money = p.money;
  const gear = numberRecord(p.gear);
  if (gear) out.gear = gear as Profile["gear"];
  if (typeof p.syncedAt === "number") out.syncedAt = p.syncedAt;
  const questLog = questLogEntries(p.questLog);
  if (questLog) out.questLog = questLog;
  if (typeof p.questLogSyncedAt === "string" && p.questLogSyncedAt) out.questLogSyncedAt = p.questLogSyncedAt;
  return out;
}

export function exportProfile(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfileJson(json: string, opts: { id: string; now: number }): Profile {
  const raw = JSON.parse(json) as unknown;
  if (!raw || typeof raw !== "object") throw new Error("Not a profile JSON file.");
  const p = raw as Partial<Profile>;
  if (typeof p.name !== "string" || typeof p.race !== "string" || typeof p.cls !== "string") {
    throw new Error("Profile JSON needs name, race and class.");
  }
  const routeStyle: RouteStyle = normalizeRouteStyle(p.routeStyle) ?? "balanced";
  const options = p.options ?? { showOptional: true, hideDone: false };
  const steps = p.steps && typeof p.steps === "object" ? p.steps : {};
  const quests = p.quests && typeof p.quests === "object" ? p.quests : {};
  const addedQuests = Array.isArray(p.addedQuests) ? p.addedQuests.filter((n) => typeof n === "number") : [];
  const current =
    p.current && typeof p.current.guide === "string" && typeof p.current.step === "string"
      ? { guide: p.current.guide, step: p.current.step }
      : undefined;
  return {
    id: opts.id,
    name: p.name,
    race: p.race,
    cls: p.cls,
    level: typeof p.level === "number" ? p.level : undefined,
    routeStyle,
    options: {
      showOptional: !!options.showOptional,
      hideDone: !!options.hideDone,
      dungeons: !!options.dungeons,
      ...((): { xpMods?: Profile["options"]["xpMods"] } => {
        const xpMods = packXpMods(options.xpMods);
        return xpMods ? { xpMods } : {};
      })(),
    },
    role: p.role === "tank" || p.role === "healer" || p.role === "dps" ? p.role : undefined,
    professions: Array.isArray(p.professions) ? p.professions.filter((x) => typeof x === "string") : undefined,
    steps,
    quests,
    addedQuests,
    current,
    ...importedSync(p),
    createdAt: typeof p.createdAt === "number" ? p.createdAt : opts.now,
    updatedAt: opts.now,
    schema: 1,
  };
}

/**
 * Overwrite level-independent synced fields (skills, gear, gold, quest log) from a schema-2
 * character and keep `professions` in step. Returns the same object when nothing changed.
 * The quest log is replaced wholesale when the export includes one; completed quests stay a union elsewhere.
 */
function applySynced(p: Profile, ch: GameExportCharacter, at: number): Profile {
  const f = syncedFields(ch);
  const skillsKnown = skillsAreKnown(ch);
  const questLogKnown = questLogIsKnown(ch);
  const next: Profile = { ...p, gear: f.gear };
  if (f.money !== undefined) next.money = f.money;
  else delete next.money;
  if (skillsKnown) {
    next.skills = f.skills;
    next.professions = mergeProfessions(p.professions, p.skills, f.skills);
    if (f.weaponSkills.length) next.weaponSkills = f.weaponSkills;
    else delete next.weaponSkills;
  }
  if (questLogKnown) {
    const questLog = profileQuestLogFromGame(ch) ?? [];
    const changed = JSON.stringify(p.questLog ?? null) !== JSON.stringify(questLog);
    next.questLog = questLog;
    if (changed || !p.questLogSyncedAt) next.questLogSyncedAt = new Date(at).toISOString();
  }
  if (ch.taxi !== undefined) next.flightPaths = mergeFlightPaths(p.flightPaths, ch.taxi);
  if (ch.bindOk === true || (typeof ch.bind === "string" && ch.bind.trim() !== "")) {
    if (ch.bind && ch.bind.trim()) next.hearth = ch.bind.trim();
  }
  if (ch.bagsOk === true) next.bags = ch.bags ?? {};
  if (typeof ch.xp === "number") next.xp = ch.xp;
  if (typeof ch.xpMax === "number") next.xpMax = ch.xpMax;
  if (typeof ch.xpRested === "number") next.xpRested = ch.xpRested;
  else delete next.xpRested;
  if (ch.position) next.position = ch.position;
  if (ch.reputation) {
    next.reputation = ch.reputation.map((row) => ({
      factionID: row.factionID,
      name: row.name,
      ...(row.reaction !== undefined ? { reaction: row.reaction } : {}),
      ...(row.current !== undefined ? { current: row.current } : {}),
      ...(row.min !== undefined ? { min: row.min } : {}),
      ...(row.max !== undefined ? { max: row.max } : {}),
    }));
  }
  if (ch.spells) next.spells = ch.spells;
  if (ch.durability) next.durability = ch.durability;
  if (ch.pet) next.pet = ch.pet;
  else if (ch.petOk === true) delete next.pet;
  if (typeof ch.deadOrGhost === "boolean") next.deadOrGhost = ch.deadOrGhost;
  if (ch.race && (RACE_KEYS as readonly string[]).includes(ch.race)) next.race = ch.race;
  if (ch.cls && (CLASS_KEYS as readonly string[]).includes(ch.cls)) next.cls = ch.cls;
  const warnings = exportWarningsFor(ch);
  if (warnings) {
    if (warnings.length) next.exportWarnings = warnings;
    else delete next.exportWarnings;
  }
  const prev = { ...p };
  const cur = { ...next };
  delete (prev as { updatedAt?: number }).updatedAt;
  delete (cur as { updatedAt?: number }).updatedAt;
  if (JSON.stringify(prev) === JSON.stringify(cur)) return p;
  next.updatedAt = at;
  return next;
}

function newId(id: () => string): string {
  try {
    return id();
  } catch {
    return `p${Date.now().toString(36)}`;
  }
}

/** Slugs listed on the guide index (brackets and race starts). */
export function indexGuideSlugs(index: GuideIndex): Set<string> {
  const slugs = new Set<string>();
  for (const bracket of index.brackets) for (const slug of bracket.guides) slugs.add(slug);
  for (const start of index.starts) slugs.add(start.firstGuide);
  return slugs;
}

/**
 * Race start pack from `GuideIndex.starts` (`race` → `firstGuide`).
 * When the race is not listed, the first leveling pack in bracket order (dungeon packs skipped).
 */
export function raceStartGuide(index: GuideIndex, race: string): string | undefined {
  const slugs = indexGuideSlugs(index);
  const match = index.starts.find((s) => (s.race as readonly string[]).includes(race));
  if (match && slugs.has(match.firstGuide)) return match.firstGuide;
  for (const bracket of index.brackets) {
    if (/dungeon/i.test(bracket.label)) continue;
    for (const slug of bracket.guides) {
      if (/dungeon/i.test(slug)) continue;
      if (slugs.has(slug)) return slug;
    }
  }
  return undefined;
}

function stepGuideSlug(stepId: string): string {
  const i = stepId.indexOf(":");
  return i === -1 ? stepId : stepId.slice(0, i);
}

/**
 * Indexed guides whose step ids use `prefix` (text before the first `:`).
 * A slug equal to the prefix is an exact guide. Otherwise every sub-pack that lists the prefix
 * in `idPrefixes` is returned. One shared prefix is not a unique guide.
 */
function guidesClaimingPrefix(index: GuideIndex, prefix: string): string[] {
  const slugs = indexGuideSlugs(index);
  if (slugs.has(prefix)) return [prefix];
  const found: string[] = [];
  for (const bracket of index.brackets) {
    const lists = bracket.idPrefixes;
    if (!lists) continue;
    for (const [slug, prefixes] of Object.entries(lists)) {
      if (prefixes.includes(prefix) && !found.includes(slug)) found.push(slug);
    }
  }
  return found;
}

/** True when any indexed guide lists this step-id prefix. Shared prefixes match every guide that claims them. */
function indexClaimsPrefix(index: GuideIndex, prefix: string): boolean {
  return guidesClaimingPrefix(index, prefix).length > 0;
}

/**
 * Guide that owns `stepId`. Loaded step lists win. A shared prefix is used only when exactly one
 * indexed guide claims it. When several claim it, keep `storedGuide` if that slug is still indexed.
 */
export function resolveGuideForStep(
  stepId: string,
  storedGuide: string | undefined,
  stepsByGuide: ReadonlyMap<string, ReadonlySet<string>>,
  index: GuideIndex | null,
): string | undefined {
  const owners: string[] = [];
  for (const [slug, ids] of stepsByGuide) {
    if (ids.has(stepId)) owners.push(slug);
  }
  if (storedGuide && owners.includes(storedGuide)) return storedGuide;
  if (owners.length === 1) return owners[0];
  const indexed = index ? indexGuideSlugs(index) : null;
  if (owners.length > 1) {
    if (storedGuide && indexed?.has(storedGuide)) return storedGuide;
    return undefined;
  }
  const prefix = stepGuideSlug(stepId);
  const claimed = index ? guidesClaimingPrefix(index, prefix) : [];
  if (claimed.length === 1) return claimed[0];
  if (claimed.length > 1) {
    if (storedGuide && indexed?.has(storedGuide)) return storedGuide;
    return undefined;
  }
  return storedGuide;
}

function loadedStepIds(guides: ReadonlyMap<string, Guide>): Set<string> {
  const ids = new Set<string>();
  for (const guide of guides.values()) for (const step of guide.steps) ids.add(step.id);
  return ids;
}

/** Accept/turnin quest ids on a step (other actions do not count). */
function acceptTurninQuestIds(step: Step): number[] {
  const ids: number[] = [];
  for (const action of step.actions) {
    if ((action.type === "accept" || action.type === "turnin") && !ids.includes(action.questId)) ids.push(action.questId);
  }
  return ids;
}

/**
 * Point a profile at a guide that still exists and drop step ticks for removed guides.
 * When `guides` contains the replacement pack, quest-complete accept/turnin steps are marked done
 * and `current.step` becomes a real step id. Otherwise the step is cleared.
 */
export function reconcileProfile(
  profile: Profile,
  index: GuideIndex,
  guides: ReadonlyMap<string, Guide>,
  now: number,
): Profile {
  const slugs = indexGuideSlugs(index);
  const knownIds = loadedStepIds(guides);
  let steps = profile.steps;
  const kept: Profile["steps"] = {};
  let dropped = false;
  for (const [id, rec] of Object.entries(steps)) {
    // Keep the tick id as stored. A shared prefix (horde-20-40, h4060) only proves the tick is still valid.
    const prefix = stepGuideSlug(id);
    if (knownIds.has(id) || slugs.has(prefix) || indexClaimsPrefix(index, prefix)) kept[id] = rec;
    else dropped = true;
  }
  if (dropped) steps = kept;

  let current = profile.current;
  const missing = !!current && !slugs.has(current.guide);
  if (missing && current) {
    const guide = raceStartGuide(index, profile.race);
    if (guide) current = { guide, step: "" };
  }
  const placing = !!current && slugs.has(current.guide) && current.step === "" && (missing || profile.current?.step === "");
  const loaded = current ? guides.get(current.guide) : undefined;
  if (placing && current) {
    if (loaded?.steps.length) {
      const stamped: Profile["steps"] = { ...steps };
      let marked = false;
      for (const step of loaded.steps) {
        const questIds = acceptTurninQuestIds(step);
        if (!questIds.length) continue;
        if (!questIds.every((id) => profile.quests[id] === "done")) continue;
        const prev = stamped[step.id];
        if (prev && "done" in prev && prev.done) continue;
        stamped[step.id] = { done: true, at: now };
        marked = true;
      }
      if (marked) steps = stamped;
      const catalog = stepPickQuests;
      let stepId = loaded.steps[0]!.id;
      if (catalog) {
        const draft: Profile = { ...profile, steps: stamped };
        const open = loaded.steps.find((s) => computeStepStatus(draft, s, () => [], catalog).status !== "not_applicable");
        if (open) stepId = open.id;
      }
      current = { guide: current.guide, step: stepId };
    } else {
      current = { guide: current.guide, step: "" };
    }
  }

  const loadedSteps = [...guides.values()].flatMap((g) => g.steps);
  if (loadedSteps.length) {
    const remapped = applyMergedProgress({ ...profile, steps, current }, loadedSteps, now);
    steps = remapped.steps;
    current = remapped.current;
  }

  if (steps === profile.steps && current === profile.current) return profile;
  if (current?.guide === profile.current?.guide && current?.step === profile.current?.step && steps === profile.steps) return profile;
  return { ...profile, steps, current, updatedAt: now };
}

function emptyGuest(): Profile {
  return {
    id: "guest",
    name: "Guest",
    race: "Orc",
    cls: "Warrior",
    routeStyle: "balanced",
    options: { showOptional: true, hideDone: false },
    steps: {},
    quests: {},
    addedQuests: [],
    createdAt: 0,
    updatedAt: 0,
    schema: 1,
  };
}

export interface EngineOptions {
  storage?: StorageLike;
  now?: () => number;
  id?: () => string;
  stepsForQuest?: StepsForQuest;
}

const BACKUP_MIN_INTERVAL_MS = 30_000;

type PersistOpts = {
  /** Skip rolling backup (cursor moves and step toggles). */
  skipBackup?: boolean;
  /** Write storage now (create / remove / import / sync). Otherwise idle-scheduled. */
  immediate?: boolean;
  /**
   * Snapshot policy after this mutation.
   * - `invalidate` (default): drop the lazy progress snapshot
   * - `keep`: cursor-only; status maps stay valid
   * - `{ stepId, quests }`: recompute the affected guide(s) only
   */
  snapshot?: "keep" | "invalidate" | { stepId: string; quests?: QuestLookup };
};

interface ProgressSnapshot {
  revision: number;
  quests: QuestLookup | undefined;
  done: Map<string, boolean>;
  status: Map<string, StepStatusResult>;
  requirement: Map<string, Requirement>;
  completionBySlug: Map<string, { done: number; total: number }>;
  doneCountBySlug: Map<string, number>;
  skipNav: Map<string, boolean>;
}

export interface DiskPayload {
  schema: 1;
  activeId: string | null;
  profiles: Profile[];
  guestRouteStyle: RouteStyle;
  backups: BackupEntry[];
}

export function createProfileEngine(opts: EngineOptions = {}) {
  const storage = opts.storage ?? createMemoryStorage();
  const now = opts.now ?? (() => Date.now());
  const id =
    opts.id ??
    (() => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`));
  let stepsForQuest: StepsForQuest = opts.stepsForQuest ?? (() => []);
  const knownSteps = new Map<string, Step>();
  /** slug → step ids of that loaded guide. Shared id prefixes are not a substitute for this set. */
  let stepsByGuide = new Map<string, ReadonlySet<string>>();
  /** Last guide index passed to reconcileGuides. Null until the index is known. */
  let guideIndex: GuideIndex | null = null;
  let guest: Profile = emptyGuest();
  let indexes: StepIndexes = emptyStepIndexes();
  let snapshot: ProgressSnapshot | null = null;
  /** Guides whose snapshot rows are stale. Filled lazily on the next read, not on the click. */
  let dirtySlugs: Set<string> | null = null;
  /** Quest catalog the React layer last loaded (`quests-min`). Selectors use this when callers omit `quests`. */
  let questCatalog: QuestLookup | undefined;
  const doneSel = new Map<string, boolean>();
  const statusSel = new Map<string, StepStatusResult>();
  const requirementSel = new Map<string, Requirement>();
  const completionSel = new Map<string, GuideCompletion>();
  const markedCompletionSel = new Map<string, GuideCompletion>();
  let currentStepSel: string | undefined;
  let currentGuideSel: string | undefined;
  let currentCursorSel: ProgressCursor | undefined;
  let hasCurrentCursorSel = false;
  let routeStyleSel: RouteStyle | undefined;
  let profileUiKeySel: string | undefined;
  let profileSummarySel: { id: string; name: string; race: typeof guest.race; cls: typeof guest.cls; level?: number } | null | undefined;

  let loadError: string | null = null;
  let backups: BackupEntry[] = [];
  let state: StoredState = emptyState();
  let revision = 0;
  const listeners = new Set<() => void>();
  let preservedText: string | null = (() => {
    try {
      return storage.getItem(PRESERVED_KEY);
    } catch {
      return null;
    }
  })();
  let lastFlushedState: StoredState = emptyState();
  let hasFlushed = false;
  let lastBackupAt = 0;
  let pendingPayload: DiskPayload | null = null;
  let idleHandle: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const notify = () => {
    for (const l of listeners) l();
  };

  const writePreserved = (raw: string): void => {
    preservedText = raw;
    try {
      storage.setItem(PRESERVED_KEY, raw);
    } catch {
      /* persist() retries */
    }
  };

  const readDisk = (): void => {
    let rawText: string | null = null;
    try {
      rawText = storage.getItem(STORAGE_KEY);
    } catch {
      loadError = "Could not read saved profiles (storage is blocked).";
      state = emptyState();
      backups = [];
      hasFlushed = false;
      return;
    }
    if (!rawText) {
      state = emptyState();
      backups = [];
      loadError = null;
      hasFlushed = false;
      return;
    }
    const loaded = migrate(rawText);
    state = loaded.state;
    backups = loaded.backups;
    loadError = loaded.loadError;
    hasFlushed = true;
    if (loaded.preserve) writePreserved(rawText);
  };

  readDisk();
  lastFlushedState = {
    schema: state.schema,
    activeId: state.activeId,
    profiles: state.profiles,
    guestRouteStyle: state.guestRouteStyle,
  };

  const g = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  const cancelScheduledWrite = (): void => {
    if (idleHandle !== undefined) {
      g.cancelIdleCallback?.(idleHandle);
      idleHandle = undefined;
    }
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
      timeoutHandle = undefined;
    }
  };

  const writePayload = (payload: DiskPayload): void => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (preservedText) storage.setItem(PRESERVED_KEY, preservedText);
      lastFlushedState = {
        schema: payload.schema,
        activeId: payload.activeId,
        profiles: payload.profiles,
        guestRouteStyle: payload.guestRouteStyle,
      };
      hasFlushed = true;
    } catch {
      loadError = loadError ?? "Could not save profiles (storage is full or blocked).";
    }
  };

  const flush = (): void => {
    cancelScheduledWrite();
    if (!pendingPayload) return;
    const payload = pendingPayload;
    pendingPayload = null;
    writePayload(payload);
  };

  const scheduleWrite = (payload: DiskPayload, immediate: boolean): void => {
    pendingPayload = payload;
    if (immediate) {
      flush();
      return;
    }
    if (idleHandle !== undefined || timeoutHandle !== undefined) return;
    if (typeof g.requestIdleCallback === "function") {
      idleHandle = g.requestIdleCallback(() => {
        idleHandle = undefined;
        flush();
      });
    } else {
      timeoutHandle = setTimeout(() => {
        timeoutHandle = undefined;
        flush();
      }, 0);
    }
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("pagehide", () => flush());
  }

  const invalidateSnapshot = (): void => {
    snapshot = null;
    dirtySlugs = null;
  };

  const rebuildIndexes = (): void => {
    indexes = buildStepIndexes(knownSteps.values(), stepsByGuide);
    invalidateSnapshot();
  };

  const persist = (next: StoredState, persistOpts?: PersistOpts): void => {
    if (!persistOpts?.skipBackup && hasFlushed) {
      const t = now();
      if (lastBackupAt === 0 || t - lastBackupAt >= BACKUP_MIN_INTERVAL_MS) {
        backups = [{ at: t, raw: snapshotOf(lastFlushedState) }, ...backups].slice(0, BACKUP_LIMIT);
        lastBackupAt = t;
      }
    }
    state = next;
    revision += 1;
    applySnapshotPolicy(persistOpts?.snapshot);
    scheduleWrite(
      {
        schema: 1,
        activeId: next.activeId,
        profiles: next.profiles,
        guestRouteStyle: next.guestRouteStyle,
        backups,
      },
      persistOpts?.immediate === true,
    );
    notify();
  };

  const active = (): Profile | null => state.profiles.find((p) => p.id === state.activeId) ?? null;
  const progressProfile = (): Profile => active() ?? guest;
  const slugForStep = (stepId: string, storedGuide?: string): string | undefined => {
    const unique = indexes.stepIdToSlug.get(stepId);
    if (unique) return unique;
    const many = indexes.stepIdToSlugs.get(stepId);
    if (many?.length === 1) return many[0];
    return resolveGuideForStep(stepId, storedGuide, stepsByGuide, guideIndex);
  };
  const stepsOfGuide = (slug: string | undefined): Step[] => {
    if (!slug) return [];
    return indexes.orderedBySlug.get(slug) ?? [];
  };
  const routeFor = (step: Step, profile: Profile = progressProfile()) => {
    const slug = slugForStep(step.id, profile.current?.guide);
    return { route: profile.routeStyle, steps: stepsOfGuide(slug), dungeons: profile.options.dungeons };
  };

  const fillGuideInSnapshot = (snap: ProgressSnapshot, slug: string, profile: Profile, quests?: QuestLookup): void => {
    const steps = indexes.orderedBySlug.get(slug) ?? [];
    const vis = createProfileEvaluator({
      race: profile.race,
      cls: profile.cls,
      routeStyle: profile.routeStyle,
      role: profile.role,
      dungeons: profile.options.dungeons ?? false,
      showOptional: profile.options.showOptional,
      hideDone: false,
    });
    const route = { route: profile.routeStyle, steps, dungeons: profile.options.dungeons };
    let doneCount = 0;
    let completionDone = 0;
    let completionTotal = 0;
    for (const step of steps) {
      const status = computeStepStatus(profile, step, NO_QUEST_STEPS, quests, route, indexes);
      const done =
        status.status === "done" ||
        (!!step.mergedIds?.length && storedMergedStepIsDone(profile.steps, step.id, step.mergedIds));
      const requirement = requirementFromStatus(status, profile, step, quests);
      snap.status.set(step.id, status);
      snap.done.set(step.id, done);
      snap.requirement.set(step.id, requirement);
      if (done) doneCount++;
      const shown = vis.step(step);
      if (shown.reason === "not_applicable") continue;
      if (!shown.visible && shown.reason !== "done") continue;
      if (!countsInProgress(requirement)) continue;
      completionTotal++;
      if (done) completionDone++;
    }
    const isDoneFn = (id: string) => snap.done.get(id) === true;
    for (const [id, skip] of skipFlagsForGuide(steps, isDoneFn)) snap.skipNav.set(id, skip);
    snap.doneCountBySlug.set(slug, doneCount);
    snap.completionBySlug.set(slug, { done: completionDone, total: completionTotal });
  };

  const fillOrphansInSnapshot = (snap: ProgressSnapshot, profile: Profile, quests?: QuestLookup): void => {
    for (const step of knownSteps.values()) {
      if (snap.status.has(step.id)) continue;
      const status = computeStepStatus(profile, step, NO_QUEST_STEPS, quests, routeFor(step, profile), indexes);
      const done =
        status.status === "done" ||
        (!!step.mergedIds?.length && storedMergedStepIsDone(profile.steps, step.id, step.mergedIds));
      snap.status.set(step.id, status);
      snap.done.set(step.id, done);
      snap.requirement.set(step.id, requirementFromStatus(status, profile, step, quests));
    }
  };

  const buildFullSnapshot = (quests?: QuestLookup): ProgressSnapshot => {
    const profile = progressProfile();
    const snap: ProgressSnapshot = {
      revision,
      quests,
      done: new Map(),
      status: new Map(),
      requirement: new Map(),
      completionBySlug: new Map(),
      doneCountBySlug: new Map(),
      skipNav: new Map(),
    };
    for (const slug of indexes.orderedBySlug.keys()) fillGuideInSnapshot(snap, slug, profile, quests);
    fillOrphansInSnapshot(snap, profile, quests);
    return snap;
  };

  const getSnapshot = (quests?: QuestLookup): ProgressSnapshot => {
    const catalog = quests ?? questCatalog;
    if (snapshot && snapshot.revision === revision && snapshot.quests === catalog) return snapshot;
    dirtySlugs = null;
    snapshot = buildFullSnapshot(catalog);
    return snapshot;
  };

  const refreshGuide = (snap: ProgressSnapshot, slug: string | undefined, quests?: QuestLookup): void => {
    if (!dirtySlugs || !slug || !dirtySlugs.has(slug)) return;
    fillGuideInSnapshot(snap, slug, progressProfile(), quests);
    dirtySlugs.delete(slug);
    if (dirtySlugs.size === 0) dirtySlugs = null;
  };

  const slugOfStep = (stepId: string): string | undefined =>
    indexes.stepIdToSlug.get(stepId) ?? indexes.stepIdToSlugs.get(stepId)?.[0];

  const affectedSlugsForStep = (stepId: string): Set<string> => {
    const slugs = new Set<string>();
    const addId = (id: string) => {
      const slug = indexes.stepIdToSlug.get(id) ?? indexes.stepIdToSlugs.get(id)?.[0];
      if (slug) slugs.add(slug);
    };
    addId(stepId);
    const step = knownSteps.get(stepId);
    const qids = new Set<number>(step ? stepProgressQuestIds(step) : []);
    if (step) {
      for (const a of step.actions) if (a.type === "turnin") qids.add(a.questId);
    }
    const idsForQuest = (qid: number): readonly string[] =>
      indexes.questIdToStepIds.get(qid) ?? stepsForQuest(qid);
    for (const qid of qids) {
      for (const id of idsForQuest(qid)) addId(id);
    }
    return slugs;
  };

  const patchSnapshot = (stepId: string, quests?: QuestLookup): void => {
    if (!snapshot || snapshot.quests !== quests) {
      snapshot = null;
      dirtySlugs = null;
      return;
    }
    snapshot.revision = revision;
    // Skip flags / blocked chains / merged progress: dirty the affected guide(s) and
    // recompute O(G) lazily on the next read of that guide, not all guides and not on the click.
    if (!dirtySlugs) dirtySlugs = new Set();
    for (const slug of affectedSlugsForStep(stepId)) dirtySlugs.add(slug);
  };

  const applySnapshotPolicy = (policy: PersistOpts["snapshot"]): void => {
    if (policy === "keep") {
      if (snapshot) snapshot.revision = revision;
      return;
    }
    if (policy && typeof policy === "object") {
      patchSnapshot(policy.stepId, policy.quests);
      return;
    }
    invalidateSnapshot();
  };

  const replaceActive = (profile: Profile, persistOpts?: PersistOpts): void => {
    persist(
      {
        ...state,
        profiles: state.profiles.map((p) => (p.id === profile.id ? profile : p)),
      },
      persistOpts,
    );
  };

  const mutateActive = (fn: (p: Profile) => Profile, persistOpts?: PersistOpts): void => {
    const p = active();
    if (!p) return;
    const next = fn(p);
    if (next === p) return;
    replaceActive(next, persistOpts);
  };

  const advanceStaleCursor = (profile: Profile): Profile => {
    const cur = profile.current;
    if (!cur) return profile;
    const indexed = guideIndex ? indexGuideSlugs(guideIndex) : null;
    const storedInIndex = !!indexed?.has(cur.guide);
    const resolved = resolveGuideForStep(cur.step, cur.guide, stepsByGuide, guideIndex);
    // A real sub-pack slug stays. A shared prefix never picks one of several sub-packs.
    const guide = storedInIndex ? cur.guide : resolved;
    if (!guide) {
      const claimed = guideIndex ? guidesClaimingPrefix(guideIndex, stepGuideSlug(cur.step)) : [];
      if (claimed.length > 1) {
        const { current: _drop, ...rest } = profile;
        return { ...rest, updatedAt: now() };
      }
      return profile;
    }
    const guideSteps = stepsOfGuide(guide);
    if (guideSteps.length === 0) return profile;
    const currentIdx = indexes.stepIdToIndex.get(cur.step);
    const currentStep = currentIdx !== undefined ? guideSteps[currentIdx] : guideSteps.find((s) => s.id === cur.step);
    if (!currentStep) return profile;
    const catalog = stepPickQuests;
    const isDone = (id: string) => isStepDone(profile, id, NO_QUEST_STEPS, knownSteps.get(id), catalog);
    const statusOf = (step: Step) =>
      computeStepStatus(profile, step, NO_QUEST_STEPS, catalog, routeFor(step, profile), indexes).status;
    const skip = skipFlagsForGuide(guideSteps, isDone);
    const stale =
      isDone(currentStep.id) ||
      statusOf(currentStep) === "not_applicable" ||
      skip.get(currentStep.id) === true;
    if (!stale) return profile;
    const vis = createProfileEvaluator({
      race: profile.race,
      cls: profile.cls,
      routeStyle: profile.routeStyle,
      role: profile.role,
      dungeons: profile.options.dungeons ?? false,
      showOptional: profile.options.showOptional,
      hideDone: false,
    });
    const visible = guideSteps.filter((s) => vis.step(s).visible);
    const byId = new Map(visible.map((s) => [s.id, s]));
    const picked = pickCurrentStepId(
      visible.map((s) => s.id),
      {
        cursorStep: cur.step,
        isDone,
        shouldSkip: (id) => {
          const step = byId.get(id);
          if (!step) return false;
          const st = statusOf(step);
          return st === "blocked" || st === "not_applicable" || skip.get(id) === true;
        },
      },
    );
    if (!picked || picked === cur.step) return profile;
    return { ...profile, current: { guide, step: picked }, updatedAt: now() };
  };

  const mutateProgress = (fn: (p: Profile) => Profile, persistOpts?: PersistOpts): void => {
    const p = active();
    if (p) {
      mutateActive(fn, persistOpts);
      return;
    }
    const next = fn(guest);
    if (next === guest) return;
    guest = next;
    revision += 1;
    applySnapshotPolicy(persistOpts?.snapshot);
    notify();
  };

  const engine = {
    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setStepsForQuest(fn: StepsForQuest): void {
      stepsForQuest = fn;
      invalidateSnapshot();
      notify();
    },
    setQuestCatalog(quests: QuestLookup | undefined): void {
      if (questCatalog === quests) return;
      questCatalog = quests;
      invalidateSnapshot();
      notify();
    },
    /** Remember which step ids belong to each guide so progress rings do not use a shared prefix. */
    noteGuides(guides: readonly Guide[]): void {
      stepsByGuide = new Map(guides.map((g) => [g.slug, new Set(g.steps.map((s) => s.id))]));
      rebuildIndexes();
    },
    setKnownSteps(steps: readonly Step[]): void {
      knownSteps.clear();
      for (const s of steps) knownSteps.set(s.id, s);
      rebuildIndexes();
      if (!steps.some((s) => s.mergedIds?.length)) {
        notify();
        return;
      }
      const t = now();
      let profilesChanged = false;
      const profiles = state.profiles.map((p) => {
        const next = applyMergedProgress(p, steps, t);
        if (next !== p) profilesChanged = true;
        return next;
      });
      const nextGuest = applyMergedProgress(guest, steps, t);
      if (nextGuest !== guest) guest = nextGuest;
      if (profilesChanged) persist({ ...state, profiles }, { immediate: true });
      else notify();
    },
    flush,
    loadError: () => loadError,
    backups: () => backups,
    profiles: () => state.profiles,
    active,
    progressProfile,
    revision: () => revision,
    create(input: { name: string; race: RaceKey; cls: ClassKey; level?: number }): Profile {
      const t = now();
      const copyGuest = state.profiles.length === 0;
      const p: Profile = {
        id: newId(id),
        name: input.name.trim() || "Adventurer",
        race: input.race,
        cls: input.cls,
        level: input.level,
        routeStyle: copyGuest ? guest.routeStyle : "balanced",
        options: { showOptional: true, hideDone: false },
        steps: copyGuest ? { ...guest.steps } : {},
        quests: copyGuest ? { ...guest.quests } : {},
        addedQuests: [],
        current: copyGuest ? guest.current : undefined,
        createdAt: t,
        updatedAt: t,
        schema: 1,
      };
      if (copyGuest) guest = emptyGuest();
      persist({ ...state, profiles: [...state.profiles, p], activeId: p.id }, { immediate: true });
      return p;
    },
    rename(pid: string, name: string): void {
      const trimmed = name.trim();
      if (!trimmed) return;
      persist({
        ...state,
        profiles: state.profiles.map((p) => (p.id === pid ? { ...p, name: trimmed, updatedAt: now() } : p)),
      });
    },
    duplicate(pid: string): Profile | undefined {
      const src = state.profiles.find((p) => p.id === pid);
      if (!src) return undefined;
      const t = now();
      const copy: Profile = {
        ...structuredClone(src),
        id: newId(id),
        name: `${src.name} copy`,
        createdAt: t,
        updatedAt: t,
      };
      persist({ ...state, profiles: [...state.profiles, copy], activeId: copy.id }, { immediate: true });
      return copy;
    },
    remove(pid: string): void {
      const profiles = state.profiles.filter((p) => p.id !== pid);
      const activeId = state.activeId === pid ? (profiles[0]?.id ?? null) : state.activeId;
      persist({ ...state, profiles, activeId }, { immediate: true });
    },
    switchTo(pid: string): void {
      if (!state.profiles.some((p) => p.id === pid) || state.activeId === pid) return;
      persist({ ...state, activeId: pid });
    },
    setOptions(partial: Partial<Profile["options"]>): void {
      mutateActive((p) => {
        const options = { ...p.options, ...partial };
        if ("xpMods" in partial) {
          const xpMods = packXpMods(partial.xpMods);
          if (xpMods) options.xpMods = xpMods;
          else delete options.xpMods;
        }
        return { ...p, options, updatedAt: now() };
      });
    },
    setLevel(level: number | undefined): void {
      mutateActive((p) => ({ ...p, level, updatedAt: now() }));
    },
    /** Class / role / professions picker (top bar Class chip, Profile page). `role: null` clears it. */
    setCharacter(patch: { cls?: ClassKey; role?: Role | null; professions?: ProfessionKey[] }): void {
      mutateActive((p) => {
        const next: Profile = { ...p, updatedAt: now() };
        if (patch.cls) next.cls = patch.cls;
        if (patch.role === null) delete next.role;
        else if (patch.role) next.role = patch.role;
        if (patch.professions) next.professions = [...patch.professions];
        return next;
      });
    },
    addNearMiss(questId: number): void {
      mutateActive((p) => (p.addedQuests.includes(questId) ? p : { ...p, addedQuests: [...p.addedQuests, questId], updatedAt: now() }));
    },
    removeNearMiss(questId: number): void {
      mutateActive((p) => {
        if (!p.addedQuests.includes(questId)) return p;
        return { ...p, addedQuests: p.addedQuests.filter((id) => id !== questId), updatedAt: now() };
      });
    },
    importParsed(json: string): Profile {
      const p = importProfileJson(json, { id: newId(id), now: now() });
      persist({ ...state, profiles: [...state.profiles, p], activeId: p.id }, { immediate: true });
      return p;
    },
    importGameCharacter(ch: GameExportCharacter, markCompleted: boolean): Profile {
      const p = engine.create({
        name: ch.name?.trim() || ch.key || "Imported",
        race: ch.race && (RACE_KEYS as readonly string[]).includes(ch.race) ? ch.race : "Orc",
        cls: ch.cls && (CLASS_KEYS as readonly string[]).includes(ch.cls) ? ch.cls : "Warrior",
        level: ch.level,
      });
      let next: Profile = { ...p, character: linkFor(ch), updatedAt: now() };
      if ((ch.schemaVersion ?? 0) >= 2) next = applySynced(next, ch, now());
      if (markCompleted && ch.completedQuests.length) {
        next = applyMarkQuestsDone(next, ch.completedQuests, now());
      }
      replaceActive(next, { immediate: true });
      return next;
    },
    isDone(stepId: string, quests?: QuestLookup): boolean {
      const snap = getSnapshot(quests);
      refreshGuide(snap, slugOfStep(stepId), quests);
      if (snap.done.has(stepId)) return snap.done.get(stepId)!;
      const profile = progressProfile();
      const step = knownSteps.get(stepId);
      if (isStepDone(profile, stepId, NO_QUEST_STEPS, step, quests)) return true;
      return !!step?.mergedIds?.length && storedMergedStepIsDone(profile.steps, stepId, step.mergedIds);
    },
    stepStatus(step: Step, quests?: QuestLookup) {
      const snap = getSnapshot(quests);
      refreshGuide(snap, slugOfStep(step.id), quests);
      const cached = snap.status.get(step.id);
      if (cached) return cached;
      return computeStepStatus(progressProfile(), step, NO_QUEST_STEPS, quests, routeFor(step), indexes);
    },
    requirement(step: Step, quests?: QuestLookup) {
      const snap = getSnapshot(quests);
      refreshGuide(snap, slugOfStep(step.id), quests);
      const cached = snap.requirement.get(step.id);
      if (cached) return cached;
      return stepRequirement(progressProfile(), step, NO_QUEST_STEPS, quests, routeFor(step), indexes);
    },
    guideCompletion(slug: string, quests?: QuestLookup): { done: number; total: number } | undefined {
      const snap = getSnapshot(quests);
      refreshGuide(snap, slug, quests);
      return snap.completionBySlug.get(slug);
    },
    toggle(stepId: string, step?: Step, quests?: QuestLookup): void {
      mutateProgress(
        (p) =>
          applyToggle(p, stepId, step, {
            stepsForQuest: NO_QUEST_STEPS,
            now: now(),
            quests,
          }),
        { skipBackup: true, snapshot: { stepId, quests } },
      );
    },
    setDone(stepIds: readonly string[], done: boolean): void {
      mutateProgress((p) => applySetDone(p, stepIds, done, now()), {
        skipBackup: true,
        snapshot: stepIds.length === 1 ? { stepId: stepIds[0]!, quests: undefined } : "invalidate",
      });
    },
    countDone(slug: string, quests?: QuestLookup): number {
      const snap = getSnapshot(quests);
      refreshGuide(snap, slug, quests);
      const cached = snap.doneCountBySlug.get(slug);
      if (cached !== undefined) return cached;
      const steps = indexes.orderedBySlug.get(slug) ?? [];
      let n = 0;
      for (const s of steps) if (snap.done.get(s.id)) n++;
      return n;
    },
    get current(): ProgressCursor | undefined {
      return progressProfile().current;
    },
    setCurrent(cursor: ProgressCursor): void {
      mutateProgress(
        (p) => {
          if (p.current?.guide === cursor.guide && p.current.step === cursor.step) return p;
          return advanceStaleCursor({ ...p, current: { ...cursor }, updatedAt: now() });
        },
        { skipBackup: true, snapshot: "keep" },
      );
    },
    get routeStyle(): RouteStyle {
      return progressProfile().routeStyle;
    },
    /** Stable boolean for `useSyncExternalStore` — same reference (primitive) while the value is unchanged. */
    selectDone(stepId: string): boolean {
      const v = engine.isDone(stepId);
      const prev = doneSel.get(stepId);
      if (prev === v) return prev;
      doneSel.set(stepId, v);
      return v;
    },
    selectStatus(stepId: string): StepStatusResult {
      const step = knownSteps.get(stepId);
      const raw = step ? engine.stepStatus(step) : { status: "open" as const };
      const kept = retainStatus(statusSel.get(stepId), raw);
      statusSel.set(stepId, kept);
      return kept;
    },
    selectRequirement(stepId: string): Requirement {
      const step = knownSteps.get(stepId);
      const raw = step ? engine.requirement(step) : { kind: "required" as const };
      const kept = retainRequirement(requirementSel.get(stepId), raw);
      requirementSel.set(stepId, kept);
      return kept;
    },
    selectGuideCompletion(slug: string): GuideCompletion | undefined {
      const raw = engine.guideCompletion(slug);
      const kept = retainCompletion(completionSel.get(slug), raw);
      if (kept) completionSel.set(slug, kept);
      else completionSel.delete(slug);
      return kept;
    },
    /**
     * With `stepIds`, always count stored ticks against those ids (index denominator
     * stays `stepIds.length`, even after the guide JSON loads). Without them, the
     * loaded-guide visibility snapshot.
     */
    selectMarkedCompletion(slug: string, stepIds?: readonly string[]): GuideCompletion | undefined {
      if (stepIds?.length) {
        const p = progressProfile();
        const raw = completionFromStepIds(stepIds, (id) => isStoredStepMarked(p.steps, id));
        const kept = retainCompletion(markedCompletionSel.get(slug), raw);
        if (kept) markedCompletionSel.set(slug, kept);
        return kept;
      }
      return engine.selectGuideCompletion(slug);
    },
    selectCurrentStepId(): string | undefined {
      const v = progressProfile().current?.step;
      if (currentStepSel === v) return currentStepSel;
      currentStepSel = v;
      return v;
    },
    selectCurrentGuide(): string | undefined {
      const v = progressProfile().current?.guide;
      if (currentGuideSel === v) return currentGuideSel;
      currentGuideSel = v;
      return v;
    },
    selectCurrentCursor(): ProgressCursor | undefined {
      const cur = progressProfile().current;
      if (
        hasCurrentCursorSel &&
        currentCursorSel?.guide === cur?.guide &&
        currentCursorSel?.step === cur?.step
      ) {
        return currentCursorSel;
      }
      currentCursorSel = cur ? { guide: cur.guide, step: cur.step } : undefined;
      hasCurrentCursorSel = true;
      return currentCursorSel;
    },
    selectRouteStyle(): RouteStyle {
      const v = progressProfile().routeStyle;
      if (routeStyleSel === v) return routeStyleSel;
      routeStyleSel = v;
      return v;
    },
    selectProfileSummary(): { id: string; name: string; race: typeof guest.race; cls: typeof guest.cls; level?: number } | null {
      const p = active();
      if (!p) {
        if (profileSummarySel === null) return null;
        profileSummarySel = null;
        return null;
      }
      const prev = profileSummarySel;
      if (
        prev &&
        prev.id === p.id &&
        prev.name === p.name &&
        prev.race === p.race &&
        prev.cls === p.cls &&
        prev.level === p.level
      ) {
        return prev;
      }
      const next = { id: p.id, name: p.name, race: p.race, cls: p.cls, level: p.level };
      profileSummarySel = next;
      return next;
    },
    /** Changes on profile / options / route — not on a single step tick. */
    selectProfileUiKey(): string {
      const p = progressProfile();
      const a = active();
      const key = [
        a?.id ?? "guest",
        String(state.profiles.length),
        a?.name ?? "",
        p.race,
        p.cls,
        p.role ?? "",
        p.routeStyle,
        p.options.showOptional ? "1" : "0",
        p.options.hideDone ? "1" : "0",
        p.options.dungeons ? "1" : "0",
        JSON.stringify(p.options.xpMods ?? null),
        p.xpRested ?? "",
        (p.professions ?? []).join(","),
        p.addedQuests.join(","),
        p.level ?? "",
      ].join(":");
      if (profileUiKeySel === key) return profileUiKeySel;
      profileUiKeySel = key;
      return key;
    },
    setRouteStyle(style: RouteStyle): void {
      mutateProgress((p) => (p.routeStyle === style ? p : { ...p, routeStyle: style, updatedAt: now() }));
    },
    markQuestsDone(questIds: readonly number[]): void {
      mutateActive((p) => applyMarkQuestsDone(p, questIds, now()));
    },
    /**
     * Apply a game export to the active profile.
     * Completed quests are a union (never unmarked). Level, professions, gold, gear, and the
     * quest-log snapshot are replaced by the export's values when present. The matched character
     * is stored as the profile's link. A cursor sitting on a done, not-applicable, or
     * passed non-quest step moves to the next open step when this guide's steps are loaded.
     */
    syncFromGame(exp: GameExport): GameSyncResult {
      const p = active();
      const result = evaluateGameSync(exp, p?.name, p?.character);
      if (!result.ok || !p) return result.ok ? { ok: false, reason: "no-profile" } : result;
      let newlyMarked = 0;
      for (const qid of result.questIds) {
        if (p.quests[qid] !== "done") newlyMarked++;
      }
      let next = applyMarkQuestsDone(p, result.questIds, now());
      if (typeof result.level === "number" && next.level !== result.level) {
        next = { ...next, level: result.level, updatedAt: now() };
      }
      if (result.link) {
        const character = characterToStore(result.link, next.character);
        if (!sameCharacterLink(next.character, character)) {
          next = { ...next, character, updatedAt: now() };
        }
      }
      let snapshotApplied = false;
      if ((result.character.schemaVersion ?? 0) >= 2) {
        const applied = applySynced(next, result.character, now());
        if (applied !== next) {
          next = applied;
          snapshotApplied = true;
        }
      }
      if (next !== p && (snapshotApplied || newlyMarked > 0 || next.level !== p.level)) {
        next = { ...next, syncedAt: now() };
      }
      const advanced = advanceStaleCursor(next);
      if (advanced !== next) next = advanced;
      if (next !== p) replaceActive(next, { immediate: true });
      const changeSummary = summarizeProfileSync(p, next);
      return { ...result, newlyMarked, snapshotApplied, ...(changeSummary ? { changeSummary } : {}) };
    },
    /** Link (or unlink with null) the active profile to an in-game character. */
    /**
     * When the guide index is loaded, drop ticks for removed guides and retarget a missing
     * `current.guide` at the race start pack. Pass guides already in memory; this does not fetch.
     */
    reconcileGuides(index: GuideIndex, guides: readonly Guide[]): void {
      guideIndex = index;
      stepsByGuide = new Map(guides.map((g) => [g.slug, new Set(g.steps.map((s) => s.id))]));
      rebuildIndexes();
      const bySlug = new Map(guides.map((g) => [g.slug, g]));
      const t = now();
      let profilesChanged = false;
      const profiles = state.profiles.map((p) => {
        const next = reconcileProfile(p, index, bySlug, t);
        if (next !== p) profilesChanged = true;
        return next;
      });
      const nextGuest = reconcileProfile(guest, index, bySlug, t);
      if (!profilesChanged && nextGuest === guest) return;
      guest = nextGuest;
      if (profilesChanged) persist({ ...state, profiles }, { immediate: true });
      else {
        revision += 1;
        invalidateSnapshot();
        notify();
      }
    },
    linkGameCharacter(link: CharacterLink | null): void {
      mutateActive((p) => {
        if (!link) {
          if (!p.character) return p;
          const { character: _drop, ...rest } = p;
          return { ...rest, updatedAt: now() };
        }
        const character = characterToStore(link, p.character);
        if (sameCharacterLink(p.character, character)) return p;
        return { ...p, character, updatedAt: now() };
      }, { immediate: true });
    },
  };

  return engine;
}

export type ProfileEngine = ReturnType<typeof createProfileEngine>;
