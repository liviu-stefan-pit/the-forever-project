import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { GuideIndex, Insights } from "../data/schema";
import { groupOverviewNotes, issueHref, overviewIssues, overviewZoneMatch } from "./overview";

const insights = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/insights.json", import.meta.url)), "utf-8"),
) as Insights;
const index = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/guide_index.json", import.meta.url)), "utf-8"),
) as GuideIndex;

describe("issueHref", () => {
  it("links to a guide step or quest when those ids exist", () => {
    const withStep = insights.issues.find((i) => i.step && i.guide)!;
    expect(issueHref(withStep)).toBe(`/guide/${withStep.guide}?step=${encodeURIComponent(withStep.step!)}`);
    const withQuest = insights.issues.find((i) => i.questId)!;
    expect(issueHref(withQuest)).toBe(`/quest/${withQuest.questId}`);
    expect(issueHref({ severity: "info", msg: "orphan" })).toBeUndefined();
  });
});

describe("overviewIssues", () => {
  it("returns an empty list for missing or empty insights instead of throwing", () => {
    expect(overviewIssues(undefined)).toEqual([]);
    expect(overviewIssues({ added: {}, nearMisses: {}, issues: [] })).toEqual([]);
    expect(overviewIssues(insights).length).toBe(insights.issues.length);
  });
});

describe("overviewZoneMatch", () => {
  it("matches a zone filter against guide zones or the slug", () => {
    const slug = index.starts[0]!.firstGuide;
    expect(overviewZoneMatch(slug, ["Durotar"], "Durotar")).toBe(true);
    expect(overviewZoneMatch(slug, ["The Barrens"], "Durotar")).toBe(slug.includes("durotar"));
    expect(overviewZoneMatch("12-17-the-barrens", undefined, "Barrens")).toBe(true);
    expect(overviewZoneMatch(slug, ["Durotar"], "")).toBe(true);
  });
});

describe("groupOverviewNotes", () => {
  it("folds per-step notes into one entry per message, with guides and step-less quests", () => {
    const notes = groupOverviewNotes([
      { severity: "info", guide: "durotar-1-12", step: "d:1", msg: "Unchecked" },
      { severity: "info", guide: "durotar-1-12", step: "d:2", msg: "Unchecked" },
      { severity: "info", guide: "barrens-12-20", step: "b:9", msg: "Unchecked" },
      { severity: "warn", guide: "horde-20-40-03-x", questId: 79953, questName: "A Ludite's Guide", msg: "Left out" },
      { severity: "warn", guide: "horde-20-40-03-x", questId: 79953, msg: "Left out" },
    ]);
    expect(notes.map((n) => n.msg)).toEqual(["Left out", "Unchecked"]);
    expect(notes[0]!.questIds).toEqual([79953]);
    expect(notes[0]!.questNames).toEqual({ 79953: "A Ludite's Guide" });
    expect(notes[1]!.guides).toEqual([
      { slug: "durotar-1-12", count: 2, firstStep: "d:1" },
      { slug: "barrens-12-20", count: 1, firstStep: "b:9" },
    ]);
  });
});
