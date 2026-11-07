"""Buduje data/rozrywka.json z danych z Map Google (rozrywka_details.json) i ręcznej kuracji (kuracja_rozrywka.json).
Uruchom z katalogu repozytorium: python3 collector/rozrywka_build.py [--przeglad]"""
import json, re, math, os, sys, unicodedata
R = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(R)
D = "/home/claude/gz/data/rozrywka_details.json"
if not os.path.exists(D): D = os.path.join(R, "dane", "rozrywka_details.json")
KUR = json.load(open(os.path.join(R, "kuracja_rozrywka.json")))
DAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]
def parse_hours(h):  # ta sama logika co w build_data.py
    out = {}
    for i, d in enumerate(DAYS):
        v = (h or {}).get(d)
        if not v: continue
        if "Zamknięte" in v: out[i] = []; continue
        if re.search(r"całą dobę|24 godziny", v, re.I): out[i] = [[0, 1440]]; continue
        rng = []
        for a, b in re.findall(r"(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})", v):
            f = lambda t: int(t.split(":")[0]) * 60 + int(t.split(":")[1])
            s, e = f(a), f(b)
            if e <= s: e += 1440
            rng.append([s, e])
        out[i] = rng
    return out
CITY = {"name": "Lublin", "bounds": [51.13, 51.32, 22.42, 22.72], "rynek": (51.2479, 22.5683)}

def km(a, b):
    r = math.pi / 180
    h = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))
