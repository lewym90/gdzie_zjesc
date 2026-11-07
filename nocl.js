"use strict";
/* Na mieście: kategoria Noclegi. Tylko wyświetla dane z data/noclegi.json, bez rezerwacji i dostępności. */
const NOCL = (function () {
  const KINDS = [
    { id: "hotel", label: "Hotele", one: "Hotel", sub: "Recepcja, obsługa i śniadanie", tint: "#14233b", ico: "building" },
    { id: "apartament", label: "Apartamenty", one: "Apartament", sub: "Własna kuchnia i pełna swoboda", tint: "#1d2730", ico: "sofa" },
    { id: "pensjonat", label: "Pensjonaty i pokoje", one: "Pensjonat", sub: "Kameralnie i po domowemu", tint: "#2a2216", ico: "lamp" },
    { id: "hostel", label: "Hostele", one: "Hostel", sub: "Tanio i wygodnie w centrum", tint: "#16262a", ico: "bed" },
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
  const AREAS = [["stare", "Stare Miasto"], ["centrum", "Centrum"], ["dworzec", "Blisko dworca"]];
  const STARS = [["3", "3 gwiazdki i więcej"], ["4", "4 gwiazdki i więcej"], ["5", "5 gwiazdek"]];
  const RATES = [["4.5", "Ocena 4,5 i więcej"], ["4", "Ocena 4,0 i więcej"]];
  const AICO = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 16v2.5M20 16v2.5M4 12h16"/><circle cx="7.5" cy="14" r=".8"/><circle cx="16.5" cy="14" r=".8"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="7" cy="9" rx="1.8" ry="2.4"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.4"/><ellipse cx="17" cy="9" rx="1.8" ry="2.4"/><path d="M12 12c-3 0-5.5 3.2-5.5 5.4 0 1.6 1.3 2.1 2.8 1.6 1.2-.4 2-.6 2.7-.6s1.5.2 2.7.6c1.5.5 2.8 0 2.8-1.6 0-2.2-2.5-5.4-5.5-5.4z"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 9.5a13 13 0 0 1 18 0M6 12.8a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r=".9" fill="currentColor"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.5"/></svg>',
  };
  Object.assign(ICO, AICO);

  let ND = null, NBY = {}, LOADING = null;
  const NS = { f: {}, q: "" };
  const FK = "gz-fav-n";
  let NFAV = new Set();
  try { NFAV = new Set(JSON.parse(localStorage.getItem(FK) || "[]")); } catch (e) {}

  function load() {
    if (ND) return Promise.resolve(ND);
    if (!LOADING) LOADING = fetch("data/noclegi.json", { cache: "no-store" }).then((r) => r.json())
      .catch(() => caches.match("data/noclegi.json").then((c) => (c ? c.json() : null)))
      .then((d) => { ND = d || { meta: {}, places: [] }; NBY = {}; ND.places.forEach((p) => (NBY[p.id] = p)); return ND; })
      .catch(() => { ND = { meta: {}, places: [] }; return ND; });
    return LOADING;
  }
  load().then(() => { if (location.hash === "" || location.hash === "#/" || location.hash.startsWith("#/n")) route(); });

  const kindOf = (id) => KINDS.find((k) => k.id === id) || KINDS[0];
  const zl = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
  const stars = (n) => (n ? "★".repeat(n) : "");
  const dist = (m) => (m < 1000 ? `${Math.max(100, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
  const hrefR = (o) => "#/n/wyniki?" + new URLSearchParams(Object.entries(o).filter(([, v]) => v && (!Array.isArray(v) || v.length)).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])).toString();

  function match(p, f, q) {
    if (f.kind && p.kind !== f.kind) return false;
    if (f.occ && !p.occ.includes(f.occ)) return false;
    if (f.price) { const pr = PRICES.find((x) => x.id === f.price); if (!p.price || (pr.max && p.price > pr.max) || (pr.min && p.price < pr.min)) return false; }
    if (f.stars && !((p.stars || 0) >= +f.stars)) return false;
    if (f.rate && !((p.rating || 0) >= +f.rate)) return false;
    if (f.area && !p.area.includes(f.area)) return false;
    if (f.amen && f.amen.length && !f.amen.every((a) => p.amen.includes(a))) return false;
    if (q) {
      const hay = p._hay || (p._hay = norm([p.name, p.address, kindOf(p.kind).one, p.areaName].join(" ")));
      if (!norm(q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }
  const list = (f = NS.f, q = NS.q) => ND.places.filter((p) => match(p, f, q));
  function fromParams(pp) {
    return { kind: pp.get("kind"), occ: pp.get("occ"), price: pp.get("price"), stars: pp.get("stars"), rate: pp.get("rate"), area: pp.get("area"), amen: (pp.get("amen") || "").split(",").filter(Boolean) };
  }
  function chips(f, q) {
    const o = [];
    if (f.kind) o.push(["kind", kindOf(f.kind).label]);
    if (f.price) o.push(["price", PRICES.find((x) => x.id === f.price).label]);
    if (f.occ) o.push(["occ", OCCS.find((x) => x.id === f.occ).label]);
    if (f.stars) o.push(["stars", STARS.find((x) => x[0] === f.stars)[1]]);
    if (f.rate) o.push(["rate", RATES.find((x) => x[0] === f.rate)[1]]);
    if (f.area) o.push(["area", AREAS.find((x) => x[0] === f.area)[1]]);
    (f.amen || []).forEach((a) => o.push(["amen:" + a, AMEN.find((x) => x.id === a).label]));
    if (q) o.push(["q", `„${q}”`]);
    return o;
  }
  const subLine = (p) => [kindOf(p.kind).one + (p.stars ? " " + stars(p.stars) : ""), p.price ? `ok. ${zl(p.price)}/noc` : ""].filter(Boolean);
  const where = (p) => (p.dRynek != null ? `${p.areaName ? p.areaName + " · " : ""}${dist(p.dRynek)} od Rynku` : cityAddr(p.address));

  function card(p) {
    const ph = p.photos.slice(0, 5), n = 0;
    return `<article class="pc npc" data-nid="${p.id}" style="--i:${Math.min(n, 6)}">
    <div class="pc-ph"><div class="strip">${ph.map((u, i) => `<img src="${img(u, 900, 620)}" alt="" loading="lazy" referrerpolicy="no-referrer" decoding="async" class="fi"${i ? "" : ` style="background-image:url('${img(u, 36, 24)}')"`}>`).join("")}</div>
    ${p.price ? `<span class="open-badge price-badge">ok. ${zl(p.price)}</span>` : ""}
    <button class="fav ${NFAV.has(p.id) ? "on" : ""}" data-nfav="${p.id}" aria-label="Ulubione"><i>${ico("heart")}</i></button>
    ${ph.length > 1 ? `<div class="pc-dots">${ph.map((_, i) => `<b class="${i ? "" : "on"}"></b>`).join("")}</div>` : ""}
    <div class="pc-body">
      <div class="pc-name">${esc(p.name)}</div>
      <div class="meta">${p.rating ? `<span class="st"><i>${ico("star")}</i>${fmtR(p.rating)}</span><span>(${p.reviews})</span>` : ""}${subLine(p).map((t) => `<span class="sep">·</span><span>${esc(t)}</span>`).join("")}</div>
      <div class="addr"><i>${ico("pin")}</i><span>${esc(where(p))}</span></div>
    </div></article>`;
  }
  const bar = (title, right = '<span class="ib"></span>') => `<div class="bar"><a class="ib" href="#/n" data-back><i>${ico("back")}</i></a><h2 class="ttl">${esc(title)}</h2>${right}</div>`;

  function viewHome() {
    const big = [["#/n/rodzaj", "building", "Rodzaj"], ["#/n/cena", "tag", "Cena"], ["#/n/okazje", "calendar", "Okazja"], ["#/n/udogodnienia", "key", "Udogodnienia"]];
    const top = ND.places.filter((p) => p.reviews >= 150 && p.rating >= 4.6).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 8);
    return `<header class="hdr"><div class="hdr-row"><a class="brand home" href="#/" aria-label="Wszystkie kategorie"><b class="bk">${ico("back")}</b><img src="img/logo.png" alt=""><h1>Noclegi</h1></a>
      <span class="city"><i>${ico("pin")}</i>${esc(ND.meta.city || "Lublin")}</span></div>
      <form class="search" id="nform"><i>${ico("search")}</i><input id="nq" type="search" enterkeyhint="search" placeholder="Szukaj hotelu, apartamentu, okolicy…" autocomplete="off"></form></header>
    <section class="sec"><div class="big4">${big.map(([h, ic, l]) => `<a class="big" href="${h}"><i>${ico(ic)}</i><span>${l}</span></a>`).join("")}</div></section>
    <section class="sec"><div class="sec-h"><h2>Najlepiej oceniane</h2><a href="${hrefR({ rate: "4.5" })}">Zobacz wszystkie ›</a></div></section>
    <div class="cards">${top.map(card).join("")}</div>
    <p class="note nnote">Ceny są orientacyjne, za jedną noc w pokoju dwuosobowym, ${esc(ND.meta.priceDate || "")}. Aktualną cenę sprawdzisz na stronie obiektu.</p>`;
  }
  function viewBanners(kind) {
    let t, items;
    const cnt = (f) => { const n = list(f, "").length; return `${n} ${plural(n, "obiekt", "obiekty", "obiektów")}`; };
    if (kind === "rodzaj") { t = "Rodzaj noclegu"; items = KINDS.filter((k) => list({ kind: k.id }, "").length).map((k) => banner("nocleg-" + k.id, k.label, `${k.sub} · ${cnt({ kind: k.id })}`, hrefR({ kind: k.id }), k.tint, k.ico)); }
    else if (kind === "okazje") { t = "Okazja"; items = OCCS.map((o) => banner("nocleg-" + o.id, o.label, `${o.sub} · ${cnt({ occ: o.id })}`, hrefR({ occ: o.id }), o.tint, o.ico)); }
    else if (kind === "cena") { t = "Cena za noc"; items = PRICES.map((o) => banner("nocleg-cena", o.label, `${o.sub} · ${cnt({ price: o.id })}`, hrefR({ price: o.id }), o.tint, "coins")); }
    else { t = "Udogodnienia"; items = AMEN.map((a) => banner("-", a.label, cnt({ amen: [a.id] }), hrefR({ amen: [a.id] }), "#14233b", a.ico)); }
    return bar(t) + `<div class="bns">${items.join("")}</div>`;
  }
  const PAGE = 20;
  function viewResults(pp) {
    NS.f = fromParams(pp); NS.q = pp.get("q") || "";
    const l = list().sort((a, b) => (b.rating || 0) * Math.log10(b.reviews + 10) - (a.rating || 0) * Math.log10(a.reviews + 10));
    const ch = chips(NS.f, NS.q), n = Math.min(l.length, +(pp.get("n") || PAGE));
    const ttl = ch.filter(([k]) => k !== "q").map(([, x]) => x).join(" · ") || (NS.q ? `„${NS.q}”` : "Wszystkie noclegi");
    return `<div class="bar"><a class="ib" href="#/n" data-back><i>${ico("back")}</i></a><h2 class="rt">${esc(ttl)}</h2><a class="ib" href="#/n/filtry"><i>${ico("sliders")}</i></a></div>
    ${ch.length ? `<div class="chips">${ch.map(([k, x]) => `<button class="chip" data-nrm="${k}">${esc(x)}<i>${ico("close")}</i></button>`).join("")}</div>` : ""}
    <div class="count">Znaleziono ${l.length} ${plural(l.length, "obiekt", "obiekty", "obiektów")}</div>
    ${l.length ? `<div class="cards">${l.slice(0, n).map(card).join("")}</div>${n < l.length ? `<button class="more" data-nmore="${n + PAGE}">Pokaż więcej (${l.length - n})</button>` : ""}`
      : `<div class="empty"><i>${ico("bed")}</i><br>Nie znalazłem noclegów dla tych filtrów.<br>Usuń któryś z nich, żeby zobaczyć więcej obiektów.</div>`}`;
  }
  function fc(key, v, label, on) { return `<button class="fc ${on ? "on" : ""}" data-nfc="${key}" data-v="${v}">${esc(label)}</button>`; }
  function sheetGroups(f) {
    const g = (t, body) => `<div class="ms-g"><span class="t">${t}</span><div class="row">${body}</div></div>`;
    return g("Cena za noc", PRICES.map((o) => fc("price", o.id, o.label, f.price === o.id)).join(""))
      + g("Rodzaj", KINDS.map((k) => fc("kind", k.id, k.one, f.kind === k.id)).join(""))
      + g("Gwiazdki", STARS.map(([v, l]) => fc("stars", v, l, f.stars === v)).join(""))
      + g("Ocena gości", RATES.map(([v, l]) => fc("rate", v, l, f.rate === v)).join(""))
      + g("Okazja", OCCS.map((o) => fc("occ", o.id, o.label, f.occ === o.id)).join(""))
      + g("Położenie", AREAS.map(([v, l]) => fc("area", v, l, f.area === v)).join(""))
      + g("Udogodnienia", AMEN.map((a) => fc("amen", a.id, a.label, (f.amen || []).includes(a.id))).join(""));
  }
  function viewFilters() {
    const n = list().length;
    return `<div class="bar"><span class="ib"></span><h2>Filtry noclegów</h2><button class="ib" data-nreset aria-label="Wyczyść"><i>${ico("close")}</i></button></div>
    <div class="nfl ms-b">${sheetGroups(NS.f)}</div>
    <a class="btn fill" style="margin:8px 18px 24px" href="${hrefR({ ...NS.f, q: NS.q })}">Pokaż ${n} ${plural(n, "obiekt", "obiekty", "obiektów")}</a>`;
  }
  function viewFav() {
    const l = ND.places.filter((p) => NFAV.has(p.id));
    return `<div class="bar"><span class="ib"></span><h2>Ulubione noclegi</h2><span class="ib"></span></div>
    ${l.length ? `<div class="cards">${l.map(card).join("")}</div>` : `<div class="empty"><i>${ico("heart")}</i><br>Nie masz jeszcze ulubionych noclegów.<br>Dotknij serduszka przy obiekcie, żeby go tu zapisać.</div>`}`;
  }

  /* karta obiektu */
  function viewDetail(id, tab) {
    const p = NBY[id];
    if (!p) return bar("") + `<div class="empty">Nie znalazłem tego obiektu.</div>`;
    tab = tab || "info";
    const ph = p.photos, nav = navUrl(p);
    return `<div class="dt-hero"><div class="strip" id="hstrip">${ph.map((u, i) => `<img src="${img(u, 1200, 1000)}" alt="" ${i > 1 ? 'loading="lazy"' : ""} referrerpolicy="no-referrer" data-nvi="${i}" data-vi="${i}" class="fi" style="background-image:url('${img(u, 36, 30)}')">`).join("")}</div>
    <div class="dt-top"><a class="ib" href="#/n" data-back><i>${ico("back")}</i></a><div class="r"><button class="ib ${NFAV.has(p.id) ? "on" : ""}" data-nfav="${p.id}"><i>${ico("heart")}</i></button><button class="ib" data-nshare><i>${ico("share")}</i></button></div></div>
    <span class="dt-cnt" id="hcnt">1 / ${ph.length}</span></div>
  <div class="dt-main">
    <div class="dt-title"><h1>${esc(p.name)}</h1>${p.stars ? `<span class="price nstars">${stars(p.stars)}</span>` : ""}</div>
    ${p.rating ? `<div class="dt-rate"><i>${ico("star")}</i><b>${fmtR(p.rating)}</b><span>(${p.reviews} ${plural(p.reviews, "opinia", "opinie", "opinii")})</span><span>·</span><span>${esc(kindOf(p.kind).one)}</span></div>` : ""}
    <div class="dt-addr"><div class="addr"><i>${ico("pin")}</i><span>${esc(cityAddr(p.address))}${p.dRynek != null ? ` · ${dist(p.dRynek)} od Rynku` : ""}</span></div></div>
    <div class="acts">
      <a class="act ${p.www ? "" : "dis"}" href="${esc(p.www || "#")}" target="_blank" rel="noopener"><i>${ico("globeL")}</i><span>Strona</span></a>
      <a class="act ${p.www || p.gmaps ? "" : "dis"}" href="${esc(p.www || p.gmaps || "#")}" target="_blank" rel="noopener"><i>${ico("tag")}</i><span>Ceny</span></a>
      <a class="act ${p.phone ? "" : "dis"}" href="${p.phone ? "tel:" + esc(p.phone.replace(/\s/g, "")) : "#"}"><i>${ico("phone")}</i><span>Telefon</span></a>
      <a class="act" href="${esc(nav)}" target="_blank" rel="noopener"><i>${ico("navi")}</i><span>Trasa</span></a>
    </div>
    <div class="sm">${p.stars || p.areaName || p.occ.length ? `<p>${esc(lead(p))}</p>` : ""}
      ${p.price ? `<div class="sm-row"><i>${ico("coins")}</i><span>Orientacyjnie ${zl(p.price)} za noc${p.priceSrc === "strona" ? " (cennik na stronie obiektu)" : ND.meta.priceDate ? ` (${esc(ND.meta.priceDate)})` : ""}</span></div>` : ""}
      ${p.checkin || p.checkout ? `<div class="sm-row"><i>${ico("clock")}</i><span>${[p.checkin ? "Zameldowanie od " + p.checkin : "", p.checkout ? "wymeldowanie do " + p.checkout : ""].filter(Boolean).join(", ")}</span></div>` : ""}
    </div>
    <div class="thumbs">${ph.slice(1, 9).map((u, i) => `<button data-nvi="${i + 1}"><img src="${img(u, 360, 290)}" alt="" loading="lazy" referrerpolicy="no-referrer" class="fi"></button>`).join("")}</div>
    <div class="tabs" id="tabs">${[["info", "Informacje"], ["udog", "Udogodnienia"], ["opinie", "Opinie"], ["kontakt", "Kontakt"]].map(([k, l]) => `<button data-ntab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="pane" id="pane">${pane(p, tab)}</div>
  </div>`;
  }
  function lead(p) {
    const k = kindOf(p.kind).one + (p.stars ? ` ${p.stars}-gwiazdkowy` : "");
    const oc = p.occ.map((o) => ({ romantyczny: "romantyczny weekend", biznes: "podróż służbową", rodzina: "pobyt z dziećmi", spa: "relaks i spa" }[o]));
    return `${k}${p.areaName ? ", " + p.areaName : ""}.` + (oc.length ? ` Dobry wybór na ${oc.length > 1 ? oc.slice(0, -1).join(", ") + " i " + oc[oc.length - 1] : oc[0]}.` : "");
  }
  function pane(p, t) {
    if (t === "udog") {
      const yes = AMEN.filter((a) => p.amen.includes(a.id));
      const extra = (p.amenAll || []).filter((x) => !yes.some((a) => a.label === x));
      if (!yes.length && !extra.length) return `<p class="note">Google nie podaje udogodnień tego obiektu. Sprawdź je na stronie obiektu.</p>`;
      return `<div class="amen">${yes.map((a) => `<div class="am"><i>${ico(a.ico)}</i><span>${esc(a.label)}</span></div>`).join("")}${extra.map((x) => `<div class="am"><i>${ico("sparkle")}</i><span>${esc(x)}</span></div>`).join("")}</div><p class="note" style="margin-top:14px">Według informacji w Mapach Google. Szczegóły potwierdź w obiekcie.</p>`;
    }
    if (t === "opinie") {
      const r = p.reviewsText || [];
      return r.length ? `<div class="revs">${r.slice(0, 8).map((x) => `<div class="rev">${esc(x.replace(/[.\s]*…$/, "…"))}</div>`).join("")}</div><p class="note" style="margin-top:14px">Fragmenty opinii gości z Map Google.</p>` : `<p class="note">Brak opinii do wyświetlenia.</p>`;
    }
    if (t === "kontakt") {
      return `<div class="ct">
      ${p.phone ? `<a href="tel:${esc(p.phone.replace(/\s/g, ""))}"><i>${ico("phone")}</i><span>${esc(p.phone)}</span></a>` : ""}
      ${p.www ? `<a href="${esc(p.www)}" target="_blank" rel="noopener"><i>${ico("globe")}</i><span>${esc(p.www.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</span><i>${ico("ext")}</i></a>` : ""}
      <a href="${esc(navUrl(p))}" target="_blank" rel="noopener"><i>${ico("navi")}</i><span>Prowadź do obiektu</span><i>${ico("ext")}</i></a>
      ${p.gmaps ? `<a href="${esc(p.gmaps)}" target="_blank" rel="noopener"><i>${ico("map")}</i><span>Ceny i zdjęcia w Mapach Google</span><i>${ico("ext")}</i></a>` : ""}
      </div><p class="note" style="margin-top:14px">${esc(p.address)}</p>`;
    }
    const r = p.reviewsText || [];
    const best = r.find((x) => x.length > 60 && x.length < 260) || r[0];
    const rest = p.rest && typeof BYID !== "undefined" && BYID[p.rest];
    return `${p.desc ? `<div class="ndesc">${p.desc.split("\n").map((x) => `<p>${esc(x)}</p>`).join("")}${p.descSrc === "strona" ? `<p class="note">Na podstawie strony obiektu.</p>` : ""}</div>` : ""}
    <div class="rows">
      <div class="row"><i>${ico("bed")}</i><div><b>Rodzaj:</b> ${esc(kindOf(p.kind).one.toLowerCase())}${p.stars ? `, ${p.stars} ${plural(p.stars, "gwiazdka", "gwiazdki", "gwiazdek")}` : ""}</div></div>
      ${p.amen.length ? `<div class="row"><i>${ico("key")}</i><div><b>Udogodnienia:</b> ${esc(AMEN.filter((a) => p.amen.includes(a.id)).map((a) => a.label[0].toLowerCase() + a.label.slice(1)).join(", "))}</div></div>` : ""}
      ${rest ? `<a class="row lnk" href="#/lokal/${encodeURIComponent(rest.id)}"><i>${ico("cloche")}</i><div><b>Restauracja:</b> ${esc(rest.name)} ›</div></a>` : ""}
    </div>
    ${p.lat ? `<a class="loc" href="${esc(navUrl(p))}" target="_blank" rel="noopener"><div class="loc-map" id="nminiMap"></div><div class="loc-txt"><i>${ico("pin")}</i><div><b>${esc(cityAddr(p.address))}</b><span id="nlocDist">${distText(p) || "Dotknij, aby wyznaczyć trasę"}</span></div><i>${ico("navi")}</i></div></a>` : ""}
    ${best ? `<blockquote class="quote">${esc(sentenceCut(best, 240))}<small>Z opinii gości w Google</small></blockquote>` : ""}`;
  }
  let NMINI = null;
  async function initMini(p) {
    const el = $("#nminiMap");
    if (!el || !p) return;
    try { await ensureLeaflet(); } catch (e) { return; }
    if (!document.body.contains(el)) return;
    if (NMINI) { try { NMINI.remove(); } catch (e) {} }
    const L = window.L;
    NMINI = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false }).setView([p.lat, p.lng], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles" }).addTo(NMINI);
    L.marker([p.lat, p.lng], { icon: L.divIcon({ html: '<span class="mk el nmk"></span>', className: "", iconSize: [22, 22] }), interactive: false }).addTo(NMINI);
    myPosition().then(() => { const d = $("#nlocDist"); if (d && distText(p)) d.textContent = distText(p); });
  }

  /* mapa noclegów */
  let NMAP = null, NCL = null, NME = null;
  const NMK = [], MFN = { amen: [] };
  function mapWrap() {
    let w = $("#nmapwrap");
    if (w) return w;
    w = document.createElement("section");
    w.className = "mapwrap"; w.id = "nmapwrap"; w.hidden = true;
    w.innerHTML = `<div id="nmap"></div><div class="map-top"><span class="map-pill" id="nmapCount"></span><button class="map-fbtn" id="nmapFbtn"><i>${ico("sliders")}</i>Filtry<b id="nmapFn" hidden></b></button></div>
      <div class="msheet" id="nmsheet"></div><button class="map-loc" id="nmapLoc" aria-label="Moja lokalizacja"><i>${ico("navi")}</i></button>`;
    $("#app").insertBefore(w, $("#tabbar"));
    return w;
  }
  const mfCount = () => Object.entries(MFN).filter(([k, v]) => (k === "amen" ? v.length : v)).length + (MFN.amen.length > 1 ? MFN.amen.length - 1 : 0);
  function refreshMap() {
    if (!NCL) return;
    const vis = NMK.filter(([p]) => match(p, MFN, ""));
    NCL.clearLayers(); NCL.addLayers(vis.map(([, m]) => m));
    const n = vis.length, act = mfCount();
    $("#nmapCount").innerHTML = `<b>${n}</b> ${plural(n, "obiekt", "obiekty", "obiektów")}`;
    const b = $("#nmapFn"); b.hidden = !act; b.textContent = act;
    if (act && n && n < 80) NMAP.fitBounds(window.L.latLngBounds(vis.map(([p]) => [p.lat, p.lng])), { paddingTopLeft: [40, 80], paddingBottomRight: [40, 60], maxZoom: 16 });
  }
  function renderSheet() {
    const n = NMK.filter(([p]) => match(p, MFN, "")).length;
    $("#nmsheet").innerHTML = `<div class="ms-h"><h3>Filtry mapy</h3><button data-nmfclear>Wyczyść</button></div><div class="ms-b" data-map="1">${sheetGroups(MFN)}</div>
      <div class="ms-f"><button class="btn fill" data-nmfdone>Pokaż ${n} ${plural(n, "obiekt", "obiekty", "obiektów")}</button></div>`;
  }
  function popHtml(p) {
    return `<a class="pop" href="#/n/obiekt/${encodeURIComponent(p.id)}"><img src="${img(p.photos[0], 200, 200)}" alt="" referrerpolicy="no-referrer"><div><b>${esc(p.name)}</b><span>${esc(subLine(p).join(" · "))}</span>${p.rating ? `<span><span class="st">★ ${fmtR(p.rating)}</span> (${p.reviews})</span>` : ""}</div><i>${ico("back").replace("M15 5l-7 7 7 7", "M9 5l7 7-7 7")}</i></a>`;
  }
  async function showMap() {
    mapWrap();
    try { await ensureLeaflet(); } catch (e) { toast("Nie udało się wczytać mapy"); return; }
    if (NMAP) { requestAnimationFrame(() => NMAP.invalidateSize()); return; }
    const L = window.L;
    NMAP = L.map("nmap", { zoomControl: false, attributionControl: true, tap: true }).setView([51.2475, 22.5655], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(NMAP);
    NCL = L.markerClusterGroup({
      maxClusterRadius: 42, showCoverageOnHover: false, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 17,
      iconCreateFunction: (c) => { const n = c.getChildCount(), s = n < 10 ? 34 : n < 50 ? 40 : 48; return L.divIcon({ html: `<div class="mk-cl ncl" style="width:${s}px;height:${s}px">${n}</div>`, className: "", iconSize: [s, s] }); },
    });
    for (const p of ND.places) {
      if (!p.lat) continue;
      const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ html: `<span class="mk nmk"></span>`, className: "", iconSize: [18, 18] }) });
      m.bindPopup(() => popHtml(p), { closeButton: false, className: "gz-pop", offset: [0, -4], autoPanPadding: [20, 90] });
      NMK.push([p, m]);
    }
    NMAP.addLayer(NCL);
    refreshMap();
    NMAP.on("click", () => $("#nmsheet").classList.remove("on"));
    $("#nmapFbtn").addEventListener("click", () => { renderSheet(); $("#nmsheet").classList.toggle("on"); });
    $("#nmapLoc").addEventListener("click", () => { if (MEPOS) NMAP.flyTo(MEPOS, 16, { duration: 0.8 }); else locateN(true); });
    locateN(false);
  }
  function locateN(center) {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition((pos) => {
      const first = !NME; MEPOS = [pos.coords.latitude, pos.coords.longitude];
      if (!NME) NME = window.L.marker(MEPOS, { icon: window.L.divIcon({ html: '<div class="me"></div>', className: "", iconSize: [18, 18] }), zIndexOffset: 1000, interactive: false }).addTo(NMAP);
      else NME.setLatLng(MEPOS);
      const b = ND.meta.bounds || [51.13, 51.32, 22.42, 22.72];
      const inCity = MEPOS[0] > b[0] && MEPOS[0] < b[1] && MEPOS[1] > b[2] && MEPOS[1] < b[3];
      if ((first && inCity) || center) { NMAP.setView(MEPOS, 15); center = false; }
    }, () => { if (center) toast("Brak dostępu do lokalizacji"); }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 });
  }

  /* routing w kategorii */
  function routeN(path, pp) {
    if (!ND) return { html: `<div class="empty" style="padding-top:40vh"><i>${ico("bed")}</i><br>Wczytuję noclegi…</div>`, tab: "home", detail: false, map: false };
    const r = { html: "", tab: null, detail: false, map: false };
    if (path.startsWith("/n/obiekt/")) { r.html = viewDetail(decodeURIComponent(path.slice(10)), pp.get("t")); r.detail = true; }
    else if (path === "/n/wyniki") r.html = viewResults(pp);
    else if (path === "/n/rodzaj") { r.html = viewBanners("rodzaj"); r.tab = "rodzaj"; }
    else if (path === "/n/okazje" || path === "/n/cena" || path === "/n/udogodnienia") { r.html = viewBanners(path.slice(3)); r.tab = "home"; }
    else if (path === "/n/mapa") { r.map = true; r.tab = "mapa"; }
    else if (path === "/n/filtry") { r.html = viewFilters(); r.tab = "filtry"; }
    else if (path === "/n/ulubione") { r.html = viewFav(); r.tab = "ulubione"; }
    else { r.html = viewHome(); r.tab = "home"; }
    return r;
  }
  function cur() { const m = location.hash.match(/#\/n\/obiekt\/([^?]+)/); return m && NBY[decodeURIComponent(m[1])]; }
  function bind() {
    const f = $("#nform");
    if (f) f.addEventListener("submit", (e) => { e.preventDefault(); const q = $("#nq").value.trim(); if (q) location.hash = hrefR({ q }); $("#nq").blur(); });
    $("#view").querySelectorAll(".npc .strip").forEach((st) => {
      const dots = st.parentElement.querySelectorAll(".pc-dots b");
      if (dots.length) st.addEventListener("scroll", () => { const k = Math.round(st.scrollLeft / st.clientWidth); dots.forEach((d, i) => d.classList.toggle("on", i === k)); }, { passive: true });
    });
    if ($("#nminiMap")) initMini(cur());
  }
  function toggleFav(id) {
    NFAV.has(id) ? NFAV.delete(id) : NFAV.add(id);
    try { localStorage.setItem(FK, JSON.stringify([...NFAV])); } catch (e) {}
    document.querySelectorAll(`[data-nfav="${CSS.escape(id)}"]`).forEach((b) => b.classList.toggle("on", NFAV.has(id)));
  }
  function toggleIn(F, k, v) {
    if (k === "amen") { F.amen = F.amen || []; F.amen = F.amen.includes(v) ? F.amen.filter((x) => x !== v) : [...F.amen, v]; }
    else F[k] = F[k] === v ? null : v;
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    const fav = t.closest("[data-nfav]");
    if (fav) { stop(); toggleFav(fav.dataset.nfav); if (location.hash.startsWith("#/n/ulubione")) route(); return; }
    const nfc = t.closest("[data-nfc]");
    if (nfc) {
      stop();
      const onMap = !!nfc.closest("[data-map]");
      toggleIn(onMap ? MFN : NS.f, nfc.dataset.nfc, nfc.dataset.v);
      const box = nfc.closest(".ms-b"), sc = box && box.scrollTop;
      if (onMap) { refreshMap(); renderSheet(); const b = $("#nmsheet .ms-b"); if (b) b.scrollTop = sc; }
      else { const st = $("#view").scrollTop; route(); $("#view").scrollTop = st; }
      return;
    }
    if (t.closest("[data-nmfclear]")) { stop(); Object.keys(MFN).forEach((k) => (MFN[k] = k === "amen" ? [] : null)); refreshMap(); renderSheet(); return; }
    if (t.closest("[data-nmfdone]")) { stop(); $("#nmsheet").classList.remove("on"); return; }
    if (t.closest("[data-nreset]")) { stop(); NS.f = { amen: [] }; NS.q = ""; route(); return; }
    const rm = t.closest("[data-nrm]");
    if (rm) {
      stop();
      const k = rm.dataset.nrm, f = { ...NS.f, q: NS.q };
      if (k.startsWith("amen:")) f.amen = f.amen.filter((a) => a !== k.slice(5)); else f[k] = null;
      location.replace(hrefR(f)); return;
    }
    const more = t.closest("[data-nmore]");
    if (more) { stop(); const p = new URLSearchParams(location.hash.split("?")[1] || ""); p.set("n", more.dataset.nmore); const st = $("#view").scrollTop; history.replaceState(null, "", "#/n/wyniki?" + p); route(); $("#view").scrollTop = st; return; }
    const tb = t.closest("[data-ntab]");
    if (tb && cur()) {
      stop();
      const k = tb.dataset.ntab;
      document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.ntab === k));
      $("#pane").innerHTML = pane(cur(), k);
      if (k === "info") initMini(cur());
      return;
    }
    const vi = t.closest("[data-nvi]");
    if (vi && cur()) { stop(); openViewer(cur(), +vi.dataset.nvi); return; }
    if (t.closest("[data-nshare]")) {
      stop(); const p = cur(); if (!p) return;
      const url = location.href.split("#")[0] + "#/n/obiekt/" + encodeURIComponent(p.id);
      if (navigator.share) navigator.share({ title: p.name, url }).catch(() => {});
      else { try { navigator.clipboard.writeText(url); toast("Skopiowano link"); } catch (err) {} }
      return;
    }
    const pc = t.closest(".npc");
    if (pc) {
      stop();
      const st = pc.querySelector(".strip");
      VT_I = st ? Math.round(st.scrollLeft / st.clientWidth) : 0; VT_ID = null;
      if (canVT && st && st.children[VT_I]) { st.children[VT_I].classList.add("vt"); st.children[VT_I].style.viewTransitionName = "ph"; }
      location.hash = "#/n/obiekt/" + encodeURIComponent(pc.dataset.nid); return;
    }
  }, true);

  return {
    route: routeN, bind,
    count: () => (ND ? ND.places.length : 0),
    banners: () => (ND && ND.meta.banners) || [],
    mapVisible(on) { const w = $("#nmapwrap"); if (on) { mapWrap().hidden = false; showMap(); } else if (w) w.hidden = true; },
  };
})();
