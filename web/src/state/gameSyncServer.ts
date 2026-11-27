/**
 * Client side of the local game-sync endpoint (`src/server/gameSyncPlugin.ts`). Only the local app
 * (`npm run dev`, `vite preview`, run-app.bat) has it: the server reads GuideWebExport.lua from the
 * WoW folder itself, so Sync works with no file picking, even under Program Files.
 */

export const STATUS_URL = "/api/game-sync/status";
export const FILE_URL = "/api/game-sync";

export type ServerLoad =
  /** No endpoint here (hosted site), or it did not answer with its JSON. */
  | { kind: "no-server" }
  /** The endpoint exists but found no GuideWebExport.lua. */
  | { kind: "not-found" }
  | { kind: "unreachable" }
  | { kind: "file"; text: string; mtimeMs: number | null; path: string | null };

export type ServerStatus = { kind: "no-server" } | { kind: "status"; found: boolean; mtimeMs: number | null; path: string | null };

type FetchLike = (url: string, init?: RequestInit) => Promise<Pick<Response, "ok" | "status" | "json" | "text">>;

/** Only a page served from this PC can have the endpoint; the hosted site never asks. */
export function isLocalAppHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}

export async function fetchServerStatus(fetchFn: FetchLike): Promise<ServerStatus> {
  try {
    const res = await fetchFn(STATUS_URL, { cache: "no-store" });
    if (!res.ok) return { kind: "no-server" };
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null || typeof (body as { found?: unknown }).found !== "boolean") {
      return { kind: "no-server" };
    }
    const b = body as { found: boolean; mtimeMs?: unknown; path?: unknown };
    return {
      kind: "status",
      found: b.found,
      mtimeMs: typeof b.mtimeMs === "number" ? b.mtimeMs : null,
      path: typeof b.path === "string" ? b.path : null,
    };
  } catch {
    // A static host answers with index.html, which is not JSON.
    return { kind: "no-server" };
  }
}

/** Ask whether the file exists, and only then download it (no 404 on every load). */
export async function loadServerFile(fetchFn: FetchLike): Promise<ServerLoad> {
  const status = await fetchServerStatus(fetchFn);
  if (status.kind === "no-server") return status;
  if (!status.found) return { kind: "not-found" };
  let res: Awaited<ReturnType<FetchLike>>;
  try {
    res = await fetchFn(FILE_URL, { cache: "no-store" });
  } catch {
    return { kind: "unreachable" };
  }
  if (res.status === 404) return { kind: "not-found" };
  if (!res.ok) return { kind: "unreachable" };
  try {
    return { kind: "file", text: await res.text(), mtimeMs: status.mtimeMs, path: status.path };
  } catch {
    return { kind: "unreachable" };
  }
}
