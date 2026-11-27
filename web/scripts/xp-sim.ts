/**
 * Attach derived `step.sim` onto built guides and write the XP report.
 *
 *   node --experimental-strip-types scripts/xp-sim.ts [--data DIR] [--out DIR]
 *   node --experimental-strip-types scripts/xp-sim.ts --only <packId> --enter-level <n>
 *   npm run xp:sim
 *
 * Reads `web/public/data/guides/*.json` (after `build-data`) plus
 * `content/questie-db/quests.json` / `npcs.json` / `items.json` and `content/game-data/quest-xp-overrides.json`.
 * Does not rewrite research packs. `--only` walks one pack from `--enter-level` (default: pack minLevel)
 * and does not rewrite other guide files.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Guide } from "../../contracts/schema.ts";
import { HORDE_20_60_PACKS, LAST_20_40_PACK, LAST_40_60_PACK, horde2060Index } from "../src/lib/xp/leveling-chain.ts";
import { xpToNext } from "../src/lib/xp/rules.ts";
import {
  applySimToGuides,
  formatReportMarkdown,
  ROUTES,
  simulateGuides,
  simulateWalk,
  stepVisibleDungeonsOff,
  type QuestXpOverride,
  type SimItem,
  type SimNpc,
  type SimQuest,
  type SimReport,
} from "../src/lib/xp/simulate.ts";

import { loadTpfDb, mergeQuestDb, type MergeableDb } from "./tpf-db.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

export function loadSimTables(root = ROOT): {
  quests: Map<number, SimQuest>;
  npcs: Map<number, SimNpc>;
  items: Map<number, SimItem>;
  overrides: Record<string, QuestXpOverride>;
} {
  const itemsPath = join(root, "content/questie-db/items.json");
  const zonesPath = join(root, "content/questie-db/zones.json");
  // QuestieDB with tpf-db on top (same merge as the data build), so quests only tpf-db knows still give XP.
  const merged = mergeQuestDb(
    {
      quests: readJson<MergeableDb["quests"]>(join(root, "content/questie-db/quests.json")),
      npcs: readJson<MergeableDb["npcs"]>(join(root, "content/questie-db/npcs.json")),
      objects: {},
      items: existsSync(itemsPath) ? readJson<MergeableDb["items"]>(itemsPath) : {},
      zones: existsSync(zonesPath) ? readJson<MergeableDb["zones"]>(zonesPath) : {},
    },
    loadTpfDb(join(root, "content/tpf-db")),
  );
  const questsRaw = merged.quests as unknown as Record<string, SimQuest>;
  const npcsRaw = merged.npcs as unknown as Record<string, SimNpc>;
  const itemsRaw = merged.items as unknown as Record<string, SimItem>;
  const ovPath = join(root, "content/game-data/quest-xp-overrides.json");
  const overrides = existsSync(ovPath) ? readJson<Record<string, QuestXpOverride>>(ovPath) : {};
  const quests = new Map<number, SimQuest>();
  for (const q of Object.values(questsRaw)) {
    if (q && typeof q.id === "number") quests.set(q.id, q);
  }
  const npcs = new Map<number, SimNpc>();
  for (const n of Object.values(npcsRaw)) {
    if (n && typeof n.id === "number") npcs.set(n.id, n);
  }
  const items = new Map<number, SimItem>();
  for (const it of Object.values(itemsRaw)) {
    if (it && typeof it.id === "number") items.set(it.id, it);
  }
  return { quests, npcs, items, overrides };
}

export function loadBuiltGuides(dataDir: string): Guide[] {
  const dir = join(dataDir, "guides");
  if (!existsSync(dir)) throw new Error(`xp-sim: no guides at ${dir}; run the data build first`);
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => readJson<Guide>(join(dir, name)));
}

export interface XpSimPipelineOpts {
  dataDir: string;
  root?: string;
  reportDir?: string;
  now?: string;
  /** Walk only this pack. Default (unset) is the full 1–60 chains. */
  onlyPack?: string;
  /** Integer level to enter `onlyPack` at. Ignored unless `onlyPack` is set. */
  enterLevel?: number;
}

/** Same slack as `guide-integrity.ts` `HANDOFF_SLACK`. */
const HANDOFF_SLACK = 0.5;
/** Same floor as `guide-integrity.ts` `LAST_PACK_MIN_END`. */
const LAST_PACK_MIN_END = 59.5;
/** Last 20–40 sub-pack must reach this even when the next pack's minLevel is lower. */
const LAST_20_40_MIN_END = 39.5;

export interface SubpackXpRow {
  chainId: string;
  mode: string;
  pack: string;
  /** Level before the pack's first simulated step (previous step, or chain enter level). */
  entry: number | null;
  /** Level after the pack's last simulated step. */
  exit: number | null;
  xpGained: number | null;
  minLevel: number | null;
  maxLevel: number | null;
  status: "PASS" | "FAIL";
  /** Accepts in this pack on this chain where player level < quest reqLevel. */
  earlyAccepts: number | null;
}

