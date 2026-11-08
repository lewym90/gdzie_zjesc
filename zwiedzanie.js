"use strict";
/* Kategoria Zwiedzanie: konfiguracja dla kat.js. Dane z data/zwiedzanie.json. Rodzaje i okazje są wspólne dla wszystkich miast. */
const ZWIEDZANIE = (function () {
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  ICO.landmark = S('<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M10 21v-5a2 2 0 0 1 4 0v5M8 12h.01M16 12h.01"/>');
  ICO.castle = S('<path d="M4 21V8h3v2h2V8h2v2h2V8h2v2h2V8h3v13z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4M6 4v4M18 4v4"/>');
  ICO.museum = S('<path d="M3 9l9-5 9 5zM4 21h16M5 19h14M6 10v8M10 10v8M14 10v8M18 10v8"/>');
  ICO.church = S('<path d="M12 2v4M10 4h4M12 6l5 4v11H7V10z"/><path d="M4 21v-6l3-2M20 21v-6l-3-2M10.5 21v-3.5a1.5 1.5 0 0 1 3 0V21"/>');
  ICO.candle = S('<path d="M9 21h6M10 21V10h4v11M12 10V8"/><path d="M12 3c1.2 1.4 1.5 2.6.9 3.6-.4.7-1.4.7-1.8 0-.6-1 .2-2.2.9-3.6z"/>');
  ICO.tree = S('<path d="M12 21v-5M8 21h8"/><path d="M12 3c3 2 5 4.6 5 7.4A4.6 4.6 0 0 1 12.4 15h-.8A4.6 4.6 0 0 1 7 10.4C7 7.6 9 5 12 3z"/>');
  ICO.fountain = S('<path d="M4 21h16M6 21v-3h12v3M12 18V9"/><path d="M12 9c-1.5-2.5-4-3.5-6-3M12 9c1.5-2.5 4-3.5 6-3M12 9c0-2 .5-4 0-6"/>');
  ICO.route = S('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>');
  ICO.compass = S('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>');
  ICO.rain = ICO.umbrella || S('<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/>');
  ICO.free = S('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.3 2.3 4.7-5"/>');
  ICO.moon = S('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>');
  ICO.view = S('<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>');
  ICO.kid = ICO.balloon || ICO.family;
  ICO.hourglass = S('<path d="M6 3h12M6 21h12M7 3c0 4 5 5.5 5 9s-5 5-5 9M17 3c0 4-5 5.5-5 9s5 5 5 9"/>');
  const KINDS = [
    { id: "zabytki", label: "Zabytki i architektura", one: "Zabytek", sub: "Stare miasto, bramy, kamienice", tint: "#2a2016", ico: "landmark" },
    { id: "zamki", label: "Zamki i pałace", one: "Zamek lub pałac", sub: "Rezydencje, twierdze, ruiny", tint: "#1c2030", ico: "castle" },
    { id: "muzea", label: "Muzea i galerie", one: "Muzeum", sub: "Historia, sztuka, wystawy", tint: "#14261f", ico: "museum" },
    { id: "swiatynie", label: "Kościoły i świątynie", one: "Świątynia", sub: "Katedry, bazyliki, cerkwie", tint: "#26200f", ico: "church" },
    { id: "pamiec", label: "Miejsca pamięci", one: "Miejsce pamięci", sub: "Pomniki, cmentarze, historia", tint: "#1f1f24", ico: "candle" },
    { id: "przyroda", label: "Parki i przyroda", one: "Park lub przyroda", sub: "Ogrody, rezerwaty, woda", tint: "#16261a", ico: "tree" },
    { id: "nowoczesne", label: "Nowoczesne atrakcje", one: "Nowoczesna atrakcja", sub: "Nauka, fontanny, street art", tint: "#0f2430", ico: "fountain" },
    { id: "okolice", label: "Wycieczki w okolicy", one: "Wycieczka w okolicy", sub: "Do 50 km od centrum", tint: "#2a1f12", ico: "route" },
  ];
  const OCCS = [
    { id: "pierwszy", label: "Pierwszy raz w mieście", sub: "Tego nie można pominąć", tint: "#2a2016", ico: "compass" },
    { id: "dzieci", label: "Z dziećmi", sub: "Ciekawe dla najmłodszych", tint: "#0f2430", ico: "kid" },
    { id: "deszcz", label: "Na deszczowy dzień", sub: "Pod dachem", tint: "#1c2030", ico: "rain" },
    { id: "darmo", label: "Za darmo", sub: "Bez biletu", tint: "#16261a", ico: "free" },
    { id: "wieczor", label: "Wieczorem", sub: "Iluminacje i nocne spacery", tint: "#141a2e", ico: "moon" },
    { id: "widoki", label: "Punkty widokowe", sub: "Panoramy i tarasy", tint: "#2a1f12", ico: "view" },
  ];
  const score = (p) => (p.rating || 0) * Math.log10(p.reviews + 10) + (p.occ.includes("pierwszy") ? 6 : 0);
  const dayIdx = () => (new Date().getDay() + 6) % 7;
  const todayText = (p) => (p.hoursText || {})[DAYS[dayIdx()]];
  const kindOf = (id) => KINDS.find((k) => k.id === id) || KINDS[0];
  const near = (p, ND) => ND.places.filter((q) => q.id !== p.id && kmBetween([p.lat, p.lng], [q.lat, q.lng]) < 0.7)
    .map((q) => [q, kmBetween([p.lat, p.lng], [q.lat, q.lng])]).sort((a, b) => a[1] - b[1]).slice(0, 4);
  const mDist = (km) => (km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${String(km.toFixed(1)).replace(".", ",")} km`);
  return makeKat({
    p: "zw", name: "Zwiedzanie", data: "data/zwiedzanie.json", fav: "gz-fav-zw", cls: "cat-zw", ico: "landmark", mk: "zwmk", cl: "zwcl", bn: "zwiedzanie-", bnOcc: "zwiedzanie-okazja-",
    noun: ["miejsce", "miejsca", "miejsc"], allLabel: "Wszystkie miejsca", emptyText: "Nie znalazłem miejsc dla tych filtrów.",
    searchPh: "Szukaj zabytku, muzeum, parku…", filtersTitle: "Filtry zwiedzania", favTitle: "Ulubione do zwiedzenia", favEmpty: "Nie masz jeszcze ulubionych miejsc.",
    kinds: KINDS, occs: OCCS, kindsTitle: "Co zwiedzać",
    tile: ["kat-zwiedzanie", "Zwiedzanie", (n) => (n ? `${n} ${plural(n, "miejsce", "miejsca", "miejsc")} · zabytki, muzea, parki` : "Zabytki, muzea, parki"), "#2a2016", "landmark"],
    tabs2: [["", "home", "compass", "Odkrywaj"], ["/rodzaj", "rodzaj", "landmark", "Rodzaj"], ["/mapa", "mapa", "map", "Mapa"], ["/filtry", "filtry", "sliders", "Filtry"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    big: [["rodzaj", "landmark", "Rodzaj"], ["okazje", "calendar", "Okazja"], ["wyniki?occ=pierwszy", "compass", "Pierwszy raz"], ["wyniki?occ=darmo", "free", "Za darmo"]],
    filters: [
      { k: "kind", title: "Rodzaj", opts: KINDS.map((k) => [k.id, k.label]), test: (p, v) => p.kind === v },
      { k: "occ", title: "Okazja", opts: OCCS.map((o) => [o.id, o.label]), test: (p, v) => p.occ.includes(v) },
      { k: "open", title: "Godziny", opts: [["1", "Otwarte teraz"]], test: (p) => openState(p) === true },
      { k: "czas", title: "Czas zwiedzania", opts: [["1", "Do 1 godziny"], ["2", "1–2 godziny"], ["3", "Dłużej"]], test: (p, v) => (v === "1" ? p.czasMin <= 60 : v === "2" ? p.czasMin > 60 && p.czasMin <= 120 : p.czasMin > 120) },
      { k: "rate", title: "Ocena", opts: [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]], test: (p, v) => (p.rating || 0) >= +v },
    ],
    sorts: [
      ["pol", "Polecane", (a, b) => score(b) - score(a)],
      ["ocena", "Najlepiej oceniane", (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews],
      ["rynek", "Najbliżej centrum", (a, b) => a.dRynek - b.dRynek],
    ],
    home: ({ ND, card, hrefR }) => {
      const top = ND.places.filter((p) => p.occ.includes("pierwszy")).sort((a, b) => score(b) - score(a)).slice(0, 8);
      return `<section class="sec"><div class="sec-h"><h2>Na pierwszy raz</h2><a href="${hrefR({ occ: "pierwszy" })}">Zobacz wszystkie ›</a></div></section>
      <div class="cards">${top.map(card).join("")}</div>`;
    },
    extraBanners: () => ({ t: "", items: [] }),
    badge: (p) => { const os = openState(p); return os === null ? "" : `<span class="open-badge ${os ? "y" : "n"}">${os ? "Otwarte" : "Zamknięte"}</span>`; },
    subLine: (p) => [p.category || kindOf(p.kind).one],
    kindLine: (p) => p.category || kindOf(p.kind).one,
    acts: (p) => [["Strona", "globeL", p.www], ["Bilety", "ticket", p.link || p.www], ["Telefon", "phone", p.phone ? "tel:" + p.phone.replace(/\s/g, "") : null, false], ["Trasa", "navi", navUrl(p)]],
    sm: (p) => {
      const h = todayText(p), os = openState(p);
      return `<p>${esc(p.category || "")}${p.czas ? ` · zwiedzanie ${esc(p.czas)}` : ""}.</p>
      ${h ? `<div class="sm-row"><i>${ico("clock")}</i>${/Zamknięte/.test(h) ? `<span class="cl">Dziś zamknięte</span>` : `<span class="${os ? "op" : ""}">${os ? "Otwarte dziś" : "Dziś"}:</span><span>${esc(h)}</span>`}</div>` : ""}
      ${p.priceText ? `<div class="sm-row"><i>${ico("ticket")}</i><span>${esc(p.priceText)}</span></div>` : ""}`;
    },
    tabs: [["info", "Informacje"], ["godziny", "Godziny"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]],
    pane: (p) => {
      const ht = p.hoursText || {}, wd = dayIdx();
      if (!Object.keys(ht).length) return `<p class="note">${esc(p.hoursNote || "Miejsce dostępne bez stałych godzin otwarcia.")}</p>`;
      return `<table class="hours">${DAYS.map((d, i) => `<tr class="${i === wd ? "today" : ""}"><td>${d[0].toUpperCase() + d.slice(1)}</td><td>${esc(ht[d] || "brak danych")}</td></tr>`).join("")}</table>${p.hoursNote ? `<p class="note" style="margin-top:12px">${esc(p.hoursNote)}</p>` : ""}`;
    },
    infoRows: (p, { ND }) => {
      const nb = near(p, ND);
      return `<div class="row"><i>${ico(kindOf(p.kind).ico)}</i><div><b>Rodzaj:</b> ${esc((p.category || "").toLowerCase())}</div></div>
      ${p.czas ? `<div class="row"><i>${ico("hourglass")}</i><div><b>Czas zwiedzania:</b> ${esc(p.czas)}</div></div>` : ""}
      ${p.priceText ? `<div class="row"><i>${ico("ticket")}</i><div><b>Bilety:</b> ${esc(p.priceText)}</div></div>` : ""}
      ${p.darmowe ? `<div class="row"><i>${ico("free")}</i><div><b>Wstęp wolny:</b> ${esc(p.darmowe)}</div></div>` : ""}
      ${p.rezerwacja ? `<div class="row"><i>${ico("calendar")}</i><div><b>Rezerwacja:</b> ${esc(p.rezerwacja)}</div></div>` : ""}
      ${p.dla ? `<div class="row"><i>${ico("family")}</i><div><b>Dobrze wiedzieć:</b> ${esc(p.dla)}</div></div>` : ""}
      ${nb.length ? `<div class="row"><i>${ico("route")}</i><div><b>W pobliżu:</b> ${nb.map(([q, km]) => `<a href="#/zw/obiekt/${encodeURIComponent(q.id)}">${esc(q.name)}</a> (${mDist(km)})`).join(", ")}</div></div>` : ""}`;
    },
  });
})();
