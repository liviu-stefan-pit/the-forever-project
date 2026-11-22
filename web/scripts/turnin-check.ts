/**
 * Duplicate turn-in check: on one route, a quest may be turned in by at most one step a character can see.
 *
 * Pure functions over (resolved or raw) per-pack step lists, so they run on the assembled packs in
 * build-data.ts and again on any single expanded pack (e.g. after the dungeon placeholder expansion).
 *
 * Two steps that turn in the same quest on the same route are a duplicate — within one pack or across packs —
 * unless they can never both be shown, i.e. they are mutually exclusive:
 * - dungeon toggle: a dungeon variant (`dungeon`, `.dungeon X`) vs an open-world alternative
 *   (`dungeonsOff`, `.dungeon !X`), using the same rule as `dungeonMode` in src/state/visibility.ts;
 * - `alternativeTo`: one step lists the other, or both are alternatives to the same step;
 * - character filters: no race/class combination passes both (`filter` and `classes`), or disjoint `roles`;
 * - packs declared `exclusive` (e.g. the race start zones Durotar / Mulgore / Tirisfal never run together).
 * Route membership follows the schema (`stepRoutes`): explicit `routes`, else bonus → balanced only, else both.
 */
import type { ClassKey, Filter, RouteStyle, Step } from "../../contracts/schema.ts";

export const ROUTES: readonly RouteStyle[] = ["balanced", "speedrun"];

/** Same rule as `stepRoutes` in src/state/visibility.ts (that module imports React, so it is mirrored here). */
export function stepRoutes(step: Step): RouteStyle[] {
  if (step.routes && step.routes.length) return step.routes;
  return step.bonus ? ["balanced"] : ["balanced", "speedrun"];
}

/** Same rule as `dungeonMode` in src/state/visibility.ts. */
export function dungeonMode(step: Step): "on" | "off" | "any" {
  if (step.dungeon) return "on";
  if (step.dungeonsOff) return "off";
  const c = step.conditions?.find((x) => x.cmd === "dungeon");
  if (!c) return "any";
  return /^\s*!/.test(c.args) ? "off" : "on";
}

export function turnedIn(step: Step): number[] {
  const ids = new Set<number>();
  for (const a of step.actions) if (a.type === "turnin" && typeof a.questId === "number") ids.add(a.questId);
  return [...ids];
}

export interface TurnInPack {
  id: string;
  steps: readonly Step[];
}

export interface DuplicateTurnIn {
  route: RouteStyle;
  questId: number;
  /** True when the clashing steps sit in more than one pack. */
  crossPack: boolean;
  packs: { pack: string; steps: string[] }[];
}

export interface TurnInCheckOptions {
  /** Groups of pack ids that never run together (race start zones). */
  exclusive?: readonly (readonly string[])[];
}

// ---------- mutual exclusivity ----------

