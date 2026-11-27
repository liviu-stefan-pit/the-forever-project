/** Helpers for progressive guide-list mounting and keeping the reader's place. */

/** Typical measured StepCard height (median ~155px on 40–60). Used with `contain-intrinsic-size: auto`. */
export const TYPICAL_CARD_PX = 160;

/** Map header + title row in a zone section, when we have no measured height yet. */
const SECTION_MAP_HEADER_PX = 220;
const SECTION_TITLE_ONLY_PX = 28;

export function estimateSectionHeight(visibleCount: number, hasMap: boolean, measured?: number): number {
  if (measured && measured > 0) return measured;
  return (hasMap ? SECTION_MAP_HEADER_PX : SECTION_TITLE_ONLY_PX) + Math.max(visibleCount, 0) * TYPICAL_CARD_PX;
}

/**
 * The still-visible step we should keep on screen after a filter change (dungeons / route).
 * Prefer the current step only when it was actually in the viewport; otherwise a scrolled
 * list would jump back to the cursor at the top of the guide.
 */
export function pickListAnchor(
  visibleIds: readonly string[],
  currentId: string | undefined,
  topVisibleId: string | undefined,
  allIds: readonly string[],
  currentInView = false,
): string | undefined {
  if (currentInView && currentId && visibleIds.includes(currentId)) return currentId;
  if (topVisibleId && visibleIds.includes(topVisibleId)) return topVisibleId;
  return nearestVisibleId(allIds, topVisibleId ?? currentId, visibleIds);
}

/** Closest still-visible step to `targetId` in route order (prefer the earlier one when tied). */
export function nearestVisibleId(
  allIds: readonly string[],
  targetId: string | undefined,
  visibleIds: readonly string[],
): string | undefined {
  if (visibleIds.length === 0) return undefined;
  if (!targetId) return visibleIds[0];
  if (visibleIds.includes(targetId)) return targetId;
  const pos = allIds.indexOf(targetId);
  if (pos < 0) return visibleIds[0];
  for (let d = 1; d < allIds.length; d++) {
    const before = allIds[pos - d];
    const after = allIds[pos + d];
    if (before && visibleIds.includes(before)) return before;
    if (after && visibleIds.includes(after)) return after;
  }
  return visibleIds[0];
}


/**
 * Map a step that a dungeons/route toggle just hid to the replacement that
 * should stay on screen.
 *
 * - An `…:off` stub → the first still-visible step whose id starts with
 *   `<id minus ':off'>+` (the expanded placeholder's first inserted step).
 * - An inserted `<placeholder>+…` step → `<placeholder>:off`, or the
 *   placeholder itself.
 * - Otherwise the next step in the old order that is still visible.
 *   Never falls back to the first step / section 0.
 */
export function mapAnchorAcrossVisibility(
  hiddenId: string | undefined,
  visibleIds: readonly string[],
  allIds: readonly string[],
): string | undefined {
  if (visibleIds.length === 0) return undefined;
  if (!hiddenId) return undefined;

  // Prefer the first inserted replacement even if a :off stub is still in the
  // list (force-shown by a leftover ?step= deep link).
  if (hiddenId.endsWith(":off")) {
    const prefix = `${hiddenId.slice(0, -":off".length)}+`;
    const first = visibleIds.find((id) => id.startsWith(prefix));
    if (first) return first;
  }

  if (visibleIds.includes(hiddenId)) return hiddenId;

  const plus = hiddenId.indexOf("+");
  if (plus >= 0) {
    const placeholder = hiddenId.slice(0, plus);
    if (visibleIds.includes(`${placeholder}:off`)) return `${placeholder}:off`;
    if (visibleIds.includes(placeholder)) return placeholder;
  }

  const pos = allIds.indexOf(hiddenId);
  const firstVisible = visibleIds[0];
  const start = pos < 0 ? 0 : pos + 1;
  for (let i = start; i < allIds.length; i++) {
    const id = allIds[i]!;
    if (visibleIds.includes(id) && id !== firstVisible) return id;
  }
  if (pos > 0) {
    for (let i = pos - 1; i > 0; i--) {
      const id = allIds[i]!;
      if (visibleIds.includes(id) && id !== firstVisible) return id;
    }
  }
  return undefined;
}

export function blockIndexForStep<T extends { steps: readonly { id: string }[] }>(
  blocks: readonly T[],
  stepId: string | undefined,
): number {
  if (!stepId) return 0;
  const i = blocks.findIndex((b) => b.steps.some((s) => s.id === stepId));
  return i < 0 ? 0 : i;
}

