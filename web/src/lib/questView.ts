import type { QuestInfo, Section } from "../data/schema";

type ZonePoint = { x: number; y: number };

function isPlaceholder(p: ZonePoint): boolean {
  return p.x === 0 && p.y === 0;
}

export function wowheadQuestUrl(q: Pick<QuestInfo, "id" | "custom">): string | undefined {
  if (q.custom) return undefined;
  return `https://www.wowhead.com/classic/quest=${q.id}`;
}

export function namedChain(
  ids: readonly number[],
  quests: ReadonlyMap<number, Pick<QuestInfo, "name">> | undefined,
): { id: number; name: string }[] {
  return ids.map((id) => ({ id, name: quests?.get(id)?.name ?? `Quest ${id}` }));
}

export interface QuestPin {
  kind: "start" | "end";
  x: number;
  y: number;
  label: string;
  mapId: number;
  zone: string;
}

export interface QuestLeg {
  /** Zone-% points in order: starts, then objective points, then ends. Same map only. */
  path: { x: number; y: number }[];
  /** Start pins then end pins that lie on `mapId`. */
  pins: QuestPin[];
}

function displayMapId(q: Pick<QuestInfo, "mapId" | "start" | "end">, mapId?: number): number | undefined {
  if (mapId != null) return mapId;
  if (q.mapId != null) return q.mapId;
  const start = q.start[0]?.at[0]?.mapId;
  if (start != null) return start;
  return q.end[0]?.at[0]?.mapId;
}

function firstOnMap(points: QuestInfo["start"][number]["at"], mapId: number) {
  return points.find((p) => p.mapId === mapId && !isPlaceholder(p));
}

function sameCell(a: ZonePoint, b: ZonePoint): boolean {
  return a.x.toFixed(1) === b.x.toFixed(1) && a.y.toFixed(1) === b.y.toFixed(1);
}

export function questLeg(q: QuestInfo, mapId?: number): QuestLeg {
  const chosen = displayMapId(q, mapId);
  if (chosen == null) return { path: [], pins: [] };

  const startPins: QuestPin[] = [];
  const startPath: ZonePoint[] = [];
  for (const g of q.start) {
    const at = firstOnMap(g.at, chosen);
    if (!at) continue;
    startPins.push({ kind: "start", x: at.x, y: at.y, label: g.name, mapId: at.mapId, zone: at.zone });
    startPath.push({ x: at.x, y: at.y });
  }

  const objPath: ZonePoint[] = [];
  for (const obj of q.objectives) {
    for (const at of obj.at) {
      if (at.mapId !== chosen || isPlaceholder(at)) continue;
      const pt = { x: at.x, y: at.y };
      const prev = objPath.length ? objPath[objPath.length - 1] : startPath[startPath.length - 1];
      if (prev && sameCell(prev, pt)) continue;
      objPath.push(pt);
    }
  }

  const endPins: QuestPin[] = [];
  const endPath: ZonePoint[] = [];
  for (const g of q.end) {
    const at = firstOnMap(g.at, chosen);
    if (!at) continue;
    endPins.push({ kind: "end", x: at.x, y: at.y, label: g.name, mapId: at.mapId, zone: at.zone });
    endPath.push({ x: at.x, y: at.y });
  }

  return { path: [...startPath, ...objPath, ...endPath], pins: [...startPins, ...endPins] };
}

export function questMapPins(q: QuestInfo): QuestPin[] {
  return questLeg(q).pins;
}

const HEAT_MAX = 8;

export function questHeatPoints(q: QuestInfo, max = HEAT_MAX): ZonePoint[] {
  const mapId = displayMapId(q);
  const pts: ZonePoint[] = [];
  const seen = new Set<string>();
  for (const obj of q.objectives) {
    for (const at of obj.at) {
      if (mapId == null || at.mapId !== mapId || isPlaceholder(at)) continue;
      const key = `${at.x.toFixed(1)},${at.y.toFixed(1)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pts.push({ x: at.x, y: at.y });
    }
  }
  if (pts.length <= max) return pts;
  if (max <= 1) return pts.slice(0, max);
  const out: ZonePoint[] = [];
  for (let i = 0; i < max; i++) {
    const idx = Math.round((i * (pts.length - 1)) / (max - 1));
    const p = pts[idx]!;
    if (!out.some((o) => o.x === p.x && o.y === p.y)) out.push(p);
  }
  return out;
}

export function questMapSection(q: Pick<QuestInfo, "id" | "mapId" | "zone" | "start" | "end">): Section {
  const fallback = q.start[0]?.at[0] ?? q.end[0]?.at[0];
  return {
    id: `quest-${q.id}`,
    mapId: q.mapId ?? fallback?.mapId ?? 0,
    zone: q.zone ?? fallback?.zone ?? "Unknown",
    firstStep: "",
    lastStep: "",
    stops: [],
    route: [],
  };
}
