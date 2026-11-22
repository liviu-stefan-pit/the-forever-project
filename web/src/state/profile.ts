/**
 * Active-profile summary for the top bar and race-start choice — **P7 replaces
 * `useActiveProfileSummary`** with the real profile store (keep the return shape).
 */
import { createContext, useContext, useSyncExternalStore } from "react";
import type { ClassKey, GuideIndex, ProfessionKey, Profile, RaceKey, Role } from "../data/schema";
import type { GameExport, GameExportCharacter } from "./luaExport";
import type { CharacterLink, GameSyncResult } from "./gameSync";
import { EngineContext } from "./progress";

export interface ActiveProfileSummary {
  id: string;
  name: string;
  race?: RaceKey;
  cls?: ClassKey;
  level?: number;
}

export interface ProfileApi {
  readonly revision: number;
  readonly loadError: string | null;
  readonly profiles: readonly Profile[];
  readonly active: Profile | null;
  /** Active profile, or the in-memory guest used when none is selected. */
  readonly progressProfile: Profile;
  create(input: { name: string; race: RaceKey; cls: ClassKey; level?: number }): Profile;
  rename(id: string, name: string): void;
  duplicate(id: string): Profile | undefined;
  remove(id: string): void;
  switchTo(id: string): void;
  setOptions(partial: Partial<Profile["options"]>): void;
  /** Change class, role (null clears) or professions of the active profile. */
  setCharacter(patch: { cls?: ClassKey; role?: Role | null; professions?: ProfessionKey[] }): void;
  addNearMiss(questId: number): void;
  removeNearMiss(questId: number): void;
  importParsed(json: string): Profile;
  importGameCharacter(ch: GameExportCharacter, markCompleted: boolean): Profile;
  syncFromGame(exp: GameExport): GameSyncResult;
  /** Link the active profile to an in-game character (null unlinks). */
  linkGameCharacter(link: CharacterLink | null): void;
}

export const ProfileApiContext = createContext<ProfileApi | null>(null);

const noopSubscribe = () => () => {};

export function useProfileApi(): ProfileApi {
  const api = useContext(ProfileApiContext);
  if (!api) throw new Error("useProfileApi() needs a profile provider");
  const engine = useContext(EngineContext);
  // Re-render on profile / options / route, not on a single step tick.
  useSyncExternalStore(
    engine?.subscribe ?? noopSubscribe,
    () => engine?.selectProfileUiKey() ?? api.revision,
    () => engine?.selectProfileUiKey() ?? api.revision,
  );
  return api;
}

export function useActiveProfileSummary(): ActiveProfileSummary | null {
  const engine = useContext(EngineContext);
  const api = useContext(ProfileApiContext);
  const get = () => {
    if (engine) return engine.selectProfileSummary();
    const p = api?.active ?? null;
    if (!p) return null;
    return { id: p.id, name: p.name, race: p.race, cls: p.cls, level: p.level };
  };
  return useSyncExternalStore(engine?.subscribe ?? noopSubscribe, get, get);
}

/** The race start for a race (first start when unknown). */
export function pickRaceStart(index: GuideIndex, race?: RaceKey): GuideIndex["starts"][number] | undefined {
  return (race ? index.starts.find((s) => s.race.includes(race)) : undefined) ?? index.starts[0];
}