/** First card whose box intersects (viewportTop, viewportBottom). */
export function topVisibleStepId(
  cards: readonly { id: string; top: number; bottom: number }[],
  viewportTop: number,
  viewportBottom: number,
): string | undefined {
  for (const c of cards) {
    if (c.bottom > viewportTop && c.top < viewportBottom) return c.id;
  }
  // Do not fall back to the first card — that parks correction / toggle
  // anchors on step 1 when the viewport is over unmounted placeholders.
  return undefined;
}

export function readTopVisibleStepId(topBarPx = 105): string | undefined {
  if (typeof document === "undefined") return undefined;
  const cards = [...document.querySelectorAll("[data-step-id]")].map((el) => {
    const r = el.getBoundingClientRect();
    return { id: el.getAttribute("data-step-id") || "", top: r.top, bottom: r.bottom };
  });
  return topVisibleStepId(cards, topBarPx + 8, typeof window === "undefined" ? 800 : window.innerHeight);
}

export function computeMountedWindow(args: {
  blockCount: number;
  near: ReadonlySet<number>;
  previouslyMounted: ReadonlySet<number>;
  leftAt: ReadonlyMap<number, number>;
  now: number;
  evictDelayMs: number;
  pinned: ReadonlySet<number>;
  cap: number;
  anchorIndex: number;
}): { mounted: Set<number>; leftAt: Map<number, number> } {
  const { blockCount, near, previouslyMounted, now, evictDelayMs, pinned, cap, anchorIndex } = args;
  const inRange = (i: number) => i >= 0 && i < blockCount;
  const nextLeftAt = new Map(args.leftAt);

  for (const i of near) {
    if (inRange(i)) nextLeftAt.delete(i);
  }
  for (const i of previouslyMounted) {
    if (!inRange(i) || near.has(i)) continue;
    if (!nextLeftAt.has(i)) nextLeftAt.set(i, now);
  }

  const mounted = new Set<number>();
  for (const i of near) {
    if (inRange(i)) mounted.add(i);
  }
  for (const i of pinned) {
    if (inRange(i)) mounted.add(i);
  }
  for (const i of previouslyMounted) {
    if (!inRange(i) || mounted.has(i)) continue;
    const left = nextLeftAt.get(i);
    if (left === undefined || now - left < evictDelayMs) mounted.add(i);
  }

  while (mounted.size > cap) {
    let drop: number | undefined;
    let dropDist = -1;
    for (const i of mounted) {
      if (pinned.has(i)) continue;
      const dist = Math.abs(i - anchorIndex);
      if (drop === undefined || dist > dropDist || (dist === dropDist && i > drop)) {
        drop = i;
        dropDist = dist;
      }
    }
    if (drop === undefined) break;
    mounted.delete(drop);
  }

  return { mounted, leftAt: nextLeftAt };
}

/** Add up to `chunk` unmounted indices, expanding evenly around the already-mounted set. */
export function expandMounted(mounted: ReadonlySet<number>, blockCount: number, chunk = 8): Set<number> {
  const next = new Set(mounted);
  if (next.size === 0 && blockCount > 0) next.add(0);
  const centers = [...next];
  let added = 0;
  let radius = 1;
  while (added < chunk && next.size < blockCount && radius <= blockCount) {
    for (const c of centers) {
      for (const i of [c + radius, c - radius]) {
        if (i >= 0 && i < blockCount && !next.has(i)) {
          next.add(i);
          added++;
          if (added >= chunk || next.size >= blockCount) return next;
        }
      }
    }
    radius++;
  }
  return next;
}

/**
 * True only after the guide is already open and the active profile id changes.
 * The first observation (no previous id) keeps a pasted `?step=` link.
 */
export function stepQueryShouldClearOnProfileChange(
  previousProfileId: string | undefined,
  nextProfileId: string,
): boolean {
  return previousProfileId !== undefined && previousProfileId !== nextProfileId;
}

/**
 * A `?step=` is stale when `stepFor` names a different profile.
 * A missing `stepFor` is a pasted or shared link and must still apply.
 */
export function stepQueryIsStaleForProfile(stepFor: string | null, activeProfileId: string): boolean {
  return stepFor !== null && stepFor !== activeProfileId;
}

/**
 * Ignore `?step=` for the profile-change render and keep ignoring until that query is gone.
 * A later render can see "no profile change" before `setParams` deletes `step`; the sticky
 * flag covers that gap. Once `step` is absent the flag clears so a user click can set it again.
 */
