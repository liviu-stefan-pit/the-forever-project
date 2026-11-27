import { describe, expect, it } from "vitest";
import {
  TYPICAL_CARD_PX,
  blockIndexForStep,
  estimateSectionHeight,
  expandMounted,
  nearestVisibleId,
  mapAnchorAcrossVisibility,
  guideAtEnd,
  pickCurrentStepId,
  scrollColumnToEnd,
  pickNextOpenSteps,
  guideStepPickReady,
  nextIgnoreDeepStep,
  stepQueryIsStaleForProfile,
  stepQueryShouldClearOnProfileChange,
  applyScrollCorrection,
  computeMountedWindow,
  firstStepInSection,
  isUserScrollIntent,
  placeholderFillCorrection,
  pickListAnchor,
  scrollCorrectionPx,
  takeScrollRequest,
  topVisiblePlaceholderId,
  topVisibleStepId,
  START_AT_TOP_STATE,
  wantsStartAtTop,
} from "./guideList";

describe("pickListAnchor", () => {
  const all = ["a", "b", "c", "d", "e"];
  const visible = ["a", "c", "e"];

  it("prefers the current step when it is still visible and in the viewport", () => {
    expect(pickListAnchor(visible, "c", "a", all, true)).toBe("c");
  });

  it("keeps the top visible step when current is off-screen (user has scrolled)", () => {
    expect(pickListAnchor(visible, "a", "c", all, false)).toBe("c");
  });

  it("falls back to the top visible step when current is hidden", () => {
    expect(pickListAnchor(visible, "b", "c", all, false)).toBe("c");
  });

  it("picks the nearest still-visible step when both current and top are hidden", () => {
    expect(pickListAnchor(visible, "b", "d", all)).toBe("c");
    expect(pickListAnchor(visible, undefined, "d", all)).toBe("c");
  });

  it("returns the first visible step when nothing else matches", () => {
    expect(pickListAnchor(visible, undefined, undefined, all)).toBe("a");
    expect(pickListAnchor([], "a", "a", all)).toBeUndefined();
  });
});

describe("nearestVisibleId", () => {
  it("prefers the earlier neighbour when both sides are equally far", () => {
    expect(nearestVisibleId(["a", "b", "c"], "b", ["a", "c"])).toBe("a");
  });
});

describe("blockIndexForStep", () => {
  const blocks = [{ steps: [{ id: "a" }] }, { steps: [{ id: "b" }, { id: "c" }] }];
  it("finds the block that contains the step", () => {
    expect(blockIndexForStep(blocks, "c")).toBe(1);
    expect(blockIndexForStep(blocks, "missing")).toBe(0);
    expect(blockIndexForStep(blocks, undefined)).toBe(0);
  });
});

describe("estimateSectionHeight", () => {
  it("uses a measured height when one exists", () => {
    expect(estimateSectionHeight(10, true, 800)).toBe(800);
  });
  it("estimates from typical card height otherwise", () => {
    expect(estimateSectionHeight(3, true)).toBeGreaterThan(3 * TYPICAL_CARD_PX);
    expect(estimateSectionHeight(3, false)).toBe(28 + 3 * TYPICAL_CARD_PX);
  });
});

describe("expandMounted", () => {
  it("grows a neighbourhood around the already-mounted index", () => {
    const next = expandMounted(new Set([5]), 10, 4);
    expect([...next].sort((a, b) => a - b)).toEqual([3, 4, 5, 6, 7]);
  });
  it("starts at 0 when nothing is mounted", () => {
    expect(expandMounted(new Set(), 3, 2).has(0)).toBe(true);
  });
});

