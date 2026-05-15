// Trip and Tick — Service Worker v1
// Strategy: cache-first for static assets, network-first for /api/*, offline fallback.

const CACHE_VERSION = "tripandtick-v1";
const OFFLINE_URL = "/offline";

// Pre-cache: minimal critical shell. Pages with full HTML are cached on-the-fly.
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only GET — POST/PUT/DELETE bypass.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin (analytics, fonts CDN handled by next/font).
  if (url.origin !== self.location.origin) return;

  // Skip Next.js HMR + dev assets just in case.
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // API routes — network-first, no offline fallback (returns JSON error).
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() =>
          new Response(
            JSON.stringify({ error: "offline" }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          )
        )
    );
    return;
  }

  // Static assets — cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|webp|avif|ico)$/i.test(
      url.pathname
    )
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // HTML / navigation — network-first, fallback to cache, then offline page.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put(request, copy).catch(() => {}));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Default — try cache, fallback network.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
