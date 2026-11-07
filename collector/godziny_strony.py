"""Godziny otwarcia ze stron lokali (dla lokali bez godzin w Google). Wynik: data/godziny_strony.json (w środowisku zbieracza)."""
import json, re, sys, concurrent.futures as cf
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

OUT = "/home/claude/gz/data/godziny_strony.json"
P = json.load(open("/home/claude/gdzie_zjesc/data/places.json"))["places"]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36", "Accept-Language": "pl-PL,pl;q=0.9"}
SKIP = ("facebook", "instagram", "wolt.", "pyszne", "glovo", "ubereats", "google.", "tripadvisor", "booking")
DAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"]
# skróty → indeks dnia (0 = poniedziałek)
DMAP = [
    (r"poniedzia[łl]ek|pon\.?|pn\.?|mon(?:day)?", 0), (r"wtorek|wt\.?|tue(?:sday)?", 1), (r"[śs]roda|[śs]r\.?|wed(?:nesday)?", 2),
    (r"czwartek|czw\.?|cz\.?|thu(?:rsday)?", 3), (r"pi[ąa]tek|pt\.?|pi[ąa]\.?|fri(?:day)?", 4), (r"sobota|sob\.?|so\.?|sat(?:urday)?", 5),
    (r"niedziela|niedz\.?|nd\.?|nie\.?|ndz\.?|sun(?:day)?", 6),
]
DAY_RX = "(?:" + "|".join(r for r, _ in DMAP) + ")"
TIME = r"(\d{1,2})(?:[:.](\d{2}))?"
RANGE = re.compile(TIME + r"\s*(?:-|–|—|do)\s*" + TIME)
SPAN = re.compile(r"(?<![a-ząćęłńóśźż])(" + DAY_RX + r")(?:\s*(?:-|–|—|do)\s*(" + DAY_RX + r"))?(?![a-ząćęłńóśźż])", re.I)

def day_idx(t):
    t = t.lower().strip()
    for r, i in DMAP:
        if re.fullmatch(r, t): return i
    return None

def fmt(h, m): return f"{int(h)}:{(m or '00')}"

def parse(text):
    """Zwraca {dzień: 'HH:MM–HH:MM' | 'Zamknięte'} albo None."""
    res = {}
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.split("\n")]
    lines = [l for l in lines if l]
    for i, l in enumerate(lines):
        low = l.lower()
        if len(l) > 120: continue
        # "codziennie 12-22"
        m = re.search(r"codziennie|7 dni w tygodniu|ka[żz]dego dnia|daily", low)
        r = RANGE.search(l) or (RANGE.search(lines[i + 1]) if i + 1 < len(lines) and len(lines[i + 1]) < 40 else None)
        if m and r:
            for d in range(7): res.setdefault(d, f"{fmt(r.group(1), r.group(2))}–{fmt(r.group(3), r.group(4))}")
            continue
        for s in SPAN.finditer(l):
            a = day_idx(s.group(1)); b = day_idx(s.group(2)) if s.group(2) else a
            if a is None or b is None: continue
            rest = l[s.end():s.end() + 40]
            if i + 1 < len(lines) and not RANGE.search(rest) and not re.search(r"nieczynne|zamkni", rest.lower()):
                rest = rest + " " + lines[i + 1][:40]
            nxt = SPAN.search(rest)
            if nxt: rest = rest[:nxt.start()]
            rr = RANGE.search(rest)
            days = list(range(a, b + 1)) if a <= b else list(range(a, 7)) + list(range(0, b + 1))
            if re.search(r"nieczynne|zamkni|closed|nieczynny", rest.lower()) and not rr:
                for d in days: res[d] = "Zamknięte"
            elif rr:
                h1, h2 = int(rr.group(1)), int(rr.group(3))
                if h1 <= 24 and h2 <= 24:
                    for d in days: res[d] = f"{fmt(rr.group(1), rr.group(2))}–{fmt(rr.group(3), rr.group(4))}"
    if len(res) >= 5:
        return {DAYS[d]: v for d, v in sorted(res.items())}
    return None

def get(u):
    r = requests.get(u, headers=UA, timeout=15); r.raise_for_status(); return r

def text_of(html):
    s = BeautifulSoup(html, "html.parser")
    for t in s(["script", "style", "noscript", "svg"]): t.decompose()
    return s.get_text("\n"), s

def work(p):
    www = p["www"]
    if not www or any(x in www for x in SKIP): return p["id"], None
    try:
        r = get(www); t, s = text_of(r.text)
        h = parse(t)
        if h: return p["id"], {"hours": h, "url": r.url}
        host = urlparse(r.url).netloc
        cands = []
        for a in s.find_all("a", href=True):
            u = urljoin(r.url, a["href"]); tx = a.get_text(" ", strip=True).lower()
            if urlparse(u).netloc == host and re.search(r"kontakt|contact|godziny|o nas|about|lokal", tx + " " + urlparse(u).path.lower()):
                if u not in cands: cands.append(u)
        for u in cands[:4]:
            try:
                h = parse(text_of(get(u).text)[0])
                if h: return p["id"], {"hours": h, "url": u}
            except Exception: pass
    except Exception: pass
    return p["id"], None

if __name__ == "__main__":
    L = [p for p in P if not p["hoursText"]]
    with cf.ThreadPoolExecutor(12) as ex: res = dict(ex.map(work, L))
    found = {k: v for k, v in res.items() if v}
    json.dump(found, open(OUT, "w"), ensure_ascii=False, indent=1)
    print("bez godzin:", len(L), "znalezione na stronach:", len(found))
