/**
 * Ask the browser to keep this site's storage (profiles live in localStorage) instead of clearing it
 * under storage pressure or after a period without visits (Safari).
 *
 * Chrome and Safari decide silently from site engagement; Firefox shows a permission prompt, which is
 * why this runs only once the player has a profile worth keeping, not on first load.
 */

export type PersistState = "persistent" | "best-effort" | "unsupported";

interface StorageManagerLike {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

function storageManager(): StorageManagerLike | undefined {
  try {
    return (globalThis.navigator as Navigator | undefined)?.storage as StorageManagerLike | undefined;
  } catch {
    return undefined;
  }
}

/** Current state without asking (never prompts). */
export async function persistState(sm: StorageManagerLike | undefined = storageManager()): Promise<PersistState> {
  if (!sm?.persisted) return "unsupported";
  try {
    return (await sm.persisted()) ? "persistent" : "best-effort";
  } catch {
    return "unsupported";
  }
}

/** Request persistent storage if not already granted. Safe to call repeatedly. */
export async function requestPersistentStorage(
  sm: StorageManagerLike | undefined = storageManager(),
): Promise<PersistState> {
  const now = await persistState(sm);
  if (now !== "best-effort" || !sm?.persist) return now;
  try {
    return (await sm.persist()) ? "persistent" : "best-effort";
  } catch {
    return "best-effort";
  }
}
