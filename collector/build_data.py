"""Buduje app/data/places.json z data/details.json (+ menu.json jeśli jest)."""
import json, re, os, unicodedata

D = "/home/claude/gz/data"
det = json.load(open(f"{D}/details.json"))
menus = json.load(open(f"{D}/menu.json")) if os.path.exists(f"{D}/menu.json") else {}

def low(s): return (s or "").lower()

CUISINES = [
    ("wloska", "Włoska", r"włosk|pizz|trattori|osteri|pasta|makaron|italian|neapol"),
    ("polska", "Polska", r"polsk|pierog|regionaln|swojsk|karczm|gospod|zajazd"),
    ("azjatycka", "Azjatycka", r"azjat|sushi|japo|chińsk|wietnam|tajsk|ramen|korea|asian|wok|pho|bao|dim sum"),
    ("steakhouse", "Steakhouse", r"stek|steak|grill|wołow|befsztyk|bbq|smokehouse"),
    ("amerykanska", "Amerykańska", r"burger|amerykań|hot dog|american"),
    ("srodziemnomorska", "Śródziemnomorska", r"śródziem|grec|hiszpań|tapas|gruzińsk|chaczapuri|libań|bliskow"),
    ("indyjska", "Indyjska", r"indyjsk|india|curry|tandoor"),
    ("wege", "Wegańska i wege", r"wegań|wegetar|vegan|vege|roślin"),
    ("europejska", "Europejska", r"europejsk|francusk|nowoczesn|autorsk|fusion|fine dining"),
    ("turecka", "Kebab i turecka", r"kebab|turec|döner|doner"),
    ("meksykanska", "Meksykańska", r"meksyk|taco|burrito|tex-mex"),
    ("owocemorza", "Ryby i owoce morza", r"ryb|owoce morza|seafood|krewet|ostryg"),
    ("kawiarnia", "Kawiarnia i desery", r"kawiarn|cukiern|deser|lody|kawa|café|cafe|piekarn|bubble"),
]
TYPES = [
    ("klub", "Klub", r"klub nocny|dyskotek|night club|nightclub|klub muzyczny"),
    ("pub", "Pub", r"\bpub\b|piwiarn|browar|piwo|irish"),
    ("winiarnia", "Winiarnia", r"winiarn|wine bar|bar winny"),
    ("bar", "Bar", r"\bbar\b|koktajl|cocktail|drink"),
    ("kawiarnia", "Kawiarnia", r"kawiarn|cukiern|café|cafe|herbaciarn"),
    ("fastfood", "Szybkie jedzenie", r"fast food|kebab|zapiekank|frytk|hot dog|bar mleczny|food truck"),
    ("restauracja", "Restauracja", r"restaurac|bistro|trattori|pizzeri|sushi|steak|karczm|gospod"),
]
VIBES = {
    "eleganckie": r"elegan|wykwintn|fine dining|szyk|klasa|stylow|wytworn|z klasą|piękn[ey] wnętrz",
    "romantyczne": r"romanty|randk|we dwoje|świec|nastrojow|klimatyczn|intymn",
    "luksusowe": r"luksus|ekskluzyw|degustac|sommelier|tasting|menu degustacyjne|premium|michelin",
    "kameralne": r"kameraln|przytuln|mał[ay] lokal|niewielk|domow[ay] atmosfer|cich",
    "taras": r"ogród|ogródek|taras|na zewnątrz|patio|dach|rooftop|letni",
}
OCC = {
    "randka": r"randk|romanty|we dwoje|z dziewczyn|z żon|z partner|walentyn",
    "rocznica": r"roczni|jubileusz|wyjątkow[a-z]* okazj|świętowa",
    "urodziny": r"urodzin|imprez|grup[aęy]|duż[ae]j? grup|przyjęci|osiemnast",
    "biznesowa": r"biznes|spotkani[ae] służbow|klient|konferenc|hotel|lunch biznes",
}
DAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]

def parse_hours(h):
    out = {}
    for i, d in enumerate(DAYS):
        v = (h or {}).get(d)
        if not v: continue
        if "Zamknięte" in v: out[i] = []; continue
        if "Całą dobę" in v or "24 godziny" in v: out[i] = [[0, 1440]]; continue
        rng = []
        for a, b in re.findall(r"(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})", v):
            f = lambda t: int(t.split(":")[0]) * 60 + int(t.split(":")[1])
            s, e = f(a), f(b)
            if e <= s: e += 1440
            rng.append([s, e])
        out[i] = rng
    return out

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]

