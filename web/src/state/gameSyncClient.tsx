import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parseGuideWebExport, type GameExportCharacter } from "./luaExport";
import { formatMoney, linkFor, type CharacterLink, type GameSyncResult } from "./gameSync";
import { useProfileApi } from "./profile";
import {
  fileHandleSupported,
  forgetGameFile,
  gameFileHandleMtime,
  loadSavedGameFile,
  pickGameFile,
  readGameFileHandle,
  saveGameFile,
  type GameFileHandle,
} from "./gameFileHandle";

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
  /** Hosted site, file mode: GuideWebExport.lua has not been chosen yet. */
  | { phase: "no-file" }
  /** Hosted site, file mode: the browser wants a click before reading the file again. */
  | { phase: "needs-permission" }
  /** Hosted site, file mode: the chosen file was moved or deleted. */
  | { phase: "file-missing" }
  /** Hosted site, file mode: the chosen file could not be read or parsed. */
  | { phase: "file-error" }
  | { phase: "result"; result: GameSyncResult; exportedAtText?: string };

interface StatusJson {
  found?: boolean;
  mtimeMs?: number | null;
}

/**
 * Where Sync reads GuideWebExport.lua from: the local app server, a file the player picked in this
 * browser (hosted site, File System Access API), or nowhere (manual upload only).
 */
export type GameSyncMode = "server" | "file" | "none";

export interface GameSyncUi {
  mode: GameSyncMode;
  /** Name of the picked file in "file" mode, null until one is chosen. */
  fileName: string | null;
  /** Open the file picker and remember the chosen GuideWebExport.lua ("file" mode). */
  chooseFile: () => void;
  /** Forget the remembered file ("file" mode). */
  forgetFile: () => void;
  /**
   * False when there is neither a game-sync endpoint (local app) nor File System Access support
   * (hosted site in Firefox / Safari / mobile). The Sync button and panel hide then; importing
   * GuideWebExport.lua on the Profile page still works.
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
  if (state.phase === "no-file") return "Choose GuideWebExport.lua once, then Sync reads it with one click.";
  if (state.phase === "needs-permission") return "Click Sync to let the browser read GuideWebExport.lua again.";
  if (state.phase === "file-missing") return "GuideWebExport.lua was moved or deleted. Choose it again on the Profile page.";
  if (state.phase === "file-error") return "Could not read GuideWebExport.lua. Type /reload in game and try again.";

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
  // Without the endpoint, browsers with the File System Access API switch to "file" mode.
  const [mode, setMode] = useState<GameSyncMode>(import.meta.env.DEV ? "server" : "none");
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [fileName, setFileName] = useState<string | null>(null);
  /** False once the status request showed there is no local app server on this host. */
  const serverRef = useRef<boolean | null>(null);
  const handleRef = useRef<GameFileHandle | null>(null);
  const handleLoadedRef = useRef(false);

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

    const applyText = (text: string, mtimeMs: number | null, errorPhase: GameSyncPhase) => {
      try {
        const exp = parseGuideWebExport(text);
        if (!current()) return;
        setCharacters(exp.characters.map(linkFor));
        const result = syncFromGameRef.current(exp);
        if (current()) {
          setMatched(result.ok ? result.character : null);
          setPhase({ phase: "result", result });
        }
      } catch {
        if (current()) setPhase(errorPhase);
      }
      if (!current()) return;
      // The mtime read before the download: a newer write since then makes the poller sync again.
      mtimeRef.current = mtimeMs;
      baselineRef.current = true;
    };

    const loaded = serverRef.current === false ? ({ kind: "no-server" } as const) : await loadGameFile((url) => fetch(url));
    if (!alive.current) return;

