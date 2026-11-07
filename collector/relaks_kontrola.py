"""Kontrola jakości data/relaks.json. Ma pokazać 0 błędów."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(R, "data", "relaks.json")))
rest = {p["id"] for p in json.load(open(os.path.join(R, "data", "places.json")))["places"]}
nocl = {p["id"] for p in json.load(open(os.path.join(R, "data", "noclegi.json")))["places"]}
err, ids, names = [], set(), set()
b = d["meta"]["bounds"]
for p in d["places"]:
    e = lambda m: err.append(f"{p['name']}: {m}")
    if p["id"] in ids: e("powtórzony id")
    ids.add(p["id"])
    if p["kind"] not in ("spa", "masaz", "zabiegi", "sauna", "baseny", "grota", "joga"): e("zły rodzaj")
    if not p["photos"]: e("brak zdjęć")
    if p["dRynek"] > 25000: e("dalej niż 25 km od Rynku")
    if len(p["name"]) > 40: e("za długa nazwa")
    if re.search(r" - |\||Lublin,|  ", p["name"]): e("reklamowa nazwa")
    if p["name"].isupper(): e("nazwa wielkimi literami")
    if not p["desc"] or len(p["desc"]) < 60: e("brak lub za krótki opis")
    if len(p["desc"]) > 400: e("za długi opis")
    if p["descSrc"] not in ("strona", "siec", "opinie"): e("nieznane źródło opisu")
    if not p["category"]: e("brak kategorii")
    if not p["occ"]: e("brak okazji")
    if not p["hoursText"] and not p.get("hoursNote"): e("brak godzin i brak wyjaśnienia")
    if p["rest"] and p["rest"] not in rest: e("restauracja nie istnieje")
    if p["nocl"] and p["nocl"] not in nocl: e("nocleg nie istnieje")
    if (p["rating"] or 0) < 4.0: e(f"niska ocena {p['rating']}")
    if p["reviews"] < 10: e("mniej niż 10 opinii")
    if p["name"].lower() in names: e("powtórzona nazwa")
    names.add(p["name"].lower())
    for x in (p["desc"], p.get("priceText") or "", p["category"]):
        if re.search(r"\s[,.;:]|\s{2,}|\.\.|[a-ząćęłńóśźż]\.[A-ZĄĆĘŁŃÓŚŹŻ]", x): e(f"interpunkcja: {x[:50]}")
print("miejsc:", len(d["places"]), "| błędów:", len(err))
for x in err: print(" -", x)