places, seen = [], set()
for k, d in det.items():
    if not d.get("name") or d.get("err"): continue
    addr = (d.get("address") or "").strip()
    if d.get("lat") and not (51.13 < d["lat"] < 51.32 and 22.42 < d["lng"] < 22.72):
        continue  # poza Lublinem
    if not d.get("photos"): continue
    cat = d.get("category") or ""
    qs = " ".join(d.get("q", []))
    revs = " ".join(d.get("review_texts", []))
    base = low(f"{d['name']} {cat}")
    full = low(f"{d['name']} {cat} {revs}")
    cz = [cid for cid, _, rx in CUISINES if re.search(rx, base)]
    if not cz:
        for cid, _, rx in CUISINES:
            if re.search(rx, low(qs)) and cid not in ("kawiarnia",): cz.append(cid); break
    lc = low(cat)
    if re.search(r"klub nocny|klub muzyczny|^klub$|dyskotek", lc): typ = "klub"
    elif re.search(r"winiarn|sklep z winem|bar winny", lc): typ = "winiarnia"
    elif re.search(r"^pub|piwiarn|browar", lc): typ = "pub"
    elif re.search(r"kawiarn|cukiern|herbaciarn|lodziarn|piekarn", lc): typ = "kawiarnia"
    elif re.search(r"fast food|kebab|bar mleczny|zapiekank|fish & chips|hot dog|food truck|pierogarnia", lc): typ = "fastfood"
    elif re.search(r"bar koktajlowy|lounge|^bar|bar z|bar sportowy", lc): typ = "bar"
    elif re.search(r"restaurac|kuchnia|bistro|pizzeri|sushi|stek|steki|grill|hamburger|obsługa ślubów|dania", lc): typ = "restauracja"
    else:
        typ = next((tid for tid, _, rx in TYPES if re.search(rx, base)), None) or next((tid for tid, _, rx in TYPES if re.search(rx, low(qs))), "restauracja")
    rating = d.get("rating") or 0; nrev = d.get("reviews") or 0
    vibes = []
    for v, rx in VIBES.items():
        hits = len(re.findall(rx, full))
        if hits >= (1 if v in ("taras", "luksusowe") else 1): vibes.append(v)
    low_end = typ == "fastfood" or bool(re.search(r"kebab|bar mleczny|zapiekank|fast food", base)) or re.search(r"kebab|bar mleczny|zapiekank|fast food|pizzeria na wynos", base)
    if low_end: vibes = [v for v in vibes if v in ("taras",)]
    if typ in ("pub", "klub", "kawiarnia"): vibes = [v for v in vibes if v not in ("eleganckie", "luksusowe")]
    if "luksusowe" in vibes and "eleganckie" not in vibes: vibes.append("eleganckie")
    if typ == "restauracja" and rating >= 4.7 and nrev >= 300 and re.search(r"nowoczesn|autorsk|fine|europejsk|francusk|degust", base) and "eleganckie" not in vibes:
        vibes.append("eleganckie")
    occ = [o for o, rx in OCC.items() if re.search(rx, full)]
    if not low_end and ("romantyczne" in vibes or "eleganckie" in vibes) and "randka" not in occ: occ.append("randka")
    if not low_end and ("eleganckie" in vibes and "luksusowe" in vibes) and "rocznica" not in occ: occ.append("rocznica")
    if low_end: occ = [o for o in occ if o == "urodziny"]
    m = menus.get(k) or {}
    key = (d["name"], addr)
    if key in seen: continue
    seen.add(key)
    places.append({
        "id": slug(d["name"]) + "-" + k.split(":")[1][-5:],
        "name": d["name"], "category": cat, "type": typ, "cuisines": cz,
        "vibes": vibes, "occasions": occ,
        "rating": rating or None, "reviews": nrev or None,
        "address": re.sub(r",?\s*Polska$", "", addr),
        "lat": d.get("lat"), "lng": d.get("lng"),
        "www": d.get("www"), "phone": (d.get("phone") or "").strip() or None,
        "hours": parse_hours(d.get("hours")), "hoursText": d.get("hours") or {},
        "photos": d["photos"][:12],
        "reviewsText": d.get("review_texts", [])[:6],
        "gmaps": d.get("gurl"),
        "menu": m.get("items"), "menuUrl": m.get("url") or d.get("menu_url"), "menuPdf": m.get("pdf"),
        "price": m.get("range"),
    })

# ranking: bayesian score
for p in places:
    r, n = p["rating"] or 0, p["reviews"] or 0
    p["score"] = round((r * n + 4.2 * 50) / (n + 50), 4)
places.sort(key=lambda p: -p["score"])
meta = {
    "city": "Lublin",
    "count": len(places),
    "cuisines": [{"id": c, "label": l, "n": sum(c in p["cuisines"] for p in places)} for c, l, _ in CUISINES],
    "types": [{"id": t, "label": l, "n": sum(p["type"] == t for p in places)} for t, l, _ in TYPES],
}
os.makedirs("/home/claude/gz/app/data", exist_ok=True)
json.dump({"meta": meta, "places": places}, open("/home/claude/gz/app/data/places.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(meta["count"], "lokali")
print({c["id"]: c["n"] for c in meta["cuisines"]})
print({t["id"]: t["n"] for t in meta["types"]})
for v in VIBES: print(v, sum(v in p["vibes"] for p in places))
for o in OCC: print(o, sum(o in p["occasions"] for p in places))
