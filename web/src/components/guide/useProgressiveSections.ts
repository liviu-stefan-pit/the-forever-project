/**
 * Mount sections near the viewport (plus the current / pending-scroll section),
 * keep recently-left ones for a short grace period, and cap how many stay mounted.
 * Placeholders keep measured heights so prepending sections doesn't jump the scroll.
 * After a visibility change (dungeons / route), the current or top visible step is
 * scrolled back into view.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SectionBlock } from "../../lib/grouping";
import {
  applyScrollCorrection,
  blockIndexForStep,
  computeMountedWindow,
  estimateSectionHeight,
  findPlaceholderEl,
  firstStepInSection,
  isUserScrollIntent,
  mapAnchorAcrossVisibility,
  placeholderFillCorrection,
  readTopVisiblePlaceholderAnchor,
  readTopVisibleStepId,
} from "../../lib/guideList";

const EVICT_DELAY_MS = 300;
const MAX_MOUNTED = 6;
const IO_ROOT_MARGIN = "100% 0px 100% 0px";

function topBarPx(): number {
  if (typeof document === "undefined") return 105;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--topbar-h");
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 105;
}

function sameIndexSet(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  if (a.size !== b.size) return false;
  for (const i of a) if (!b.has(i)) return false;
  return true;
}

/** Same region as IntersectionObserver rootMargin "100% 0px 100% 0px". */
function intersectsExpandedViewport(r: { top: number; bottom: number; left: number; right: number }): boolean {
  const viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight;
  const viewportWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  const marginY = 1.0 * viewportHeight;
  return r.bottom > -marginY && r.top < viewportHeight + marginY && r.right > 0 && r.left < viewportWidth;
}

