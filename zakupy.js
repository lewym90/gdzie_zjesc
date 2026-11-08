"use strict";
/* Kategoria Zakupy: konfiguracja dla kat.js. Dane z data/zakupy.json. Rodzaje i okazje są wspólne dla wszystkich miast. */
const ZAKUPY = (function () {
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  ICO.bag = S('<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>');
  ICO.mall = S('<path d="M3 21h18M4 21V9l8-5 8 5v12"/><path d="M8 21v-6h8v6M8 11h8"/>');
  ICO.stall = S('<path d="M3 9l2-5h14l2 5z"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v9h14v-9M10 21v-5h4v5"/>');
  ICO.jar = S('<path d="M8 3h8v3H8zM7 6h10l1 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z"/><path d="M6 12h12"/>');
  ICO.vase = S('<path d="M9 3h6M10 3v3c-3 2-4 5-4 8a6 6 0 0 0 12 0c0-3-1-6-4-8V3"/><path d="M7 13h10"/>');
  ICO.book = S('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>');
  ICO.hanger = S('<path d="M12 7a2 2 0 1 1 2-2c0 1-2 1.5-2 3l9 7.5a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L12 8"/>');
  ICO.cake = S('<path d="M4 21h16M5 21v-7h14v7M5 17c2 1 3-1 4.7 0s3 1 4.6 0 3-1 4.7 0"/><path d="M12 14v-3M12 8c.8-1 .8-2 0-3-.8 1-.8 2 0 3z"/>');
  ICO.wine = S('<path d="M8 3h8l-.5 5a3.5 3.5 0 0 1-7 0zM12 11.5V20M8.5 21h7"/>');
  ICO.gift = S('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-3-6-3-6-1s4 1 6 1c2 0 6 1 6-1s-4-2-6 1"/>');
  ICO.sunday = S('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>');
  ICO.rain = ICO.rain || S('<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/>');
  ICO.kid = ICO.kid || ICO.balloon || ICO.family;
  ICO.hand = S('<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.5-1.7L7 14"/>');
  ICO.pin2 = S('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>');
  ICO.route = ICO.route || S('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>');
  const KINDS = [
    { id: "galerie", label: "Galerie handlowe", one: "Galeria handlowa", sub: "Centra i domy handlowe", tint: "#1c2030", ico: "mall" },
    { id: "targi", label: "Targi i hale targowe", one: "Targ", sub: "Bazary, hale, targi", tint: "#26200f", ico: "stall" },
    { id: "regionalne", label: "Delikatesy i produkty regionalne", one: "Delikatesy", sub: "Miody, kawa, herbata, smaki regionu", tint: "#2a1f12", ico: "jar" },
    { id: "pamiatki", label: "Pamiątki, upominki i rękodzieło", one: "Upominki", sub: "Ceramika, sztuka, lokalni twórcy", tint: "#14261f", ico: "vase" },
    { id: "ksiegarnie", label: "Księgarnie i antykwariaty", one: "Księgarnia", sub: "Książki, stare wydania, płyty", tint: "#2a2016", ico: "book" },
    { id: "vintage", label: "Vintage i antyki", one: "Vintage", sub: "Second-hand, retro, staroci", tint: "#1f1f24", ico: "hanger" },
    { id: "slodkie", label: "Słodkie na wynos", one: "Słodkości", sub: "Czekolada, cukiernie, piekarnie, lody", tint: "#2a1620", ico: "cake" },
    { id: "trunki", label: "Wino i trunki", one: "Wino i trunki", sub: "Wino, piwo kraftowe, nalewki", tint: "#2a1216", ico: "wine" },
  ];
  const OCCS = [
    { id: "prezent", label: "Na prezent", sub: "Pomysł na upominek", tint: "#14261f", ico: "gift" },
    { id: "niedziela", label: "Otwarte w niedzielę", sub: "Zakupy także w weekend", tint: "#1c2030", ico: "sunday" },
    { id: "deszcz", label: "Na deszczowy dzień", sub: "Wszystko pod jednym dachem", tint: "#141a2e", ico: "rain" },
    { id: "dzieci", label: "Z dziećmi", sub: "Zabawki, słodycze, atrakcje", tint: "#0f2430", ico: "kid" },
    { id: "lokalne", label: "Lokalne i rzemieślnicze", sub: "Twórcy i smaki stąd", tint: "#2a1f12", ico: "hand" },
    { id: "centrum", label: "W centrum", sub: "Po drodze na spacerze", tint: "#2a2016", ico: "pin2" },
  ];
  const score = (p) => (p.rating || 0) * Math.log10(p.reviews + 10) + (p.occ.includes("lokalne") ? 2 : 0);
  const dayIdx = () => (new Date().getDay() + 6) % 7;
  const todayText = (p) => (p.hoursText || {})[DAYS[dayIdx()]];
  const kindOf = (id) => KINDS.find((k) => k.id === id) || KINDS[0];
  const near = (p, ND) => ND.places.filter((q) => q.id !== p.id && kmBetween([p.lat, p.lng], [q.lat, q.lng]) < 0.5)
    .map((q) => [q, kmBetween([p.lat, p.lng], [q.lat, q.lng])]).sort((a, b) => a[1] - b[1]).slice(0, 4);
  const mDist = (km) => (km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${String(km.toFixed(1)).replace(".", ",")} km`);
  return makeKat({
    p: "zk", name: "Zakupy", data: "data/zakupy.json", fav: "gz-fav-zk", cls: "cat-zk", ico: "bag", mk: "zkmk", cl: "zkcl", bn: "zakupy-", bnOcc: "zakupy-okazja-",
    noun: ["miejsce", "miejsca", "miejsc"], allLabel: "Wszystkie miejsca", emptyText: "Nie znalazłem miejsc dla tych filtrów.",
    searchPh: "Szukaj sklepu, targu, pamiątek…", filtersTitle: "Filtry zakupów", favTitle: "Ulubione miejsca na zakupy", favEmpty: "Nie masz jeszcze ulubionych miejsc.",
    kinds: KINDS, occs: OCCS, kindsTitle: "Co kupić",
    tile: ["kat-zakupy", "Zakupy", (n) => (n ? `${n} ${plural(n, "miejsce", "miejsca", "miejsc")} · targi, pamiątki, delikatesy` : "Targi, pamiątki, delikatesy"), "#14261f", "bag"],
    tabs2: [["", "home", "compass", "Odkrywaj"], ["/rodzaj", "rodzaj", "bag", "Rodzaj"], ["/mapa", "mapa", "map", "Mapa"], ["/filtry", "filtry", "sliders", "Filtry"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    big: [["rodzaj", "bag", "Rodzaj"], ["okazje", "calendar", "Okazja"], ["wyniki?occ=niedziela", "sunday", "W niedzielę"], ["wyniki?occ=prezent", "gift", "Na prezent"]],
    filters: [
      { k: "kind", title: "Rodzaj", opts: KINDS.map((k) => [k.id, k.label]), test: (p, v) => p.kind === v },
      { k: "occ", title: "Okazja", opts: OCCS.map((o) => [o.id, o.label]), test: (p, v) => p.occ.includes(v) },
      { k: "open", title: "Godziny", opts: [["1", "Otwarte teraz"]], test: (p) => openState(p) === true },
      { k: "rate", title: "Ocena", opts: [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]], test: (p, v) => (p.rating || 0) >= +v },
    ],
    sorts: [
      ["pol", "Polecane", (a, b) => score(b) - score(a)],
      ["ocena", "Najlepiej oceniane", (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews],
      ["rynek", "Najbliżej centrum", (a, b) => a.dRynek - b.dRynek],
    ],
    home: ({ ND, card, hrefR }) => {
      const top = ND.places.filter((p) => p.occ.includes("lokalne")).sort((a, b) => score(b) - score(a)).slice(0, 8);
      return `<section class="sec"><div class="sec-h"><h2>Lokalne perełki</h2><a href="${hrefR({ occ: "lokalne" })}">Zobacz wszystkie ›</a></div></section>
      <div class="cards">${top.map(card).join("")}</div>`;
    },
    extraBanners: () => ({ t: "", items: [] }),
    badge: (p) => { const os = openState(p); return os === null ? "" : `<span class="open-badge ${os ? "y" : "n"}">${os ? "Otwarte" : "Zamknięte"}</span>`; },
    subLine: (p) => [p.category || kindOf(p.kind).one],
    kindLine: (p) => p.category || kindOf(p.kind).one,
    acts: (p) => [["Strona", "globeL", p.www], ["Telefon", "phone", p.phone ? "tel:" + p.phone.replace(/\s/g, "") : null, false], ["Trasa", "navi", navUrl(p)]],
    sm: (p) => {
      const h = todayText(p), os = openState(p);
      return `<p>${esc(p.category || "")}${p.coKupic ? ` · ${esc(p.coKupic)}` : ""}.</p>
      ${h ? `<div class="sm-row"><i>${ico("clock")}</i>${/Zamknięte/.test(h) ? `<span class="cl">Dziś zamknięte</span>` : `<span class="${os ? "op" : ""}">${os ? "Otwarte dziś" : "Dziś"}:</span><span>${esc(h)}</span>`}</div>` : ""}`;
    },
    tabs: [["info", "Informacje"], ["godziny", "Godziny"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]],
    pane: (p) => {
      const ht = p.hoursText || {}, wd = dayIdx();
      if (!Object.keys(ht).length) return `<p class="note">${esc(p.hoursNote || "Google nie podaje godzin otwarcia – przed wizytą zadzwoń lub sprawdź stronę.")}</p>`;
      return `<table class="hours">${DAYS.map((d, i) => `<tr class="${i === wd ? "today" : ""}"><td>${d[0].toUpperCase() + d.slice(1)}</td><td>${esc(ht[d] || "brak danych")}</td></tr>`).join("")}</table>${p.hoursNote ? `<p class="note" style="margin-top:12px">${esc(p.hoursNote)}</p>` : ""}`;
    },
    infoRows: (p, { ND }) => {
      const nb = near(p, ND);
      return `<div class="row"><i>${ico(kindOf(p.kind).ico)}</i><div><b>Rodzaj:</b> ${esc((p.category || "").toLowerCase())}</div></div>
      ${p.coKupic ? `<div class="row"><i>${ico("bag")}</i><div><b>Co kupić:</b> ${esc(p.coKupic)}</div></div>` : ""}
      ${p.occ.includes("niedziela") ? `<div class="row"><i>${ico("sunday")}</i><div><b>Niedziela:</b> otwarte (${esc((p.hoursText || {}).niedziela || "")})</div></div>` : ""}
      ${p.dla ? `<div class="row"><i>${ico("family")}</i><div><b>Dobrze wiedzieć:</b> ${esc(p.dla)}</div></div>` : ""}
      ${nb.length ? `<div class="row"><i>${ico("route")}</i><div><b>W pobliżu:</b> ${nb.map(([q, km]) => `<a href="#/zk/obiekt/${encodeURIComponent(q.id)}">${esc(q.name)}</a> (${mDist(km)})`).join(", ")}</div></div>` : ""}`;
    },
  });
})();
