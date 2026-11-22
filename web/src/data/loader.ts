/**
 * Typed, cached loader for the site data in `web/public/data/` (plan §3, P0 §7 container shapes).
 *
 * - URLs are built from `import.meta.env.BASE_URL`, so the static build works from any path.
 * - Every resource is fetched at most once; the promise and, once settled, the value are cached.
 *   `peek()` returns a settled value synchronously so re-renders never flash a skeleton.
 * - Guides are lazy: `loadGuide(slug)` fetches `guides/<slug>.json` on first use.
 * - A failed fetch is evicted from the cache so `retry` works.
 */
import type { SearchDoc } from "../search/types";
import { setStepPickQuestCatalog } from "../state/profileStore";
import type { ClassProfessionsFile, Guide, GuideIndex, Insights, QuestDetail, QuestGeo, QuestInfo, QuestMin, ZoneInfo } from "./schema";

export class DataError extends Error {
  constructor(
    message: string,
    readonly path: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "DataError";
  }
}

type Entry = { promise: Promise<unknown>; settled: boolean; value?: unknown; error?: unknown };
const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

/** Subscribe to cache changes (a resource settled). Returns an unsubscribe function. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `<BASE_URL>data/<path>` */
export function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.endsWith("/") ? base : `${base}/`}data/${path}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(dataUrl(path), { headers: { Accept: "application/json" } });
  } catch (e) {
    throw new DataError(`Network error while loading ${path}: ${(e as Error).message}`, path);
  }
  if (!res.ok) {
    throw new DataError(
      res.status === 404 ? `${path} was not found. Run the pipeline or \`npm run data:fixtures\`.` : `${path}: HTTP ${res.status}`,
      path,
      res.status,
    );
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new DataError(`${path} is not valid JSON (the dev server may have returned index.html).`, path);
  }
}

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit.promise as Promise<T>;
  const entry: Entry = { promise: Promise.resolve(), settled: false };
  entry.promise = load().then(
    (value) => {
      entry.settled = true;
      entry.value = value;
      notify();
      return value;
    },
    (error: unknown) => {
      cache.delete(key);
      notify();
      throw error;
    },
  );
  cache.set(key, entry);
  return entry.promise as Promise<T>;
}

/** Settled value for a cache key, if any (synchronous). */
export function peek<T>(key: string): T | undefined {
  const e = cache.get(key);
  return e?.settled ? (e.value as T) : undefined;
}

/** Guides already in the cache — never starts a fetch. */
export function peekLoadedGuides(): Guide[] {
  const out: Guide[] = [];
  for (const [key, entry] of cache) {
    if (!key.startsWith("guide:") || !entry.settled || entry.value == null) continue;
    out.push(entry.value as Guide);
  }
  return out;
}

/** Drop one key (or everything) from the cache, e.g. after the pipeline rebuilt the data. */
export function invalidate(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
  notify();
}

function assert(cond: unknown, path: string, what: string): asserts cond {
  if (!cond) throw new DataError(`${path} does not look like ${what}.`, path);
}

// ---------- resource keys + loaders ----------

export const keys = {
  index: "index",
  guide: (slug: string) => `guide:${slug}`,
  quests: "quests",
  questsGeo: "quests-geo",
  questsDetail: "quests-detail",
  questSteps: "quest-steps",
  zones: "zones",
  insights: "insights",
  searchIndex: "search-index",
  classProfessions: "class-professions",
  trainers: "trainers",
  landing: "landing",
} as const;

/** Totals for the landing page's Horde card (written by build-data.ts). */
export interface LandingStats {
  steps: number;
  quests: number;
  zones: number;
}
export function loadLandingStats(): Promise<LandingStats> {
  return cached(keys.landing, async () => {
    const d = await fetchJson<LandingStats>("landing.json");
    assert(typeof d?.steps === "number" && typeof d?.quests === "number" && typeof d?.zones === "number", "landing.json", "landing stats");
    return d;
  });
}

