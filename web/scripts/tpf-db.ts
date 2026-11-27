/**
 * tpf-db (content/tpf-db, our own CC BY 4.0 database built from AdventureLog play logs) for the data build.
 *
 * Merge order for quests in the tpf-db zones (Zephras Isle for now), per quest:
 *   1. tpf-db confirmed (`content/tpf-db/*.json`)       → dataStatus "confirmed"
 *   2. tpf-db unconfirmed (`content/tpf-db/unconfirmed/`) → dataStatus "unconfirmed"
 *   3. QuestieDB (`content/questie-db`)                   → dataStatus "questie"
 * A higher layer replaces the fields it has; fields it lacks (quest level, race / class masks, objective text,
 * prerequisites) stay from the layer below. Quest `xp` stays QuestieDB's table value when there is one (tpf-db
 * records the rounded XP actually received; see compareTpfQuestie). Inferred prerequisites in tpf-db (`pre.status: "inferred"`) are not
 * used. The merged result is build input only; nothing here writes back to content/.
 *
 * tpf-db positions are keyed `map:<uiMapId>`; the merged `zones` gets those keys so map points resolve.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { QuestDataStatus } from "../../contracts/schema.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

export const TPF_ZONES: readonly string[] = ["Zephras Isle"];

type Ids = { npc?: number[]; object?: number[]; item?: number[] };
type Pts = Record<string, number[][]>;

export interface TpfQuest {
  id: number;
  status: "confirmed" | "unconfirmed";
  name?: string;
  zone?: string;
  zoneId?: number;
  mapId?: number;
  start?: Ids;
  end?: Ids;
  giverAt?: Pts;
  enderAt?: Pts;
  objectives?: Record<string, { id?: number; idUnresolved?: boolean; count?: number; text?: string }[]>;
  xpReceived?: { playerLevel: number; xp: number }[];
  pre?: { single?: number[]; group?: number[]; status?: string };
  [k: string]: unknown;
}
export interface TpfEntity {
  id: number;
  status: "confirmed" | "unconfirmed";
  name?: string;
  spawns?: Pts;
  minLevel?: number;
  maxLevel?: number;
  npcDrops?: number[];
  objectDrops?: number[];
  [k: string]: unknown;
}
export interface TpfDb {
  quests: Record<string, TpfQuest>;
  npcs: Record<string, TpfEntity>;
  objects: Record<string, TpfEntity>;
  items: Record<string, TpfEntity>;
  zones: Record<string, { name?: string; uiMapId?: number }>;
  unconfirmed: { quests: Record<string, TpfQuest>; npcs: Record<string, TpfEntity>; objects: Record<string, TpfEntity>; items: Record<string, TpfEntity> };
}

/** The questie-shaped db the build reads (a structural subset of build-data's `QuestDb`). */
export interface MergeableDb {
  quests: Record<string, { id: number }>;
  npcs: Record<string, { id: number }>;
  objects: Record<string, { id: number }>;
  items: Record<string, { id: number }>;
  zones: Record<string, { name?: string; uiMapId?: number; parent?: number; continent?: number }>;
  dataStatus?: Record<string, QuestDataStatus>;
}

function readIf<T>(p: string, dflt: T): T {
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf-8")) as T) : dflt;
}

/** content/tpf-db, or null when it has no quests.json. */
export function loadTpfDb(dir = join(ROOT, "content/tpf-db")): TpfDb | null {
  if (!existsSync(join(dir, "quests.json"))) return null;
  const r = <T>(f: string) => readIf<T>(join(dir, f), {} as T);
  return {
    quests: r("quests.json"),
    npcs: r("npcs.json"),
    objects: r("objects.json"),
    items: r("items.json"),
    zones: r("zones.json"),
    unconfirmed: { quests: r("unconfirmed/quests.json"), npcs: r("unconfirmed/npcs.json"), objects: r("unconfirmed/objects.json"), items: r("unconfirmed/items.json") },
  };
}

