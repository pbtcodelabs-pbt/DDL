const CACHE_NAME = "khata-book-cache-DDL2610MO014";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./drive.js",
  "./manifest.json",
  "./icon.svg",
  "./images/milkman.webp",
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
  // ہمیشہ تازہ فائل (براؤزر کی پرانی کاپی نہیں) — تاکہ نیا ورژن فوراً آئے
  event.respondWith(
    fetch(req.url, { cache: "no-store" })
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
