import type { Guide } from "../data/schema";

/** Zone of the section that holds `stepId` (else the guide's first section). For the top-bar progress. */
export function currentZone(guide: Pick<Guide, "sections" | "steps"> | undefined, stepId?: string): string | undefined {
  const first = guide?.sections[0]?.zone;
  if (!guide || first === undefined) return undefined;
  if (!stepId) return first;
  const order = new Map(guide.steps.map((s, i) => [s.id, i]));
  const at = order.get(stepId);
  if (at === undefined) return first;
  for (const sec of guide.sections) {
    const a = order.get(sec.firstStep);
    const b = order.get(sec.lastStep);
    if (a !== undefined && b !== undefined && at >= a && at <= b) return sec.zone;
  }
  return first;
}
