import type { QuestMap } from "../../data/loader";
import type { NearMiss } from "../../lib/nearMiss";
import { nearMissCoords } from "../../lib/nearMiss";
import { QuestLink } from "../quest/QuestLink";
import { Icon } from "../ui/Icon";

export function NearMissStepRow({ miss, quests }: { miss: NearMiss; quests?: QuestMap }) {
  const quest = quests?.get(miss.questId);
  const at = nearMissCoords(quest);
  return (
    <div className="rounded-sm border border-bronze-500/35 bg-bronze-900/15 px-3.5 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <QuestLink id={miss.questId} className="font-semibold text-bronze-300 hover:text-bronze-300">
          {quest?.name ?? `Quest ${miss.questId}`}
        </QuestLink>
        <span className="shrink-0 text-xs text-bronze-300/90">{miss.xp.toLocaleString()} XP</span>
      </div>
      <p className="mt-0.5 text-xs leading-relaxed text-bronze-300/75">{miss.why}</p>
      {at && (
        <p className="mt-1 text-[11px] text-bronze-500/80">
          {at.zone} {at.x.toFixed(1)}, {at.y.toFixed(1)}
        </p>
      )}
    </div>
  );
}

export function NearMissBlock({
  misses,
  added,
  quests,
  hasProfile,
  onToggle,
}: {
  misses: readonly NearMiss[];
  added: readonly number[];
  quests?: QuestMap;
  hasProfile: boolean;
  onToggle: (questId: number) => void;
}) {
  if (!misses.length) return null;
  const addedSet = new Set(added);
  return (
    <details className="rounded-sm border border-dashed border-stroke bg-canvas/30 px-3.5 py-2">
      <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.18em] text-bronze-500/80 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="sparkle" className="h-3.5 w-3.5 text-bronze-400" />
          More quests nearby
          <span className="rounded-full border border-stroke px-1.5 py-px text-[10px] text-bronze-300/70">{misses.length}</span>
        </span>
      </summary>
      <ul className="mt-2 space-y-2">
        {misses.map((m) => {
          const quest = quests?.get(m.questId);
          const on = addedSet.has(m.questId);
          return (
            <li key={m.questId} className="rounded-sm border border-stroke bg-frame/70 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <QuestLink id={m.questId} className="min-w-0 font-medium text-ink hover:text-bronze-300">
                  {quest?.name ?? `Quest ${m.questId}`}
                </QuestLink>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!hasProfile}
                  title={hasProfile ? undefined : "Create a character to add this quest"}
                  onClick={() => onToggle(m.questId)}
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                    on
                      ? "border-bronze-500/50 bg-bronze-900/40 text-bronze-300"
                      : "border-stroke text-ink hover:border-bronze-500/40 hover:text-bronze-300"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {on ? "Remove" : "Add"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-bronze-500/80">
                {m.xp.toLocaleString()} XP · ~{m.minutes} min
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-bronze-300/70">{m.why}</p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
