import type { Insights } from "../data/schema";

export type RouteIssue = Insights["issues"][number];

export function issueHref(issue: RouteIssue): string | undefined {
  if (issue.guide && issue.step) return `/guide/${issue.guide}?step=${encodeURIComponent(issue.step)}`;
  if (issue.questId != null) return `/quest/${issue.questId}`;
  if (issue.guide) return `/guide/${issue.guide}`;
  return undefined;
}

export interface OverviewNote {
  msg: string;
  severity: RouteIssue["severity"];
  /** Guides the note applies to, in first-seen order, with how many steps and the first one. */
  guides: { slug: string; count: number; firstStep?: string }[];
  /** Quests named by notes that have no step (a quest left out of the route). */
  questIds: number[];
  /** Names the build carried for those quests. */
  questNames: Record<number, string>;
}

/** One entry per message instead of one line per step; warnings first. */
export function groupOverviewNotes(issues: readonly RouteIssue[]): OverviewNote[] {
  const groups = new Map<string, OverviewNote>();
  for (const it of issues) {
    let g = groups.get(it.msg);
    if (!g) {
      g = { msg: it.msg, severity: it.severity, guides: [], questIds: [], questNames: {} };
      groups.set(it.msg, g);
    }
    if (it.severity === "warn") g.severity = "warn";
    if (it.guide) {
      let row = g.guides.find((r) => r.slug === it.guide);
      if (!row) {
        row = { slug: it.guide, count: 0 };
        g.guides.push(row);
      }
      if (it.step) {
        row.count++;
        row.firstStep ??= it.step;
      }
    }
    if (!it.step && it.questId != null && !g.questIds.includes(it.questId)) g.questIds.push(it.questId);
    if (it.questId != null && it.questName) g.questNames[it.questId] = it.questName;
  }
  return [...groups.values()].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "warn" ? -1 : 1));
}

export function overviewIssues(insights: Insights | undefined): RouteIssue[] {
  return insights?.issues ?? [];
}

export function overviewZoneMatch(slug: string, zones: readonly string[] | undefined, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;
  if (zones?.some((z) => z.toLowerCase().includes(needle))) return true;
  return slug.replace(/-/g, " ").toLowerCase().includes(needle);
}
