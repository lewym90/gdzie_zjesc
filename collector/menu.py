"""Szuka menu z cenami na stronach lokali. Wynik: gz/data/menu.json"""
import json, re, sys, os, concurrent.futures as cf
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

D = "/home/claude/gz/data"
OUT = f"{D}/menu.json"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36", "Accept-Language": "pl-PL,pl;q=0.9"}
PRICE_RX = re.compile(r"(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:zł|zl|PLN|,-|,–)(?![a-ząćęłńóśźż])", re.I)
MENU_RX = re.compile(r"menu|karta|carte|jad[łl]ospis|dania|kuchnia|oferta|cennik|napoje|drink", re.I)
SKIP_HOST = ("facebook.com", "instagram.com", "google.", "booking.com", "tripadvisor", "linktr.ee")

def get(url):
    r = requests.get(url, headers=UA, timeout=15, allow_redirects=True)
    r.raise_for_status()
    return r

def lines_of(html):
    s = BeautifulSoup(html, "html.parser")
    for t in s(["script", "style", "noscript", "svg", "header", "footer", "nav"]): t.decompose()
    txt = s.get_text("\n")
    return [re.sub(r"\s+", " ", l).strip() for l in txt.split("\n") if l.strip()], s

def looks_desc(t):
    return bool(t) and (t[0].islower() or t.count(",") >= 2 or len(t) > 70)
PRICE_BARE = re.compile(r"(?<![\d/.,-])(\d{1,3}(?:[.,]\d{2})?)\s*(?:zł|zl|PLN)?\s*$", re.I)
def items_from(lines, bare=False):
    PRICE = PRICE_BARE if bare else PRICE_RX
    items, cat, buf = [], None, []
    for l in lines:
        if len(l) > 160: buf = []; continue
        m = PRICE.search(l)
        if not m:
            buf.append(l); continue
        rest = PRICE.sub("", l).strip(" .–-:|/")
        rest = re.sub(r"^\s*\d+\s*(g|ml|cl|l|szt\.?|kg|cm)\b", "", rest, flags=re.I).strip(" .–-:|/")
        rest = re.sub(r"\s*[/(]?\s*\d+\s*(g|ml|cl|l|szt\.?|kg|cm)\)?\s*$", "", rest, flags=re.I).strip(" .–-:|/")
        name = desc = None
        if len(rest) >= 3 and not looks_desc(rest):
            name = rest
        elif len(rest) >= 3 and buf:
            name, desc = buf.pop(), rest
        elif buf:
            last = buf.pop()
            if looks_desc(last) and buf: name, desc = buf.pop(), last
            else: name = last
        if buf:
            c = buf[-1]
            if 3 <= len(c) <= 40 and not c[0].islower() and c[0] not in "(*-•" and not re.search(r"\d{2}:\d{2}|\d{3}", c):
                cat = c.title() if c.isupper() else c
        buf = []
        if not name: continue
        if looks_desc(name) and not desc: continue
        v = float(m.group(1).replace(",", "."))
        if 3 <= len(name) <= 70 and 4 <= v <= 2000 and not re.search(r"dostaw|minimal|opakow|kaucj|rabat|bon ", name, re.I):
            nm = name.title() if name.isupper() else name[0].upper() + name[1:]
            items.append({"cat": cat, "name": nm, "desc": (desc or "")[:160] or None, "price": (f"{v:.0f} zł" if v == int(v) else f"{v:.2f} zł".replace(".", ",")), "v": v})
    seen, out = set(), []
    for it in items:
        k = (it["name"].lower(), it["price"])
        if k in seen: continue
        seen.add(k); out.append(it)
    return out

def work(k, d):
    www = d.get("www") or d.get("menu_url")
    if not www or any(h in www for h in SKIP_HOST): return k, {"status": "brak strony"}
    out = {"status": "brak menu"}
    try:
        r = get(www)
        if "pdf" in r.headers.get("content-type", ""): return k, {"status": "pdf", "pdf": r.url}
        lines, soup = lines_of(r.text)
        best, burl = items_from(lines), r.url
        cands = []
        host = urlparse(r.url).netloc
        for a in soup.find_all("a", href=True):
            h = urljoin(r.url, a["href"]); txt = a.get_text(" ", strip=True)
            if h.lower().split("?")[0].endswith(".pdf") and (MENU_RX.search(txt) or MENU_RX.search(h)): out["pdf"] = h
            elif (MENU_RX.search(txt) or MENU_RX.search(urlparse(h).path)) and urlparse(h).netloc.endswith(host.replace("www.", "")):
                if h not in cands and h.split("#")[0] != r.url: cands.append(h.split("#")[0])
        for h in cands[:6]:
            try:
                rr = get(h)
                if "pdf" in rr.headers.get("content-type", ""): out["pdf"] = rr.url; continue
                it = items_from(lines_of(rr.text)[0])
                if len(it) > len(best): best, burl = it, rr.url
            except Exception: pass
        if len(best) >= 6:
            vals = sorted(i["v"] for i in best)
            mains = [v for v in vals if v >= 15] or vals
            lo, hi = mains[len(mains) // 10], mains[-1 - len(mains) // 10]
            out.update({"status": "menu", "url": burl, "items": [{x: i[x] for x in ("cat", "name", "desc", "price") if i.get(x)} for i in best[:150]], "range": f"{lo:.0f}–{hi:.0f} zł"})
        elif cands: out["url"] = cands[0]
        if out.get("pdf") and out["status"] != "menu": out["status"] = "pdf"
    except Exception as e:
        out = {"status": "strona nie działa", "err": str(e)[:80]}
    return k, out

if __name__ == "__main__":
    det = json.load(open(f"{D}/details.json"))
    res = json.load(open(OUT)) if os.path.exists(OUT) else {}
    todo = {k: d for k, d in det.items() if k not in res and not d.get("err")}
    print("do sprawdzenia", len(todo), flush=True)
    with cf.ThreadPoolExecutor(12) as ex:
        for i, (k, o) in enumerate(ex.map(lambda kv: work(*kv), todo.items())):
            res[k] = o
            if i % 25 == 0:
                json.dump(res, open(OUT, "w"), ensure_ascii=False)
                print(i, sum(1 for v in res.values() if v["status"] == "menu"), flush=True)
    json.dump(res, open(OUT, "w"), ensure_ascii=False)
    from collections import Counter
    print(Counter(v["status"] for v in res.values()))
