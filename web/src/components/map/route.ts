/**
 * Pure helpers for the zone route map (P8). Markers come from `section.stops`;
 * `section.route` is the polyline (including hidden waypoints that get no pins).
 */
import type { Filter, Section, Step, Stop } from "../../data/schema";
import type { RouteStyle } from "../../state/progress";

export type ZonePoint = { x: number; y: number };

export function isPlaceholder(p: ZonePoint): boolean {
  return p.x === 0 && p.y === 0;
}

export function isBonusOnly(stop: Stop): boolean {
  return stop.kinds.length > 0 && stop.kinds.every((k) => k === "bonus");
}

/** Route polyline in order, skipping (0,0) placeholders. */
export function orderedRoute(route: readonly ZonePoint[]): ZonePoint[] {
  return route.filter((p) => !isPlaceholder(p));
}

/** SVG path `d` following `section.route` order (straight segments). */
export function routePathD(route: readonly ZonePoint[]): string {
  const pts = orderedRoute(route);
  if (!pts.length) return "";
  return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/** Smooth cardinal spline through `section.route` (hidden waypoints still shape the curve). */
export function smoothRoutePath(route: readonly ZonePoint[], tension = 0.18): string {
  const pts = orderedRoute(route);
  if (pts.length < 3) return routePathD(route);
  const p0 = pts[0]!;
  let d = `M${p0.x.toFixed(2)},${p0.y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i]!;
    const b = pts[i]!;
    const c = pts[i + 1]!;
    const e = pts[i + 2] ?? c;
    const c1x = b.x + (c.x - a.x) * tension;
    const c1y = b.y + (c.y - a.y) * tension;
    const c2x = c.x - (e.x - b.x) * tension;
    const c2y = c.y - (e.y - b.y) * tension;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}`;
  }
  return d;
}

/** Numbered markers: section stops, minus placeholders and (in Speedrun) bonus-only givers. */
export function mapMarkers(section: Pick<Section, "stops">, routeStyle: RouteStyle): Stop[] {
  return section.stops.filter((s) => !isPlaceholder(s) && !(routeStyle === "speedrun" && isBonusOnly(s)));
}

/** TomTom `/way <zone> x y`. One decimal. Undefined for placeholder 0,0. */
export function stopWayCommand(zone: string, x: number, y: number): string | undefined {
  if (x === 0 && y === 0) return undefined;
  return `/way ${zone} ${x.toFixed(1)} ${y.toFixed(1)}`;
}

export function stopHoverLines(stop: Stop, stepLabels?: Readonly<Record<string, string>>): { title: string; lines: string[] } {
  if (stepLabels) {
    const lines = stop.steps.map((id) => stepLabels[id]).filter((t): t is string => Boolean(t));
    if (lines.length) return { title: stop.label, lines };
  }
  const n = stop.steps.length;
  return { title: stop.label, lines: [`${n} step${n === 1 ? "" : "s"}`] };
}

/** Visible (non-hidden, non-placeholder) gotos on the current step — heat overlay source. */
export function heatPointsFromStep(step: Step | undefined): ZonePoint[] {
  if (!step) return [];
  const out: ZonePoint[] = [];
  for (const a of step.actions) {
    if (a.type !== "goto" || a.hidden) continue;
    if (isPlaceholder(a.at)) continue;
    out.push({ x: a.at.x, y: a.at.y });
  }
  return out;
}

export function stopKindIcons(stop: Stop): ("fp" | "hearth")[] {
  const icons: ("fp" | "hearth")[] = [];
  if (stop.kinds.includes("fp")) icons.push("fp");
  if (stop.kinds.includes("hearth")) icons.push("hearth");
  return icons;
}

/** Mid-segment arrows along the route (skip tiny hops). */
export function routeArrows(route: readonly ZonePoint[], minLen = 3): { x: number; y: number; angle: number }[] {
  const pts = orderedRoute(route);
  const out: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < minLen) continue;
    if (out.length && i % 2 === 0 && len < minLen * 2) continue;
    out.push({ x: a.x + dx * 0.55, y: a.y + dy * 0.55, angle: (Math.atan2(dy, dx) * 180) / Math.PI });
  }
  return out;
}

