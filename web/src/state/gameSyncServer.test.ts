import { describe, expect, it, vi } from "vitest";
import { FILE_URL, STATUS_URL, isLocalAppHost, loadServerFile } from "./gameSyncServer";

function res(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => (typeof body === "string" ? JSON.parse(body) : body),
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

describe("loadServerFile", () => {
  it("downloads the file after the status finds it", async () => {
    const fetchFn = vi.fn(async (url: string) =>
      url === STATUS_URL ? res(200, { found: true, mtimeMs: 9, path: "C:\WoW\GuideWebExport.lua" }) : res(200, "GuideWebExportDB = {}"),
    );
    expect(await loadServerFile(fetchFn)).toEqual({ kind: "file", text: "GuideWebExportDB = {}", mtimeMs: 9, path: "C:\WoW\GuideWebExport.lua" });
    expect(fetchFn.mock.calls.map((c) => c[0])).toEqual([STATUS_URL, FILE_URL]);
  });

  it("does not download when the status finds nothing", async () => {
    const fetchFn = vi.fn(async () => res(200, { found: false }));
    expect(await loadServerFile(fetchFn)).toEqual({ kind: "not-found" });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("treats a static host's index.html as no server", async () => {
    expect(await loadServerFile(async () => res(200, "<!doctype html>"))).toEqual({ kind: "no-server" });
    expect(await loadServerFile(async () => res(404, {}))).toEqual({ kind: "no-server" });
    expect(await loadServerFile(() => Promise.reject(new Error("offline")))).toEqual({ kind: "no-server" });
  });
});

describe("isLocalAppHost", () => {
  it("only asks on this PC", () => {
    expect(isLocalAppHost("localhost")).toBe(true);
    expect(isLocalAppHost("127.0.0.1")).toBe(true);
    expect(isLocalAppHost("theforeverproject.com")).toBe(false);
  });
});
