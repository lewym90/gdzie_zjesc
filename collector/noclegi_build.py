"""Buduje data/noclegi.json z danych zebranych z Map Google (noclegi_details.json).
Uruchom: python3 collector/noclegi_build.py  (z katalogu repozytorium)"""
import json, re, math, os, unicodedata, sys
R = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(R)
D = "/home/claude/gz/data/noclegi_details.json"
KUR = json.load(open(os.path.join(R, "kuracja_noclegi.json")))
CITY = {"name": "Lublin", "bounds": [51.13, 51.32, 22.42, 22.72], "rynek": (51.2479, 22.5683), "dworzec": (51.2317, 22.5681)}
PRICE_DATE = KUR.get("price_date", "listopad 2026")

def km(a, b):
    r = math.pi / 180
    h = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))

def slug(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ł", "l"))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:40]

LODGE = re.compile(r"hotel|motel|apart|pensjonat|hostel|nocleg|kwater|pokoje|pokój|gościn|zajazd|ośrodek|wypoczyn|schronisk|kemping|camping|śniadaniem|willa|dom wczasowy|zakwaterowanie")
JUNK = re.compile(r"spółdzielnia|nowe mieszkania|deweloper|sprzedaż|długoterminow|real estate|nieruchomo|silta|\btbv\b|akademik|dom studenta|dom akademicki|pracownicze|remont", re.I)
def kind_of(k, name):
    if k and not LODGE.search(k.lower()): return None
    if JUNK.search(name): return None
    k = (k or "").lower(); n = name.lower()
    if "hostel" in n: return "hostel"
    if re.search(r"apart|suite|studio|mieszkani|flat|loft|residence", n) and "hotel" not in n: return "apartament"
    if re.search(r"pensjonat|pokoje|rooms|kwater|gościn|goscin|zajazd|villa|willa|dworek|noclegi|b&b|bed|agroturyst|ośrodek|osrodek", n) and "hotel" not in n: return "pensjonat"
    if "hostel" in k: return "hostel"
    if "apartament" in k or "aparthotel" in k or "mieszkani" in k: return "apartament"
    if re.search(r"pensjonat|pokoje|kwater|gościnn|zajazd|agroturyst|śniadaniem|ośrodek|wypoczyn|schronisk|nocleg|zakwaterowanie", k): return "pensjonat"
    if "hotel" in k or "motel" in k or "hotel" in n or "motel" in n: return "hotel"
    return None

def clean_name(n, gid):
    nz = {k.lower(): v for k, v in KUR.get("nazwy", {}).items()}
    n0 = n
    n = n.lower() if n.lower() in nz else n
    if n in nz: return nz[n]
    n = n0
    if n in nz: return nz[n]
    if "id:" + gid in nz: return nz["id:" + gid]
    n = n.replace("\u200b", "").split(" | ")[0].strip()
    if n.lower() in nz: return nz[n.lower()]
    n = n.replace('"', "").replace("„", "").replace("”", "").strip()
    n = re.sub(r"\s*[|–-]\s*(free parking|parking gratis|24h.*|self check-?in.*)$", "", n, flags=re.I)
    n = re.sub(r",?\s*free parking", "", n, flags=re.I)
    if n.isupper() and len(n) > 6: n = " ".join(w if len(w) <= 3 and w not in ("SPA",) else w.capitalize() for w in n.split())
    return n.strip(" -,")

AMAP = {
    "parking": ["Parking", "Bezpłatny parking", "Płatny parking"],
    "sniadanie": ["Bezpłatne śniadanie"],
    "spa": ["Spa", "Basen", "Kryty basen", "Odkryty basen", "Basen z hydromasażem"],
    "restauracja": ["Restauracja"],
    "zwierzeta": ["Przyjazny zwierzętom"],
    "klima": ["Klimatyzacja"],
    "fitness": ["Centrum fitness"],
    "wifi": ["Bezpłatne Wi-Fi"],
}
LAB2ID = {l: k for k, ls in AMAP.items() for l in ls}
SKIP_EXTRA = {"Dla niepalących", "Wi-Fi", "Płatne Wi-Fi", "Śniadanie", "Płatne śniadanie"}

def main():
    det = json.load(open(D))
    CF = "/home/claude/gz/data/noclegi_ceny.json" if os.path.exists("/home/claude/gz/data/noclegi_ceny.json") else os.path.join(R, "dane", "noclegi_ceny.json")
    CENY = json.load(open(CF)) if os.path.exists(CF) else {}
    rest = json.load(open(os.path.join(REPO, "data", "places.json")))["places"]
    wyk = set(KUR.get("wykluczone", []))
    out, seen, unknown = [], set(), {}
    for gid, d in det.items():
        if not isinstance(d, dict) or d.get("err") or not d.get("name") or not d.get("lat"): continue
        name = clean_name(d["name"].strip(), gid)
        if d["name"].strip() in wyk or ("id:" + gid) in wyk: continue
        if CITY["name"] not in (d.get("address") or ""): continue
        b = CITY["bounds"]
        if not (b[0] < d["lat"] < b[1] and b[2] < d["lng"] < b[3]): continue
        k = kind_of(d.get("kind"), d["name"] + " " + name)
        if not k:
            unknown[d.get("kind")] = unknown.get(d.get("kind"), 0) + 1; continue
        if (d.get("reviews") or 0) < 10 or not d.get("photos"): continue
        if d.get("skip"): continue
        if d.get("price") is None and not d.get("desc") and (d.get("reviews") or 0) < 30: continue
        pid = slug(name) + "-" + gid.split(":")[1][-5:]
        dk = (name.lower(), round(d["lat"], 3), round(d["lng"], 3))
        if pid in seen or dk in seen: continue
        seen.add(pid); seen.add(dk)
        am = d.get("amen") or {}
        amen = sorted({LAB2ID[l] for l, v in am.items() if v and l in LAB2ID}, key=list(AMAP).index)
        extra = [l for l, v in am.items() if v and l not in LAB2ID and l not in SKIP_EXTRA]
        pos = (d["lat"], d["lng"])
        dr = km(pos, CITY["rynek"]) * 1000
        if dr > 12000: continue
        area = []
        if dr <= 650: area.append("stare")
        if dr <= 1600: area.append("centrum")
        if km(pos, CITY["dworzec"]) * 1000 <= 900: area.append("dworzec")
        aname = "Stare Miasto" if dr <= 650 else "Centrum" if dr <= 1600 else ""
        occ = []
        for o in ["romantyczny", "biznes", "rodzina", "spa"]:
            lst = KUR.get(o, [])
            if name in lst or ("id:" + pid) in lst: occ.append(o)
        if "rodzina" not in occ and "Przyjazny dzieciom" in extra and k != "hostel" and (d.get("rating") or 0) >= 4.3 and name not in KUR.get("rodzina_nie", []): occ.append("rodzina")
        if "spa" in amen and "spa" not in occ and name not in KUR.get("spa_nie", []): occ.append("spa")
        # restauracja w obiekcie: lokal z katalogu restauracji w odległości do 60 m z podobną nazwą
        rid = KUR.get("restauracje", {}).get(name)
        if rid is None and "--kandydaci" in sys.argv:
            for r in rest:
                if r.get("lat") and km(pos, (r["lat"], r["lng"])) < 0.06: print("KANDYDAT", pid, "->", r["id"], r["name"])
        www = d.get("www")
        if www and ("booking.com" in www or "facebook.com" in www and False): www = None
        desc = "\n".join(x for x in (d.get("desc") or []) if x)
        revs = [t for t in (d.get("review_texts") or []) if 40 < len(t) < 700]
        priceSrc = descSrc = None
        # cena: tylko jedna miara = noc z piątku na sobotę, 2 osoby (noclegi_ceny.py); inne terminy z Google odrzucamy
        d = dict(d, price=None)
        for dt, opis in KUR.get("ceny_terminy", []):
            c = CENY.get(pid, {}).get(dt, {})
            if c.get("price"): d["price"] = c["price"]; priceSrc = ("termin:" + opis) if opis else None; break
        uz = KUR.get("uzupelnienia", {}).get(name, {})
        if uz:
            if "www" in uz: www = uz["www"]
            if uz.get("desc") and not desc: desc, descSrc = uz["desc"], "strona"
            if uz.get("price") and d.get("price") is None: d = dict(d, price=uz["price"]); priceSrc = "strona"  # tylko cennik za pokój dla 2 osób
            for k2 in ("checkin", "checkout"):
                if uz.get(k2) and not d.get(k2): d = dict(d, **{k2: uz[k2]})
            amen = sorted(set(amen) | set(uz.get("amen", [])), key=list(AMAP).index)
            if "spa" in amen and "spa" not in occ and name not in KUR.get("spa_nie", []): occ.append("spa")
            occ += [o for o in uz.get("occ", []) if o not in occ]
        out.append({
            "id": pid, "name": name, "kind": k, "stars": d.get("stars"),
            "rating": d.get("rating"), "reviews": d.get("reviews") or 0,
            "address": (d.get("address") or "").strip(), "lat": d["lat"], "lng": d["lng"],
            "www": www, "phone": (d.get("phone") or "").strip() or None, "gmaps": d.get("gurl"),
            "photos": d["photos"][:12], "desc": desc, "checkin": d.get("checkin"), "checkout": d.get("checkout"),
            "price": d.get("price"), "priceSrc": priceSrc, "descSrc": descSrc, "amen": amen, "amenAll": extra, "occ": occ, "area": area, "areaName": aname,
            "dRynek": round(dr), "rest": rid, "reviewsText": revs[:8],
        })
    out.sort(key=lambda p: -(p["rating"] or 0) * math.log10(p["reviews"] + 10))
    bdir = os.path.join(REPO, "img", "banery")
    meta = {"banners": sorted(f[:-4] for f in os.listdir(bdir) if f.endswith(".jpg") and (f.startswith("kat-") or f.startswith("nocleg-"))), "city": CITY["name"], "bounds": CITY["bounds"], "priceDate": PRICE_DATE,
            "kinds": {k: sum(1 for p in out if p["kind"] == k) for k in ["hotel", "apartament", "pensjonat", "hostel"]}}
    json.dump({"meta": meta, "places": out}, open(os.path.join(REPO, "data", "noclegi.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("obiekty:", len(out), meta["kinds"])
    if unknown: print("nieznane rodzaje (pominięte):", unknown)

if __name__ == "__main__":
    main()
