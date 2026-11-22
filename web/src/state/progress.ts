/**
 * Progress store — the **interface P7 implements** with persisted profiles.
 *
 * P6 ships an in-memory implementation (`InMemoryProgressProvider`). P7 replaces the
 * provider (same `ProgressContext`, same `ProgressStore` shape) with one backed by the
 * active `Profile` in localStorage; no component needs to change.
 *
 * Contract:
 * - `isDone(id)`            — step is ticked (P7: `profile.steps[id].done`, or implied by `profile.quests`).
 * - `toggle(id, step?)`     — flip a step. `step` is passed so P7 can propagate quest state
 *                             (turnin ⇒ quest done ⇒ every step referencing it done).
 * - `setDone(ids, done)`    — bulk set, e.g. "mark everything up to here".
 * - `countDone(slug)`       — ticked steps that belong to one guide (its step ids, not a shared id prefix).
 * - `current` / `setCurrent`— the reading cursor (resume point). Exactly one per profile.
 * - `routeStyle`            — "balanced" shows P5 bonus steps, "speedrun" hides them (plan D2).
 * - `revision`              — increments on every mutation; use it as a memo dependency.
 */
import {
  createContext,
  createElement,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { RouteStyle, Step } from "../data/schema";
import { stepBelongsToGuide } from "./questProgress";
import type { QuestLookup } from "./questAvailability";
import type { StepStatusResult } from "./questProgress";
import type { ProfileEngine } from "./profileStore";
import { retainCompletion, type GuideCompletion } from "./progressSelectors";
import type { Requirement } from "./stepRequirement";

export type { RouteStyle };

export interface ProgressCursor {
  guide: string;
  step: string;
}

export interface ProgressStore {
  readonly revision: number;
  /** Optional `quests` catalog enables prereq / exclusive-aware done detection. */
  isDone(stepId: string, quests?: QuestLookup): boolean;
  /** Guide-facing status; InMemory falls back to done/open from the tick set. */
  stepStatus(step: Step, quests?: QuestLookup): StepStatusResult;
  /** Display requirement. not_applicable does not write the quest done. */
  requirement(step: Step, quests?: QuestLookup): Requirement;
  toggle(stepId: string, step?: Step, quests?: QuestLookup): void;
  setDone(stepIds: readonly string[], done: boolean): void;
  /**
   * Ticked steps of one guide. Pass that guide's step ids when ids do not start with `slug:`
   * (sub-packs share prefixes such as `horde-20-40:`). Without the list, membership is `slug:`.
   */
  countDone(guideSlug: string, quests?: QuestLookup, guideStepIds?: readonly string[]): number;
  readonly current: ProgressCursor | undefined;
  setCurrent(cursor: ProgressCursor): void;
  readonly routeStyle: RouteStyle;
  setRouteStyle(style: RouteStyle): void;
}

export const ProgressContext = createContext<ProgressStore | null>(null);

/** Stable engine ref from `ProfileProgressProvider`. Null under `InMemoryProgressProvider`. */
export const EngineContext = createContext<ProfileEngine | null>(null);

const noopSubscribe = () => () => {};

function useStore<T>(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => T): T {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useEngine(): ProfileEngine | null {
  return useContext(EngineContext);
}

export function useProgress(): ProgressStore {
  const store = useContext(ProgressContext);
  if (!store) throw new Error("useProgress() needs a progress provider (ProgressContext)");
  const engine = useContext(EngineContext);
  useStore(engine?.subscribe ?? noopSubscribe, () => engine?.revision() ?? store.revision);
  return store;
}

/** Mutations without subscribing to every progress revision. */
export function useProgressActions(): ProgressStore {
  const store = useContext(ProgressContext);
  if (!store) throw new Error("useProgress() needs a progress provider (ProgressContext)");
  return store;
}

export function useStepDone(id: string): boolean {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => (engine ? engine.selectDone(id) : (store?.isDone(id) ?? false)));
}

const OPEN_STATUS: StepStatusResult = { status: "open" };
const REQUIRED: Requirement = { kind: "required" };

export function useStepStatus(id: string): StepStatusResult {
  const engine = useContext(EngineContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => (engine ? engine.selectStatus(id) : OPEN_STATUS));
}

export function useStepRequirement(id: string): Requirement {
  const engine = useContext(EngineContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => (engine ? engine.selectRequirement(id) : REQUIRED));
}

export function useIsCurrent(id: string): boolean {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () =>
    engine ? engine.selectCurrentStepId() === id : store?.current?.step === id,
  );
}

export function useCurrentStepId(guideSlug?: string): string | undefined {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => {
    if (engine) {
      const cur = engine.selectCurrentCursor();
      if (guideSlug && cur?.guide !== guideSlug) return undefined;
      return cur?.step;
    }
    if (guideSlug && store?.current?.guide !== guideSlug) return undefined;
    return store?.current?.step;
  });
}

export function useCurrentGuideSlug(): string | undefined {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => engine?.selectCurrentGuide() ?? store?.current?.guide);
}

