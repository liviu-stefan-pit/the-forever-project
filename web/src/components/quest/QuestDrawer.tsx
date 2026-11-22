import { useEffect } from "react";
import { dataOf, useQuestsDetail, useQuestsGeo } from "../../data/hooks";
import { overlayQuestDetail, overlayQuestGeo, type QuestMap, type ZoneMap } from "../../data/loader";
import { EmptyState } from "../ui/States";
import { Icon } from "../ui/Icon";
import { QuestDetails } from "./QuestDetails";

export function QuestDrawer({
  questId,
  quests,
  zones,
  onClose,
}: {
  questId: number;
  quests: QuestMap | undefined;
  zones: ZoneMap | undefined;
  onClose: () => void;
}) {
  const geo = dataOf(useQuestsGeo());
  const detail = dataOf(useQuestsDetail());
  const overlaid = quests ? overlayQuestGeo(quests, geo) : undefined;
  const base = overlaid?.get(questId);
  const quest = base ? overlayQuestDetail(base, detail?.get(questId)) : undefined;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end" role="presentation">
      <div className="fade-in absolute inset-0 bg-canvas/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={quest ? quest.name : `Quest ${questId}`}
        className="wow-frame panel-animate relative flex h-full w-full max-w-lg flex-col overflow-hidden shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-stroke px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">
              Quest {questId}
              {quest?.custom ? " · Forever-only" : ""}
            </p>
            <h2 className="font-display text-xl font-bold text-bronze-300">{quest?.name ?? `Quest ${questId}`}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-bronze-500/60 p-2 text-bronze-500/80 hover:text-bronze-300"
            aria-label="Close quest details"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </header>
        <div className="parchment min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {quest ? (
            <QuestDetails quest={quest} quests={overlaid ?? quests} zones={zones} />
          ) : (
            <EmptyState icon="scroll" title="Unknown quest">
              This quest id is not in the quest catalog.
            </EmptyState>
          )}
        </div>
      </aside>
    </div>
  );
}
