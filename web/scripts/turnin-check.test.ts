import { describe, expect, it } from "vitest";
import type { Step } from "../../contracts/schema.ts";
import { assertNoDuplicateTurnIns, findDuplicateTurnIns, mutuallyExclusive, stepRoutes, dungeonMode } from "./turnin-check.ts";
import * as vis from "../src/state/visibility.ts";

const SRC = [{ url: "https://example.com/t", label: "t" }];
function step(id: string, questId: number | null, extra: Partial<Step> = {}): Step {
  return {
    id,
    n: 1,
    tags: {},
    text: [],
    actions: questId === null ? [] : [{ type: "turnin", questId, label: `q${questId}` }],
    conditions: [],
    sources: SRC,
    verified: true,
    ...extra,
  };
}

describe("findDuplicateTurnIns", () => {
  it("reports a quest turned in by two packs on the same route, with packs and step ids", () => {
    const packs = [
      { id: "horde-20-40-07-swamp-riverglades", steps: [step("a:1", 193), step("a:2", 5)] },
      { id: "horde-40-60-01-riverglades-stv", steps: [step("b:1", 193)] },
    ];
    const d = findDuplicateTurnIns(packs, "balanced");
    expect(d).toEqual([{ route: "balanced", questId: 193, crossPack: true, packs: [{ pack: "horde-20-40-07-swamp-riverglades", steps: ["a:1"] }, { pack: "horde-40-60-01-riverglades-stv", steps: ["b:1"] }] }]);
    expect(() => assertNoDuplicateTurnIns(packs)).toThrow(/2 quest\(s\)|1 quest\(s\)/);
    expect(() => assertNoDuplicateTurnIns(packs)).toThrow(/\[balanced\] quest 193 turned in by horde-20-40-07-swamp-riverglades \(a:1\) and horde-40-60-01-riverglades-stv \(b:1\)[\s\S]*\[speedrun\] quest 193/);
  });

  it("fails on a within-pack duplicate too", () => {
    const d = findDuplicateTurnIns([{ id: "p", steps: [step("p:1", 7), step("p:2", 7)] }], "speedrun");
    expect(d).toEqual([{ route: "speedrun", questId: 7, crossPack: false, packs: [{ pack: "p", steps: ["p:1", "p:2"] }] }]);
  });

  it("uses schema route membership (routes; bonus → balanced only)", () => {
    const split = [{ id: "a", steps: [step("a:1", 9, { routes: ["balanced"] })] }, { id: "b", steps: [step("b:1", 9, { routes: ["speedrun"] })] }];
    expect(findDuplicateTurnIns(split, "balanced")).toEqual([]);
    expect(findDuplicateTurnIns(split, "speedrun")).toEqual([]);
    const bonus = [{ id: "a", steps: [step("a:1", 9, { bonus: { questIds: [9], xp: 1, why: "" } })] }, { id: "b", steps: [step("b:1", 9)] }];
    expect(findDuplicateTurnIns(bonus, "balanced")).toHaveLength(1);
    expect(findDuplicateTurnIns(bonus, "speedrun")).toEqual([]);
  });

  it("does not report mutually exclusive alternatives", () => {
    const steps = [
      step("dng", 1, { dungeon: { name: "Wailing Caverns" } }),
      step("off", 1, { dungeonsOff: true }),
      step("main", 2),
      step("alt", 2, { alternativeTo: ["main"] }),
      step("altA", 3, { alternativeTo: ["x"] }),
      step("altB", 3, { alternativeTo: ["x"] }),
      step("war", 4, { classes: ["Warrior"] }),
      step("mag", 4, { classes: ["Mage"] }),
      step("orc", 5, { filter: { any: [[{ race: "Orc" }]] } }),
      step("notorc", 5, { filter: { any: [[{ race: "Orc", not: true }]] } }),
      step("tank", 6, { roles: ["tank"] }),
      step("heal", 6, { roles: ["healer"] }),
      step("cdng", 8, { conditions: [{ cmd: "dungeon", args: "WC", label: "" }] }),
      step("cnot", 8, { conditions: [{ cmd: "dungeon", args: "!WC", label: "" }] }),
    ];
    expect(assertNoDuplicateTurnIns([{ id: "p", steps }])).toEqual([]);
  });

  it("still reports overlapping filters (dungeon step vs always-shown step, overlapping classes)", () => {
    expect(mutuallyExclusive(step("a", 1, { dungeon: { name: "RFC" } }), step("b", 1))).toBe(false);
    expect(mutuallyExclusive(step("a", 1, { classes: ["Warrior", "Mage"] }), step("b", 1, { classes: ["Mage"] }))).toBe(false);
    expect(mutuallyExclusive(step("a", 1, { filter: { any: [[{ race: "Orc" }]] } }), step("b", 1, { classes: ["Warrior"] }))).toBe(false);
  });

  it("skips packs declared exclusive (race starts)", () => {
    const packs = [{ id: "durotar-1-12", steps: [step("d", 840)] }, { id: "mulgore-1-12", steps: [step("m", 840)] }, { id: "barrens-12-20", steps: [step("b", 1)] }];
    expect(assertNoDuplicateTurnIns(packs, { exclusive: [["durotar-1-12", "mulgore-1-12"]] })).toEqual([]);
    expect(findDuplicateTurnIns([...packs, { id: "barrens-x", steps: [step("x", 840)] }], "balanced", { exclusive: [["durotar-1-12", "mulgore-1-12"]] })[0]!.packs.map((p) => p.pack)).toEqual([
      "durotar-1-12",
      "mulgore-1-12",
      "barrens-x",
    ]);
  });

  it("runs on one resolved/expanded pack", () => {
    expect(() => assertNoDuplicateTurnIns([{ id: "dungeons", steps: [step("x", 3520), step("y", 3520)] }], { label: "after expansion" })).toThrow(/^after expansion failed/);
  });

  it("mirrors stepRoutes / dungeonMode from src/state/visibility.ts", () => {
    const samples = [
      step("a", 1),
      step("b", 1, { routes: ["speedrun"] }),
      step("c", 1, { bonus: { questIds: [1], xp: 1, why: "" } }),
      step("d", 1, { dungeon: { name: "x" } }),
      step("e", 1, { dungeonsOff: true }),
      step("f", 1, { conditions: [{ cmd: "dungeon", args: " !x", label: "" }] }),
      step("g", 1, { conditions: [{ cmd: "dungeon", args: "x", label: "" }] }),
    ];
    for (const s of samples) {
      expect(stepRoutes(s)).toEqual(vis.stepRoutes(s));
      expect(dungeonMode(s)).toEqual(vis.dungeonMode(s));
    }
  });
});
