/**
 * Quest-prerequisite check: walking a character's route in order, every accepted quest's QuestieDB
 * prerequisites must already be turned in earlier on that route.
 *
 * Per route (balanced, speedrun) × class (9 Horde classes incl. Paladin) × race start (Orc/Troll → Durotar,
 * Tauren → Mulgore, Undead → Tirisfal) × dungeons on/off, the sequence is: that race's start pack, then the
 * other leveling packs: 1–20 packs by level range, then the 20–60 sub-packs in play order
 * (the dungeon reference pack is not part of it). Steps are filtered
 * with the same rules as turnin-check / the UI: `routes`, `classes` + race/class `filter`, dungeon toggle.
 * Accepts of quests whose QuestieDB race/class mask excludes the character are skipped (they can't take it).
 *
 * QuestieDB `pre.single` (preQuestSingle) = any one of them; `pre.group` (preQuestGroup) = all of them.
 * `exclusiveTo` and `breadcrumbFor` are ignored. Turn-ins count from `turnin` actions, in action order.
 * Allowlist entries ({questId, missingPre, reason, source}) skip prereqs a source confirms are stale in Forever.
 */
import type { RouteStyle, Step } from "../../contracts/schema.ts";
import { HORDE_20_60_PACKS, horde2060Index } from "../src/lib/xp/leveling-chain.ts";
import { CLASS_MASK, RACE_MASK, maskExcludes } from "../src/state/raceClassMask.ts";
import { BASE_CLASSES, ROUTES, dungeonMode, sees, stepRoutes } from "./turnin-check.ts";

export { CLASS_MASK, RACE_MASK };

export const RACE_STARTS: readonly { race: string; zone: string }[] = [
  { race: "Orc", zone: "Durotar" },
  { race: "Troll", zone: "Durotar" },
  { race: "Tauren", zone: "Mulgore" },
  { race: "Undead", zone: "Tirisfal Glades" },
];
export const CLASSES: readonly string[] = BASE_CLASSES;

export interface PrereqQuest {
  races?: number;
  classes?: number;
  pre?: { single?: number[]; group?: number[] };
}

export interface PrereqPack {
  id: string;
  levels: [number, number];
  steps: readonly Step[];
  /** Start zone when this is a race start pack (e.g. "Durotar"). */
  startZone?: string;
}

export interface AllowlistEntry {
  questId: number;
  missingPre: number | number[];
  reason: string;
  source: string;
}

export interface PrereqViolation {
  stepId: string;
  pack: string;
  questId: number;
  /** For `single` (any-of): all candidates; for `group` (all-of): the ones not yet turned in. */
  missingPre: number[];
  kind: "single" | "group";
  routes: RouteStyle[];
  dungeons: ("on" | "off")[];
  /** "Race/Class" combos where it happens. */
  combos: string[];
}

export interface PrereqOptions {
  allowlist?: readonly AllowlistEntry[];
  routes?: readonly RouteStyle[];
  races?: readonly { race: string; zone: string }[];
  classes?: readonly string[];
}

export function masked(mask: number | undefined, bit: number | undefined): boolean {
  return maskExcludes(mask, bit);
}

export function visible(step: Step, route: RouteStyle, dungeons: "on" | "off", race: string, cls: string): boolean {
  if (!stepRoutes(step).includes(route)) return false;
  const m = dungeonMode(step);
  if (m !== "any" && m !== dungeons) return false;
  return sees(step, race, cls);
}

/**
 * Ordered pack list for one race start: its start pack, then non-20-60 packs by level range,
 * then `HORDE_20_60_PACKS` in play order. Level sort is only for packs outside that list,
 * so equal (or corrected) minLevels cannot scramble the 16 sub-packs.
 */
export function sequenceFor(packs: readonly PrereqPack[], zone: string): PrereqPack[] {
  const start = packs.filter((p) => p.startZone === zone);
  const rest = packs.filter((p) => !p.startZone);
  const byLevel = (a: PrereqPack, b: PrereqPack) => a.levels[0] - b.levels[0] || a.levels[1] - b.levels[1] || a.id.localeCompare(b.id);
  const other = rest.filter((p) => horde2060Index(p.id) === undefined).sort(byLevel);
  const listed = HORDE_20_60_PACKS.flatMap((id) => rest.filter((p) => p.id === id));
  return [...start, ...other, ...listed];
}

export function allowed(allow: readonly AllowlistEntry[], questId: number, missing: number[]): boolean {
  return allow.some((e) => {
    if (e.questId !== questId) return false;
    const ok = Array.isArray(e.missingPre) ? e.missingPre : [e.missingPre];
    return missing.every((m) => ok.includes(m));
  });
}

