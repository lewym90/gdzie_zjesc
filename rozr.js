"use strict";
/* Kategoria Rozrywka: konfiguracja dla kat.js. Dane z data/rozrywka.json. */
const ROZR = (function () {
  ICO.mask = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 6c3 1.5 6 1.5 9 0 3 1.5 6 1.5 9 0v5c0 5-4 8.5-9 9-5-.5-9-4-9-9z"/><path d="M7 11c.8-.8 2.2-.8 3 0M14 11c.8-.8 2.2-.8 3 0M9 15.5c1.8 1.3 4.2 1.3 6 0"/></svg>';
  ICO.ticket = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>';
  ICO.umbrella = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/></svg>';
  ICO.dice = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg>';
  ICO.wave = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>';
  ICO.run = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v4M6 12l3-4 4 1 3 3 3 1M11 15l2-6"/></svg>';
  ICO.music = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>';
  ICO.balloon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3c3.6 0 6 2.8 6 6.2 0 3.7-3 6.8-6 6.8s-6-3.1-6-6.8C6 5.8 8.4 3 12 3z"/><path d="M11 16l1 1.5 1-1.5M12 17.5c0 2-2 2-2 4"/></svg>';
  const KINDS = [
    { id: "kino", label: "Kino i scena", one: "Kino i scena", sub: "Filmy, teatr, koncerty, kabaret", tint: "#2a1240", ico: "ticket" },
    { id: "ruch", label: "Ruch i sport", one: "Ruch i sport", sub: "Kręgle, trampoliny, wspinaczka", tint: "#1f1a46", ico: "run" },
    { id: "gry", label: "Gry i zagadki", one: "Gry i zagadki", sub: "Escape roomy, VR, planszówki", tint: "#2b1238", ico: "dice" },
    { id: "woda", label: "Woda i zabawa", one: "Woda i zabawa", sub: "Aquaparki i baseny", tint: "#10283a", ico: "wave" },
    { id: "dzieci", label: "Dla dzieci", one: "Dla dzieci", sub: "Sale zabaw i warsztaty", tint: "#3a2412", ico: "balloon" },
    { id: "wieczor", label: "Wieczorem", one: "Wieczorem", sub: "Muzyka na żywo, karaoke", tint: "#301036", ico: "music" },
  ];
  const OCCS = [
    { id: "dzieci", label: "Z dziećmi", sub: "Frajda dla najmłodszych", tint: "#3a2412", ico: "family" },
    { id: "randka", label: "Randka", sub: "Coś więcej niż kolacja", tint: "#4a0f1c", ico: "heartL" },
    { id: "znajomi", label: "Ze znajomymi", sub: "Rywalizacja i dobra zabawa", tint: "#1f1a46", ico: "glasses" },
    { id: "firma", label: "Integracja firmowa", sub: "Dla zespołów i grup", tint: "#14233b", ico: "case" },
    { id: "urodziny", label: "Urodziny", sub: "Przyjęcie z atrakcjami", tint: "#3d2a10", ico: "cake" },
    { id: "deszcz", label: "Na deszczowy dzień", sub: "Wszystko pod dachem", tint: "#1a2236", ico: "umbrella" },
  ];
  const score = (p) => (p.rating || 0) * Math.log10(p.reviews + 10);
  const dayIdx = () => (new Date().getDay() + 6) % 7;
  const todayText = (p) => (p.hoursText || {})[DAYS[dayIdx()]];
  return makeKat({
    p: "rz", name: "Rozrywka", data: "data/rozrywka.json", fav: "gz-fav-rz", cls: "cat-rz", ico: "mask", mk: "rzmk", cl: "rzcl", bn: "rozrywka-", bnOcc: "rozrywka-okazja-",
    noun: ["miejsce", "miejsca", "miejsc"], allLabel: "Wszystkie atrakcje", emptyText: "Nie znalazłem miejsc dla tych filtrów.",
    searchPh: "Szukaj kina, kręgielni, escape roomu…", filtersTitle: "Filtry rozrywki", favTitle: "Ulubiona rozrywka", favEmpty: "Nie masz jeszcze ulubionych miejsc.",
    kinds: KINDS, occs: OCCS, kindsTitle: "Rodzaj rozrywki",
    tile: ["kat-rozrywka", "Rozrywka", (n) => (n ? `${n} ${plural(n, "miejsce", "miejsca", "miejsc")} · kino, kręgle, escape roomy` : "Kino, kręgle, escape roomy"), "#2a1240", "mask"],
    tabs2: [["", "home", "mask", "Odkrywaj"], ["/rodzaj", "rodzaj", "dice", "Rodzaj"], ["/mapa", "mapa", "map", "Mapa"], ["/filtry", "filtry", "sliders", "Filtry"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    big: [["rodzaj", "dice", "Rodzaj"], ["okazje", "calendar", "Okazja"], ["wyniki?open=1", "clock", "Otwarte teraz"], ["wyniki?place=dach", "umbrella", "Pod dachem"]],
    filters: [
      { k: "kind", title: "Rodzaj", opts: KINDS.map((k) => [k.id, k.label]), test: (p, v) => p.kind === v },
      { k: "occ", title: "Okazja", opts: OCCS.map((o) => [o.id, o.label]), test: (p, v) => p.occ.includes(v) },
      { k: "open", title: "Godziny", opts: [["1", "Otwarte teraz"]], test: (p) => openState(p) === true },
      { k: "place", title: "Gdzie", opts: [["dach", "Pod dachem"], ["zewnatrz", "Na zewnątrz"]], test: (p, v) => (v === "dach" ? p.indoor === true : p.indoor === false) },
      { k: "rate", title: "Ocena", opts: [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]], test: (p, v) => (p.rating || 0) >= +v },
    ],
    sorts: [
      ["pol", "Polecane", (a, b) => score(b) - score(a)],
      ["ocena", "Najlepiej oceniane", (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews],
      ["rynek", "Najbliżej centrum", (a, b) => a.dRynek - b.dRynek],
    ],
    home: ({ ND, card, hrefR }) => {
      const top = ND.places.slice().sort((a, b) => score(b) - score(a)).slice(0, 8);
      return `<section class="sec"><div class="sec-h"><h2>Najpopularniejsze</h2><a href="${hrefR({})}">Zobacz wszystkie ›</a></div></section>
      <div class="cards">${top.map(card).join("")}</div>`;
    },
    extraBanners: () => ({ t: "", items: [] }),
    badge: (p) => { const os = openState(p); return os === null ? "" : `<span class="open-badge ${os ? "y" : "n"}">${os ? "Otwarte" : "Zamknięte"}</span>`; },
    subLine: (p) => [p.category || KINDS.find((k) => k.id === p.kind).one],
    kindLine: (p) => p.category || KINDS.find((k) => k.id === p.kind).one,
    acts: (p) => [["Strona", "globeL", p.www], [p.kind === "kino" ? "Repertuar" : "Cennik", p.kind === "kino" ? "ticket" : "tag", p.link || p.www], ["Telefon", "phone", p.phone ? "tel:" + p.phone.replace(/\s/g, "") : null, false], ["Trasa", "navi", navUrl(p)]],
    sm: (p) => {
      const oc = p.occ.map((o) => ({ dzieci: "wyjście z dziećmi", randka: "randkę", znajomi: "wyjście ze znajomymi", firma: "integrację firmową", urodziny: "urodziny", deszcz: "deszczowy dzień" }[o]));
      const inout = p.kind === "wieczor" || p.kind === "kino" ? "" : p.indoor === true ? ", pod dachem" : p.indoor === false ? ", na zewnątrz" : "";
      const lead = `${p.category || ""}${inout}.` + (oc.length ? ` Dobre na ${oc.length > 1 ? oc.slice(0, -1).join(", ") + " i " + oc[oc.length - 1] : oc[0]}.` : "");
      const h = todayText(p), os = openState(p);
      return `<p>${esc(lead)}</p>
      ${h ? `<div class="sm-row"><i>${ico("clock")}</i>${/Zamknięte/.test(h) ? `<span class="cl">Dziś zamknięte</span>` : `<span class="${os ? "op" : ""}">${os ? "Otwarte dziś" : "Dziś"}:</span><span>${esc(h)}</span>`}</div>` : ""}
      ${p.priceText ? `<div class="sm-row"><i>${ico("coins")}</i><span>${esc(p.priceText)}</span></div>` : ""}`;
    },
    tabs: [["info", "Informacje"], ["godziny", "Godziny"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]],
    pane: (p) => {
      const ht = p.hoursText || {}, wd = dayIdx(), nt = p.hoursNote ? `<p class="note" style="margin-top:12px">${esc(p.hoursNote)}</p>` : "";
      if (!Object.keys(ht).length && nt) return nt.replace(' style="margin-top:12px"', "");
      if (!Object.keys(ht).length) return p.kind === "kino" ? `<p class="note">Godziny zależą od seansów, spektakli i koncertów. Sprawdź ${p.www ? `<a href="${esc(p.link || p.www)}" target="_blank" rel="noopener">repertuar na stronie</a>` : "repertuar"}.</p>` : `<p class="note">Google nie podaje godzin otwarcia tego miejsca. Sprawdź je na stronie lub zadzwoń.</p>`;
      return `<table class="hours">${DAYS.map((d, i) => `<tr class="${i === wd ? "today" : ""}"><td>${d[0].toUpperCase() + d.slice(1)}</td><td>${esc(ht[d] || "brak danych")}</td></tr>`).join("")}</table>${p.kind === "kino" ? `<p class="note" style="margin-top:12px">Godziny kasy lub obiektu. Seanse i spektakle sprawdzisz w repertuarze.</p>` : ""}${nt}`;
    },
    infoRows: (p) => {
      const rest = p.rest && typeof BYID !== "undefined" && BYID[p.rest];
      return `<div class="row"><i>${ico(KINDS.find((k) => k.id === p.kind).ico)}</i><div><b>Rodzaj:</b> ${esc((p.category || "").toLowerCase())}</div></div>
      ${p.age ? `<div class="row"><i>${ico("family")}</i><div><b>Wiek:</b> ${esc(p.age)}</div></div>` : ""}
      ${p.priceText ? `<div class="row"><i>${ico("coins")}</i><div><b>Ceny:</b> ${esc(p.priceText)}</div></div>` : ""}
      ${(p.attrs || []).length ? `<div class="row"><i>${ico("sparkle")}</i><div><b>Warto wiedzieć:</b> ${esc(p.attrs.join(", "))}</div></div>` : ""}
      ${rest ? `<a class="row lnk" href="#/lokal/${encodeURIComponent(rest.id)}"><i>${ico("cloche")}</i><div>${p.fromRest ? "<b>Także w Restauracjach:</b> menu, klimat i okazje" : `<b>Jedzenie na miejscu:</b> ${esc(rest.name)}`} ›</div></a>` : ""}`;
    },
  });
})();
