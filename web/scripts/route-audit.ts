/**
 * Heuristic route-structure report over research route-v2 packs (same discovery as build-data).
 *
 *   npm run audit:route
 *
 * Writes one JSON file per pack plus summary.json under web/tmp/route-audit/.
 * Always exits 0 unless the script throws. Findings are a report, not a gate.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Action, RoutePack, RouteStyle, Step } from "../../contracts/schema.ts";
import { discoverPacks as discoverRoutePacks } from "./routeSource.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = join(ROOT, "web/tmp/route-audit");
const ROUTES: readonly RouteStyle[] = ["balanced", "speedrun"];
const QUEST_ACTIONS = new Set(["accept", "complete", "turnin", "collect"]);
const HUB_YARDS = 1.5;
const DETOUR_YARDS = 8;
/** Single step or a short run between leaving A and coming back. */
const MAX_DETOUR_STEPS = 4;

interface Hub {
  mapId: number;
  zone: string;
  x: number;
  y: number;
}

interface FindingCounts {
  duplicateActions: number;
  unmergedSameNpc: number;
  turninThenAcceptSameNpc: number;
  backtracking: number;
  emptySteps: number;
  genericComplete: number;
}

export interface DuplicateAction {
  questId: number;
  action: "accept" | "complete" | "turnin" | "collect";
  count: number;
  stepIds: string[];
}

export interface UnmergedHub {
  kind: "accept" | "turnin";
  stepIds: string[];
  coords: { stepId: string; zone: string; mapId: number; x: number; y: number }[];
}

export interface TurninThenAccept {
  turninStepId: string;
  acceptStepId: string;
  distance: number;
  zone: string;
  turnin: { x: number; y: number };
  accept: { x: number; y: number };
}

export interface Backtrack {
  heuristic: true;
  anchorStepId: string;
  returnStepId: string;
  detourStepIds: string[];
  zone: string;
  anchor: { x: number; y: number };
  returnAt: { x: number; y: number };
  detour: { stepId: string; x: number; y: number; distanceFromAnchor: number }[];
}

export interface GenericComplete {
  stepId: string;
  text: string;
  questIds: number[];
}

export interface RouteFindings {
  duplicateActions: DuplicateAction[];
  unmergedSameNpc: UnmergedHub[];
  turninThenAcceptSameNpc: TurninThenAccept[];
  backtracking: Backtrack[];
  emptySteps: string[];
  genericComplete: GenericComplete[];
}

/** Every route-v2 pack under `dir` (single files and segment folders; same discovery as build-data). */
export function discoverPacks(dir: string): { path: string; pack: RoutePack }[] {
  return discoverRoutePacks(dir) as unknown as { path: string; pack: RoutePack }[];
}

/** No `routes`, or an empty list, means both. An explicit list is used as written. */
export function routesOf(step: Step): RouteStyle[] {
  if (!step.routes || step.routes.length === 0) return ["balanced", "speedrun"];
  return step.routes.filter((r): r is RouteStyle => r === "balanced" || r === "speedrun");
}

export function stepPlainText(step: Step): string {
  return step.text
    .map((line) => line.segments.map((s) => s.t).join(""))
    .join("\n")
    .trim();
}

function hubOf(step: Step): Hub | null {
  for (const a of step.actions) {
    if (a.type !== "goto") continue;
    if (a.at && Number.isFinite(a.at.x) && Number.isFinite(a.at.y)) {
      return { mapId: a.at.mapId, zone: a.at.zone ?? "", x: a.at.x, y: a.at.y };
    }
    if (a.raw && a.raw.zone && Number.isFinite(a.raw.a) && Number.isFinite(a.raw.b)) {
      return { mapId: 0, zone: a.raw.zone, x: a.raw.a, y: a.raw.b };
    }
  }
  return null;
}

function sameMap(a: Hub, b: Hub): boolean {
  if (a.zone && b.zone) return a.zone === b.zone;
  return a.mapId !== 0 && a.mapId === b.mapId;
}

