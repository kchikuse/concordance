const CACHE_NAME = "concordance-cache-v1";

const STATIC_RESOURCES = [
  "./",
  "./index.html",
  "./favicon.ico",
  "./manifest.json",
  "./robots.txt",
  "./assets/styles.css",
  "./assets/kjv.sqlite",
  "./assets/scripts/services/DatabaseService.js",
  "./assets/scripts/services/SQLiteService.js",
  "./assets/scripts/Concordance.js",
  "./assets/scripts/libs/sql-wasm.js",
  "./assets/scripts/libs/sql-wasm.wasm",
  "./assets/fonts/Poppins-Regular.woff2",
  "./assets/icons/icon-192x192.webp",
  "./assets/icons/icon-512x512.webp",
  "./assets/icons/maskable_icon.webp",
  "./assets/icons/mobile.webp",
  "./assets/icons/desktop.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const cachePromises = STATIC_RESOURCES.map(async (resource) => {
          try {
            await cache.add(new Request(resource, { cache: 'reload' }));
          } catch (error) {
            console.warn(`Failed to cache ${resource}:`, error);
          }
        });
        await Promise.allSettled(cachePromises);
      } catch (error) {
        throw error;
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
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
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.includes("kjv.sqlite")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const cachedResponse = await cache.match("./assets/kjv.sqlite");
          if (cachedResponse) {
            return cachedResponse;
          }

          if (navigator.onLine) {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              await cache.put("./assets/kjv.sqlite", networkResponse.clone());
              return networkResponse;
            }
          }

          return new Response("Database not available offline.", {
            status: 503,
            statusText: "Service Unavailable",
          });
        } catch (error) {
          return new Response("Database error.", {
            status: 500,
            statusText: "Internal Server Error",
          });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && 
            networkResponse.type === "basic" && 
            networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        // Return a basic offline response for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return new Response("You are offline and this page is not cached.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { 'Content-Type': 'text/html' }
          });
        }
        throw error;
      });
    })
  );
});
