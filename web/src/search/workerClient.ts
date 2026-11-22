/**
 * Idle-time search worker. Falls back to building MiniSearch on the main thread
 * if the worker fails to start or to load the index.
 */
import { dataUrl, loadSearchIndex } from "../data/loader";
import { createSearchEngine, searchDocs } from "./query";
import type { SearchDoc } from "./types";

type Phase = "idle" | "loading" | "ready" | "error";

type WorkerReply =
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "results"; id: number; hits: SearchDoc[] };

interface Pending {
  query: string;
  resolve: (hits: SearchDoc[]) => void;
}

let phase: Phase = "idle";
let errorMessage: string | null = null;
let fallingBack = false;
let worker: Worker | null = null;
let useMainThread = false;
let mainEngine: ReturnType<typeof createSearchEngine> | null = null;
let seq = 0;
const pending = new Map<number, Pending>();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeSearch(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function searchPhase(): { status: Phase; error: string | null } {
  return { status: phase, error: errorMessage };
}

function answer(query: string): SearchDoc[] {
  if (!mainEngine) return [];
  return searchDocs(mainEngine, query).slice(0, 30);
}

function flushPendingToMain() {
  for (const [id, item] of pending) {
    pending.delete(id);
    item.resolve(answer(item.query));
  }
}

async function fallBack(message: string) {
  if (useMainThread || fallingBack) return;
  fallingBack = true;
  worker?.terminate();
  worker = null;
  useMainThread = true;
  try {
    mainEngine = createSearchEngine(await loadSearchIndex());
    phase = "ready";
    errorMessage = null;
  } catch (e) {
    phase = "error";
    errorMessage = e instanceof Error ? e.message : message;
    mainEngine = null;
  }
  flushPendingToMain();
  notify();
}

function onWorkerMessage(ev: MessageEvent<WorkerReply>) {
  const msg = ev.data;
  if (msg.type === "ready") {
    phase = "ready";
    errorMessage = null;
    notify();
    return;
  }
  if (msg.type === "error") {
    void fallBack(msg.message);
    return;
  }
  const item = pending.get(msg.id);
  if (!item) return;
  pending.delete(msg.id);
  item.resolve(msg.hits);
}

/** Schedule index construction after first paint. Safe to call more than once. */
export function startSearchWorker(): void {
  if (phase !== "idle") return;
  phase = "loading";
  const kick = () => {
    try {
      worker = new Worker(new URL("./searchWorker.ts", import.meta.url), { type: "module" });
      worker.onmessage = onWorkerMessage;
      worker.onerror = () => {
        void fallBack("Search worker failed");
      };
      worker.postMessage({ type: "init", url: dataUrl("search-index.json") });
    } catch (e) {
      void fallBack(e instanceof Error ? e.message : "Search worker failed");
    }
  };
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") ric(() => kick());
  else window.setTimeout(kick, 1);
}

export function querySearch(query: string): Promise<SearchDoc[]> {
  if (useMainThread || phase === "error") return Promise.resolve(answer(query));
  if (phase !== "ready" || !worker) return Promise.resolve([]);
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, { query, resolve });
    worker!.postMessage({ type: "search", id, query });
  });
}
