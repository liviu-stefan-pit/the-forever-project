import { describe, expect, it } from "vitest";
import { gameSyncApplyIsCurrent, gameSyncStatusText, shouldResyncOnProfileChange, type GameSyncPhase } from "./gameSyncClient";
import type { GameSyncResult } from "./gameSync";

const character = {
  key: "Thrall",
  name: "Thrall",
  completedQuests: [1],
};

function ok(partial: Partial<Extract<GameSyncResult, { ok: true }>> = {}): GameSyncPhase {
  return {
    phase: "result",
    result: { ok: true, character, questIds: [1], newlyMarked: 0, ...partial },
  };
}

describe("shouldResyncOnProfileChange", () => {
  it("skips the initial mount and resyncs only when the profile id changes", () => {
    expect(shouldResyncOnProfileChange(undefined, "a")).toBe(false);
    expect(shouldResyncOnProfileChange(undefined, null)).toBe(false);
    expect(shouldResyncOnProfileChange("a", "a")).toBe(false);
    expect(shouldResyncOnProfileChange("a", "b")).toBe(true);
    expect(shouldResyncOnProfileChange("a", null)).toBe(true);
  });
});

describe("gameSyncApplyIsCurrent", () => {
  it("drops a file result that started under a different profile", () => {
    expect(gameSyncApplyIsCurrent("a", "a")).toBe(true);
    expect(gameSyncApplyIsCurrent("a", "b")).toBe(false);
    expect(gameSyncApplyIsCurrent("a", null)).toBe(false);
    expect(gameSyncApplyIsCurrent(null, null)).toBe(true);
  });
});

describe("gameSyncStatusText", () => {
  it("names each outcome", () => {
    expect(gameSyncStatusText({ phase: "syncing" })).toBe("Syncing");
    expect(gameSyncStatusText({ phase: "not-found" })).toBe("The GuideWebExport addon was not found. Install it, type /gwe in game, then /reload.");
    expect(gameSyncStatusText({ phase: "unreachable" })).toBe("Could not reach the local app server");
    expect(gameSyncStatusText({ phase: "unavailable" })).toMatch(/Import GuideWebExport\.lua on the Profile page/);
    expect(gameSyncStatusText({ phase: "result", result: { ok: false, reason: "no-profile" } })).toBe("No active profile");
    expect(
      gameSyncStatusText({
        phase: "result",
        result: { ok: false, reason: "name-mismatch", exportName: "Thrall", profileName: "Grom" },
      }),
    ).toBe("This profile is Grom; export has Thrall. Pick the character under Game sync on the Profile page.");
    expect(gameSyncStatusText({ phase: "result", result: { ok: false, reason: "empty" } })).toBe("No completed quests in the export");
    expect(gameSyncStatusText({ phase: "result", result: { ok: false, reason: "missing" } })).toBe("The GuideWebExport addon was not found. Install it, type /gwe in game, then /reload.");
    expect(gameSyncStatusText(ok({ newlyMarked: 0 }))).toBe("Up to date");
    expect(gameSyncStatusText(ok({ newlyMarked: 1 }))).toBe("Marked 1 quest");
    expect(gameSyncStatusText(ok({ newlyMarked: 3 }))).toBe("Marked 3 quests");
  });

  it("appends a preformatted export time when exportedAt is present", () => {
    const exportedAtText = "2020-01-02 03:04";
    const marked: GameSyncPhase = {
      phase: "result",
      exportedAtText,
      result: { ok: true, character, questIds: [1], newlyMarked: 2, exportedAt: 1_700_000_000 },
    };
    expect(gameSyncStatusText(marked)).toBe("Marked 2 quests · 2020-01-02 03:04");
    expect(
      gameSyncStatusText({
        phase: "result",
        exportedAtText,
        result: { ok: false, reason: "empty", exportedAt: 1_700_000_000 },
      }),
    ).toBe("No completed quests in the export · 2020-01-02 03:04");
    expect(
      gameSyncStatusText({
        phase: "result",
        exportedAtText,
        result: { ok: false, reason: "name-mismatch", exportName: "Thrall", profileName: "Grom", exportedAt: 50 },
      }),
    ).toBe("This profile is Grom; export has Thrall. Pick the character under Game sync on the Profile page. · 2020-01-02 03:04");
  });
});
