import { describe, expect, it } from "vitest";
import type { Filter, Step } from "../data/schema";
import { createProfileEvaluator, matchesFilter } from "./visibility";

const orcWarrior = { race: "Orc" as const, cls: "Warrior" as const };

function step(partial: Partial<Step> & { id: string }): Step {
  return {
    n: 1,
    tags: {},
    text: [],
    actions: [],
    conditions: [],
    ...partial,
  };
}

describe("matchesFilter", () => {
  it("treats a missing or empty filter as matching everyone", () => {
    expect(matchesFilter(undefined, orcWarrior)).toBe(true);
    expect(matchesFilter({ any: [] }, orcWarrior)).toBe(true);
  });

  it("matches a race term and rejects the wrong race", () => {
    const orc: Filter = { any: [[{ race: "Orc" }]] };
    expect(matchesFilter(orc, orcWarrior)).toBe(true);
    expect(matchesFilter(orc, { race: "Tauren", cls: "Warrior" })).toBe(false);
  });

  it("matches a class term and rejects the wrong class", () => {
    const hunter: Filter = { any: [[{ cls: "Hunter" }]] };
    expect(matchesFilter(hunter, { race: "Orc", cls: "Hunter" })).toBe(true);
    expect(matchesFilter(hunter, orcWarrior)).toBe(false);
  });

  it("ANDs terms inside a group (Orc Warrior)", () => {
    const f: Filter = { any: [[{ race: "Orc" }, { cls: "Warrior" }]] };
    expect(matchesFilter(f, orcWarrior)).toBe(true);
    expect(matchesFilter(f, { race: "Orc", cls: "Hunter" })).toBe(false);
    expect(matchesFilter(f, { race: "Troll", cls: "Warrior" })).toBe(false);
  });

  it("ORs groups (Warrior / Shaman)", () => {
    const f: Filter = { any: [[{ cls: "Warrior" }], [{ cls: "Shaman" }]] };
    expect(matchesFilter(f, orcWarrior)).toBe(true);
    expect(matchesFilter(f, { race: "Orc", cls: "Shaman" })).toBe(true);
    expect(matchesFilter(f, { race: "Orc", cls: "Mage" })).toBe(false);
  });

  it("honours not on a term", () => {
    const notHunter: Filter = { any: [[{ cls: "Hunter", not: true }]] };
    expect(matchesFilter(notHunter, orcWarrior)).toBe(true);
    expect(matchesFilter(notHunter, { race: "Orc", cls: "Hunter" })).toBe(false);
  });

  it("matches every filter when no character is set (P6 default)", () => {
    const hunter: Filter = { any: [[{ cls: "Hunter" }]] };
    expect(matchesFilter(hunter, {})).toBe(true);
    expect(matchesFilter(hunter, undefined)).toBe(true);
  });
});

describe("dungeon conditions", () => {
  it("hides a positive .dungeon step (cmd dungeon, args without !)", () => {
    const s = step({
      id: "g:rfc",
      conditions: [{ cmd: "dungeon", args: "RFC", label: "Only if you run RFC" }],
    });
    const vis = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced" });
    expect(vis.step(s)).toEqual({ visible: false, reason: "dungeons" });
    const on = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced", dungeons: true });
    expect(on.step(s)).toEqual({ visible: true });
  });

  it("hides a negated .dungeon step when dungeons are on", () => {
    const s = step({ id: "g:skip-rfc", conditions: [{ cmd: "dungeon", args: "!RFC", label: "skip" }] });
    const on = createProfileEvaluator({ routeStyle: "balanced", dungeons: true });
    expect(on.step(s)).toEqual({ visible: false, reason: "dungeons" });
  });

  it("v2 dungeon / dungeonsOff fields follow options.dungeons", () => {
    const d = step({ id: "g:wc", dungeon: { name: "Wailing Caverns" } });
    const alt = step({ id: "g:wc-alt", dungeonsOff: true });
    const off = createProfileEvaluator({ routeStyle: "speedrun" });
    const on = createProfileEvaluator({ routeStyle: "speedrun", dungeons: true });
    expect(off.step(d).reason).toBe("dungeons");
    expect(off.step(alt).visible).toBe(true);
    expect(on.step(d).visible).toBe(true);
    expect(on.step(alt).reason).toBe("dungeons");
    expect(on.key).not.toBe(off.key);
  });

  it("hides dungeonsOffRoutes only for the listed style while dungeons are on", () => {
    const s = step({ id: "g:ow", dungeonsOffRoutes: ["speedrun"], tags: { dungeonPart: "pickup" } });
    const speedOn = createProfileEvaluator({ routeStyle: "speedrun", dungeons: true });
    const balOn = createProfileEvaluator({ routeStyle: "balanced", dungeons: true });
    const speedOff = createProfileEvaluator({ routeStyle: "speedrun", dungeons: false });
    expect(speedOn.step(s)).toEqual({ visible: false, reason: "dungeons" });
    expect(balOn.step(s)).toEqual({ visible: true });
    expect(speedOff.step(s)).toEqual({ visible: true });
  });

  it("shows a negated .dungeon step (args start with !)", () => {
    const s = step({
      id: "g:skip-brd",
      conditions: [{ cmd: "dungeon", args: "!BRD", label: "Only if you skip BRD" }],
    });
    const vis = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced" });
    expect(vis.step(s)).toEqual({ visible: true });
  });
});

