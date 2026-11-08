"use strict";
const APP_V = "20261108-083809";
/* Gdzie zjeść: przeglądarka lokali. Tylko wyświetla dane z data/places.json. */

const ICO = {
  building: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M7 34V12l12-6v28M19 34V16l14 4v14M4 34h32"/><path d="M11 15h4M11 20h4M11 25h4M23 23h6M23 28h6"/></svg>',
  rings: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="15" cy="23" r="9"/><circle cx="25" cy="23" r="9"/><path d="M12 9l3-4 3 4-3 3zM22 9l3-4 3 4-3 3z" stroke-linejoin="round"/></svg>',
  family: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="10" r="4"/><circle cx="28" cy="10" r="4"/><circle cx="20" cy="20" r="3"/><path d="M5 34v-9a7 7 0 0 1 14 0M21 25a7 7 0 0 1 14 0v9M15 34v-4a5 5 0 0 1 10 0v4"/></svg>',
  calendar: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="6" y="9" width="28" height="25" rx="3"/><path d="M6 16h28M13 5v7M27 5v7M15 24l4 4 7-7"/></svg>',
  sofa: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M9 20v-6a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v6"/><path d="M5 22a3 3 0 0 1 6 0v3h18v-3a3 3 0 0 1 6 0v8H5z"/><path d="M8 30v4M32 30v4"/></svg>',
  forkL: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v13M8 5v9a4 4 0 0 0 8 0V5M12 18v17"/><path d="M28 35V5c-3.5 2-5.5 6.5-5.5 12 0 2.5 1.2 4 3.2 4H28"/></svg>',
  globeL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.3 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.3-3.5-8.5s1-6 3.5-8.5z"/></svg>',
  cloche: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 23h22M3 26h26"/><path d="M6 23a10 10 0 0 1 20 0"/><circle cx="16" cy="11.2" r="1.4"/><path d="M14 4.5c1.5 1 1.5 2.4 0 3.4M18 4.5c1.5 1 1.5 2.4 0 3.4"/></svg>',
  cutlery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17 21V3c-2.2 1.3-3.5 4-3.5 7.5 0 1.6.8 2.5 2 2.5H17"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  chevd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  navi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20 4L4 11l7 2 2 7z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.3 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.3-3.5-8.5s1-6 3.5-8.5z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/></svg>',
  fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3v18M17 3c2 1 3 3 3 6s-1.5 4-3 4"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
  coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="6.5" rx="7" ry="2.8"/><path d="M5 6.5v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-5M5 11.5v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-5"/></svg>',
  type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 10h16l-1.5 10h-13z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  chandelier: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 3v7"/><circle cx="20" cy="12" r="2"/><path d="M6 18c4 4 24 4 28 0M10 19c2 5 18 5 20 0"/><path d="M20 14v12"/><path d="M6 18v-3M14 21v-3M26 21v-3M34 18v-3M20 26v-3"/><path d="M5 13.5c.6-1 1.4-1 2 0M13 16.5c.6-1 1.4-1 2 0M25 16.5c.6-1 1.4-1 2 0M33 13.5c.6-1 1.4-1 2 0"/><path d="M12 24l1 4M28 24l-1 4M20 30v3M18.5 34h3"/><circle cx="13" cy="29" r=".8"/><circle cx="27" cy="29" r=".8"/></svg>',
  rose: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21c-5 0-8-3-8-8 3 1 4 0 5-3 1 2 2 3 3 3s2-1 3-3c1 3 2 4 5 3 0 5-3 8-8 8z"/><path d="M16 12c1.5 2.5 6.5 2.5 8 0M18 16c1 1.2 3 1.2 4 0"/><path d="M20 21v15"/><path d="M20 30c-3-3-7-3-9-1 3 2 6 2 9 1zM20 26c3-3 6-3 8-1-3 2-5 2-8 1z"/></svg>',
  diamond: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M11 8h18l6 8-15 17L5 16z"/><path d="M5 16h30M15 8l-3 8 8 17 8-17-3-8M20 8l-5 8M20 8l5 8"/></svg>',
  lamp: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 6h14l5 12H8z"/><path d="M20 18v14M13 35h14M15 32h10"/><path d="M14 21c-1 2-1 3 0 4M26 21c1 2 1 3 0 4" opacity=".6"/></svg>',
  terrace: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l14-9 14 9z"/><path d="M20 6v28M12 34h16"/><path d="M8 25h7l1 9M32 25h-7l-1 9M8 25v9M32 25v9"/></svg>',
  rings: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><circle cx="15" cy="24" r="8"/><circle cx="25" cy="24" r="8"/><path d="M12 10l3-4 3 4-3 3zM22 10l3-4 3 4-3 3z"/></svg>',
  glasses: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8h8l-.5 7a3.5 3.5 0 0 1-7 0z"/><path d="M13 18.5V31M9 31h8"/><path d="M23 8h8l-.5 7a3.5 3.5 0 0 1-7 0z"/><path d="M27 18.5V31M23 31h8"/><path d="M17 6l2-3M21 6l-2-3M19 3v-.5" opacity=".7"/></svg>',
  cake: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 34h26M9 34V22h22v12"/><path d="M9 26c3 2 5 2 7.3 0 2.3 2 5 2 7.4 0 2.3 2 4.3 2 7.3 0"/><path d="M14 22v-5M20 22v-5M26 22v-5"/><path d="M14 12.5c-1 1-1 2.2 0 2.5 1-.3 1-1.5 0-2.5zM20 12.5c-1 1-1 2.2 0 2.5 1-.3 1-1.5 0-2.5zM26 12.5c-1 1-1 2.2 0 2.5 1-.3 1-1.5 0-2.5z"/></svg>',
  case: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="6" y="12" width="28" height="20" rx="2.5"/><path d="M15 12V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M6 20h28M18 20v3h4v-3"/></svg>',
  heartL: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M20 33s-12-7.4-14.7-14.9C3.4 12.6 7 7.5 12.3 7.5c3.3 0 5.8 1.8 7.7 4.5 1.9-2.7 4.4-4.5 7.7-4.5 5.3 0 8.9 5.1 7 10.6C32 25.6 20 33 20 33z"/></svg>',
  pint: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M11 9h16l-2 25H13z"/><path d="M11 14h16"/><path d="M27 16h3a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-2.5"/><path d="M12 9c0-3 3-4 5-2 1-2 5-2 6 0 2-1 4 0 4 2"/></svg>',
  disco: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="20" cy="22" r="11"/><path d="M9 22h22M20 11v22M12 15h16M12 29h16M15 12.5c-2 6-2 13 0 19M25 12.5c2 6 2 13 0 19"/><path d="M20 4v7"/></svg>',
  coffee: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16h20v8a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z"/><path d="M28 18h2a4 4 0 0 1 0 8h-3M6 35h26"/><path d="M14 6c-1.5 2 1.5 3 0 5M19 6c-1.5 2 1.5 3 0 5M24 6c-1.5 2 1.5 3 0 5"/></svg>',
  wine: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5h14c0 9-2 14-7 14s-7-5-7-14z"/><path d="M13.5 11h13M20 19v13M14 34h12"/></svg>',
  cocktail: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h26L20 22z"/><path d="M20 22v11M13 34h14M11 12h18"/><circle cx="29" cy="6" r="3"/></svg>',
};
ICO.bed = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/></svg>';
const ico = (n) => ICO[n] || "";

