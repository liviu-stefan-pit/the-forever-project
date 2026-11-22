/**
 * Compact list of quests in the current step. Opening one uses the P9 drawer on a guide
 * (`?quest=`) or the `/quest/:id` page when not on a guide.
 */
import type { QuestMap } from "../../data/loader";
import type { Step } from "../../data/schema";
import { stepQuestIds } from "../../lib/actions";
import { Icon } from "../ui/Icon";
import { QuestLink } from "./QuestLink";

export interface QuestDetailsSlotProps {
  step: Step | undefined;
  quests: QuestMap | undefined;
}

function roleOf(step: Step, id: number): string {
  const roles = new Set<string>();
  for (const a of step.actions) {
    if ((a.type === "accept" || a.type === "turnin" || a.type === "complete" || a.type === "collect") && a.questId === id) {
      roles.add(a.type === "turnin" ? "Turn in" : a.type === "accept" ? "Accept" : "Objective");
    }
  }
  if (step.bonus?.questIds.includes(id)) roles.add("Bonus");
  return [...roles].join(" · ");
}

export function QuestDetailsSlot({ step, quests }: QuestDetailsSlotProps) {
  const ids = step ? stepQuestIds(step) : [];
  return (
    <section aria-label="Quest details" className="wow-frame p-4 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-wide text-bronze-400">
        <Icon name="scroll" className="h-4 w-4 text-bronze-400" /> Quests in this step
      </h2>
      {ids.length === 0 ? (
        <p className="mt-2 text-xs text-bronze-500/80">No quests in the current step.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {ids.map((id) => {
            const q = quests?.get(id);
            const giver = q?.start[0];
            const at = giver?.at[0];
            return (
              <li key={id} className="panel-animate">
                <QuestLink
                  id={id}
                  className="block rounded-sm border border-stroke bg-canvas/40 p-3 transition hover:border-bronze-500/50 hover:bg-canvas/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 font-semibold text-bronze-300">{q?.name ?? `Quest ${id}`}</span>
                    {q && <span className="shrink-0 rounded-sm bg-stroke/70 px-1.5 py-px text-[10px] font-bold text-ink">Lv {q.level}</span>}
                  </div>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-bronze-500/80">{step ? roleOf(step, id) : ""}</p>
                  {q?.objectivesText[0] && <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink">{q.objectivesText[0]}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-bronze-500/80">
                    {giver && (
                      <span>
                        From <span className="text-rt-friendly">{giver.name}</span>
                        {at && ` · ${at.x.toFixed(1)}, ${at.y.toFixed(1)}`}
                      </span>
                    )}
                    {q?.xp !== undefined && <span className="text-bronze-300/90">{q.xp} XP</span>}
                    {q?.custom && <span className="text-bronze-300">Forever-only</span>}
                  </div>
                </QuestLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
