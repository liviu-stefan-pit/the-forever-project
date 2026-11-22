/**
 * Step / line visibility — the **filter-evaluation interface P7 implements**.
 *
 * Components never evaluate `Filter`s themselves; they ask the `VisibilityEvaluator` in
 * context:
 * - `step(step)`   → is the whole step shown? If not, why (`filter` = race/class `<<`,
 *                    `speedrun` = bonus step in Speedrun mode, `optional` = profile hides `#optional`).
 *                    Hidden steps render as a collapsed "N hidden steps · show" row.
 * - `line(filter)` → is a line-level `<< …` text line / action shown for this character?
 *
 * P6 default (`createDefaultEvaluator`): every filter matches (no character yet), only
 * Speedrun mode hides bonus steps. P7 provides its own evaluator through `VisibilityContext`
 * (e.g. `<VisibilityContext.Provider value={profileEvaluator}>`) built from the active
 * profile's race/class/options — `matchesFilter(filter, {race, cls})` is the piece to write.
 */
import { createContext, createElement, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { ClassKey, Filter, RaceKey, Role, RouteStyle as SchemaRouteStyle, Step } from "../data/schema";
import { EngineContext, useRouteStyle, type RouteStyle } from "./progress";
import type { StepStatus } from "./questProgress";

/**
 * `speedrun` = not on the speedrun route (bonus / balanced-only), `route` = speedrun-only step in
 * Balanced, `dungeons` = dungeon toggle, `role` = not for the selected role.
 */
export type HiddenReason = "filter" | "speedrun" | "route" | "dungeons" | "role" | "optional" | "done" | "not_applicable";

export interface FilterChar {
  race?: RaceKey;
  cls?: ClassKey;
}

export interface StepVisibility {
  visible: boolean;
  reason?: HiddenReason;
}

export interface VisibilityEvaluator {
  step(step: Step): StepVisibility;
  line(filter: Filter | undefined): boolean;
  /** Changes whenever the result of `step`/`line` may change (memo dependency). */
  readonly key: string;
  /**
   * Like `key`, but omits `revision` unless hide-done is on (when ticks change the
   * list shape). Use this to reset progressive mounting / "show hidden" reveals.
   */
  readonly layoutKey: string;
}

function sameRace(a?: string, b?: string): boolean {
  if (!a || !b) return a === b;
  if (a === b) return true;
  return (a === "Undead" && b === "Scourge") || (a === "Scourge" && b === "Undead");
}

function termMatches(term: Filter["any"][number][number], char: FilterChar): boolean {
  const raceOk = term.race === undefined || sameRace(term.race, char.race);
  const clsOk = term.cls === undefined || term.cls === char.cls;
  const pos = raceOk && clsOk;
  return term.not ? !pos : pos;
}

/** `Filter` is OR of AND-groups. No filter (or empty `any`) matches everyone. */
export function matchesFilter(filter: Filter | undefined, char?: FilterChar | null): boolean {
  if (!filter || filter.any.length === 0) return true;
  if (!char?.race && !char?.cls) return true;
  return filter.any.some((group) => group.every((t) => termMatches(t, char)));
}

/** Routes a step belongs to: explicit `routes`, else bonus → balanced only, else both. */
export function stepRoutes(step: Step): SchemaRouteStyle[] {
  if (step.routes && step.routes.length) return step.routes;
  return step.bonus ? ["balanced"] : ["balanced", "speedrun"];
}

/** `on` = dungeon content, `off` = open-world alternative, `any` = always. */
export function dungeonMode(step: Step): "on" | "off" | "any" {
  if (step.dungeon) return "on";
  if (step.dungeonsOff) return "off";
  const c = step.conditions.find((x) => x.cmd === "dungeon");
  if (!c) return "any";
  return /^\s*!/.test(c.args) ? "off" : "on";
}

/**
 * Dungeon toggle (`Profile.options.dungeons`). Dungeon steps (`dungeon`, positive `.dungeon X`)
 * show only with dungeons on; alternatives (`dungeonsOff`, `.dungeon !X`) only with dungeons off.
 * Default `dungeons = false` keeps the old behaviour for dungeon steps.
 */
export function isDungeonHidden(step: Step, dungeons = false): boolean {
  const mode = dungeonMode(step);
  return (mode === "on" && !dungeons) || (mode === "off" && dungeons);
}

/**
 * When dungeons are on, hide a step whose `dungeonsOffRoutes` lists the active route style.
 * When dungeons are off, `dungeonsOffRoutes` does nothing. `tags.dungeonPart` never hides a step.
 */
export function isDungeonsOffRouteHidden(step: Step, route: SchemaRouteStyle, dungeons = false): boolean {
  return dungeons && !!step.dungeonsOffRoutes?.includes(route);
}

function routeReason(step: Step, route: SchemaRouteStyle): StepVisibility | null {
  if (stepRoutes(step).includes(route)) return null;
  return { visible: false, reason: route === "speedrun" ? "speedrun" : "route" };
}

/** The pure rule used by P6. P7 extends it with `matchesFilter` and `options.showOptional`. */
export function defaultStepVisibility(step: Step, ctx: { routeStyle: RouteStyle; dungeons?: boolean }): StepVisibility {
  const dungeons = !!ctx.dungeons;
  if (isDungeonHidden(step, dungeons) || isDungeonsOffRouteHidden(step, ctx.routeStyle, dungeons)) {
    return { visible: false, reason: "dungeons" };
  }
  return routeReason(step, ctx.routeStyle) ?? { visible: true };
}

export interface ProfileEvalCtx {
  race?: RaceKey;
  cls?: ClassKey;
  routeStyle: RouteStyle;
  role?: Role;
  /** Dungeon toggle; missing = off. */
  dungeons?: boolean;
  showOptional?: boolean;
  hideDone?: boolean;
  isDone?: (stepId: string) => boolean;
  /** When hide-done is on, not_applicable steps hide with the done steps. isDone stays false for them. */
  stepStatus?: (step: Step) => { status: StepStatus } | StepStatus;
  /** Included in `key` so hide-done results refresh when ticks change. */
  revision?: number;
}

export function createProfileEvaluator(ctx: ProfileEvalCtx): VisibilityEvaluator {
  return {
    step(step) {
      const showOptional = ctx.showOptional !== false;
      const hideDone = !!ctx.hideDone;
      const dungeons = !!ctx.dungeons;
      const char: FilterChar = { race: ctx.race, cls: ctx.cls };
      const hasChar = !!(ctx.race || ctx.cls);
      if (isDungeonHidden(step, dungeons) || isDungeonsOffRouteHidden(step, ctx.routeStyle, dungeons)) {
        return { visible: false, reason: "dungeons" };
      }
      if (hasChar && !matchesFilter(step.filter, char)) return { visible: false, reason: "filter" };
      if (ctx.cls && step.classes && step.classes.length && !step.classes.includes(ctx.cls)) {
        return { visible: false, reason: "filter" };
      }
      if (ctx.role && step.roles && step.roles.length && !step.roles.includes(ctx.role)) {
        return { visible: false, reason: "role" };
      }
      if (!showOptional && step.tags.optional) return { visible: false, reason: "optional" };
      const r = routeReason(step, ctx.routeStyle);
      if (r) return r;
      if (hideDone) {
        if (ctx.isDone?.(step.id)) return { visible: false, reason: "done" };
        const reported = ctx.stepStatus?.(step);
        const status = typeof reported === "string" ? reported : reported?.status;
        if (status === "not_applicable") return { visible: false, reason: "not_applicable" };
      }
      return { visible: true };
    },
    line(filter) {
      return matchesFilter(filter, { race: ctx.race, cls: ctx.cls });
    },
    get key() {
      const showOptional = ctx.showOptional !== false;
      const hideDone = !!ctx.hideDone;
      const dungeons = !!ctx.dungeons;
      return [
        ctx.race ?? "",
        ctx.cls ?? "",
        ctx.routeStyle,
        ctx.role ?? "",
        dungeons ? "dng" : "nodng",
        showOptional ? "opt" : "noopt",
        hideDone ? "hidedone" : "showdone",
        String(ctx.revision ?? 0),
      ].join(":");
    },
    get layoutKey() {
      const showOptional = ctx.showOptional !== false;
      const hideDone = !!ctx.hideDone;
      const dungeons = !!ctx.dungeons;
      return [
        ctx.race ?? "",
        ctx.cls ?? "",
        ctx.routeStyle,
        ctx.role ?? "",
        dungeons ? "dng" : "nodng",
        showOptional ? "opt" : "noopt",
        hideDone ? "hidedone" : "showdone",
        ...(hideDone ? [String(ctx.revision ?? 0)] : []),
      ].join(":");
    },
  };
}

/**
 * Guest evaluator: the SAME rules as a profile, with guest defaults (no race/class/role,
 * dungeons off unless passed, optional steps shown). Guest and profiles never diverge.
 */
export function createDefaultEvaluator(routeStyle: RouteStyle, opts: { dungeons?: boolean } = {}): VisibilityEvaluator {
  const inner = createProfileEvaluator({ routeStyle, dungeons: opts.dungeons });
  return { ...inner, key: `default:${inner.key}`, layoutKey: `default:${inner.layoutKey}` };
}

/** Optional override; when absent, `useVisibility()` derives the default from the progress store. */
export const VisibilityContext = createContext<VisibilityEvaluator | null>(null);

export function useVisibility(): VisibilityEvaluator {
  const override = useContext(VisibilityContext);
  const routeStyle = useRouteStyle();
  const fallback = useMemo(() => createDefaultEvaluator(routeStyle), [routeStyle]);
  return override ?? fallback;
}

const noopSubscribe = () => () => {};

/** Re-renders when the list shape changes (route / dungeons / hide-done ticks), not on an unrelated toggle. */
export function useVisibilityLayoutKey(): string {
  const vis = useVisibility();
  const engine = useContext(EngineContext);
  return useSyncExternalStore(engine?.subscribe ?? noopSubscribe, () => vis.layoutKey, () => vis.layoutKey);
}

/** Visibility of one step (the hook named in the P6 brief). */
export function useStepVisibility(step: Step): StepVisibility {
  return useVisibility().step(step);
}

/** Convenience provider for tests / P7 wiring. */
export function VisibilityProvider({ value, children }: { value: VisibilityEvaluator; children: ReactNode }) {
  return createElement(VisibilityContext.Provider, { value }, children);
}

export const HIDDEN_REASON_TEXT: Record<HiddenReason, string> = {
  filter: "not for your character",
  speedrun: "bonus · hidden in Speedrun mode",
  route: "speedrun-only step",
  dungeons: "dungeon toggle",
  role: "not for your role",
  optional: "optional",
  done: "already done",
  not_applicable: "not applicable",
};
