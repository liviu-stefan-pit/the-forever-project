import { useState } from "react";
import { useNavigate } from "react-router";
import { dataOf, guideTitleOf, useGuideIndex } from "../../data/hooks";
import { loadGuide } from "../../data/loader";
import { chainFor, guideForLevel, startPlan, stepForLevel, type StartPlan } from "../../lib/startHere";
import { pickRaceStart, useProfileApi } from "../../state/profile";
import { useProgress } from "../../state/progress";
import { useVisibility } from "../../state/visibility";
import { Icon } from "../ui/Icon";

/**
 * "Not level 1?" — pick your level, see where that puts you on your route, and mark everything
 * before it done in one go. Folded by default; open by default for a fresh profile.
 */
export function StartHere({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const index = dataOf(useGuideIndex());
  const active = useProfileApi().active;
  const progress = useProgress();
  const vis = useVisibility();
  const navigate = useNavigate();
  const [level, setLevel] = useState<string>(active?.level && active.level > 1 ? String(active.level) : "");
  const [plan, setPlan] = useState<StartPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!index?.entries) return null;
  const route = progress.routeStyle;
  const start = pickRaceStart(index, active?.race);
  const lv = Number(level);
  const valid = Number.isInteger(lv) && lv >= 1 && lv <= 60;

  const preview = async () => {
    if (!valid || !start || !index.entries) return;
    setBusy(true);
    setError(null);
    try {
      const chain = chainFor(start.firstGuide, route);
      const slug = guideForLevel(chain, index.entries, lv, route);
      if (!slug) throw new Error("No guide for that level on your route.");
      const guide = await loadGuide(slug);
      const step = stepForLevel(guide, lv, route, (s) => vis.step(s).visible);
      if (!step) throw new Error("That guide has no steps for your character.");
      setPlan(startPlan(chain, index.entries, guide, step));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!plan) return;
    if (plan.doneIds.length) progress.setDone(plan.doneIds, true);
    progress.setCurrent({ guide: plan.guide, step: plan.step.id });
    navigate(`/guide/${plan.guide}?step=${encodeURIComponent(plan.step.id)}`);
  };

  return (
    <details open={defaultOpen} className="group rounded-sm border border-dashed border-stroke text-[13px] text-muted">
      <summary className="flex min-h-touch cursor-pointer list-none items-center gap-2.5 px-3 py-2 hover:text-ink">
        <Icon name="flag" className="h-4 w-4 shrink-0 text-bronze-400" />
        <span>
          <strong className="text-ink">Not level 1?</strong> Start the guide at your level.
        </span>
        <Icon name="chevronDown" className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-2.5 border-t border-stroke px-3 pb-3 pt-2.5">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void preview();
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs">Your level</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPlan(null);
              }}
              className="min-h-touch w-20 rounded-sm border border-stroke bg-canvas px-2 text-base text-ink focus:border-bronze-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!valid || busy}
            className="press inline-flex min-h-touch items-center rounded-sm border border-stroke px-3 font-semibold text-ink hover:border-bronze-500 disabled:opacity-50"
          >
            {busy ? "Finding…" : "Find my step"}
          </button>
        </form>
        {start && <p className="text-xs">Route: {start.label} start, {route === "speedrun" ? "Speedrun" : "Balanced"}.</p>}
        {error && <p className="text-xs text-rt-warn">{error}</p>}
        {plan && (
          <div className="space-y-2 rounded-sm border border-bronze-900 bg-canvas/50 p-2.5 text-ink">
            <p>
              Starts you at <strong>{guideTitleOf(index, plan.guide)}</strong>, step #{plan.step.n}
              {plan.doneIds.length > 0 && <>, and marks {plan.doneIds.length.toLocaleString()} earlier steps done</>}.
            </p>
            <p className="text-xs text-muted">You can untick any step later. Synced quest data still wins for quests you have not done.</p>
            <button
              type="button"
              onClick={apply}
              className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-4 font-semibold text-ink hover:bg-horde-400"
            >
              <Icon name="play" className="h-4 w-4" strokeWidth={0} fill="currentColor" /> Start here
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
