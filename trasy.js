"use strict";
/* Trasy: gotowe plany zwiedzania złożone z miejsc z innych zakładek (Zwiedzanie, Zakupy, Restauracje). Dane z data/trasy.json (collector/trasy_build.py).
   Rodzaje tras są wspólne dla każdego miasta. Godziny „na dziś” liczone są z danych przystanków przy każdym otwarciu. */
const TRASY = (function () {
  const P = "tr", H = "#/" + P, DATA = "data/trasy.json", FAVK = "gz-fav-tr";
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  ICO.route = S('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>');
  ICO.walk = S('<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M8 12l2.5-4.5 4 1.5 2 3.5M12.5 9l-1 6"/>');
  ICO.carL = ICO.car || S('<path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 16v2.5M20 16v2.5M4 12h16"/>');
  ICO.sun = S('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>');
  ICO.weekend = S('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3M13 14h3M8 17.5h3"/>');
  ICO.kid2 = ICO.kid || S('<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M9 13l-3-2M15 13l3-2"/>');
  ICO.rain2 = ICO.rain || S('<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/>');
  ICO.moon = S('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>');
  ICO.hill = S('<path d="M2 19l6-8 4 5 3-3 7 6z"/><circle cx="17" cy="6" r="2"/>');
  ICO.col = S('<path d="M4 21h16M5 18h14M6 18V9M10 18V9M14 18V9M18 18V9M4 9h16L12 4z"/>');
  ICO.spoon = S('<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.3-3.5 4-3.5 7.5 0 1.6.8 2.5 2 2.5H17"/>');
  ICO.gmaps = S('<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>');
  const KINDS = {
    pierwszy: { label: "Pierwszy dzień", tint: "#3a2a12", ico: "sun" },
    weekend: { label: "Weekend", tint: "#2a1f12", ico: "weekend" },
    dzieci: { label: "Z dziećmi", tint: "#0f2430", ico: "kid2" },
    deszcz: { label: "Na deszcz", tint: "#141a2e", ico: "rain2" },
    wieczor: { label: "Wieczorem", tint: "#1a1e38", ico: "moon" },
    okolice: { label: "Za miasto", tint: "#1c2a14", ico: "hill" },
    historia: { label: "Historia", tint: "#2e2310", ico: "col" },
    smaki: { label: "Smaki", tint: "#3d1b0a", ico: "spoon" },
  };
  let ND = null, BY = {}, LOADING = null, MAPT = null;
  let FAV = new Set();
  try { FAV = new Set(JSON.parse(localStorage.getItem(FAVK) || "[]")); } catch (e) {}
  const mine = () => location.hash === H || location.hash.startsWith(H + "/") || location.hash.startsWith(H + "?");
  function load() {
    if (ND) return Promise.resolve(ND);
    if (!LOADING) LOADING = fetch(DATA, { cache: "no-store" }).then((r) => r.json())
      .catch(() => caches.match(DATA).then((c) => (c ? c.json() : null)))
      .then((d) => { ND = d || { meta: {}, places: [] }; BY = {}; ND.places.forEach((t) => (BY[t.id] = t)); return ND; })
      .catch(() => { ND = { meta: {}, places: [] }; return ND; });
    return LOADING;
  }
  load().then(() => { if (location.hash === "" || location.hash === "#/" || mine()) route(); });

  /* pomocnicze */
  const wd = () => (new Date().getDay() + 6) % 7;
  const km1 = (m) => (m < 1000 ? `${Math.max(50, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
  const hrs = (min) => { const h = Math.round(min / 30) / 2; return h < 1 ? `${Math.round(min / 10) * 10} min` : `${String(h).replace(".", ",")} h`; };
  const stops = (t) => t.days.flatMap((d) => d.stops);
  const total = (t) => t.days.length > 1 ? `${t.days.length} dni` : `ok. ${hrs(t.visit + t.move)}`;
  const modeTxt = (t) => t.mode === "car" ? `ok. ${Math.round(t.dist / 1000)} km autem w jedną stronę` : t.mixed ? `${km1(t.dist)} · pieszo i dojazd` : `${km1(t.dist)} pieszo`;
  const subLine = (t) => `${total(t)} · ${modeTxt(t)} · ${t.n} ${plural(t.n, "przystanek", "przystanki", "przystanków")}`;
  const link = (s) => s.cat === "r" ? `#/lokal/${encodeURIComponent(s.id)}` : `#/${s.cat}/obiekt/${encodeURIComponent(s.id)}`;
  const today = (s) => (s.hoursText || {})[DAYS[wd()]];
  const closedToday = (s) => /Zamknięte/.test(today(s) || "");
  const firstSentence = (t) => { const m = String(t || "").match(/^.+?[.!?](?=\s|$)/); const x = m ? m[0] : String(t || ""); return x.length > 140 ? x.slice(0, 137).replace(/\s+\S*$/, "") + "…" : x; };
  function status(s) {
    const h = today(s), os = openState(s);
    if (h) {
      if (/Zamknięte/.test(h)) return `<span class="trs n">Dziś zamknięte</span>`;
      if (/całą dobę/i.test(h)) return s.hoursNote && !/^[^.;]*(dostępn|otwart)[^.;]*całą dobę\.?$/i.test(firstSentence(s.hoursNote)) ? `<span class="trs m">${esc(firstSentence(s.hoursNote))}</span>` : `<span class="trs y">Dostępne całą dobę</span>`;
      return `<span class="trs ${os ? "y" : ""}">${os ? "Otwarte · " : "Dziś "}${esc(h)}</span>`;
    }
    return s.hoursNote ? `<span class="trs m">${esc(firstSentence(s.hoursNote))}</span>` : "";
  }
  function gmapsUrl(st, mode) {
    const pts = st.map((s) => `${s.lat},${s.lng}`);
    const u = new URLSearchParams({ api: "1", destination: pts[pts.length - 1], travelmode: mode === "car" ? "driving" : "walking" });
    if (mode !== "car") u.set("origin", pts[0]);
    const mid = mode === "car" ? pts.slice(0, -1) : pts.slice(1, -1);
    if (mid.length) u.set("waypoints", mid.slice(0, 9).join("|"));
    return "https://www.google.com/maps/dir/?" + u.toString();
  }
  function toggleFav(id) {
    FAV.has(id) ? FAV.delete(id) : FAV.add(id);
    try { localStorage.setItem(FAVK, JSON.stringify([...FAV])); } catch (e) {}
    document.querySelectorAll(`[data-trfav="${id}"]`).forEach((b) => b.classList.toggle("on", FAV.has(id)));
  }
  const bn = (t) => banner("trasy-" + t.kind, t.title, subLine(t), `${H}/trasa/${t.id}`, KINDS[t.kind].tint, KINDS[t.kind].ico);

  /* widoki */
  function viewHome() {
    const big = [["pieszo", "walk", "Pieszo"], ["autem", "carL", "Za miasto"], ["trasa/z-dziecmi", "kid2", "Z dziećmi"], ["trasa/na-deszcz", "rain2", "Na deszcz"]].filter(([h]) => !h.startsWith("trasa/") || BY[h.slice(6)]);
    return `<header class="hdr"><div class="hdr-row"><a class="brand home" href="#/" aria-label="Wszystkie kategorie"><b class="bk">${ico("back")}</b><img src="img/logo.png" alt=""><h1>Trasy</h1></a>
      <span class="city"><i>${ico("pin")}</i>${esc(ND.meta.city || "Lublin")}</span></div></header>
    <section class="sec"><div class="big4">${big.map(([h, ic, l]) => `<a class="big" href="${H}/${h}"><i>${ico(ic)}</i><span>${l}</span></a>`).join("")}</div></section>
    <section class="sec"><div class="sec-h"><h2>Gotowe plany zwiedzania</h2></div></section>
    <div class="bns">${ND.places.map(bn).join("")}</div>`;
  }
  const bar = (title, right = '<span class="ib"></span>') => `<div class="bar"><a class="ib" href="${H}" data-back><i>${ico("back")}</i></a><h2 class="ttl">${esc(title)}</h2>${right}</div>`;
  function viewList(kind) {
    const L = ND.places.filter((t) => (kind === "autem" ? t.mode === "car" : t.mode !== "car"));
    return bar(kind === "autem" ? "Za miasto" : "Pieszo") + `<div class="bns">${L.map(bn).join("")}</div>`;
  }
  function viewFav() {
    const L = ND.places.filter((t) => FAV.has(t.id));
    return bar("Ulubione trasy") + (L.length ? `<div class="bns">${L.map(bn).join("")}</div>` : `<div class="empty"><i>${ico("heart")}</i><br>Nie masz jeszcze ulubionych tras.<br>Dotknij serca na stronie trasy, żeby ją zapisać.</div>`);
  }
  function stopHtml(s, i, t) {
    const leg = s.leg ? `<div class="trleg ${s.leg.mode}"><i>${ico(s.leg.mode === "car" ? "carL" : "walk")}</i>${s.leg.mode === "car" ? "Autem" : "Pieszo"} ok. ${s.leg.min} min · ${km1(s.leg.m)}</div>` : "";
    const ph = s.photo ? `<img src="${img(s.photo, 180, 180)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<i>${ico("pin")}</i>`;
    const eat = s.eat && s.eat.length ? `<div class="treat"><h4><i>${ico("fork")}</i>${t.kind === "wieczor" ? "Na kolację" : "Na obiad"} w pobliżu</h4><div class="treat-row">${s.eat.map((e) => {
      const os = openState(e), ht = (e.hoursText || {})[DAYS[wd()]];
      return `<a href="#/lokal/${encodeURIComponent(e.id)}">${e.photo ? `<img src="${img(e.photo, 240, 160)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}<b>${esc(e.name)}</b><span>${esc(e.label || "")}</span><span>${e.rating ? `<em>★ ${fmtR(e.rating)}</em> · ` : ""}${km1(e.m)}</span><span>${ht ? (/Zamknięte/.test(ht) ? "Dziś zamknięte" : os === true ? `<u>Otwarte</u> · ${esc(ht)}` : `Dziś ${esc(ht)}`) : ""}</span></a>`;
    }).join("")}</div></div>` : "";
    return `${leg}<div class="trst${closedToday(s) ? " cl" : ""}"><span class="trnum">${i}</span><a class="trph" href="${link(s)}">${ph}</a>
      <div class="trtx"><a href="${link(s)}"><b>${esc(s.name)}</b></a><span class="trlb">${esc([s.label, s.czasTxt].filter(Boolean).join(" · "))}</span>
      ${status(s)}<p>${esc(s.note)}</p>${s.price ? `<span class="trpr">${esc(s.price)}</span>` : ""}<a class="trmore" href="${link(s)}">Szczegóły ›</a></div></div>${eat}`;
  }
  function viewTrasa(id, pp) {
    const t = BY[id];
    if (!t) return bar("Trasy") + `<div class="empty"><i>${ico("route")}</i><br>Nie znalazłem tej trasy.</div>`;
    const di = Math.min(t.days.length - 1, Math.max(0, (+pp.get("d") || 1) - 1)), day = t.days[di];
    const K = KINDS[t.kind], BN = ND.meta.banners || [];
    const hero = BN.includes("trasy-" + t.kind) ? `<img class="wide" src="img/banery/trasy-${t.kind}.jpg" alt="">` : `<i class="bn-ico">${ico(K.ico)}</i>`;
    const shut = day.stops.filter(closedToday);
    let n = 0;
    const st = day.stops.map((s) => stopHtml(s, ++n, t)).join("");
    return `<div class="bar"><a class="ib" href="${H}" data-back><i>${ico("back")}</i></a><h2 class="rt">${esc(K.label)}</h2>
        <span class="trtop"><button class="ib" data-trshare aria-label="Udostępnij"><i>${ico("share")}</i></button><button class="ib trfav${FAV.has(t.id) ? " on" : ""}" data-trfav="${t.id}" aria-label="Ulubione"><i>${ico("heart")}</i></button></span></div>
      <div class="trhero bn" style="--tint:${K.tint}">${hero}<div class="bn-txt"><b>${esc(t.title)}</b><span>${esc(t.sub)}</span></div></div>
      <div class="trbody">
        <div class="trpills"><span><i>${ico("clock")}</i>${total(t)}</span><span><i>${ico(t.mode === "car" ? "carL" : "walk")}</i>${modeTxt(t)}</span><span><i>${ico("pin")}</i>${t.n} ${plural(t.n, "przystanek", "przystanki", "przystanków")}</span></div>
        <p class="trintro">${esc(t.intro)}</p>
        ${t.days.length > 1 ? `<div class="trdays">${t.days.map((d, i) => `<a href="${H}/trasa/${t.id}?d=${i + 1}" data-trday class="${i === di ? "on" : ""}">${esc(d.title.split(" · ")[0])}</a>`).join("")}</div><h3 class="trdh">${esc(day.title.split(" · ")[1] || day.title)}</h3>` : ""}
        <div class="trmap" id="trmap"></div>
        <a class="btn ol trgm" href="${gmapsUrl(day.stops, t.mode)}" target="_blank" rel="noopener"><i>${ico("gmaps")}</i>Otwórz trasę w Mapach Google</a>
        ${shut.length ? `<div class="trwarn"><b>Dziś (${DAYS[wd()]}) zamknięte:</b> ${shut.map((s) => esc(s.name)).join(", ")}. Zmień kolejność albo wybierz inny dzień.</div>` : ""}
        ${t.start ? `<div class="trleg car start"><i>${ico("carL")}</i>Start: ${esc(t.start.name)}</div>` : ""}
        <div class="trlist">${st}</div>
        ${t.tips && t.tips.length ? `<h3 class="trh">Dobrze wiedzieć</h3><ul class="trtips">${t.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <p class="trsrc">Godziny i ceny pochodzą z kart miejsc w aplikacji, a status „dziś” liczony jest na bieżąco. Czasy i odległości przejść są szacunkowe (OpenStreetMap). Opisy przystanków na podstawie opisów miejsc w aplikacji.</p>
      </div>`;
  }

  /* mapa trasy */
  async function initMap() {
    const el = $("#trmap"); if (!el) return;
    const m = location.hash.match(/^#\/tr\/trasa\/([^?]+)/), t = m && BY[decodeURIComponent(m[1])];
    if (!t) return;
    const pp = new URLSearchParams(location.hash.split("?")[1] || "");
    const day = t.days[Math.min(t.days.length - 1, Math.max(0, (+pp.get("d") || 1) - 1))];
    try { await ensureLeaflet(); } catch (e) { el.innerHTML = `<div class="empty">Nie udało się wczytać mapy</div>`; return; }
    if (!document.body.contains(el)) return;
    const L = window.L;
    if (MAPT) { try { MAPT.remove(); } catch (e) {} MAPT = null; }
    MAPT = L.map(el, { zoomControl: false, attributionControl: true, tap: true, scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(MAPT);
    const pts = [];
    day.stops.forEach((s, i) => {
      if (s.leg && s.leg.g && (i > 0 || t.start)) L.polyline(s.leg.g, { color: "#d6a84e", weight: s.leg.mode === "car" ? 3 : 4, opacity: 0.9, dashArray: s.leg.mode === "car" ? "6 8" : null }).addTo(MAPT);
      const mk = L.marker([s.lat, s.lng], { icon: L.divIcon({ html: `<span class="trmk${closedToday(s) ? " cl" : ""}">${i + 1}</span>`, className: "", iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(MAPT);
      mk.bindPopup(`<a class="pop" href="${link(s)}">${s.photo ? `<img src="${img(s.photo, 200, 200)}" alt="" referrerpolicy="no-referrer">` : ""}<div><b>${i + 1}. ${esc(s.name)}</b><span>${esc(s.label || "")}</span></div></a>`, { closeButton: false, className: "gz-pop", offset: [0, -6] });
      pts.push([s.lat, s.lng]);
    });
    if (t.start && day === t.days[0]) { L.marker([t.start.lat, t.start.lng], { icon: L.divIcon({ html: `<span class="trmk st">S</span>`, className: "", iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(MAPT); pts.push([t.start.lat, t.start.lng]); }
    MAPT.fitBounds(L.latLngBounds(pts), { padding: [28, 28], maxZoom: 17 });
  }

  /* routing */
  function routeT(path, pp) {
    if (!ND) return { html: `<div class="empty" style="padding-top:40vh"><i>${ico("route")}</i><br>Wczytuję…</div>`, tab: "home", detail: false, map: false };
    const sub = path.slice(P.length + 2);
    if (sub.startsWith("trasa/")) return { html: viewTrasa(decodeURIComponent(sub.slice(6)), pp), tab: null, detail: true, map: false };
    if (sub === "pieszo") return { html: viewList("pieszo"), tab: "pieszo", detail: false, map: false };
    if (sub === "autem") return { html: viewList("autem"), tab: "autem", detail: false, map: false };
    if (sub === "ulubione") return { html: viewFav(), tab: "ulubione", detail: false, map: false };
    return { html: viewHome(), tab: "home", detail: false, map: false };
  }
  document.addEventListener("click", (e) => {
    if (!mine()) return;
    const f = e.target.closest("[data-trfav]");
    if (f) { e.preventDefault(); e.stopPropagation(); toggleFav(f.dataset.trfav); return; }
    if (e.target.closest("[data-trshare]")) {
      e.preventDefault();
      const m = location.hash.match(/^#\/tr\/trasa\/([^?]+)/), t = m && BY[decodeURIComponent(m[1])]; if (!t) return;
      const url = location.href.split("#")[0] + H + "/trasa/" + t.id;
      if (navigator.share) navigator.share({ title: t.title, url }).catch(() => {});
      else { try { navigator.clipboard.writeText(url); toast("Skopiowano link"); } catch (err) {} }
      return;
    }
    const d = e.target.closest("[data-trday]");
    if (d) { e.preventDefault(); location.replace(d.getAttribute("href")); }
  }, true);

  const api = {
    p: P, cls: "cat-tr", mine,
    tabs: [["", "home", "route", "Trasy"], ["/pieszo", "pieszo", "walk", "Pieszo"], ["/autem", "autem", "carL", "Za miasto"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    tile: ["kat-trasy", "Trasy", (n) => (n ? `${n} ${plural(n, "gotowy plan", "gotowe plany", "gotowych planów")} · pieszo i autem` : "Gotowe plany zwiedzania"), "#3a2a12", "route"],
    route: routeT, bind: () => { if ($("#trmap")) initMap(); },
    count: () => (ND ? ND.places.length : 0),
    banners: () => (ND && ND.meta.banners) || [],
    byId: (x) => BY[x],
    mapVisible() {},
  };
  KATS.push(api);
  return api;
})();
