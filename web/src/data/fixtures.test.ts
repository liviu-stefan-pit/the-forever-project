import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { typecheckJson, type JsonCheck } from "../../scripts/json-typecheck";
import type { ActionType, Guide, GuideIndex, Insights, QuestInfo, ZoneInfo } from "./schema";

const FIXTURES = fileURLToPath(new URL("../../../contracts/fixtures/", import.meta.url));
const read = (rel: string) => readFileSync(FIXTURES + rel, "utf-8");
const guideFiles = readdirSync(FIXTURES + "guides").filter((f) => f.endsWith(".json"));

const checks: JsonCheck[] = [
  { name: "guide_index.json", json: read("guide_index.json"), type: "GuideIndex" },
  { name: "quests.json", json: read("quests.json"), type: "QuestInfo[]" },
  { name: "zones.json", json: read("zones.json"), type: "ZoneInfo[]" },
  { name: "insights.json", json: read("insights.json"), type: "Insights" },
  ...guideFiles.map((f) => ({ name: `guides/${f}`, json: read(`guides/${f}`), type: "Guide" })),
];

describe("contracts/fixtures conform to contracts/schema.ts", () => {
  it("type-checks every fixture with `satisfies`", () => {
    expect(typecheckJson(checks)).toEqual([]);
  }, 60_000);

  it("rejects a non-conforming document (checker sanity)", () => {
    const bad = typecheckJson([
      { name: "bad.json", json: '{"type": "teleport", "label": "x"}', type: "Action" },
      { name: "bad-zone.json", json: '{"mapId": 1, "areaId": 2, "name": "X", "continent": 2}', type: "ZoneInfo" },
    ]);
    expect(bad.some((e) => e.startsWith("bad.json"))).toBe(true);
    expect(bad.some((e) => e.startsWith("bad-zone.json"))).toBe(true);
  }, 60_000);
});

describe("fixture integrity", () => {
  const index = JSON.parse(read("guide_index.json")) as GuideIndex;
  const quests = JSON.parse(read("quests.json")) as QuestInfo[];
  const zones = JSON.parse(read("zones.json")) as ZoneInfo[];
  JSON.parse(read("insights.json")) as Insights;
  const guides = guideFiles.map((f) => JSON.parse(read(`guides/${f}`)) as Guide);
  const guideBySlug = new Map(guides.map((g) => [g.slug, g]));

  it("index references existing guides", () => {
    for (const b of index.brackets) for (const slug of b.guides) expect(guideBySlug.has(slug)).toBe(true);
    for (const s of index.starts) expect(guideBySlug.has(s.firstGuide)).toBe(true);
  });

  it("guides are internally consistent", () => {
    for (const g of guides) {
      const ids = g.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      g.steps.forEach((s, i) => expect(s.n).toBe(i + 1));
      for (const sec of g.sections) {
        expect(ids).toContain(sec.firstStep);
        expect(ids).toContain(sec.lastStep);
        expect(zones.some((z) => z.mapId === sec.mapId)).toBe(true);
        for (const stop of sec.stops) for (const sid of stop.steps) expect(ids).toContain(sid);
      }
    }
  });

  it("covers every Action type", () => {
    const all: ActionType[] = [
      "goto", "accept", "turnin", "complete", "collect", "train",
      "fly", "fp", "home", "hs", "zone", "subzone", "deathskip", "vendor", "trainer",
      "xp", "mob", "target", "unitscan", "use", "equip", "destroy", "link", "other",
    ];
    const seen = new Set(guides.flatMap((g) => g.steps.flatMap((s) => s.actions.map((a) => a.type))));
    expect([...all].filter((t) => !seen.has(t))).toEqual([]);
  });

  it("has bonus, mayBeSkipped and filtered steps", () => {
    const steps = guides.flatMap((g) => g.steps);
    expect(steps.some((s) => s.bonus)).toBe(true);
    expect(steps.some((s) => s.mayBeSkipped)).toBe(true);
    expect(steps.some((s) => s.filter)).toBe(true);
    expect(steps.some((s) => s.conditions.length > 0)).toBe(true);
  });

  it("key quests match QuestieDB", () => {
    const q = new Map(quests.map((x) => [x.id, x]));
    const ypitw = q.get(4641);
    expect(ypitw?.start[0]).toMatchObject({ id: 10176, name: "Kaltunk" });
    expect(ypitw?.start[0]?.at[0]).toMatchObject({ mapId: 1411, x: 43.29, y: 68.53 });
    expect(ypitw?.end[0]).toMatchObject({ id: 3143, name: "Gornek" });
    expect(q.get(788)?.name).toBe("Cutting Teeth");
    expect(q.get(97279)?.custom).toBe(true);
  });
});
