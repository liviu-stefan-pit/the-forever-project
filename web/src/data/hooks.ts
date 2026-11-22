/**
 * React hooks over `loader.ts`. Each returns a small tagged union so pages can render
 * skeleton / error / ready states explicitly.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  invalidate,
  keys,
  loadGuide,
  loadGuideIndex,
  loadClassProfessions,
  loadInsights,
  loadQuests,
  loadQuestsDetail,
  loadQuestsGeo,
  loadQuestSteps,
  loadTrainers,
  loadZones,
  type TrainerTierRow,
  peek,
  subscribe,
  type QuestDetailMap,
  type QuestGeoMap,
  type QuestMap,
  type QuestStepsMap,
  type ZoneMap,
} from "./loader";
import type { ClassProfessionsFile, Guide, GuideIndex, Insights } from "./schema";

export type Resource<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error; retry: () => void };

function useResource<T>(key: string | null, load: () => Promise<T>): Resource<T> {
  const [, force] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<{ key: string; error: Error } | null>(null);
  const value = key ? peek<T>(key) : undefined;

  // `load` is derived from `key`, so it is intentionally not a dependency.
  useEffect(() => {
    if (!key || peek(key) !== undefined) return;
    let alive = true;
    load().then(
      () => alive && force((n) => n + 1),
      (e: unknown) => alive && setError({ key, error: e instanceof Error ? e : new Error(String(e)) }),
    );
    return () => {
      alive = false;
    };
  }, [key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    if (key) invalidate(key);
    setError(null);
    setAttempt((n) => n + 1);
  }, [key]);

  if (!key) return { status: "loading" };
  if (value !== undefined) return { status: "ready", data: value };
  if (error && error.key === key) return { status: "error", error: error.error, retry };
  return { status: "loading" };
}

export const useGuideIndex = (): Resource<GuideIndex> => useResource(keys.index, loadGuideIndex);
export const useGuide = (slug: string | undefined): Resource<Guide> =>
  useResource(slug ? keys.guide(slug) : null, () => loadGuide(slug!));
export const useQuests = (): Resource<QuestMap> => useResource(keys.quests, loadQuests);
export const useQuestsGeo = (): Resource<QuestGeoMap> => useResource(keys.questsGeo, loadQuestsGeo);
export const useQuestsDetail = (): Resource<QuestDetailMap> => useResource(keys.questsDetail, loadQuestsDetail);
export const useQuestSteps = (): Resource<QuestStepsMap> => useResource(keys.questSteps, loadQuestSteps);
export const useZones = (): Resource<ZoneMap> => useResource(keys.zones, loadZones);
export const useInsights = (): Resource<Insights> => useResource(keys.insights, loadInsights);
export const useClassProfessions = (): Resource<ClassProfessionsFile> => useResource(keys.classProfessions, loadClassProfessions);
export const useTrainerTiers = (): Resource<TrainerTierRow[]> => useResource(keys.trainers, loadTrainers);

/** Data or undefined, for optional enrichments (quest names, zone info) that must not block rendering. */
export function dataOf<T>(r: Resource<T>): T | undefined {
  return r.status === "ready" ? r.data : undefined;
}

/**
 * A guide only if it is already loaded — never triggers a fetch (keeps guides lazy).
 * Re-renders when it arrives.
 */
export function usePeekGuide(slug: string): Guide | undefined {
  return useSyncExternalStore(subscribe, () => peek<Guide>(keys.guide(slug)));
}