describe("computeMountedWindow", () => {
  const base = {
    blockCount: 20,
    evictDelayMs: 300,
    cap: 12,
    now: 1_000,
    leftAt: new Map<number, number>(),
  };

  it("always keeps pinned indexes even when they exceed the cap", () => {
    const pinned = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const result = computeMountedWindow({
      ...base,
      near: new Set(),
      previouslyMounted: new Set(),
      pinned,
      anchorIndex: 0,
    });
    expect([...result.mounted].sort((a, b) => a - b)).toEqual([...pinned]);
  });

  it("drops the index farthest from the anchor first when over cap", () => {
    const near = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 19]);
    const result = computeMountedWindow({
      ...base,
      near,
      previouslyMounted: near,
      pinned: new Set([5]),
      cap: 12,
      anchorIndex: 5,
    });
    expect(result.mounted.has(19)).toBe(false);
    expect(result.mounted.has(0)).toBe(true);
    expect(result.mounted.size).toBe(12);
    expect(result.mounted.has(5)).toBe(true);
  });

  it("on equal distance from the anchor, drops the higher index first", () => {
    const result = computeMountedWindow({
      ...base,
      blockCount: 10,
      near: new Set([4, 5, 6]),
      previouslyMounted: new Set([4, 5, 6]),
      pinned: new Set([5]),
      cap: 2,
      anchorIndex: 5,
    });
    expect([...result.mounted].sort((a, b) => a - b)).toEqual([4, 5]);
  });

  it("keeps an index that just left until evictDelayMs and drops it after", () => {
    const first = computeMountedWindow({
      ...base,
      near: new Set([5]),
      previouslyMounted: new Set([3, 5]),
      pinned: new Set([5]),
      leftAt: new Map(),
      now: 1_000,
      anchorIndex: 5,
    });
    expect(first.mounted.has(3)).toBe(true);
    expect(first.leftAt.get(3)).toBe(1_000);

    const still = computeMountedWindow({
      ...base,
      near: new Set([5]),
      previouslyMounted: first.mounted,
      pinned: new Set([5]),
      leftAt: first.leftAt,
      now: 1_000 + 299,
      anchorIndex: 5,
    });
    expect(still.mounted.has(3)).toBe(true);

    const dropped = computeMountedWindow({
      ...base,
      near: new Set([5]),
      previouslyMounted: still.mounted,
      pinned: new Set([5]),
      leftAt: still.leftAt,
      now: 1_000 + 300,
      anchorIndex: 5,
    });
    expect(dropped.mounted.has(3)).toBe(false);
  });

  it("keeps near indexes and clears their leftAt", () => {
    const result = computeMountedWindow({
      ...base,
      near: new Set([4, 5]),
      previouslyMounted: new Set([4, 5, 8]),
      pinned: new Set(),
      leftAt: new Map([
        [4, 500],
        [8, 500],
      ]),
      now: 1_000,
      anchorIndex: 5,
    });
    expect(result.mounted.has(4)).toBe(true);
    expect(result.mounted.has(5)).toBe(true);
    expect(result.leftAt.has(4)).toBe(false);
    expect(result.leftAt.get(8)).toBe(500);
  });
});

describe("topVisibleStepId", () => {
  it("returns the first card that intersects the viewport", () => {
    const cards = [
      { id: "a", top: -80, bottom: 20 },
      { id: "b", top: 30, bottom: 180 },
      { id: "c", top: 200, bottom: 350 },
    ];
    expect(topVisibleStepId(cards, 24, 800)).toBe("b");
  });

  it("returns undefined when no card intersects — never the first card", () => {
    const cards = [
      { id: "a", top: -400, bottom: -200 },
      { id: "b", top: -180, bottom: -20 },
    ];
    expect(topVisibleStepId(cards, 24, 800)).toBeUndefined();
  });
});

