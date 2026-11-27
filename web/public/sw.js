/*
 * Offline support for The Forever Project (plain service worker, no build step).
 *
 * - Pages: network first, so a new deploy is picked up at once; the cached shell when offline.
 * - /assets/ (hashed file names): cache first.
 * - Guide data (/data/): network first, so a route change shows up on the next load after a
 *   deploy; the cached copy when offline, so guides you have opened keep working with no signal.
 * - Map images and icons: served from the cache when present and refreshed in the background.
 *
 * Bump VERSION to drop every old cache on the next visit.
 */
const VERSION = "v3";
const SHELL = `tfp-shell-${VERSION}`;
const RUNTIME = `tfp-runtime-${VERSION}`;
const SHELL_FILES = ["./", "./index.html", "./manifest.webmanifest", "./favicon.svg?v=2", "./icons/icon-192.png?v=2"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function scopePath(url) {
  const scope = new URL(self.registration.scope);
  return url.pathname.startsWith(scope.pathname) ? url.pathname.slice(scope.pathname.length) : url.pathname;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(SHELL)).put("./index.html", res.clone());
    return res;
  } catch {
    return (await caches.match("./index.html")) || (await caches.match("./")) || Response.error();
  }
}

async function dataNetworkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(event.request);
  const fresh = fetch(event.request)
    .then((res) => {
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (hit) {
    event.waitUntil(fresh);
    return hit;
  }
  return (await fresh) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = scopePath(url);
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
  } else if (path.startsWith("assets/")) {
    event.respondWith(cacheFirst(req));
  } else if (path.startsWith("data/")) {
    event.respondWith(dataNetworkFirst(req));
  } else if (path.startsWith("maps/") || path.startsWith("icons/")) {
    event.respondWith(staleWhileRevalidate(event));
  }
});
