"""Kontrola jakości data/rozrywka.json. Ma pokazać 0 błędów."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(R, "data", "rozrywka.json")))
rest = {p["id"] for p in json.load(open(os.path.join(R, "data", "places.json")))["places"]}
err, ids, names = [], set(), set()
b = d["meta"]["bounds"]
for p in d["places"]:
    e = lambda m: err.append(f"{p['name']}: {m}")
    if p["id"] in ids: e("powtórzony id")
    ids.add(p["id"])
    if p["kind"] not in ("kino", "ruch", "gry", "woda", "dzieci", "wieczor"): e("zły rodzaj")
    if not p["photos"]: e("brak zdjęć")
    if not (b[0] < p["lat"] < b[1] and b[2] < p["lng"] < b[3]): e("poza miastem")
    if len(p["name"]) > 40: e("za długa nazwa")
    if re.search(r" - |\||Lublin,|  ", p["name"]): e("reklamowa nazwa")
    if p["name"].isupper(): e("nazwa wielkimi literami")
    if p["indoor"] not in (True, False): e("brak informacji pod dachem / na zewnątrz")
    if p["rest"] and p["rest"] not in rest: e("restauracja nie istnieje")
    for o in p["occ"]:
        if o not in ("dzieci", "randka", "znajomi", "firma", "urodziny", "deszcz"): e("nieznana okazja")
    if p["name"].lower() in names: e("powtórzona nazwa")
    names.add(p["name"].lower())
print("miejsc:", len(d["places"]), "| błędów:", len(err))
for x in err: print(" -", x)
