import { describe, expect, it, vi } from "vitest";
import { persistState, requestPersistentStorage } from "./persistStorage";

describe("persistent storage", () => {
  it("reports unsupported without the StorageManager API", async () => {
    expect(await persistState(undefined)).toBe("unsupported");
    expect(await requestPersistentStorage({})).toBe("unsupported");
  });

  it("does not ask again when already persistent", async () => {
    const persist = vi.fn(async () => true);
    expect(await requestPersistentStorage({ persisted: async () => true, persist })).toBe("persistent");
    expect(persist).not.toHaveBeenCalled();
  });

  it("asks once when best-effort and reports the browser's answer", async () => {
    expect(await requestPersistentStorage({ persisted: async () => false, persist: async () => true })).toBe("persistent");
    expect(await requestPersistentStorage({ persisted: async () => false, persist: async () => false })).toBe("best-effort");
  });

  it("treats a failing request as best-effort", async () => {
    const sm = { persisted: async () => false, persist: async () => Promise.reject(new Error("no")) };
    expect(await requestPersistentStorage(sm)).toBe("best-effort");
  });
});