export function nextIgnoreDeepStep(
  profileChanged: boolean,
  stepPresent: boolean,
  sticky: boolean,
): { ignore: boolean; sticky: boolean } {
  const nextSticky = stepPresent && (sticky || profileChanged);
  return { ignore: profileChanged || nextSticky, sticky: nextSticky };
}

/**
 * Step picking needs the quest catalog. Until it has loaded, breadcrumb and
 * exclusive exclusion cannot run, so the reader must not choose a current step.
 */
export function guideStepPickReady(questsReady: boolean): boolean {
  return questsReady;
}

/** Prefer a deep-link or stored cursor so the first mounted section is the one we will scroll to. */
export function pickCurrentStepId(
  order: readonly string[],
  opts: {
    deepStep?: string;
    cursorStep?: string;
    isDone: (id: string) => boolean;
    /** Skip blocked / not_applicable / navigation-skipped steps (do not leave the reader stuck on them). */
    shouldSkip?: (id: string) => boolean;
  },
): string | undefined {
  const inOrder = new Set(order);
  const eligible = (id: string) => inOrder.has(id) && !opts.isDone(id) && !opts.shouldSkip?.(id);
  // A ?step= or saved cursor on a done / skipped step advances to the next open step.
  if (opts.deepStep && eligible(opts.deepStep)) return opts.deepStep;
  if (opts.cursorStep && eligible(opts.cursorStep)) return opts.cursorStep;
  for (const id of order) {
    if (!opts.isDone(id) && !opts.shouldSkip?.(id)) return id;
  }
  // Nothing left to do: stand at the end of the route, not on step 1.
  return order.at(-1);
}

/**
 * The route is finished when the completion counter says so, or when no visible
 * step is still open. Jump to current then goes to the end of the page.
 */
export function guideAtEnd(
  done: number | undefined,
  total: number | undefined,
  order: readonly string[],
  isDone: (id: string) => boolean,
  shouldSkip?: (id: string) => boolean,
): boolean {
  if (total != null && total > 0 && done != null && done >= total) return true;
  // Counter not in yet: every visible step is done (a skipped-only list is not a finished route).
  return order.length > 0 && order.some((id) => isDone(id)) && order.every((id) => isDone(id) || !!shouldSkip?.(id));
}

/**
 * Move a scrolling column to its bottom. Placeholders using content-visibility
 * grow `scrollHeight` only as the scroll position passes them, so one assignment
 * stops short. Returns true once the column is actually at the end.
 */
export function scrollColumnToEnd(
  root: { scrollTop: number; scrollHeight: number; clientHeight: number },
  passes = 12,
): boolean {
  for (let i = 0; i < passes; i++) {
    const max = root.scrollHeight - root.clientHeight;
    if (max <= 1 || root.scrollTop >= max - 1) return true;
    root.scrollTop = root.scrollHeight;
  }
  const max = root.scrollHeight - root.clientHeight;
  return max <= 1 || root.scrollTop >= max - 1;
}

/**
 * Dashboard "next steps" list: visible route order, starting at the current step,
 * skipping done / blocked / not_applicable / passed travel-or-trainer steps.
 * Does not mark those steps done.
 */
export function pickNextOpenSteps(
  order: readonly string[],
  opts: {
    startId?: string;
    isDone: (id: string) => boolean;
    shouldSkip?: (id: string) => boolean;
    limit?: number;
  },
): string[] {
  const found = opts.startId ? order.indexOf(opts.startId) : 0;
  const startIdx = found < 0 ? 0 : found;
  const limit = opts.limit ?? 5;
  const out: string[] = [];
  for (let i = startIdx; i < order.length && out.length < limit; i++) {
    const id = order[i]!;
    if (opts.isDone(id) || opts.shouldSkip?.(id)) continue;
    out.push(id);
  }
  return out;
}

/**
 * Consume a pending scroll only once the target is in the document.
 * Returning the request means the caller should keep it and retry after the next commit.
 */
export function takeScrollRequest<T extends { id: string }>(
  req: T | null,
  currentId: string | undefined,
  getEl: (id: string) => { getBoundingClientRect(): unknown } | null,
  cancelledByUser = false,
): { consume: T } | { keep: T } | { skip: true } {
  // A manual scroll drops any stale jump / deep-link retry.
  if (cancelledByUser) return { skip: true };
  if (!req || req.id !== currentId) return { skip: true };
  if (!getEl(req.id)) return { keep: req };
  return { consume: req };
}