/** One point per zone key: the mean of that key's points, rounded to 0.01. */
export function centres(spawns: Pts): Pts {
  const out: Pts = {};
  for (const [k, pts] of Object.entries(spawns)) {
    if (!pts.length) continue;
    const x = pts.reduce((a, p) => a + (p[0] ?? 0), 0) / pts.length;
    const y = pts.reduce((a, p) => a + (p[1] ?? 0), 0) / pts.length;
    out[k] = [[Math.round(x * 100) / 100, Math.round(y * 100) / 100]];
  }
  return out;
}

/** AreaTable id (string key of `zones`) of the top-level zone drawn on `mapId`. */
function areaForMap(zones: MergeableDb["zones"], mapId: number | undefined): number | undefined {
  if (mapId === undefined) return undefined;
  for (const [k, z] of Object.entries(zones)) if (z.uiMapId === mapId && z.parent === undefined && /^\d+$/.test(k)) return Number(k);
  return undefined;
}

function inZones(q: { zone?: string }, zones: readonly string[]): boolean {
  return q.zone === undefined || zones.includes(q.zone);
}

const QUESTIE_ONLY = new Set(["status", "source", "evidence", "samples", "classNames"]);

function strip<T extends Record<string, unknown>>(rec: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) if (!QUESTIE_ONLY.has(k)) out[k] = v;
  return out;
}

