import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parseGuideWebExport, type GameExportCharacter } from "./luaExport";
import { formatMoney, linkFor, type CharacterLink, type GameSyncResult } from "./gameSync";
import { useProfileApi } from "./profile";
import {
  fileHandleSupported,
  forgetGameFile,
  gameFileHandleMtime,
  handleFromDrop,
  loadSavedGameFile,
  pickGameFile,
  readGameFileHandle,
  saveGameFile,
  type GameFileHandle,
} from "./gameFileHandle";
import { fetchServerStatus, isLocalAppHost, loadServerFile } from "./gameSyncServer";

const POLL_MS = 8000;
export const GAME_FILE_REMINDER =
  "WoW writes the SavedVariables file (GuideWebExport.lua) only on /reload or logout, so type /reload in game before you press Sync.";

export const GAME_SYNC_UNAVAILABLE =
  "One-click sync needs desktop Chrome or Edge. Import GuideWebExport.lua on the Profile page instead.";

export const GAME_FILE_BLOCKED =
  "No file chosen. If Chrome said the folder contains system files (WoW under Program Files), drag GuideWebExport.lua from File Explorer onto Game sync on the Profile page instead. Chrome remembers a dropped file.";

export const GAME_SERVER_MISSING =
  "The local app found no GuideWebExport.lua in the WoW folder. Install the addon, type /gwe then /reload in game, or set wow_root in config.local.json.";

export const GAME_SERVER_DOWN =
  "The local app's sync server did not answer. Restart run-app.bat (or npm run dev), reload this page, then press Sync.";

function onLocalApp(): boolean {
  try {
    return isLocalAppHost(globalThis.location?.hostname ?? "");
  } catch {
    return false;
  }
}

export type GameSyncPhase =
  | { phase: "idle" }
  | { phase: "syncing" }
  /** This browser cannot remember a file (no File System Access API): Sync is hidden, upload still works. */
  | { phase: "unavailable" }
  /** GuideWebExport.lua has not been chosen yet. */
  | { phase: "no-file" }
  /** The browser wants a click before reading the file again. */
  | { phase: "needs-permission" }
  /** The chosen file was moved or deleted. */
  | { phase: "file-missing" }
  /** The chosen file could not be read or parsed. */
  | { phase: "file-error" }
  /** The local app's endpoint looked in the WoW folder and found no GuideWebExport.lua. */
  | { phase: "server-missing" }
  /** On localhost, but the local app's sync endpoint did not answer. */
  | { phase: "server-down" }
  /**
   * The picker closed without a file. Chrome also lands here when it refuses a protected folder
   * (WoW installed under Program Files): "can't open files in this folder because it contains system files".
   */
  | { phase: "picker-closed" }
  | { phase: "result"; result: GameSyncResult; exportedAtText?: string };

/**
 * Where Sync reads GuideWebExport.lua from: a file the player picked or dropped in this browser
 * (File System Access API, desktop Chrome / Edge), the local app's server reading the WoW folder
 * (`npm run dev`, run-app.bat; no picking at all), or nowhere (manual upload only).
 * A picked file wins over the server, so a player can point Sync at another account.
 */
export type GameSyncMode = "file" | "server" | "none";

