const CACHE_NAME = "concordance-cache-v1";

const STATIC_RESOURCES = [
  "/",
  "index.html",
  "favicon.ico",
  "manifest.json",
  "robots.txt",
  "assets/styles.css",
  "assets/kjv.sqlite",
  "assets/db-version.json",
  "assets/scripts/services/DatabaseService.js",
  "assets/scripts/services/SQLiteService.js",
  "assets/scripts/Concordance.js",
  "assets/scripts/libs/sql-wasm.js",
  "assets/scripts/libs/sql-wasm.wasm",
  "assets/fonts/Poppins-Regular.woff2",
  "assets/icons/icon-192x192.webp",
  "assets/icons/icon-512x512.webp",
  "assets/icons/maskable_icon.webp",
  "assets/icons/mobile.webp",
  "assets/icons/desktop.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (event.request.url.includes("db-version.json")) {
    const url = new URL(event.request.url);
    let requestUrl = event.request.url;

    if (!url.searchParams.has("t")) {
      requestUrl =
        requestUrl + (requestUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
    }

    event.respondWith(
      fetch(requestUrl).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  if (event.request.url.includes("kjv.sqlite")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              // Clone the response before using it to add to cache
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response("Database not available offline", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
