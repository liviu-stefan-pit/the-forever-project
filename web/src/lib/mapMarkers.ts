/**
 * Map markers for one step (DESIGN.md §4): quest-derived pins (`lib/pins.ts`: giver, turn-in,
 * objective) plus hand-placed `step.pins` (vendor, trainer, flight path, inn, object, mob camp).
 * Coordinates stay in zone % (0–100).
 */
import type { MarkerKind, NpcService, Profile, QuestInfo, Step } from "../data/schema";
import { stepPins, type DerivedPinKind, type StepPinFilter } from "./pins";
import type { StepStatusResult } from "../state/questProgress";

export interface MapMarker {
  kind: MarkerKind;
  x: number;
  y: number;
  label: string;
  /** Mob camp: hull in zone % … */
  polygon?: { x: number; y: number }[];
  /** … or a radius in zone % around (x, y). */
  radius?: number;
}

const DERIVED: Record<DerivedPinKind, MarkerKind> = {
  start: "questGiver",
  end: "turnIn",
  mob: "mobArea",
  object: "object",
  item: "object",
};

const SERVICE: Record<NpcService, MarkerKind> = {
  questGiver: "questGiver",
  turnIn: "turnIn",
  vendor: "vendor",
  trainer: "trainer",
  flightPath: "flightPath",
  innkeeper: "innkeeper",
};

export const MARKER_LABEL: Record<MarkerKind, string> = {
  questGiver: "Quest giver",
  turnIn: "Turn-in",
  mobArea: "Mob area",
  object: "Object",
  vendor: "Vendor",
  trainer: "Trainer",
  flightPath: "Flight path",
  innkeeper: "Innkeeper",
};

/** Default camp radius (zone %) for a derived mob objective with no hull. */
const MOB_RADIUS = 3;

export function stepMarkers(
  step: Step | undefined,
  quests: ReadonlyMap<number, QuestInfo> | undefined,
  mapId: number,
  opts?: { profile?: Profile; status?: StepStatusResult },
): MapMarker[] {
  if (!step) return [];
  const out: MapMarker[] = [];
  if (quests) {
    const byId: Record<number, QuestInfo> = {};
    for (const a of step.actions) {
      if ("questId" in a && typeof a.questId === "number") {
        const q = quests.get(a.questId);
        if (q) byId[q.id] = q;
      }
    }
    let filter: StepPinFilter | undefined;
    if (opts?.profile && opts.status?.status !== "done") {
      filter = { profile: opts.profile, missing: opts.status?.missing, catalog: quests };
    }
    for (const p of stepPins(step, byId, mapId, filter)) {
      const kind = DERIVED[p.kind];
      out.push({ kind, x: p.x, y: p.y, label: p.name, radius: kind === "mobArea" ? MOB_RADIUS : undefined });
    }
  }
  for (const p of step.pins ?? []) {
    if (p.kind === "npc") {
      if (p.at.mapId !== mapId) continue;
      out.push({ kind: p.service ? SERVICE[p.service] : "questGiver", x: p.at.x, y: p.at.y, label: p.name });
    } else if (p.kind === "object") {
      if (p.at.mapId !== mapId) continue;
      out.push({ kind: "object", x: p.at.x, y: p.at.y, label: p.name });
    } else {
      if (p.mapId !== mapId) continue;
      if (p.polygon && p.polygon.length >= 3) {
        const cx = p.polygon.reduce((s, q) => s + q.x, 0) / p.polygon.length;
        const cy = p.polygon.reduce((s, q) => s + q.y, 0) / p.polygon.length;
        out.push({ kind: "mobArea", x: cx, y: cy, label: p.name, polygon: p.polygon });
      } else if (p.center) {
        out.push({ kind: "mobArea", x: p.center.x, y: p.center.y, label: p.name, radius: p.radius ?? MOB_RADIUS });
      }
    }
  }
  return mergeMobCamps(out);
}

/** Many spawn points of one mob become one camp (hull radius), never a field of single pins. */
function mergeMobCamps(list: MapMarker[]): MapMarker[] {
  const camps = new Map<string, MapMarker[]>();
  const rest: MapMarker[] = [];
  for (const m of list) {
    if (m.kind === "mobArea" && !m.polygon) {
      const g = camps.get(m.label) ?? [];
      g.push(m);
      camps.set(m.label, g);
    } else rest.push(m);
  }
  for (const [label, pts] of camps) {
    if (pts.length === 1) {
      rest.push(pts[0]!);
      continue;
    }
    const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length;
    const cy = pts.reduce((s, q) => s + q.y, 0) / pts.length;
    const r = Math.max(MOB_RADIUS, ...pts.map((q) => Math.hypot(q.x - cx, q.y - cy) + 1.5));
    rest.push({ kind: "mobArea", x: cx, y: cy, label, radius: Math.min(r, 25) });
  }
  return rest;
}

/** Kinds present, in legend order. */
export function legendKinds(markers: readonly MapMarker[]): MarkerKind[] {
  const order: MarkerKind[] = ["questGiver", "turnIn", "mobArea", "object", "vendor", "trainer", "flightPath", "innkeeper"];
  const have = new Set(markers.map((m) => m.kind));
  return order.filter((k) => have.has(k));
}
