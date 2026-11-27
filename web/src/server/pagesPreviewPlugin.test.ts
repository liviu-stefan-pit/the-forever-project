import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { distFileUrl, hasDistFile, servesAppShell } from "./pagesPreviewPlugin.ts";

describe("pages preview routing", () => {
  it("keeps the shell only for quest, profile, transfer and bare /guide", () => {
    expect(servesAppShell("/quest/7844")).toBe(true);
    expect(servesAppShell("/profile")).toBe(true);
    expect(servesAppShell("/transfer/")).toBe(true);
    expect(servesAppShell("/guide")).toBe(true);
    expect(servesAppShell("/guide/durotar-1-12")).toBe(false);
    expect(servesAppShell("/wp-admin")).toBe(false);
  });

  it("treats a directory index as a real file", () => {
    const dist = mkdtempSync(join(tmpdir(), "preview-"));
    mkdirSync(join(dist, "guide", "durotar-1-12"), { recursive: true });
    writeFileSync(join(dist, "guide", "durotar-1-12", "index.html"), "<html></html>");
    writeFileSync(join(dist, "robots.txt"), "User-agent: *\n");
    expect(hasDistFile(dist, "/guide/durotar-1-12")).toBe(true);
    expect(distFileUrl(dist, "/guide/durotar-1-12")).toBe("/guide/durotar-1-12/index.html");
    expect(distFileUrl(dist, "/robots.txt")).toBe("/robots.txt");
    expect(hasDistFile(dist, "/wp-admin")).toBe(false);
  });
});
