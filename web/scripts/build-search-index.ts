/**
 * Build `web/public/data/search-index.json` from published site data.
 *
 *   npm run search:index
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSearchDocs, type NpcMin } from "../src/search/build.ts";
import type { Guide, GuideIndex, QuestDetail, QuestInfo, QuestMin, ZoneInfo } from "../src/data/schema.ts";
import { hydrateQuestMin, overlayQuestDetail } from "../src/data/loader.ts";

const DATA = fileURLToPath(new URL("../public/data/", import.meta.url));
const OUT = join(DATA, "search-index.json");

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(DATA, rel), "utf-8")) as T;
}

const index = readJson<GuideIndex>("guide_index.json");
const questMin = readJson<QuestMin[]>("quests-min.json");
const questDetail = new Map(readJson<QuestDetail[]>("quests-detail.json").map((d) => [d.id, d]));
const quests: QuestInfo[] = questMin.map((q) => overlayQuestDetail(hydrateQuestMin(q), questDetail.get(q.id)));
const zones = readJson<ZoneInfo[]>("zones.json");
const guides = readdirSync(join(DATA, "guides"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => readJson<Guide>(`guides/${f}`));

let npcs: NpcMin[] | undefined;
if (existsSync(join(DATA, "npcs.min.json"))) {
  npcs = readJson<NpcMin[]>("npcs.min.json");
}

const docs = buildSearchDocs({ index, guides, quests, zones, npcs });
writeFileSync(OUT, JSON.stringify(docs));
console.log(`[search-index] ${docs.length} docs → ${OUT}`);
