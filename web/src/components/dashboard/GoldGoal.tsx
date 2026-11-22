import { Link } from "react-router";
import { dataOf, useGoldPlan } from "../../data/hooks";
import { bracketFor, COPPER_PER_GOLD, fmtGold, isHonoredHome, milestonePrice, nextMilestone, paceTarget, paceVerdict } from "../../lib/goldPlan";
import { useProfileApi } from "../../state/profile";
import { Money } from "../ui/Money";

const VERDICT = {
  ahead: { label: "Ahead of pace", cls: "text-done" },
  on: { label: "On pace", cls: "text-bronze-300" },
  behind: { label: "Behind pace", cls: "text-rt-warn" },
} as const;

/** Dashboard gold goal: the next big purchase, saved gold (after a sync) and the savings pace. */
export function GoldGoal({ level, planLink = true }: { level: number; planLink?: boolean }) {
  const plan = dataOf(useGoldPlan());
  const active = useProfileApi().active;
  if (!plan) return null;
  const lvl = Math.max(1, Math.floor(level));
  const profile = active ? { ...active, level: Math.max(active.level ?? 0, lvl) } : { level: lvl };
  const next = nextMilestone(plan, profile);
  const honored = isHonoredHome(active);
  const bracket = bracketFor(plan, lvl);
  const money = active?.money;
  const have = money != null ? money / COPPER_PER_GOLD : undefined;
  const pace = paceTarget(plan, lvl);
  const price = next ? milestonePrice(next, honored) : undefined;
  const pct = have !== undefined && price ? Math.min(100, (have / price) * 100) : undefined;
  const verdict = have !== undefined && pace !== undefined && pace > 0 ? paceVerdict(have, pace) : undefined;

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-bronze-900 bg-canvas/50 px-3.5 py-3" aria-labelledby="gold-goal">
      <div className="flex items-baseline justify-between gap-2">
        <span id="gold-goal" className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">
          Gold
        </span>
        {planLink && (
          <Link to="/gold" className="text-xs font-semibold text-bronze-400 hover:text-bronze-300">
            Gold plan →
          </Link>
        )}
      </div>
      {next && price !== undefined && (
        <p className="text-sm text-ink">
          Save for <strong>{next.label.toLowerCase()}</strong>: {fmtGold(price, next.budgetHigh)}
          {next.honoredGold !== undefined && next.honoredGold !== next.gold && !honored && (
            <span className="text-muted"> ({fmtGold(next.honoredGold)} at Honored)</span>
          )}
        </p>
      )}
      {pct !== undefined && money != null && (
        <div>
          <div
            role="progressbar"
            aria-label="Gold saved toward the next purchase"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            className="h-2 overflow-hidden rounded-full border border-stroke bg-canvas"
          >
            <div className="h-full bg-[#ffd100]/80" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <Money copper={money} className="text-ink" /> saved
            {verdict && pace !== undefined && (
              <span className={VERDICT[verdict].cls}>
                · {VERDICT[verdict].label} (about {fmtGold(Math.round(pace))} by now)
              </span>
            )}
          </p>
        </div>
      )}
      {have === undefined && (
        <p className="text-xs text-muted">
          {pace !== undefined && pace > 0 ? <>Target for level {lvl}: about {fmtGold(Math.round(pace))}. </> : null}
          <Link to="/profile" className="font-semibold text-bronze-400 hover:text-bronze-300">
            Sync
          </Link>{" "}
          to track your gold.
        </p>
      )}
      {bracket && (
        <p className="text-xs text-muted">
          Level {bracket.levels[0]}–{bracket.levels[1]}: {bracket.focus}
        </p>
      )}
    </div>
  );
}