export interface SubpackXpReport {
  generatedAt: string;
  handoffSlack: number;
  lastPackMinEnd: number;
  last2040MinEnd: number;
  earlyAcceptNote: string;
  rows: SubpackXpRow[];
}

export function buildSubpackXpReport(report: SimReport, guides: readonly Pick<Guide, "slug" | "minLevel" | "maxLevel">[]): SubpackXpReport {
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const counted = report.chains.some((c) => c.earlyAcceptsByPack);
  const rows: SubpackXpRow[] = [];
  for (const chain of report.chains) {
    for (const pack of HORDE_20_60_PACKS) {
      const guide = bySlug.get(pack);
      const entry = chain.packArrivals[pack] ?? null;
      const exit = chain.packEnds[pack] ?? null;
      const xpGained = chain.packGained ? (chain.packGained[pack] ?? 0) : null;
      const earlyAccepts = chain.earlyAcceptsByPack ? (chain.earlyAcceptsByPack[pack] ?? 0) : null;
      rows.push({
        chainId: chain.chainId,
        mode: chain.mode,
        pack,
        entry,
        exit,
        xpGained,
        minLevel: guide?.minLevel ?? null,
        maxLevel: guide?.maxLevel ?? null,
        status: subpackStatus(pack, exit, bySlug),
        earlyAccepts,
      });
    }
  }
  return {
    generatedAt: report.generatedAt,
    handoffSlack: HANDOFF_SLACK,
    lastPackMinEnd: LAST_PACK_MIN_END,
    last2040MinEnd: LAST_20_40_MIN_END,
    earlyAcceptNote: counted
      ? "earlyAccepts counts accepts where integer player level < quest reqLevel, per chain walk (same inputs as the sim)."
      : "earlyAccepts is null: this sim report has no per-chain below-req counts.",
    rows,
  };
}

function subpackStatus(pack: string, exit: number | null, guides: ReadonlyMap<string, { minLevel: number }>): "PASS" | "FAIL" {
  if (exit == null) return "FAIL";
  const idx = horde2060Index(pack);
  const nextId = idx === undefined ? undefined : HORDE_20_60_PACKS[idx + 1];
  if (nextId) {
    const next = guides.get(nextId);
    if (!next || exit < next.minLevel - HANDOFF_SLACK) return "FAIL";
  }
  if (pack === LAST_40_60_PACK && exit < LAST_PACK_MIN_END) return "FAIL";
  if (pack === LAST_20_40_PACK && exit < LAST_20_40_MIN_END) return "FAIL";
  return "PASS";
}