const VIBES = [
  { id: "eleganckie", label: "Eleganckie", ico: "chandelier", sub: "Klasa i wyrafinowanie", tint: "#3d3018" },
  { id: "romantyczne", label: "Romantyczne", ico: "rose", sub: "Świece i nastrój we dwoje", tint: "#4f0e1b" },
  { id: "luksusowe", label: "Luksusowe", ico: "diamond", sub: "Najwyższa półka", tint: "#2e2710" },
  { id: "kameralne", label: "Kameralne", ico: "lamp", sub: "Kilka stolików, dużo spokoju", tint: "#3d2414" },
  { id: "nowoczesne", label: "Nowoczesne", ico: "building", sub: "Design i miejski styl", tint: "#1d2428" },
  { id: "taras", label: "Z tarasem", ico: "terrace", sub: "Kolacja pod gołym niebem", tint: "#4a2c12" },
];
const OCC = [
  { id: "randka", label: "Randka", ico: "heartL", sub: "Romantyczna atmosfera", tint: "#5a0f1c" },
  { id: "biznesowa", label: "Biznesowa", ico: "case", sub: "Profesjonalna i dyskretna", tint: "#1b2636" },
  { id: "urodziny", label: "Urodziny", ico: "cake", sub: "Wyjątkowa oprawa", tint: "#4a2a12" },
  { id: "rocznica", label: "Rocznica", ico: "rings", sub: "Niezapomniany wieczór", tint: "#1a1e38" },
  { id: "rodzinna", label: "Rodzinna", ico: "family", sub: "Komfort dla całej rodziny", tint: "#3b2a16" },
];
const TYPE_SUB = { restauracja: "Pełne menu i obsługa przy stole", pub: "Piwo, mecz i dobra kompania", bar: "Koktajle i nocne rozmowy", klub: "Muzyka i parkiet do rana", kawiarnia: "Kawa, desery i chwila oddechu", winiarnia: "Wino, sery i spokój", fastfood: "Burgery, kebab, coś na szybko" };
const TYPE_TINT = { restauracja: "#2f2318", pub: "#3b2710", bar: "#0f2b2b", klub: "#2b1040", kawiarnia: "#3b2b1d", winiarnia: "#3d0f1a", fastfood: "#3d1b0a" };
const OCC_NA = { randka: "randkę", biznesowa: "spotkanie biznesowe", urodziny: "urodziny", rocznica: "rocznicę", rodzinna: "rodzinny obiad" };
const TYPE_ICO = { restauracja: "cloche", pub: "pint", bar: "cocktail", klub: "disco", kawiarnia: "coffee", winiarnia: "wine", fastfood: "cutlery" };
const VIBE_ADJ = { eleganckie: "Elegancka", romantyczne: "Romantyczna", luksusowe: "Luksusowa", kameralne: "Kameralna", nowoczesne: "Nowoczesna", taras: "Z tarasem" };
const DAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
const HOME_CUISINES = ["wloska", "polska", "azjatycka", "steakhouse"];

let DB = { meta: {}, places: [] };
let BYID = {};
const S = { q: "", filters: { cuisine: null, vibe: null, occ: null, type: null, open: false }, scroll: {} };
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
const img = (u, w, h) => u + `=w${w}-h${h}-k-no`;
const fmtR = (r) => (r ? r.toFixed(1).replace(".", ",") : "");
const plural = (n, a, b, c) => (n === 1 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

/* ulubione */
const FAV_KEY = "gz-fav";
let FAV = new Set();
try { FAV = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch (e) {}
function toggleFav(id) {
  FAV.has(id) ? FAV.delete(id) : FAV.add(id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...FAV])); } catch (e) {}
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.classList.toggle("on", FAV.has(id)));
}

/* otwarte teraz */
function openState(p, d = new Date()) {
  const h = p.hours || {};
  if (!Object.keys(h).length) return null;
  const wd = (d.getDay() + 6) % 7, m = d.getHours() * 60 + d.getMinutes();
  const today = h[wd], yest = h[(wd + 6) % 7];
  if (yest && yest.some(([s, e]) => e > 1440 && m < e - 1440)) return true;
  if (today === undefined) return null;
  return today.some(([s, e]) => m >= s && m < e);
}

function cuisineLabel(id) { return (DB.meta.cuisines.find((c) => c.id === id) || {}).label || id; }
function typeLabel(id) { return (DB.meta.types.find((c) => c.id === id) || {}).label || id; }
function shortTags(p) {
  const t = [];
  if (p.cuisines[0]) t.push(cuisineLabel(p.cuisines[0]).replace(" i wege", "").replace(" i desery", ""));
  else if (p.type) t.push(typeLabel(p.type));
  const v = p.vibes.find((x) => x !== "taras");
  if (v) t.push(VIBE_ADJ[v]);
  return t;
}
function cityAddr(a) { return (a || "").replace(/,?\s*\d{2}-\d{3}\s*/, ", ").replace(/,\s*,/g, ",").replace(/\s+parter/i, "").replace(/,\s*$/, ""); }