/** Zone-percent distance, or null when the points are not on the same zone map. */
function zoneDistance(a: Hub, b: Hub): number | null {
  if (!sameMap(a, b)) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type QuestAction = Extract<Action, { type: "accept" | "complete" | "turnin" | "collect" }> & { questId: number };

function questActions(step: Step): QuestAction[] {
  return step.actions.filter((a): a is QuestAction => QUEST_ACTIONS.has(a.type) && "questId" in a && typeof a.questId === "number");
}

function hasKind(step: Step, kind: "accept" | "turnin"): boolean {
  return step.actions.some((a) => a.type === kind);
}

function emptyCounts(): FindingCounts {
  return {
    duplicateActions: 0,
    unmergedSameNpc: 0,
    turninThenAcceptSameNpc: 0,
    backtracking: 0,
    emptySteps: 0,
    genericComplete: 0,
  };
}

function countsOf(f: RouteFindings): FindingCounts {
  return {
    duplicateActions: f.duplicateActions.length,
    unmergedSameNpc: f.unmergedSameNpc.length,
    turninThenAcceptSameNpc: f.turninThenAcceptSameNpc.length,
    backtracking: f.backtracking.length,
    emptySteps: f.emptySteps.length,
    genericComplete: f.genericComplete.length,
  };
}

function addCounts(a: FindingCounts, b: FindingCounts): FindingCounts {
  return {
    duplicateActions: a.duplicateActions + b.duplicateActions,
    unmergedSameNpc: a.unmergedSameNpc + b.unmergedSameNpc,
    turninThenAcceptSameNpc: a.turninThenAcceptSameNpc + b.turninThenAcceptSameNpc,
    backtracking: a.backtracking + b.backtracking,
    emptySteps: a.emptySteps + b.emptySteps,
    genericComplete: a.genericComplete + b.genericComplete,
  };
}

function duplicateActions(steps: readonly Step[]): DuplicateAction[] {
  const hits = new Map<string, { questId: number; action: DuplicateAction["action"]; stepIds: string[] }>();
  for (const step of steps) {
    const seenOnStep = new Set<string>();
    for (const a of questActions(step)) {
      if (a.type !== "accept" && a.type !== "complete" && a.type !== "turnin" && a.type !== "collect") continue;
      const key = `${a.type}:${a.questId}`;
      if (seenOnStep.has(key)) {
        const row = hits.get(key)!;
        row.stepIds.push(step.id);
      } else {
        seenOnStep.add(key);
        const row = hits.get(key) ?? { questId: a.questId, action: a.type, stepIds: [] };
        row.stepIds.push(step.id);
        hits.set(key, row);
      }
    }
  }
  return [...hits.values()]
    .filter((row) => row.stepIds.length > 1)
    .map((row) => ({ ...row, count: row.stepIds.length }))
    .sort((a, b) => a.questId - b.questId || a.action.localeCompare(b.action));
}

function unmerged(steps: readonly Step[], kind: "accept" | "turnin"): UnmergedHub[] {
  const groups: UnmergedHub[] = [];
  let current: { step: Step; hub: Hub }[] = [];

  const flush = () => {
    if (current.length >= 2) {
      groups.push({
        kind,
        stepIds: current.map((c) => c.step.id),
        coords: current.map((c) => ({
          stepId: c.step.id,
          zone: c.hub.zone,
          mapId: c.hub.mapId,
          x: c.hub.x,
          y: c.hub.y,
        })),
      });
    }
    current = [];
  };

  for (const step of steps) {
    const hub = hasKind(step, kind) ? hubOf(step) : null;
    if (!hub) {
      flush();
      continue;
    }
    if (current.length === 0) {
      current = [{ step, hub }];
      continue;
    }
    const anchor = current[0]!.hub;
    const prev = current[current.length - 1]!.hub;
    const fromAnchor = zoneDistance(anchor, hub);
    const fromPrev = zoneDistance(prev, hub);
    if (fromAnchor !== null && fromAnchor <= HUB_YARDS && fromPrev !== null && fromPrev <= HUB_YARDS) {
      current.push({ step, hub });
    } else {
      flush();
      current = [{ step, hub }];
    }
  }
  flush();
  return groups;
}

function turninThenAccept(steps: readonly Step[]): TurninThenAccept[] {
  const out: TurninThenAccept[] = [];
  for (let i = 0; i < steps.length - 1; i++) {
    const turnin = steps[i]!;
    const accept = steps[i + 1]!;
    if (!hasKind(turnin, "turnin") || !hasKind(accept, "accept")) continue;
    const a = hubOf(turnin);
    const b = hubOf(accept);
    if (!a || !b) continue;
    const distance = zoneDistance(a, b);
    if (distance === null || distance > HUB_YARDS) continue;
    out.push({
      turninStepId: turnin.id,
      acceptStepId: accept.id,
      distance: Math.round(distance * 100) / 100,
      zone: a.zone || b.zone,
      turnin: { x: a.x, y: a.y },
      accept: { x: b.x, y: b.y },
    });
  }
  return out;
}

function backtracking(steps: readonly Step[]): Backtrack[] {
  const out: Backtrack[] = [];
  const hubs = steps.map((step) => hubOf(step));
  for (let i = 0; i < steps.length; i++) {
    const anchor = hubs[i];
    if (!anchor) continue;
    const last = Math.min(steps.length - 1, i + 1 + MAX_DETOUR_STEPS);
    for (let j = i + 2; j <= last; j++) {
      const back = hubs[j];
      if (!back) continue;
      const returnDist = zoneDistance(anchor, back);
      if (returnDist === null || returnDist > HUB_YARDS) continue;
      const detour: Backtrack["detour"] = [];
      let ok = true;
      for (let k = i + 1; k < j; k++) {
        const mid = hubs[k];
        if (!mid) {
          ok = false;
          break;
        }
        const away = zoneDistance(anchor, mid);
        if (away === null || away <= DETOUR_YARDS) {
          ok = false;
          break;
        }
        detour.push({
          stepId: steps[k]!.id,
          x: mid.x,
          y: mid.y,
          distanceFromAnchor: Math.round(away * 100) / 100,
        });
      }
      if (!ok || detour.length === 0) continue;
      out.push({
        heuristic: true,
        anchorStepId: steps[i]!.id,
        returnStepId: steps[j]!.id,
        detourStepIds: detour.map((d) => d.stepId),
        zone: anchor.zone || back.zone,
        anchor: { x: anchor.x, y: anchor.y },
        returnAt: { x: back.x, y: back.y },
        detour,
      });
      break;
    }
  }
  return out;
}

/** Text is only a "Complete {quest title}" line: no counts and nothing left once the title is removed. */
export function isGenericCompleteText(text: string, labels: readonly string[]): boolean {
  const trimmed = text.trim();
  if (!trimmed || /\d/.test(trimmed)) return false;
  if (!/^(complete|finish|do)\b/i.test(trimmed)) return false;
  let rest = trimmed.replace(/^(complete|finish|do)(\s+the\s+quest)?\s*/i, "");
  const names = [...labels].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const label of names) {
    rest = rest.split(label).join(" ");
  }
  rest = rest.replace(/quest/gi, " ");
  rest = rest.replace(/[^a-z0-9]+/gi, "");
  return rest.length === 0;
}

