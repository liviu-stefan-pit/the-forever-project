import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { discoverPacks, loadPack, segmentOfStep } from "./routeSource";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function tree(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "pf-routes-"));
  dirs.push(dir);
  for (const [rel, v] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, typeof v === "string" ? v : JSON.stringify(v));
  }
  return dir;
}

const step = (id: string, extra: Record<string, unknown> = {}) => ({ id, tags: {}, text: [], actions: [], conditions: [], ...extra });
const manifest = (id: string, segments: string[], extra: Record<string, unknown> = {}) => ({
  schema: "project-forever/route-manifest",
  version: 2,
  id,
  title: id,
  levels: [1, 12],
  ...extra,
  segments,
});
const segment = (pack: string, steps: unknown[], title = "Seg") => ({ schema: "project-forever/route-segment", pack, title, steps });

describe("segment folders", () => {
  it("joins segments in manifest order, fills n, keeps id first and n second", () => {
    const dir = tree({
      "p/pack.json": manifest("p", ["02-b.json", "01-a.json"], { next: "q" }),
      "p/01-a.json": segment("p", [step("p:a1"), step("p:a2")], "A"),
      "p/02-b.json": segment("p", [step("p:b1", { routes: ["balanced"] })], "B"),
    });
    const found = loadPack(join(dir, "p"));
    expect(found.pack.schema).toBe("project-forever/route");
    expect(found.pack.version).toBe(2);
    expect(found.pack.next).toBe("q");
    expect("segments" in found.pack).toBe(false);
    expect(found.pack.steps.map((s) => [s.id, s.n])).toEqual([
      ["p:b1", 1],
      ["p:a1", 2],
      ["p:a2", 3],
    ]);
    expect(Object.keys(found.pack.steps[0]!).slice(0, 3)).toEqual(["id", "n", "tags"]);
    expect(found.segments?.map((s) => [s.file, s.title, s.first, s.count])).toEqual([
      ["02-b.json", "B", 1, 1],
      ["01-a.json", "A", 2, 2],
    ]);
    expect(segmentOfStep(found, 3)?.file).toBe("01-a.json");
  });

  it("discovers single files and folders, and never reads segment files as packs", () => {
    const dir = tree({
      "a.json": { schema: "project-forever/route", version: 2, id: "a", steps: [step("a:1", { n: 1 })] },
      "notes.json": { other: true },
      "broken.json": "{ not json",
      "routes/p/pack.json": manifest("p", ["01-a.json"]),
      "routes/p/01-a.json": segment("p", [step("p:1")]),
      "tools/x.json": { schema: "project-forever/route", version: 2, id: "skipped", steps: [] },
    });
    const found = discoverPacks(dir);
    expect(found.map((f) => f.pack.id)).toEqual(["a", "p"]);
    expect(found[1]!.path).toBe(join(dir, "routes/p/pack.json"));
  });

  it.each([
    ["an unlisted segment file", { "p/pack.json": manifest("p", ["01-a.json"]), "p/01-a.json": segment("p", [step("p:1")]), "p/02-b.json": segment("p", []) }, /not listed/],
    ["a missing segment", { "p/pack.json": manifest("p", ["01-a.json", "02-b.json"]), "p/01-a.json": segment("p", [step("p:1")]) }, /missing/],
    ["a segment for another pack", { "p/pack.json": manifest("p", ["01-a.json"]), "p/01-a.json": segment("other", [step("p:1")]) }, /segment says pack other/],
    ["a step with n", { "p/pack.json": manifest("p", ["01-a.json"]), "p/01-a.json": segment("p", [step("p:1", { n: 1 })]) }, /leave it out/],
    ["steps in the manifest", { "p/pack.json": { ...manifest("p", ["01-a.json"]), steps: [] }, "p/01-a.json": segment("p", []) }, /steps belong/],
    ["a broken segment", { "p/pack.json": manifest("p", ["01-a.json"]), "p/01-a.json": "{ nope" }, /cannot read segment/],
  ])("fails on %s", (_name, files, msg) => {
    const dir = tree(files);
    expect(() => discoverPacks(dir)).toThrow(msg);
  });
});

describe("the real research folder", () => {
  it("loads every pack as a segment folder with unique ids and contiguous n", () => {
    const research = fileURLToPath(new URL("../../research/", import.meta.url));
    const found = discoverPacks(research);
    const ids = found.map((f) => f.pack.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(found.length).toBe(23); // 22 leveling packs + the dungeons pack
    for (const f of found) {
      expect(f.segments?.length, String(f.pack.id)).toBeGreaterThan(1);
      expect(f.pack.steps.map((s) => s.n)).toEqual(f.pack.steps.map((_, i) => i + 1));
      for (const seg of f.segments!) expect(seg.count, `${String(f.pack.id)} ${seg.file}`).toBeGreaterThan(0);
    }
    expect(found.find((f) => f.pack.id === "horde-dungeons-15-60")?.path.replaceAll("\\", "/")).toContain("routes/dungeons/");
  });
});