/* filtrowanie */
function filtered() {
  const f = S.filters, q = norm(S.q).trim();
  const words = q ? q.split(/\s+/) : [];
  const now = new Date();
  return DB.places.filter((p) => {
    if (f.cuisine && !p.cuisines.includes(f.cuisine)) return false;
    if (f.vibe && !p.vibes.includes(f.vibe)) return false;
    if (f.occ && !p.occasions.includes(f.occ)) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.open && openState(p, now) !== true) return false;
    if (words.length) {
      const hay = p._hay || (p._hay = norm([p.name, p.gname, p.category, p.address, p.cuisines.map(cuisineLabel).join(" "), typeLabel(p.type)].join(" ")));
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}
function filterChips() {
  const f = S.filters, out = [];
  if (f.cuisine) out.push(["cuisine", cuisineLabel(f.cuisine)]);
  if (f.vibe) out.push(["vibe", VIBES.find((v) => v.id === f.vibe).label]);
  if (f.occ) out.push(["occ", OCC.find((v) => v.id === f.occ).label]);
  if (f.type) out.push(["type", typeLabel(f.type)]);
  if (f.open) out.push(["open", "Otwarte teraz"]);
  if (S.q) out.push(["q", `„${S.q}”`]);
  return out;
}

/* elementy */
function card(p) {
  if (card.n === undefined) card.n = 0;
  const ph = p.photos.slice(0, 5);
  const os = openState(p);
  return `<article class="pc" data-id="${p.id}" style="--i:${Math.min(card.n++, 6)}">
    <div class="pc-ph"><div class="strip">${ph.map((u, i) => `<img src="${img(u, 900, 620)}" alt="" loading="lazy" referrerpolicy="no-referrer" decoding="async" class="fi"${i ? "" : ` style="background-image:url('${img(u, 36, 24)}')"`}>`).join("")}</div>
    ${os === null ? "" : `<span class="open-badge ${os ? "y" : "n"}">${os ? "Otwarte" : "Zamknięte"}</span>`}
    <button class="fav ${FAV.has(p.id) ? "on" : ""}" data-fav="${p.id}" aria-label="Ulubione"><i>${ico("heart")}</i></button>
    ${ph.length > 1 ? `<div class="pc-dots">${ph.map((_, i) => `<b class="${i ? "" : "on"}"></b>`).join("")}</div>` : ""}
    <div class="pc-body">
      <div class="pc-name">${esc(p.name)}</div>
      <div class="meta">${p.rating ? `<span class="st"><i>${ico("star")}</i>${fmtR(p.rating)}</span><span>(${p.reviews})</span>` : ""}${shortTags(p).map((t) => `<span class="sep">·</span><span>${esc(t)}</span>`).join("")}${p.price ? `<span class="sep">·</span><span>${esc(p.price)}</span>` : ""}</div>
      <div class="addr"><i>${ico("pin")}</i><span>${esc(cityAddr(p.address))}</span></div>
    </div></div></article>`;
}
const hasTile = (k) => (DB.meta.tiles || []).includes(k);
function tileImg(label, href, photo, key) {
  const src = key && hasTile(key) ? `img/kafle/${key}.jpg` : photo ? img(photo, 300, 320) : "";
  return `<a class="tile" href="${href}"><img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer"><span>${esc(label)}</span></a>`;
}
function tileIco(label, href, ic, wine, key) {
  if (key && hasTile(key)) return tileImg(label, href, null, key);
  return `<a class="tile ico ${wine ? "wine" : ""}" href="${href}"><i>${ico(ic)}</i><span>${esc(label)}</span></a>`;
}
function cuisinePhoto(id) {
  const p = DB.places.find((x) => x.cuisines[0] === id && x.reviews > 80) || DB.places.find((x) => x.cuisines.includes(id));
  return p ? p.photos[0] : null;
}
function qs(o) { return "#/wyniki?" + new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString(); }

/* widoki */
function viewHome() {
  const featured = DB.places.filter((p) => p.vibes.includes("eleganckie")).slice(0, 8);
  const feat = featured.length ? featured : DB.places.slice(0, 8);
  const big = [["#/kuchnie", "forkL", "Kuchnie"], ["#/klimat", "sofa", "Klimat miejsca"], ["#/okazje", "calendar", "Okazje"], ["#/lokale", "cocktail", "Rodzaj lokalu"]];
  return `<header class="hdr"><div class="hdr-row"><a class="brand home" href="#/" aria-label="Wszystkie kategorie"><b class="bk">${ico("back")}</b><img src="img/logo.png" alt=""><h1>Restauracje</h1></a>
    <span class="city"><i>${ico("pin")}</i>${esc(DB.meta.city || "Lublin")}</span></div>
    <form class="search" id="sform"><i>${ico("search")}</i><input id="q" type="search" enterkeyhint="search" placeholder="Szukaj restauracji, kuchni, miejsca…" autocomplete="off"></form></header>
  <section class="sec"><div class="big4">${big.map(([h, ic, l]) => `<a class="big" href="${h}"><i>${ico(ic)}</i><span>${l}</span></a>`).join("")}</div></section>
  <section class="sec"><div class="sec-h"><h2>Polecane w Lublinie</h2><a href="${qs({ vibe: "eleganckie" })}">Zobacz wszystkie ›</a></div></section>
  <div class="cards">${feat.map(card).join("")}</div>`;
}
function viewStart() {
  const nR = DB.places.length;
  const kat = [["kat-restauracje", "Restauracje", `${nR} ${plural(nR, "miejsce", "miejsca", "miejsc")} · kuchnie, klimat, okazje`, "#/restauracje", "#4f0e1b", "cloche"]]
    .concat((typeof KATS !== "undefined" ? KATS : []).map((k) => [k.tile[0], k.tile[1], k.tile[2](k.count()), "#/" + k.p, k.tile[3], k.tile[4]]));
  return `<header class="hdr"><div class="hdr-row"><div class="brand"><img src="img/logo.png" alt=""><h1>Na mieście</h1></div>
    <span class="city"><i>${ico("pin")}</i>${esc(DB.meta.city || "Lublin")}</span></div></header>
  <section class="sec st-lead"><h2>Czego dziś szukasz?</h2><p>Sprawdzone miejsca w jednym przewodniku.</p></section>
  <div class="bns">${kat.map(([k, t, sub, h, tint, ic]) => banner(k, t, sub, h, tint, ic)).join("")}</div>`;
}
const TABS = {
  r: [["#/restauracje", "home", "cloche", "Odkrywaj"], ["#/kuchnie", "kuchnie", "cutlery", "Kuchnie"], ["#/mapa", "mapa", "map", "Mapa"], ["#/filtry", "filtry", "sliders", "Filtry"], ["#/ulubione", "ulubione", "heart", "Ulubione"]],
};
let TABCAT = null;
function setTabbar(cat) {
  if (cat === "start" || cat === TABCAT) return;
  TABCAT = cat;
  const k = typeof KATS !== "undefined" && KATS.find((x) => x.p === cat);
  $("#tabbar").innerHTML = (k ? k.tabs.map(([h, ...r]) => ["#/" + k.p + h, ...r]) : TABS[cat]).map(([h, k, ic, l]) => `<a href="${h}" data-tab="${k}"><i>${ico(ic)}</i><span>${l}</span></a>`).join("");
}
function banner(key, title, sub, href, tint, ic) {
  const BN = (DB.meta.banners || []).concat(...(typeof KATS !== "undefined" ? KATS.map((k) => k.banners()) : []));
  const src = BN.includes(key) ? `img/banery/${key}.jpg` : hasTile(key) ? `img/kafle/${key}.jpg` : null;
  return `<a class="bn" href="${href}" style="--tint:${tint}">${src ? `<img src="${src}" alt="" loading="lazy" class="${BN.includes(key) ? "wide" : "sq"}">` : `<i class="bn-ico">${ico(ic)}</i>`}
    <div class="bn-txt"><b>${esc(title)}</b><span>${esc(sub)}</span></div></a>`;
}
function viewBanners(kind) {
  let title, items;
  if (kind === "okazje") { title = "Okazje"; items = OCC.map((o) => banner("okazja-" + o.id, o.label, o.sub, qs({ occ: o.id }), o.tint, o.ico)); }
  else if (kind === "klimat") { title = "Klimat miejsca"; items = VIBES.map((o) => banner("klimat-" + o.id, o.label, o.sub, qs({ vibe: o.id }), o.tint, o.ico)); }
  else { title = "Rodzaj lokalu"; const ord = ["restauracja", "kawiarnia", "winiarnia", "bar", "pub", "klub", "fastfood"];
    items = DB.meta.types.filter((t) => t.n).sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id)).map((t) => banner("lokal-" + t.id, t.label, TYPE_SUB[t.id] || "", qs({ type: t.id }), TYPE_TINT[t.id] || "#2a2018", TYPE_ICO[t.id] || "cloche")); }
  return `<div class="bar"><a class="ib" href="#/restauracje" data-back><i>${ico("back")}</i></a><h2 class="ttl">${title}</h2><span class="ib"></span></div>
  <div class="bns">${items.join("")}</div>`;
}

