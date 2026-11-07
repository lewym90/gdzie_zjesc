"""Ceny noclegów w jednym, stałym terminie: piątek→sobota, 2 osoby (domyślnie w Mapach Google).
Użycie: python3 noclegi_ceny.py 2026-11-20 [limit]  → /home/claude/gz/data/noclegi_ceny.json"""
import asyncio, json, re, sys, os, datetime, random
from playwright.async_api import async_playwright
MIES = {"sty": 1, "lut": 2, "mar": 3, "kwi": 4, "maj": 5, "cze": 6, "lip": 7, "sie": 8, "wrz": 9, "paź": 10, "lis": 11, "gru": 12}
O = "/home/claude/gz/data/noclegi_ceny.json"
def parse_range(lab, year):
    # "Od 260 zł za noc w dniach 12–13 lis." albo "30 lis – 1 gru"
    m = re.search(r"(\d+)\s*([a-ząćęłńóśźż]+)?\s*[–-]\s*(\d+)\s*([a-ząćęłńóśźż]+)", lab)
    if not m: return None
    d1, m1, d2, m2 = int(m.group(1)), m.group(2) or m.group(4), int(m.group(3)), m.group(4)
    return datetime.date(year, MIES[m1[:3]], d1), datetime.date(year, MIES[m2[:3]], d2)
async def price_btn(pg):
    for lab in await pg.eval_on_selector_all('div[role="main"] button[aria-label]', "e=>e.map(b=>b.getAttribute('aria-label'))"):
        if lab and "za noc" in lab: return lab.replace("\xa0", " ")
    return None
MIESN = {"stycz": 1, "luty": 2, "marz": 3, "kwie": 4, "maj": 5, "czer": 6, "lipi": 7, "sier": 8, "wrze": 9, "paźd": 10, "listo": 11, "grud": 12}
def mnum(t):
    for k, v in MIESN.items():
        if t.lower().startswith(k): return v
    return 0
def offers(txt):
    blk = txt.split("Wszystkie opcje")[-1] if "Wszystkie opcje" in txt else ""
    blk = blk.split("* Ta cena")[0].split("Zdjęcia")[0][:900]
    ps = [int(re.sub(r"\D", "", x)) for x in re.findall(r"(?<![\d,])(\d[\d\s\u00a0]{0,6}\d)\s*zł", blk)]
    return [p for p in ps if 40 <= p <= 5000], blk
async def one(ctx, url, target):
    pg = await ctx.new_page(); r = {}
    try:
        await pg.goto(url + "?hl=pl&gl=pl", timeout=60000); await pg.wait_for_timeout(4500)
        if "/sorry/" in pg.url: return "CAPTCHA"
        if not await pg.locator('[jsaction*="startDatePickerClick"]').count(): r["brak"] = "bez kalendarza"; return r
        end = target + datetime.timedelta(days=1)
        async def pick(which, d):
            await pg.locator(f'[jsaction*="{which}DatePickerClick"]').first.click(); await pg.wait_for_timeout(1300)
            for _ in range(4):
                my = pg.locator('.goog-date-picker-monthyear >> visible=true').first
                if not await my.count(): return False
                m = mnum((await my.inner_text()).strip())
                if m == d.month: break
                await pg.locator(('.goog-date-picker-nextMonth' if (d.month - m) % 12 < 6 else '.goog-date-picker-previousMonth') + ' >> visible=true').first.click()
                await pg.wait_for_timeout(700)
            lab = f"{d.day} {[k for k, v in MIES.items() if v == d.month][0]}"
            cell = pg.locator(f'td[role="gridcell"][aria-label="{lab}"]:not(.goog-date-picker-other-month) >> visible=true')
            if not await cell.count(): return False
            await cell.first.click(timeout=5000); await pg.wait_for_timeout(1200); return True
        if not await pick("start", target) or not await pick("end", end): r["brak"] = "nie wybrano daty"; return r
        want = f"{target.day}–{end.day} " if target.month == end.month else f"{target.day} "
        for k in range(8):
            await pg.wait_for_timeout(1500)
            lab = await price_btn(pg)
            if lab and ("w dniach " + want) in lab:
                pm = re.search(r"([\d ]+) zł", lab)
                if pm: r["price"] = int(re.sub(r"\D", "", pm.group(1))); return r
        t = await pg.locator('div[role="main"]').first.inner_text()
        dd = re.findall(r"[a-zśź]+\.,\s+(\d+)\s+[a-ząćęłńóśźż]+", t[t.find("Zameldowanie lub"):][:200])
        ps, blk = offers(t)
        if len(dd) >= 2 and int(dd[0]) == target.day and int(dd[1]) == end.day and ps:
            r["price"] = min(ps); r["z"] = "oferty"; return r
        alt = re.search(r"Dostępny w\s*terminie\s*\S+\s+(\d+)\s+(\w+)\s*[–-]\s*\S+\s+(\d+)\s+(\w+)\s+za\s+([\d\s\u00a0]+)\s*zł", t)
        if alt:
            a1 = datetime.date(target.year, MIES[alt.group(2)[:3]], int(alt.group(1))); a2 = datetime.date(target.year, MIES[alt.group(4)[:3]], int(alt.group(3)))
            if (a2 - a1).days == 1 and abs((a1 - target).days) <= 1 and a1.weekday() in (4, 5):
                r["price"] = int(re.sub(r"\D", "", alt.group(5))); r["alt"] = f"{a1.day}–{a2.day} {['','stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'][a2.month]}"; return r
        r["lab"] = await price_btn(pg)
        r["brak"] = "brak wolnych pokoi" if re.search(r"[Bb]rak (wolnych|dostępn)|[Nn]iedostępn|nie ma dostępnych|[Bb]rak ofert", t) else "nie odczytano"
    except Exception as e: r["err"] = str(e)[:80]
    finally: await pg.close()
    return r
async def main():
    target = datetime.date.fromisoformat(sys.argv[1])
    lim = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 9999
    pl = json.load(open("/home/claude/gdzie_zjesc/data/noclegi.json"))["places"]
    out = json.load(open(O)) if os.path.exists(O) else {}
    key = sys.argv[1]
    redo = "--ponow" in sys.argv
    if "--brakujace" in sys.argv: pl = [p for p in pl if not any(v.get("price") for v in out.get(p["id"], {}).values()) and out.get(p["id"], {}).get("2026-11-27", {}).get("brak") != "bez kalendarza"]
    todo = [p for p in pl if p["gmaps"] and (key not in out.get(p["id"], {}) or (redo and out[p["id"]][key].get("brak") == "nie odczytano"))][:lim]
    print("todo", len(todo), flush=True)
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox", "--lang=pl-PL", "--disable-blink-features=AutomationControlled"])
        ctxs = [await br.new_context(locale="pl-PL", viewport={"width": 1280, "height": 900}, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36") for _ in range(3)]
        stop = False
        async def w(i):
            nonlocal stop
            while todo and not stop:
                pp = todo.pop(0)
                r = await one(ctxs[i], pp["gmaps"], target)
                if r == "CAPTCHA": print("CAPTCHA", flush=True); stop = True; return
                out.setdefault(pp["id"], {})[key] = r
                print(pp["name"], r.get("price"), r.get("brak", ""), r.get("err", ""), flush=True)
                json.dump(out, open(O, "w"), ensure_ascii=False)
                await asyncio.sleep(random.uniform(2, 4))
        await asyncio.gather(*[w(i) for i in range(3)])
        await br.close()
asyncio.run(main())