describe("pickCurrentStepId", () => {
  const order = ["a", "b", "c", "d"];
  const isDone = (id: string) => id === "a";

  it("prefers a deep-link target so hydration can mount that section first", () => {
    expect(pickCurrentStepId(order, { deepStep: "d", cursorStep: "b", isDone })).toBe("d");
  });

  it("advances a deep link that is done or skipped", () => {
    const shouldSkip = (id: string) => id === "d";
    expect(pickCurrentStepId(order, { deepStep: "a", cursorStep: "c", isDone })).toBe("c");
    expect(pickCurrentStepId(order, { deepStep: "d", cursorStep: "d", isDone, shouldSkip })).toBe("b");
  });

  it("does not treat the guide as ready to pick a step before the quest catalog loads", () => {
    expect(guideStepPickReady(false)).toBe(false);
    expect(guideStepPickReady(true)).toBe(true);
  });

  it("falls back to the stored cursor, then the first incomplete step", () => {
    expect(pickCurrentStepId(order, { cursorStep: "c", isDone })).toBe("c");
    expect(pickCurrentStepId(order, { isDone })).toBe("b");
  });

  it("advances a saved cursor that sits on a blocked or not_applicable step", () => {
    const shouldSkip = (id: string) => id === "b" || id === "c";
    expect(pickCurrentStepId(order, { cursorStep: "b", isDone, shouldSkip })).toBe("d");
    expect(pickCurrentStepId(order, { cursorStep: "c", isDone: () => false, shouldSkip })).toBe("a");
  });

  it("skips blocked / not_applicable when picking the first open step", () => {
    const shouldSkip = (id: string) => id === "b";
    expect(pickCurrentStepId(order, { isDone, shouldSkip })).toBe("c");
  });

  it("treats a full counter or no open step as the end of the route", () => {
    const done = (id: string) => id !== "c";
    expect(guideAtEnd(4, 4, order, () => false)).toBe(true);
    expect(guideAtEnd(3, 4, order, () => true)).toBe(true);
    expect(guideAtEnd(3, 4, order, done)).toBe(false);
    expect(guideAtEnd(0, 4, order, () => false, () => true)).toBe(false);
    expect(guideAtEnd(undefined, undefined, [], () => true)).toBe(false);
  });

  it("keeps scrolling until a growing column is actually at the end", () => {
    let scrollTop = 0;
    let scrollHeight = 400;
    const root = {
      clientHeight: 100,
      get scrollHeight() {
        return scrollHeight;
      },
      get scrollTop() {
        return scrollTop;
      },
      set scrollTop(value: number) {
        scrollTop = value;
        if (scrollHeight < 1600) scrollHeight += 400;
      },
    };
    expect(scrollColumnToEnd(root)).toBe(true);
    expect(root.scrollTop).toBeGreaterThanOrEqual(root.scrollHeight - root.clientHeight - 1);
  });

  it("stands on the last step when every step is done or skipped", () => {
    expect(pickCurrentStepId(order, { isDone: () => true })).toBe("d");
    expect(pickCurrentStepId(order, { cursorStep: "a", isDone: () => true })).toBe("d");
    expect(pickCurrentStepId(order, { deepStep: "b", isDone: () => true })).toBe("d");
    expect(pickCurrentStepId([], { isDone: () => true })).toBeUndefined();
    expect(pickCurrentStepId(order, { isDone: () => false, shouldSkip: () => true })).toBe("d");
  });

  it("does not treat a partially done mixed step as finished or skippable", () => {
    // turnin 1359 done + accept 1358 still open → isDone false, shouldSkip false
    const mixedOrder = ["before", "mixed-1359-1358", "after"];
    expect(
      pickCurrentStepId(mixedOrder, {
        cursorStep: "mixed-1359-1358",
        isDone: (id) => id === "before",
        shouldSkip: () => false,
      }),
    ).toBe("mixed-1359-1358");
  });
});

describe("pickNextOpenSteps", () => {
  it("skips passed travel and trainer steps from the current cursor without treating them as done", () => {
    const order = ["goto", "trainer", "hearth", "quest-a", "quest-b"];
    const isDone = (id: string) => id === "quest-a";
    const shouldSkip = (id: string) => id === "goto" || id === "trainer" || id === "hearth";
    expect(pickNextOpenSteps(order, { startId: "trainer", isDone, shouldSkip, limit: 5 })).toEqual(["quest-b"]);
    expect(isDone("trainer")).toBe(false);
    expect(isDone("goto")).toBe(false);
  });
});

describe("stepQueryShouldClearOnProfileChange", () => {
  it("keeps a pasted step link on first open and drops it when the profile id changes", () => {
    expect(stepQueryShouldClearOnProfileChange(undefined, "guest")).toBe(false);
    expect(stepQueryShouldClearOnProfileChange("a", "a")).toBe(false);
    expect(stepQueryShouldClearOnProfileChange("a", "b")).toBe(true);
    expect(stepQueryShouldClearOnProfileChange("a", "guest")).toBe(true);
  });
});

describe("stepQueryIsStaleForProfile", () => {
  it("treats a missing stepFor as a shared link and a mismatched stepFor as stale", () => {
    expect(stepQueryIsStaleForProfile(null, "a")).toBe(false);
    expect(stepQueryIsStaleForProfile("a", "a")).toBe(false);
    expect(stepQueryIsStaleForProfile("a", "b")).toBe(true);
    expect(stepQueryIsStaleForProfile("a", "guest")).toBe(true);
    expect(stepQueryIsStaleForProfile("guest", "a")).toBe(true);
  });
});