export interface MapViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Zone % → 3:2 map user space: x' = x * 1.5, y' = y. Full view is `0 0 150 100`. */
export const MAP_SX = 1.5;
export const MAP_VIEW: MapViewBox = { x: 0, y: 0, w: 150, h: 100 };

const FULL: MapViewBox = { x: 0, y: 0, w: 100, h: 100 };

/** Convert a zone-percent point into the 3:2 SVG user space. */
export function toMapSpace(p: ZonePoint): ZonePoint {
  return { x: p.x * MAP_SX, y: p.y };
}

export interface StepLegPin {
  x: number;
  y: number;
  role: "a" | "b" | "via";
}

export interface StepLeg {
  /** Zone-% points in draw order, including hidden waypoints. */
  path: ZonePoint[];
  pins: StepLegPin[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sameRounded(a: ZonePoint, b: ZonePoint): boolean {
  return round2(a.x) === round2(b.x) && round2(a.y) === round2(b.y);
}

function collapseConsecutive(points: readonly ZonePoint[]): ZonePoint[] {
  const out: ZonePoint[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (prev && sameRounded(prev, p)) continue;
    out.push(p);
  }
  return out;
}

type GotoHit = { x: number; y: number; hidden: boolean };

function gotosOnMap(
  step: Step,
  mapId: number,
  lineVisible: (filter: Filter | undefined) => boolean,
): GotoHit[] {
  const out: GotoHit[] = [];
  for (const action of step.actions) {
    if (action.type !== "goto") continue;
    if (action.at.mapId !== mapId) continue;
    if (isPlaceholder(action.at)) continue;
    if (!lineVisible(action.filter)) continue;
    out.push({ x: action.at.x, y: action.at.y, hidden: action.hidden === true });
  }
  return out;
}

export function stepLeg(opts: {
  step: Step | undefined;
  /** Immediately previous visible step. Omit when it is not in the same zone section. */
  previous?: Step;
  /** Used only when `previous` is set and that step has no goto on this map. */
  previousStop?: ZonePoint;
  /** Used when `step` has no visible goto on this map. */
  stop?: ZonePoint;
  mapId: number;
  /** Default: every action is visible. */
  lineVisible?: (filter: Filter | undefined) => boolean;
}): StepLeg {
  const { step, previous, previousStop, stop, mapId } = opts;
  if (!step) return { path: [], pins: [] };
  const lineVisible = opts.lineVisible ?? (() => true);

  const current = gotosOnMap(step, mapId, lineVisible);
  const visible = current.filter((g) => !g.hidden);

  let depart: ZonePoint | undefined;
  if (previous) {
    const prevGotos = gotosOnMap(previous, mapId, lineVisible);
    const last = prevGotos[prevGotos.length - 1];
    if (last) depart = { x: last.x, y: last.y };
    else if (previousStop && !isPlaceholder(previousStop)) depart = { x: previousStop.x, y: previousStop.y };
  }

  let dest: ZonePoint | undefined;
  const body: ZonePoint[] = [];
  if (visible.length) {
    for (const g of current) body.push({ x: g.x, y: g.y });
    const b = visible[visible.length - 1]!;
    dest = { x: b.x, y: b.y };
  } else if (stop && !isPlaceholder(stop)) {
    for (const g of current) body.push({ x: g.x, y: g.y });
    dest = { x: stop.x, y: stop.y };
    body.push(dest);
  }

  if (!dest) {
    const hidden = current.map((g) => ({ x: g.x, y: g.y }));
    return { path: collapseConsecutive(depart ? [depart, ...hidden] : hidden), pins: [] };
  }

  const path = collapseConsecutive(depart ? [depart, ...body] : body);
  const pins: StepLegPin[] = [];
  if (depart && !sameRounded(depart, dest)) pins.push({ x: depart.x, y: depart.y, role: "a" });
  for (const via of visible.slice(0, -1)) {
    const p = { x: via.x, y: via.y };
    if (sameRounded(p, dest)) continue;
    if (depart && sameRounded(p, depart)) continue;
    pins.push({ ...p, role: "via" });
  }
  pins.push({ x: dest.x, y: dest.y, role: "b" });
  return { path, pins };
}

/** Fit a 1:1 zone-% viewBox to the route + stops, padded, min size so markers stay readable. */
export function fitView(points: readonly ZonePoint[], pad = 8, min = 22): MapViewBox {
  const pts = points.filter((p) => !isPlaceholder(p));
  if (!pts.length) return { ...FULL };
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  let w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  let h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  w = Math.max(w, min);
  h = Math.max(h, min);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

const MAP_MIN_W = 33;

/** Fit a 3:2 map-space viewBox around zone-% points. Returns `MAP_VIEW` when the hop fills the map. */
export function fitMapView(points: readonly ZonePoint[], pad = 8): MapViewBox {
  const pts = points.filter((p) => !isPlaceholder(p)).map(toMapSpace);
  if (!pts.length) return { ...MAP_VIEW };

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  let w = maxX - minX + pad * MAP_SX * 2;
  let h = maxY - minY + pad * 2;
  if (w / h > MAP_SX) h = w / MAP_SX;
  else w = h * MAP_SX;
  if (w < MAP_MIN_W) {
    w = MAP_MIN_W;
    h = w / MAP_SX;
  }
  if (w >= MAP_VIEW.w || h >= MAP_VIEW.h) return { ...MAP_VIEW };

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  let x = cx - w / 2;
  let y = cy - h / 2;

  const shiftedX = shiftInside(x, w, MAP_VIEW.w, minX, maxX);
  const shiftedY = shiftInside(y, h, MAP_VIEW.h, minY, maxY);
  return { x: shiftedX, y: shiftedY, w, h: w / MAP_SX };
}

/** Slide the box into 0..limit when the points stay inside; otherwise keep the original origin. */
function shiftInside(origin: number, size: number, limit: number, lo: number, hi: number): number {
  let next = origin;
  if (next < 0) next = 0;
  if (next + size > limit) next = limit - size;
  if (lo < next || hi > next + size) return origin;
  return next;
}

/** Map zone % through a 3:2 viewBox onto 0..100 of the map frame. */
export function framePct(p: ZonePoint, vb: MapViewBox): { left: number; top: number } {
  const x = p.x * MAP_SX;
  return { left: ((x - vb.x) / vb.w) * 100, top: ((p.y - vb.y) / vb.h) * 100 };
}

export function publicAsset(rel: string | undefined): string | undefined {
  if (!rel) return undefined;
  const base = (typeof import.meta.env?.BASE_URL === "string" && import.meta.env.BASE_URL) || "/";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${rel.replace(/^\//, "")}`;
}

/**
 * Rebuild a section polyline after filtering: every goto on `mapId` of the steps that are still
 * visible (route / dungeons / class / role), in step order. Hidden waypoints are kept (they shape
 * the path but get no pin); line-filtered gotos and (0,0) placeholders are dropped, and
 * consecutive duplicates (same 0.01 % cell) collapse into one point.
 */
export function visibleRoutePolyline(
  steps: readonly Step[],
  mapId: number,
  isVisible: (step: Step) => boolean,
  lineVisible: (filter: Filter | undefined) => boolean = () => true,
): ZonePoint[] {
  const out: ZonePoint[] = [];
  for (const step of steps) {
    if (!isVisible(step)) continue;
    for (const g of gotosOnMap(step, mapId, lineVisible)) {
      const p = { x: g.x, y: g.y };
      const last = out[out.length - 1];
      if (last && Math.round(last.x * 100) === Math.round(p.x * 100) && Math.round(last.y * 100) === Math.round(p.y * 100)) continue;
      out.push(p);
    }
  }
  return out;
}
