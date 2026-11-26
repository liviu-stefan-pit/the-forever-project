import { describe, expect, it, vi } from "vitest";
import { fileHandleSupported, gameFileHandleMtime, handleFromDrop, readGameFileHandle, type GameFileHandle } from "./gameFileHandle";

function handle(opts: {
  permission?: "granted" | "prompt" | "denied";
  afterRequest?: "granted" | "prompt" | "denied";
  error?: string;
  text?: string;
  mtime?: number;
}): GameFileHandle & { requestPermission: ReturnType<typeof vi.fn> } {
  let perm = opts.permission ?? "granted";
  return {
    kind: "file",
    name: "GuideWebExport.lua",
    getFile: async () => {
      if (opts.error) throw Object.assign(new Error(opts.error), { name: opts.error });
      return { text: async () => opts.text ?? "GuideWebExportDB = {}", lastModified: opts.mtime ?? 42 };
    },
    queryPermission: async () => perm,
    requestPermission: vi.fn(async () => {
      perm = opts.afterRequest ?? perm;
      return perm;
    }),
  };
}

describe("readGameFileHandle", () => {
  it("reads the file when access is granted", async () => {
    expect(await readGameFileHandle(handle({ text: "x", mtime: 7 }), false)).toEqual({ kind: "file", text: "x", mtimeMs: 7 });
  });

  it("does not prompt on background reads", async () => {
    const h = handle({ permission: "prompt", afterRequest: "granted" });
    expect(await readGameFileHandle(h, false)).toEqual({ kind: "needs-permission" });
    expect(h.requestPermission).not.toHaveBeenCalled();
  });

  it("asks for access when requested from a click", async () => {
    const h = handle({ permission: "prompt", afterRequest: "granted" });
    expect((await readGameFileHandle(h, true)).kind).toBe("file");
    expect(h.requestPermission).toHaveBeenCalledOnce();
  });

  it("reports a moved or deleted file", async () => {
    expect(await readGameFileHandle(handle({ error: "NotFoundError" }), false)).toEqual({ kind: "not-found" });
    expect(await readGameFileHandle(handle({ error: "NotReadableError" }), false)).toEqual({ kind: "unreachable" });
  });
});

describe("gameFileHandleMtime", () => {
  it("returns the last-modified time only without a prompt", async () => {
    expect(await gameFileHandleMtime(handle({ mtime: 99 }))).toBe(99);
    expect(await gameFileHandleMtime(handle({ permission: "prompt" }))).toBeNull();
    expect(await gameFileHandleMtime(handle({ error: "NotFoundError" }))).toBeNull();
  });
});

describe("fileHandleSupported", () => {
  it("is false in Node (no picker)", () => {
    expect(fileHandleSupported()).toBe(false);
  });
});

describe("handleFromDrop", () => {
  it("returns the dropped file's handle", async () => {
    const h = handle({});
    const items = [{ kind: "string" }, { kind: "file", getAsFileSystemHandle: async () => h }];
    expect(await handleFromDrop(items)).toBe(h);
  });

  it("resolves null without handle support, for a directory, or on a rejection", async () => {
    expect(await handleFromDrop([{ kind: "file" }])).toBeNull();
    expect(await handleFromDrop([{ kind: "file", getAsFileSystemHandle: async () => ({ kind: "directory" }) }])).toBeNull();
    expect(await handleFromDrop([{ kind: "file", getAsFileSystemHandle: () => Promise.reject(new Error("no")) }])).toBeNull();
    expect(await handleFromDrop(null)).toBeNull();
  });
});
