/**
 * One-click game sync on the hosted (static) site.
 *
 * Browsers with the File System Access API (Chrome, Edge, Opera, desktop only) let the player pick
 * GuideWebExport.lua once. The file handle is kept in IndexedDB (handles cannot go in localStorage),
 * so later visits re-read the same file with a click, or automatically while the browser still
 * grants read access. Nothing is uploaded: the file is read in the browser like the manual import.
 * Other browsers keep the manual "Import GuideWebExport.lua" upload.
 */

type PermissionStateLike = "granted" | "denied" | "prompt";

/** The parts of FileSystemFileHandle used here (permission methods are not in lib.dom yet). */
export interface GameFileHandle {
  readonly kind: "file";
  readonly name: string;
  getFile(): Promise<{ text(): Promise<string>; lastModified: number }>;
  queryPermission?(desc: { mode: "read" }): Promise<PermissionStateLike>;
  requestPermission?(desc: { mode: "read" }): Promise<PermissionStateLike>;
}

interface PickerWindow {
  showOpenFilePicker?: (options?: unknown) => Promise<GameFileHandle[]>;
}

export const GAME_FILE_PATH_HINT = "World of Warcraft\\_forever_\\WTF\\Account\\<ACCOUNT>\\SavedVariables\\GuideWebExport.lua";

export function fileHandleSupported(): boolean {
  try {
    return typeof (globalThis as PickerWindow).showOpenFilePicker === "function" && typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

export type HandleRead =
  | { kind: "file"; text: string; mtimeMs: number }
  /** The browser needs a click before it reads the file again (new visit, permission reset). */
  | { kind: "needs-permission" }
  /** The file was moved or deleted (for example the WoW folder changed). */
  | { kind: "not-found" }
  | { kind: "unreachable" };

async function ensureRead(handle: GameFileHandle, request: boolean): Promise<boolean> {
  // Browsers without the permission methods grant read access for the life of the handle.
  if (!handle.queryPermission) return true;
  try {
    if ((await handle.queryPermission({ mode: "read" })) === "granted") return true;
    if (!request || !handle.requestPermission) return false;
    return (await handle.requestPermission({ mode: "read" })) === "granted";
  } catch {
    return false;
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { name?: unknown }).name === "NotFoundError";
}

/**
 * Read the picked file. With `request`, a missing permission is asked for, which needs a user
 * gesture: call it straight from a click, before any other await.
 */
export async function readGameFileHandle(handle: GameFileHandle, request: boolean): Promise<HandleRead> {
  if (!(await ensureRead(handle, request))) return { kind: "needs-permission" };
  try {
    const file = await handle.getFile();
    return { kind: "file", text: await file.text(), mtimeMs: file.lastModified };
  } catch (err) {
    return isNotFound(err) ? { kind: "not-found" } : { kind: "unreachable" };
  }
}

/** Last-modified time for the change poller; null when it cannot be read without a prompt. */
export async function gameFileHandleMtime(handle: GameFileHandle): Promise<number | null> {
  if (!(await ensureRead(handle, false))) return null;
  try {
    return (await handle.getFile()).lastModified;
  } catch {
    return null;
  }
}

/** Open the file picker. Resolves null when the player cancels. Must run from a click. */
export async function pickGameFile(): Promise<GameFileHandle | null> {
  const picker = (globalThis as PickerWindow).showOpenFilePicker;
  if (!picker) return null;
  try {
    const [handle] = await picker({
      id: "guide-web-export",
      multiple: false,
      excludeAcceptAllOption: false,
      types: [{ description: "GuideWebExport SavedVariables", accept: { "text/plain": [".lua"] } }],
    });
    return handle ?? null;
  } catch {
    // AbortError when the picker is closed; SecurityError without a user gesture.
    return null;
  }
}

interface DropItem {
  kind: string;
  getAsFileSystemHandle?: () => Promise<unknown>;
}

/**
 * The file handle of a dragged-in file, for remembering it like a picked one. Chrome's picker refuses
 * Program Files ("contains system files"); a dropped file is an explicit choice and still gives a
 * handle there. Must be called synchronously inside the drop event: the items empty afterwards.
 * Resolves null when the browser gives no handle (then read the dropped File once).
 */
export function handleFromDrop(items: ArrayLike<DropItem> | null | undefined): Promise<GameFileHandle | null> {
  const item = items ? Array.from(items).find((i) => i.kind === "file") : undefined;
  if (!item?.getAsFileSystemHandle) return Promise.resolve(null);
  let pending: Promise<unknown>;
  try {
    pending = item.getAsFileSystemHandle();
  } catch {
    return Promise.resolve(null);
  }
  return pending.then(
    (h) => {
      const handle = h as GameFileHandle | null;
      return handle && handle.kind === "file" && typeof handle.getFile === "function" ? handle : null;
    },
    () => null,
  );
}

/* ---------- IndexedDB persistence of the handle ---------- */

const DB_NAME = "forever-game-file";
const STORE = "handles";
const KEY = "guideWebExport";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function loadSavedGameFile(): Promise<GameFileHandle | null> {
  if (!fileHandleSupported()) return null;
  try {
    const value = await withStore<unknown>("readonly", (s) => s.get(KEY));
    const h = value as GameFileHandle | undefined;
    return h && h.kind === "file" && typeof h.getFile === "function" ? h : null;
  } catch {
    return null;
  }
}

export async function saveGameFile(handle: GameFileHandle): Promise<void> {
  try {
    await withStore("readwrite", (s) => s.put(handle, KEY));
  } catch {
    // Private windows can refuse IndexedDB: sync still works until the page closes.
  }
}

export async function forgetGameFile(): Promise<void> {
  try {
    await withStore("readwrite", (s) => s.delete(KEY));
  } catch {
    /* nothing stored */
  }
}
