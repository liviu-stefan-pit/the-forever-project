import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { GuideReader } from "../components/guide/GuideReader";
import { ErrorState, GuideSkeleton } from "../components/ui/States";
import { dataOf, useGuide, useGuideIndex, useInsights, useQuests, useQuestsGeo, useZones } from "../data/hooks";
import { overlayQuestGeo } from "../data/loader";
import { nextIgnoreDeepStep, stepQueryIsStaleForProfile, stepQueryShouldClearOnProfileChange } from "../lib/guideList";
import { useProfileApi } from "../state/profile";
import { SITE_NAME, SITE_TITLE } from "../config";

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const profileId = useProfileApi().active?.id ?? "guest";
  const [params, setParams] = useSearchParams();
  const prevProfileId = useRef<string | undefined>(undefined);
  const ignoreSticky = useRef(false);
  const profileChanged = stepQueryShouldClearOnProfileChange(prevProfileId.current, profileId);
  const staleStep = params.has("step") && stepQueryIsStaleForProfile(params.get("stepFor"), profileId);
  const clearStepQuery = profileChanged || staleStep;
  const ignore = nextIgnoreDeepStep(clearStepQuery, params.has("step"), ignoreSticky.current);

  // Commit refs after paint layout, not during render. Strict Mode double-invokes render;
  // a ref write on the discarded pass would hide the real id change or drop the ignore flag.
  useLayoutEffect(() => {
    ignoreSticky.current = ignore.sticky;
    prevProfileId.current = profileId;
    if (!clearStepQuery) return;
    setParams(
      (p) => {
        if (!p.has("step") && !p.has("stepFor")) return p;
        const next = new URLSearchParams(p);
        next.delete("step");
        next.delete("stepFor");
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [clearStepQuery, ignore.sticky, profileId, setParams]);

  const guide = useGuide(slug);
  const index = dataOf(useGuideIndex());
  const questsMin = dataOf(useQuests());
  const geo = dataOf(useQuestsGeo());
  const quests = useMemo(() => (questsMin ? overlayQuestGeo(questsMin, geo) : undefined), [questsMin, geo]);
  const zones = dataOf(useZones());
  const insights = dataOf(useInsights());

  useEffect(() => {
    if (guide.status === "ready") document.title = `${guide.data.displayName} · ${SITE_NAME}`;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [guide]);

  if (guide.status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
        <GuideSkeleton />
      </div>
    );
  }
  if (guide.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
        <ErrorState title={`Could not load guide “${slug}”`} error={guide.error} retry={guide.retry} />
      </div>
    );
  }
  return (
    <GuideReader
      key={`${profileId}:${slug}`}
      guide={guide.data}
      index={index}
      quests={quests}
      zones={zones}
      insights={insights}
      ignoreDeepStep={ignore.ignore}
    />
  );
}
