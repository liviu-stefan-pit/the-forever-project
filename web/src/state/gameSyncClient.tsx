import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parseGuideWebExport, type GameExportCharacter } from "./luaExport";
import { formatMoney, linkFor, type CharacterLink, type GameSyncResult } from "./gameSync";
import { useProfileApi } from "./profile";

const STATUS_URL = "/api/game-sync/status";
const FILE_URL = "/api/game-sync";
const POLL_MS = 8000;
export const GAME_FILE_REMINDER =
  "WoW writes the SavedVariables file (GuideWebExport.lua) only on /reload or logout, so type /reload in game before you press Sync.";

export const GAME_SYNC_UNAVAILABLE =
  "Automatic sync needs the local app. Import GuideWebExport.lua on the Profile page instead.";

export type GameSyncPhase =
  | { phase: "idle" }
  | { phase: "syncing" }
  | { phase: "not-found" }
  | { phase: "unreachable" }
  /** No game-sync endpoint on this host (static build): automatic sync is hidden, upload still works. */
  | { phase: "unavailable" }
  | { phase: "result"; result: GameSyncResult; exportedAtText?: string };

interface StatusJson {
  found?: boolean;
  mtimeMs?: number | null;
}

export interface GameSyncUi {
  /**
   * False when this host has no game-sync endpoint (the static site). The automatic Sync button
   * and panel hide then; importing GuideWebExport.lua on the Profile page still works.
   */
  available: boolean;
  busy: boolean;
  statusText: string;
  title: string;
  sync: () => void;
  /** Characters in the last export read (name + realm), for linking a profile. */
  characters: CharacterLink[];
  /** The export character the last successful sync used (quest log, XP readout). */
  matched: GameExportCharacter | null;
  /** Link the active profile to a character (null unlinks), then sync. */
  linkCharacter: (link: CharacterLink | null) => void;
}

export type GameFileLoad =
  /** The status request failed, was not OK, or was not the endpoint's JSON (a static host answers with index.html). */
  | { kind: "no-server" }
  | { kind: "not-found" }
  | { kind: "unreachable" }
  | { kind: "file"; text: string; mtimeMs: number | null };

type FetchLike = (url: string) => Promise<Pick<Response, "ok" | "status" | "json" | "text">>;

/** The status endpoint answers `{ found: boolean, mtimeMs }`; anything else means there is no endpoint. */
function isStatusJson(v: unknown): v is StatusJson {
  return typeof v === "object" && v !== null && typeof (v as StatusJson).found === "boolean";
}

/**
 * Ask the local server whether GuideWebExport.lua exists, and only then download it.
 * No file request is made when the status says there is no file (avoids a 404 on every load).
 */
export async function loadGameFile(fetchFn: FetchLike): Promise<GameFileLoad> {
  let status: StatusJson;
  try {
    const res = await fetchFn(STATUS_URL);
    if (!res.ok) return { kind: "no-server" };
    const body: unknown = await res.json();
    if (!isStatusJson(body)) return { kind: "no-server" };
    status = body;
  } catch {
    return { kind: "no-server" };
  }
  if (!status.found) return { kind: "not-found" };
  const mtimeMs = typeof status.mtimeMs === "number" ? status.mtimeMs : null;

  let res: Awaited<ReturnType<FetchLike>>;
  try {
    res = await fetchFn(FILE_URL);
  } catch {
    return { kind: "unreachable" };
  }
  if (res.status === 404) return { kind: "not-found" };
  if (!res.ok) return { kind: "unreachable" };
  try {
    return { kind: "file", text: await res.text(), mtimeMs };
  } catch {
    return { kind: "unreachable" };
  }
}

const GameSyncUiContext = createContext<GameSyncUi | null>(null);

export function useGameSyncUi(): GameSyncUi {
  const ui = useContext(GameSyncUiContext);
  if (!ui) throw new Error("useGameSyncUi() needs GameSyncProvider");
  return ui;
}

function formatExportedAt(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString();
}

function withExportTime(message: string, time: string | undefined): string {
  return time ? `${message} · ${time}` : message;
}

