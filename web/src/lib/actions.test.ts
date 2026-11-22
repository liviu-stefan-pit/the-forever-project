import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Guide, Step } from "../data/schema";
import { defaultStepVisibility } from "../state/visibility";
import { memoryProgressReducer } from "../state/progress";
import { actionChip, gotoSummary, stepQuestIds, wayCommand } from "./actions";
import { formatFilter } from "./filter";
import { parseRange, prettifySlug } from "./levels";

const guide = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../contracts/fixtures/guides/1-6-durotar.json", import.meta.url)), "utf-8"),
) as Guide;

describe("actionChip", () => {
  it("gives every non-goto action in the fixture a chip", () => {
    for (const s of guide.steps)
      s.actions.forEach((a, i) => {
        const c = actionChip(a, i);
        if (a.type === "goto") expect(c).toBeNull();
        else expect(c, a.type).not.toBeNull();
      });
  });

  it("links quest chips to /quest/:id and prefers the Questie name", () => {
    const c = actionChip({ type: "accept", questId: 788, label: "Accept Cutting Teeth" }, 0);
    expect(c).toMatchObject({ verb: "Accept", text: "Cutting Teeth", to: "/quest/788" });
    const named = actionChip({ type: "turnin", questId: 4641, label: "Turn in Your Place" }, 0, () => "Your Place In The World");
    expect(named).toMatchObject({ verb: "Turn in", text: "Your Place In The World" });
  });

  it("formats XP targets and keeps line filters", () => {
    expect(actionChip({ type: "xp", level: 3, extra: 685, label: "Grind" }, 0)?.text).toBe("Level 3 + 685");
    const f = { any: [[{ cls: "Warrior" as const }]] };
    expect(actionChip({ type: "train", spellId: 1, label: "Train Battle Shout", filter: f }, 0)).toMatchObject({ text: "Battle Shout", filter: f });
  });
});

describe("gotos", () => {
  it("hides /way for placeholder 0,0 coordinates", () => {
    expect(wayCommand({ mapId: 1411, x: 0, y: 0, zone: "Durotar", exact: false })).toBeUndefined();
    expect(wayCommand({ mapId: 1411, x: 43.29, y: 68.53, zone: "Durotar", exact: true })).toBe("/way Durotar 43.29 68.53");
  });

  it("counts hidden path waypoints separately", () => {
    const loop = guide.steps.find((s) => s.n === 10)!;
    expect(gotoSummary(loop.actions)).toEqual({ points: [], hiddenCount: 7 });
    const first = guide.steps[0]!;
    expect(gotoSummary(first.actions).points.map((p) => p.way)).toEqual(["/way Durotar 43.29 68.53"]);
  });
});

describe("misc helpers", () => {
  it("collects quest ids of a step", () => {
    expect(stepQuestIds(guide.steps.find((s) => s.n === 4)!)).toEqual([4641, 788]);
    expect(stepQuestIds(guide.steps.find((s) => s.bonus)!)).toEqual([97279]);
  });

  it("formats filters", () => {
    expect(formatFilter({ any: [[{ cls: "Warrior" }], [{ cls: "Shaman" }]] })).toBe("Warrior / Shaman");
    expect(formatFilter({ any: [[{ cls: "Warrior", not: true }, { cls: "Shaman", not: true }]] })).toBe("not Warrior · not Shaman");
    expect(formatFilter(undefined)).toBe("");
  });

  it("parses level ranges and slugs", () => {
    expect(parseRange("22-30")).toEqual([22, 30]);
    expect(prettifySlug("1-6-durotar")).toBe("1–6 Durotar");
    expect(prettifySlug("22-24-hillsbrad-foothills")).toBe("22–24 Hillsbrad Foothills");
    // No faction prefix, pack numbering or trailing range in reader-facing names.
    expect(prettifySlug("horde-20-40-03-stonetalon-ashenvale-hillsbrad")).toBe("Stonetalon Ashenvale Hillsbrad");
    expect(prettifySlug("barrens-12-20")).toBe("Barrens");
    expect(prettifySlug("zephras-isle")).toBe("Zephras Isle");
  });

  it("hides bonus steps only in Speedrun mode (P6 default visibility)", () => {
    const bonus = guide.steps.find((s) => s.bonus) as Step;
    expect(defaultStepVisibility(bonus, { routeStyle: "balanced" })).toEqual({ visible: true });
    expect(defaultStepVisibility(bonus, { routeStyle: "speedrun" })).toEqual({ visible: false, reason: "speedrun" });
    expect(defaultStepVisibility(guide.steps[0]!, { routeStyle: "speedrun" }).visible).toBe(true);
  });

  it("in-memory progress reducer toggles, bulk-sets and keeps the cursor", () => {
    let s = memoryProgressReducer({ done: new Set(), routeStyle: "balanced", revision: 0 }, { type: "toggle", id: "a" });
    expect([...s.done]).toEqual(["a"]);
    s = memoryProgressReducer(s, { type: "setDone", ids: ["a", "b"], done: false });
    expect(s.done.size).toBe(0);
    s = memoryProgressReducer(s, { type: "setCurrent", cursor: { guide: "g", step: "x" } });
    const same = memoryProgressReducer(s, { type: "setCurrent", cursor: { guide: "g", step: "x" } });
    expect(same).toBe(s);
    expect(s.revision).toBe(3);
  });
});
