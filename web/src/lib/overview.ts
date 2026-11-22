import type { Insights } from "../data/schema";

export type RouteIssue = Insights["issues"][number];

export function issueHref(issue: RouteIssue): string | undefined {
  if (issue.guide && issue.step) return `/guide/${issue.guide}?step=${encodeURIComponent(issue.step)}`;
  if (issue.questId != null) return `/quest/${issue.questId}`;
  if (issue.guide) return `/guide/${issue.guide}`;
  return undefined;
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