describe("nextIgnoreDeepStep", () => {
  it("stays sticky until the step query is gone, then accepts a later step link", () => {
    const changed = nextIgnoreDeepStep(true, true, false);
    expect(changed).toEqual({ ignore: true, sticky: true });
    const beforeFlush = nextIgnoreDeepStep(false, true, changed.sticky);
    expect(beforeFlush).toEqual({ ignore: true, sticky: true });
    const cleared = nextIgnoreDeepStep(false, false, beforeFlush.sticky);
    expect(cleared).toEqual({ ignore: false, sticky: false });
    expect(nextIgnoreDeepStep(false, true, cleared.sticky)).toEqual({ ignore: false, sticky: false });
    expect(nextIgnoreDeepStep(true, false, false)).toEqual({ ignore: true, sticky: false });
  });
});

describe("takeScrollRequest", () => {
  const el = { getBoundingClientRect() { return {}; } };

  it("keeps the request when the target is not in the document yet", () => {
    expect(takeScrollRequest({ id: "d", mode: "center" }, "d", () => null)).toEqual({
      keep: { id: "d", mode: "center" },
    });
  });

  it("consumes the request once the target is rendered", () => {
    expect(takeScrollRequest({ id: "d", mode: "center" }, "d", () => el)).toEqual({
      consume: { id: "d", mode: "center" },
    });
  });

  it("skips when the cursor has not caught up to the request", () => {
    expect(takeScrollRequest({ id: "d", mode: "center" }, "a", () => el)).toEqual({ skip: true });
  });

  it("skips a stale request once the user has scrolled", () => {
    expect(takeScrollRequest({ id: "d", mode: "center" }, "d", () => el, true)).toEqual({ skip: true });
    expect(takeScrollRequest({ id: "d", mode: "center" }, "d", () => null, true)).toEqual({ skip: true });
  });
});

describe("isUserScrollIntent", () => {
  it("treats wheel, touch, and paging keys as a user scroll", () => {
    expect(isUserScrollIntent({ type: "wheel" })).toBe(true);
    expect(isUserScrollIntent({ type: "touchstart" })).toBe(true);
    expect(isUserScrollIntent({ type: "touchmove" })).toBe(true);
    for (const key of ["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Home", "End"]) {
      expect(isUserScrollIntent({ type: "keydown", key })).toBe(true);
    }
  });

  it("ignores typing and non-scroll keys", () => {
    expect(isUserScrollIntent({ type: "keydown", key: "j" })).toBe(false);
    expect(isUserScrollIntent({ type: "keydown", key: " ", targetTag: "INPUT" })).toBe(false);
    expect(isUserScrollIntent({ type: "keydown", key: "PageDown", targetEditable: true })).toBe(false);
  });
});

describe("scrollCorrectionPx", () => {
  it("is the amount scrollY must change to keep the same viewport top", () => {
    expect(scrollCorrectionPx(120, 80)).toBe(-40);
    expect(scrollCorrectionPx(120, 200)).toBe(80);
  });
});

describe("applyScrollCorrection", () => {
  it("does not scroll when there is no in-view anchor or the user has moved", () => {
    expect(applyScrollCorrection(500, 120, 80, { anchorInView: false })).toBeUndefined();
    expect(applyScrollCorrection(500, 120, 80, { userCancelled: true, anchorInView: true })).toBeUndefined();
  });

  it("never produces an absolute scroll to 0 from a stale or first-card delta", () => {
    expect(applyScrollCorrection(132049, 105, -131944, { anchorInView: true })).toBeUndefined();
  });

  it("returns the delta for a small in-view layout shift", () => {
    expect(applyScrollCorrection(500, 120, 80, { anchorInView: true })).toBe(-40);
  });
});

describe("firstStepInSection / placeholder anchor", () => {
  const first = "h4060:riverglades:travel-4a6965";
  const feralas = "h4060:feralas:dungeon-754a75:off";
  const blocks = [
    { id: "riverglades", steps: [{ id: first }, { id: "other-early" }] },
    { id: "feralas-6", steps: [{ id: feralas }, { id: "h4060:feralas:dungeon-c72c74" }] },
  ];

  it("derives the anchor from the placeholder section under the viewport, not step 1", () => {
    expect(firstStepInSection(blocks, "feralas-6", [first, feralas])).toBe(feralas);
    expect(firstStepInSection(blocks, "feralas-6", [first, feralas])).not.toBe(first);
    expect(topVisiblePlaceholderId(
      [
        { id: "riverglades", top: -2000, bottom: -200 },
        { id: "feralas-6", top: 80, bottom: 400 },
      ],
      24,
      800,
    )).toBe("feralas-6");
  });

  it("returns undefined when no placeholder or section is under the viewport", () => {
    expect(firstStepInSection(blocks, undefined, [first, feralas])).toBeUndefined();
    expect(topVisiblePlaceholderId([{ id: "feralas-6", top: 900, bottom: 1200 }], 24, 800)).toBeUndefined();
  });
});