    if (loaded.kind === "no-server") {
      serverRef.current = false;
      if (!fileHandleSupported()) {
        setMode("none");
        setPhase({ phase: "unavailable" });
        return;
      }
      setMode("file");
      if (!handleLoadedRef.current) {
        handleLoadedRef.current = true;
        const saved = await loadSavedGameFile();
        if (!alive.current) return;
        // A file picked while the saved handle was loading wins.
        if (!handleRef.current && saved) handleRef.current = saved;
        setFileName(handleRef.current?.name ?? null);
      }
      if (!current()) return;
      const handle = handleRef.current;
      if (!handle) {
        mtimeRef.current = null;
        baselineRef.current = true;
        setPhase({ phase: "no-file" });
        return;
      }
      const read = await readGameFileHandle(handle, false);
      if (!current()) return;
      if (read.kind === "file") {
        applyText(read.text, read.mtimeMs, { phase: "file-error" });
        return;
      }
      mtimeRef.current = null;
      baselineRef.current = true;
      if (read.kind === "needs-permission") setPhase({ phase: "needs-permission" });
      else if (read.kind === "not-found") setPhase({ phase: "file-missing" });
      else setPhase({ phase: "file-error" });
      return;
    }

    serverRef.current = true;
    setMode("server");
    if (!current()) return;
    if (loaded.kind === "not-found") {
      mtimeRef.current = null;
      baselineRef.current = true;
      setCharacters([]);
      setMatched(null);
      setPhase({ phase: "not-found" });
      return;
    }
    if (loaded.kind === "unreachable") {
      baselineRef.current = true;
      setPhase({ phase: "unreachable" });
      return;
    }
    applyText(loaded.text, loaded.mtimeMs, { phase: "unreachable" });
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

    /** Last-modified time of the export, or null when there is none / it cannot be read silently. */
    const currentMtime = async (): Promise<number | null | "skip"> => {
      if (serverRef.current === false) {
        const handle = handleRef.current;
        return handle ? gameFileHandleMtime(handle) : "skip";
      }
      try {
        const res = await fetch(STATUS_URL);
        if (!res.ok) return "skip";
        const json: unknown = await res.json();
        if (!isStatusJson(json)) return "skip";
        return json.found && typeof json.mtimeMs === "number" ? json.mtimeMs : null;
      } catch {
        return "skip";
      }
    };

    const poll = async () => {
      if (document.visibilityState !== "visible" || inflight.current) return;
      const next = await currentMtime();
      if (next === "skip" || !baselineRef.current) return;
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

  const chooseFile = useCallback(() => {
    // Straight from the click: the picker needs the user gesture.
    void pickGameFile().then(async (handle) => {
      if (!handle || !alive.current) return;
      handleRef.current = handle;
      handleLoadedRef.current = true;
      mtimeRef.current = null;
      setFileName(handle.name);
      await saveGameFile(handle);
      void runSyncRef.current();
    });
  }, []);

  const forgetFile = useCallback(() => {
    handleRef.current = null;
    mtimeRef.current = null;
    setFileName(null);
    setCharacters([]);
    setMatched(null);
    setPhase({ phase: "no-file" });
    void forgetGameFile();
  }, []);

  const sync = useCallback(() => {
    if (modeRef.current === "file") {
      const handle = handleRef.current;
      if (!handle) {
        chooseFile();
        return;
      }
      // Ask for read access inside the click (a no-op when already granted), then sync.
      const ask = handle.requestPermission?.({ mode: "read" }) ?? Promise.resolve("granted");
      void ask.catch(() => "denied").finally(() => void runSyncRef.current());
      return;
    }
    void runSyncRef.current();
  }, [chooseFile]);

  const statusText = gameSyncStatusText(phase);
  const title = gameSyncTitle(phase);
  const linkCharacter = useCallback(
    (link: CharacterLink | null) => {
      linkGameCharacter(link);
      void runSyncRef.current();
    },
    [linkGameCharacter],
  );
  const value: GameSyncUi = {
    mode,
    fileName,
    chooseFile,
    forgetFile,
    available: mode !== "none",
    busy,
    statusText,
    title,
    sync,
    characters,
    matched,
    linkCharacter,
  };

  return <GameSyncUiContext.Provider value={value}>{children}</GameSyncUiContext.Provider>;
}
