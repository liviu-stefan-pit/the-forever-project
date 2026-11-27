import { describe, expect, it } from "vitest";
import { GAME_FILE_REMINDER, gameSyncStatusText, gameSyncTitle } from "./gameSyncClient";

describe("sync help text", () => {
  it("says the game writes SavedVariables only on /reload or logout", () => {
    expect(GAME_FILE_REMINDER).toMatch(/SavedVariables/);
    expect(GAME_FILE_REMINDER).toMatch(/only on \/reload or logout/);
    expect(gameSyncTitle({ phase: "file-missing" })).toContain(GAME_FILE_REMINDER);
    expect(gameSyncTitle({ phase: "idle" })).toBe(GAME_FILE_REMINDER);
  });
});

describe("status text for realm-aware sync", () => {
  const character = { key: "Zugrok-Forever", name: "Zugrok", completedQuests: [1], level: 24, money: 289251 };
  it("names ambiguous and missing links", () => {
    expect(
      gameSyncStatusText({ phase: "result", result: { ok: false, reason: "ambiguous", exportName: "Zugrok", profileName: "Zugrok" } }),
    ).toBe("Zugrok exists on several realms, link a character on the Profile page");
    expect(
      gameSyncStatusText({ phase: "result", result: { ok: false, reason: "link-missing", linkKey: "Zugrok-Other" } }),
    ).toBe("Linked character Zugrok-Other is not in the export");
  });
  it("reports an applied snapshot", () => {
    expect(
      gameSyncStatusText({
        phase: "result",
        result: { ok: true, character, questIds: [1], newlyMarked: 1, snapshotApplied: true },
      }),
    ).toBe("Marked 1 quest · Updated level 24, 28g 92s 51c");
  });
});

describe("file-mode status text", () => {
  it("explains each hosted-site file state", () => {
    expect(gameSyncStatusText({ phase: "no-file" })).toMatch(/Choose GuideWebExport\.lua/);
    expect(gameSyncStatusText({ phase: "needs-permission" })).toMatch(/Click Sync/);
    expect(gameSyncStatusText({ phase: "file-missing" })).toMatch(/moved or deleted/);
    expect(gameSyncStatusText({ phase: "file-error" })).toMatch(/Could not read/);
  });
});

describe("local app status text", () => {
  it("tells the player to restart the local app instead of picking a file", () => {
    expect(gameSyncStatusText({ phase: "server-down" })).toMatch(/Restart run-app\.bat/);
    expect(gameSyncStatusText({ phase: "server-missing" })).toMatch(/found no GuideWebExport\.lua/);
  });
});

describe("stale export status text", () => {
  it("explains a skipped level-1 export", () => {
    expect(
      gameSyncStatusText({ phase: "result", result: { ok: false, reason: "stale-export", exportLevel: 1, profileLevel: 6 } }),
    ).toMatch(/export says level 1 but this profile is level 6.*\/reload/);
  });
});
