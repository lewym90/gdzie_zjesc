"use strict";
/* Kategoria Relaks: konfiguracja dla kat.js. Dane z data/relaks.json. */
const RELAKS = (function () {
  ICO.lotus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M12 5.5c1.9 1.9 2.8 4.1 2.8 6.4S13.9 16.3 12 18c-1.9-1.7-2.8-3.8-2.8-6.1S10.1 7.4 12 5.5z"/><path d="M9.4 9.6C7.6 8.7 5.6 8.5 3.5 9c.3 3.5 2 6.2 4.8 7.6 1.1.6 2.4.9 3.7 1.1M14.6 9.6c1.8-.9 3.8-1.1 5.9-.6-.3 3.5-2 6.2-4.8 7.6-1.1.6-2.4.9-3.7 1.1"/></svg>';
  ICO.hands = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15c2.5-1 4.5-1 6.5 0l3.5 1.6c.9.4.8 1.7-.2 1.9l-3.3.5"/><path d="M3 20.5h8.5l6.8-3.3c1-.5.9-2-.2-2.2l-3.6-.6"/><circle cx="16.5" cy="6.5" r="2.5"/><path d="M13 12c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4"/></svg>';
  ICO.steam = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3c-1 1.3-1 2.7 0 4s1 2.7 0 4M12 3c-1 1.3-1 2.7 0 4s1 2.7 0 4M16 3c-1 1.3-1 2.7 0 4s1 2.7 0 4"/><path d="M3 15h18v2.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>';
  ICO.stones = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><ellipse cx="12" cy="18.2" rx="8.5" ry="2.6"/><ellipse cx="12" cy="12.8" rx="6.2" ry="2.3"/><ellipse cx="12" cy="8" rx="4" ry="1.9"/></svg>';
  ICO.salt = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 20c1-7 4.5-12 9-15 4.5 3 8 8 9 15z"/><path d="M9 20c.4-3 1.4-5 3-6.5 1.6 1.5 2.6 3.5 3 6.5"/></svg>';
  ICO.gift = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19v-3h-19zM12 6v14.5"/><path d="M12 6c-1.2-2.8-4.8-3.3-5.2-1.2C6.4 6.6 10 6 12 6zm0 0c1.2-2.8 4.8-3.3 5.2-1.2.4 1.8-3.2 1.2-5.2 1.2z"/></svg>';
  ICO.cup = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M8 3.5c-.7.8-.7 1.7 0 2.5M12 3.5c-.7.8-.7 1.7 0 2.5"/></svg>';
  ICO.bed = ICO.bed || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 18V7M3 13h18v5M21 18v-3.5A3.5 3.5 0 0 0 17.5 11H11v2"/><circle cx="7" cy="10.5" r="1.8"/></svg>';
  const KINDS = [
    { id: "spa", label: "Spa i wellness", one: "Spa i wellness", sub: "Hotelowe spa, jacuzzi, strefy saun", tint: "#0f2b2a", ico: "lotus" },
    { id: "masaz", label: "Masaż", one: "Masaż", sub: "Relaksacyjny, tajski, dla dwojga", tint: "#2a1622", ico: "hands" },
    { id: "zabiegi", label: "Day spa i zabiegi", one: "Day spa i zabiegi", sub: "Rytuały, kamienie, pielęgnacja", tint: "#1d2618", ico: "stones" },
    { id: "sauna", label: "Sauny i łaźnie", one: "Sauny i łaźnie", sub: "Fińska, parowa, seanse saunowe", tint: "#33200f", ico: "steam" },
    { id: "baseny", label: "Baseny i termy", one: "Baseny i termy", sub: "Woda, pływanie, strefy saun", tint: "#0e2a33", ico: "wave" },
    { id: "grota", label: "Groty i tężnie", one: "Groty i tężnie", sub: "Sól, mikroklimat, wyciszenie", tint: "#3a2214", ico: "salt" },
    { id: "joga", label: "Joga i medytacja", one: "Joga i medytacja", sub: "Zajęcia, oddech, spokój", tint: "#20261a", ico: "lotus" },
  ];
  const OCCS = [
    { id: "dwoje", label: "Dla dwojga", sub: "Romantyczny relaks we dwoje", tint: "#3a0f18", ico: "heartL" },
    { id: "solo", label: "Chwila dla siebie", sub: "Odpoczynek w ciszy", tint: "#1d2618", ico: "cup" },
    { id: "znajomi", label: "Z przyjaciółmi", sub: "Wspólny relaks w grupie", tint: "#0f2b2a", ico: "glasses" },
    { id: "prezent", label: "Na prezent", sub: "Vouchery i bony podarunkowe", tint: "#33260f", ico: "gift" },
  ];
  const MA = { sauna: "sauna", jacuzzi: "jacuzzi", basen: "basen", masaz: "masaże", grota: "grota solna", tezn: "tężnia", laznia: "łaźnia parowa", zabiegi: "zabiegi na ciało i twarz", kriokomora: "kriokomora", voucher: "vouchery" };
  const score = (p) => (p.rating || 0) * Math.log10(p.reviews + 10);
  const dayIdx = () => (new Date().getDay() + 6) % 7;
  const todayText = (p) => (p.hoursText || {})[DAYS[dayIdx()]];
  const kindOf = (id) => KINDS.find((k) => k.id === id) || KINDS[0];
  return makeKat({
    p: "rl", name: "Relaks", data: "data/relaks.json", fav: "gz-fav-rl", cls: "cat-rl", ico: "lotus", mk: "rlmk", cl: "rlcl", bn: "relaks-", bnOcc: "relaks-okazja-",
    noun: ["miejsce", "miejsca", "miejsc"], allLabel: "Wszystkie miejsca", emptyText: "Nie znalazłem miejsc dla tych filtrów.",
    searchPh: "Szukaj spa, masażu, sauny…", filtersTitle: "Filtry relaksu", favTitle: "Ulubiony relaks", favEmpty: "Nie masz jeszcze ulubionych miejsc.",
    kinds: KINDS, occs: OCCS, kindsTitle: "Rodzaj relaksu",
    tile: ["kat-relaks", "Relaks", (n) => (n ? `${n} ${plural(n, "miejsce", "miejsca", "miejsc")} · spa, masaże, sauny` : "Spa, masaże, sauny"), "#0f2b2a", "lotus"],
    tabs2: [["", "home", "lotus", "Odkrywaj"], ["/rodzaj", "rodzaj", "stones", "Rodzaj"], ["/mapa", "mapa", "map", "Mapa"], ["/filtry", "filtry", "sliders", "Filtry"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    big: [["rodzaj", "stones", "Rodzaj"], ["okazje", "calendar", "Okazja"], ["wyniki?open=1", "clock", "Otwarte teraz"], ["wyniki?occ=prezent", "gift", "Na prezent"]],
    filters: [
      { k: "kind", title: "Rodzaj", opts: KINDS.map((k) => [k.id, k.label]), test: (p, v) => p.kind === v },
      { k: "occ", title: "Okazja", opts: OCCS.map((o) => [o.id, o.label]), test: (p, v) => p.occ.includes(v) },
      { k: "ma", title: "Na miejscu", multi: true, opts: [["sauna", "Sauna"], ["jacuzzi", "Jacuzzi"], ["basen", "Basen"], ["masaz", "Masaże"], ["grota", "Grota solna"]], test: (p, v) => (p.ma || []).includes(v) },
      { k: "open", title: "Godziny", opts: [["1", "Otwarte teraz"]], test: (p) => openState(p) === true },
      { k: "rate", title: "Ocena", opts: [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]], test: (p, v) => (p.rating || 0) >= +v },
    ],
    sorts: [
      ["pol", "Polecane", (a, b) => score(b) - score(a)],
      ["ocena", "Najlepiej oceniane", (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews],
      ["rynek", "Najbliżej centrum", (a, b) => a.dRynek - b.dRynek],
    ],
    home: ({ ND, card, hrefR }) => {
      const top = ND.places.slice().sort((a, b) => score(b) - score(a)).slice(0, 8);
      return `<section class="sec"><div class="sec-h"><h2>Najchętniej odwiedzane</h2><a href="${hrefR({})}">Zobacz wszystkie ›</a></div></section>
      <div class="cards">${top.map(card).join("")}</div>`;
    },
    extraBanners: () => ({ t: "", items: [] }),
    badge: (p) => { const os = openState(p); return os === null ? "" : `<span class="open-badge ${os ? "y" : "n"}">${os ? "Otwarte" : "Zamknięte"}</span>`; },
    subLine: (p) => [p.category || kindOf(p.kind).one],
    kindLine: (p) => p.category || kindOf(p.kind).one,
    acts: (p) => [["Strona", "globeL", p.www], ["Cennik", "tag", p.link || p.www], ["Telefon", "phone", p.phone ? "tel:" + p.phone.replace(/\s/g, "") : null, false], ["Trasa", "navi", navUrl(p)]],
    sm: (p) => {
      const oc = p.occ.map((o) => ({ dwoje: "relaks we dwoje", solo: "chwilę dla siebie", znajomi: "wyjście z przyjaciółmi", prezent: "prezent" }[o]));
      const lead = `${p.category || ""}.` + (oc.length ? ` Dobre na ${oc.length > 1 ? oc.slice(0, -1).join(", ") + " i " + oc[oc.length - 1] : oc[0]}.` : "");
      const h = todayText(p), os = openState(p);
      return `<p>${esc(lead)}</p>
      ${h ? `<div class="sm-row"><i>${ico("clock")}</i>${/Zamknięte/.test(h) ? `<span class="cl">Dziś zamknięte</span>` : `<span class="${os ? "op" : ""}">${os ? "Otwarte dziś" : "Dziś"}:</span><span>${esc(h)}</span>`}</div>` : ""}
      ${p.priceText ? `<div class="sm-row"><i>${ico("coins")}</i><span>${esc(p.priceText)}</span></div>` : ""}`;
    },
    tabs: [["info", "Informacje"], ["godziny", "Godziny"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]],
    pane: (p) => {
      const ht = p.hoursText || {}, wd = dayIdx();
      if (!Object.keys(ht).length) return `<p class="note">${esc(p.hoursNote || "Google nie podaje godzin otwarcia tego miejsca. Przyjmuje zwykle po umówieniu wizyty – sprawdź na stronie lub zadzwoń.")}</p>`;
      return `<table class="hours">${DAYS.map((d, i) => `<tr class="${i === wd ? "today" : ""}"><td>${d[0].toUpperCase() + d.slice(1)}</td><td>${esc(ht[d] || "brak danych")}</td></tr>`).join("")}</table>${p.hoursNote ? `<p class="note" style="margin-top:12px">${esc(p.hoursNote)}</p>` : ""}`;
    },
    infoRows: (p) => {
      const rest = p.rest && typeof BYID !== "undefined" && BYID[p.rest];
      const ma = (p.ma || []).map((x) => MA[x]).filter(Boolean);
      return `<div class="row"><i>${ico(kindOf(p.kind).ico)}</i><div><b>Rodzaj:</b> ${esc((p.category || "").toLowerCase())}</div></div>
      ${ma.length ? `<div class="row"><i>${ico("sparkle")}</i><div><b>Na miejscu:</b> ${esc(ma.join(", "))}</div></div>` : ""}
      ${p.priceText ? `<div class="row"><i>${ico("coins")}</i><div><b>Ceny:</b> ${esc(p.priceText)}</div></div>` : ""}
      ${p.dla ? `<div class="row"><i>${ico("family")}</i><div><b>Dla kogo:</b> ${esc(p.dla)}</div></div>` : ""}
      ${p.nocl ? `<a class="row lnk" href="#/n/obiekt/${encodeURIComponent(p.nocl)}"><i>${ico("bed")}</i><div><b>Także w Noclegach:</b> pokoje i ceny za noc ›</div></a>` : ""}
      ${rest ? `<a class="row lnk" href="#/lokal/${encodeURIComponent(rest.id)}"><i>${ico("cloche")}</i><div><b>Jedzenie na miejscu:</b> ${esc(rest.name)} ›</div></a>` : ""}`;
    },
  });
})();
