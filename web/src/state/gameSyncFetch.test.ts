import { describe, expect, it } from "vitest";
import { GAME_FILE_REMINDER, gameSyncStatusText, gameSyncTitle, loadGameFile } from "./gameSyncClient";

function fakeFetch(routes: Record<string, { status: number; body: unknown } | "throw">) {
  const calls: string[] = [];
  const fn = async (url: string) => {
    calls.push(url);
    const r = routes[url];
    if (!r || r === "throw") throw new Error("network");
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: async () => r.body,
      text: async () => String(r.body),
    };
  };
  return { fn, calls };
}

describe("loadGameFile", () => {
  it("does not request the file when the status says there is none (no 404 on load)", async () => {
    const f = fakeFetch({ "/api/game-sync/status": { status: 200, body: { found: false, mtimeMs: null } } });
    expect(await loadGameFile(f.fn)).toEqual({ kind: "not-found" });
    expect(f.calls).toEqual(["/api/game-sync/status"]);
  });

  it("reports no server when the status endpoint is unreachable (static build)", async () => {
    const f = fakeFetch({ "/api/game-sync/status": "throw" });
    expect(await loadGameFile(f.fn)).toEqual({ kind: "no-server" });
    expect(f.calls).toEqual(["/api/game-sync/status"]);

    const g = fakeFetch({ "/api/game-sync/status": { status: 404, body: "" } });
    expect(await loadGameFile(g.fn)).toEqual({ kind: "no-server" });
    expect(g.calls).toEqual(["/api/game-sync/status"]);
  });

  it("reports no server when a static host answers the status with index.html (SPA fallback, 200)", async () => {
    const calls: string[] = [];
    const html = async (url: string) => {
      calls.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse("<!doctype html><html></html>") as unknown,
        text: async () => "<!doctype html><html></html>",
      };
    };
    expect(await loadGameFile(html)).toEqual({ kind: "no-server" });
    expect(calls).toEqual(["/api/game-sync/status"]);

    const odd = fakeFetch({ "/api/game-sync/status": { status: 200, body: { hello: "world" } } });
    expect(await loadGameFile(odd.fn)).toEqual({ kind: "no-server" });
  });

  it("treats a failed download after a good status as unreachable", async () => {
    const f = fakeFetch({ "/api/game-sync/status": { status: 200, body: { found: true, mtimeMs: 1 } }, "/api/game-sync": { status: 500, body: "" } });
    expect(await loadGameFile(f.fn)).toEqual({ kind: "unreachable" });
  });

  it("downloads the file only after the status found it", async () => {
    const f = fakeFetch({
      "/api/game-sync/status": { status: 200, body: { found: true, mtimeMs: 42 } },
      "/api/game-sync": { status: 200, body: "GuideWebExportDB = {}" },
    });
    expect(await loadGameFile(f.fn)).toEqual({ kind: "file", text: "GuideWebExportDB = {}", mtimeMs: 42 });
    expect(f.calls).toEqual(["/api/game-sync/status", "/api/game-sync"]);
  });

  it("treats a file deleted between status and download as not found", async () => {
    const f = fakeFetch({
      "/api/game-sync/status": { status: 200, body: { found: true, mtimeMs: 42 } },
      "/api/game-sync": { status: 404, body: "" },
    });
    expect(await loadGameFile(f.fn)).toEqual({ kind: "not-found" });
  });
});

describe("sync help text", () => {
  it("says the game writes SavedVariables only on /reload or logout", () => {
    expect(GAME_FILE_REMINDER).toMatch(/SavedVariables/);
    expect(GAME_FILE_REMINDER).toMatch(/only on \/reload or logout/);
    expect(gameSyncTitle({ phase: "not-found" })).toContain(GAME_FILE_REMINDER);
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
