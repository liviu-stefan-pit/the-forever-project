import type { Profile } from "../../data/schema";
import type { QuestNameLookup } from "../../lib/actions";
import { wayCommand } from "../../lib/actions";
import { isQuestOnly, type StepLayout } from "../../lib/stepAreas";
import type { QuestLookup } from "../../state/questAvailability";
import { Icon } from "../ui/Icon";
import { ActionChips, buildChips, Chip, FilterTag, WayChip } from "./ActionChips";
import { RichLine } from "./RichLine";

function countDone(count: string): boolean {
  const [have, need] = count.split("/").map(Number);
  return have !== undefined && need !== undefined && need > 0 && have >= need;
}

/**
 * A step laid out by place: each area has its name, its waypoint on the same row, and what to do there.
 * Objective counters appear only when the quest log is synced; otherwise the line already says the target.
 */
export function StepAreas({
  layout,
  questName,
  profile,
  quests,
  stepId,
  compact,
}: {
  layout: StepLayout;
  questName?: QuestNameLookup;
  profile?: Profile | null;
  quests?: QuestLookup;
  stepId: string;
  compact: boolean;
}) {
  const text = compact ? "text-[13px]" : "text-sm sm:text-[15px]";
  return (
    <div className="space-y-2.5" data-testid="step-areas">
      {layout.intro.length > 0 && (
        <div className={`space-y-1 ${text} leading-relaxed text-ink`}>
          {layout.intro.map((l, i) => (
            <p key={i} className="break-words">
              <RichLine line={l} />
            </p>
          ))}
        </div>
      )}
      {layout.lead.length > 0 && (
        <ActionChips actions={layout.lead} questName={questName} lineVisible={() => true} profile={profile} quests={quests} stepId={stepId} />
      )}
      <ol className="space-y-2">
        {layout.areas.map((area) => {
          const chips = buildChips(area.actions, questName, profile, quests, area.gotoIndex + 1);
          const questOnly = isQuestOnly(area.actions);
          const objectives = chips.filter((c) => (c.tone === "complete" || c.tone === "loot") && c.count);
          const others = questOnly ? chips : chips.filter((c) => c.tone !== "complete" && c.tone !== "loot");
          const areaDone = objectives.length > 0 && objectives.every((o) => countDone(o.count!));
          const way = wayCommand(area.goto.at);
          return (
            <li key={area.gotoIndex} data-testid="step-area" className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon
                  name={areaDone ? "check" : "pin"}
                  className={`h-3.5 w-3.5 shrink-0 ${areaDone ? "text-done" : "text-bronze-400"}`}
                  strokeWidth={areaDone ? 3 : 2}
                />
                <span className={`min-w-0 text-[13px] font-semibold ${areaDone ? "text-muted" : "text-bronze-300"}`}>{area.label}</span>
                {area.goto.filter && <FilterTag filter={area.goto.filter} />}
                {way && (
                  <span className="ml-auto shrink-0">
                    <WayChip way={way} label={`${area.goto.at.x.toFixed(1)}, ${area.goto.at.y.toFixed(1)}`} />
                  </span>
                )}
              </div>
              <div className="space-y-1 pl-[22px]">
                {!questOnly && (
                  <p className={`break-words ${text} leading-relaxed ${areaDone ? "text-muted" : "text-ink"}`}>
                    <RichLine line={area.line} />
                  </p>
                )}
                {objectives.length > 0 && (
                  <ul className="space-y-0.5" data-testid="step-objectives">
                    {objectives.map((o) => {
                      const done = countDone(o.count!);
                      return (
                        <li key={o.key} className={`flex items-center gap-2 text-[13px] ${done ? "text-muted line-through" : "text-ink"}`}>
                          <span className="min-w-0 truncate">{o.text}</span>
                          <span className={`ml-auto shrink-0 font-mono tabular-nums no-underline ${done ? "text-done" : "text-bronze-300"}`}>{o.count}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {others.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {others.map((c) => (
                      <Chip key={c.key} spec={c} stepId={stepId} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {layout.hiddenCount > 0 && (
        <p className="inline-flex items-center gap-1 text-[11px] text-bronze-500/80 touch:hidden" title="Hidden path waypoints shape the route line on the map">
          <Icon name="map" className="h-3 w-3" />
          {layout.hiddenCount} path point{layout.hiddenCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