describe("placeholderFillCorrection", () => {
  const mid = "h4060:feralas:dungeon-754a75:off";
  const step1 = "h4060:riverglades:travel-4a6965";

  it("scrolls the first step card to the placeholder's recorded top when the section mounts", () => {
    // Estimate was short: card lands 800px lower than the placeholder was.
    expect(placeholderFillCorrection(80000, 120, 920, { firstStepId: mid, listFirstStepId: step1 })).toBe(800);
    // Estimate was tall: card lands 400px higher.
    expect(placeholderFillCorrection(80000, 120, -280, { firstStepId: mid, listFirstStepId: step1 })).toBe(-400);
  });

  it("does not correct when the user has scrolled, it already ran, or the target is step 1", () => {
    expect(placeholderFillCorrection(80000, 120, 920, { userCancelled: true, firstStepId: mid, listFirstStepId: step1 })).toBeUndefined();
    expect(placeholderFillCorrection(80000, 120, 920, { alreadyCorrected: true, firstStepId: mid, listFirstStepId: step1 })).toBeUndefined();
    expect(placeholderFillCorrection(80000, 120, 920, { firstStepId: step1, listFirstStepId: step1 })).toBeUndefined();
  });

  it("never produces an absolute scroll to y<=0", () => {
    expect(placeholderFillCorrection(200, 120, -500, { firstStepId: mid, listFirstStepId: step1 })).toBeUndefined();
  });
});

describe("mapAnchorAcrossVisibility", () => {
  const first = "h4060:riverglades:travel-4a6965";
  const off = "h4060:feralas:dungeon-754a75:off";
  const firstOn = "h4060:feralas:dungeon-754a75+dungeons:dire-maul:accept:7489";
  const laterOn = "h4060:feralas:dungeon-754a75+dungeons:dire-maul:accept:7441";
  const other = "h4060:feralas:dungeon-c72c74";
  const all = [first, firstOn, laterOn, off, other, "tail"];
  const onList = [first, firstOn, laterOn, other, "tail"];
  const offList = [first, off, "tail"];

  it("maps an :off stub to the first inserted step with the same prefix, not a later neighbour", () => {
    expect(mapAnchorAcrossVisibility(off, onList, all)).toBe(firstOn);
    expect(mapAnchorAcrossVisibility(off, onList, all)).not.toBe(other);
  });

  it("still maps an :off stub to the first inserted step when the stub is force-shown", () => {
    expect(mapAnchorAcrossVisibility(off, [first, off, firstOn, laterOn, other, "tail"], all)).toBe(firstOn);
  });

  it("maps an inserted dungeon step back to the :off stub (or the placeholder)", () => {
    expect(mapAnchorAcrossVisibility(firstOn, offList, all)).toBe(off);
    expect(mapAnchorAcrossVisibility(laterOn, offList, all)).toBe(off);
    expect(mapAnchorAcrossVisibility(firstOn, [first, "h4060:feralas:dungeon-754a75", "tail"], all)).toBe(
      "h4060:feralas:dungeon-754a75",
    );
  });

  it("falls back to the next surviving step in the old order, never to step 1", () => {
    const visible = [first, "tail"];
    expect(mapAnchorAcrossVisibility(off, visible, all)).toBe("tail");
    expect(mapAnchorAcrossVisibility("gone", visible, [first, "gone", "tail"])).toBe("tail");
    expect(mapAnchorAcrossVisibility(off, visible, all)).not.toBe(first);
  });

  it("keeps the id when it is still visible", () => {
    expect(mapAnchorAcrossVisibility(off, [off, "tail"], all)).toBe(off);
  });

  it("returns undefined rather than the first step when nothing else survives", () => {
    expect(mapAnchorAcrossVisibility(off, [first], all)).toBeUndefined();
    expect(mapAnchorAcrossVisibility(undefined, onList, all)).toBeUndefined();
  });
});

describe("wantsStartAtTop", () => {
  it("is true only for the next-guide link state", () => {
    expect(wantsStartAtTop(START_AT_TOP_STATE)).toBe(true);
    expect(wantsStartAtTop(null)).toBe(false);
    expect(wantsStartAtTop(undefined)).toBe(false);
    expect(wantsStartAtTop({ startAtTop: "yes" })).toBe(false);
  });
});