export function loadGuideIndex(): Promise<GuideIndex> {
  return cached(keys.index, async () => {
    const d = await fetchJson<GuideIndex>("guide_index.json");
    assert(Array.isArray(d?.brackets) && Array.isArray(d?.starts), "guide_index.json", "a GuideIndex");
    return d;
  });
}

export function loadGuide(slug: string): Promise<Guide> {
  const path = `guides/${encodeURIComponent(slug)}.json`;
  return cached(keys.guide(slug), async () => {
    const d = await fetchJson<Guide>(path);
    assert(Array.isArray(d?.steps) && Array.isArray(d?.sections), path, "a Guide");
    return d;
  });
}

/** Compact `quest-steps.json`: quest id → step ids (from QuestInfo.inGuides). */
export type QuestStepsMap = ReadonlyMap<number, readonly string[]>;
export function loadQuestSteps(): Promise<QuestStepsMap> {
  return cached(keys.questSteps, async () => {
    try {
      const obj = await fetchJson<Record<string, unknown>>("quest-steps.json");
      assert(obj && typeof obj === "object" && !Array.isArray(obj), "quest-steps.json", "a quest-id map");
      const map = new Map<number, readonly string[]>();
      for (const [key, val] of Object.entries(obj)) {
        const id = Number(key);
        if (!Number.isFinite(id) || !Array.isArray(val)) continue;
        map.set(
          id,
          val.filter((s): s is string => typeof s === "string"),
        );
      }
      return map;
    } catch (e) {
      if (e instanceof DataError && e.status === 404) return new Map();
      throw e;
    }
  });
}

/** `quests-min.json` hydrated to `QuestInfo` (coordinates and detail filled in later). */
export type QuestMap = ReadonlyMap<number, QuestInfo>;
export type QuestGeoMap = ReadonlyMap<number, QuestGeo>;
export type QuestDetailMap = ReadonlyMap<number, QuestDetail>;

export function hydrateQuestMin(q: QuestMin): QuestInfo {
  return {
    id: q.id,
    name: q.name,
    level: q.level,
    reqLevel: q.reqLevel,
    zone: q.zone,
    races: q.races,
    classes: q.classes,
    custom: q.custom,
    pre: q.pre,
    exclusiveTo: q.exclusiveTo,
    breadcrumbFor: q.breadcrumbFor,
    xp: q.xp,
    start: q.start.map((g) => ({ ...g, at: [] })),
    end: q.end.map((g) => ({ ...g, at: [] })),
    objectivesText: [],
    objectives: [],
    repeatable: false,
  };
}

export function overlayQuestGeo(map: QuestMap, geo: QuestGeoMap | undefined): QuestMap {
  if (!geo) return map;
  const next = new Map<number, QuestInfo>();
  for (const [id, q] of map) {
    const g = geo.get(id);
    if (!g) {
      next.set(id, q);
      continue;
    }
    next.set(id, {
      ...q,
      start: q.start.map((s, i) => ({ ...s, at: g.start[i]?.at ?? s.at })),
      end: q.end.map((s, i) => ({ ...s, at: g.end[i]?.at ?? s.at })),
      objectives: g.objectives.map((o) => ({ kind: o.kind, id: o.id, name: o.name, at: o.at })),
    });
  }
  return next;
}

export function overlayQuestDetail(q: QuestInfo, detail: QuestDetail | undefined): QuestInfo {
  if (!detail) return q;
  const base = q.objectives.length
    ? q.objectives
    : detail.drops.map(() => ({ kind: "extra" as const, name: "", at: [] as QuestInfo["objectives"][number]["at"] }));
  return {
    ...q,
    objectivesText: detail.objectivesText,
    next: detail.next,
    repeatable: detail.repeatable,
    mapId: detail.mapId ?? q.mapId,
    xpTier: detail.xpTier,
    objectives: base.map((o, i) => {
      const drops = detail.drops[i];
      return drops && drops.length ? { ...o, drops } : o;
    }),
  };
}

