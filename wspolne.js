"use strict";
/* Funkcje wspólne dla wszystkich zakładek: Blisko mnie, Szukaj wszędzie, Mój plan, Z dziećmi.
   Nie mają własnych danych – korzystają z danych Restauracji (DB) i kategorii z KATS. Działają tak samo w każdym mieście. */
const CITY_C = { name: "Lublin", center: [51.2479, 22.5683], centerName: "Rynku", bounds: [51.13, 51.32, 22.42, 22.72] };
const PLAN_K = "gz-plan";
let PLAN = [];
try { PLAN = JSON.parse(localStorage.getItem(PLAN_K) || "[]").filter((x) => typeof x === "string"); } catch (e) {}
function planSave() { try { localStorage.setItem(PLAN_K, JSON.stringify(PLAN)); } catch (e) {} }
function planBtn(ref) {
  const on = PLAN.includes(ref);
  return `<button class="ib plb${on ? " pon" : ""}" data-plan="${esc(ref)}" aria-label="${on ? "Usuń z planu" : "Dodaj do planu"}"><i>${ico(on ? "planOk" : "planAdd")}</i></button>`;
}
const WSP = (function () {
  const P = "w", H = "#/" + P;
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  ICO.planAdd = S('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>');
  ICO.planOk = S('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15.5l2 2 4-4"/>');
  ICO.near = S('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>');
  ICO.up = S('<path d="M6 15l6-6 6 6"/>');
  ICO.down = S('<path d="M6 9l6 6 6-6"/>');
  ICO.trash = S('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>');
  ICO.sort = S('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>');
  ICO.familyS = S('<circle cx="8" cy="6" r="2.5"/><circle cx="16" cy="6" r="2.5"/><circle cx="12" cy="13" r="2"/><path d="M3 21v-5a5 5 0 0 1 10 0M11 16a5 5 0 0 1 10 0v5M9 21v-2a3 3 0 0 1 6 0v2"/>');

  /* źródła danych */
  const kat = (p) => (typeof KATS !== "undefined" ? KATS : []).find((k) => k.p === p);
  const SRC = [
    { p: "r", name: "Restauracje", one: "Restauracja", ico: "cloche", col: "#c0485a", list: () => DB.places, link: (x) => `#/lokal/${encodeURIComponent(x.id)}`,
      sub: (x) => (shortTags(x).join(" · ") || typeLabel(x.type)), hay: (x) => [x.name, x.category, typeLabel(x.type), ...(x.cuisines || []).map(cuisineLabel), x.address, x.desc].join(" ") },
    ...[["n", "Nocleg", "#5b8bd9"], ["rz", "Rozrywka", "#b46bd6"], ["rl", "Relaks", "#3fb3a8"], ["zw", "Zwiedzanie", "#d6a84e"], ["zk", "Zakupy", "#4fae7d"]].map(([p, one, col]) => ({
      p, one, col,
      get name() { const k = kat(p); return k ? k.name : one; },
      get ico() { const k = kat(p); return k ? k.ico : "pin"; },
      list: () => { const k = kat(p); return k && k.all ? k.all() : []; },
      link: (x) => `#/${p}/obiekt/${encodeURIComponent(x.id)}`,
      sub: (x) => { const k = kat(p); return k && k.sub ? k.sub(x) : ""; },
      hay: (x) => { const k = kat(p); return [x.name, x.address, k && k.kindLabel ? k.kindLabel(x) : "", x.areaName, x.category, x.tags, x.coKupic, x.desc].join(" "); },
    })),
  ];
  const SBY = Object.fromEntries(SRC.map((s) => [s.p, s]));
  function ready() {
    const ps = (typeof KATS !== "undefined" ? KATS : []).filter((k) => k.ready).map((k) => k.ready());
    return Promise.all(ps).then(() => new Promise((ok) => { const t = () => (DB.places.length ? ok() : setTimeout(t, 150)); t(); }));
  }
  function byRef(ref) {
    const i = ref.indexOf(":"), c = ref.slice(0, i), id = ref.slice(i + 1), s = SBY[c];
    if (!s) return null;
    const x = c === "r" ? BYID[id] : (kat(c) && kat(c).byId(id));
    return x ? { s, x, ref } : null;
  }
  const km = (a, b) => kmBetween(a, b);
  const dTxt = (k) => (k < 1 ? `${Math.max(50, Math.round((k * 1000) / 50) * 50)} m` : `${k.toFixed(1).replace(".", ",")} km`);
  const wd = () => (new Date().getDay() + 6) % 7;
  function todayLine(x) {
    const h = (x.hoursText || {})[DAYS[wd()]];
    if (!h) return "";
    if (/Zamknięte/.test(h)) return `<span class="trs n">Dziś zamknięte</span>`;
    if (/całą dobę/i.test(h)) return `<span class="trs y">Całą dobę</span>`;
    const os = openState(x);
    return `<span class="trs ${os ? "y" : ""}">${os ? "Otwarte · " : "Dziś "}${esc(h)}</span>`;
  }
  const score = (x) => (x.rating || 0) * Math.log10((x.reviews || 0) + 10);
  function row(s, x, extra = "") {
    const ph = x.photos && x.photos[0];
    return `<div class="wrow"><a class="wph" href="${s.link(x)}">${ph ? `<img src="${img(ph, 180, 180)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<i>${ico(s.ico)}</i>`}</a>
      <a class="wtx" href="${s.link(x)}"><span class="wcat" style="--c:${s.col}"><i>${ico(s.ico)}</i>${esc(s.one)}</span><b>${esc(x.name)}</b><span class="wsub">${esc(s.sub(x) || "")}</span>
      <span class="wmeta">${x.rating ? `<em>★ ${fmtR(x.rating)}</em>` : ""}${extra}</span>${todayLine(x)}</a>${planBtn(s.p + ":" + x.id)}</div>`;
  }
  function hcard(s, x) {
    const ph = x.photos && x.photos[0];
    return `<a class="whc" href="${s.link(x)}">${ph ? `<img src="${img(ph, 300, 200)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="whc-ph"><i>${ico(s.ico)}</i></span>`}<b>${esc(x.name)}</b><span>${esc(s.sub(x) || "")}</span><span>${x.rating ? `<em>★ ${fmtR(x.rating)}</em>` : ""}</span></a>`;
  }
  const bar = (t, back = "#/") => `<div class="bar"><a class="ib" href="${back}" data-back><i>${ico("back")}</i></a><h2 class="ttl">${esc(t)}</h2><span class="ib"></span></div>`;

  /* start */
  function startHtml() {
    const n = PLAN.length;
    return `<section class="sec wstart"><form class="search" id="wform"><i>${ico("search")}</i><input id="wq" type="search" enterkeyhint="search" placeholder="Szukaj we wszystkich zakładkach…" autocomplete="off"></form>
      <div class="wquick"><a href="${H}/blisko"><i>${ico("near")}</i><span>Blisko mnie</span></a><a href="${H}/plan"><i>${ico("planAdd")}</i><span>Mój plan</span>${n ? `<b>${n}</b>` : ""}</a><a href="${H}/dzieci"><i>${ico("familyS")}</i><span>Z dziećmi</span></a></div></section>`;
  }

  /* szukaj wszędzie (te same zasady co wyszukiwarki w zakładkach – qWords w app.js) */
  const words = qWords;
  function hits(q) {
    const w = words(q);
    if (!w.length) return [];
    return SRC.map((s) => {
      const L = s.list().map((x) => {
        const nm = norm(x.name), hay = norm(s.hay(x));
        if (!w.every((t) => hay.includes(t) || nm.includes(t))) return null;
        const sc = (nm.startsWith(w[0]) ? 4 : 0) + w.filter((t) => nm.includes(t)).length * 2 + score(x) / 20;
        return [x, sc];
      }).filter(Boolean).sort((a, b) => b[1] - a[1]).map((a) => a[0]);
      return { s, L };
    }).filter((g) => g.L.length);
  }
  function trasyHits(q) {
    const T = kat("tr"); if (!T || !T.all) return [];
    const w = words(q);
    return T.all().filter((t) => { const h = norm([t.title, t.sub, t.intro, ...t.days.flatMap((d) => d.stops.map((s) => s.name))].join(" ")); return w.every((x) => h.includes(x)); });
  }
  function resHtml(q) {
    if (!norm(q).trim()) return `<div class="empty"><i>${ico("search")}</i><br>Wpisz nazwę miejsca, potrawę, ulicę albo rodzaj miejsca – np. „pierogi”, „Grodzka”, „sauna”, „muzeum”.</div>`;
    const G = hits(q), T = trasyHits(q);
    const n = G.reduce((a, g) => a + g.L.length, 0) + T.length;
    if (!n) return `<div class="empty"><i>${ico("search")}</i><br>Nic nie znalazłem dla „${esc(q)}”.<br>Spróbuj krótszego słowa albo innej pisowni.</div>`;
    const all = (s) => (s.p === "r" ? qs({ q }) : `#/${s.p}/wyniki?q=${encodeURIComponent(q)}`);
    return `<div class="count">Znaleziono ${n} ${plural(n, "wynik", "wyniki", "wyników")}</div>` +
      (T.length ? `<section class="wgrp"><div class="sec-h"><h2>Trasy</h2></div>${T.map((t) => `<a class="wtr" href="#/tr/trasa/${t.id}"><i>${ico("route")}</i><span><b>${esc(t.title)}</b><span>${esc(t.sub)}</span></span></a>`).join("")}</section>` : "") +
      G.map((g) => `<section class="wgrp"><div class="sec-h"><h2>${esc(g.s.name)} <small>${g.L.length}</small></h2>${g.L.length > 5 ? `<a href="${all(g.s)}">Wszystkie ›</a>` : ""}</div>${g.L.slice(0, 5).map((x) => row(g.s, x)).join("")}</section>`).join("");
  }
  function viewSzukaj(pp) {
    const q = pp.get("q") || "";
    return `<div class="bar"><a class="ib" href="#/" data-back><i>${ico("back")}</i></a><form class="search wsf" id="wform2"><i>${ico("search")}</i><input id="wq2" type="search" enterkeyhint="search" value="${esc(q)}" placeholder="Szukaj we wszystkich zakładkach…" autocomplete="off"></form></div>
      <div id="wres" class="wres">${resHtml(q)}</div>`;
  }

  /* blisko mnie */
  const NS = { pos: null, src: null, r: 1, cats: [], open: false, asked: false };
  let MAPB = null;
  function locate() {
    if (NS.asked) return; NS.asked = true;
    const fall = (why) => { NS.pos = CITY_C.center; NS.src = why; if (location.hash.startsWith(H + "/blisko")) route(); };
    if (!navigator.geolocation) return fall("brak");
    navigator.geolocation.getCurrentPosition((g) => {
      const p = [g.coords.latitude, g.coords.longitude], b = CITY_C.bounds;
      if (p[0] > b[0] && p[0] < b[1] && p[1] > b[2] && p[1] < b[3]) { NS.pos = p; NS.src = "gps"; if (location.hash.startsWith(H + "/blisko")) route(); }
      else fall("poza");
    }, () => fall("odmowa"), { enableHighAccuracy: true, maximumAge: 60000, timeout: 12000 });
  }
  function nearList() {
    const out = [];
    for (const s of SRC) {
      if (NS.cats.length && !NS.cats.includes(s.p)) continue;
      for (const x of s.list()) {
        if (!x.lat || (s.p === "rz" && x.rest)) continue; // lokal jest już w Restauracjach
        const d = km(NS.pos, [x.lat, x.lng]);
        if (d > NS.r) continue;
        if (NS.open && openState(x) !== true) continue;
        out.push([s, x, d]);
      }
    }
    return out.sort((a, b) => a[2] - b[2]);
  }
  function viewBlisko() {
    locate();
    if (!NS.pos) return bar("Blisko mnie") + `<div class="empty" style="padding-top:22vh"><i>${ico("near")}</i><br>Ustalam Twoją lokalizację…<br><small>Jeśli przeglądarka zapyta o zgodę, wybierz „Zezwól”.</small></div>`;
    const L = nearList();
    const msg = { poza: `Jesteś poza miastem ${CITY_C.name} – pokazuję miejsca wokół ${CITY_C.centerName}.`, odmowa: `Brak dostępu do lokalizacji – pokazuję miejsca wokół ${CITY_C.centerName}. Możesz włączyć lokalizację w ustawieniach przeglądarki.`, brak: `Ta przeglądarka nie udostępnia lokalizacji – pokazuję miejsca wokół ${CITY_C.centerName}.` }[NS.src];
    return bar("Blisko mnie") + `${msg ? `<div class="wnote">${esc(msg)}</div>` : ""}
      <div class="chips wchips">${[0.5, 1, 2, 5].map((r) => `<button class="chip ${NS.r === r ? "" : "off"}" data-wr="${r}">${r < 1 ? "500 m" : r + " km"}</button>`).join("")}<button class="chip ${NS.open ? "" : "off"}" data-wopen>Otwarte teraz</button></div>
      <div class="chips wchips">${SRC.map((s) => `<button class="chip ${NS.cats.includes(s.p) ? "" : "off"}" data-wcat="${s.p}"><i style="color:${s.col}">${ico(s.ico)}</i>${esc(s.name)}</button>`).join("")}</div>
      <div class="trmap wmap" id="wmap"></div>
      <div class="count">${L.length ? `${L.length} ${plural(L.length, "miejsce", "miejsca", "miejsc")} w promieniu ${NS.r < 1 ? "500 m" : NS.r + " km"}${L.length > 80 ? " – pokazuję 80 najbliższych" : ""}` : "Nic tu nie ma – zwiększ promień albo usuń filtry."}</div>
      <div class="wlist">${L.slice(0, 80).map(([s, x, d]) => row(s, x, `<span>${dTxt(d)}</span>`)).join("")}</div>`;
  }
  async function initMapB() {
    const el = $("#wmap"); if (!el || !NS.pos) return;
    try { await ensureLeaflet(); } catch (e) { el.remove(); return; }
    if (!document.body.contains(el)) return;
    const Lf = window.L;
    if (MAPB) { try { MAPB.remove(); } catch (e) {} }
    MAPB = Lf.map(el, { zoomControl: false, scrollWheelZoom: false });
    Lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(MAPB);
    const L = nearList().slice(0, 80), pts = [NS.pos];
    Lf.marker(NS.pos, { icon: Lf.divIcon({ html: NS.src === "gps" ? '<div class="me"></div>' : '<span class="wmk c"></span>', className: "", iconSize: [18, 18] }), interactive: false }).addTo(MAPB);
    L.forEach(([s, x]) => {
      Lf.marker([x.lat, x.lng], { icon: Lf.divIcon({ html: `<span class="wmk" style="--c:${s.col}"></span>`, className: "", iconSize: [16, 16] }) })
        .bindPopup(`<a class="pop" href="${s.link(x)}">${x.photos && x.photos[0] ? `<img src="${img(x.photos[0], 200, 200)}" alt="" referrerpolicy="no-referrer">` : ""}<div><b>${esc(x.name)}</b><span>${esc(s.one)}</span></div></a>`, { closeButton: false, className: "gz-pop", offset: [0, -4] }).addTo(MAPB);
      pts.push([x.lat, x.lng]);
    });
    MAPB.fitBounds(Lf.latLngBounds(pts), { padding: [24, 24], maxZoom: 16 });
  }

  /* mój plan */
  let MAPP = null, CLEAR = false;
  function planItems() { return PLAN.map(byRef).filter(Boolean); }
  function legKm(a, b) { return km([a.x.lat, a.x.lng], [b.x.lat, b.x.lng]) * 1.3; }
  function viewPlan() {
    const I = planItems();
    if (I.length !== PLAN.length) { PLAN = I.map((it) => it.ref); planSave(); } // usuń miejsca, których już nie ma w danych
    if (!I.length) return bar("Mój plan") + `<div class="empty"><i>${ico("planAdd")}</i><br>Twój plan jest pusty.<br>Na karcie dowolnego miejsca dotknij ikony kalendarza z plusem u góry – miejsce trafi tutaj. Potem ułożysz kolejność i otworzysz całość w Mapach Google.</div>
      <div class="wpad"><a class="btn ol" href="#/tr"><i>${ico("route")}</i>Zobacz gotowe trasy</a></div>`;
    let tot = 0;
    const rows = I.map((it, i) => {
      const leg = i ? legKm(I[i - 1], it) : 0; tot += leg;
      const lg = i ? `<div class="trleg ${leg > 2 ? "car" : ""}"><i>${ico(leg > 2 ? "carL" : "walk")}</i>ok. ${dTxt(leg)}${leg > 2 ? "" : ` · ok. ${Math.max(1, Math.round((leg * 1000) / 75))} min pieszo`}</div>` : "";
      const ph = it.x.photos && it.x.photos[0];
      return `${lg}<div class="trst wpl"><span class="trnum">${i + 1}</span><a class="trph" href="${it.s.link(it.x)}">${ph ? `<img src="${img(ph, 180, 180)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<i>${ico(it.s.ico)}</i>`}</a>
        <div class="trtx"><a href="${it.s.link(it.x)}"><span class="wcat" style="--c:${it.s.col}"><i>${ico(it.s.ico)}</i>${esc(it.s.one)}</span><b>${esc(it.x.name)}</b></a><span class="trlb">${esc(it.s.sub(it.x) || "")}</span>${todayLine(it.x)}
        <div class="wctl"><button data-pmv="${i}" data-d="-1" ${i ? "" : "disabled"} aria-label="W górę"><i>${ico("up")}</i></button><button data-pmv="${i}" data-d="1" ${i < I.length - 1 ? "" : "disabled"} aria-label="W dół"><i>${ico("down")}</i></button><button data-prm="${esc(it.ref)}" aria-label="Usuń"><i>${ico("trash")}</i></button></div></div></div>`;
    }).join("");
    const car = tot > 5;
    const pts = I.map((it) => `${it.x.lat},${it.x.lng}`);
    const u = new URLSearchParams({ api: "1", destination: pts[pts.length - 1], travelmode: car ? "driving" : "walking" });
    if (pts.length > 1) { u.set("origin", pts[0]); if (pts.length > 2) u.set("waypoints", pts.slice(1, -1).slice(0, 9).join("|")); }
    const shut = I.filter((it) => /Zamknięte/.test((it.x.hoursText || {})[DAYS[wd()]] || ""));
    return bar("Mój plan") + `<div class="trbody">
      <div class="trpills"><span><i>${ico("pin")}</i>${I.length} ${plural(I.length, "miejsce", "miejsca", "miejsc")}</span>${I.length > 1 ? `<span><i>${ico(car ? "carL" : "walk")}</i>ok. ${dTxt(tot)}</span>` : ""}</div>
      <div class="trmap" id="wpmap"></div>
      <div class="wbtns">${I.length > 2 ? `<button class="btn ol" data-psort><i>${ico("sort")}</i>Ułóż najkrótszą trasę</button>` : ""}<a class="btn ol" href="https://www.google.com/maps/dir/?${u}" target="_blank" rel="noopener"><i>${ico("gmaps") || ico("map")}</i>Mapy Google</a></div>
      ${shut.length ? `<div class="trwarn"><b>Dziś (${DAYS[wd()]}) zamknięte:</b> ${shut.map((it) => esc(it.x.name)).join(", ")}.</div>` : ""}
      <div class="trlist">${rows}</div>
      <button class="btn wclr" data-pclear>${CLEAR ? "Na pewno? Dotknij jeszcze raz" : "Wyczyść plan"}</button>
      <p class="trsrc">Odległości są w linii prostej powiększonej o ok. 30% – rzeczywista trasa może być trochę inna. Kolejność i plan zapisują się tylko na tym urządzeniu.</p></div>`;
  }
  function sortPlan() { // pierwsze miejsce zostaje na początku; do 8 miejsc sprawdzamy wszystkie kolejności, powyżej – najbliższy sąsiad + poprawki 2-opt
    const I = planItems(); if (I.length < 3) return;
    const len = (o) => o.reduce((a, it, i) => a + (i ? legKm(o[i - 1], it) : 0), 0);
    let best;
    if (I.length <= 8) {
      const perm = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r])));
      best = perm(I.slice(1)).map((r) => [I[0], ...r]).reduce((b, o) => (!b || len(o) < len(b) ? o : b), null);
    } else {
      const rest = I.slice(1); best = [I[0]];
      while (rest.length) { const l = best[best.length - 1]; let bi = 0; rest.forEach((r, i) => { if (legKm(l, r) < legKm(l, rest[bi])) bi = i; }); best.push(rest.splice(bi, 1)[0]); }
      for (let ok = true; ok; ) { ok = false; for (let i = 1; i < best.length - 1; i++) for (let j = i + 1; j < best.length; j++) { const o = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)]; if (len(o) < len(best) - 1e-9) { best = o; ok = true; } } }
    }
    PLAN = best.map((it) => it.ref); planSave();
  }
  async function initMapP() {
    const el = $("#wpmap"); if (!el) return;
    const I = planItems();
    try { await ensureLeaflet(); } catch (e) { el.remove(); return; }
    if (!document.body.contains(el)) return;
    const Lf = window.L;
    if (MAPP) { try { MAPP.remove(); } catch (e) {} }
    MAPP = Lf.map(el, { zoomControl: false, scrollWheelZoom: false });
    Lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(MAPP);
    const pts = I.map((it) => [it.x.lat, it.x.lng]);
    if (pts.length > 1) Lf.polyline(pts, { color: "#d6a84e", weight: 3, opacity: 0.85, dashArray: "6 8" }).addTo(MAPP);
    I.forEach((it, i) => Lf.marker(pts[i], { icon: Lf.divIcon({ html: `<span class="trmk">${i + 1}</span>`, className: "", iconSize: [28, 28], iconAnchor: [14, 14] }) })
      .bindPopup(`<a class="pop" href="${it.s.link(it.x)}"><div><b>${i + 1}. ${esc(it.x.name)}</b><span>${esc(it.s.one)}</span></div></a>`, { closeButton: false, className: "gz-pop" }).addTo(MAPP));
    if (pts.length === 1) MAPP.setView(pts[0], 16); else MAPP.fitBounds(Lf.latLngBounds(pts), { padding: [28, 28], maxZoom: 17 });
  }

  /* z dziećmi */
  function viewDzieci() {
    const sec = [
      ["zw", (x) => (x.occ || []).includes("dzieci"), "#/zw/wyniki?occ=dzieci"],
      ["rz", (x) => (x.occ || []).includes("dzieci") || x.kind === "dzieci", "#/rz/wyniki?occ=dzieci"],
      ["r", (x) => (x.occasions || []).includes("rodzinna"), qs({ occ: "rodzinna" })],
      ["zk", (x) => (x.occ || []).includes("dzieci"), "#/zk/wyniki?occ=dzieci"],
      ["n", (x) => (x.occ || []).includes("rodzina"), "#/n/wyniki?occ=rodzina"],
    ];
    const T = kat("tr"), tr = T && T.all ? T.all().filter((t) => t.kind === "dzieci") : [];
    const ttl = { zw: "Do zobaczenia", rz: "Zabawa i atrakcje", r: "Gdzie zjeść z rodziną", zk: "Zakupy z dziećmi", n: "Noclegi dla rodzin" };
    return bar("Z dziećmi") + `<section class="sec st-lead"><p>Miejsca oznaczone jako dobre dla dzieci we wszystkich zakładkach – w jednym miejscu.</p></section>
      ${tr.length ? `<div class="bns">${tr.map((t) => banner("trasy-" + t.kind, t.title, t.sub, `#/tr/trasa/${t.id}`, "#0f2430", "familyS")).join("")}</div>` : ""}
      ${sec.map(([p, f, href]) => {
        const s = SBY[p], L = s.list().filter(f).sort((a, b) => score(b) - score(a));
        if (!L.length) return "";
        return `<section class="sec"><div class="sec-h"><h2>${ttl[p]} <small>${L.length}</small></h2><a href="${href}">Zobacz wszystkie ›</a></div></section><div class="whrow">${L.slice(0, 10).map((x) => hcard(s, x)).join("")}</div>`;
      }).join("")}`;
  }

  /* routing */
  function routeW(path, pp) {
    const sub = path.slice(P.length + 2);
    const all = SRC.every((s) => s.p === "r" ? DB.places.length : kat(s.p) && kat(s.p).all().length);
    if (!all) { ready().then(() => { if (location.hash.startsWith(H)) route(); }); return { html: `<div class="empty" style="padding-top:40vh"><i>${ico("search")}</i><br>Wczytuję…</div>`, tab: null, detail: false, map: false }; }
    if (sub.startsWith("szukaj")) return { html: viewSzukaj(pp), tab: "szukaj", detail: false, map: false };
    if (sub === "plan") return { html: viewPlan(), tab: "plan", detail: false, map: false };
    if (sub === "dzieci") return { html: viewDzieci(), tab: "dzieci", detail: false, map: false };
    return { html: viewBlisko(), tab: "blisko", detail: false, map: false };
  }
  function bind() {
    if ($("#wmap")) initMapB();
    if ($("#wpmap")) initMapP();
    const q2 = $("#wq2");
    if (q2) {
      let t = null;
      q2.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { $("#wres").innerHTML = resHtml(q2.value); history.replaceState(null, "", `${H}/szukaj?q=${encodeURIComponent(q2.value)}`); }, 220); });
      $("#wform2").addEventListener("submit", (e) => { e.preventDefault(); q2.blur(); });
      if (!q2.value) setTimeout(() => q2.focus(), 50);
    }
  }
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "wform") return;
    e.preventDefault(); const q = $("#wq").value.trim();
    location.hash = `${H}/szukaj?q=${encodeURIComponent(q)}`;
  }, true);
  document.addEventListener("click", (e) => {
    const t = e.target;
    const pb = t.closest("[data-plan]");
    if (pb) {
      e.preventDefault(); e.stopPropagation();
      const r = pb.dataset.plan, i = PLAN.indexOf(r);
      if (i >= 0) PLAN.splice(i, 1); else PLAN.push(r);
      planSave();
      document.querySelectorAll(`[data-plan="${CSS.escape(r)}"]`).forEach((b) => { b.classList.toggle("pon", i < 0); b.innerHTML = `<i>${ico(i < 0 ? "planOk" : "planAdd")}</i>`; });
      toast(i < 0 ? `Dodano do planu (${PLAN.length})` : "Usunięto z planu");
      if (location.hash === H + "/plan") route();
      return;
    }
    const tp = t.closest("[data-planall]");
    if (tp) {
      e.preventDefault(); e.stopPropagation();
      const refs = tp.dataset.planall.split("|"); let n = 0;
      refs.forEach((r) => { if (!PLAN.includes(r)) { PLAN.push(r); n++; } });
      planSave(); toast(n ? `Dodano ${n} ${plural(n, "miejsce", "miejsca", "miejsc")} do planu` : "Te miejsca są już w planie");
      return;
    }
    if (!location.hash.startsWith(H + "/")) return;
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    const r = t.closest("[data-wr]"); if (r) { stop(); NS.r = +r.dataset.wr; route(); return; }
    if (t.closest("[data-wopen]")) { stop(); NS.open = !NS.open; route(); return; }
    const c = t.closest("[data-wcat]"); if (c) { stop(); const p = c.dataset.wcat; NS.cats = NS.cats.includes(p) ? NS.cats.filter((x) => x !== p) : [...NS.cats, p]; route(); return; }
    const mv = t.closest("[data-pmv]");
    if (mv) { stop(); const i = +mv.dataset.pmv, j = i + +mv.dataset.d; if (j < 0 || j >= PLAN.length) return; const I = planItems().map((x) => x.ref); [I[i], I[j]] = [I[j], I[i]]; PLAN = I; planSave(); const st = $("#view").scrollTop; route(); $("#view").scrollTop = st; return; }
    const rm = t.closest("[data-prm]");
    if (rm) { stop(); PLAN = PLAN.filter((x) => x !== rm.dataset.prm); planSave(); const st = $("#view").scrollTop; route(); $("#view").scrollTop = st; return; }
    if (t.closest("[data-psort]")) { stop(); sortPlan(); route(); toast("Ułożono najkrótszą trasę od pierwszego miejsca"); return; }
    if (t.closest("[data-pclear]")) { stop(); if (CLEAR) { PLAN = []; planSave(); CLEAR = false; } else { CLEAR = true; setTimeout(() => { CLEAR = false; }, 4000); } route(); return; }
  }, true);

  const api = {
    p: P, cls: "cat-w", mine: () => location.hash.startsWith(H + "/"),
    tabs: [["/blisko", "blisko", "near", "Blisko"], ["/szukaj", "szukaj", "search", "Szukaj"], ["/plan", "plan", "planAdd", "Mój plan"], ["/dzieci", "dzieci", "familyS", "Z dziećmi"]],
    tile: null, route: routeW, bind, count: () => 0, banners: () => [], byId: () => null, mapVisible() {},
  };
  KATS.push(api);
  return { startHtml, api };
})();
