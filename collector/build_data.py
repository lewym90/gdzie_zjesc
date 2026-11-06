"""Buduje app/data/places.json z data/details.json (+ menu.json jeśli jest)."""
import json, re, os, unicodedata

D = "/home/claude/gz/data"
det = json.load(open(f"{D}/details.json"))
KUR = json.load(open("/home/claude/gdzie_zjesc/collector/kuracja.json"))["listy"]
WYK = [x.lower() for x in json.load(open("/home/claude/gdzie_zjesc/collector/wykluczone.json"))["nazwy"]]
menus = json.load(open(f"{D}/menu.json")) if os.path.exists(f"{D}/menu.json") else {}

def low(s): return (s or "").lower()

CUISINES = [
    ("wloska", "Włoska", r"włosk|pizz|trattori|osteri|pasta|makaron|italian|neapol"),
    ("polska", "Polska", r"polsk|pierog|regionaln|swojsk|karczm|gospod|zajazd"),
    ("azjatycka", "Azjatycka", r"azjat|sushi|japo|chińsk|wietnam|tajsk|ramen|korea|asian|wok|pho|bao|dim sum"),
    ("steakhouse", "Steakhouse", r"stek|steak|grill|wołow|befsztyk|bbq|smokehouse"),
    ("amerykanska", "Amerykańska", r"burger|amerykań|hot dog|american"),
    ("srodziemnomorska", "Śródziemnomorska", r"śródziem|grec|hiszpań|tapas|libań|bliskow|arabsk"),
    ("wschodnia", "Wschodnia", r"gruzińsk|chaczapuri|kaukask|armeńsk|ormiańsk|ukraińsk|żydowsk|tatarsk|kresow|wschodni"),
    ("indyjska", "Indyjska", r"indyjsk|india|curry|tandoor"),
    ("wege", "Wegańska i wege", r"wegań|wegetar|vegan|vege|roślin"),
    ("europejska", "Europejska", r"europejsk|francusk|nowoczesn|autorsk|fusion|fine dining"),
    ("turecka", "Kebab", r"kebab|turec|döner|doner"),
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
    "eleganckie": r"elegan|wykwintn|fine dining|szykown|wytworn|z klasą|wysok[aiey]j? klas|ekskluzyw|perfekcyjn[ae] obsług",
    "romantyczne": r"romanty|randk|we dwoje|świec|nastrojow|klimatyczn|intymn",
    "luksusowe": r"luksus|ekskluzyw|degustac|sommelier|tasting|menu degustacyjne|premium|michelin",
    "kameralne": r"kameraln|przytuln|mał[ay] lokal|niewielk|domow[ay] atmosfer|cich",
    "taras": r"ogródek|ogródku|taras|patio|rooftop|na dachu|ogrodzie",
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

def menu_ok(items):
    if not items: return None
    JUNK = r"cena|zamów|zamow|original price|current price|dostaw|wesel|przyjęci|osoby dorosłe|promocj|gratis|oferta|all day|poznaj|kawa miesiąca|koszyk|dodaj do|^zestaw z frytkami|kosztuj|regulamin|\d+\s*g\b|rezerwac|voucher|bon |ślub|propozycja|poprawiny|kawa ziarnista|zestaw startowy|^i+ –"
    from collections import Counter
    items = [{**it, "name": it.get("name", "").replace("\ufeff", "").strip()} for it in items]
    nc = Counter(it.get("name", "").lower() for it in items)
    items = [it for it in items if not re.search(JUNK, it.get("name", "").lower()) and nc[it.get("name", "").lower()] <= 2]
    if len(items) < 8: return None
    good = 0
    for it in items:
        n = it.get("name", "")
        if (3 <= len(n) <= 60 and "(cid" not in n and not re.search(r"\d+\s*(zł|,00)|\d{2,}\s*$", n)
                and re.match(r"[A-ZŁŚŻŹĆŃÓĘĄ0-9„\"']", n) and sum(c.isalpha() for c in n) / max(1, len(n)) > 0.7):
            good += 1
    if good / len(items) < 0.9: return None
    cats = [it.get("cat") for it in items if it.get("cat")]
    cc = Counter(cats)
    cats_ok = 2 <= len(cc) <= 25 and all(len(c) <= 32 and n >= 2 and not c[0].islower() for c, n in cc.items())
    return [{k: v for k, v in it.items() if k != "cat" or cats_ok} for it in items]

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
    if not cz and not cat:
        for cid, _, rx in CUISINES:
            if re.search(rx, low(qs)) and cid not in ("kawiarnia",): cz.append(cid); break
    lc = low(cat)
    if re.search(r"mcdonald|\bkfc\b|burger king|subway|pizza hut|north fish", low(d["name"])): lc = "fast food"
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
    hits = {v: len(re.findall(rx, full)) for v, rx in VIBES.items()}
    GASTRO = r"restaurac|kuchnia|pizz|kebab|kawiarn|\bbar|sushi|bistro|\bpub|fast food|klub|dyskotek|hamburger|lounge|piekarn|lodziarn|cukiern|stek|pierogarn|ramen|grill|herbaciarn|jadłodajn|knajp|dania|browar|winiarn|wino|fish|kanapk|kafeteria|zdrowa żywność|strefa gastronom|kurczak|hot pot|palarnia kawy|jedzenie|ryotei"
    if cat and not re.search(GASTRO, lc): continue
    if any(x in d["name"].lower() for x in WYK): continue
    if not d.get("rating") or (d.get("reviews") or 0) < 5: continue
    if re.search(r"eyebrow|brwi|beauty|salon|striptiz|erotyk|go-go|sklep|piekarnia$|^piekarnia|catering dietetyczny|dieta pudełkowa", lc + " " + low(d["name"])): continue
    if re.search(r"gdladder|youtube\.|twitch\.|tiktok\.|roblox|steamcommunity|discord\.", low(d.get("www"))): continue
    if re.search(r"geometry dash|minecraft|fortnite|among us|click pattern|extreme demon", full): continue
    if re.search(r"obsługa ślubów|organizator|escape|centrum kultury|dom kultury|catering|mobilny bar|usługi barmańskie|klub studencki|chatka żaka|basketon|kręgiel|zdrovo|analiza składu", lc + " " + low(d["name"])): continue
    nongastro = bool(re.search(r"sala weselna|dom weselny|catering|hotel|centrum rozrywki|kasyno|kręgiel|sklep(?! z winem)", lc)) or (not cat and not re.search(r"restaurac", low(d["name"])))
    if nongastro: continue
    low_end = typ == "fastfood" or bool(re.search(r"kebab|bar mleczny|zapiekank|fast food|pizzeri|obiad|garmaż|stołówk|jadłodajn|na wagę|na wynos", base))
    nm = d["name"].lower()
    cur = lambda key: any(x.lower() in nm for x in KUR.get(key, []))
    strong = bool(re.search(r"ekskluzywn|fine dining", lc))
    vibes = [v for v in ("eleganckie", "romantyczne", "luksusowe", "kameralne") if cur(v) or (strong and v in ("eleganckie", "luksusowe"))]
    if hits["taras"] >= 1 and not low_end: vibes.append("taras")
    occ = []
    if not low_end and ("romantyczne" in vibes or "eleganckie" in vibes): occ.append("randka")
    if "eleganckie" in vibes and ("romantyczne" in vibes or "luksusowe" in vibes): occ.append("rocznica")
    if not low_end and typ in ("restauracja", "pub", "klub", "bar") and rating >= 4.4 and nrev >= 300 and len(re.findall(OCC["urodziny"], full)) >= 1: occ.append("urodziny")
    if cur("biznesowa"): occ.append("biznesowa")
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
        "menu": None if str(m.get("zrodlo", "")).startswith("pdf") else menu_ok(m.get("items")),
        "menuUrl": None if str(m.get("zrodlo", "")).startswith("pdf") else (m.get("url") or d.get("menu_url")),
        "menuPdf": m.get("pdf"),
        "price": m.get("range") if (menu_ok(m.get("items")) and not str(m.get("zrodlo", "")).startswith("pdf")) else None,
    })

