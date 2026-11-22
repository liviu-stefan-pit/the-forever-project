/**
 * Type-check published site JSON (`web/public/data/**`) against `contracts/schema.ts`.
 *
 *   node web/scripts/validate-data.ts
 *
 * Reuses `typecheckJson` (virtual `(json) satisfies Type`) so unions and tuples
 * stay literal. Quest shards are required and checked in slices — a single
 * large array literal overflows the TypeScript checker.
 * `npcs.min.json` has no contract type and is skipped.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { typecheckJson, type JsonCheck } from "./json-typecheck.ts";

const DATA = fileURLToPath(new URL("../public/data/", import.meta.url));
const QUEST_BATCH = 40;

function read(rel: string): string {
  return readFileSync(join(DATA, rel), "utf-8");
}

const checks: JsonCheck[] = [
  { name: "guide_index.json", json: read("guide_index.json"), type: "GuideIndex" },
  { name: "zones.json", json: read("zones.json"), type: "ZoneInfo[]" },
];

function loadShard(file: string, type: string): unknown[] {
  const single = join(DATA, file);
  if (!existsSync(single)) {
    console.error(`${file} not found`);
    process.exit(1);
  }
  const parsed: unknown = JSON.parse(read(file));
  if (!Array.isArray(parsed)) {
    console.error(`${file}: expected an array`);
    process.exit(1);
  }
  for (let i = 0; i < parsed.length; i += QUEST_BATCH) {
    const slice = parsed.slice(i, i + QUEST_BATCH);
    checks.push({
      name: `${file}[${i}..${i + slice.length - 1}]`,
      json: JSON.stringify(slice),
      type,
    });
  }
  return parsed;
}

const quests = loadShard("quests-min.json", "QuestMin[]");
loadShard("quests-geo.json", "QuestGeo[]");
loadShard("quests-detail.json", "QuestDetail[]");

const guideDir = join(DATA, "guides");
for (const f of readdirSync(guideDir).filter((n) => n.endsWith(".json")).sort()) {
  checks.push({ name: `guides/${f}`, json: read(`guides/${f}`), type: "Guide" });
}

const diagnostics: string[] = [];
const GROUP = 8;
for (let i = 0; i < checks.length; i += GROUP) {
  diagnostics.push(...typecheckJson(checks.slice(i, i + GROUP)));
}
if (diagnostics.length) {
  for (const d of diagnostics) console.error(d);
  console.error(`${diagnostics.length} diagnostic(s)`);
  process.exit(1);
}
console.log(`ok: ${checks.length} check(s) satisfy contracts/schema.ts (${quests.length} quests, batched)`);
