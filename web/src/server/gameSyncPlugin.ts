import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin, PreviewServer, ViteDevServer } from "vite";

const DEFAULT_WOW_ROOT = "C:\\Program Files (x86)\\World of Warcraft\\_forever_";
const CONFIG_FILE = fileURLToPath(new URL("../../../config.local.json", import.meta.url));
const SAVED_VARS_NAME = "GuideWebExport.lua";

const STATUS_PATH = "/api/game-sync/status";
const FILE_PATH = "/api/game-sync";

export interface GuideWebExportHit {
  path: string;
  mtimeMs: number;
  bytes: number;
}

export interface FindGuideWebExportOptions {
  wowRoot?: string;
  preferred?: string;
}

interface LocalConfig {
  gwe_saved_variables?: string;
  wow_root?: string;
}

function hitFor(path: string): GuideWebExportHit | null {
  try {
    const st = statSync(path);
    if (!st.isFile()) return null;
    return { path, mtimeMs: st.mtimeMs, bytes: st.size };
  } catch {
    return null;
  }
}

function readLocalConfig(): LocalConfig | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    const raw: unknown = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
    const obj = raw as Record<string, unknown>;
    const cfg: LocalConfig = {};
    if (typeof obj.gwe_saved_variables === "string" && obj.gwe_saved_variables.length > 0) {
      cfg.gwe_saved_variables = obj.gwe_saved_variables;
    }
    if (typeof obj.wow_root === "string" && obj.wow_root.length > 0) {
      cfg.wow_root = obj.wow_root;
    }
    return cfg;
  } catch {
    return null;
  }
}

/** Newest GuideWebExport.lua under WTF/Account star /SavedVariables. */
function newestUnder(wowRoot: string): GuideWebExportHit | null {
  const accountDir = join(wowRoot, "WTF", "Account");
  let names: string[];
  try {
    names = readdirSync(accountDir);
  } catch {
    return null;
  }
  let best: GuideWebExportHit | null = null;
  for (const name of names) {
    const candidate = join(accountDir, name, "SavedVariables", SAVED_VARS_NAME);
    const hit = hitFor(candidate);
    if (hit && (best === null || hit.mtimeMs > best.mtimeMs)) best = hit;
  }
  return best;
}

/**
 * Locate GuideWebExport.lua. Read-only. Never uses a path supplied over HTTP.
 *
 * `preferred` wins when that file exists. An explicit `wowRoot` or
 * `WOW_FOREVER_ROOT` searches that tree. Otherwise `config.local.json`
 * `gwe_saved_variables` wins when the file exists, then `wow_root`, then the
 * default Forever install path.
 */
export function findGuideWebExport(opts?: FindGuideWebExportOptions): GuideWebExportHit | null {
  if (opts?.preferred) {
    const preferred = hitFor(opts.preferred);
    if (preferred) return preferred;
  }

  const explicitRoot = opts?.wowRoot ?? process.env.WOW_FOREVER_ROOT;
  if (explicitRoot) return newestUnder(explicitRoot);

  const cfg = readLocalConfig();
  if (cfg?.gwe_saved_variables) {
    const preferred = hitFor(cfg.gwe_saved_variables);
    if (preferred) return preferred;
  }
  return newestUnder(cfg?.wow_root ?? DEFAULT_WOW_ROOT);
}

function requestHostname(req: IncomingMessage): string {
  const host = req.headers.host;
  if (!host) return "";
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return "";
  }
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(payload));
  res.end(payload);
}

function handle(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): void {
  const pathname = (req.url ?? "/").split("?")[0] ?? "/";
  if (pathname !== STATUS_PATH && pathname !== FILE_PATH) {
    next();
    return;
  }

  if (!isLocalhost(requestHostname(req))) {
    sendJson(res, 403, { reason: "game sync is localhost only" });
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { reason: "method not allowed" });
    return;
  }

  const found = findGuideWebExport();
  if (pathname === STATUS_PATH) {
    if (!found) {
      sendJson(res, 200, {
        found: false,
        path: null,
        mtimeMs: null,
        bytes: null,
        reason: "GuideWebExport.lua was not found",
      });
      return;
    }
    sendJson(res, 200, {
      found: true,
      path: found.path,
      mtimeMs: found.mtimeMs,
      bytes: found.bytes,
    });
    return;
  }

  if (!found) {
    sendJson(res, 404, { reason: "GuideWebExport.lua was not found" });
    return;
  }

  let text: string;
  try {
    text = readFileSync(found.path, "utf8");
  } catch {
    sendJson(res, 404, { reason: "GuideWebExport.lua was not found" });
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(text));
  res.end(text);
}

function attach(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use(handle);
}

export function gameSyncPlugin(): Plugin {
  return {
    name: "game-sync",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
