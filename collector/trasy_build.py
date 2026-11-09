"""Buduje data/trasy.json z collector/kuracja_trasy.json.
Przystanki to odwołania do obiektów z data/zwiedzanie.json (zw), data/zakupy.json (zk) i data/places.json (r) – dane obiektu
(nazwa, zdjęcie, godziny, cena) kopiujemy z tych plików, więc najpierw zbuduj kategorie.
Odcinki między przystankami liczy darmowy OSRM (routing.openstreetmap.de): pieszo, a powyżej 1,5 km w linii prostej – autem.
Wyniki OSRM są zapisywane w collector/dane/trasy_osrm.json, żeby ponowne budowanie nie odpytywało serwera.
Uruchom z katalogu repozytorium: python3 collector/trasy_build.py"""
import json, math, os, re, time, urllib.request
R = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(R)
KUR = json.load(open(os.path.join(R, "kuracja_trasy.json")))
CACHE_F = os.path.join(R, "dane", "trasy_osrm.json")
os.makedirs(os.path.dirname(CACHE_F), exist_ok=True)
CACHE = json.load(open(CACHE_F)) if os.path.exists(CACHE_F) else {}
SRC = {"zw": "data/zwiedzanie.json", "zk": "data/zakupy.json", "r": "data/places.json"}
DB = {k: {p["id"]: p for p in json.load(open(os.path.join(REPO, v)))["places"]} for k, v in SRC.items()}
CITY = {"name": "Lublin", "bounds": [51.13, 51.32, 22.42, 22.72]}
KINDS = ["pierwszy", "weekend", "dzieci", "deszcz", "wieczor", "okolice", "historia", "smaki"]
CZAS_DOM = {"zk": 20, "r": {"restauracja": 75, "kawiarnia": 20, "fastfood": 30}}

def km(a, b):
    r = math.pi / 180
    h = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))

def osrm(a, b, mode):
    key = f"{mode}:{a[0]:.6f},{a[1]:.6f};{b[0]:.6f},{b[1]:.6f}"
    if key not in CACHE:
        url = f"https://routing.openstreetmap.de/routed-{mode}/route/v1/{'foot' if mode == 'foot' else 'driving'}/{a[1]},{a[0]};{b[1]},{b[0]}?overview=full&geometries=geojson"
        for i in range(4):
            try:
                d = json.load(urllib.request.urlopen(url, timeout=30))
                if d.get("code") == "Ok": break
            except Exception as e:
                d = {"err": str(e)}
            time.sleep(2 + 3 * i)
        rt = d["routes"][0]
        CACHE[key] = {"m": round(rt["distance"]), "s": round(rt["duration"]), "g": [[round(y, 5), round(x, 5)] for x, y in rt["geometry"]["coordinates"]]}
        json.dump(CACHE, open(CACHE_F, "w"))
        time.sleep(1)
    return CACHE[key]

def thin(g, eps=0.00004):  # upraszczanie linii (Douglas–Peucker), żeby plik był mały
    if len(g) < 3: return g
    a, b = g[0], g[-1]
    def dist(p):
        if a == b: return math.hypot(p[0] - a[0], p[1] - a[1])
        return abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]) / math.hypot(b[0] - a[0], b[1] - a[1])
    i, dm = max(((i, dist(p)) for i, p in enumerate(g[1:-1], 1)), key=lambda x: x[1])
    if dm < eps: return [a, b]
    return thin(g[: i + 1], eps)[:-1] + thin(g[i:], eps)

def czas_min(t):
    t = (t or "").replace(",", ".")
    m = re.findall(r"(\d+(?:\.\d+)?)\s*(h|godz|min)", t)
    if not m: return 60
    v, u = m[0]; v = float(v)
    if re.search(r"\d\s*–\s*\d", t) and u != "min":  # "2–3 h" -> dolna wartość na plan dnia
        v = float(re.findall(r"\d+(?:\.\d+)?", t)[0])
    return round(v * 60 if u in ("h", "godz") else v)

