/* Gdzie zjeść: service worker.
   Pliki aplikacji i dane: zawsze najpierw sieć (świeża wersja przy każdym uruchomieniu),
   kopia z telefonu tylko bez internetu. Zdjęcia: z pamięci, bo się nie zmieniają. */
const V = "gz-app";
const WERSJA = "20261107-094333";
const IMG = "gz-img-v1";
const SHELL = ["./", "version.json", "index.html", "app.css", "app.js", "manifest.webmanifest", "data/places.json", "img/logo.png", "img/start.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.all(SHELL.map((u) => fetch(u, { cache: "no-store" }).then((r) => r.ok && c.put(u, r)).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== IMG && k !== "gz-map").map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function networkFirst(req) {
  const key = new URL(req.url);
  key.search = "";
  const timeout = new Promise((res) => setTimeout(() => res(null), 6000));
  const net = fetch(req, { cache: "no-store" }).then((r) => {
    if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(key.href, c)); }
    return r;
  });
  return Promise.race([net, timeout]).then((r) => r || caches.match(key.href).then((hit) => hit || net))
    .catch(() => caches.match(key.href, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")));
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.hostname.endsWith("googleusercontent.com")) {
    e.respondWith(caches.open(IMG).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r.ok || r.type === "opaque") {
          c.put(e.request, r.clone());
          c.keys().then((ks) => { if (ks.length > 800) ks.slice(0, ks.length - 800).forEach((k) => c.delete(k)); });
        }
        return r;
      } catch (err) { return Response.error(); }
    }));
    return;
  }
  if (u.hostname === "tile.openstreetmap.org") {
    e.respondWith(caches.open("gz-map").then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r.ok) { c.put(e.request, r.clone()); c.keys().then((ks) => { if (ks.length > 2500) ks.slice(0, ks.length - 2500).forEach((k) => c.delete(k)); }); }
        return r;
      } catch (err) { return Response.error(); }
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  // grafiki i fonty aplikacji: z pamięci, w tle odświeżane
  if (/\/(img|fonts)\//.test(u.pathname)) {
    e.respondWith(caches.open(V).then(async (c) => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  e.respondWith(networkFirst(e.request));
});
