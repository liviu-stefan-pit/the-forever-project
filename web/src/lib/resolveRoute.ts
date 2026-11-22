/**
 * Route resolver (route schema v2, docs/ROUTE_SCHEMA.md).
 *
 * `resolveRoute(steps, opts)` returns the steps a character sees for one route, with every
 * per-step list (tips, profession hooks, elite tactics) narrowed to that character. It uses the
 * same rules as the visibility evaluator (`state/visibility.ts`), so the guide reader, the map and
 * the resolver can never disagree.
 */
import type {
  ClassKey,
  EliteTactic,
  ProfessionHook,
  Role,
  RouteOptions,
  RouteStyle,
  Step,
  Tip,
} from "../data/schema";
import { createProfileEvaluator, type HiddenReason } from "../state/visibility";

export type ResolveOptions = Omit<RouteOptions, "cls"> & {
  /** `class` is accepted as an alias of `cls`. */
  class?: ClassKey;
  cls?: ClassKey;
  showOptional?: boolean;
};

export interface ResolvedStep extends Step {
  /** 1-based position in the resolved route. */
  routeIndex: number;
  /** True when the step or any kept tip/hook/tactic is not verified. */
  unverified: boolean;
}

export interface ResolveResult {
  steps: ResolvedStep[];
  /** Why each dropped step was hidden (by step id). */
  hidden: Record<string, HiddenReason>;
}

/** Does a tip apply to this character/route/dungeon setting? Missing filters match everyone. */
export function tipApplies(
  tip: Pick<Tip, "roles" | "classes" | "routes" | "dungeons">,
  o: { route: RouteStyle; dungeons: boolean; cls?: ClassKey; role?: Role },
): boolean {
  if (tip.routes?.length && !tip.routes.includes(o.route)) return false;
  if (tip.dungeons !== undefined && tip.dungeons !== o.dungeons) return false;
  if (o.cls && tip.classes?.length && !tip.classes.includes(o.cls)) return false;
  if (o.role && tip.roles?.length && !tip.roles.includes(o.role)) return false;
  return true;
}

export function hookApplies(hook: ProfessionHook, professions: RouteOptions["professions"]): boolean {
  return professions === undefined || professions.includes(hook.profession);
}

function resolveOne(step: Step, o: ResolveOptions & { cls?: ClassKey }): Omit<ResolvedStep, "routeIndex"> {
  const ctx = { route: o.route, dungeons: o.dungeons, cls: o.cls, role: o.role };
  const out: Step = { ...step };
  let unverified = step.verified === false || (step.sources !== undefined && step.verified !== true);
  if (step.tips) {
    out.tips = step.tips.filter((t) => tipApplies(t, ctx));
    // Role advice is our own wording with no data claim, so it never marks a step as unverified.
    unverified ||= out.tips.some((t) => t.kind !== "advice" && !t.verified);
  }
  if (step.professionHooks) {
    out.professionHooks = step.professionHooks.filter((h) => hookApplies(h, o.professions));
    unverified ||= out.professionHooks.some((h) => !h.verified);
  }
  if (step.elite) {
    out.elite = step.elite.map((e): EliteTactic => ({ ...e, tips: e.tips.filter((t) => tipApplies(t, ctx)) }));
    unverified ||= out.elite.some((e) => !e.verified || e.tips.some((t) => !t.verified));
  }
  if (step.pins) unverified ||= step.pins.some((p) => !p.verified);
  return { ...out, unverified };
}

/**
 * Resolve the visible route for one character.
 *
 * Step rules (in order): dungeon toggle → race/class `filter` and `classes` → `roles` →
 * optional (only when `showOptional === false`) → route membership (`routes`, bonus = balanced).
 */
export function resolveRoute(steps: readonly Step[], opts: ResolveOptions): ResolveResult {
  const cls = opts.cls ?? opts.class;
  const vis = createProfileEvaluator({
    race: opts.race,
    cls,
    role: opts.role,
    routeStyle: opts.route,
    dungeons: opts.dungeons,
    showOptional: opts.showOptional,
  });
  const result: ResolvedStep[] = [];
  const hidden: Record<string, HiddenReason> = {};
  for (const step of steps) {
    const v = vis.step(step);
    if (!v.visible) {
      hidden[step.id] = v.reason ?? "filter";
      continue;
    }
    result.push({ ...resolveOne(step, { ...opts, cls }), routeIndex: result.length + 1 });
  }
  return { steps: result, hidden };
}