const BASE_RACES = ["Orc", "Troll", "Tauren", "Undead"];
export const BASE_CLASSES: ClassKey[] = ["Warrior", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Paladin"] as ClassKey[];
const OTHER = "\u0000other";

const normRace = (r: string) => (r === "Scourge" ? "Undead" : r);

function filterMatches(filter: Filter | undefined, race: string, cls: string): boolean {
  if (!filter || filter.any.length === 0) return true;
  return filter.any.some((g) =>
    g.every((t) => {
      const pos = (t.race === undefined || normRace(t.race) === race) && (t.cls === undefined || t.cls === cls);
      return t.not ? !pos : pos;
    }),
  );
}

/** Same character rule as the UI evaluator: `classes` list and race/class `filter`. */
export function sees(step: Step, race: string, cls: string): boolean {
  if (step.classes?.length && !step.classes.includes(cls as ClassKey)) return false;
  return filterMatches(step.filter, race, cls);
}

/** True when no character / toggle state can show both steps. */
export function mutuallyExclusive(a: Step, b: Step): boolean {
  const ma = dungeonMode(a);
  const mb = dungeonMode(b);
  if (ma !== "any" && mb !== "any" && ma !== mb) return true;
  const altA = a.alternativeTo ?? [];
  const altB = b.alternativeTo ?? [];
  if (altA.includes(b.id) || altB.includes(a.id) || altA.some((x) => altB.includes(x))) return true;
  if (a.roles?.length && b.roles?.length && !a.roles.some((r) => b.roles!.includes(r))) return true;
  if (!a.filter && !b.filter && !a.classes?.length && !b.classes?.length) return false;
  const races = new Set<string>([...BASE_RACES, OTHER]);
  const classes = new Set<string>([...BASE_CLASSES, OTHER]);
  for (const s of [a, b]) {
    for (const g of s.filter?.any ?? []) for (const t of g) {
      if (t.race) races.add(normRace(t.race));
      if (t.cls) classes.add(t.cls);
    }
    for (const c of s.classes ?? []) classes.add(c);
  }
  for (const r of races) for (const c of classes) if (sees(a, r, c) && sees(b, r, c)) return false;
  return true;
}

// ---------- check ----------

/** Duplicate turn-ins on one route, sorted by quest id. Steps not on `route` are ignored. */
export function findDuplicateTurnIns(packs: readonly TurnInPack[], route: RouteStyle, opts: TurnInCheckOptions = {}): DuplicateTurnIn[] {
  const groupOf = new Map<string, number>();
  (opts.exclusive ?? []).forEach((g, i) => g.forEach((id) => groupOf.set(id, i)));
  const packsExclusive = (a: string, b: string) => a !== b && groupOf.has(a) && groupOf.get(a) === groupOf.get(b);

  const byQuest = new Map<number, { pack: string; step: Step }[]>();
  for (const p of packs) {
    for (const step of p.steps) {
      if (!stepRoutes(step).includes(route)) continue;
      for (const q of turnedIn(step)) byQuest.set(q, [...(byQuest.get(q) ?? []), { pack: p.id, step }]);
    }
  }
  const out: DuplicateTurnIn[] = [];
  for (const [questId, refs] of byQuest) {
    if (refs.length < 2) continue;
    const clashing = new Set<number>();
    for (let i = 0; i < refs.length; i++) {
      for (let j = i + 1; j < refs.length; j++) {
        const a = refs[i]!;
        const b = refs[j]!;
        if (a.step === b.step || packsExclusive(a.pack, b.pack) || mutuallyExclusive(a.step, b.step)) continue;
        clashing.add(i).add(j);
      }
    }
    if (!clashing.size) continue;
    const packsOut: DuplicateTurnIn["packs"] = [];
    for (const i of [...clashing].sort((x, y) => x - y)) {
      const r = refs[i]!;
      const e = packsOut.find((x) => x.pack === r.pack);
      if (e) e.steps.push(r.step.id);
      else packsOut.push({ pack: r.pack, steps: [r.step.id] });
    }
    out.push({ route, questId, crossPack: packsOut.length > 1, packs: packsOut });
  }
  return out.sort((a, b) => a.questId - b.questId);
}

export function formatDuplicateTurnIns(dups: readonly DuplicateTurnIn[], label = "duplicate turn-in check"): string {
  const quests = new Set(dups.map((d) => d.questId));
  const lines = dups.map(
    (d) => `[${d.route}] quest ${d.questId} turned in by ${d.packs.map((p) => `${p.pack} (${p.steps.join(", ")})`).join(" and ")}${d.crossPack ? "" : " (same pack)"}`,
  );
  return `${label} failed: ${quests.size} quest(s) turned in more than once on the same route\n- ${lines.join("\n- ")}`;
}

/** Both routes; throws with the full list when anything is duplicated. Returns the (empty) list otherwise. */
export function assertNoDuplicateTurnIns(packs: readonly TurnInPack[], opts: TurnInCheckOptions & { label?: string } = {}): DuplicateTurnIn[] {
  const dups = ROUTES.flatMap((r) => findDuplicateTurnIns(packs, r, opts));
  if (dups.length) throw new Error(formatDuplicateTurnIns(dups, opts.label));
  return dups;
}