/** All prerequisite violations, collapsed across routes / dungeon states / combos. */
export function findPrereqViolations(packs: readonly PrereqPack[], quests: Readonly<Record<string, PrereqQuest>>, opts: PrereqOptions = {}): PrereqViolation[] {
  const allow = opts.allowlist ?? [];
  const out = new Map<string, PrereqViolation>();
  const add = (v: Omit<PrereqViolation, "routes" | "dungeons" | "combos">, route: RouteStyle, dungeons: "on" | "off", combo: string) => {
    const key = `${v.stepId}|${v.questId}|${v.kind}|${v.missingPre.join(",")}`;
    const e = out.get(key) ?? { ...v, routes: [], dungeons: [], combos: [] };
    if (!e.routes.includes(route)) e.routes.push(route);
    if (!e.dungeons.includes(dungeons)) e.dungeons.push(dungeons);
    if (!e.combos.includes(combo)) e.combos.push(combo);
    out.set(key, e);
  };
  for (const route of opts.routes ?? ROUTES) {
    for (const { race, zone } of opts.races ?? RACE_STARTS) {
      const seq = sequenceFor(packs, zone);
      for (const cls of opts.classes ?? CLASSES) {
        for (const dungeons of ["on", "off"] as const) {
          const done = new Set<number>();
          for (const p of seq) {
            for (const s of p.steps) {
              if (!visible(s, route, dungeons, race, cls)) continue;
              // Actions in order: a turn-in earlier in the same step counts for a later accept.
              for (const a of s.actions) {
                if (a.type === "turnin" && typeof a.questId === "number") done.add(a.questId);
                if (a.type === "accept" && typeof a.questId === "number") {
                  const q = quests[String(a.questId)];
                  if (!q || masked(q.races, RACE_MASK[race]) || masked(q.classes, CLASS_MASK[cls])) continue;
                  const single = q.pre?.single ?? [];
                  if (single.length && !single.some((x) => done.has(x)) && !allowed(allow, a.questId, single)) {
                    add({ stepId: s.id, pack: p.id, questId: a.questId, missingPre: single, kind: "single" }, route, dungeons, `${race}/${cls}`);
                  }
                  const group = (q.pre?.group ?? []).filter((x) => !done.has(x));
                  if (group.length && !allowed(allow, a.questId, group)) {
                    add({ stepId: s.id, pack: p.id, questId: a.questId, missingPre: group, kind: "group" }, route, dungeons, `${race}/${cls}`);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return [...out.values()];
}

function comboText(combos: readonly string[], races: readonly string[], classes: readonly string[]): string {
  if (combos.length === races.length * classes.length) return "all races/classes";
  const parts: string[] = [];
  for (const r of races) {
    const cs = classes.filter((c) => combos.includes(`${r}/${c}`));
    if (!cs.length) continue;
    parts.push(cs.length === classes.length ? `${r} (all classes)` : `${r} (${cs.join(", ")})`);
  }
  return parts.join("; ");
}

export function formatPrereqViolations(vs: readonly PrereqViolation[], opts: PrereqOptions = {}): string {
  const races = [...new Set((opts.races ?? RACE_STARTS).map((r) => r.race))];
  const classes = opts.classes ?? CLASSES;
  const lines = vs.map(
    (v) =>
      `[${v.routes.join("+")}] ${v.pack} step ${v.stepId}: accept quest ${v.questId} before ${v.kind === "single" ? "any of" : "all of"} [${v.missingPre.join(", ")}] is turned in` +
      ` — ${comboText(v.combos, races, classes)}${v.dungeons.length === 1 ? `, dungeons ${v.dungeons[0]} only` : ""}`,
  );
  return `quest prerequisite check failed: ${vs.length} violation(s)\n- ${lines.join("\n- ")}`;
}

/** Throws (mode "fail") or returns the violations for logging (mode "warn"); mode "off" skips. */
export function checkPrereqs(
  packs: readonly PrereqPack[],
  quests: Readonly<Record<string, PrereqQuest>>,
  opts: PrereqOptions & { mode?: "fail" | "warn" | "off" } = {},
): PrereqViolation[] {
  if (opts.mode === "off") return [];
  const vs = findPrereqViolations(packs, quests, opts);
  if (vs.length && (opts.mode ?? "fail") === "fail") throw new Error(formatPrereqViolations(vs, opts));
  return vs;
}

export function validateAllowlist(v: unknown): AllowlistEntry[] {
  if (!Array.isArray(v)) throw new Error("prereq-allowlist.json must be an array");
  return v.map((e, i) => {
    const ok =
      e && typeof e.questId === "number" &&
      (typeof e.missingPre === "number" || (Array.isArray(e.missingPre) && e.missingPre.every((x: unknown) => typeof x === "number"))) &&
      typeof e.reason === "string" && e.reason.trim() !== "" && typeof e.source === "string" && e.source.trim() !== "";
    if (!ok) throw new Error(`prereq-allowlist.json[${i}]: needs {questId: number, missingPre: number|number[], reason, source}`);
    return e as AllowlistEntry;
  });
}
