import type { ReactNode } from "react";
import { useParams } from "react-router";
import { QuestDetails } from "../components/quest/QuestDetails";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { dataOf, useQuests, useQuestsDetail, useQuestsGeo, useZones } from "../data/hooks";
import { overlayQuestDetail, overlayQuestGeo } from "../data/loader";

function PageFrame({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-7 sm:px-6">
      <header className="panel-animate space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold text-bronze-400">{title}</h1>
      </header>
      {children}
    </div>
  );
}

export function QuestPage() {
  const { id } = useParams<{ id: string }>();
  const questsRes = useQuests();
  const geoRes = useQuestsGeo();
  const detailRes = useQuestsDetail();
  const zones = dataOf(useZones());
  const qid = Number(id);
  if (questsRes.status !== "ready" || geoRes.status !== "ready" || detailRes.status !== "ready") {
    const failed = questsRes.status === "error" ? questsRes : geoRes.status === "error" ? geoRes : detailRes.status === "error" ? detailRes : undefined;
    if (failed) {
      return (
        <PageFrame eyebrow="Quest" title={`Quest ${id}`}>
          <ErrorState title="Could not load quests" error={failed.error} retry={failed.retry} />
        </PageFrame>
      );
    }
    return (
      <PageFrame eyebrow="Quest" title={<Skeleton className="h-9 w-64" />}>
        <Skeleton className="h-40 w-full" />
      </PageFrame>
    );
  }
  const base = questsRes.data.get(qid);
  if (!base) {
    return (
      <PageFrame eyebrow="Quest" title={`Quest ${id}`}>
        <EmptyState icon="scroll" title="Unknown quest">
          This quest id is not in the quest catalog.
        </EmptyState>
      </PageFrame>
    );
  }
  const merged = overlayQuestGeo(questsRes.data, geoRes.data);
  const withGeo = merged.get(qid) ?? base;
  const q = overlayQuestDetail(withGeo, detailRes.data.get(qid));
  return (
    <PageFrame eyebrow={`Quest ${q.id}${q.custom ? " · Forever-only" : ""}`} title={<span className="text-bronze-300">{q.name}</span>}>
      <section className="parchment rounded-sm border border-bronze-500 p-5 shadow-[inset_0_0_0_1px_rgba(198,161,90,0.35)]">
        <QuestDetails quest={q} quests={merged} zones={zones} />
      </section>
    </PageFrame>
  );
}
