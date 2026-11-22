import { describe, expect, it } from "vitest";
import type { Step } from "../../contracts/schema.ts";
import { checkPrereqs, findPrereqViolations, formatPrereqViolations, sequenceFor, validateAllowlist, type PrereqPack, type PrereqQuest } from "./prereq-check.ts";

const SRC = [{ url: "https://example.com/t", label: "t" }];
type A = Step["actions"][number];
const acc = (questId: number): A => ({ type: "accept", questId, label: "" });
const tin = (questId: number): A => ({ type: "turnin", questId, label: "" });
function step(id: string, actions: A[], extra: Partial<Step> = {}): Step {
  return { id, n: 1, tags: {}, text: [], actions, conditions: [], sources: SRC, verified: true, ...extra };
}
const pk = (id: string, levels: [number, number], steps: Step[], startZone?: string): PrereqPack => ({ id, levels, steps, ...(startZone ? { startZone } : {}) });

const quests: Record<string, PrereqQuest> = {
  "1": {},
  "2": { pre: { single: [1] } },
  "3": { pre: { group: [1, 2] } },
  "4": { pre: { single: [10, 11] } },
  "5": { pre: { single: [1] }, races: 32 }, // Tauren only
  "6": { pre: { single: [1] }, classes: 2 }, // Paladin only
  "10": {},
  "11": {},
};

describe("sequenceFor", () => {
  it("puts the race start pack first, then the other packs by level, without other start packs", () => {
    const packs = [pk("h4060", [40, 60], []), pk("barrens", [12, 20], []), pk("silverpine", [11, 15], []), pk("mulgore", [1, 12], [], "Mulgore"), pk("durotar", [1, 12], [], "Durotar"), pk("h2040", [20, 40], [])];
    expect(sequenceFor(packs, "Durotar").map((p) => p.id)).toEqual(["durotar", "silverpine", "barrens", "h2040", "h4060"]);
  });

  it("keeps the 20-60 sub-packs in play order when their minLevels would sort the other way", () => {
    const packs = [
      pk("horde-40-60-01-riverglades-stv", [20, 40], []),
      pk("horde-20-40-02-barrens-b", [24, 28], []),
      pk("horde-20-40-01-barrens-a", [24, 24], []),
      pk("barrens-12-20", [12, 20], []),
      pk("durotar", [1, 12], [], "Durotar"),
    ];
    expect(sequenceFor(packs, "Durotar").map((p) => p.id)).toEqual([
      "durotar",
      "barrens-12-20",
      "horde-20-40-01-barrens-a",
      "horde-20-40-02-barrens-b",
      "horde-40-60-01-riverglades-stv",
    ]);
  });
});