const USER_SCROLL_KEYS = new Set([
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  " ",
  "Spacebar",
  "Home",
  "End",
]);

/** Wheel, touch, or a paging/arrow/space/home/end key outside an editable field. */
export function isUserScrollIntent(e: {
  type: string;
  key?: string;
  targetTag?: string;
  targetEditable?: boolean;
}): boolean {
  if (e.type === "wheel" || e.type === "touchstart" || e.type === "touchmove") return true;
  if (e.type !== "keydown") return false;
  const tag = (e.targetTag ?? "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.targetEditable) return false;
  return USER_SCROLL_KEYS.has(e.key ?? "");
}

/** Delta to add to window.scrollY so `el` keeps the same viewport top after a layout shift. */
export function scrollCorrectionPx(previousTop: number, nextTop: number): number {
  return nextTop - previousTop;
}

/**
 * Drift correction may only run against a mounted, in-view anchor, and must
 * never produce an absolute scroll to 0 (e.g. a stale previousTop from before
 * the user moved, or a first-card fallback while the viewport is over placeholders).
 */
export function applyScrollCorrection(
  currentScrollY: number,
  previousTop: number,
  nextTop: number,
  opts: { userCancelled?: boolean; anchorInView?: boolean } = {},
): number | undefined {
  if (opts.userCancelled || opts.anchorInView === false) return undefined;
  const delta = scrollCorrectionPx(previousTop, nextTop);
  if (Math.abs(delta) <= 1) return undefined;
  if (currentScrollY + delta <= 0) return undefined;
  return delta;
}

/** First visible step in a placeholder section; never falls back to another section. */
export function firstStepInSection<T extends { id: string; steps: readonly { id: string }[] }>(
  blocks: readonly T[],
  sectionId: string | undefined,
  visibleIds?: readonly string[],
): string | undefined {
  if (!sectionId) return undefined;
  const block = blocks.find((b) => b.id === sectionId);
  if (!block) return undefined;
  if (visibleIds) return block.steps.find((s) => visibleIds.includes(s.id))?.id;
  return block.steps[0]?.id;
}

export function topVisiblePlaceholderId(
  placeholders: readonly { id: string; top: number; bottom: number }[],
  viewportTop: number,
  viewportBottom: number,
): string | undefined {
  for (const p of placeholders) {
    if (p.bottom > viewportTop && p.top < viewportBottom) return p.id;
  }
  return undefined;
}

export function readTopVisiblePlaceholderId(topBarPx = 105): string | undefined {
  return readTopVisiblePlaceholderAnchor(topBarPx)?.id;
}

/** Placeholder under the viewport, with its first-step id and current viewport top. */
export function readTopVisiblePlaceholderAnchor(topBarPx = 105): { id: string; top: number; sectionId: string } | undefined {
  if (typeof document === "undefined") return undefined;
  const viewportTop = topBarPx + 8;
  const viewportBottom = typeof window === "undefined" ? 800 : window.innerHeight;
  for (const el of document.querySelectorAll("[data-section-placeholder]")) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= viewportTop || r.top >= viewportBottom) continue;
    const sectionId = el.getAttribute("data-section-placeholder") || "";
    const id = el.getAttribute("data-section-first-step") || sectionId;
    if (!id) continue;
    return { id, top: r.top, sectionId };
  }
  return undefined;
}

export function findPlaceholderEl(stepOrSectionId: string): Element | null {
  if (typeof document === "undefined") return null;
  for (const el of document.querySelectorAll("[data-section-placeholder]")) {
    if (
      el.getAttribute("data-section-first-step") === stepOrSectionId ||
      el.getAttribute("data-section-placeholder") === stepOrSectionId
    ) {
      return el;
    }
  }
  return null;
}

/**
 * When a placeholder is replaced by its first step card, the delta to add to
 * scrollY so the card sits at the placeholder's recorded viewport top.
 * Once per mount; cancelled by user scroll; never lands at y<=0; never step 1.
 */
export function placeholderFillCorrection(
  currentScrollY: number,
  recordedPlaceholderTop: number,
  firstStepCardTop: number,
  opts: {
    userCancelled?: boolean;
    alreadyCorrected?: boolean;
    firstStepId?: string;
    listFirstStepId?: string;
  } = {},
): number | undefined {
  if (opts.userCancelled || opts.alreadyCorrected) return undefined;
  if (opts.firstStepId && opts.listFirstStepId && opts.firstStepId === opts.listFirstStepId) return undefined;
  return applyScrollCorrection(currentScrollY, recordedPlaceholderTop, firstStepCardTop);
}
