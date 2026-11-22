import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findGuideWebExport } from "./gameSyncPlugin.ts";

const dirs: string[] = [];

afterEach(() => {
  delete process.env.WOW_FOREVER_ROOT;
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), "gwe-"));
  dirs.push(dir);
  return dir;
}

function writeExport(wowRoot: string, account: string, body: string, mtimeMs: number): string {
  const path = join(wowRoot, "WTF", "Account", account, "SavedVariables", "GuideWebExport.lua");
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, body, "utf8");
  const when = new Date(mtimeMs);
  utimesSync(path, when, when);
  return path;
}

describe("findGuideWebExport", () => {
  it("picks the newer GuideWebExport.lua when several accounts exist", () => {
    const root = tempRoot();
    writeExport(root, "OldAccount", "old", 1_700_000_000_000);
    const newer = writeExport(root, "NewAccount", "new", 1_800_000_000_000);
    const hit = findGuideWebExport({ wowRoot: root });
    expect(hit?.path).toBe(newer);
    expect(hit?.bytes).toBe(Buffer.byteLength("new"));
    expect(hit?.mtimeMs).toBe(1_800_000_000_000);
  });

  it("returns the preferred path when that file exists", () => {
    const root = tempRoot();
    const older = writeExport(root, "A", "preferred-body", 1_700_000_000_000);
    writeExport(root, "B", "newer", 1_900_000_000_000);
    const hit = findGuideWebExport({ wowRoot: root, preferred: older });
    expect(hit?.path).toBe(older);
    expect(hit?.bytes).toBe(Buffer.byteLength("preferred-body"));
  });

  it("returns null when the saved-variables tree is missing", () => {
    const root = tempRoot();
    expect(findGuideWebExport({ wowRoot: root })).toBeNull();
  });

  it("uses WOW_FOREVER_ROOT instead of the real install", () => {
    const root = tempRoot();
    const path = writeExport(root, "EnvAccount", "from-env", 1_700_000_000_000);
    process.env.WOW_FOREVER_ROOT = root;
    const hit = findGuideWebExport();
    expect(hit?.path).toBe(path);
  });
});