# ranking: bayesian score
for p in places:
    r, n = p["rating"] or 0, p["reviews"] or 0
    p["score"] = round((r * n + 4.2 * 50) / (n + 50), 4)
places.sort(key=lambda p: -p["score"])
TD = "/home/claude/gdzie_zjesc/img/kafle"
tiles = sorted(f[:-4] for f in os.listdir(TD) if f.endswith(".jpg")) if os.path.isdir(TD) else []
splash = os.path.exists("/home/claude/gdzie_zjesc/img/start.jpg")
meta = {
    "city": "Lublin", "tiles": tiles, "splash": splash,
    "count": len(places),
    "cuisines": [{"id": c, "label": l, "n": sum(c in p["cuisines"] for p in places)} for c, l, _ in CUISINES],
    "types": [{"id": t, "label": l, "n": sum(p["type"] == t for p in places)} for t, l, _ in TYPES],
}
os.makedirs("/home/claude/gdzie_zjesc/data", exist_ok=True)
json.dump({"meta": meta, "places": places}, open("/home/claude/gdzie_zjesc/data/places.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(meta["count"], "lokali")
print({c["id"]: c["n"] for c in meta["cuisines"]})
print({t["id"]: t["n"] for t in meta["types"]})
for v in VIBES: print(v, sum(v in p["vibes"] for p in places))
for o in OCC: print(o, sum(o in p["occasions"] for p in places))
