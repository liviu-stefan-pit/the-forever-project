/**
 * `vite preview` stand-in for Cloudflare Pages routing.
 * A file in dist wins. `/quest/*`, `/profile`, `/transfer` and bare `/guide` serve the app shell.
 * Anything else is `404.html` with status 404. Dev (`npm run dev`) is unchanged.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Connect, Plugin } from "vite";

export function servesAppShell(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (path === "/profile" || path === "/transfer" || path === "/guide") return true;
  return path.startsWith("/quest/");
}

/**
 * URL of a real file in dist for this path.
 * A directory is its `index.html` (preview does not resolve that on its own).
 * `null` when nothing in dist matches.
 */
export function distFileUrl(distDir: string, pathname: string): string | null {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (rel.includes("..")) return null;
  if (rel) {
    const direct = join(distDir, rel);
    if (existsSync(direct) && statSync(direct).isFile()) return pathname.startsWith("/") ? pathname : `/${pathname}`;
  }
  const indexRel = rel.replace(/\/$/, "");
  const index = join(distDir, indexRel, "index.html");
  if (!existsSync(index)) return null;
  return indexRel ? `/${indexRel}/index.html` : "/index.html";
}

export function hasDistFile(distDir: string, pathname: string): boolean {
  return distFileUrl(distDir, pathname) != null;
}

export function pagesPreviewPlugin(distDir: string): Plugin {
  return {
    name: "pages-routing-preview",
    configurePreviewServer(server) {
      server.middlewares.use(pagesMiddleware(distDir));
    },
  };
}

function pagesMiddleware(distDir: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const fileUrl = distFileUrl(distDir, pathname);
    if (fileUrl) {
      if (fileUrl !== pathname) req.url = `${fileUrl}${url.search}`;
      return next();
    }
    if (servesAppShell(pathname)) {
      req.url = `/index.html${url.search}`;
      return next();
    }
    res.statusCode = 404;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(readFileSync(join(distDir, "404.html")));
  };
}
