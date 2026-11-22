import { describe, expect, it } from "vitest";
import type { Profile } from "../data/schema";
import { summarizeProfileSync } from "../state/gameSync";
import { gameSyncStatusText } from "../state/gameSyncClient";
import { continentLabel, nextProfessionMilestone, trainerTierLabel } from "./characterReport";

describe("continentLabel", () => {
  it("names both Classic continent map ids", () => {
    expect(continentLabel(1414)).toBe("Kalimdor");
    expect(continentLabel(1415)).toBe("Eastern Kingdoms");
    expect(continentLabel(1463)).toBe("Eastern Kingdoms");
    expect(continentLabel(1464)).toBe("Kalimdor");
    expect(continentLabel(1945)).toBe("Outland");
    expect(continentLabel(9999)).toBe("Map 9999");
  });
});

describe("trainerTierLabel", () => {
  it("names the current cap and the next trainer rank", () => {
    expect(trainerTierLabel(40, 75)).toBe("Apprentice · next Journeyman 150");
    expect(trainerTierLabel(50, 75)).toBe("Apprentice · next Journeyman 150 · Train next rank soon");
    expect(trainerTierLabel(140, 150)).toContain("Train next rank soon");
    expect(trainerTierLabel(300, 300)).toBe("Artisan");
  });
});

describe("nextProfessionMilestone", () => {
  const plan = [
    { profession: "Mining" as const, skillTarget: 65, note: "Copper" },
    { profession: "Mining" as const, skillTarget: 125, note: "Tin" },
    { profession: "Skinning" as const, skillTarget: 150, note: "Heavy" },
  ];
  it("picks the next target above the current rank", () => {
    expect(nextProfessionMilestone(plan, "Mining", 70)?.skillTarget).toBe(125);
    expect(nextProfessionMilestone(plan, "Mining", 125)).toBeUndefined();
    expect(nextProfessionMilestone(undefined, "Mining", 1)).toBeUndefined();
  });
});

describe("summarizeProfileSync", () => {
  const base = { questLog: [], flightPaths: [], skills: {}, hearth: "Razor Hill" } as unknown as Profile;
  it("lists quest, flight, skill, and hearth changes", () => {
    const next = {
      ...base,
      questLogSyncedAt: "t",
      questLog: [{ questId: 1 }, { questId: 2 }],
      flightPaths: [{ id: 3, name: "Crossroads" }],
      skills: { Mining: { cur: 65, max: 75 } },
      hearth: "The Crossroads",
    } as unknown as Profile;
    const prev = { ...base, skills: { Mining: { cur: 58, max: 75 } } } as unknown as Profile;
    expect(summarizeProfileSync(prev, next)).toBe(
      "quest log +2, 1 new flight path, Mining 58 to 65, hearth The Crossroads",
    );
  });
});

describe("gameSyncStatusText change summary", () => {
  it("appends the profile diff after the snapshot line", () => {
    const text = gameSyncStatusText({
      phase: "result",
      result: {
        ok: true,
        character: { key: "Thrall", name: "Thrall", completedQuests: [], level: 12 },
        questIds: [],
        newlyMarked: 0,
        snapshotApplied: true,
        changeSummary: "Mining 58 to 65",
      },
    });
    expect(text).toContain("Mining 58 to 65");
    expect(text.startsWith("Updated level 12")).toBe(true);
  });
});