/**
 * Recompute sync after the active profile id changes.
 * `undefined` is the first observation (the mount effect already syncs once).
 */
export function shouldResyncOnProfileChange(
  previousProfileId: string | null | undefined,
  nextProfileId: string | null,
): boolean {
  if (previousProfileId === undefined) return false;
  return previousProfileId !== nextProfileId;
}

/** An in-flight file read must not publish status for a profile that is no longer active. */
export function gameSyncApplyIsCurrent(startedProfileId: string | null, currentProfileId: string | null): boolean {
  return startedProfileId === currentProfileId;
}

/** Visible status line for the sync button. Pass `exportedAtText` to keep tests timezone-stable. */
export function gameSyncStatusText(state: GameSyncPhase): string {
  if (state.phase === "idle") return "";
  if (state.phase === "syncing") return "Syncing";
  if (state.phase === "not-found") return "The GuideWebExport addon was not found. Install it, type /gwe in game, then /reload.";
  if (state.phase === "unreachable") return "Could not reach the local app server";
  if (state.phase === "unavailable") return GAME_SYNC_UNAVAILABLE;

  const { result } = state;
  const time = state.exportedAtText ?? (result.exportedAt != null ? formatExportedAt(result.exportedAt) : undefined);

  if (!result.ok) {
    if (result.reason === "no-profile") return withExportTime("No active profile", time);
    if (result.reason === "name-mismatch") {
      const profile = result.profileName ?? "unknown";
      const names = result.exportNames ?? (result.exportName ? [result.exportName] : []);
      const listed = names.length ? names.join(", ") : "no characters";
      return withExportTime(
        `This profile is ${profile}; export has ${listed}. Pick the character under Game sync on the Profile page.`,
        time,
      );
    }
    if (result.reason === "ambiguous") {
      return withExportTime(`${result.exportName ?? result.profileName ?? "This name"} exists on several realms, link a character on the Profile page`, time);
    }
    if (result.reason === "link-missing") {
      return withExportTime(`Linked character ${result.linkKey ?? "unknown"} is not in the export`, time);
    }
    if (result.reason === "empty") return withExportTime("No completed quests in the export", time);
    return withExportTime("The GuideWebExport addon was not found. Install it, type /gwe in game, then /reload.", time);
  }

  const marked = result.newlyMarked ?? 0;
  const parts: string[] = [];
  if (marked > 0) parts.push(`Marked ${marked} ${marked === 1 ? "quest" : "quests"}`);
  if (result.snapshotApplied) {
    const c = result.character;
    const bits = [
      c.level !== undefined ? `level ${c.level}` : undefined,
      c.money !== undefined ? formatMoney(c.money) : undefined,
    ].filter(Boolean);
    parts.push(bits.length ? `Updated ${bits.join(", ")}` : "Updated character");
  }
  if (result.changeSummary) parts.push(result.changeSummary);
  return withExportTime(parts.length ? parts.join(" · ") : "Up to date", time);
}

export function gameSyncTitle(state: GameSyncPhase): string {
  const line = gameSyncStatusText(state);
  return line ? `${line}. ${GAME_FILE_REMINDER}` : GAME_FILE_REMINDER;
}

