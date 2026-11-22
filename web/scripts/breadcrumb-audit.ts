/**
 * Load public/data and print the all-guides requirement audit.
 *
 *   npm run audit:breadcrumbs
 *
 * Exit 0 when there are no violations. Goto candidates are printed and are not failures.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Guide, QuestInfo } from "../../contracts/schema.ts";
import { liveSilverpineProfile } from "../src/state/fixtures/liveSilverpine.ts";
import { auditRequirements, type AuditViolation, type GotoCandidate } from "../src/state/requirementAudit.ts";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "../public/data");

export function loadAuditInputs(dataDir = DATA): { guides: Guide[]; quests: Map<number, QuestInfo> } {
  const guideDir = join(dataDir, "guides");
  const guides = readdirSync(guideDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(guideDir, name), "utf8")) as Guide);
  const list = JSON.parse(readFileSync(join(dataDir, "quests-min.json"), "utf8")) as QuestInfo[];
  const quests = new Map<number, QuestInfo>();
  for (const quest of list) quests.set(quest.id, quest);
  return { guides, quests };
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

export function formatViolations(violations: readonly AuditViolation[]): string {
  const header = [pad("guide", 24), pad("route", 10), pad("step", 28), pad("rule", 26), "scenario"].join("  ");
  const lines = violations.map((v) =>
    [pad(v.guide, 24), pad(v.route, 10), pad(v.stepId, 28), pad(v.rule, 26), `${v.scenario}  ${v.detail}`].join("  "),
  );
  return [header, ...lines].join("\n");
}

export function formatCandidates(candidates: readonly GotoCandidate[]): string {
  if (candidates.length === 0) return "goto candidates: none";
  const lines = candidates.map(
    (c) =>
      `${c.guide}  ${c.route}  ${c.stepId}  → ${c.nextStepId}  breadcrumb ${c.breadcrumbQuestId} (target ${c.targetQuestId})${c.goto ? "  [goto]" : ""}`,
  );
  return `goto candidates (not failures): ${candidates.length}\n${lines.join("\n")}`;
}

export function runAudit(dataDir = DATA): number {
  const { guides, quests } = loadAuditInputs(dataDir);
  const result = auditRequirements(guides, quests, liveSilverpineProfile());
  console.log(`breadcrumb audit: ${result.violations.length} violation(s) across ${guides.length} guides`);
  if (result.violations.length) console.log(formatViolations(result.violations));
  console.log(formatCandidates(result.gotoCandidates));
  return result.violations.length ? 1 : 0;
}

const invoked = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (invoked) process.exit(runAudit());