/** tpf-db objectives → questie `{creatures, items, objects}`; a type with an unresolved id keeps `base`'s list. */
function objectivesFrom(rec: TpfQuest, base: Record<string, unknown> | undefined): Record<string, { id: number; count?: number }[]> | undefined {
  const baseObj = (base?.objectives ?? {}) as Record<string, { id: number }[]>;
  const out: Record<string, { id: number; count?: number }[]> = {};
  for (const type of ["creatures", "items", "objects"] as const) {
    const rows = rec.objectives?.[type];
    // Keep the logged count (numRequired): the XP sim reads `count` before parsing objective text.
    if (rows?.length && rows.every((r) => typeof r.id === "number")) out[type] = rows.map((r) => (typeof r.count === "number" && r.count > 0 ? { id: r.id!, count: r.count } : { id: r.id! }));
    else if (baseObj[type]?.length) out[type] = baseObj[type]!;
  }
  for (const [k, v] of Object.entries(baseObj)) if (!(k in out) && !["creatures", "items", "objects"].includes(k)) out[k] = v;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Merged db: QuestieDB, then tpf-db unconfirmed, then tpf-db confirmed on top (quests in `zones` only; NPCs,
 * objects and items whenever tpf-db has them). Sets `dataStatus` for every quest it touched.
 */
type LooseRec = Record<string, unknown> & { id: number };
type Loose = Omit<MergeableDb, "quests" | "npcs" | "objects" | "items"> & {
  quests: Record<string, LooseRec>;
  npcs: Record<string, LooseRec>;
  objects: Record<string, LooseRec>;
  items: Record<string, LooseRec>;
};

export function mergeQuestDb<T extends MergeableDb>(questie: T, tpf: TpfDb | null, zones: readonly string[] = TPF_ZONES): T {
  if (!tpf) return questie;
  const db = {
    ...questie,
    quests: { ...questie.quests },
    npcs: { ...questie.npcs },
    objects: { ...questie.objects },
    items: { ...questie.items },
    zones: { ...questie.zones },
    dataStatus: { ...(questie.dataStatus ?? {}) },
  } as unknown as Loose & { dataStatus: Record<string, QuestDataStatus> };
  for (const [k, z] of Object.entries(tpf.zones)) if (!(k in db.zones)) db.zones[k] = { name: z.name, uiMapId: z.uiMapId };

  const overlayEntities = (layer: "unconfirmed" | "confirmed") => {
    const src = layer === "confirmed" ? tpf : tpf.unconfirmed;
    for (const kind of ["npcs", "objects", "items"] as const) {
      for (const [k, rec] of Object.entries(src[kind])) {
        const base = db[kind][k];
        const merged: Record<string, unknown> & { id: number } = { ...(base ?? {}), ...strip(rec), id: rec.id };
        if (layer === "confirmed") {
          // Drop lists: an item QuestieDB already has keeps its lists, extended by what the logs saw only when the
          // item is an objective of a tpf-db quest. A common drop (Linen Cloth) must not pull island mobs into
          // other zones' objectives; an item new to QuestieDB takes the logged lists as they are.
          const objective = Array.isArray(rec.questObjectiveOf) && rec.questObjectiveOf.length > 0;
          for (const f of ["npcDrops", "objectDrops"] as const) {
            if (!base) continue;
            if (objective && rec[f]) merged[f] = [...new Set([...((base[f] as number[] | undefined) ?? []), ...(rec[f] as number[])])];
            else if (base[f]) merged[f] = base[f];
            else delete merged[f];
          }
          if (!rec.spawns && base?.spawns) merged.spawns = base.spawns;
          // A quest giver / ender / trainer that never fought stands in one place: its points are where the player
          // stood while talking to it, so keep their centre (one spawn, like QuestieDB), not every dialog spot.
          const roles = (rec.roles as string[] | undefined) ?? [];
          if (kind === "npcs" && rec.spawns && roles.length && !roles.includes("mob")) merged.spawns = centres(rec.spawns);
        }
        db[kind][k] = merged;
      }
    }
  };

  overlayEntities("unconfirmed");
  for (const [k, rec] of Object.entries(tpf.unconfirmed.quests)) {
    if (!inZones(rec, zones)) continue;
    db.quests[k] = { ...(db.quests[k] ?? {}), ...strip(rec), id: rec.id };
    db.dataStatus[k] = "unconfirmed";
  }
  overlayEntities("confirmed");
  for (const [k, rec] of Object.entries(tpf.quests)) {
    if (!inZones(rec, zones)) continue;
    const base = db.quests[k] as Record<string, unknown> | undefined;
    const merged: Record<string, unknown> & { id: number } = { ...(base ?? {}), id: rec.id };
    if (rec.name) merged.name = rec.name;
    if (rec.zone) merged.zone = (base?.zone as string | undefined) ?? rec.zone;
    if (merged.zoneId === undefined) {
      const area = areaForMap(db.zones, rec.mapId);
      if (area !== undefined) merged.zoneId = area;
    }
    const pick = (ids: Ids | undefined, prev: unknown) => {
      if (!ids) return prev;
      const out: Ids = { ...((prev as Ids | undefined) ?? {}) };
      for (const f of ["npc", "object", "item"] as const) if (ids[f]?.length) out[f] = ids[f];
      return out;
    };
    merged.start = pick(rec.start, base?.start);
    merged.end = pick(rec.end, base?.end);
    if (merged.start === undefined) delete merged.start;
    if (merged.end === undefined) delete merged.end;
    const obj = objectivesFrom(rec, base);
    if (obj) merged.objectives = obj;
    // Observed XP is the client's rounded reward at the player's level; QuestieDB's `xp` is the QuestXP table value
    // the build matches to an XP tier. Keep QuestieDB's when it has one (the diff is in the comparison report).
    const xp = rec.xpReceived?.[0]?.xp;
    if (merged.xp === undefined && typeof xp === "number" && xp > 0) merged.xp = xp;
    if (merged.forever === undefined && rec.id >= 90000) merged.forever = true;
    db.quests[k] = merged;
    db.dataStatus[k] = "confirmed";
  }
  return db as unknown as T;
}

/** QuestieDB + tpf-db, as the build reads it. */
export function loadMergedQuestDb<T extends MergeableDb>(questie: T, tpfDir = join(ROOT, "content/tpf-db")): T {
  return mergeQuestDb(questie, loadTpfDb(tpfDir));
}

// ---------- comparison report ----------

function dist(a: number[], b: number[]): number {
  return Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0));
}

/** For every tpf point on `mapId`, the distance (zone %) to the nearest QuestieDB spawn on the same map. */
function nearest(tpfPts: Pts | undefined, qSpawns: Pts | undefined, zones: MergeableDb["zones"]): number | null {
  if (!tpfPts || !qSpawns) return null;
  let worst: number | null = null;
  for (const [tk, pts] of Object.entries(tpfPts)) {
    const mapId = Number(tk.split(":")[1]);
    const same = Object.entries(qSpawns).filter(([qk]) => zones[qk]?.uiMapId === mapId).flatMap(([, p]) => p);
    if (!same.length) continue;
    for (const p of pts) {
      const d = Math.min(...same.map((s) => dist(p, s)));
      worst = worst === null ? d : Math.max(worst, d);
    }
  }
  return worst === null ? null : Math.round(worst * 100) / 100;
}

