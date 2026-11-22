import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildData } from "./build-data.ts";

/**
 * The quest data's product name may appear only in credits and `sources[]`, never in text the
 * site renders. Builds the real research packs and scans every rendered field. If this fails after
 * a generator re-run, run `python3 research/tools/display_text_scrub.py`.
 */
const NAME = /questie/i;
const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

/** Paths (a.b[3].c) of strings matching NAME, skipping `sources` subtrees. */
function hits(o: unknown, path: string, out: string[], onlyKeys?: Set<string>): void {
  if (Array.isArray(o)) o.forEach((v, i) => hits(v, `${path}[${i}]`, out, onlyKeys));
  else if (o && typeof o === "object") {
    for (const [k, v] of Object.entries(o)) {
      if (k === "sources") continue;
      if (typeof v === "string") {
        if ((!onlyKeys || onlyKeys.has(k)) && NAME.test(v)) out.push(`${path}.${k}: ${v.slice(0, 120)}`);
      } else hits(v, `${path}.${k}`, out, onlyKeys);
    }
  }
}

describe("rendered text never names the quest data source", () => {
  it("guides, search index and profession hook notes are clean", () => {
    const out = mkdtempSync(join(tmpdir(), "pf-display-"));
    buildData({ research: join(ROOT, "research"), out });
    const read = (p: string) => JSON.parse(readFileSync(join(out, p), "utf8")) as unknown;
    const found: string[] = [];
    for (const f of readdirSync(join(out, "guides")).filter((f) => f.endsWith(".json"))) hits(read(`guides/${f}`), `guides/${f}`, found);
    hits(read("search-index.json"), "search-index.json", found);
    hits(read("profession_hooks.json"), "profession_hooks.json", found, new Set(["note", "text", "t"]));
    expect(found).toEqual([]);
  }, 120_000);
});
