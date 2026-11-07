"use strict";
/* Na mieście: wspólny mechanizm kategorii (Noclegi, Rozrywka, kolejne). Każda kategoria to konfiguracja przekazana do makeKat(). */
const KATS = [];
Object.assign(ICO, {
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 16v2.5M20 16v2.5M4 12h16"/><circle cx="7.5" cy="14" r=".8"/><circle cx="16.5" cy="14" r=".8"/></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="7" cy="9" rx="1.8" ry="2.4"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.4"/><ellipse cx="17" cy="9" rx="1.8" ry="2.4"/><path d="M12 12c-3 0-5.5 3.2-5.5 5.4 0 1.6 1.3 2.1 2.8 1.6 1.2-.4 2-.6 2.7-.6s1.5.2 2.7.6c1.5.5 2.8 0 2.8-1.6 0-2.2-2.5-5.4-5.5-5.4z"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 9.5a13 13 0 0 1 18 0M6 12.8a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r=".9" fill="currentColor"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.5"/></svg>',
});
const zl = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
const distM = (m) => (m < 1000 ? `${Math.max(100, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

function makeKat(C) {
  const P = C.p, H = "#/" + P;
  let ND = null, NBY = {}, LOADING = null;
  const NS = { f: {}, q: "" };
  let FAV = new Set();
  try { FAV = new Set(JSON.parse(localStorage.getItem(C.fav) || "[]")); } catch (e) {}
  const N = (n) => `${n} ${plural(n, ...C.noun)}`;
  const mine = () => location.hash === H || location.hash.startsWith(H + "/") || location.hash.startsWith(H + "?");

  function load() {
    if (ND) return Promise.resolve(ND);
    if (!LOADING) LOADING = fetch(C.data, { cache: "no-store" }).then((r) => r.json())
      .catch(() => caches.match(C.data).then((c) => (c ? c.json() : null)))
      .then((d) => { ND = d || { meta: {}, places: [] }; NBY = {}; ND.places.forEach((p) => (NBY[p.id] = p)); return ND; })
      .catch(() => { ND = { meta: {}, places: [] }; return ND; });
    return LOADING;
  }
  load().then(() => { if (location.hash === "" || location.hash === "#/" || mine()) route(); });

  const kindOf = (id) => C.kinds.find((k) => k.id === id) || C.kinds[0];
  const hrefR = (o) => H + "/wyniki?" + new URLSearchParams(Object.entries(o).filter(([, v]) => v && (!Array.isArray(v) || v.length)).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])).toString();
  const FL = C.filters; // [{k, title, opts:[[v,l]], multi, test(p,v)}]
  function match(p, f, q) {
    for (const F of FL) {
      const v = f[F.k];
      if (F.multi) { if (v && v.length && !v.every((x) => F.test(p, x))) return false; }
      else if (v && !F.test(p, v)) return false;
    }
    if (q) {
      const hay = p._hay || (p._hay = norm([p.name, p.address, kindOf(p.kind).one, p.areaName, p.category, p.tags].join(" ")));
      if (!norm(q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }
  const list = (f = NS.f, q = NS.q) => ND.places.filter((p) => match(p, f, q));
  function fromParams(pp) {
    const f = {};
    FL.forEach((F) => { const v = pp.get(F.k); f[F.k] = F.multi ? (v || "").split(",").filter(Boolean) : v; });
    return f;
  }
  const optLabel = (F, v) => (F.opts.find((o) => o[0] === v) || [v, v])[F.chip || 1];
  function chips(f, q) {
    const o = [];
    FL.forEach((F) => {
      if (F.multi) (f[F.k] || []).forEach((v) => o.push([F.k + ":" + v, optLabel(F, v)]));
      else if (f[F.k]) o.push([F.k, optLabel(F, f[F.k])]);
    });
    if (q) o.push(["q", `„${q}”`]);
    return o;
  }
  const where = (p) => (C.where ? C.where(p) : p.dRynek != null ? `${p.areaName ? p.areaName + " · " : ""}${distM(p.dRynek)} od Rynku` : cityAddr(p.address));

  function card(p) {
    const ph = p.photos.slice(0, 5), badge = C.badge ? C.badge(p) : "";
    return `<article class="pc kpc" data-kid="${p.id}">
    <div class="pc-ph"><div class="strip">${ph.map((u, i) => `<img src="${img(u, 900, 620)}" alt="" loading="lazy" referrerpolicy="no-referrer" decoding="async" class="fi"${i ? "" : ` style="background-image:url('${img(u, 36, 24)}')"`}>`).join("")}</div>
    ${badge}
    <button class="fav ${FAV.has(p.id) ? "on" : ""}" data-kfav="${p.id}" aria-label="Ulubione"><i>${ico("heart")}</i></button>
    ${ph.length > 1 ? `<div class="pc-dots">${ph.map((_, i) => `<b class="${i ? "" : "on"}"></b>`).join("")}</div>` : ""}
    <div class="pc-body">
      <div class="pc-name">${esc(p.name)}</div>
      <div class="meta">${p.rating ? `<span class="st"><i>${ico("star")}</i>${fmtR(p.rating)}</span><span>(${p.reviews})</span>` : ""}${C.subLine(p).map((t) => `<span class="sep">·</span><span>${esc(t)}</span>`).join("")}</div>
      <div class="addr"><i>${ico("pin")}</i><span>${esc(where(p))}</span></div>
    </div></article>`;
  }
  const bar = (title, right = '<span class="ib"></span>') => `<div class="bar"><a class="ib" href="${H}" data-back><i>${ico("back")}</i></a><h2 class="ttl">${esc(title)}</h2>${right}</div>`;
  const ctx = () => ({ ND, list, hrefR, card, N, kindOf, H });

  function viewHome() {
    return `<header class="hdr"><div class="hdr-row"><a class="brand home" href="#/" aria-label="Wszystkie kategorie"><b class="bk">${ico("back")}</b><img src="img/logo.png" alt=""><h1>${esc(C.name)}</h1></a>
      <span class="city"><i>${ico("pin")}</i>${esc(ND.meta.city || "Lublin")}</span></div>
      <form class="search" id="kform"><i>${ico("search")}</i><input id="kq" type="search" enterkeyhint="search" placeholder="${esc(C.searchPh)}" autocomplete="off"></form></header>
    <section class="sec"><div class="big4">${C.big.map(([h, ic, l]) => `<a class="big" href="${H}/${h}"><i>${ico(ic)}</i><span>${l}</span></a>`).join("")}</div></section>
    ${C.home(ctx())}`;
  }
  function viewBanners(kind) {
    const cnt = (f) => N(list(f, "").length);
    let t, items;
    if (kind === "rodzaj") { t = C.kindsTitle; items = C.kinds.filter((k) => list({ kind: k.id }, "").length).map((k) => banner(C.bn + k.id, k.label, `${k.sub} · ${cnt({ kind: k.id })}`, hrefR({ kind: k.id }), k.tint, k.ico)); }
    else if (kind === "okazje") { t = "Okazja"; items = C.occs.map((o) => banner((C.bnOcc || C.bn) + o.id, o.label, `${o.sub} · ${cnt({ occ: o.id })}`, hrefR({ occ: o.id }), o.tint, o.ico)); }
    else { const r = C.extraBanners(kind, ctx()); t = r.t; items = r.items; }
    return bar(t) + `<div class="bns">${items.join("")}</div>`;
  }
  const PAGE = 20;
  function viewResults(pp) {
    NS.f = fromParams(pp); NS.q = pp.get("q") || "";
    const sort = pp.get("sort") || C.sorts[0][0];
    const l = list().sort((C.sorts.find((s) => s[0] === sort) || C.sorts[0])[2]);
    const ch = chips(NS.f, NS.q), n = Math.min(l.length, +(pp.get("n") || PAGE));
    const ttl = ch.filter(([k]) => k !== "q").map(([, x]) => x).join(" · ") || (NS.q ? `„${NS.q}”` : C.allLabel);
    return `<div class="bar"><a class="ib" href="${H}" data-back><i>${ico("back")}</i></a><h2 class="rt">${esc(ttl)}</h2><a class="ib" href="${H}/filtry"><i>${ico("sliders")}</i></a></div>
    ${ch.length ? `<div class="chips">${ch.map(([k, x]) => `<button class="chip" data-krm="${k}">${esc(x)}<i>${ico("close")}</i></button>`).join("")}</div>` : ""}
    <div class="count">Znaleziono ${N(l.length)}</div>
    ${l.length > 1 ? `<div class="nsort">${C.sorts.map(([k, x]) => `<button class="fc ${k === sort ? "on" : ""}" data-ksort="${k}">${x}</button>`).join("")}</div>` : ""}
    ${l.length ? `<div class="cards">${l.slice(0, n).map(card).join("")}</div>${n < l.length ? `<button class="more" data-kmore="${n + PAGE}">Pokaż więcej (${l.length - n})</button>` : ""}`
      : `<div class="empty"><i>${ico(C.ico)}</i><br>${esc(C.emptyText)}<br>Usuń któryś z filtrów, żeby zobaczyć więcej.</div>`}`;
  }
  const fc = (key, v, label, on) => `<button class="fc ${on ? "on" : ""}" data-kfc="${key}" data-v="${v}">${esc(label)}</button>`;
  function sheetGroups(f) {
    return FL.filter((F) => !F.hidden).map((F) => `<div class="ms-g"><span class="t">${F.title}</span><div class="row">${F.opts.map(([v, l]) => fc(F.k, v, l, F.multi ? (f[F.k] || []).includes(v) : f[F.k] === v)).join("")}</div></div>`).join("");
  }
  function viewFilters() {
    const n = list().length;
    return `<div class="bar"><span class="ib"></span><h2>${esc(C.filtersTitle)}</h2><button class="ib" data-kreset aria-label="Wyczyść"><i>${ico("close")}</i></button></div>
    <div class="nfl ms-b">${sheetGroups(NS.f)}</div>
    <a class="btn fill" style="margin:8px 18px 24px" href="${hrefR({ ...NS.f, q: NS.q })}">Pokaż ${N(n)}</a>`;
  }
  function viewFav() {
    const l = ND.places.filter((p) => FAV.has(p.id));
    return `<div class="bar"><span class="ib"></span><h2>${esc(C.favTitle)}</h2><span class="ib"></span></div>
    ${l.length ? `<div class="cards">${l.map(card).join("")}</div>` : `<div class="empty"><i>${ico("heart")}</i><br>${esc(C.favEmpty)}<br>Dotknij serduszka, żeby zapisać miejsce tutaj.</div>`}`;
  }

  /* karta */
  function viewDetail(id, tab) {
    const p = NBY[id];
    if (!p) return bar("") + `<div class="empty">Nie znalazłem tego miejsca.</div>`;
    tab = tab || "info";
    const ph = p.photos;
    const acts = C.acts(p);
    return `<div class="dt-hero"><div class="strip" id="hstrip">${ph.map((u, i) => `<img src="${img(u, 1200, 1000)}" alt="" ${i > 1 ? 'loading="lazy"' : ""} referrerpolicy="no-referrer" data-kvi="${i}" data-vi="${i}" class="fi" style="background-image:url('${img(u, 36, 30)}')">`).join("")}</div>
    <div class="dt-top"><a class="ib" href="${H}" data-back><i>${ico("back")}</i></a><div class="r"><button class="ib ${FAV.has(p.id) ? "on" : ""}" data-kfav="${p.id}"><i>${ico("heart")}</i></button><button class="ib" data-kshare><i>${ico("share")}</i></button></div></div>
    <span class="dt-cnt" id="hcnt">1 / ${ph.length}</span></div>
  <div class="dt-main">
    <div class="dt-title"><h1>${esc(p.name)}</h1>${C.titleRight ? C.titleRight(p) : ""}</div>
    ${p.rating ? `<div class="dt-rate"><i>${ico("star")}</i><b>${fmtR(p.rating)}</b><span>(${p.reviews} ${plural(p.reviews, "opinia", "opinie", "opinii")})</span><span>·</span><span>${esc(C.kindLine ? C.kindLine(p) : kindOf(p.kind).one)}</span>${C.rateExtra ? C.rateExtra(p) : ""}</div>` : ""}
    <div class="dt-addr"><div class="addr"><i>${ico("pin")}</i><span>${esc(cityAddr(p.address))}${p.dRynek != null ? ` · ${distM(p.dRynek)} od Rynku` : ""}</span></div></div>
    <div class="acts">${acts.map(([l, ic, href, ext]) => `<a class="act ${href ? "" : "dis"}" href="${esc(href || "#")}"${href && ext !== false ? ' target="_blank" rel="noopener"' : ""}><i>${ico(ic)}</i><span>${l}</span></a>`).join("")}</div>
    <div class="sm">${C.sm(p, ctx())}</div>
    <div class="thumbs">${ph.slice(1, 9).map((u, i) => `<button data-kvi="${i + 1}"><img src="${img(u, 360, 290)}" alt="" loading="lazy" referrerpolicy="no-referrer" class="fi"></button>`).join("")}</div>
    <div class="tabs" id="tabs">${C.tabs.map(([k, l]) => `<button data-ktab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="pane" id="pane">${pane(p, tab)}</div>
  </div>`;
  }
  function pane(p, t) {
    if (t === "opinie") {
      const r = p.reviewsText || [];
      return r.length ? `<div class="revs">${r.slice(0, 8).map((x) => `<div class="rev">${esc(x.replace(/[.\s]*…$/, "…"))}</div>`).join("")}</div><p class="note" style="margin-top:14px">Fragmenty opinii z Map Google.</p>` : `<p class="note">Brak opinii do wyświetlenia.</p>`;
    }
    if (t === "kontakt") {
      return `<div class="ct">
      ${p.phone ? `<a href="tel:${esc(p.phone.replace(/\s/g, ""))}"><i>${ico("phone")}</i><span>${esc(p.phone)}</span></a>` : ""}
      ${p.www ? `<a href="${esc(p.www)}" target="_blank" rel="noopener"><i>${ico("globe")}</i><span>${esc(p.www.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0])}</span><i>${ico("ext")}</i></a>` : ""}
      <a href="${esc(navUrl(p))}" target="_blank" rel="noopener"><i>${ico("navi")}</i><span>Prowadź na miejsce</span><i>${ico("ext")}</i></a>
      ${p.gmaps ? `<a href="${esc(p.gmaps)}" target="_blank" rel="noopener"><i>${ico("map")}</i><span>Otwórz w Mapach Google</span><i>${ico("ext")}</i></a>` : ""}
      </div><p class="note" style="margin-top:14px">${esc(p.address)}</p>`;
    }
    if (t !== "info") return C.pane(p, t, ctx());
    const r = p.reviewsText || [];
    const best = r.find((x) => x.length > 60 && x.length < 260) || r[0];
    return `${p.desc ? `<div class="ndesc">${p.desc.split("\n").map((x) => `<p>${esc(x)}</p>`).join("")}${p.descSrc === "strona" ? `<p class="note">Na podstawie strony obiektu.</p>` : ""}</div>` : ""}
    <div class="rows">${C.infoRows(p, ctx())}</div>
    ${p.lat ? `<a class="loc" href="${esc(navUrl(p))}" target="_blank" rel="noopener"><div class="loc-map" id="kminiMap"></div><div class="loc-txt"><i>${ico("pin")}</i><div><b>${esc(cityAddr(p.address))}</b><span id="klocDist">${distText(p) || "Dotknij, aby wyznaczyć trasę"}</span></div><i>${ico("navi")}</i></div></a>` : ""}
    ${best ? `<blockquote class="quote">${esc(sentenceCut(best, 240))}<small>Z opinii w Google</small></blockquote>` : ""}`;
  }
  let MINI = null;
  async function initMini(p) {
    const el = $("#kminiMap");
    if (!el || !p) return;
    try { await ensureLeaflet(); } catch (e) { return; }
    if (!document.body.contains(el)) return;
    if (MINI) { try { MINI.remove(); } catch (e) {} }
    const L = window.L;
    MINI = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false }).setView([p.lat, p.lng], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles" }).addTo(MINI);
    L.marker([p.lat, p.lng], { icon: L.divIcon({ html: `<span class="mk el ${C.mk}"></span>`, className: "", iconSize: [22, 22] }), interactive: false }).addTo(MINI);
    myPosition().then(() => { const d = $("#klocDist"); if (d && distText(p)) d.textContent = distText(p); });
  }

  /* mapa */
  let MAPK = null, CL = null, ME2 = null;
  const MK = [], MF = {};
  FL.forEach((F) => (MF[F.k] = F.multi ? [] : null));
  const id = (x) => P + x;
  function mapWrap() {
    let w = $("#" + id("mapwrap"));
    if (w) return w;
    w = document.createElement("section");
    w.className = "mapwrap"; w.id = id("mapwrap"); w.hidden = true;
    w.innerHTML = `<div id="${id("map")}" class="kmap"></div><div class="map-top"><span class="map-pill" id="${id("mapCount")}"></span><button class="map-fbtn" id="${id("mapFbtn")}"><i>${ico("sliders")}</i>Filtry<b id="${id("mapFn")}" hidden></b></button></div>
      <div class="msheet" id="${id("msheet")}"></div><button class="map-loc" id="${id("mapLoc")}" aria-label="Moja lokalizacja"><i>${ico("navi")}</i></button>`;
    $("#app").insertBefore(w, $("#tabbar"));
    return w;
  }
  const mfCount = () => Object.values(MF).reduce((a, v) => a + (Array.isArray(v) ? v.length : v ? 1 : 0), 0);
  function refreshMap() {
    if (!CL) return;
    const vis = MK.filter(([p]) => match(p, MF, ""));
    CL.clearLayers(); CL.addLayers(vis.map(([, m]) => m));
    const n = vis.length, act = mfCount();
    $("#" + id("mapCount")).innerHTML = `<b>${n}</b> ${plural(n, ...C.noun)}`;
    const b = $("#" + id("mapFn")); b.hidden = !act; b.textContent = act;
    if (act && n && n < 80) MAPK.fitBounds(window.L.latLngBounds(vis.map(([p]) => [p.lat, p.lng])), { paddingTopLeft: [40, 80], paddingBottomRight: [40, 60], maxZoom: 16 });
  }
  function renderSheet() {
    const n = MK.filter(([p]) => match(p, MF, "")).length;
    $("#" + id("msheet")).innerHTML = `<div class="ms-h"><h3>Filtry mapy</h3><button data-kmfclear>Wyczyść</button></div><div class="ms-b" data-map="1">${sheetGroups(MF)}</div>
      <div class="ms-f"><button class="btn fill" data-kmfdone>Pokaż ${N(n)}</button></div>`;
  }
  function popHtml(p) {
    return `<a class="pop" href="${H}/obiekt/${encodeURIComponent(p.id)}"><img src="${img(p.photos[0], 200, 200)}" alt="" referrerpolicy="no-referrer"><div><b>${esc(p.name)}</b><span>${esc((C.popLine ? C.popLine(p) : C.subLine(p)).join(" · "))}</span>${p.rating ? `<span><span class="st">★ ${fmtR(p.rating)}</span> (${p.reviews})</span>` : ""}</div><i>${ico("back").replace("M15 5l-7 7 7 7", "M9 5l7 7-7 7")}</i></a>`;
  }
  async function showMap() {
    mapWrap();
    try { await ensureLeaflet(); } catch (e) { toast("Nie udało się wczytać mapy"); return; }
    if (MAPK) { requestAnimationFrame(() => MAPK.invalidateSize()); return; }
    const L = window.L;
    MAPK = L.map(id("map"), { zoomControl: false, attributionControl: true, tap: true }).setView([51.2475, 22.5655], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(MAPK);
    CL = L.markerClusterGroup({
      maxClusterRadius: 42, showCoverageOnHover: false, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 17,
      iconCreateFunction: (c) => { const n = c.getChildCount(), s = n < 10 ? 34 : n < 50 ? 40 : 48; return L.divIcon({ html: `<div class="mk-cl ${C.cl}" style="width:${s}px;height:${s}px">${n}</div>`, className: "", iconSize: [s, s] }); },
    });
    for (const p of ND.places) {
      if (!p.lat) continue;
      const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ html: `<span class="mk ${C.mk}"></span>`, className: "", iconSize: [18, 18] }) });
      m.bindPopup(() => popHtml(p), { closeButton: false, className: "gz-pop", offset: [0, -4], autoPanPadding: [20, 90] });
      MK.push([p, m]);
    }
    MAPK.addLayer(CL);
    refreshMap();
    MAPK.on("click", () => $("#" + id("msheet")).classList.remove("on"));
    $("#" + id("mapFbtn")).addEventListener("click", () => { renderSheet(); $("#" + id("msheet")).classList.toggle("on"); });
    $("#" + id("mapLoc")).addEventListener("click", () => { if (MEPOS) MAPK.flyTo(MEPOS, 16, { duration: 0.8 }); else locateK(true); });
    locateK(false);
  }
  function locateK(center) {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition((pos) => {
      const first = !ME2; MEPOS = [pos.coords.latitude, pos.coords.longitude];
      if (!ME2) ME2 = window.L.marker(MEPOS, { icon: window.L.divIcon({ html: '<div class="me"></div>', className: "", iconSize: [18, 18] }), zIndexOffset: 1000, interactive: false }).addTo(MAPK);
      else ME2.setLatLng(MEPOS);
      const b = ND.meta.bounds || [51.13, 51.32, 22.42, 22.72];
      const inCity = MEPOS[0] > b[0] && MEPOS[0] < b[1] && MEPOS[1] > b[2] && MEPOS[1] < b[3];
      if ((first && inCity) || center) { MAPK.setView(MEPOS, 15); center = false; }
    }, () => { if (center) toast("Brak dostępu do lokalizacji"); }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 });
  }

  /* routing */
  function routeK(path, pp) {
    if (!ND) return { html: `<div class="empty" style="padding-top:40vh"><i>${ico(C.ico)}</i><br>Wczytuję…</div>`, tab: "home", detail: false, map: false };
    const r = { html: "", tab: null, detail: false, map: false };
    const sub = path.slice(P.length + 2);
    if (sub.startsWith("obiekt/")) { r.html = viewDetail(decodeURIComponent(sub.slice(7)), pp.get("t")); r.detail = true; }
    else if (sub === "wyniki") r.html = viewResults(pp);
    else if (sub === "mapa") { r.map = true; r.tab = "mapa"; }
    else if (sub === "filtry") { r.html = viewFilters(); r.tab = "filtry"; }
    else if (sub === "ulubione") { r.html = viewFav(); r.tab = "ulubione"; }
    else if (sub === "rodzaj") { r.html = viewBanners("rodzaj"); r.tab = "rodzaj"; }
    else if (sub && C.big.some(([h]) => h === sub)) { r.html = viewBanners(sub); r.tab = "home"; }
    else { r.html = viewHome(); r.tab = "home"; }
    return r;
  }
  function cur() { const m = location.hash.match(new RegExp("^#/" + P + "/obiekt/([^?]+)")); return m && NBY[decodeURIComponent(m[1])]; }
  function bind() {
    const f = $("#kform");
    if (f) f.addEventListener("submit", (e) => { e.preventDefault(); const q = $("#kq").value.trim(); if (q) location.hash = hrefR({ q }); $("#kq").blur(); });
    $("#view").querySelectorAll(".kpc .strip").forEach((st) => {
      const dots = st.parentElement.querySelectorAll(".pc-dots b");
      if (dots.length) st.addEventListener("scroll", () => { const k = Math.round(st.scrollLeft / st.clientWidth); dots.forEach((d, i) => d.classList.toggle("on", i === k)); }, { passive: true });
    });
    if ($("#kminiMap")) initMini(cur());
  }
  function toggleFav(x) {
    FAV.has(x) ? FAV.delete(x) : FAV.add(x);
    try { localStorage.setItem(C.fav, JSON.stringify([...FAV])); } catch (e) {}
    document.querySelectorAll(`[data-kfav="${CSS.escape(x)}"]`).forEach((b) => b.classList.toggle("on", FAV.has(x)));
  }
  function toggleIn(F, k, v) {
    const D = FL.find((x) => x.k === k);
    if (D && D.multi) { F[k] = F[k] || []; F[k] = F[k].includes(v) ? F[k].filter((x) => x !== v) : [...F[k], v]; }
    else F[k] = F[k] === v ? null : v;
  }

  document.addEventListener("click", (e) => {
    if (!mine()) return;
    const t = e.target;
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    const fav = t.closest("[data-kfav]");
    if (fav) { stop(); toggleFav(fav.dataset.kfav); if (location.hash.startsWith(H + "/ulubione")) route(); return; }
    const kfc = t.closest("[data-kfc]");
    if (kfc) {
      stop();
      const onMap = !!kfc.closest("[data-map]");
      toggleIn(onMap ? MF : NS.f, kfc.dataset.kfc, kfc.dataset.v);
      const box = kfc.closest(".ms-b"), sc = box && box.scrollTop;
      if (onMap) { refreshMap(); renderSheet(); const b = $("#" + id("msheet") + " .ms-b"); if (b) b.scrollTop = sc; }
      else { const st = $("#view").scrollTop; route(); $("#view").scrollTop = st; }
      return;
    }
    if (t.closest("[data-kmfclear]")) { stop(); Object.keys(MF).forEach((k) => (MF[k] = Array.isArray(MF[k]) ? [] : null)); refreshMap(); renderSheet(); return; }
    if (t.closest("[data-kmfdone]")) { stop(); $("#" + id("msheet")).classList.remove("on"); return; }
    if (t.closest("[data-kreset]")) { stop(); NS.f = {}; NS.q = ""; route(); return; }
    const rm = t.closest("[data-krm]");
    if (rm) {
      stop();
      const k = rm.dataset.krm, f = { ...NS.f, q: NS.q };
      if (k.includes(":")) { const [a, b] = k.split(":"); f[a] = (f[a] || []).filter((x) => x !== b); } else f[k] = null;
      const so2 = new URLSearchParams(location.hash.split("?")[1] || "").get("sort");
      location.replace(hrefR(f) + (so2 ? "&sort=" + so2 : "")); return;
    }
    const so = t.closest("[data-ksort]");
    if (so) { stop(); const p = new URLSearchParams(location.hash.split("?")[1] || ""); p.set("sort", so.dataset.ksort); p.delete("n"); location.replace(H + "/wyniki?" + p); return; }
    const more = t.closest("[data-kmore]");
    if (more) { stop(); const p = new URLSearchParams(location.hash.split("?")[1] || ""); p.set("n", more.dataset.kmore); const st = $("#view").scrollTop; history.replaceState(null, "", H + "/wyniki?" + p); route(); $("#view").scrollTop = st; return; }
    const tb = t.closest("[data-ktab]");
    if (tb && cur()) {
      stop();
      const k = tb.dataset.ktab;
      document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.ktab === k));
      $("#pane").innerHTML = pane(cur(), k);
      if (k === "info") initMini(cur());
      return;
    }
    const vi = t.closest("[data-kvi]");
    if (vi && cur()) { stop(); openViewer(cur(), +vi.dataset.kvi); return; }
    if (t.closest("[data-kshare]")) {
      stop(); const p = cur(); if (!p) return;
      const url = location.href.split("#")[0] + H + "/obiekt/" + encodeURIComponent(p.id);
      if (navigator.share) navigator.share({ title: p.name, url }).catch(() => {});
      else { try { navigator.clipboard.writeText(url); toast("Skopiowano link"); } catch (err) {} }
      return;
    }
    const pc = t.closest(".kpc");
    if (pc) {
      stop();
      const st = pc.querySelector(".strip");
      VT_I = st ? Math.round(st.scrollLeft / st.clientWidth) : 0; VT_ID = null;
      document.querySelectorAll('[style*="view-transition-name"]').forEach((x) => (x.style.viewTransitionName = ""));
      if (canVT && st && st.children[VT_I]) { st.children[VT_I].classList.add("vt"); st.children[VT_I].style.viewTransitionName = "ph"; }
      location.hash = H + "/obiekt/" + encodeURIComponent(pc.dataset.kid); return;
    }
  }, true);

  const api = {
    p: P, cls: C.cls, tabs: C.tabs2, tile: C.tile, mine,
    route: routeK, bind,
    count: () => (ND ? ND.places.length : 0),
    banners: () => (ND && ND.meta.banners) || [],
    byId: (x) => NBY[x],
    mapVisible(on) { const w = $("#" + id("mapwrap")); if (on) { mapWrap().hidden = false; showMap(); } else if (w) w.hidden = true; },
  };
  KATS.push(api);
  return api;
}
