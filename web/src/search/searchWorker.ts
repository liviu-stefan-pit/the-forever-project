/**
 * Builds the MiniSearch index off the main thread.
 * The page posts `{ type: "init", url }` then `{ type: "search", id, query }`.
 */
import { createSearchEngine, searchDocs } from "./query.ts";
import type { SearchInput } from "./query.ts";

type Inbound =
  | { type: "init"; url: string }
  | { type: "search"; id: number; query: string };

interface WorkerScope {
  onmessage: ((ev: MessageEvent<Inbound>) => void) | null;
  postMessage(message: unknown): void;
}

const scope = self as unknown as WorkerScope;
let engine: ReturnType<typeof createSearchEngine> | null = null;

scope.onmessage = (ev: MessageEvent<Inbound>) => {
  const msg = ev.data;
  if (msg.type === "init") {
    void (async () => {
      try {
        const res = await fetch(msg.url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`search-index.json: HTTP ${res.status}`);
        const docs = (await res.json()) as SearchInput[];
        if (!Array.isArray(docs)) throw new Error("search-index.json is not an array");
        engine = createSearchEngine(docs);
        scope.postMessage({ type: "ready" });
      } catch (e) {
        scope.postMessage({
          type: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
    return;
  }
  if (!engine) {
    scope.postMessage({ type: "results", id: msg.id, hits: [] });
    return;
  }
  scope.postMessage({ type: "results", id: msg.id, hits: searchDocs(engine, msg.query).slice(0, 30) });
};