export function useCurrentCursor(): ProgressCursor | undefined {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => engine?.selectCurrentCursor() ?? store?.current);
}

export function useRouteStyle(): RouteStyle {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => engine?.selectRouteStyle() ?? store?.routeStyle ?? "balanced");
}

/**
 * Per-guide completion. `getSnapshot` returns a cached object while counts are unchanged,
 * so other timeline rows do not re-render. Pass `stepIds` from `guide_index` so rings
 * work before that guide JSON is loaded. `defer` updates inside `startTransition`.
 */
export function useGuideCompletion(
  slug: string | undefined,
  opts?: { stepIds?: readonly string[]; defer?: boolean },
): GuideCompletion | undefined {
  const engine = useContext(EngineContext);
  const store = useContext(ProgressContext);
  const stepIds = opts?.stepIds;
  const defer = opts?.defer === true;
  const cacheRef = useRef<GuideCompletion | undefined>(undefined);
  const getSnapshot = (): GuideCompletion | undefined => {
    let next: GuideCompletion | undefined;
    if (!slug) next = undefined;
    else if (engine) next = engine.selectMarkedCompletion(slug, stepIds);
    else if (!store) next = undefined;
    else {
      const total = stepIds?.length;
      next = total ? { done: store.countDone(slug, undefined, stepIds), total } : undefined;
    }
    cacheRef.current = retainCompletion(cacheRef.current, next);
    return cacheRef.current;
  };
  const live = useStore(defer ? noopSubscribe : (engine?.subscribe ?? noopSubscribe), getSnapshot);
  const [deferred, setDeferred] = useState(getSnapshot);
  const getRef = useRef(getSnapshot);
  getRef.current = getSnapshot;
  useEffect(() => {
    if (!defer || !engine) return;
    return engine.subscribe(() => {
      startTransition(() => setDeferred(getRef.current()));
    });
  }, [defer, engine, slug, stepIds]);
  useEffect(() => {
    if (defer) setDeferred(getSnapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defer, slug]);
  return defer ? deferred : live;
}

/** Subscribe to profile / options / route identity, not to step ticks. */
export function useProfileUiKey(): string {
  const engine = useContext(EngineContext);
  return useStore(engine?.subscribe ?? noopSubscribe, () => engine?.selectProfileUiKey() ?? "");
}

// ---------- in-memory implementation (P6) ----------

export interface MemoryProgressState {
  done: ReadonlySet<string>;
  current?: ProgressCursor;
  routeStyle: RouteStyle;
  revision: number;
}

export type MemoryProgressAction =
  | { type: "toggle"; id: string }
  | { type: "setDone"; ids: readonly string[]; done: boolean }
  | { type: "setCurrent"; cursor: ProgressCursor }
  | { type: "setRouteStyle"; style: RouteStyle };

export function memoryProgressReducer(s: MemoryProgressState, a: MemoryProgressAction): MemoryProgressState {
  switch (a.type) {
    case "toggle": {
      const done = new Set(s.done);
      if (done.has(a.id)) done.delete(a.id);
      else done.add(a.id);
      return { ...s, done, revision: s.revision + 1 };
    }
    case "setDone": {
      const done = new Set(s.done);
      for (const id of a.ids) {
        if (a.done) done.add(id);
        else done.delete(id);
      }
      return { ...s, done, revision: s.revision + 1 };
    }
    case "setCurrent":
      if (s.current?.guide === a.cursor.guide && s.current.step === a.cursor.step) return s;
      return { ...s, current: a.cursor, revision: s.revision + 1 };
    case "setRouteStyle":
      return s.routeStyle === a.style ? s : { ...s, routeStyle: a.style, revision: s.revision + 1 };
  }
}

export function InMemoryProgressProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: Partial<Omit<MemoryProgressState, "revision">>;
}) {
  const [state, dispatch] = useReducer(memoryProgressReducer, undefined, () => ({
    done: initial?.done ?? new Set<string>(),
    current: initial?.current,
    routeStyle: initial?.routeStyle ?? "balanced",
    revision: 0,
  }));

  const store = useMemo<ProgressStore>(
    () => ({
      revision: state.revision,
      isDone: (id) => state.done.has(id),
      stepStatus: (step) => ({ status: state.done.has(step.id) ? "done" : "open" }),
      requirement: (step) => (state.done.has(step.id) ? { kind: "done" } : { kind: "required" }),
      toggle: (id) => dispatch({ type: "toggle", id }),
      setDone: (ids, done) => dispatch({ type: "setDone", ids, done }),
      countDone: (slug, _quests, guideStepIds) => {
        const allow = guideStepIds ? new Set(guideStepIds) : undefined;
        let n = 0;
        for (const id of state.done) if (stepBelongsToGuide(id, slug, allow)) n++;
        return n;
      },
      current: state.current,
      setCurrent: (cursor) => dispatch({ type: "setCurrent", cursor }),
      routeStyle: state.routeStyle,
      setRouteStyle: (style) => dispatch({ type: "setRouteStyle", style }),
    }),
    [state],
  );

  return createElement(ProgressContext.Provider, { value: store }, children);
}
