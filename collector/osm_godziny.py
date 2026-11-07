"""Uruchamiane na serwerze właściciela: godziny z OpenStreetMap dla lokali bez godzin.
Wypisuje linie G|id|opening_hours do wklejenia Claude'owi."""
import json, urllib.request, urllib.parse, math, re, unicodedata
P = json.load(urllib.request.urlopen("https://lewym90.github.io/gdzie_zjesc/data/places.json", timeout=60))["places"]
L = [(p["id"], p["name"], p["lat"], p["lng"]) for p in P if not p["hoursText"] and p.get("lat")]
q = '[out:json][timeout:90];area["name"="Lublin"]["admin_level"="8"]->.a;nwr(area.a)["opening_hours"]["name"];out center tags;'
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "gdzie-zjesc-prywatna"})
E = json.load(urllib.request.urlopen(req, timeout=120))["elements"]
def n(s): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode())
def dist(a, b, c, d): return math.hypot((a - c) * 111000, (b - d) * 69500)
out = 0
for pid, name, lat, lng in L:
    best = None
    for e in E:
        la = e.get("lat") or e.get("center", {}).get("lat"); lo = e.get("lon") or e.get("center", {}).get("lon")
        if la is None: continue
        dd = dist(lat, lng, la, lo)
        if dd > 120: continue
        a, b = n(name), n(e["tags"]["name"])
        if a and b and (b in a or a in b or a[:6] == b[:6]):
            if best is None or dd < best[0]: best = (dd, e["tags"]["opening_hours"])
    if best: print("G|" + pid + "|" + best[1]); out += 1
print("KONIEC", out, "z", len(L), "osm:", len(E))