def stop(ref, s):
    cat, oid = ref.split(":", 1)
    p = DB[cat].get(oid)
    if not p: raise SystemExit(f"BRAK obiektu {ref}")
    o = {"cat": cat, "id": oid, "name": p["name"], "lat": p["lat"], "lng": p["lng"], "photo": (p.get("photos") or [None])[0],
         "rating": p.get("rating"), "reviews": p.get("reviews"), "hours": p.get("hours") or {}, "hoursText": p.get("hoursText") or {},
         "hoursNote": p.get("hoursNote"), "note": s["note"], "address": p.get("address")}
    if cat == "zw":
        o["label"] = p.get("category"); o["czasTxt"] = p.get("czas"); o["czas"] = czas_min(p.get("czas")); o["price"] = p.get("priceText")
    elif cat == "zk":
        o["label"] = p.get("category"); o["czas"] = CZAS_DOM["zk"]
    else:
        o["label"] = p.get("category"); o["czas"] = CZAS_DOM["r"].get(p.get("type"), 60)
    if s.get("czas"): o["czas"] = s["czas"]
    if s.get("lunch"): o["lunch"] = True
    return o

def lunch(st, used, wieczor):
    typy = {"restauracja"} | ({"winiarnia", "bar", "pub"} if wieczor else set())
    c = [p for p in DB["r"].values() if p.get("type") in typy and p["id"] not in used and (p.get("rating") or 0) >= 4.5 and (p.get("reviews") or 0) >= 300
         and km((st["lat"], st["lng"]), (p["lat"], p["lng"])) <= 0.35]
    c.sort(key=lambda p: -float(p.get("score") or 0))
    return [{"id": p["id"], "name": p["name"], "label": p.get("category"), "photo": (p.get("photos") or [None])[0], "rating": p.get("rating"),
             "reviews": p.get("reviews"), "hours": p.get("hours") or {}, "hoursText": p.get("hoursText") or {}, "m": round(km((st["lat"], st["lng"]), (p["lat"], p["lng"])) * 1000)} for p in c[:4]]

out = []
for t in KUR["trasy"]:
    assert t["kind"] in KINDS, t["kind"]
    used = {s["ref"].split(":", 1)[1] for d in t["days"] for s in d["stops"]}
    days, allm, alls, visit, nst, car = [], 0, 0, 0, 0, False
    for d in t["days"]:
        sts = [stop(s["ref"], s) for s in d["stops"]]
        prev = (t["start"]["lat"], t["start"]["lng"]) if t.get("start") and not days else None
        for i, s in enumerate(sts):
            a = prev if i == 0 else (sts[i - 1]["lat"], sts[i - 1]["lng"])
            if a:
                mode = "car" if km(a, (s["lat"], s["lng"])) > 1.5 else "foot"
                r = osrm(a, (s["lat"], s["lng"]), mode)
                s["leg"] = {"mode": mode, "m": r["m"], "min": max(1, round(r["s"] / 60)), "g": thin(r["g"])}
                car |= mode == "car"; allm += r["m"]; alls += r["s"]
            visit += s["czas"]; nst += 1
            if s.get("lunch"): s["eat"] = lunch(s, used, t["kind"] == "wieczor")
        days.append({"title": d["title"], "stops": sts})
    tr = {k: t[k] for k in ("id", "kind", "title", "sub", "intro", "tips")}
    if t.get("start"): tr["start"] = t["start"]
    tr.update({"days": days, "mode": "car" if t["kind"] == "okolice" else "foot", "mixed": car and t["kind"] != "okolice",
               "dist": allm, "move": round(alls / 60), "visit": visit, "n": nst})
    out.append(tr)
    print(f"{tr['id']:22} {nst:2} przyst. {allm/1000:5.1f} km  ruch {tr['move']:4} min  zwiedzanie {visit:4} min  " + " ".join(str(len(s.get('eat', []))) for d in days for s in d['stops'] if s.get('lunch')))

ban = sorted(f[:-4] for f in os.listdir(os.path.join(REPO, "img", "banery")) if f.startswith(("trasy-", "kat-trasy")))
json.dump({"meta": {"city": CITY["name"], "bounds": CITY["bounds"], "count": len(out), "banners": ban}, "places": out},
          open(os.path.join(REPO, "data", "trasy.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print("zapisano", len(out), "tras")