const sortedIds = (x: number[] | undefined) => [...new Set(x ?? [])].sort((a, b) => a - b);
const sameIds = (a: number[] | undefined, b: number[] | undefined) => JSON.stringify(sortedIds(a)) === JSON.stringify(sortedIds(b));
const subset = (a: number[] | undefined, b: number[] | undefined) => (a ?? []).every((x) => (b ?? []).includes(x));

/** Client quest-XP rounding (classic rule): ≤100 → 5, ≤500 → 10, ≤1000 → 25, else 50. */
export function roundQuestXp(xp: number): number {
  const step = xp <= 100 ? 5 : xp <= 500 ? 10 : xp <= 1000 ? 25 : 50;
  return Math.round(xp / step) * step;
}

export interface TpfComparison {
  schema: "project-forever/tpf-vs-questie";
  version: 1;
  questie: string;
  thresholds: { questNpcPct: number; mobPct: number };
  summary: Record<string, number>;
  quests: { id: number; name?: string; issues: string[]; tpf: Record<string, unknown>; questie: Record<string, unknown> }[];
  npcs: { id: number; name?: string; issues: string[]; tpf: Record<string, unknown>; questie: Record<string, unknown> }[];
  objects: { id: number; name?: string; issues: string[] }[];
  items: { id: number; name?: string; issues: string[] }[];
}