function questMap<T extends { id: number }>(key: string, file: string, what: string): Promise<ReadonlyMap<number, T>> {
  return cached(key, async () => {
    const list = await fetchJson<T[]>(file);
    assert(Array.isArray(list), file, what);
    return new Map(list.map((q) => [q.id, q]));
  });
}

/** Slim catalog: names, levels, masks, prerequisites, giver names. */
export function loadQuestsMin(): Promise<QuestMap> {
  return cached(keys.quests, async () => {
    const list = await fetchJson<QuestMin[]>("quests-min.json");
    assert(Array.isArray(list), "quests-min.json", "a QuestMin[]");
    const map = new Map(list.map((q) => [q.id, hydrateQuestMin(q)]));
    setStepPickQuestCatalog(map);
    return map;
  });
}

/** Eager catalog used by profiles and guide requirements. */
export function loadQuests(): Promise<QuestMap> {
  return loadQuestsMin();
}

export function loadQuestsGeo(): Promise<QuestGeoMap> {
  return questMap<QuestGeo>(keys.questsGeo, "quests-geo.json", "a QuestGeo[]");
}

export function loadQuestsDetail(): Promise<QuestDetailMap> {
  return questMap<QuestDetail>(keys.questsDetail, "quests-detail.json", "a QuestDetail[]");
}

/** `zones.json` as a map by uiMapId. */
export type ZoneMap = ReadonlyMap<number, ZoneInfo>;
export function loadZones(): Promise<ZoneMap> {
  return cached(keys.zones, async () => {
    const list = await fetchJson<ZoneInfo[]>("zones.json");
    assert(Array.isArray(list), "zones.json", "a ZoneInfo[]");
    return new Map(list.map((z) => [z.mapId, z]));
  });
}

/** `insights.json` is optional (P5 may not have run yet): a 404 resolves to an empty Insights. */
export function loadInsights(): Promise<Insights> {
  return cached(keys.insights, async () => {
    try {
      return await fetchJson<Insights>("insights.json");
    } catch (e) {
      if (e instanceof DataError && e.status === 404) return { added: {}, nearMisses: {}, issues: [] };
      throw e;
    }
  });
}

/** Prebuilt MiniSearch corpus. A 404 (index not generated yet) is an empty list. */
export function loadSearchIndex(): Promise<SearchDoc[]> {
  return cached(keys.searchIndex, async () => {
    try {
      const list = await fetchJson<SearchDoc[]>("search-index.json");
      assert(Array.isArray(list), "search-index.json", "a SearchDoc[]");
      return list;
    } catch (e) {
      if (e instanceof DataError && e.status === 404) return [];
      throw e;
    }
  });
}

export interface TrainerTierRow {
  profession: string;
  tier: string;
  minLevel: number;
  minSkill: number;
  skillCap: number;
}

/** Slim `trainers.json` (profession tier caps). Optional: a 404 is an empty list. */
export function loadTrainers(): Promise<TrainerTierRow[]> {
  return cached(keys.trainers, async () => {
    try {
      const list = await fetchJson<TrainerTierRow[]>("trainers.json");
      assert(Array.isArray(list), "trainers.json", "a TrainerTier[]");
      return list;
    } catch (e) {
      if (e instanceof DataError && e.status === 404) return [];
      throw e;
    }
  });
}

/** `class_professions.json` (per-class profession recommendations) is optional: a 404 is an empty file. */
export function loadClassProfessions(): Promise<ClassProfessionsFile> {
  return cached(keys.classProfessions, async () => {
    try {
      return await fetchJson<ClassProfessionsFile>("class_professions.json");
    } catch (e) {
      if (e instanceof DataError && e.status === 404) return {};
      throw e;
    }
  });
}