export function useProgressiveSections(opts: {
  slug: string;
  layoutKey: string;
  blocks: readonly SectionBlock[];
  order: readonly string[];
  currentId: string | undefined;
  /** Pending scroll target (e.g. GuideReader scrollReq); pinned and never evicted by the cap. */
  pinnedStepId?: string;
  allStepIds: readonly string[];
  visibleIn: (block: SectionBlock) => number;
}): {
  isMounted: (index: number) => boolean;
  placeholderHeight: (block: SectionBlock) => number;
  setMeasureNode: (id: string, el: HTMLDivElement | null) => void;
} {
  const { slug, layoutKey, blocks, order, currentId, pinnedStepId, allStepIds, visibleIn } = opts;
  const topVisibleIdRef = useRef<string | undefined>(undefined);
  const placeholderIdRef = useRef<string | undefined>(undefined);
  const userMoved = useRef(false);
  const stickyRef = useRef<{ id: string; top: number; fromPlaceholder?: boolean; holdOffscreen?: boolean } | null>(null);
  const correctedPlaceholder = useRef(new Set<string>());
  const listFirstStepRef = useRef(order[0]);
  listFirstStepRef.current = order[0];
  const heightsRef = useRef(new Map<string, number>());
  const pendingAnchor = useRef<string | undefined>(undefined);
  const pendingMode = useRef<"center" | "nearest">("nearest");
  const observers = useRef(new Map<string, ResizeObserver>());
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const elToId = useRef(new Map<Element, string>());
  const idToIndex = useRef(new Map<string, number>());
  idToIndex.current = new Map(blocks.map((b, i) => [b.id, i]));
  const nearRef = useRef(new Set<number>());
  const leftAtRef = useRef(new Map<number, number>());
  const viewportAnchorRef = useRef<number | undefined>(undefined);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const evictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugRef = useRef(slug);
  const layoutKeyRef = useRef(layoutKey);
  slugRef.current = slug;
  layoutKeyRef.current = layoutKey;
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const currentIdRef = useRef(currentId);
  currentIdRef.current = currentId;
  const pinnedStepIdRef = useRef(pinnedStepId);
  pinnedStepIdRef.current = pinnedStepId;

  const initial = blockIndexForStep(blocks, currentId ?? order[0]);
  const [snap, setSnap] = useState(() => ({
    slug,
    layoutKey,
    mounted: new Set([initial]) as ReadonlySet<number>,
  }));
  const mountedRef = useRef(snap.mounted);
  mountedRef.current = snap.mounted;

  const pinnedIndexes = useCallback((): Set<number> => {
    const pinned = new Set<number>();
    pinned.add(blockIndexForStep(blocksRef.current, currentIdRef.current));
    if (pinnedStepIdRef.current) pinned.add(blockIndexForStep(blocksRef.current, pinnedStepIdRef.current));
    return pinned;
  }, []);

  const applyWindow = useCallback(() => {
    const now = Date.now();
    const nextBlocks = blocksRef.current;
    const pinned = pinnedIndexes();
    const anchor = viewportAnchorRef.current ?? blockIndexForStep(nextBlocks, currentIdRef.current);
    const result = computeMountedWindow({
      blockCount: nextBlocks.length,
      near: nearRef.current,
      previouslyMounted: mountedRef.current,
      leftAt: leftAtRef.current,
      now,
      evictDelayMs: EVICT_DELAY_MS,
      pinned,
      cap: MAX_MOUNTED,
      anchorIndex: anchor,
    });
    leftAtRef.current = result.leftAt;
    if (evictTimerRef.current) {
      clearTimeout(evictTimerRef.current);
      evictTimerRef.current = null;
    }
    let soonest: number | undefined;
    for (const [i, t] of result.leftAt) {
      if (!result.mounted.has(i) || pinned.has(i) || nearRef.current.has(i)) continue;
      if (soonest === undefined || t < soonest) soonest = t;
    }
    if (soonest !== undefined) {
      const delay = Math.max(0, soonest + EVICT_DELAY_MS - now);
      evictTimerRef.current = setTimeout(() => {
        evictTimerRef.current = null;
        applyWindow();
      }, delay);
    }
    const nextSlug = slugRef.current;
    const nextLayout = layoutKeyRef.current;
    if (sameIndexSet(mountedRef.current, result.mounted)) return;
    mountedRef.current = result.mounted;
    setSnap((prev) => {
      if (prev.slug !== nextSlug || prev.layoutKey !== nextLayout) return prev;
      if (sameIndexSet(prev.mounted, result.mounted)) return prev;
      return { slug: prev.slug, layoutKey: prev.layoutKey, mounted: result.mounted };
    });
  }, [pinnedIndexes]);

  const syncViewportAnchor = useCallback(() => {
    const topBar = topBarPx();
    let bestIdx: number | undefined;
    let bestDist = Infinity;
    for (const [id, el] of nodeRefs.current) {
      const idx = idToIndex.current.get(id);
      if (idx === undefined || !nearRef.current.has(idx)) continue;
      const dist = Math.abs(el.getBoundingClientRect().top - topBar);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    }
    if (bestIdx !== undefined) viewportAnchorRef.current = bestIdx;
  }, []);

  // Track the top visible step so a dungeon/route toggle can restore it.
  // A manual scroll cancels stale auto-scroll (pending anchor / drift correction).
  useEffect(() => {
    const onScroll = () => {
      const topBar = topBarPx();
      const id = readTopVisibleStepId(topBar);
      // No intersecting card: do not keep a stale first/last card as the toggle
      // or correction anchor (that was the snap-to-y=0 / step-1 path).
      topVisibleIdRef.current = id;
      const el = id ? document.getElementById(`step-${id}`) : null;
      const r = el?.getBoundingClientRect();
      if (id && r && r.bottom > topBar && r.top < window.innerHeight) {
        stickyRef.current = { id, top: r.top };
        viewportAnchorRef.current = blockIndexForStep(blocksRef.current, id);
      } else {
        const ph = readTopVisiblePlaceholderAnchor(topBar);
        placeholderIdRef.current = ph?.id;
        if (ph) {
          const phIdx = blocksRef.current.findIndex((b) => b.id === ph.sectionId);
          if (phIdx >= 0) viewportAnchorRef.current = phIdx;
        }
        // Never anchor fill-correction to the list's first step.
        if (ph && ph.id !== listFirstStepRef.current) {
          stickyRef.current = { id: ph.id, top: ph.top, fromPlaceholder: true };
        } else {
          stickyRef.current = null;
        }
      }
      // Re-enable fill correction for the newly recorded placeholder; any stale
      // jump/restore was already dropped in onUser.
      userMoved.current = false;
    };
    const onUser = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!isUserScrollIntent({ type: e.type, key: (e as KeyboardEvent).key, targetTag: t?.tagName, targetEditable: t?.isContentEditable })) {
        return;
      }
      userMoved.current = true;
      pendingAnchor.current = undefined;
      stickyRef.current = null;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const ev of ["wheel", "touchstart", "touchmove", "keydown"] as const) {
      window.addEventListener(ev, onUser, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      for (const ev of ["wheel", "touchstart", "touchmove", "keydown"] as const) {
        window.removeEventListener(ev, onUser);
      }
    };
  }, [slug]);

  // Reset during render (not in an effect) so a dungeons/route change cannot
  // first commit every already-mounted section with its new steps — that was a
  // multi-second long task under 4x CPU.
  // Slug is stored in state, not a ref: a ref updated during an abandoned
  // render would skip the reset while `mounted` still listed the previous guide.
  // A new guide opened on its first step has no anchor, and the old code then
  // left every previously mounted index in place — the next guide never committed.
  const slugChanged = snap.slug !== slug;
  const layoutChanged = snap.layoutKey !== layoutKey;
  let mounted = snap.mounted;
  if (slugChanged || layoutChanged) {
    if (slugChanged) {
      topVisibleIdRef.current = undefined;
      placeholderIdRef.current = undefined;
      stickyRef.current = null;
    }
    nearRef.current = new Set();
    leftAtRef.current = new Map();
    viewportAnchorRef.current = undefined;
    if (evictTimerRef.current) {
      clearTimeout(evictTimerRef.current);
      evictTimerRef.current = null;
    }
    const currentEl = typeof document !== "undefined" && currentId ? document.getElementById(`step-${currentId}`) : null;
    const cr = currentEl?.getBoundingClientRect();
    const currentInView = !!cr && cr.bottom > topBarPx() && cr.top < window.innerHeight;
    // Prefer the pre-toggle top-visible step, mapped through :off / inserted ids,
    // so a hidden cursor does not reset the list to step 1 / section 0.
    // If the viewport is over placeholders, use that section's first visible step.
    const mappedTop = mapAnchorAcrossVisibility(topVisibleIdRef.current, order, allStepIds);
    const mappedCurrent = mapAnchorAcrossVisibility(currentId, order, allStepIds);
    const phRaw = placeholderIdRef.current;
    const phStep = firstStepInSection(blocks, phRaw, order) ?? phRaw;
    const mappedPh = mapAnchorAcrossVisibility(phStep, order, allStepIds) ?? phStep;
    const anchor =
      (currentInView ? mappedCurrent : undefined) ??
      mappedTop ??
      (mappedPh && mappedPh !== order[0] ? mappedPh : undefined) ??
      (mappedCurrent && mappedCurrent !== order[0] ? mappedCurrent : undefined);
    userMoved.current = false;
    correctedPlaceholder.current = new Set();
    const resetId = anchor ?? currentId ?? order[0];
    const idx = blockIndexForStep(blocks, resetId);
    pendingAnchor.current = slugChanged ? (anchor ?? currentId ?? order[0]) : anchor;
    // Never use "center" for a currentId fallback — that jumps to the cursor
    // (often step 1) when the viewport was over placeholders.
    pendingMode.current = slugChanged ? "center" : currentInView && anchor === mappedCurrent ? "center" : "nearest";
    mounted = new Set([idx]);
    mountedRef.current = mounted;
    setSnap({ slug, layoutKey, mounted });
  }

  // Wait until the reset has committed (only the anchor section mounted) so we
  // don't scroll using the pre-toggle DOM and then lose the place on remount.
  useLayoutEffect(() => {
    const id = pendingAnchor.current;
    if (!id || userMoved.current) {
      if (userMoved.current) pendingAnchor.current = undefined;
      return;
    }
    const idx = blockIndexForStep(blocks, id);
    if (mounted.size !== 1 || !mounted.has(idx)) return;
    const el = document.getElementById(`step-${id}`);
    if (!el) return;
    pendingAnchor.current = undefined;
    el.scrollIntoView({ block: pendingMode.current, behavior: "auto" });
    topVisibleIdRef.current = id;
    stickyRef.current = { id, top: el.getBoundingClientRect().top };
  }, [mounted, blocks]);

  // After hydration replaces a placeholder, put the section's first step card
  // at the placeholder's recorded viewport top (once per mount). Also keep a
  // still-visible placeholder stable if a section above just mounted.
  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky || userMoved.current) return;
    const card = document.getElementById(`step-${sticky.id}`);
    const topBar = topBarPx();

    if (sticky.fromPlaceholder && card) {
      const already = correctedPlaceholder.current.has(sticky.id);
      const delta = placeholderFillCorrection(window.scrollY, sticky.top, card.getBoundingClientRect().top, {
        userCancelled: userMoved.current,
        alreadyCorrected: already,
        firstStepId: sticky.id,
        listFirstStepId: listFirstStepRef.current,
      });
      if (delta !== undefined) window.scrollBy(0, delta);
      correctedPlaceholder.current.add(sticky.id);
      // Keep this card as the anchor even if it sits above the viewport (the
      // user was mid-placeholder). Later sections mounting above must not
      // drop the correction just because the first card is off-screen.
      stickyRef.current = { id: sticky.id, top: card.getBoundingClientRect().top, holdOffscreen: true };
      return;
    }

    if (sticky.fromPlaceholder && !card) {
      const ph = findPlaceholderEl(sticky.id);
      if (!ph) return;
      const r = ph.getBoundingClientRect();
      const phInView = r.bottom > topBar && r.top < window.innerHeight;
      // Tall placeholders can have a negative top and still cover the viewport.
      const delta = applyScrollCorrection(window.scrollY, sticky.top, r.top, {
        userCancelled: userMoved.current,
        anchorInView: phInView,
      });
      if (delta !== undefined) window.scrollBy(0, delta);
      stickyRef.current = { id: sticky.id, top: ph.getBoundingClientRect().top, fromPlaceholder: true };
      return;
    }

    if (!card) return;
    const r = card.getBoundingClientRect();
    const inView = r.bottom > topBar && r.top < window.innerHeight;
    const recordedOnScreen = sticky.top < window.innerHeight && sticky.top >= topBar;
    const hold = !!sticky.holdOffscreen;
    const delta = applyScrollCorrection(window.scrollY, sticky.top, r.top, {
      userCancelled: userMoved.current,
      anchorInView: hold || (inView && recordedOnScreen),
    });
    if (delta !== undefined) window.scrollBy(0, delta);
    if (inView || hold) stickyRef.current = { id: sticky.id, top: card.getBoundingClientRect().top, holdOffscreen: hold };
    else stickyRef.current = null;
  }, [mounted]);

  // After slug/layoutKey reset, reused nodes often do not fire IntersectionObserver
  // (threshold 0, unchanged size). Seed "near" from current boxes before paint.
  useLayoutEffect(() => {
    const nextNear = new Set<number>();
    for (const [id, node] of nodeRefs.current) {
      const idx = idToIndex.current.get(id);
      if (idx === undefined) continue;
      if (intersectsExpandedViewport(node.getBoundingClientRect())) nextNear.add(idx);
    }
    nearRef.current = nextNear;
    syncViewportAnchor();
    applyWindow();
  }, [slug, layoutKey, applyWindow, syncViewportAnchor]);

  // Keep the current step's section mounted (keyboard / deep link) even if the observer hasn't seen it.
  useEffect(() => {
    const idx = blockIndexForStep(blocks, currentId);
    if (currentId && !mounted.has(idx)) {
      setSnap((prev) => {
        if (prev.slug !== slug || prev.layoutKey !== layoutKey || prev.mounted.has(idx)) return prev;
        const next = new Set(prev.mounted);
        next.add(idx);
        mountedRef.current = next;
        return { slug: prev.slug, layoutKey: prev.layoutKey, mounted: next };
      });
    }
  }, [currentId, blocks, mounted, slug, layoutKey]);

  useEffect(() => {
    applyWindow();
  }, [currentId, pinnedStepId, blocks.length, applyWindow]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = elToId.current.get(entry.target);
          if (!id) continue;
          const idx = idToIndex.current.get(id);
          if (idx === undefined) continue;
          if (entry.isIntersecting) nearRef.current.add(idx);
          else nearRef.current.delete(idx);
        }
        syncViewportAnchor();
        applyWindow();
      },
      { root: null, rootMargin: IO_ROOT_MARGIN, threshold: 0 },
    );
    ioRef.current = io;
    for (const el of nodeRefs.current.values()) io.observe(el);
    return () => {
      io.disconnect();
      if (ioRef.current === io) ioRef.current = null;
    };
  }, [slug, layoutKey, applyWindow, syncViewportAnchor]);

  useEffect(() => {
    return () => {
      if (evictTimerRef.current) clearTimeout(evictTimerRef.current);
      for (const ro of observers.current.values()) ro.disconnect();
    };
  }, []);

  const isMounted = useCallback((index: number) => mounted.has(index), [mounted]);

  const placeholderHeight = useCallback(
    (block: SectionBlock) => estimateSectionHeight(visibleIn(block), !!block.section, heightsRef.current.get(block.id)),
    [visibleIn],
  );

  const setMeasureNode = useCallback((id: string, el: HTMLDivElement | null) => {
    const prev = nodeRefs.current.get(id);
    if (prev && prev !== el) {
      observers.current.get(id)?.disconnect();
      observers.current.delete(id);
      nodeRefs.current.delete(id);
      elToId.current.delete(prev);
      ioRef.current?.unobserve(prev);
    }
    if (!el) return;
    nodeRefs.current.set(id, el);
    elToId.current.set(el, id);
    ioRef.current?.observe(el);
    const measure = () => {
      if (el.getAttribute("data-section-placeholder") != null) return;
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) heightsRef.current.set(id, h);
    };
    measure();
    if (observers.current.has(id)) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    observers.current.set(id, ro);
  }, []);

  return { isMounted, placeholderHeight, setMeasureNode };
}
