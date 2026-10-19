const CACHE_NAME = "khata-book-cache-DDL1910MO002";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./drive.js",
  "./manifest.json",
  "./icon.svg",
  "./fonts/JameelNooriNastaleeq.woff2",
  "./fonts/JameelNooriNastaleeqKasheeda.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith("khata-book-cache-") && k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// صرف اپنی فائلیں (اسی ویب سائٹ کی GET) — گوگل ڈرائیو وغیرہ کی درخواستیں سیدھی جائیں
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const isFont = req.url.includes("/fonts/");
  if (isFont) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
    return;
  }
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