const PAGE = 20;
function viewResults(params) {
  S.filters = { cuisine: params.get("cuisine"), vibe: params.get("vibe"), occ: params.get("occ"), type: params.get("type"), open: params.get("open") === "1" };
  S.q = params.get("q") || "";
  const list = filtered();
  const chips = filterChips();
  const n = Math.min(list.length, +(params.get("n") || PAGE));
  const ttl = chips.filter(([k]) => k !== "q" && k !== "open").map(([, l]) => l).join(" · ") || (S.q ? `„${S.q}”` : "Wszystkie miejsca");
  return `<div class="bar"><a class="ib" href="#/restauracje" data-back><i>${ico("back")}</i></a><h2 class="rt">${esc(ttl)}</h2><a class="ib" href="#/filtry"><i>${ico("sliders")}</i></a></div>
    ${chips.length ? `<div class="chips">${chips.map(([k, l]) => `<button class="chip" data-rm="${k}">${esc(l)}<i>${ico("close")}</i></button>`).join("")}</div>` : ""}
    <div class="count">Znaleziono ${list.length} ${plural(list.length, "miejsce", "miejsca", "miejsc")}</div>
    ${list.length ? `<div class="cards">${list.slice(0, n).map(card).join("")}</div>${n < list.length ? `<button class="more" data-more="${n + PAGE}">Pokaż więcej (${list.length - n})</button>` : ""}`
      : `<div class="empty"><i>${ico("cloche")}</i><br>Nie znalazłem lokali dla tych filtrów.<br>Usuń któryś z nich, żeby zobaczyć więcej miejsc.</div>`}`;
}

