import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Guide, GuideIndex, QuestInfo, ZoneInfo } from "../data/schema";
import { buildSearchDocs } from "./build";
import { createSearchEngine, searchResultPath, searchDocs } from "./query";

const FIX = fileURLToPath(new URL("../../../contracts/fixtures/", import.meta.url));
const read = (rel: string) => readFileSync(FIX + rel, "utf-8");
const index = JSON.parse(read("guide_index.json")) as GuideIndex;
const quests = JSON.parse(read("quests.json")) as QuestInfo[];
const zones = JSON.parse(read("zones.json")) as ZoneInfo[];
const guide = JSON.parse(read("guides/1-6-durotar.json")) as Guide;

const docs = buildSearchDocs({
  index,
  guides: [guide],
  quests,
  zones,
  npcs: [{ id: 3143, name: "Gornek", spawns: [{ zone: "Durotar" }] }],
});

describe("buildSearchDocs", () => {
  it("indexes guides, clipped steps, quests, zones and npcs without raw source", () => {
    const kinds = new Set(docs.map((d) => d.kind));
    expect([...kinds].sort()).toEqual(["guide", "npc", "quest", "step", "zone"]);
    expect(docs.find((d) => d.kind === "guide" && d.id === "1-6-durotar")?.title).toMatch(/Durotar/i);
    expect(docs.find((d) => d.kind === "quest" && d.id === "788")?.title).toBe("Cutting Teeth");
    expect(docs.some((d) => (d.text ?? "").includes(".goto"))).toBe(false);
    const step = docs.find((d) => d.kind === "step")!;
    expect(step.text).toBeUndefined();
    expect(step.title.length).toBeLessThanOrEqual(180);
    expect(step.guide).toBe("1-6-durotar");
  });
});

describe("searchDocs", () => {
  const engine = createSearchEngine(docs);

  it("returns a known fixture hit", () => {
    const hits = searchDocs(engine, "Cutting Teeth");
    expect(hits.some((h) => h.kind === "quest" && h.id === "788")).toBe(true);
  });

  it("does not throw on an empty query", () => {
    expect(() => searchDocs(engine, "")).not.toThrow();
    expect(searchDocs(engine, "   ")).toEqual([]);
  });

  it("finds a prefix under four characters without fuzzy", () => {
    const hits = searchDocs(engine, "Cut");
    expect(hits.some((h) => h.kind === "quest" && h.id === "788")).toBe(true);
  });

  it("treats a missing text field as the title", () => {
    const bare = createSearchEngine([{ kind: "quest", id: "788", title: "Cutting Teeth", guide: "" }]);
    const hits = searchDocs(bare, "Teeth");
    expect(hits[0]?.text).toBe("Cutting Teeth");
  });
});

describe("searchResultPath", () => {
  it("navigates guide, step, quest, and zone results", () => {
    expect(searchResultPath({ kind: "guide", id: "1-6-durotar", title: "1–6 Durotar", guide: "", text: "" })).toBe(
      "/guide/1-6-durotar",
    );
    expect(
      searchResultPath({
        kind: "step",
        id: "1-6-durotar:abc:0",
        title: "Accept",
        guide: "1-6-durotar",
        text: "",
      }),
    ).toBe("/guide/1-6-durotar?step=1-6-durotar%3Aabc%3A0");
    expect(searchResultPath({ kind: "quest", id: "788", title: "Cutting Teeth", guide: "", text: "" })).toBe("/quest/788");
    expect(searchResultPath({ kind: "zone", id: "1411", title: "Durotar", guide: "1-6-durotar", text: "" })).toBe(
      "/guide/1-6-durotar",
    );
    expect(searchResultPath({ kind: "npc", id: "3143", title: "Gornek", guide: "", text: "Durotar" })).toBe("/overview");
  });
});