export function formatSubpackXpMarkdown(report: SubpackXpReport): string {
  const fails = report.rows.filter((r) => r.status === "FAIL");
  const lines: string[] = [];
  lines.push("# XP sim sub-pack report");
  lines.push("");
  lines.push(`Generated ${report.generatedAt}.`);
  lines.push("");
  lines.push(report.earlyAcceptNote);
  lines.push("");
  lines.push(
    `PASS when exit ≥ next pack minLevel − ${report.handoffSlack}. ` +
      `${LAST_40_60_PACK} also needs exit ≥ ${report.lastPackMinEnd}. ` +
      `${LAST_20_40_PACK} also needs exit ≥ ${report.last2040MinEnd}.`,
  );
  lines.push("");
  lines.push("## Failures");
  lines.push("");
  if (!fails.length) {
    lines.push("None.");
  } else {
    lines.push("| chain | mode | pack | entry | exit | declared |");
    lines.push("| --- | --- | --- | ---: | ---: | --- |");
    for (const r of fails) lines.push(subpackLine(r));
  }
  lines.push("");
  lines.push("## All rows");
  lines.push("");
  lines.push("| chain | mode | pack | entry | exit | xp | declared | early | status |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: | --- | ---: | --- |");
  for (const r of report.rows) {
    const declared = r.minLevel == null ? "—" : `${r.minLevel}–${r.maxLevel}`;
    lines.push(
      `| ${r.chainId} | ${r.mode} | ${r.pack} | ${fmtLv(r.entry)} | ${fmtLv(r.exit)} | ${r.xpGained ?? "—"} | ${declared} | ${r.earlyAccepts ?? "—"} | ${r.status} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function subpackLine(r: SubpackXpRow): string {
  const declared = r.minLevel == null ? "—" : `${r.minLevel}–${r.maxLevel}`;
  return `| ${r.chainId} | ${r.mode} | ${r.pack} | ${fmtLv(r.entry)} | ${fmtLv(r.exit)} | ${declared} |`;
}

function fmtLv(n: number | null): string {
  return n == null ? "—" : n.toFixed(2);
}

function seedTotalXp(level: number): number {
  let total = 0;
  const cap = Math.min(60, Math.max(1, Math.floor(level)));
  for (let l = 1; l < cap; l++) total += xpToNext(l);
  return total;
}

export function runXpSimPipeline(opts: XpSimPipelineOpts): { chainEnds: { chainId: string; mode: string; endLevel: number }[]; belowReq: number; sub70: number; reportDir: string } {
  const root = opts.root ?? ROOT;
  const guides = loadBuiltGuides(opts.dataDir);
  const tables = loadSimTables(root);
  const reportDir = opts.reportDir ?? join(root, "data/reports");
  mkdirSync(reportDir, { recursive: true });

  if (opts.onlyPack) {
    const g = guides.find((guide) => guide.slug === opts.onlyPack);
    if (!g) throw new Error(`xp-sim: unknown pack ${opts.onlyPack}`);
    const enter = opts.enterLevel ?? Math.max(1, Math.floor(g.minLevel));
    const start = { level: enter, xpInto: 0, total: seedTotalXp(enter) };
    const chainEnds: { chainId: string; mode: string; endLevel: number }[] = [];
    let belowReq = 0;
    let sub70 = 0;
    const lines = [
      `# XP sim (pack ${g.slug} enter ${enter})`,
      "",
      `Seeded cumulative XP ${seedTotalXp(enter)} as if the player entered at level ${enter}.`,
      "",
    ];
    for (const mode of ROUTES) {
      const items = g.steps
        .filter((step) => stepVisibleDungeonsOff(step, mode))
        .map((step, i) => ({ packId: g.slug, step, packFirst: i === 0 }));
      const walk = simulateWalk(items, { mode, start: { ...start }, tables });
      chainEnds.push({ chainId: g.slug, mode, endLevel: walk.end.fractional });
      belowReq += walk.belowReq.length;
      sub70 += walk.sub70.length;
      lines.push(`- ${mode}: end ${walk.end.fractional.toFixed(2)}, totalXp ${walk.end.totalXp}`);
    }
    writeFileSync(join(reportDir, "xp-sim-only.md"), `${lines.join("\n")}\n`);
    writeFileSync(join(reportDir, "xp-sim-only.json"), JSON.stringify({ pack: g.slug, enterLevel: enter, chainEnds }, null, 2));
    return { chainEnds, belowReq, sub70, reportDir };
  }

  const { report, simByPack } = simulateGuides(guides, tables, opts.now ?? new Date().toISOString());
  applySimToGuides(guides, simByPack);
  for (const g of guides) {
    writeFileSync(join(opts.dataDir, "guides", `${g.slug}.json`), JSON.stringify(g));
  }
  writeFileSync(join(reportDir, "xp-sim.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(reportDir, "xp-sim.md"), formatReportMarkdown(report));
  const subpacks = buildSubpackXpReport(report, guides);
  writeFileSync(join(reportDir, "xp-sim-subpacks.json"), JSON.stringify(subpacks, null, 2));
  writeFileSync(join(reportDir, "xp-sim-subpacks.md"), formatSubpackXpMarkdown(subpacks));
  return {
    chainEnds: report.chains.map((c) => ({ chainId: c.chainId, mode: c.mode, endLevel: c.endLevel })),
    belowReq: report.belowReqAccepts.length,
    sub70: report.sub70TurnIns.length,
    reportDir,
  };
}

/**
 * Second walk with dungeon steps included. Writes `step.simDungeons` only.
 * Does not pass xpMods and does not replace `step.sim` (the dungeons-off worst case).
 */
export function writeDungeonOnSim(opts: XpSimPipelineOpts): void {
  const root = opts.root ?? ROOT;
  const guides = loadBuiltGuides(opts.dataDir);
  const tables = loadSimTables(root);
  const { simByPack } = simulateGuides(guides, tables, opts.now ?? new Date().toISOString(), { dungeons: true });
  for (const g of guides) {
    const bag = simByPack[g.slug];
    if (bag) {
      for (const step of g.steps) {
        const sim = bag[step.id];
        if (sim) step.simDungeons = sim;
      }
    }
    writeFileSync(join(opts.dataDir, "guides", `${g.slug}.json`), JSON.stringify(g));
  }
}

function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : undefined;
}

function main(argv: string[]): number {
  const argPath = (name: string, dflt: string) => {
    const v = flagValue(argv, name);
    return v ? resolve(v) : dflt;
  };
  const dataDir = argPath("--data", join(ROOT, "web/public/data"));
  const reportDir = argPath("--out", join(ROOT, "data/reports"));
  const onlyPack = flagValue(argv, "--only");
  const enterRaw = flagValue(argv, "--enter-level");
  const enterLevel = enterRaw != null ? Number(enterRaw) : undefined;
  if (enterRaw != null && !Number.isFinite(enterLevel)) {
    console.error(`[xp-sim] --enter-level must be a number`);
    return 1;
  }
  try {
    const r = runXpSimPipeline({ dataDir, root: ROOT, reportDir, onlyPack, enterLevel });
    const wrote = onlyPack ? `pack ${onlyPack}` : "sim onto guides";
    console.log(
      `[xp-sim] wrote ${wrote}; report → ${relative(ROOT, r.reportDir)}; ` +
        r.chainEnds.map((e) => `${e.chainId}/${e.mode}=${e.endLevel.toFixed(2)}`).join(" "),
    );
    return 0;
  } catch (e) {
    console.error(`[xp-sim] ${(e as Error).message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