export function GameSyncProvider({ children }: { children: ReactNode }) {
  const { syncFromGame, linkGameCharacter, active } = useProfileApi();
  const activeProfileId = active?.id ?? null;
  const [phase, setPhase] = useState<GameSyncPhase>({ phase: "syncing" });
  const [characters, setCharacters] = useState<CharacterLink[]>([]);
  const [matched, setMatched] = useState<GameExportCharacter | null>(null);
  const [busy, setBusy] = useState(true);
  // Dev always has the endpoint, so the button shows at once; a production build shows it only
  // after the status request proves the endpoint exists (`vite preview` does, a static host does not).
  const [available, setAvailable] = useState<boolean>(import.meta.env.DEV);
  const unavailableRef = useRef(false);

  const alive = useRef(true);
  const inflight = useRef(false);
  const queued = useRef(false);
  const mtimeRef = useRef<number | null>(null);
  const baselineRef = useRef(false);
  const syncFromGameRef = useRef(syncFromGame);
  syncFromGameRef.current = syncFromGame;
  const activeProfileIdRef = useRef(activeProfileId);
  activeProfileIdRef.current = activeProfileId;

  const applyFile = useCallback(async () => {
    const startedProfileId = activeProfileIdRef.current;
    const current = () => alive.current && gameSyncApplyIsCurrent(startedProfileId, activeProfileIdRef.current);
    if (current()) setPhase({ phase: "syncing" });
    const loaded = await loadGameFile((url) => fetch(url));
    if (!alive.current) return;
    if (loaded.kind === "no-server") {
      unavailableRef.current = true;
      setAvailable(false);
      setPhase({ phase: "unavailable" });
      return;
    }
    setAvailable(true);
    if (!current()) return;
    if (loaded.kind === "not-found") {
      mtimeRef.current = null;
      baselineRef.current = true;
      if (current()) {
        setCharacters([]);
        setMatched(null);
        setPhase({ phase: "not-found" });
      }
      return;
    }
    if (loaded.kind === "unreachable") {
      baselineRef.current = true;
      if (current()) setPhase({ phase: "unreachable" });
      return;
    }

    try {
      const exp = parseGuideWebExport(loaded.text);
      if (!current()) return;
      if (alive.current) setCharacters(exp.characters.map(linkFor));
      const result = syncFromGameRef.current(exp);
      if (current()) {
        setMatched(result.ok ? result.character : null);
        setPhase({ phase: "result", result });
      }
    } catch {
      if (current()) setPhase({ phase: "unreachable" });
    }
    if (!current()) return;
    // The mtime read before the download: a newer write since then makes the poller sync again.
    mtimeRef.current = loaded.mtimeMs;
    baselineRef.current = true;
  }, []);

  const runSync = useCallback(async () => {
    if (inflight.current) {
      queued.current = true;
      return;
    }
    inflight.current = true;
    if (alive.current) setBusy(true);
    try {
      do {
        queued.current = false;
        await applyFile();
      } while (queued.current && alive.current);
    } finally {
      inflight.current = false;
      if (alive.current) setBusy(false);
    }
  }, [applyFile]);

  const runSyncRef = useRef(runSync);
  runSyncRef.current = runSync;

  useEffect(() => {
    alive.current = true;
    void runSyncRef.current();
    return () => {
      alive.current = false;
    };
  }, []);

  const seenProfileId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const previous = seenProfileId.current;
    seenProfileId.current = activeProfileId;
    if (!shouldResyncOnProfileChange(previous, activeProfileId)) return;
    setMatched(null);
    void runSyncRef.current();
  }, [activeProfileId]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const poll = async () => {
      if (document.visibilityState !== "visible" || unavailableRef.current) return;
      let body: StatusJson;
      try {
        const res = await fetch(STATUS_URL);
        if (!res.ok) return;
        const json: unknown = await res.json();
        if (!isStatusJson(json)) return;
        body = json;
      } catch {
        return;
      }
      const next = body.found && typeof body.mtimeMs === "number" ? body.mtimeMs : null;
      if (!baselineRef.current) return;
      if (next === mtimeRef.current) return;
      void runSyncRef.current();
    };

    const start = () => {
      if (timer !== undefined) return;
      timer = setInterval(() => void poll(), POLL_MS);
    };
    const stop = () => {
      if (timer === undefined) return;
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void poll();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const sync = useCallback(() => {
    void runSyncRef.current();
  }, []);

  const statusText = gameSyncStatusText(phase);
  const title = gameSyncTitle(phase);
  const linkCharacter = useCallback(
    (link: CharacterLink | null) => {
      linkGameCharacter(link);
      void runSyncRef.current();
    },
    [linkGameCharacter],
  );
  const value: GameSyncUi = { available, busy, statusText, title, sync, characters, matched, linkCharacter };

  return <GameSyncUiContext.Provider value={value}>{children}</GameSyncUiContext.Provider>;
}
