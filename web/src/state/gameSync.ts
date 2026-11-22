import type { Profile, ProfessionKey } from "../data/schema";
import { type GameExport, type GameExportCharacter, type GameProfessionInfo, type GameSkill } from "./luaExport";

/** The in-game character a profile follows (stored as `Profile.character`). */
export interface CharacterLink {
  name: string;
  realm: string;
  /** Stable character id from the export, when the addon sent one. */
  guid?: string;
}

/** The addon's SavedVariables key for a character: "Name-Realm". */
export function linkKey(l: CharacterLink): string {
  return `${l.name}-${l.realm}`;
}

export type GameSyncFailure =
  | "no-profile"
  | "name-mismatch"
  | "empty"
  | "missing"
  /** Several exported characters share the profile's name on different realms; link one. */
  | "ambiguous"
  /** The profile is linked to a character that is not in the export. */
  | "link-missing";

export type GameSyncResult =
  | {
      ok: false;
      reason: GameSyncFailure;
      exportName?: string;
      /** Display name of every character in the export (name-mismatch). */
      exportNames?: string[];
      profileName?: string;
      /** "Name-Realm" of the linked character, for `link-missing`. */
      linkKey?: string;
      exportedAt?: number;
    }
  | {
      ok: true;
      character: GameExportCharacter;
      /** Name + realm of the matched character (stored on the profile). */
      link?: CharacterLink;
      questIds: number[];
      level?: number;
      exportedAt?: number;
      /** Set by the profile engine: quest ids that were not already "done". */
      newlyMarked?: number;
      /** Set by the profile engine: level/professions/gold/gear were replaced with new values. */
      snapshotApplied?: boolean;
      /** Short diff vs the profile before this sync (quest log, flight paths, skills, hearth). */
      changeSummary?: string;
    };

/** Trim, lowercase, treat "-" as a space, collapse internal whitespace. */
function normName(name: string): string {
  return name.trim().toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
}

function normRealm(realm: string): string {
  return realm.trim().toLowerCase();
}