export interface GameSyncUi {
  mode: GameSyncMode;
  /** Name of the picked file in "file" mode, null until one is chosen. */
  fileName: string | null;
  /** Full path the local app reads in "server" mode. */
  serverPath: string | null;
  /** True when a file picker / drop is possible here (desktop Chrome / Edge). */
  canPick: boolean;
  /**
   * A file dragged onto the page. Call synchronously from the drop event: the handle is remembered
   * like a picked file (works under Program Files); without one the file is read once.
   */
  dropFile: (data: DataTransfer) => void;
  /** Open the file picker and remember the chosen GuideWebExport.lua ("file" mode). */
  chooseFile: () => void;
  /** Forget the remembered file ("file" mode). */
  forgetFile: () => void;
  /** Sync from a file picked with a plain file input. Works in folders Chrome will not remember (Program Files). */
  readFileOnce: (file: File) => void;
  /**
   * False without File System Access support (Firefox, Safari, mobile). The Sync button and panel hide then; importing
   * GuideWebExport.lua on the Profile page still works.
   */
  available: boolean;
  busy: boolean;
  statusText: string;
  /** Status for the top bar: empty until a file is chosen (the button tooltip explains the first step). */
  barText: string;
  title: string;
  sync: () => void;
  /** Characters in the last export read (name + realm), for linking a profile. */
  characters: CharacterLink[];
  /** The export character the last successful sync used (quest log, XP readout). */
  matched: GameExportCharacter | null;
  /** Link the active profile to a character (null unlinks), then sync. */
  linkCharacter: (link: CharacterLink | null) => void;
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
  if (state.phase === "unavailable") return GAME_SYNC_UNAVAILABLE;
  if (state.phase === "no-file") return "Choose GuideWebExport.lua once, then Sync reads it with one click.";
  if (state.phase === "needs-permission") return "Click Sync to let the browser read GuideWebExport.lua again.";
  if (state.phase === "file-missing") return "GuideWebExport.lua was moved or deleted. Choose it again on the Profile page.";
  if (state.phase === "file-error") return "Could not read GuideWebExport.lua. Type /reload in game and try again.";
  if (state.phase === "server-missing") return GAME_SERVER_MISSING;
  if (state.phase === "server-down") return GAME_SERVER_DOWN;
  if (state.phase === "picker-closed") return GAME_FILE_BLOCKED;

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
    if (result.reason === "stale-export") {
      return withExportTime(
        `Skipped: the export says level ${result.exportLevel ?? "?"} but this profile is level ${result.profileLevel ?? "?"}. ` +
          "The game saved the file before your character loaded. Type /reload in game, then Sync",
        time,
      );
    }
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
  const [canPick] = useState(() => fileHandleSupported());
  const [fileName, setFileName] = useState<string | null>(null);
  /** "server" once the local endpoint answered; until then a local page assumes it will. */
  const [serverState, setServerState] = useState<"unknown" | "present" | "absent">(() => (onLocalApp() ? "unknown" : "absent"));
  const serverStateRef = useRef(serverState);
  serverStateRef.current = serverState;
  const [serverPath, setServerPath] = useState<string | null>(null);
  const mode: GameSyncMode = fileName ? "file" : serverState !== "absent" ? "server" : canPick ? "file" : "none";
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