def slug(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ł", "l"))
    return re.sub(r"[^a-z0-9]+", "-", "".join(c for c in s if not unicodedata.combining(c))).strip("-")[:40]

# kategoria Google -> grupa; kolejność ma znaczenie
GRUPY = [
    ("kino", r"^kino|teatr|filharmoni|opera|kabaret|komedi|stand-?up|sala koncertowa|amfiteatr|centrum kultury|dom kultury|operetk"),
    ("woda", r"aquapark|park wodny|basen|pływalni|kąpielisk|termy"),
    ("gry", r"escape|pokój zagadek|zagadk|wirtualn|\bvr\b|salon gier|gier wideo|automat|arkad|planszow|symulator"),
    ("dzieci", r"sala zabaw|plac zabaw|zabaw dla dzieci|centrum nauki|dla dzieci|klub malucha|park dinozaurów|centrum edukacyjne"),
    ("ruch", r"kręgiel|bilard|trampolin|wspinacz|ścianka|park linowy|tor kartingowy|karting|gokart|laser|paintball|lodowisk|minigolf|mini golf|golf|strzeln|dart|park rozrywki|centrum rozrywki|park przygód|bowling"),
    ("wieczor", r"karaoke|klub muzyczny|klub jazzowy|muzyka na żywo|sala koncertowa|klub koncertowy"),
]
NA_ZEWNATRZ = r"park linowy|paintball|kąpielisk|amfiteatr|plac zabaw(?! kryty)|tor kartingowy zewn|park dinozaurów|park przygód|minigolf zewn"

def fotki(name, ph):
    z = KUR.get("zdjecia", {}).get(name)
    if not z: return ph
    first = ph[z["pierwsze"]] if "pierwsze" in z and z["pierwsze"] < len(ph) else None
    out = [u for i, u in enumerate(ph) if i not in z.get("usun", []) and u != first]
    return ([first] if first else []) + out

def main():
    det = json.load(open(D))
    rest = json.load(open(os.path.join(REPO, "data", "places.json")))["places"]
    wyk = set(KUR.get("wykluczone", []))
    out, seen, nieznane = [], set(), {}
    for gid, d in det.items():
        if not isinstance(d, dict) or d.get("err") or d.get("skip") or not d.get("name") or not d.get("lat"): continue
        raw = d["name"].strip()
        if raw in wyk or "id:" + gid in wyk: continue
        if CITY["name"] not in (d.get("address") or ""): continue
        b = CITY["bounds"]
        if not (b[0] < d["lat"] < b[1] and b[2] < d["lng"] < b[3]): continue
        if (d.get("reviews") or 0) < 10 or not d.get("photos"): continue
        cat = (d.get("category") or d.get("kind") or "").strip(" ·")
        ov = KUR.get("grupa", {}).get(raw)
        kind = ov
        if not kind:
            for g, rx in GRUPY:
                if re.search(rx, cat.lower()) or (g in ("gry", "ruch", "dzieci") and re.search(rx, raw.lower())): kind = g; break
        if not kind:
            nieznane[cat] = nieznane.get(cat, 0) + 1; continue
        name = KUR.get("nazwy", {}).get(raw, raw)
        for ka, nn in KUR.get("nazwy_adres", {}).items():
            a1, a2 = ka.split("|")
            if raw == a1 and a2 in (d.get("address") or ""): name = nn
        pid = slug(name) + "-" + gid.split(":")[1][-5:]
        dk = (name.lower(), round(d["lat"], 3), round(d["lng"], 3))
        if pid in seen or dk in seen: continue
        seen.add(pid); seen.add(dk)
        pos = (d["lat"], d["lng"]); dr = km(pos, CITY["rynek"]) * 1000
        uz = KUR.get("uzupelnienia", {}).get(name, {})
        indoor = uz.get("indoor")
        if indoor is None:
            indoor = False if re.search(NA_ZEWNATRZ, (cat + " " + raw).lower()) else True
        occ = [o for o in ["dzieci", "randka", "znajomi", "firma", "urodziny", "deszcz"] if name in KUR.get(o, [])]
        if indoor and "deszcz" not in occ and name not in KUR.get("deszcz_nie", []) and kind != "wieczor": occ.append("deszcz")
        www = d.get("www")
        if www:
            www = re.sub(r"[?&](utm_[^&]*|fbclid=[^&]*)", "", www)
            if "?" not in www and "&" in www: www = www.replace("&", "?", 1)
            www = www.rstrip("?&")
        if "www" in uz: www = uz["www"]
        attrs = [a for a, v in (d.get("amen") or {}).items() if v]
        info = d.get("info") or []
        hours = d.get("hours") or {}
        out.append({
            "id": pid, "name": name, "kind": kind, "category": KUR.get("kategorie", {}).get(raw) or KUR.get("kategorie", {}).get(cat) or cat or None,
            "rating": d.get("rating"), "reviews": d.get("reviews") or 0,
            "address": (d.get("address") or "").strip(), "lat": d["lat"], "lng": d["lng"],
            "www": www, "phone": re.sub(r"^[^\d+]+", "", d.get("phone") or "").strip() or None, "gmaps": d.get("gurl"),
            "photos": fotki(name, d["photos"])[:12], "desc": uz.get("desc", ""), "descSrc": uz.get("zrodlo", "strona") if uz.get("desc") else None,
            "priceText": uz.get("cena"), "link": uz.get("link"), "age": uz.get("wiek"),
            "hours": parse_hours(hours), "hoursText": hours,
            "indoor": indoor, "occ": occ, "attrs": attrs[:6], "dRynek": round(dr),
            "areaName": "Stare Miasto" if dr <= 650 else "Centrum" if dr <= 1600 else "",
            "rest": KUR.get("restauracje", {}).get(name), "reviewsText": [t for t in (d.get("review_texts") or []) if 40 < len(t) < 700][:8],
        })
    # miejsca z Restauracji, które pasują też tutaj (np. kluby w grupie „Wieczorem”)
    have = {p["name"].lower() for p in out}
    occ_r = KUR.get("z_restauracji_okazje", {})
    for grupa, spec in KUR.get("z_restauracji", {}).items():
        for r in rest:
            if r["name"].lower() in have or r["name"] in KUR.get("wykluczone_z_restauracji", []): continue
            if not (r.get("type") in spec.get("typy", []) or r["name"] in spec.get("nazwy", [])): continue
            dr = km((r["lat"], r["lng"]), CITY["rynek"]) * 1000 if r.get("lat") else None
            occ = [o for o, lst in occ_r.items() if "*" in lst or r["name"] in lst]
            nm = KUR.get("nazwy", {}).get(r["name"], r["name"])
            occ += [o for o in ["dzieci", "randka", "znajomi", "firma", "urodziny"] if nm in KUR.get(o, []) and o not in occ]
            out.append({
                "id": "r-" + r["id"], "name": KUR.get("nazwy", {}).get(r["name"], r["name"]), "kind": grupa, "category": KUR.get("kategorie_rest", {}).get(r["name"]) or r.get("category") or "Klub",
                "rating": r.get("rating"), "reviews": r.get("reviews") or 0, "address": r.get("address") or "",
                "lat": r.get("lat"), "lng": r.get("lng"), "www": r.get("www"), "phone": re.sub(r"^[^\d+]+", "", r.get("phone") or "").strip() or None, "gmaps": r.get("gmaps"),
                "photos": r["photos"][:12], "desc": "", "descSrc": None, "priceText": None, "link": None, "age": None,
                "hours": r.get("hours") or {}, "hoursText": r.get("hoursText") or {}, "indoor": True, "occ": occ, "attrs": [],
                "dRynek": round(dr) if dr is not None else None, "areaName": ("Stare Miasto" if dr <= 650 else "Centrum" if dr <= 1600 else "") if dr is not None else "",
                "rest": r["id"], "fromRest": True, "reviewsText": (r.get("reviewsText") or [])[:8],
            })
            have.add(r["name"].lower())
    # ręczne uzupełnienia (opis, cena, godziny) także dla miejsc z Restauracji
    SKR = {"pon": 0, "wt": 1, "śr": 2, "czw": 3, "pt": 4, "sob": 5, "nd": 6}
    def godziny(txt):  # "pon–pt 10:00–20:00, sob–nd 9:00–21:00" -> słownik jak z Map
        h = {}
        for czesc in re.split(r",\s*(?=[a-zś]{2,3}\b)", txt):
            m = re.match(r"([a-zś]{2,3})(?:\s*[–-]\s*([a-zś]{2,3}))?\s+(.+)", czesc.strip())
            if not m: continue
            a, b = SKR[m[1]], SKR[m[2] or m[1]]
            for i in range(a, b + 1): h[DAYS[i]] = "Zamknięte" if "zamk" in m[3].lower() else re.sub(r"\b(\d):", r"0\1:", m[3].strip())
        return h
    for p in out:
        uz = KUR.get("uzupelnienia", {}).get(p["name"], {})
        if uz.get("desc") and not p["desc"]: p["desc"], p["descSrc"] = uz["desc"], uz.get("zrodlo", "strona")
        if uz.get("cena") and not p["priceText"]: p["priceText"] = uz["cena"]
        if uz.get("godziny"):
            h = godziny(uz["godziny"]); p["hoursText"], p["hours"] = h, parse_hours(h)
    for p in out: p["tags"] = KUR.get("tagi", {}).get(p["category"] or "", "")
    out.sort(key=lambda p: -(p["rating"] or 0) * math.log10(p["reviews"] + 10))
    bdir = os.path.join(REPO, "img", "banery")
    meta = {"city": CITY["name"], "bounds": CITY["bounds"],
            "banners": sorted(f[:-4] for f in os.listdir(bdir) if f.endswith(".jpg") and (f.startswith("kat-") or f.startswith("rozrywka-"))),
            "kinds": {g: sum(1 for p in out if p["kind"] == g) for g, _ in GRUPY}}
    json.dump({"meta": meta, "places": out}, open(os.path.join(REPO, "data", "rozrywka.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("miejsc:", len(out), meta["kinds"])
    if "--przeglad" in sys.argv:
        print("pominięte kategorie:", sorted(nieznane.items(), key=lambda x: -x[1]))
        for p in out: print(f"{p['kind']:7} | {p['name']} | {p['category']} | {p['rating']}({p['reviews']}) | {p['dRynek']}m")

if __name__ == "__main__":
    main()