function finite(n: unknown): number | undefined {
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function bestExportedAt(character: GameExportCharacter | undefined, db: number | undefined): number | undefined {
  return finite(character?.exportedAt) ?? finite(db);
}

/**
 * Realm of an exported character. A present `realm` (including "" or whitespace) is used as
 * trimmed text and is never replaced from the key. The key is parsed only when `realm` is absent.
 */
export function characterRealm(c: GameExportCharacter): string | undefined {
  if (c.realm !== undefined && c.realm !== null) {
    const t = c.realm.trim();
    return t ? t : undefined;
  }
  const i = c.key.indexOf("-");
  const r = i >= 0 ? c.key.slice(i + 1).trim() : "";
  return r && r !== "?" ? r : undefined;
}

/** Full display name: `name`, else first + surname, else the key before the first "-". */
export function characterDisplayName(c: GameExportCharacter): string {
  const full = c.name?.trim();
  if (full) return full;
  const combined = [c.firstName, c.surname].filter((p): p is string => !!p && p.trim() !== "").join(" ").trim();
  if (combined) return combined;
  const i = c.key.indexOf("-");
  const fromKey = (i >= 0 ? c.key.slice(0, i) : c.key).trim();
  return fromKey || c.key;
}

/** The profile link for an exported character (full name + realm; realm "" when unknown). */
export function linkFor(c: GameExportCharacter): CharacterLink {
  const link: CharacterLink = { name: characterDisplayName(c), realm: characterRealm(c) ?? "" };
  if (c.guid) link.guid = c.guid;
  return link;
}

function withKeptGuid(next: CharacterLink, previous?: CharacterLink | null): CharacterLink {
  if (!next.guid && previous?.guid) return { ...next, guid: previous.guid };
  return next;
}

function sameCharacter(c: GameExportCharacter, link: CharacterLink): boolean {
  const l = linkFor(c);
  return normName(l.name) === normName(link.name) && normRealm(l.realm) === normRealm(link.realm);
}

/** Old link stored the first name only (no guid) against a character that now has a surname. */
function legacyFirstNameLink(c: GameExportCharacter, link: CharacterLink): boolean {
  if (link.guid) return false;
  const first = c.firstName?.trim();
  if (!first) return false;
  if (normName(link.name) !== normName(first)) return false;
  if (normName(link.name) === normName(characterDisplayName(c))) return false;
  return normRealm(link.realm) === normRealm(characterRealm(c) ?? "");
}

function currentExportName(exp: GameExport): string | undefined {
  const last = exp.lastCharacter
    ? exp.characters.find((c) => c.key === exp.lastCharacter)
    : undefined;
  const current = last ?? exp.characters[0];
  if (!current) return undefined;
  return characterDisplayName(current);
}

function exportDisplayNames(exp: GameExport): string[] {
  return exp.characters.map((c) => characterDisplayName(c));
}

function firstWord(name: string): string {
  return normName(name).split(" ")[0] ?? "";
}

/** True when the export carries more than completed quests (schema 2 snapshot). */
function hasSnapshot(c: GameExportCharacter): boolean {
  return (c.schemaVersion ?? 0) >= 2;
}

/**
 * Decide whether a game export may update the active profile.
 *
 * - A profile linked to a character (`link`, name + realm) only syncs from that exact character.
 * - An unlinked profile syncs from the one character whose name matches the profile name
 *   (case-insensitive). If that name exists on more than one realm the result is `ambiguous`
 *   and nothing is applied until the user links a character.
 *
 * This function does not mutate.
 */
export function evaluateGameSync(
  exp: GameExport | null | undefined,
  profileName: string | null | undefined,
  link?: CharacterLink | null,
): GameSyncResult {
  if (!exp) return { ok: false, reason: "missing" };

  const profile = profileName?.trim() ?? "";
  if (!profile) return { ok: false, reason: "no-profile" };

  if (!exp.characters.length) {
    return { ok: false, reason: "missing", profileName: profile, exportedAt: finite(exp.exportedAt) };
  }

  const last = exp.lastCharacter ? exp.characters.find((c) => c.key === exp.lastCharacter) : undefined;
  let character: GameExportCharacter | undefined;

  if (link) {
    const byGuid =
      link.guid && link.guid.trim()
        ? exp.characters.find((c) => c.guid && c.guid === link.guid)
        : undefined;
    character = byGuid ?? exp.characters.find((c) => sameCharacter(c, link) || legacyFirstNameLink(c, link));
    if (!character) {
      return {
        ok: false,
        reason: "link-missing",
        linkKey: linkKey(link),
        exportName: currentExportName(exp),
        profileName: profile,
        exportedAt: bestExportedAt(last ?? exp.characters[0], exp.exportedAt),
      };
    }
  } else {
    const wanted = normName(profile);
    const named = exp.characters.filter((c) => normName(characterDisplayName(c)) === wanted);
    if (named.length > 1) {
      return {
        ok: false,
        reason: "ambiguous",
        exportName: characterDisplayName(named[0]!),
        profileName: profile,
        exportedAt: bestExportedAt(last ?? exp.characters[0], exp.exportedAt),
      };
    }
    character = named[0];
    if (!character) {
      const legacy = exp.characters.filter((c) => c.surname === undefined && firstWord(profile) !== "" && firstWord(profile) === normName(c.name ?? ""));
      if (legacy.length > 1) {
        return {
          ok: false,
          reason: "ambiguous",
          exportName: characterDisplayName(legacy[0]!),
          profileName: profile,
          exportedAt: bestExportedAt(last ?? exp.characters[0], exp.exportedAt),
        };
      }
      character = legacy[0];
    }
  }

  if (!character) {
    return {
      ok: false,
      reason: "name-mismatch",
      exportName: currentExportName(exp),
      exportNames: exportDisplayNames(exp),
      profileName: profile,
      exportedAt: bestExportedAt(last ?? exp.characters[0], exp.exportedAt),
    };
  }

  const exportedAt = bestExportedAt(character, exp.exportedAt);
  if (character.completedQuests.length === 0 && !hasSnapshot(character)) {
    return { ok: false, reason: "empty", exportName: character.name?.trim(), profileName: profile, exportedAt };
  }

  const level = finite(character.level);
  return {
    ok: true,
    character,
    link: withKeptGuid(linkFor(character), link),
    questIds: character.completedQuests,
    ...(level !== undefined ? { level } : {}),
    ...(exportedAt !== undefined ? { exportedAt } : {}),
  };
}

const PROFESSION_KEYS: readonly ProfessionKey[] = [
  "Alchemy", "Blacksmithing", "Enchanting", "Engineering", "Herbalism", "Leatherworking", "Mining", "Skinning", "Tailoring",
  "Cooking", "First Aid", "Fishing",
];
const PRIMARY_KEYS: readonly ProfessionKey[] = PROFESSION_KEYS.slice(0, 9);

/** Classic skill line ids. Riding is recognized so it is not stored as a profession. */
const SKILL_ID_KEY: Record<number, ProfessionKey | "Riding"> = {
  164: "Blacksmithing",
  165: "Leatherworking",
  171: "Alchemy",
  182: "Herbalism",
  185: "Cooking",
  186: "Mining",
  197: "Tailoring",
  202: "Engineering",
  333: "Enchanting",
  356: "Fishing",
  393: "Skinning",
  129: "First Aid",
  762: "Riding",
};

function asProfessionKey(name: string): ProfessionKey | undefined {
  return PROFESSION_KEYS.find((k) => k.toLowerCase() === name.trim().toLowerCase());
}

function professionKeyOf(skillID: number | undefined, name: string | undefined): ProfessionKey | "Riding" | undefined {
  if (skillID !== undefined && SKILL_ID_KEY[skillID]) return SKILL_ID_KEY[skillID];
  if (!name) return undefined;
  return asProfessionKey(name);
}

/** Fields a schema-2 export overwrites on the profile. */
export interface SyncedFields {
  skills: NonNullable<Profile["skills"]>;
  weaponSkills: NonNullable<Profile["weaponSkills"]>;
  gear: NonNullable<Profile["gear"]>;
  money?: number;
}

function addProfession(
  skills: SyncedFields["skills"],
  key: ProfessionKey | "Riding" | undefined,
  cur: number,
  max: number,
): void {
  if (!key || key === "Riding") return;
  skills[key] = { cur, max };
}

function applySkillRow(skills: SyncedFields["skills"], weapons: SyncedFields["weaponSkills"], row: GameSkill): void {
  if (row.kind === "weapon") {
    weapons.push({ name: row.name, cur: row.rank, max: row.max });
    return;
  }
  if (row.kind === "riding" || row.skillID === 762) return;
  const key = professionKeyOf(row.skillID, row.name);
  if (row.kind === "other" && row.skillID === undefined) return;
  addProfession(skills, key, row.rank, row.max);
}

function applyProfessionInfo(skills: SyncedFields["skills"], row: GameProfessionInfo): void {
  const key = professionKeyOf(row.skillLine, row.name);
  if (!key || key === "Riding" || skills[key]) return;
  addProfession(skills, key, row.rank, row.max);
}

/** Profession skills, gear and gold of an exported character, in the profile's shape. */
export function syncedFields(c: GameExportCharacter): SyncedFields {
  const skills: SyncedFields["skills"] = {};
  const weaponSkills: SyncedFields["weaponSkills"] = [];
  for (const row of c.skills ?? []) applySkillRow(skills, weaponSkills, row);
  for (const row of c.professions ?? []) applyProfessionInfo(skills, row);
  const gear: SyncedFields["gear"] = {};
  for (const g of c.gear ?? []) gear[g.slot] = g.itemId;
  const out: SyncedFields = { skills, weaponSkills, gear };
  if (finite(c.money) !== undefined) out.money = c.money;
  return out;
}

/** Keep every known flight master. Nodes absent from `incoming` stay. */
export function mergeFlightPaths(
  current: Profile["flightPaths"],
  incoming: GameExportCharacter["taxi"],
): Profile["flightPaths"] {
  if (incoming === undefined) return current;
  const byId = new Map<number, NonNullable<Profile["flightPaths"]>[number]>();
  for (const node of current ?? []) byId.set(node.id, node);
  for (const node of incoming) {
    const prev = byId.get(node.id);
    byId.set(node.id, {
      id: node.id,
      name: node.name || prev?.name || "",
      ...(node.mapId !== undefined ? { mapId: node.mapId } : prev?.mapId !== undefined ? { mapId: prev.mapId } : {}),
    });
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

/**
 * `Profile.professions` kept in step with synced skills: every synced profession is listed; a
 * profession that an earlier sync reported but this one does not (unlearned) is dropped; planned
 * professions the game never reported stay while there is room (max two primary).
 */
export function mergeProfessions(
  current: readonly ProfessionKey[] | undefined,
  previousSkills: Profile["skills"],
  skills: NonNullable<Profile["skills"]>,
): ProfessionKey[] {
  const synced = PROFESSION_KEYS.filter((k) => skills[k] !== undefined);
  const out = [...synced];
  let primaries = synced.filter((k) => PRIMARY_KEYS.includes(k)).length;
  for (const k of current ?? []) {
    if (out.includes(k)) continue;
    if (previousSkills?.[k] !== undefined) continue; // unlearned in game
    if (PRIMARY_KEYS.includes(k)) {
      if (primaries >= 2) continue;
      primaries++;
    }
    out.push(k);
  }
  return out;
}

/**
 * One-line diff after a sync: quest-log count, new flight paths, skill ranks, hearth.
 * Empty when none of those fields changed.
 */
export function summarizeProfileSync(prev: Profile, next: Profile): string {
  const parts: string[] = [];
  if (next.questLogSyncedAt && next.questLog && (prev.questLog?.length ?? 0) !== next.questLog.length) {
    const delta = next.questLog.length - (prev.questLog?.length ?? 0);
    parts.push(`quest log ${delta > 0 ? `+${delta}` : delta}`);
  }
  const prevFp = new Set((prev.flightPaths ?? []).map((f) => f.id));
  const newFlights = (next.flightPaths ?? []).filter((f) => !prevFp.has(f.id)).length;
  if (newFlights > 0) parts.push(`${newFlights} new flight ${newFlights === 1 ? "path" : "paths"}`);
  const names = new Set<string>([...Object.keys(prev.skills ?? {}), ...Object.keys(next.skills ?? {})]);
  for (const name of [...names].sort()) {
    const key = name as ProfessionKey;
    const before = prev.skills?.[key];
    const after = next.skills?.[key];
    if (before && after && before.cur !== after.cur) parts.push(`${name} ${before.cur} to ${after.cur}`);
  }
  if (next.hearth && next.hearth !== prev.hearth) parts.push(`hearth ${next.hearth}`);
  return parts.join(", ");
}

/** Copper -> "28g 92s 51c". */
export function formatMoney(copper: number): string {
  const c = Math.max(0, Math.floor(copper));
  const g = Math.floor(c / 10000);
  const s = Math.floor((c % 10000) / 100);
  const k = c % 100;
  return g > 0 ? `${g}g ${s}s ${k}c` : s > 0 ? `${s}s ${k}c` : `${k}c`;
}
