import "./legacyHash";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { startSearchWorker } from "./search/workerClient";
import { ProfileProgressProvider } from "./state/profiles";
// Self-hosted fonts (no third-party font requests): only the weights the UI uses.
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/cinzel/800.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/500.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";
import "./index.css";

/**
 * Same URL shape as `dataUrl()` in data/loader.ts:
 * `<BASE_URL>data/<path>`, Accept: application/json.
 * Inlined so this runs before the loader module (and profile store) evaluate.
 */
function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.endsWith("/") ? base : `${base}/`}data/${path}`;
}

function warm(path: string): void {
  void fetch(dataUrl(path), { headers: { Accept: "application/json" } }).catch(() => undefined);
}

/** Prime the HTTP cache for the route the loader will fetch. Does not block paint. */
function warmRouteData(): void {
  const path = window.location.pathname;
  const slug = /^\/guide\/([^/]+)/.exec(path)?.[1];
  if (slug) warm(`guides/${decodeURIComponent(slug)}.json`);
  warm("guide_index.json");
  warm("quest-steps.json");
}

/** The faction landing page (`/`) needs none of the guide data: let it paint and animate first. */
function onLanding(): boolean {
  return window.location.pathname === (import.meta.env.BASE_URL || "/");
}

if (onLanding()) {
  // Warm up after a short idle, or at once when the visitor leaves the landing page.
  let started = false;
  let unsubscribe = () => {};
  const start = () => {
    if (started) return;
    started = true;
    unsubscribe();
    warmRouteData();
    startSearchWorker();
  };
  unsubscribe = router.subscribe((state) => {
    if (state.location.pathname !== "/") start();
  });
  window.setTimeout(start, 2500);
} else {
  warmRouteData();
  startSearchWorker();
}

/** Offline support and "Add to Home Screen" (production builds only; dev keeps plain reloads). */
if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => undefined);
  });
}

const root = document.getElementById("root");
if (!root) throw new Error("#root element missing");

createRoot(root).render(
  <StrictMode>
    <ProfileProgressProvider>
      <RouterProvider router={router} />
    </ProfileProgressProvider>
  </StrictMode>,
);
