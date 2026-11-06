"""Kontrola jakości data/places.json. Wypisuje podejrzane wpisy; kod wyjścia 1, jeśli są błędy."""
import json, re, sys, collections
P = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "data/places.json"))["places"]
err, warn = [], []
CHEAP = r"obiad|garmaż|kebab|pizz|burger|fast food|bar mleczny|zapiekan|stołówk|jadłodajn|na wagę|na wynos|catering|smażalni|food truck|kanapk|kurczak"
for p in P:
    t = f"{p['name']} ({p['category']})"
    low = (p["name"] + " " + (p["category"] or "")).lower()
    for v in ("eleganckie", "luksusowe", "romantyczne"):
        if v in p["vibes"] and re.search(CHEAP, low):
            err.append(f"{v} przy taniej kategorii: {t}")
    if "eleganckie" in p["vibes"] and (p["rating"] or 0) < 4.2:
        warn.append(f"eleganckie z niską oceną {p['rating']}: {t}")
    if p["type"] == "fastfood" and p["occasions"]:
        err.append(f"okazja przy szybkim jedzeniu: {t} {p['occasions']}")
    if not p["photos"]:
        err.append(f"brak zdjęć: {t}")
    if not p["address"]:
        warn.append(f"brak adresu: {t}")
    if p["lat"] and not (51.13 < p["lat"] < 51.32 and 22.42 < p["lng"] < 22.72):
        err.append(f"poza Lublinem: {t}")
    if "wloska" in p["cuisines"] and re.search(r"sushi|kebab|polsk|azjat|indyj", low):
        warn.append(f"kuchnia włoska wygląda podejrzanie: {t}")
c = collections.Counter((p["name"].lower(), p["address"]) for p in P)
for (n, a), k in c.items():
    if k > 1: err.append(f"duplikat: {n} / {a}")
for e in err: print("BŁĄD  ", e)
for w in warn: print("UWAGA ", w)
print(f"{len(P)} lokali, błędów: {len(err)}, uwag: {len(warn)}")
sys.exit(1 if err else 0)
