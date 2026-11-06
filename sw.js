const V = "gz-v1";
const SHELL = ["./", "index.html", "app.css?v=1", "app.js?v=1", "manifest.webmanifest", "img/logo.png", "img/icon-180.png", "img/icon-192.png",
  "fonts/cormorant-garamond-latin-600-normal.woff2", "fonts/cormorant-garamond-latin-ext-600-normal.woff2",
  "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-ext-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-ext-500-normal.woff2"];
const IMG = "gz-img-v1";

self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== IMG).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // dane: najpierw sieć, potem kopia
  if (u.pathname.endsWith("/data/places.json")) {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(V).then((ca) => ca.put("data/places.json", c)); return r; })
      .catch(() => caches.match("data/places.json")));
    return;
  }
  // zdjęcia z Google: z pamięci, gdy już były oglądane
  if (u.hostname.endsWith("googleusercontent.com")) {
    e.respondWith(caches.open(IMG).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r.ok || r.type === "opaque") {
          c.put(e.request, r.clone());
          c.keys().then((ks) => { if (ks.length > 600) ks.slice(0, ks.length - 600).forEach((k) => c.delete(k)); });
        }
        return r;
      } catch (err) { return Response.error(); }
    }));
    return;
  }
  if (u.origin === location.origin) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); }
      return r;
    })));
  }
});