  const applyText = useCallback((text: string, mtimeMs: number | null, current: () => boolean) => {
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
      if (current()) setPhase({ phase: "file-error" });
    }
    if (!current()) return;
    // The mtime read before the download: a newer write since then makes the poller sync again.
    mtimeRef.current = mtimeMs;
    baselineRef.current = true;
  }, []);

  const applyFile = useCallback(async () => {
    const startedProfileId = activeProfileIdRef.current;
    const current = () => alive.current && gameSyncApplyIsCurrent(startedProfileId, activeProfileIdRef.current);
    if (current()) setPhase({ phase: "syncing" });

    if (canPick && !handleLoadedRef.current) {
      handleLoadedRef.current = true;
      const saved = await loadSavedGameFile();
      if (!alive.current) return;
      // A file picked while the saved handle was loading wins.
      if (!handleRef.current && saved) handleRef.current = saved;
      setFileName(handleRef.current?.name ?? null);
    }
    if (!current()) return;

    const handle = handleRef.current;
    if (handle) {
      const read = await readGameFileHandle(handle, false);
      if (!current()) return;
      if (read.kind === "file") {
        applyText(read.text, read.mtimeMs, current);
        return;
      }
      mtimeRef.current = null;
      baselineRef.current = true;
      if (read.kind === "needs-permission") setPhase({ phase: "needs-permission" });
      else if (read.kind === "not-found") setPhase({ phase: "file-missing" });
      else setPhase({ phase: "file-error" });
      return;
    }

    if (serverStateRef.current !== "absent") {
      const load = await loadServerFile((url, init) => fetch(url, init));
      if (!current()) return;
      if (load.kind !== "no-server") {
        setServerState("present");
        if (load.kind === "file") {
          setServerPath(load.path);
          applyText(load.text, load.mtimeMs, current);
          return;
        }
        setServerPath(null);
        mtimeRef.current = null;
        baselineRef.current = true;
        setPhase({ phase: load.kind === "not-found" ? "server-missing" : "file-error" });
        return;
      }
      if (onLocalApp()) {
        // The local app always has the endpoint: a miss means the server is restarting or stopped.
        // Never fall back to the file picker here; Chrome refuses Program Files anyway.
        mtimeRef.current = null;
        baselineRef.current = true;
        setPhase({ phase: "server-down" });
        return;
      }
      setServerState("absent");
    }

    mtimeRef.current = null;
    baselineRef.current = true;
    setPhase({ phase: canPick ? "no-file" : "unavailable" });
  }, [applyText, canPick]);

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

    /** Last-modified time of the file Sync reads, or null when it cannot be read without a prompt. */
    const currentMtime = async (): Promise<number | null | "skip"> => {
      const handle = handleRef.current;
      if (handle) return gameFileHandleMtime(handle);
      if (serverStateRef.current !== "present") return "skip";
      const status = await fetchServerStatus((url, init) => fetch(url, init));
      return status.kind === "status" && status.found ? status.mtimeMs : null;
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

  const remember = useCallback(async (handle: GameFileHandle) => {
    handleRef.current = handle;
    handleLoadedRef.current = true;
    mtimeRef.current = null;
    setFileName(handle.name);
    await saveGameFile(handle);
    void runSyncRef.current();
  }, []);

  const chooseFile = useCallback(() => {
    // Straight from the click: the picker needs the user gesture.
    void pickGameFile().then(async (handle) => {
      if (!alive.current) return;
      if (!handle) {
        if (!handleRef.current) setPhase({ phase: "picker-closed" });
        return;
      }
      await remember(handle);
    });
  }, [remember]);

  const readFileOnce = useCallback(
    (file: File) => {
      const startedProfileId = activeProfileIdRef.current;
      const current = () => alive.current && gameSyncApplyIsCurrent(startedProfileId, activeProfileIdRef.current);
      setPhase({ phase: "syncing" });
      file.text().then(
        (text) => applyText(text, file.lastModified, current),
        () => current() && setPhase({ phase: "file-error" }),
      );
    },
    [applyText],
  );

  const dropFile = useCallback(
    (data: DataTransfer) => {
      // Both must be taken now: the drop's items are emptied once the event returns.
      const pending = handleFromDrop(data.items);
      const file = data.files?.[0] ?? null;
      void pending.then(async (handle) => {
        if (!alive.current) return;
        if (handle) {
          await remember(handle);
          return;
        }
        if (file) readFileOnce(file);
      });
    },
    [readFileOnce, remember],
  );

  const forgetFile = useCallback(() => {
    handleRef.current = null;
    mtimeRef.current = null;
    setFileName(null);
    setCharacters([]);
    setMatched(null);
    void forgetGameFile();
    // The local app's server takes over again when there is one.
    void runSyncRef.current();
  }, []);

  const sync = useCallback(() => {
    const handle = handleRef.current;
    if (handle) {
      // Ask for read access inside the click (a no-op when already granted), then sync.
      const ask = handle.requestPermission?.({ mode: "read" }) ?? Promise.resolve("granted");
      void ask.catch(() => "denied").finally(() => void runSyncRef.current());
      return;
    }
    if (serverStateRef.current === "absent" && canPick) {
      chooseFile();
      return;
    }
    void runSyncRef.current();
  }, [chooseFile, canPick]);

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
    serverPath,
    canPick,
    dropFile,
    chooseFile,
    forgetFile,
    readFileOnce,
    available: mode !== "none",
    busy,
    statusText,
    barText: phase.phase === "no-file" ? "" : statusText,
    title,
    sync,
    characters,
    matched,
    linkCharacter,
  };

  return <GameSyncUiContext.Provider value={value}>{children}</GameSyncUiContext.Provider>;
}
