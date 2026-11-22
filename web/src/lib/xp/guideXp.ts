import type { RouteStyle, Step, StepSim } from "../../data/schema";

/**
 * Guide-local XP: sum of `step.sim[route].gained` on visible steps.
 * Missing `gained` is skipped. Earned counts only steps `isDone` marks complete.
 */
export function guideXpProgress(
  steps: readonly Step[],
  route: RouteStyle,
  isDone: (id: string) => boolean,
  isVisible: (step: Step) => boolean = () => true,
  simByStep?: ReadonlyMap<string, StepSim> | null,
): { earned: number; total: number } {
  let earned = 0;
  let total = 0;
  for (const step of steps) {
    if (!isVisible(step)) continue;
    const gained = simByStep?.get(step.id)?.gained ?? step.sim?.[route]?.gained;
    if (gained == null) continue;
    total += gained;
    if (isDone(step.id)) earned += gained;
  }
  return { earned, total };
}
