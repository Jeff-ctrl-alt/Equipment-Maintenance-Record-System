const CACHE_NAME = "emrs-app-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL SERVICE WORKER
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// ACTIVATE SERVICE WORKER
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith("emrs-app-") &&
                          name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// OFFLINE REQUEST HANDLING
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const requestURL = new URL(event.request.url);

  // Only handle requests from this application
  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {

        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return new Response("Offline resource unavailable", {
          status: 503,
          statusText: "Offline"
        });

      });

    })
  );

});