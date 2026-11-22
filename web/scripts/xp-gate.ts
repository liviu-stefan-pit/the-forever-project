/**
 * XP level gate: fails when a change makes the route fall short of the level a pack expects.
 *
 *   node --experimental-strip-types scripts/xp-gate.ts [--data DIR]
 *   npm run xp:gate            (after `npm run data`)
 *
 * Walks every leveling chain (each start, balanced and speedrun) with the same XP simulator and
 * tables as `xp-sim.ts`, and checks each pack's simulated end level:
 *
 * - a pack with a next pack must end at ≥ next pack minLevel − HANDOFF_SLACK,
 * - the last 20–40 pack must also end at ≥ 39.5,
 * - the last pack of a chain must end at ≥ 59.5.
 *
 * Only a floor is enforced: ending higher than needed always passes. These are the same level
 * rules as `guide-integrity.ts` (`xp-end-level`, `xp-handoff`) and the sub-pack report in
 * `xp-sim.ts`, run on their own so CI can require them while the rest of the integrity report
 * still has open content findings.
 *
 * Exit 0 when every pack reaches its floor, 1 otherwise. In GitHub Actions it also writes a
 * job summary and an error annotation per failing pack.
 */
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Guide } from "../../contracts/schema.ts";
import { LAST_20_40_PACK } from "../src/lib/xp/leveling-chain.ts";
import { LEVELING_CHAINS, ROUTES, simulateGuides, type LevelingChain, type SimReport } from "../src/lib/xp/simulate.ts";
import { HANDOFF_SLACK, LAST_PACK_MIN_END } from "./guide-integrity.ts";
import { loadBuiltGuides, loadSimTables } from "./xp-sim.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The last 20–40 pack must reach this even when the next pack's minLevel is lower. */
export const LAST_20_40_MIN_END = 39.5;

export interface XpGateRow {
  chainId: string;
  mode: string;
  pack: string;
  /** Simulated level when the pack's last step is done; null when the sim has none. */
  end: number | null;
  /** Lowest end level that passes. */
  floor: number;
  /** What the floor comes from, for the report. */
  reason: string;
  /** end − floor; null when end is null. Negative means the pack falls short. */
  margin: number | null;
  ok: boolean;
}

export function evaluateXpGate(
  report: Pick<SimReport, "chains">,
  guides: ReadonlyMap<string, Pick<Guide, "minLevel">>,
  chains: readonly LevelingChain[] = LEVELING_CHAINS,
  modes: readonly string[] = ROUTES,
): XpGateRow[] {
  const rows: XpGateRow[] = [];
  for (const chain of chains) {
    for (const mode of modes) {
      const summary = report.chains.find((c) => c.chainId === chain.id && c.mode === mode);
      chain.packs.forEach((pack, i) => {
        const nextId = chain.packs[i + 1];
        let floor: number;
        let reason: string;
        if (nextId) {
          const next = guides.get(nextId);
          if (!next) {
            rows.push({ chainId: chain.id, mode, pack, end: null, floor: NaN, reason: `next pack ${nextId} is not built`, margin: null, ok: false });
            return;
          }
          floor = next.minLevel - HANDOFF_SLACK;
          reason = `${nextId} starts at ${next.minLevel}`;
        } else {
          floor = LAST_PACK_MIN_END;
          reason = "end of the chain";
        }
        if (pack === LAST_20_40_PACK && floor < LAST_20_40_MIN_END) {
          floor = LAST_20_40_MIN_END;
          reason = "end of the 20–40 band";
        }
        const raw = summary?.packEnds[pack];
        const end = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
        const margin = end == null ? null : end - floor;
        rows.push({ chainId: chain.id, mode, pack, end, floor, reason, margin, ok: margin != null && margin >= -1e-9 });
      });
    }
  }
  return rows;
}

const lv = (n: number | null) => (n == null || !Number.isFinite(n) ? "—" : n.toFixed(2));
const signed = (n: number | null) => (n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}`);

export function formatXpGateMarkdown(rows: readonly XpGateRow[]): string {
  const fails = rows.filter((r) => !r.ok);
  const lines: string[] = [];
  lines.push("## XP level gate");
  lines.push("");
  lines.push(
    fails.length
      ? `❌ **${fails.length} of ${rows.length}** pack hand-offs end below the level the next part of the route needs.`
      : `✅ All ${rows.length} pack hand-offs reach the level the next part of the route needs.`,
  );
  lines.push("");
  lines.push(
    `Floor: next pack's start level − ${HANDOFF_SLACK}; ${LAST_20_40_PACK} ≥ ${LAST_20_40_MIN_END}; last pack ≥ ${LAST_PACK_MIN_END}. ` +
      "Anything above the floor passes.",
  );
  lines.push("");
  const table = (list: readonly XpGateRow[]) => {
    lines.push("| chain | mode | pack | ends at | needs | margin | why |");
    lines.push("| --- | --- | --- | ---: | ---: | ---: | --- |");
    for (const r of list) {
      lines.push(`| ${r.chainId} | ${r.mode} | ${r.pack} | ${lv(r.end)} | ${lv(r.floor)} | ${signed(r.margin)} | ${r.reason} |`);
    }
    lines.push("");
  };
  if (fails.length) {
    lines.push("### Failing");
    lines.push("");
    table(fails);
  }
  const tightest = rows
    .filter((r) => r.ok)
    .sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))
    .slice(0, 10);
  if (tightest.length) {
    lines.push("### Tightest passing hand-offs");
    lines.push("");
    table(tightest);
  }
  return lines.join("\n");
}

function main(argv: string[]): number {
  const i = argv.indexOf("--data");
  const dataDir = i >= 0 && argv[i + 1] ? argv[i + 1]! : join(ROOT, "web/public/data");
  let rows: XpGateRow[];
  try {
    const guides = loadBuiltGuides(dataDir);
    const { report } = simulateGuides(guides, loadSimTables(ROOT), new Date().toISOString());
    rows = evaluateXpGate(report, new Map(guides.map((g) => [g.slug, g])));
  } catch (e) {
    console.error(`xp-gate: ${(e as Error).message}`);
    return 1;
  }
  const fails = rows.filter((r) => !r.ok);
  const inCi = !!process.env.GITHUB_ACTIONS;
  for (const r of fails) {
    const msg = `${r.chainId}/${r.mode}: ${r.pack} ends at ${lv(r.end)}, needs ≥ ${lv(r.floor)} (${r.reason})`;
    console.error(inCi ? `::error title=XP below level floor::${msg}` : `xp-gate: FAIL ${msg}`);
  }
  const tight = rows.filter((r) => r.ok).sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))[0];
  console.log(
    `xp-gate: ${rows.length - fails.length}/${rows.length} pack hand-offs reach their level floor` +
      (tight ? `; tightest ${tight.chainId}/${tight.mode} ${tight.pack} ${signed(tight.margin)}` : ""),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${formatXpGateMarkdown(rows)}\n`);
  return fails.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
