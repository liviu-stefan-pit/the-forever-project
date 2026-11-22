/**
 * Keyboard navigation for the guide reader, as a pure reducer (unit-tested).
 *
 *   j               next step            k             previous step
 *   space           toggle done; when that ticks the step, jump to the next unchecked one
 *   n               next unchecked step (wraps to the first unchecked step)
 *   / or Ctrl+K     open search (handled by the app shell)
 */
export type NavCommand = "next" | "prev" | "toggle" | "nextUnchecked";
export type KeyCommand = NavCommand | "search";

export interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  /** Tag name of the event target (INPUT, BUTTON …). */
  targetTag?: string;
  targetEditable?: boolean;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
/** Elements where space has native meaning (activates the element). */
const ACTIVATABLE_TAGS = new Set(["BUTTON", "A", "SUMMARY", "INPUT", "SELECT", "TEXTAREA"]);

export function commandForKey(e: KeyLike): KeyCommand | null {
  const tag = (e.targetTag ?? "").toUpperCase();
  const typing = TYPING_TAGS.has(tag) || !!e.targetEditable;
  if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") return "search";
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return null;
  switch (e.key) {
    case "/":
      return "search";
    case "j": // arrows keep native scrolling
      return "next";
    case "k":
      return "prev";
    case "n":
      return "nextUnchecked";
    case " ":
    case "Spacebar":
      return ACTIVATABLE_TAGS.has(tag) ? null : "toggle";
    default:
      return null;
  }
}

export interface NavContext {
  /** Visible step ids in route order. */
  order: readonly string[];
  isDone(id: string): boolean;
  /** Skip blocked / not_applicable steps when finding the next unchecked step. */
  shouldSkip?: (id: string) => boolean;
}

export interface NavResult {
  current: string | undefined;
  /** Step whose done state should flip. */
  toggle?: string;
}

/** Exported for unit tests. */
export function firstUncheckedFrom(
  order: readonly string[],
  start: number,
  isDone: (id: string) => boolean,
  skip?: string,
  shouldSkip?: (id: string) => boolean,
) {
  for (let i = 0; i < order.length; i++) {
    const id = order[(start + i) % order.length]!;
    if (id !== skip && !isDone(id) && !shouldSkip?.(id)) return id;
  }
  return undefined;
}

function adjacentStep(
  order: readonly string[],
  idx: number,
  dir: 1 | -1,
  shouldSkip?: (id: string) => boolean,
): string {
  let i = idx < 0 ? (dir > 0 ? -1 : 0) : idx;
  for (;;) {
    i += dir;
    if (i < 0) return order[0]!;
    if (i >= order.length) return order[order.length - 1]!;
    const id = order[i]!;
    if (!shouldSkip?.(id)) return id;
  }
}

export function navReducer(current: string | undefined, cmd: NavCommand, ctx: NavContext): NavResult {
  const { order, isDone, shouldSkip } = ctx;
  if (order.length === 0) return { current: undefined };
  const idx = current === undefined ? -1 : order.indexOf(current);
  switch (cmd) {
    case "next":
      return { current: adjacentStep(order, idx, 1, shouldSkip) };
    case "prev":
      return { current: adjacentStep(order, idx, -1, shouldSkip) };
    case "nextUnchecked":
      return { current: firstUncheckedFrom(order, idx + 1, isDone, current, shouldSkip) ?? current };
    case "toggle": {
      if (idx < 0) return { current: order[0] };
      const id = order[idx]!;
      if (isDone(id)) return { current: id, toggle: id };
      // Ticking: move on to the next unchecked step (treating `id` as done now).
      const next = firstUncheckedFrom(order, idx + 1, isDone, id, shouldSkip);
      return { current: next ?? id, toggle: id };
    }
  }
}
