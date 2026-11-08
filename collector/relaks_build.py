"""Buduje data/relaks.json. Wchodzą tylko miejsca opisane ręcznie w kuracja_relaks.json → "miejsca" (klucz: id miejsca z Map Google).
Dane z Map (ocena, adres, telefon, zdjęcia, godziny) bierzemy z relaks_details.json; opis, rodzaj, okazje, ceny i udogodnienia – z kuracji.
Uruchom z katalogu repozytorium: python3 collector/relaks_build.py"""
import json, re, math, os, unicodedata
R = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(R)
D = "/home/claude/gz/data/relaks_details.json"
if not os.path.exists(D): D = os.path.join(R, "dane", "relaks_details.json")
KUR = json.load(open(os.path.join(R, "kuracja_relaks.json")))
DAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]
SKR = {"pon": 0, "wt": 1, "śr": 2, "czw": 3, "pt": 4, "sob": 5, "nd": 6}
CITY = {"name": "Lublin", "bounds": [51.13, 51.32, 22.42, 22.72], "rynek": (51.2479, 22.5683)}
KINDS = ["spa", "masaz", "zabiegi", "sauna", "baseny", "grota", "joga"]
OCCS = ["dwoje", "solo", "znajomi", "prezent"]
MA = ["sauna", "jacuzzi", "basen", "masaz", "grota", "tezn", "laznia", "zabiegi", "kriokomora", "voucher"]

def popraw_h(h):  # sklejone przedziały z Map: "06:00–02:0011:00–…" -> "06:00–02:00, 11:00–…"
    return {k: re.sub(r"(\d{2}:\d{2})(\d{1,2}:\d{2})", r"\1, \2", v) for k, v in (h or {}).items()}
TAGI_MA = {"sauna": "sauna sauny saunarium", "jacuzzi": "jacuzzi wanna hydromasaż", "basen": "basen pływanie", "masaz": "masaż masaże",
           "grota": "grota solna sól", "tezn": "tężnia solanka", "laznia": "łaźnia parowa", "zabiegi": "zabiegi rytuały pielęgnacja", "voucher": "voucher bon prezent"}
TAGI_R = {"spa": "spa wellness", "masaz": "masaż masaże", "zabiegi": "day spa zabiegi", "sauna": "sauna sauny", "baseny": "basen baseny aquapark", "grota": "grota sól inhalacje", "joga": "joga yoga medytacja"}
def parse_hours(h):
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
def godziny(txt):  # "pon–pt 10:00–20:00, sob–nd 9:00–21:00" -> słownik jak z Map
    h = {}
    for czesc in re.split(r",\s*(?=[a-zś]{2,3}\b)", txt):
        m = re.match(r"([a-zś]{2,3})(?:\s*[–-]\s*([a-zś]{2,3}))?\s+(.+)", czesc.strip())
        if not m: continue
        a, b = SKR[m[1]], SKR[m[2] or m[1]]
        for i in range(a, b + 1): h[DAYS[i]] = "Zamknięte" if "zamk" in m[3].lower() else re.sub(r"\b(\d):", r"0\1:", m[3].strip())
    return h
def km(a, b):
    r = math.pi / 180
    h = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))
def slug(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ł", "l"))
    return re.sub(r"[^a-z0-9]+", "-", "".join(c for c in s if not unicodedata.combining(c))).strip("-")[:40]
def fotki(ph, z):
    if not z: return ph
    first = ph[z["pierwsze"]] if "pierwsze" in z and z["pierwsze"] < len(ph) else None
    rest = [u for i, u in enumerate(ph) if i not in z.get("usun", []) and u != first]
    return ([first] if first else []) + rest

def miasto(adr):  # miejsca pod Lublinem: nazwa miejscowości z adresu
    if re.search(r"\bLublin\b", adr): return ""
    m = re.search(r"\d{2}-\d{3}\s+([^,]+)$", adr.strip())
    return m.group(1).strip() if m else ""
def main():
    det = json.load(open(D))
    out, brak = [], []
    for gid, m in KUR["miejsca"].items():
        d = det.get(gid)
        if not d or d.get("err"): brak.append(m.get("nazwa", gid)); continue
        name = m["nazwa"]
        pos = (d["lat"], d["lng"]); dr = km(pos, CITY["rynek"]) * 1000
        www = m["www"] if "www" in m else d.get("www")
        if www:
            www = re.sub(r"[?&](utm_[^&]*|fbclid=[^&]*)", "", www)
            if "?" not in www and "&" in www: www = www.replace("&", "?", 1)
            www = www.rstrip("?&")
        hours = {} if m.get("bez_godzin") else godziny(m["godziny"]) if m.get("godziny") else popraw_h(d.get("hours"))
        out.append({
            "id": slug(name) + "-" + gid.split(":")[1][-5:], "name": name, "kind": m["rodzaj"], "category": m["kategoria"],
            "rating": d.get("rating"), "reviews": d.get("reviews") or 0,
            "address": (m.get("adres") or d.get("address") or "").strip(), "lat": d["lat"], "lng": d["lng"],
            "www": www, "phone": re.sub(r"^[^\d+]+", "", m.get("telefon") or d.get("phone") or "").strip() or None, "gmaps": d.get("gurl"),
            "photos": fotki(d.get("photos") or [], m.get("zdjecia"))[:12],
            "desc": m["opis"], "descSrc": m.get("zrodlo", "strona"),
            "priceText": re.sub(r" (zł|min)\b", "\u00a0\\1", m["cena"]) if m.get("cena") else None, "link": m.get("cennik"), "dla": m.get("dla"),
            "hours": parse_hours(hours), "hoursText": hours, "hoursNote": m.get("godziny_uwaga"),
            "ma": [x for x in MA if x in m.get("ma", [])], "occ": [o for o in OCCS if o in m.get("okazje", [])],
            "dRynek": round(dr), "areaName": miasto(m.get("adres") or d.get("address") or "") or ("Stare Miasto" if dr <= 440 else "Centrum" if dr <= 1200 else ""),
            "nocl": m.get("nocleg"), "rest": m.get("restauracja"),
            "reviewsText": [t for t in (d.get("review_texts") or []) if 40 < len(t) < 700][:8],
            "tags": " ".join([m.get("tagi", ""), TAGI_R[m["rodzaj"]]] + [TAGI_MA[x] for x in m.get("ma", []) if x in TAGI_MA]).strip(),
        })
    out.sort(key=lambda p: -(p["rating"] or 0) * math.log10(p["reviews"] + 10))
    bdir = os.path.join(REPO, "img", "banery")
    meta = {"banners": sorted(f[:-4] for f in os.listdir(bdir) if f.endswith(".jpg") and (f.startswith("kat-") or f.startswith("relaks-"))),
            "city": CITY["name"], "bounds": [51.05, 51.45, 22.2, 22.95], "count": len(out)}
    json.dump({"meta": meta, "places": out}, open(os.path.join(REPO, "data", "relaks.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("miejsc:", len(out), {k: sum(p["kind"] == k for p in out) for k in KINDS})
    if brak: print("BRAK DANYCH Z MAP:", brak)
main()
