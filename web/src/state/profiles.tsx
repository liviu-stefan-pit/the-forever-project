import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { dataOf, useQuests } from "../data/hooks";
import { loadGuideIndex, loadQuestSteps, peekLoadedGuides, subscribe } from "../data/loader";
import { ProfileApiContext, type ProfileApi } from "./profile";
import { createMemoryStorage, createProfileEngine, STORAGE_KEY, type ProfileEngine, type StorageLike } from "./profileStore";
import { EngineContext, ProgressContext, type ProgressStore } from "./progress";
import { VisibilityContext, createProfileEvaluator } from "./visibility";

function browserStorage(): StorageLike {
  try {
    const s = globalThis.localStorage;
    s.getItem(STORAGE_KEY);
    return s;
  } catch {
    return createMemoryStorage();
  }
}

export function ProfileProgressProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<ProfileEngine | null>(null);
  if (!engineRef.current) engineRef.current = createProfileEngine({ storage: browserStorage() });
  const engine = engineRef.current;

  useEffect(() => {
    const sync = () => {
      const loaded = peekLoadedGuides();
      engine.noteGuides(loaded);
      engine.setKnownSteps(loaded.flatMap((g) => g.steps));
    };
    sync();
    return subscribe(sync);
  }, [engine]);

  useEffect(() => {
    let alive = true;
    let unsub = () => {};
    loadGuideIndex()
      .then((index) => {
        if (!alive) return;
        const apply = () => engine.reconcileGuides(index, peekLoadedGuides());
        apply();
        unsub = subscribe(apply);
      })
      .catch(() => {});
    return () => {
      alive = false;
      unsub();
    };
  }, [engine]);

  useEffect(() => {
    let alive = true;
    loadQuestSteps().then((map) => {
      if (!alive) return;
      engine.setStepsForQuest((qid) => map.get(qid) ?? []);
    });
    return () => {
      alive = false;
    };
  }, [engine]);

  const quests = dataOf(useQuests());
  useEffect(() => {
    engine.setQuestCatalog(quests);
  }, [engine, quests]);

  const api = useMemo<ProfileApi>(
    () => ({
      get revision() {
        return engine.revision();
      },
      get loadError() {
        return engine.loadError();
      },
      get profiles() {
        return engine.profiles();
      },
      get active() {
        return engine.active();
      },
      get progressProfile() {
        return engine.progressProfile();
      },
      create: (input) => engine.create(input),
      rename: (id, name) => engine.rename(id, name),
      duplicate: (id) => engine.duplicate(id),
      remove: (id) => engine.remove(id),
      switchTo: (id) => engine.switchTo(id),
      setOptions: (partial) => engine.setOptions(partial),
      setCharacter: (patch) => engine.setCharacter(patch),
      addNearMiss: (qid) => engine.addNearMiss(qid),
      removeNearMiss: (qid) => engine.removeNearMiss(qid),
      importParsed: (json) => engine.importParsed(json),
      importGameCharacter: (ch, mark) => engine.importGameCharacter(ch, mark),
      syncFromGame: (exp) => engine.syncFromGame(exp),
      linkGameCharacter: (link) => engine.linkGameCharacter(link),
    }),
    [engine],
  );

  const progress = useMemo<ProgressStore>(
    () => ({
      get revision() {
        return engine.revision();
      },
      isDone: (id, q) => engine.isDone(id, q),
      stepStatus: (step, q) => engine.stepStatus(step, q),
      requirement: (step, q) => engine.requirement(step, q),
      toggle: (id, step, q) => engine.toggle(id, step, q),
      setDone: (ids, done) => engine.setDone(ids, done),
      countDone: (slug, q) => engine.countDone(slug, q),
      get current() {
        return engine.current;
      },
      setCurrent: (cursor) => engine.setCurrent(cursor),
      get routeStyle() {
        return engine.routeStyle;
      },
      setRouteStyle: (style) => engine.setRouteStyle(style),
    }),
    [engine],
  );

  const vis = useMemo(
    () =>
      createProfileEvaluator({
        get race() {
          return engine.progressProfile().race;
        },
        get cls() {
          return engine.progressProfile().cls;
        },
        get routeStyle() {
          return engine.routeStyle;
        },
        get role() {
          return engine.progressProfile().role;
        },
        get dungeons() {
          return engine.progressProfile().options.dungeons ?? false;
        },
        get showOptional() {
          return engine.progressProfile().options.showOptional;
        },
        get hideDone() {
          return engine.progressProfile().options.hideDone;
        },
        isDone: (id) => engine.isDone(id),
        stepStatus: (step) => engine.stepStatus(step),
        get revision() {
          return engine.revision();
        },
      }),
    [engine],
  );

  return (
    <EngineContext.Provider value={engine}>
      <ProfileApiContext.Provider value={api}>
        <ProgressContext.Provider value={progress}>
          <VisibilityContext.Provider value={vis}>{children}</VisibilityContext.Provider>
        </ProgressContext.Provider>
      </ProfileApiContext.Provider>
    </EngineContext.Provider>
  );
}