/** ids, names, givers, objective ids, XP and positions where tpf-db confirmed and QuestieDB disagree. */
export function compareTpfQuestie(questieDb: MergeableDb, tpf: TpfDb, questieLabel = "content/questie-db", thresholds = { questNpcPct: 1.5, mobPct: 5 }): TpfComparison {
  const questie = questieDb as unknown as Loose;
  const summary: Record<string, number> = {};
  const bump = (k: string) => (summary[k] = (summary[k] ?? 0) + 1);
  const quests: TpfComparison["quests"] = [];
  for (const k of Object.keys(tpf.quests).sort((a, b) => Number(a) - Number(b))) {
    const t = tpf.quests[k]!;
    const q = questie.quests[k] as (Record<string, unknown> & { start?: Ids; end?: Ids; objectives?: Record<string, { id: number }[]>; xp?: number; name?: string }) | undefined;
    const issues: string[] = [];
    const tv: Record<string, unknown> = {};
    const qv: Record<string, unknown> = {};
    if (!q) {
      issues.push("missing-in-questie");
    } else {
      if (t.name && q.name && t.name !== q.name) (issues.push("name"), (tv.name = t.name), (qv.name = q.name));
      // A subset is normal (one run meets one of several givers); ids QuestieDB does not list are a disagreement.
      for (const side of ["start", "end"] as const) {
        const ti = t[side]?.npc;
        if (!ti?.length || sameIds(ti, q[side]?.npc)) continue;
        const tag = subset(ti, q[side]?.npc) ? `${side}-npc-partial` : `${side}-npc`;
        issues.push(tag);
        tv[side] = sortedIds(ti);
        qv[side] = sortedIds(q[side]?.npc);
      }
      for (const type of ["creatures", "items", "objects"] as const) {
        const rows = t.objectives?.[type] ?? [];
        const ti = rows.filter((r) => typeof r.id === "number").map((r) => r.id!);
        if (!ti.length) continue;
        const qi = (q.objectives?.[type] ?? []).map((r) => r.id);
        if (sameIds(ti, qi)) continue;
        const partial = subset(ti, qi) && rows.some((r) => r.idUnresolved);
        issues.push(partial ? `objective-${type}-partial` : `objective-${type}`);
        tv[type] = sortedIds(ti);
        qv[type] = sortedIds(qi);
      }
      const xps = [...new Set((t.xpReceived ?? []).map((r) => r.xp))];
      if (xps.length && q.xp !== undefined && !xps.includes(q.xp)) {
        // Same value after the client's rounding → only rounding; otherwise a real XP difference.
        issues.push(xps.includes(roundQuestXp(q.xp)) ? "xp-rounding" : "xp");
        tv.xp = t.xpReceived;
        qv.xp = q.xp;
      }
      if (xps.length && q.xp === undefined) (issues.push("xp-missing-in-questie"), (tv.xp = t.xpReceived));
      for (const [side, at] of [["start", t.giverAt], ["end", t.enderAt]] as const) {
        const npc = t[side]?.npc?.[0];
        if (!npc || !at) continue;
        const d = nearest(at, questie.npcs[String(npc)]?.spawns as Pts | undefined, questie.zones);
        if (d !== null && d > thresholds.questNpcPct) (issues.push(`${side}-position`), (tv[`${side}At`] = at), (qv[`${side}Distance`] = d));
      }
    }
    for (const i of issues) bump(`quest:${i}`);
    if (issues.length) quests.push({ id: Number(k), ...(t.name ? { name: t.name } : {}), issues, tpf: tv, questie: qv });
  }
  const npcs: TpfComparison["npcs"] = [];
  for (const k of Object.keys(tpf.npcs).sort((a, b) => Number(a) - Number(b))) {
    const t = tpf.npcs[k]!;
    const q = questie.npcs[k] as (Record<string, unknown> & { name?: string; minLevel?: number; maxLevel?: number; spawns?: Pts }) | undefined;
    const issues: string[] = [];
    const tv: Record<string, unknown> = {};
    const qv: Record<string, unknown> = {};
    const roles = (t.roles as string[] | undefined) ?? [];
    if (!q) issues.push("missing-in-questie");
    else {
      if (t.name && q.name && t.name !== q.name) (issues.push("name"), (tv.name = t.name), (qv.name = q.name));
      if (t.minLevel !== undefined && q.minLevel !== undefined && (t.minLevel < q.minLevel || (t.maxLevel ?? 0) > (q.maxLevel ?? 0))) {
        issues.push("level");
        tv.levels = [t.minLevel, t.maxLevel];
        qv.levels = [q.minLevel, q.maxLevel];
      }
      const limit = roles.some((r) => r !== "mob") ? thresholds.questNpcPct : thresholds.mobPct;
      const d = nearest(t.spawns, q.spawns, questie.zones);
      if (d !== null && d > limit) (issues.push("position"), (qv.maxDistance = d));
      if (t.spawns && !q.spawns) issues.push("spawns-missing-in-questie");
    }
    for (const i of issues) bump(`npc:${i}`);
    if (issues.length) npcs.push({ id: Number(k), ...(t.name ? { name: t.name } : {}), issues, tpf: { roles, ...tv }, questie: qv });
  }
  const simple = (kind: "objects" | "items") => {
    const out: { id: number; name?: string; issues: string[] }[] = [];
    for (const k of Object.keys(tpf[kind]).sort((a, b) => Number(a) - Number(b))) {
      const t = tpf[kind][k]!;
      const q = questie[kind][k] as { name?: string } | undefined;
      const issues: string[] = [];
      if (!q) issues.push("missing-in-questie");
      else if (t.name && q.name && t.name !== q.name) issues.push("name");
      for (const i of issues) bump(`${kind === "objects" ? "object" : "item"}:${i}`);
      if (issues.length) out.push({ id: Number(k), ...(t.name ? { name: t.name } : {}), issues });
    }
    return out;
  };
  const objects = simple("objects");
  const items = simple("items");
  summary["tpf:quests"] = Object.keys(tpf.quests).length;
  summary["tpf:npcs"] = Object.keys(tpf.npcs).length;
  summary["tpf:objects"] = Object.keys(tpf.objects).length;
  summary["tpf:items"] = Object.keys(tpf.items).length;
  summary["tpf:unconfirmedQuests"] = Object.keys(tpf.unconfirmed.quests).length;
  const sortedSummary = Object.fromEntries(Object.entries(summary).sort(([a], [b]) => a.localeCompare(b)));
  return { schema: "project-forever/tpf-vs-questie", version: 1, questie: questieLabel, thresholds, summary: sortedSummary, quests, npcs, objects, items };
}
