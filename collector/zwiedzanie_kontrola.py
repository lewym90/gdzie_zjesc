"""Kontrola jakości data/zwiedzanie.json. Ma pokazać 0 błędów."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(R, "data", "zwiedzanie.json")))
rest = {p["id"] for p in json.load(open(os.path.join(R, "data", "places.json")))["places"]}
nocl = {p["id"] for p in json.load(open(os.path.join(R, "data", "noclegi.json")))["places"]}
err, ids, names = [], set(), set()
b = d["meta"]["bounds"]
for p in d["places"]:
    e = lambda m: err.append(f"{p['name']}: {m}")
    if p["id"] in ids: e("powtórzony id")
    ids.add(p["id"])
    if p["kind"] not in ("zabytki", "zamki", "muzea", "swiatynie", "pamiec", "przyroda", "nowoczesne", "okolice"): e("zły rodzaj")
    if not p.get("czas"): e("brak czasu zwiedzania")
    if p["dRynek"] > 15000 and p["kind"] != "okolice": e("daleko od centrum, a rodzaj nie 'okolice'")
    if not p["photos"]: e("brak zdjęć")
    if p["dRynek"] > 52000: e("dalej niż 50 km od Rynku")
    if len(p["name"]) > 40: e("za długa nazwa")
    if re.search(r" - |\||Lublin,|  ", p["name"]): e("reklamowa nazwa")
    if p["name"].isupper(): e("nazwa wielkimi literami")
    if not p["desc"] or len(p["desc"]) < 60: e("brak lub za krótki opis")
    if len(p["desc"]) > 420: e("za długi opis")
    if p["descSrc"] not in ("strona", "siec", "opinie"): e("nieznane źródło opisu")
    if not p["category"]: e("brak kategorii")
    if not p["occ"]: e("brak okazji")
    if not p["hoursText"] and not p.get("hoursNote"): e("brak godzin i brak wyjaśnienia")
    if (p["rating"] or 0) < 4.0: e(f"niska ocena {p['rating']}")
    if "darmo" in p["occ"] and p.get("priceText") and not re.search(r"bezpłat|wolny|darmo", p["priceText"] + (p.get("darmowe") or ""), re.I) and not p.get("darmowe"): e("okazja 'za darmo' przy płatnym wstępie")
    if p["reviews"] < 10: e("mniej niż 10 opinii")
    if p["name"].lower() in names: e("powtórzona nazwa")
    names.add(p["name"].lower())
    for x in (p["desc"], p.get("priceText") or "", p["category"], p.get("darmowe") or "", p.get("rezerwacja") or "", p.get("czas") or ""):
        if re.search(r"\s[,.;:]|\s{2,}|\.\.|[a-ząćęłńóśźż]\.[A-ZĄĆĘŁŃÓŚŹŻ]", x): e(f"interpunkcja: {x[:50]}")
print("miejsc:", len(d["places"]), "| błędów:", len(err))
for x in err: print(" -", x)