function genericComplete(steps: readonly Step[]): GenericComplete[] {
  const out: GenericComplete[] = [];
  for (const step of steps) {
    const quests = questActions(step);
    if (quests.length === 0) continue;
    if (quests.some((a) => a.type === "accept" || a.type === "turnin")) continue;
    if (!quests.every((a) => a.type === "complete" || a.type === "collect")) continue;
    const labels = quests.map((a) => a.label).filter(Boolean);
    const text = stepPlainText(step);
    if (!isGenericCompleteText(text, labels)) continue;
    const questIds = [...new Set(quests.map((a) => a.questId))];
    out.push({ stepId: step.id, text, questIds });
  }
  return out;
}

function emptySteps(steps: readonly Step[]): string[] {
  return steps.filter((step) => step.actions.length === 0 && stepPlainText(step).length === 0).map((step) => step.id);
}

export function auditRoute(steps: readonly Step[]): RouteFindings {
  return {
    duplicateActions: duplicateActions(steps),
    unmergedSameNpc: [...unmerged(steps, "accept"), ...unmerged(steps, "turnin")],
    turninThenAcceptSameNpc: turninThenAccept(steps),
    backtracking: backtracking(steps),
    emptySteps: emptySteps(steps),
    genericComplete: genericComplete(steps),
  };
}