describe("findPrereqViolations", () => {
  it("passes when prerequisites are turned in earlier (also earlier in the same step, and in an earlier pack)", () => {
    const packs = [
      pk("start", [1, 12], [step("s1", [acc(1)]), step("s2", [tin(1), acc(2)])], "Durotar"),
      pk("next", [12, 20], [step("n1", [tin(2), acc(3)]), step("n2", [tin(10), acc(4)])]),
    ];
    expect(findPrereqViolations(packs, quests, { races: [{ race: "Orc", zone: "Durotar" }] })).toEqual([]);
  });

  it("any-of (single) needs one; all-of (group) lists the missing ones", () => {
    const packs = [pk("p", [1, 60], [step("a", [acc(1)]), step("b", [acc(4)]), step("c", [tin(1), acc(3)])])];
    const vs = findPrereqViolations(packs, quests, { races: [{ race: "Orc", zone: "Durotar" }], classes: ["Warrior"], routes: ["balanced"] });
    expect(vs.map((v) => [v.stepId, v.questId, v.kind, v.missingPre])).toEqual([
      ["b", 4, "single", [10, 11]],
      ["c", 3, "group", [2]],
    ]);
  });

  it("collapses identical errors across combos, routes and dungeon states", () => {
    const packs = [pk("p", [1, 60], [step("a", [acc(2)])])];
    const vs = findPrereqViolations(packs, quests);
    expect(vs).toHaveLength(1);
    expect(vs[0]!.routes).toEqual(["balanced", "speedrun"]);
    expect(vs[0]!.dungeons).toEqual(["on", "off"]);
    expect(vs[0]!.combos).toHaveLength(36);
    expect(formatPrereqViolations(vs)).toMatch(/\[balanced\+speedrun\] p step a: accept quest 2 before any of \[1\] is turned in — all races\/classes$/);
  });

  it("filters steps by route, class, race filter and dungeon toggle like the UI", () => {
    const packs = [
      pk("p", [1, 60], [
        step("speed", [acc(2)], { routes: ["speedrun"] }),
        step("mage", [acc(2)], { classes: ["Mage"] }),
        step("tauren", [acc(2)], { filter: { any: [[{ race: "Tauren" }]] } }),
        step("dng", [acc(2)], { dungeon: { name: "RFC" } }),
      ]),
    ];
    const vs = findPrereqViolations(packs, quests);
    const by = Object.fromEntries(vs.map((v) => [v.stepId, v]));
    expect(by.speed!.routes).toEqual(["speedrun"]);
    expect(by.mage!.combos.every((c) => c.endsWith("/Mage"))).toBe(true);
    expect(by.tauren!.combos.every((c) => c.startsWith("Tauren/"))).toBe(true);
    expect(by.dng!.dungeons).toEqual(["on"]);
    expect(formatPrereqViolations([by.mage!])).toMatch(/Orc \(Mage\); Troll \(Mage\); Tauren \(Mage\); Undead \(Mage\)/);
    expect(formatPrereqViolations([by.dng!])).toMatch(/dungeons on only/);
  });

  it("only walks the character's own start pack", () => {
    const packs = [pk("durotar", [1, 12], [step("d", [acc(2)])], "Durotar"), pk("mulgore", [1, 12], [step("m", [acc(1)]), step("m2", [tin(1)])], "Mulgore")];
    const vs = findPrereqViolations(packs, quests);
    expect(vs.map((v) => v.stepId)).toEqual(["d"]);
    expect(vs[0]!.combos.every((c) => c.startsWith("Orc/") || c.startsWith("Troll/"))).toBe(true);
  });

  it("skips quests the character's race/class mask excludes", () => {
    const vs = findPrereqViolations([pk("p", [1, 60], [step("a", [acc(5)]), step("b", [acc(6)])])], quests);
    expect(vs.find((v) => v.stepId === "a")!.combos.every((c) => c.startsWith("Tauren/"))).toBe(true);
    expect(vs.find((v) => v.stepId === "b")!.combos.every((c) => c.endsWith("/Paladin"))).toBe(true);
  });

  it("allowlist skips a confirmed-stale prerequisite", () => {
    const packs = [pk("p", [1, 60], [step("a", [acc(2)]), step("b", [acc(4)])])];
    const allowlist = validateAllowlist([{ questId: 4, missingPre: [10, 11], reason: "not required in Forever", source: "https://example.com/forever" }]);
    expect(findPrereqViolations(packs, quests, { allowlist }).map((v) => v.stepId)).toEqual(["a"]);
    expect(() => validateAllowlist([{ questId: 4, missingPre: 10, reason: "" , source: "x" }])).toThrow(/prereq-allowlist\.json\[0\]/);
  });

  it("modes: fail throws, warn returns, off skips", () => {
    const packs = [pk("p", [1, 60], [step("a", [acc(2)])])];
    expect(() => checkPrereqs(packs, quests)).toThrow(/quest prerequisite check failed: 1 violation/);
    expect(checkPrereqs(packs, quests, { mode: "warn" })).toHaveLength(1);
    expect(checkPrereqs(packs, quests, { mode: "off" })).toEqual([]);
  });
});