function viewCuisines() {
  const cz = DB.meta.cuisines.filter((c) => c.n > 0);
  return `<div class="bar"><a class="ib" href="#/restauracje" data-back><i>${ico("back")}</i></a><h2 class="ttl">Kuchnie</h2><span class="ib"></span></div>
  <div class="kgrid">${cz.map((c) => tileImg(c.label, qs({ cuisine: c.id }), cuisinePhoto(c.id), "kuchnia-" + c.id)).join("")}</div>`;
}
function selBox(key, label, ic, opts, val, any = "Dowolna") {
  const cur = opts.find((o) => o[0] === val);
  return `<div class="sel"><i>${ico(ic)}</i><label>${label}:</label><b>${cur ? esc(cur[1]) : any}</b><i class="chev">${ico("chevd")}</i>
    <select data-f="${key}"><option value="">${any}</option>${opts.map(([v, l]) => `<option value="${v}" ${v === val ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`;
}
function viewFilters() {
  const f = S.filters;
  const n = filtered().length;
  return `<div class="bar"><span class="ib"></span><h2>Filtry</h2><button class="ib" data-reset aria-label="Wyczyść"><i>${ico("close")}</i></button></div>
  <div class="fl">
    ${selBox("cuisine", "Kuchnia", "cloche", DB.meta.cuisines.filter((c) => c.n).map((c) => [c.id, c.label]), f.cuisine)}
    ${selBox("vibe", "Klimat", "wine", VIBES.map((v) => [v.id, v.label]), f.vibe, "Dowolny")}
    ${selBox("occ", "Okazja", "heart", OCC.map((v) => [v.id, v.label]), f.occ)}
    ${selBox("type", "Lokal", "type", DB.meta.types.filter((c) => c.n).map((c) => [c.id, c.label]), f.type, "Dowolny")}
    <button class="tg ${f.open ? "on" : ""}" data-open><span>Otwarte teraz</span><span class="sw"></span></button>
  </div>
  <a class="btn fill" style="margin:8px 18px 0" href="${qs({ ...f, open: f.open ? "1" : "", q: S.q })}">Pokaż ${n} ${plural(n, "miejsce", "miejsca", "miejsc")}</a>`;
}

function viewFav() {
  const list = DB.places.filter((p) => FAV.has(p.id));
  return `<div class="bar"><span class="ib"></span><h2>Ulubione</h2><span class="ib"></span></div>
  ${list.length ? `<div class="cards">${list.map(card).join("")}</div>` : `<div class="empty"><i>${ico("heart")}</i><br>Nie masz jeszcze ulubionych miejsc.<br>Dotknij serduszka przy lokalu, żeby go tu zapisać.</div>`}`;
}

function hoursTable(p) {
  const wd = (new Date().getDay() + 6) % 7;
  const ht = p.hoursText || {};
  if (!Object.keys(ht).length) return `<p class="note">Google nie podaje godzin otwarcia tego lokalu.</p>`;
  return `<table class="hours">${DAYS.map((d, i) => `<tr class="${i === wd ? "today" : ""}"><td>${d[0].toUpperCase() + d.slice(1)}</td><td>${esc(ht[d] || "brak danych")}</td></tr>`).join("")}</table>` + (p.hoursSrc ? `<p class="note" style="margin-top:12px">Godziny według ${{ osm: "OpenStreetMap", serwis: "serwisu z zamówieniami online" }[p.hoursSrc] || "strony lokalu"}.</p>` : "");
}
function menuPane(p) {
  if (p.menu && p.menu.length) {
    let html = "", cat = null;
    for (const it of p.menu) {
      if (it.cat && it.cat !== cat) { cat = it.cat; html += `<div class="menu-cat">${esc(cat)}</div>`; }
      html += `<div class="menu-it"><span>${esc(it.name)}${it.desc ? `<small>${esc(it.desc)}</small>` : ""}</span><span>${esc(it.price || "")}</span></div>`;
    }
    return `<div class="menu-list">${html}</div>${p.menuUrl ? `<p class="note" style="margin-top:14px">Źródło: strona lokalu. Ceny mogą się różnić.</p>` : ""}`;
  }
  const links = [];
  if (p.menuUrl) links.push(`<a href="${esc(p.menuUrl)}" target="_blank" rel="noopener"><i>${ico("book")}</i><span>Menu na stronie lokalu</span><i>${ico("ext")}</i></a>`);
  if (p.menuPdf) links.push(`<a href="${esc(p.menuPdf)}" target="_blank" rel="noopener"><i>${ico("book")}</i><span>Menu w PDF</span><i>${ico("ext")}</i></a>`);
  if (p.www && !p.menuUrl) links.push(`<a href="${esc(p.www)}" target="_blank" rel="noopener"><i>${ico("globe")}</i><span>Strona lokalu</span><i>${ico("ext")}</i></a>`);
  if (p.gmaps) links.push(`<a href="${esc(p.gmaps)}" target="_blank" rel="noopener"><i>${ico("map")}</i><span>Menu i zdjęcia w Mapach Google</span><i>${ico("ext")}</i></a>`);
  return `<p class="note">Menu tego lokalu nie jest jeszcze w aplikacji. Zobaczysz je tutaj:</p><div class="ct" style="margin-top:12px">${links.join("")}</div>`;
}
function infoPane(p) {
  const cz = p.cuisines.map(cuisineLabel).join(", ");
  const ch = p.vibes.map((v) => VIBES.find((x) => x.id === v).label.toLowerCase()).join(", ");
  const oc = p.occasions.map((v) => OCC.find((x) => x.id === v).label.toLowerCase()).join(", ");
  const r = p.reviewsText || [];
  const best = r.find((t) => t.length > 60 && t.length < 260) || r[0];
  return `<div>${esc(p.category || typeLabel(p.type))}${p.rating ? `. Ocena ${fmtR(p.rating)} na podstawie ${p.reviews} ${plural(p.reviews, "opinii", "opinii", "opinii")} w Google.` : "."}</div>
    <div class="rows">
      ${cz ? `<div class="row"><i>${ico("fork")}</i><div><b>Kuchnia:</b> ${esc(cz.toLowerCase())}</div></div>` : ""}
      <div class="row"><i>${ico("type")}</i><div><b>Lokal:</b> ${esc(typeLabel(p.type).toLowerCase())}</div></div>
      ${ch ? `<div class="row"><i>${ico("sparkle")}</i><div><b>Charakter:</b> ${esc(ch)}</div></div>` : ""}
      ${oc ? `<div class="row"><i>${ico("heart")}</i><div><b>Na okazję:</b> ${esc(oc)}</div></div>` : ""}
      ${p.price ? `<div class="row"><i>${ico("coins")}</i><div><b>Ceny w menu:</b> ${esc(p.price)}</div></div>` : ""}
    </div>
    ${p.lat ? `<a class="loc" href="${esc(navUrl(p))}" target="_blank" rel="noopener"><div class="loc-map" id="miniMap"></div><div class="loc-txt"><i>${ico("pin")}</i><div><b>${esc(cityAddr(p.address))}</b><span id="locDist">${distText(p) || "Dotknij, aby wyznaczyć trasę"}</span></div><i>${ico("navi")}</i></div></a>` : ""}
    ${best ? `<blockquote class="quote">${esc(sentenceCut(best, 240))}<small>Z opinii gości w Google</small></blockquote>` : ""}
    ${r.length > 1 ? `<div class="sec-h" style="margin-top:20px"><h2>Opinie gości</h2></div><div class="revs">${r.filter((t) => t !== best).slice(0, 5).map((t) => `<div class="rev">${esc(t.replace(/[.\s]*…$/, "…"))}</div>`).join("")}</div>` : ""}`;
}
function navUrl(p) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.name + ", " + p.address)}`; }
function kmBetween(a, b) {
  const R = 6371, r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function distText(p) {
  if (!MEPOS || !p.lat) return "";
  const km = kmBetween(MEPOS, [p.lat, p.lng]) * 1.3;
  const walk = Math.round(km / 4.8 * 60), car = Math.max(3, Math.round(km / 25 * 60 + 2));
  const d = km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1).replace(".", ",")} km`;
  const fmt = (m) => m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
  return walk <= 45 ? `${d} · ok. ${fmt(walk)} pieszo · ${fmt(car)} autem` : `${d} · ok. ${fmt(car)} autem`;
}
function myPosition() {
  if (MEPOS || !navigator.geolocation) return Promise.resolve(MEPOS);
  return new Promise((ok) => navigator.geolocation.getCurrentPosition((pos) => { MEPOS = [pos.coords.latitude, pos.coords.longitude]; ok(MEPOS); }, () => ok(null), { maximumAge: 120000, timeout: 10000 }));
}
let MINI = null;
async function initMini() {
  const el = $("#miniMap"), p = curPlace();
  if (!el || !p) return;
  try { await ensureLeaflet(); } catch (e) { return; }
  if (!document.body.contains(el)) return;
  if (MINI) { try { MINI.remove(); } catch (e) {} }
  const L = window.L;
  MINI = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false }).setView([p.lat, p.lng], 16);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "gz-tiles" }).addTo(MINI);
  L.marker([p.lat, p.lng], { icon: L.divIcon({ html: '<span class="mk el"></span>', className: "", iconSize: [22, 22] }), interactive: false }).addTo(MINI);
  myPosition().then(() => { const d = $("#locDist"); if (d && distText(p)) d.textContent = distText(p); });
}
function sentenceCut(t, n) {
  t = t.replace(/…$/, "").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n), k = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return k > 60 ? cut.slice(0, k + 1) : cut.replace(/\s+\S*$/, "") + "…";
}
function contactPane(p) {
  const nav = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.name + ", " + p.address)}`;
  return `<div class="ct">
    ${p.phone ? `<a href="tel:${esc(p.phone.replace(/\s/g, ""))}"><i>${ico("phone")}</i><span>${esc(p.phone)}</span></a>` : ""}
    ${p.www ? `<a href="${esc(p.www)}" target="_blank" rel="noopener"><i>${ico("globe")}</i><span>${esc(p.www.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</span><i>${ico("ext")}</i></a>` : ""}
    <a href="${esc(nav)}" target="_blank" rel="noopener"><i>${ico("navi")}</i><span>Prowadź do lokalu</span><i>${ico("ext")}</i></a>
    ${p.gmaps ? `<a href="${esc(p.gmaps)}" target="_blank" rel="noopener"><i>${ico("map")}</i><span>Otwórz w Mapach Google</span><i>${ico("ext")}</i></a>` : ""}
  </div><p class="note" style="margin-top:14px">${esc(p.address)}</p>`;
}
function viewDetail(id, tab) {
  const p = BYID[id];
  if (!p) return `<div class="bar"><a class="ib" href="#/restauracje" data-back><i>${ico("back")}</i></a><h2></h2><span class="ib"></span></div><div class="empty">Nie znalazłem tego lokalu.</div>`;
  tab = tab || "info";
  const ph = p.photos;
  const nav = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.name + ", " + p.address)}`;
  const tags = [...p.cuisines.slice(0, 2).map(cuisineLabel), ...p.vibes.filter((v) => v !== "taras").slice(0, 2).map((v) => VIBE_ADJ[v])];
  const os = openState(p);
  const menuHref = p.menu && p.menu.length ? "#menu" : p.menuUrl || p.menuPdf || p.gmaps;
  return `<div class="dt-hero"><div class="strip" id="hstrip">${ph.map((u, i) => `<img src="${img(u, 1200, 1000)}" alt="" ${i > 1 ? 'loading="lazy"' : ""} referrerpolicy="no-referrer" data-vi="${i}" class="fi" style="background-image:url('${img(u, 36, 30)}')">`).join("")}</div>
    <div class="dt-top"><a class="ib" href="#/restauracje" data-back><i>${ico("back")}</i></a><div class="r"><button class="ib ${FAV.has(p.id) ? "on" : ""}" data-fav="${p.id}"><i>${ico("heart")}</i></button><button class="ib" data-share><i>${ico("share")}</i></button></div></div>
    <span class="dt-cnt" id="hcnt">1 / ${ph.length}</span></div>
  <div class="dt-main">
    <div class="dt-title"><h1>${esc(p.name)}</h1>${p.price ? `<span class="price">${esc(p.price)}</span>` : ""}</div>
    ${p.rating ? `<div class="dt-rate"><i>${ico("star")}</i><b>${fmtR(p.rating)}</b><span>(${p.reviews} ${plural(p.reviews, "opinia", "opinie", "opinii")})</span>${os === null ? "" : `<span>·</span><span style="color:${os ? "#9fd8a6" : "#e7a3a3"}">${os ? "Otwarte teraz" : "Teraz zamknięte"}</span>`}</div>` : ""}
    ${tags.length ? `<div class="dt-tags">${tags.map(esc).join(" · ")}</div>` : ""}
    <div class="dt-addr"><div class="addr"><i>${ico("pin")}</i><span>${esc(cityAddr(p.address))}</span></div></div>
    <div class="acts">
      <a class="act ${p.www ? "" : "dis"}" href="${esc(p.www || "#")}" target="_blank" rel="noopener"><i>${ico("globeL")}</i><span>Strona</span></a>
      <a class="act ${menuHref ? "" : "dis"}" ${menuHref === "#menu" ? 'href="#" data-tab="menu"' : `href="${esc(menuHref || "#")}" target="_blank" rel="noopener"`}><i>${ico("book")}</i><span>Menu</span></a>
      <a class="act ${p.phone ? "" : "dis"}" href="${p.phone ? "tel:" + esc(p.phone.replace(/\s/g, "")) : "#"}"><i>${ico("phone")}</i><span>Telefon</span></a>
      <a class="act" href="${esc(nav)}" target="_blank" rel="noopener"><i>${ico("navi")}</i><span>Trasa</span></a>
    </div>
    ${summary(p)}
    <div class="thumbs">${ph.slice(1, 9).map((u, i) => `<button data-vi="${i + 1}"><img src="${img(u, 360, 290)}" alt="" loading="lazy" referrerpolicy="no-referrer" class="fi"></button>`).join("")}</div>
    <div class="tabs" id="tabs">${[["info", "Informacje"], ["menu", "Menu"], ["godziny", "Godziny"], ["kontakt", "Kontakt"]].map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="pane" id="pane">${paneFor(p, tab)}</div>
  </div>`;
}
function summary(p) {
  const base = p.category || typeLabel(p.type);
  const ADJ = { eleganckie: "elegancki", romantyczne: "romantyczny", luksusowe: "luksusowy", kameralne: "kameralny", nowoczesne: "nowoczesny" };
  const v = p.vibes.filter((x) => ADJ[x]).map((x) => ADJ[x]);
  const occ = p.occasions.map((o) => OCC_NA[o]).filter(Boolean);
  let t = base + "." + (v.length ? " Klimat " + (v.length > 1 ? v.slice(0, -1).join(", ") + " i " + v[v.length - 1] : v[0]) + "." : "");
  if (p.vibes.includes("taras")) t += " Ma ogródek lub taras.";
  if (occ.length) t += " Dobre miejsce na " + (occ.length > 1 ? occ.slice(0, -1).join(", ") + " i " + occ[occ.length - 1] : occ[0]) + ".";
  const wd = DAYS[(new Date().getDay() + 6) % 7], h = (p.hoursText || {})[wd];
  const os = openState(p);
  const hours = h ? (/Zamknięte/.test(h) ? `<div class="sm-row"><i>${ico("clock")}</i><span class="cl">Dziś zamknięte</span></div>` : `<div class="sm-row"><i>${ico("clock")}</i><span class="${os ? "op" : ""}">${os ? "Otwarte dziś" : "Dziś"}:</span><span>${esc(h)}</span></div>`) : "";
  return `<div class="sm"><p>${esc(t)}</p>${hours}${p.price ? `<div class="sm-row"><i>${ico("coins")}</i><span>Ceny w menu: ${esc(p.price)}</span></div>` : ""}</div>`;
}
function paneFor(p, t) { return t === "menu" ? menuPane(p) : t === "godziny" ? hoursTable(p) : t === "kontakt" ? contactPane(p) : infoPane(p); }

/* mapa */
let MAP = null, ME = null, MEPOS = null, LEAF = null, MCL = null;
const MMK = [];
const MF = { cuisine: null, vibe: null, occ: null, type: null, open: false };
function mapMatch(p) {
  if (MF.cuisine && !p.cuisines.includes(MF.cuisine)) return false;
  if (MF.vibe && !p.vibes.includes(MF.vibe)) return false;
  if (MF.occ && !p.occasions.includes(MF.occ)) return false;
  if (MF.type && p.type !== MF.type) return false;
  if (MF.open && openState(p) !== true) return false;
  return true;
}
function refreshMap() {
  if (!MCL) return;
  const vis = MMK.filter(([p]) => mapMatch(p));
  MCL.clearLayers(); MCL.addLayers(vis.map(([, m]) => m));
  const n = vis.length, act = Object.values(MF).filter(Boolean).length;
  $("#mapCount").innerHTML = `<b>${n}</b> ${plural(n, "miejsce", "miejsca", "miejsc")}`;
  const b = $("#mapFn"); b.hidden = !act; b.textContent = act;
  if (act && n && n < 80) {
    const bb = window.L.latLngBounds(vis.map(([p]) => [p.lat, p.lng]));
    MAP.fitBounds(bb, { paddingTopLeft: [40, 80], paddingBottomRight: [40, 60], maxZoom: 16 });
  }
}
function renderSheet() {
  const grp = (key, title, opts) => `<div class="ms-g"><span class="t">${title}</span><div class="row">${opts.map(([v, l]) => `<button class="fc ${MF[key] === v ? "on" : ""}" data-mf="${key}" data-v="${v}">${esc(l)}</button>`).join("")}</div></div>`;
  const ord = ["restauracja", "kawiarnia", "winiarnia", "bar", "pub", "klub", "fastfood"];
  const n = MMK.filter(([p]) => mapMatch(p)).length;
  $("#msheet").innerHTML = `<div class="ms-h"><h3>Filtry mapy</h3><button data-mfclear>Wyczyść</button></div><div class="ms-b">
    <div class="ms-g"><div class="row"><button class="fc ${MF.open ? "on" : ""}" data-mf="open" data-v="1">Otwarte teraz</button></div></div>
    ${grp("occ", "Okazja", OCC.map((o) => [o.id, o.label]))}
    ${grp("cuisine", "Kuchnia", DB.meta.cuisines.filter((c) => c.n).map((c) => [c.id, c.label]))}
    ${grp("vibe", "Klimat", VIBES.map((o) => [o.id, o.label]))}
    ${grp("type", "Rodzaj lokalu", DB.meta.types.filter((t) => t.n).sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id)).map((t) => [t.id, t.label]))}
  </div><div class="ms-f"><button class="btn fill" data-mfdone>Pokaż ${n} ${plural(n, "miejsce", "miejsca", "miejsc")}</button></div>`;
}
function loadScript(src) { return new Promise((ok, bad) => { const e = document.createElement("script"); e.src = src; e.onload = ok; e.onerror = bad; document.head.appendChild(e); }); }
function ensureLeaflet() {
  if (!LEAF) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "vendor/leaflet/leaflet.css"; document.head.appendChild(l);
    LEAF = loadScript("vendor/leaflet/leaflet.js").then(() => loadScript("vendor/leaflet/leaflet.markercluster.js"));
  }
  return LEAF;
}
function popHtml(p) {
  const t = shortTags(p).join(" · ") || typeLabel(p.type);
  return `<a class="pop" href="#/lokal/${encodeURIComponent(p.id)}"><img src="${img(p.photos[0], 200, 200)}" alt="" referrerpolicy="no-referrer"><div><b>${esc(p.name)}</b><span>${esc(t)}</span>${p.rating ? `<span><span class="st">★ ${fmtR(p.rating)}</span> (${p.reviews})${openState(p) === true ? " · otwarte" : ""}</span>` : ""}</div><i>${ico("back").replace("M15 5l-7 7 7 7", "M9 5l7 7-7 7")}</i></a>`;
}
async function showMap() {
  try { await ensureLeaflet(); } catch (e) { toast("Nie udało się wczytać mapy"); return; }
  if (MAP) { requestAnimationFrame(() => MAP.invalidateSize()); return; }
  const L = window.L;
  MAP = L.map("map", { zoomControl: false, attributionControl: true, tap: true }).setView([51.2475, 22.5655], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, className: "gz-tiles", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(MAP);
  MCL = L.markerClusterGroup({
    maxClusterRadius: 42, showCoverageOnHover: false, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 17,
    iconCreateFunction: (c) => { const n = c.getChildCount(), s = n < 10 ? 34 : n < 50 ? 40 : 48; return L.divIcon({ html: `<div class="mk-cl" style="width:${s}px;height:${s}px">${n}</div>`, className: "", iconSize: [s, s] }); },
  });
  for (const p of DB.places) {
    if (!p.lat) continue;
    const el = p.vibes.includes("eleganckie");
    const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ html: `<span class="mk ${el ? "el" : ""}"></span>`, className: "", iconSize: el ? [22, 22] : [16, 16] }), zIndexOffset: el ? 500 : 0 });
    m.bindPopup(() => popHtml(p), { closeButton: false, className: "gz-pop", offset: [0, -4], autoPanPadding: [20, 90] });
    MMK.push([p, m]);
  }
  MAP.addLayer(MCL);
  refreshMap();
  MAP.on("click", () => $("#msheet").classList.remove("on"));
  $("#mapFbtn").addEventListener("click", () => { renderSheet(); $("#msheet").classList.toggle("on"); });
  $("#mapLoc").addEventListener("click", () => { if (MEPOS) MAP.flyTo(MEPOS, 16, { duration: 0.8 }); else locate(true); });
  locate(false);
}
function locate(center) {
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition((pos) => {
    const first = !MEPOS;
    MEPOS = [pos.coords.latitude, pos.coords.longitude];
    if (!ME) ME = window.L.marker(MEPOS, { icon: window.L.divIcon({ html: '<div class="me"></div>', className: "", iconSize: [18, 18] }), zIndexOffset: 1000, interactive: false }).addTo(MAP);
    else ME.setLatLng(MEPOS);
    const inCity = MEPOS[0] > 51.13 && MEPOS[0] < 51.32 && MEPOS[1] > 22.42 && MEPOS[1] < 22.72;
    if ((first && inCity) || center) { MAP.setView(MEPOS, 15); center = false; }
  }, () => { if (center) toast("Brak dostępu do lokalizacji"); }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 });
}

/* przeglądarka zdjęć */
function openViewer(p, i) {
  const v = $("#viewer");
  v.innerHTML = `<div class="vtop"><button class="ib" data-vclose><i>${ico("close")}</i></button><span id="vcnt">${i + 1} / ${p.photos.length}</span><span class="ib"></span></div>
   <div class="strip" id="vstrip">${p.photos.map((u) => `<div><img src="${img(u, 1600, 1600)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>`).join("")}</div>`;
  v.hidden = false;
  const st = $("#vstrip");
  requestAnimationFrame(() => { st.scrollLeft = i * st.clientWidth; });
  st.addEventListener("scroll", () => { $("#vcnt").textContent = `${Math.round(st.scrollLeft / st.clientWidth) + 1} / ${p.photos.length}`; }, { passive: true });
}

/* routing */
let prevHash = null;
function route() {
  card.n = 0;
  const h = location.hash || "#/";
  const [path, query] = h.slice(1).split("?");
  const params = new URLSearchParams(query || "");
  const view = $("#view");
  if (prevHash) S.scroll[prevHash] = view.scrollTop;
  let html, tab = "home", detail = false, nmap = false;
  const KAT = (typeof KATS !== "undefined" ? KATS : []).find((k) => path === "/" + k.p || path.startsWith("/" + k.p + "/"));
  const cat = path === "/" || path === "" ? "start" : KAT ? KAT.p : "r";
  setTabbar(cat);
  if (cat === "start") { html = viewStart(); tab = null; }
  else if (KAT) { const r = KAT.route(path, params); html = r.html; tab = r.tab; detail = r.detail; nmap = r.map; }
  else if (path.startsWith("/lokal/")) { html = viewDetail(decodeURIComponent(path.slice(7)), params.get("t")); detail = true; tab = null; }
  else if (path === "/wyniki") { html = viewResults(params); tab = null; }
  else if (path === "/kuchnie") { html = viewCuisines(); tab = "kuchnie"; }
  else if (path === "/okazje" || path === "/klimat" || path === "/lokale") { html = viewBanners(path.slice(1)); tab = "home"; }
  else if (path === "/mapa") { html = ""; tab = "mapa"; }
  else if (path === "/filtry") { html = viewFilters(); tab = "filtry"; }
  else if (path === "/ulubione") { html = viewFav(); tab = "ulubione"; }
  else html = viewHome();
  view.innerHTML = html;
  $("#app").classList.toggle("start", cat === "start");
  (typeof KATS !== "undefined" ? KATS : []).forEach((k) => $("#app").classList.toggle(k.cls, k === KAT));
  view.classList.toggle("detail", detail);
  $("#app").classList.toggle("detail", detail);
  const onMap = path === "/mapa";
  $("#mapwrap").hidden = !onMap;
  (typeof KATS !== "undefined" ? KATS : []).forEach((k) => k.mapVisible(k === KAT && nmap));
  view.style.visibility = onMap || nmap ? "hidden" : "";
  if (onMap) showMap();
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
  view.scrollTop = S.scroll[h] || 0;
  prevHash = h;
  bindView();
  if (KAT) KAT.bind();
}
function bindView() {
  const view = $("#view");
  const sf = $("#sform");
  if (sf) sf.addEventListener("submit", (e) => { e.preventDefault(); const q = $("#q").value.trim(); if (q) location.hash = qs({ q }); $("#q").blur(); });
  view.querySelectorAll(".pc-ph .strip").forEach((st) => {
    const dots = st.parentElement.querySelectorAll(".pc-dots b");
    if (dots.length) st.addEventListener("scroll", () => { const k = Math.round(st.scrollLeft / st.clientWidth); dots.forEach((d, i) => d.classList.toggle("on", i === k)); }, { passive: true });
  });
  const hs = $("#hstrip");
  if (hs && VT_I) { hs.scrollLeft = VT_I * hs.clientWidth; $("#hcnt").textContent = `${VT_I + 1} / ${hs.children.length}`; }
  if ($("#miniMap")) initMini();
  view.querySelectorAll("img.fi").forEach((im) => { if (im.complete && im.naturalWidth) im.classList.add("ok"); });
  if (hs) hs.addEventListener("scroll", () => { $("#hcnt").textContent = `${Math.round(hs.scrollLeft / hs.clientWidth) + 1} / ${hs.children.length}`; }, { passive: true });
}
function curPlace() { const m = location.hash.match(/#\/lokal\/([^?]+)/); return m && BYID[decodeURIComponent(m[1])]; }
function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; $("#app").appendChild(d); setTimeout(() => d.remove(), 2200); }

document.addEventListener("click", (e) => {
  const t = e.target;
  const mf = t.closest("[data-mf]");
  if (mf) {
    const k = mf.dataset.mf, v = mf.dataset.v;
    if (k === "open") MF.open = !MF.open; else MF[k] = MF[k] === v ? null : v;
    const sc = $(".ms-b") && $(".ms-b").scrollTop; refreshMap(); renderSheet(); if ($(".ms-b")) $(".ms-b").scrollTop = sc; return;
  }
  if (t.closest("[data-mfclear]")) { Object.keys(MF).forEach((k) => (MF[k] = k === "open" ? false : null)); refreshMap(); renderSheet(); return; }
  if (t.closest("[data-mfdone]")) { $("#msheet").classList.remove("on"); return; }
  const fav = t.closest("[data-fav]");
  if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(fav.dataset.fav); if (location.hash.startsWith("#/ulubione")) route(); return; }
  if (t.closest("[data-vclose]")) { $("#viewer").hidden = true; $("#viewer").innerHTML = ""; return; }
  const vi = t.closest("[data-vi]");
  if (vi && curPlace()) { openViewer(curPlace(), +vi.dataset.vi); return; }
  const tb = t.closest("[data-tab]");
  if (tb && !tb.closest(".tabbar") && curPlace()) {
    e.preventDefault();
    const k = tb.dataset.tab;
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === k));
    $("#pane").innerHTML = paneFor(curPlace(), k);
    if (k === "info") initMini();
    if (tb.closest(".acts")) $("#tabs").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (t.closest("[data-share]")) {
    const p = curPlace(); if (!p) return;
    const url = new URL("l/" + p.id + ".html", location.href.split("#")[0]).href;
    if (navigator.share) navigator.share({ title: p.name, url }).catch(() => {});
    else { try { navigator.clipboard.writeText(url); toast("Skopiowano link"); } catch (err) {} }
    return;
  }
  const back = t.closest("[data-back]");
  if (back) {
    e.preventDefault();
    const hs = $("#hstrip");
    if (canVT && hs) { document.querySelectorAll('.vt,[style*="view-transition-name"]').forEach((x) => { x.classList.remove("vt"); x.style.viewTransitionName = ""; }); const k = Math.round(hs.scrollLeft / hs.clientWidth), im = hs.children[k]; VT_I = 0; if (im) { im.classList.add("vt"); im.style.viewTransitionName = "ph"; } }
    if (history.length > 1 && prevHashStack.length > 1) history.back(); else { const k = (typeof KATS !== "undefined" ? KATS : []).find((x) => x.mine()); location.hash = k ? "#/" + k.p : "#/restauracje"; } return; }
  const rm = t.closest("[data-rm]");
  if (rm) {
    const k = rm.dataset.rm; const f = { ...S.filters, q: S.q };
    f[k] = null; location.replace(qs({ ...f, open: f.open ? "1" : "" })); return;
  }
  const more = t.closest("[data-more]");
  if (more) { const p = new URLSearchParams(location.hash.split("?")[1] || ""); p.set("n", more.dataset.more); const st = $("#view").scrollTop; history.replaceState(null, "", "#/wyniki?" + p); route(); $("#view").scrollTop = st; return; }
  if (t.closest("[data-open]")) { S.filters.open = !S.filters.open; route(); return; }
  if (t.closest("[data-reset]")) { S.filters = { cuisine: null, vibe: null, occ: null, type: null, open: false }; S.q = ""; route(); return; }
  const pc = t.closest(".pc");
  if (pc) {
    const st = pc.querySelector(".strip");
    VT_I = st ? Math.round(st.scrollLeft / st.clientWidth) : 0; VT_ID = pc.dataset.id;
    if (canVT && st && st.children[VT_I]) { st.children[VT_I].classList.add("vt"); st.children[VT_I].style.viewTransitionName = "ph"; }
    location.hash = "#/lokal/" + encodeURIComponent(pc.dataset.id); return;
  }
});
document.addEventListener("change", (e) => {
  const s = e.target.closest("select[data-f]");
  if (s) { S.filters[s.dataset.f] = s.value || null; route(); }
});
const prevHashStack = [];
const canVT = !!document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches;
let VT_ID = null, VT_I = 0;
function nameShared() {
  document.querySelectorAll('.vt,[style*="view-transition-name"]').forEach((e) => { e.classList.remove("vt"); e.style.viewTransitionName = ""; });
  const h = location.hash;
  let el = null;
  if (/^#\/(lokal\/|[a-z]+\/obiekt\/)/.test(h)) el = document.querySelector(`#hstrip img[data-vi="${VT_I}"]`);
  else if (VT_ID) { const c = document.querySelector(`.pc[data-id="${CSS.escape(VT_ID)}"] .strip img`); el = c; }
  if (el) { el.classList.add("vt"); el.style.viewTransitionName = "ph"; }
}
window.addEventListener("hashchange", () => {
  prevHashStack.push(location.hash);
  if (!canVT) { route(); return; }
  document.startViewTransition(() => { card.n = 0; route(); nameShared(); });
});