function pad(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : value + " ".repeat(width - value.length);
}

function fileSlug(pack: RoutePack, path: string): string {
  const id = pack.id?.trim() || basename(path, ".json");
  return id.replace(/[^a-z0-9._-]+/gi, "-");
}

export function runAudit(researchDir = join(ROOT, "research"), outDir = OUT_DIR): FindingCounts {
  const packs = discoverPacks(researchDir);
  mkdirSync(outDir, { recursive: true });
  const rows: { pack: string; path: string; counts: FindingCounts; byRoute: Record<RouteStyle, FindingCounts> }[] = [];
  let total = emptyCounts();

  for (const { path, pack } of packs) {
    const byRoute = {} as Record<RouteStyle, RouteFindings>;
    const byCounts = {} as Record<RouteStyle, FindingCounts>;
    let packTotal = emptyCounts();
    for (const route of ROUTES) {
      const steps = pack.steps.filter((step) => routesOf(step).includes(route));
      const findings = auditRoute(steps);
      byRoute[route] = findings;
      byCounts[route] = countsOf(findings);
      packTotal = addCounts(packTotal, byCounts[route]);
    }
    const id = pack.id ?? basename(path, ".json");
    const report = {
      pack: id,
      path: relative(ROOT, path).replace(/\\/g, "/"),
      routes: byRoute,
      counts: { ...byCounts, total: packTotal },
    };
    writeFileSync(join(outDir, `${fileSlug(pack, path)}.json`), JSON.stringify(report, null, 2));
    rows.push({ pack: id, path: report.path, counts: packTotal, byRoute: byCounts });
    total = addCounts(total, packTotal);
  }

  writeFileSync(
    join(outDir, "summary.json"),
    JSON.stringify({ packs: rows, total, generatedFrom: relative(ROOT, researchDir).replace(/\\/g, "/") }, null, 2),
  );

  const header = [pad("pack", 28), pad("dup", 6), pad("unmerged", 9), pad("tia", 6), pad("back", 6), pad("empty", 6), "generic"].join("  ");
  const lines = rows.map((r) =>
    [
      pad(r.pack, 28),
      pad(String(r.counts.duplicateActions), 6),
      pad(String(r.counts.unmergedSameNpc), 9),
      pad(String(r.counts.turninThenAcceptSameNpc), 6),
      pad(String(r.counts.backtracking), 6),
      pad(String(r.counts.emptySteps), 6),
      String(r.counts.genericComplete),
    ].join("  "),
  );
  const footer = [
    pad("TOTAL", 28),
    pad(String(total.duplicateActions), 6),
    pad(String(total.unmergedSameNpc), 9),
    pad(String(total.turninThenAcceptSameNpc), 6),
    pad(String(total.backtracking), 6),
    pad(String(total.emptySteps), 6),
    String(total.genericComplete),
  ].join("  ");
  console.log(`route audit: ${packs.length} pack(s) → ${relative(ROOT, outDir).replace(/\\/g, "/")}`);
  console.log([header, ...lines, footer].join("\n"));
  return total;
}

const invoked = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (invoked) {
  runAudit();
  process.exit(0);
}
