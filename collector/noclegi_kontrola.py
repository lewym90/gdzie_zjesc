"""Kontrola jakości data/noclegi.json. Ma pokazać 0 błędów."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(R, "data", "noclegi.json")))
rest = {p["id"] for p in json.load(open(os.path.join(R, "data", "places.json")))["places"]}
err = []
ids, names = set(), {}
b = d["meta"]["bounds"]
for p in d["places"]:
    e = lambda m: err.append(f"{p['name']}: {m}")
    if p["id"] in ids: e("powtórzony id")
    ids.add(p["id"])
    if p["kind"] not in ("hotel", "apartament", "pensjonat", "hostel"): e("zły rodzaj")
    if not p["photos"]: e("brak zdjęć")
    if not (b[0] < p["lat"] < b[1] and b[2] < p["lng"] < b[3]): e("poza miastem")
    if "Lublin" not in p["address"]: e("adres spoza miasta")
    if len(p["name"]) > 40: e("za długa nazwa")
    if re.search(r"tanie|do wynajęcia|free parking|[|]|  ", p["name"], re.I): e("reklamowa nazwa")
    if p["name"].isupper(): e("nazwa wielkimi literami")
    if p["price"] is not None and not (50 <= p["price"] <= 3000): e(f"dziwna cena {p['price']}")
    if p["stars"] is not None and not (1 <= p["stars"] <= 5): e("gwiazdki")
    if p["rest"] and p["rest"] not in rest: e("restauracja nie istnieje")
    for o in p["occ"]:
        if o not in ("romantyczny", "biznes", "rodzina", "spa"): e("nieznana okazja")
    k = (p["name"].lower(), round(p["lat"], 3), round(p["lng"], 3))
    if k in names: e("duplikat")
    names[k] = 1
print("obiektów:", len(d["places"]), "| błędów:", len(err))
for x in err: print(" -", x)