/* blokada powiększania: szczypanie i dwuklik poza mapą */
const onMapEl = (t) => t && t.closest && t.closest("#map,.kmap");
["gesturestart", "gesturechange", "gestureend"].forEach((ev) => document.addEventListener(ev, (e) => { if (!onMapEl(e.target)) e.preventDefault(); }, { passive: false }));
document.addEventListener("touchmove", (e) => { if (e.touches.length > 1 && !onMapEl(e.target)) e.preventDefault(); }, { passive: false });

document.addEventListener("load", (e) => { const t = e.target; if (t.tagName === "IMG" && t.classList.contains("fi")) t.classList.add("ok"); }, true);

/* start */
document.querySelectorAll("i[data-ico]").forEach((i) => (i.innerHTML = ico(i.dataset.ico)));
(async function init() {
  const t0 = Date.now();
  try {
    const r = await fetch("data/places.json", { cache: "no-store" });
    DB = await r.json();
  } catch (e) {
    try { const c = await caches.match("data/places.json"); if (c) DB = await c.json(); } catch (e2) {}
  }
  DB.places.forEach((p) => (BYID[p.id] = p));
  const hero = DB.places.find((p) => p.vibes.includes("eleganckie")) || DB.places[0];
  if (!DB.meta.splash && hero) { const im = new Image(); im.referrerPolicy = "no-referrer"; im.src = img(hero.photos[0], 1000, 1600); im.onload = () => ($("#splashBg").style.backgroundImage = `url("${im.src}")`); }
  prevHashStack.push(location.hash || "#/");
  route();
  setTimeout(() => $("#splash").classList.add("out"), Math.max(0, 1400 - (Date.now() - t0)));
})();
/* aktualizacje: przy każdym uruchomieniu i powrocie do aplikacji sprawdza nową wersję */
if ("serviceWorker" in navigator) {
  let reloaded = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
      reg.update().catch(() => {});
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(() => {});
  });
}
/* nowa wersja aplikacji: przy starcie i po powrocie z tła */
async function checkVersion() {
  try {
    const r = await fetch("version.json", { cache: "no-store" });
    const v = (await r.json()).v;
    if (v && v !== APP_V) {
      let tried = null; try { tried = sessionStorage.getItem("gz-reload"); } catch (e) {}
      if (tried === v) return;
      try { sessionStorage.setItem("gz-reload", v); } catch (e) {}
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      if (reg) await reg.update().catch(() => {});
      location.reload();
    }
  } catch (e) {}
}
checkVersion();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkVersion(); });

/* świeże dane po powrocie do aplikacji z tła */
let lastLoad = Date.now();
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState !== "visible" || Date.now() - lastLoad < 10 * 60 * 1000) return;
  try {
    const r = await fetch("data/places.json", { cache: "no-store" });
    if (!r.ok) return;
    DB = await r.json(); BYID = {}; DB.places.forEach((p) => (BYID[p.id] = p));
    lastLoad = Date.now(); route();
  } catch (e) {}
});
