import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Guide, Step } from "../data/schema";
import { buildSectionItems, resolveCompleteWith, splitBySection, type SectionItem } from "./grouping";

const guide = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/guides/1-6-durotar.json", import.meta.url)), "utf-8"),
) as Guide;
const byN = (n: number) => guide.steps.find((s) => s.n === n)!;

function step(id: string, tags: Step["tags"] = {}): Step {
  return { id, n: 0, tags, text: [], actions: [], conditions: [] };
}
const shape = (items: SectionItem[]) =>
  items.map((it) => (it.kind === "hidden" ? `hidden(${it.steps.map((s) => s.id).join(",")})` : [...it.group.companions.map((c) => c.id), `>${it.group.main.id}`].join(" ")));

describe("splitBySection", () => {
  it("splits the fixture into Durotar and Orgrimmar in route order", () => {
    const blocks = splitBySection(guide);
    expect(blocks.map((b) => b.id)).toEqual(["durotar-1", "orgrimmar-1"]);
    expect(blocks.map((b) => b.steps.length)).toEqual([20, 4]);
    expect(blocks[0]!.section?.zone).toBe("Durotar");
  });

  it("puts unsectioned steps into their own block", () => {
    const blocks = splitBySection({ sections: [], steps: [step("a"), step("b")] });
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.section).toBeUndefined();
  });
});

describe("buildSectionItems (completeWith grouping)", () => {
  it("groups `completeWith: next` with the following step", () => {
    expect(shape(buildSectionItems([step("a", { completeWith: "next" }), step("b"), step("c")]))).toEqual(["a >b", ">c"]);
  });

  it("chains several companions onto one main step", () => {
    expect(shape(buildSectionItems([step("a", { completeWith: "next" }), step("b", { completeWith: "next" }), step("c")]))).toEqual(["a b >c"]);
  });

  it("groups `completeWith: <label>` only when the labelled step comes next", () => {
    const items = buildSectionItems([step("a", { completeWith: "Boss" }), step("b", { label: "Boss" })]);
    expect(shape(items)).toEqual(["a >b"]);
    const apart = buildSectionItems([step("a", { completeWith: "Boss" }), step("x"), step("b", { label: "Boss" })]);
    expect(shape(apart)).toEqual([">a", ">x", ">b"]);
  });

  it("keeps a trailing companion with no target as its own step", () => {
    expect(shape(buildSectionItems([step("a"), step("b", { completeWith: "next" })]))).toEqual([">a", ">b"]);
  });

  it("skips hidden steps when finding the target and emits them as hidden runs", () => {
    const steps = [step("a", { completeWith: "next" }), step("h1"), step("h2"), step("b")];
    const items = buildSectionItems(steps, (s) => !s.id.startsWith("h"));
    expect(shape(items)).toEqual(["hidden(h1,h2)", "a >b"]);
  });

  it("groups the fixture's Durotar section as expected", () => {
    const [durotar] = splitBySection(guide);
    const items = buildSectionItems(durotar!.steps);
    const groups = items.flatMap((i) => (i.kind === "group" ? [i.group] : []));
    const companionsOf = (n: number) => groups.find((g) => g.main.n === n)?.companions.map((c) => c.n);
    expect(companionsOf(3)).toEqual([2]); // kill boars while vendoring
    expect(companionsOf(15)).toEqual([14]); // summon imp
    expect(companionsOf(17)).toEqual([16]); // logout skip → death skip
    expect(companionsOf(20)).toEqual([19]); // hearth → Zureetha
    // `completeWith: "Tails"` targets a label that is not in this guide → stays standalone
    expect(groups.find((g) => g.main.n === 13)?.companions).toEqual([]);
    expect(groups).toHaveLength(20 - 4);
  });

  it("resolves an unresolved `completeWith` target", () => {
    expect(resolveCompleteWith(byN(13), guide.steps)).toEqual({ label: "Tails" });
    expect(resolveCompleteWith(byN(2), guide.steps)).toEqual({ label: "next step", stepId: byN(3).id });
    expect(resolveCompleteWith(byN(1), guide.steps)).toBeUndefined();
  });
});