describe("createProfileEvaluator", () => {
  it("hides #optional steps when showOptional is false", () => {
    const s = step({ id: "g:opt", tags: { optional: true } });
    const vis = createProfileEvaluator({
      race: "Orc",
      cls: "Warrior",
      routeStyle: "balanced",
      showOptional: false,
    });
    expect(vis.step(s)).toEqual({ visible: false, reason: "optional" });
  });

  it("hides bonus steps in speedrun, not in balanced", () => {
    const s = step({ id: "g:bonus", bonus: { questIds: [1], xp: 10, why: "x" } });
    const speedrun = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "speedrun" });
    const bal = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced" });
    expect(speedrun.step(s)).toEqual({ visible: false, reason: "speedrun" });
    expect(bal.step(s)).toEqual({ visible: true });
  });

  it("hides line-level << text that does not match the character", () => {
    const vis = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced" });
    expect(vis.line({ any: [[{ cls: "Hunter" }]] })).toBe(false);
    expect(vis.line({ any: [[{ cls: "Warrior" }]] })).toBe(true);
    expect(vis.line(undefined)).toBe(true);
  });

  it("hides done steps when hideDone is on (reason done)", () => {
    const s = step({ id: "g:a" });
    const vis = createProfileEvaluator({
      race: "Orc",
      cls: "Warrior",
      routeStyle: "balanced",
      hideDone: true,
      isDone: (id) => id === "g:a",
    });
    expect(vis.step(s)).toEqual({ visible: false, reason: "done" });
  });

  it("includes revision in key but omits it from layoutKey unless hideDone is on", () => {
    const a = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced", revision: 1 });
    const b = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced", revision: 2 });
    expect(a.key).not.toBe(b.key);
    expect(a.key.endsWith(":1")).toBe(true);
    expect(b.key.endsWith(":2")).toBe(true);
    expect(a.layoutKey).toBe(b.layoutKey);
    expect(a.layoutKey.endsWith(":1")).toBe(false);
    expect(a.layoutKey.endsWith(":2")).toBe(false);

    const hide1 = createProfileEvaluator({
      race: "Orc",
      cls: "Warrior",
      routeStyle: "balanced",
      hideDone: true,
      revision: 1,
    });
    const hide2 = createProfileEvaluator({
      race: "Orc",
      cls: "Warrior",
      routeStyle: "balanced",
      hideDone: true,
      revision: 2,
    });
    expect(hide1.layoutKey).not.toBe(hide2.layoutKey);
    expect(hide1.layoutKey.endsWith(":1")).toBe(true);
    expect(hide2.layoutKey.endsWith(":2")).toBe(true);
  });

  it("changes layoutKey when hideDone flips", () => {
    const shown = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced", hideDone: false });
    const hidden = createProfileEvaluator({ race: "Orc", cls: "Warrior", routeStyle: "balanced", hideDone: true });
    expect(shown.layoutKey).not.toBe(hidden.layoutKey);
    expect(shown.key).not.toBe(hidden.key);
  });
});
