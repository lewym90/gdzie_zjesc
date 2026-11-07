"use strict";
/* Kategoria Noclegi: konfiguracja dla kat.js. Tylko wyświetla dane z data/noclegi.json, bez rezerwacji i dostępności. */
const NOCL = (function () {
  const KINDS = [
    { id: "hotel", label: "Hotele", one: "Hotel", sub: "Recepcja, obsługa i śniadanie", tint: "#14233b", ico: "building" },
    { id: "apartament", label: "Apartamenty", one: "Apartament", sub: "Własna kuchnia i pełna swoboda", tint: "#1d2730", ico: "sofa" },
    { id: "pensjonat", label: "Pensjonaty i pokoje", one: "Pensjonat", sub: "Kameralnie i po domowemu", tint: "#2a2216", ico: "lamp" },
    { id: "hostel", label: "Hostele", one: "Hostel", sub: "Tanio i wygodnie, także dla grup", tint: "#16262a", ico: "bed" },
  ];
  const OCCS = [
    { id: "romantyczny", label: "Romantyczny weekend", sub: "Klimat i wygoda we dwoje", tint: "#4a0f1c", ico: "rose" },
    { id: "biznes", label: "Podróż służbowa", sub: "Biurko, Wi-Fi i dobre położenie", tint: "#14233b", ico: "case" },
    { id: "rodzina", label: "Z dziećmi", sub: "Miejsce dla całej rodziny", tint: "#2e2a18", ico: "family" },
    { id: "spa", label: "Relaks i spa", sub: "Basen, sauna i odpoczynek", tint: "#0f2b2e", ico: "sparkle" },
  ];
  const PRICES = [
    { id: "200", label: "Do 200 zł", sub: "Budżetowo, bez zbędnych dodatków", max: 200, tint: "#1d2730" },
    { id: "300", label: "Do 300 zł", sub: "Rozsądna cena, dobry standard", max: 300, tint: "#14233b" },
    { id: "450", label: "Do 450 zł", sub: "Komfort i wygoda", max: 450, tint: "#2a2216" },
    { id: "450+", label: "Ponad 450 zł", sub: "Najwyższy standard", min: 451, tint: "#2e2710" },
  ];
  const AMEN = [
    { id: "parking", label: "Parking", ico: "car" },
    { id: "sniadanie", label: "Śniadanie w cenie", ico: "coffee" },
    { id: "spa", label: "Spa lub basen", ico: "sparkle" },
    { id: "restauracja", label: "Restauracja na miejscu", ico: "cloche" },
    { id: "zwierzeta", label: "Zwierzęta mile widziane", ico: "paw" },
    { id: "klima", label: "Klimatyzacja", ico: "snow" },
    { id: "fitness", label: "Siłownia", ico: "dumbbell" },
    { id: "wifi", label: "Bezpłatne Wi-Fi", ico: "wifi" },
  ];
  const stars = (n) => (n ? "★".repeat(n) : "");
  const kindOne = (id) => (KINDS.find((k) => k.id === id) || KINDS[0]).one;
  const score = (p) => (p.rating || 0) * Math.log10(p.reviews + 10);
  return makeKat({
    p: "n", name: "Noclegi", data: "data/noclegi.json", fav: "gz-fav-n", cls: "cat-n", ico: "bed", mk: "nmk", cl: "ncl", bn: "nocleg-",
    noun: ["obiekt", "obiekty", "obiektów"], allLabel: "Wszystkie noclegi", emptyText: "Nie znalazłem noclegów dla tych filtrów.",
    searchPh: "Szukaj hotelu, apartamentu, okolicy…", filtersTitle: "Filtry noclegów", favTitle: "Ulubione noclegi", favEmpty: "Nie masz jeszcze ulubionych noclegów.",
    kinds: KINDS, occs: OCCS, kindsTitle: "Rodzaj noclegu",
    tile: ["kat-noclegi", "Noclegi", (n) => (n ? `${n} ${plural(n, "obiekt", "obiekty", "obiektów")} · hotele, apartamenty, pensjonaty` : "Hotele, apartamenty, pensjonaty"), "#14233b", "bed"],
    tabs2: [["", "home", "bed", "Odkrywaj"], ["/rodzaj", "rodzaj", "building", "Rodzaj"], ["/mapa", "mapa", "map", "Mapa"], ["/filtry", "filtry", "sliders", "Filtry"], ["/ulubione", "ulubione", "heart", "Ulubione"]],
    big: [["rodzaj", "building", "Rodzaj"], ["cena", "tag", "Cena"], ["okazje", "calendar", "Okazja"], ["udogodnienia", "key", "Udogodnienia"]],
    filters: [
      { k: "price", title: "Cena za noc dla 2 osób", opts: PRICES.map((o) => [o.id, o.label]), test: (p, v) => { const pr = PRICES.find((x) => x.id === v); return p.price && !(pr.max && p.price > pr.max) && !(pr.min && p.price < pr.min); } },
      { k: "kind", title: "Rodzaj", opts: KINDS.map((k) => [k.id, k.one, k.label]), chip: 2, test: (p, v) => p.kind === v },
      { k: "stars", title: "Gwiazdki (hotele)", opts: [["3", "3 gwiazdki i więcej"], ["4", "4 gwiazdki i więcej"], ["5", "5 gwiazdek"]], test: (p, v) => (p.stars || 0) >= +v },
      { k: "rate", title: "Ocena gości", opts: [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]], test: (p, v) => (p.rating || 0) >= +v },
      { k: "occ", title: "Okazja", opts: OCCS.map((o) => [o.id, o.label]), test: (p, v) => p.occ.includes(v) },
      { k: "area", title: "Położenie", opts: [["stare", "Stare Miasto"], ["centrum", "Centrum"], ["dworzec", "Blisko dworca"]], test: (p, v) => p.area.includes(v) },
      { k: "amen", title: "Udogodnienia", multi: true, opts: AMEN.map((a) => [a.id, a.label]), test: (p, v) => p.amen.includes(v) },
    ],
    sorts: [
      ["pol", "Polecane", (a, b) => score(b) - score(a)],
      ["cena", "Najtańsze", (a, b) => (a.price || 1e9) - (b.price || 1e9) || score(b) - score(a)],
      ["ocena", "Najlepiej oceniane", (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews],
      ["rynek", "Najbliżej Rynku", (a, b) => a.dRynek - b.dRynek],
    ],
    home: ({ ND, card, hrefR }) => {
      const top = ND.places.filter((p) => p.reviews >= 150 && p.rating >= 4.6).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 8);
      return `<section class="sec"><div class="sec-h"><h2>Najlepiej oceniane</h2><a href="${hrefR({ rate: "4.5" })}">Zobacz wszystkie ›</a></div></section>
      <div class="cards">${top.map(card).join("")}</div>
      <p class="note nnote">Ceny są orientacyjne: jedna noc dla 2 osób (pokój lub apartament), ${esc(ND.meta.priceDate || "")}. Aktualną cenę sprawdzisz na stronie obiektu.</p>`;
    },
    extraBanners: (kind, { list, hrefR, N }) => {
      const cnt = (f) => N(list(f, "").length);
      if (kind === "cena") return { t: "Cena za noc dla 2 osób", items: PRICES.map((o) => banner("nocleg-cena", o.label, `${o.sub} · ${cnt({ price: o.id })}`, hrefR({ price: o.id }), o.tint, "coins")) };
      return { t: "Udogodnienia", items: AMEN.map((a) => banner("-", a.label, cnt({ amen: [a.id] }), hrefR({ amen: [a.id] }), "#14233b", a.ico)) };
    },
    badge: (p) => (p.price ? `<span class="open-badge price-badge">ok. ${zl(p.price)} / 2 os.</span>` : ""),
    subLine: (p) => [kindOne(p.kind) + (p.stars ? " " + stars(p.stars) : "")],
    popLine: (p) => [kindOne(p.kind) + (p.stars ? " " + stars(p.stars) : ""), p.price ? `ok. ${zl(p.price)} za 2 os.` : ""].filter(Boolean),
    titleRight: (p) => (p.stars ? `<span class="price nstars">${stars(p.stars)}</span>` : ""),
    acts: (p) => [["Strona", "globeL", p.www], ["Ceny", "tag", p.www || p.gmaps], ["Telefon", "phone", p.phone ? "tel:" + p.phone.replace(/\s/g, "") : null, false], ["Trasa", "navi", navUrl(p)]],
    sm: (p, { ND }) => {
      const oc = p.occ.map((o) => ({ romantyczny: "romantyczny weekend", biznes: "podróż służbową", rodzina: "pobyt z dziećmi", spa: "relaks i spa" }[o]));
      const lead = `${kindOne(p.kind)}${p.stars ? ` ${p.stars}-gwiazdkowy` : ""}${p.areaName ? ", " + p.areaName : ""}.` + (oc.length ? ` Dobry wybór na ${oc.length > 1 ? oc.slice(0, -1).join(", ") + " i " + oc[oc.length - 1] : oc[0]}.` : "");
      return `${p.stars || p.areaName || p.occ.length ? `<p>${esc(lead)}</p>` : ""}
      ${p.price ? `<div class="sm-row"><i>${ico("coins")}</i><span>Ok. ${zl(p.price)} za noc dla 2 osób (ok. ${zl(Math.round(p.price / 20) * 10)} za osobę)${p.priceSrc === "strona" ? ", według cennika na stronie obiektu" : p.priceSrc && p.priceSrc.startsWith("termin:") ? `, termin ${esc(p.priceSrc.slice(7))}` : ND.meta.priceDate ? `, ${esc(ND.meta.priceDate)}` : ""}</span></div>` : `<div class="sm-row"><i>${ico("coins")}</i><span>${p.www ? "Cena nieznana, sprawdź na stronie obiektu" : "Cena nieznana, zapytaj w obiekcie"}</span></div>`}
      ${p.checkin || p.checkout ? `<div class="sm-row"><i>${ico("clock")}</i><span>${[p.checkin ? "Zameldowanie od " + p.checkin : "", p.checkout ? "wymeldowanie do " + p.checkout : ""].filter(Boolean).join(", ")}</span></div>` : ""}`;
    },
    tabs: [["info", "Informacje"], ["udog", "Udogodnienia"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]],
    pane: (p) => {
      const yes = AMEN.filter((a) => p.amen.includes(a.id));
      const extra = (p.amenAll || []).filter((x) => !yes.some((a) => a.label === x));
      if (!yes.length && !extra.length) return `<p class="note">Google nie podaje udogodnień tego obiektu. Sprawdź je na stronie obiektu.</p>`;
      return `<div class="amen">${yes.map((a) => `<div class="am"><i>${ico(a.ico)}</i><span>${esc(a.label)}</span></div>`).join("")}${extra.map((x) => `<div class="am"><i>${ico("sparkle")}</i><span>${esc(x)}</span></div>`).join("")}</div><p class="note" style="margin-top:14px">Według informacji w Mapach Google. Szczegóły potwierdź w obiekcie.</p>`;
    },
    infoRows: (p) => {
      const rest = p.rest && typeof BYID !== "undefined" && BYID[p.rest];
      return `<div class="row"><i>${ico("bed")}</i><div><b>Rodzaj:</b> ${esc(kindOne(p.kind).toLowerCase())}${p.stars ? `, ${p.stars} ${plural(p.stars, "gwiazdka", "gwiazdki", "gwiazdek")}` : ""}</div></div>
      ${p.amen.length ? `<div class="row"><i>${ico("key")}</i><div><b>Udogodnienia:</b> ${esc(AMEN.filter((a) => p.amen.includes(a.id)).map((a) => a.label[0].toLowerCase() + a.label.slice(1)).join(", "))}</div></div>` : ""}
      ${rest ? `<a class="row lnk" href="#/lokal/${encodeURIComponent(rest.id)}"><i>${ico("cloche")}</i><div><b>Restauracja:</b> ${esc(rest.name)} ›</div></a>` : ""}`;
    },
  });
})();
