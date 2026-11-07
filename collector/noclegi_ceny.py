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
async def one(ctx, url, target):
    pg = await ctx.new_page(); r = {}
    try:
        await pg.goto(url + "?hl=pl&gl=pl", timeout=60000); await pg.wait_for_timeout(4500)
        if "/sorry/" in pg.url: return "CAPTCHA"
        if not await pg.locator('[jsaction*="startDatePickerClick"]').count(): r["brak"] = "bez kalendarza"; return r
        end = target + datetime.timedelta(days=1)
        lab = lambda d: f"{d.day} {[k for k, v in MIES.items() if v == d.month][0]}"
        async def pick(which, d):
            await pg.locator(f'[jsaction*="{which}DatePickerClick"]').first.click(); await pg.wait_for_timeout(1200)
            for _ in range(4):
                cell = pg.locator(f'td[role="gridcell"][aria-label="{lab(d)}"]:not(.goog-date-picker-other-month) >> visible=true')
                if await cell.count():
                    await cell.first.click(timeout=5000); await pg.wait_for_timeout(1500); return True
                cells = [await c.get_attribute("aria-label") for c in await pg.locator('td[role="gridcell"]:not(.goog-date-picker-other-month) >> visible=true').all()]
                mon = MIES.get((cells[10] if len(cells) > 10 else "x x").split()[-1][:3], 0)
                btn = pg.locator((".goog-date-picker-nextMonth" if d.month > mon or (d.month == 1 and mon == 12) else ".goog-date-picker-previousMonth") + " >> visible=true").first
                if not await btn.count(): return False
                await btn.click(); await pg.wait_for_timeout(700)
            return False
        if not await pick("start", target): r["brak"] = "nie wybrano daty"; return r
        t1 = await pg.locator('div[role="main"]').first.inner_text()
        if not re.search(rf"\b{end.day}\s+{lab(end).split()[1]}", t1.split("Zameldowanie lub wymeldowanie")[-1][:60]):
            await pick("end", end)
        await pg.wait_for_timeout(3500)
        for _ in range(4):
            lab = await price_btn(pg)
            if lab:
                rg = parse_range(lab, target.year)
                pm = re.search(r"([\d ]+) zł", lab)
                if rg and rg[0] == target and pm:
                    r["price"] = int(re.sub(r"\D", "", pm.group(1))); r["noce"] = (rg[1] - rg[0]).days; r["lab"] = lab
                    return r
            await pg.wait_for_timeout(1500)
        t2 = await pg.locator('div[role="main"]').first.inner_text()
        r["brak"] = "brak ceny w terminie" if re.search(r"[Bb]rak (wolnych|dostęp)|niedostępn", t2) else "nie odczytano"
        r["lab"] = await price_btn(pg)
    except Exception as e: r["err"] = str(e)[:80]
    finally: await pg.close()
    return r
async def main():
    target = datetime.date.fromisoformat(sys.argv[1])
    lim = int(sys.argv[2]) if len(sys.argv) > 2 else 9999
    pl = json.load(open("/home/claude/gdzie_zjesc/data/noclegi.json"))["places"]
    out = json.load(open(O)) if os.path.exists(O) else {}
    key = sys.argv[1]
    todo = [p for p in pl if p["gmaps"] and key not in out.get(p["id"], {})][:lim]
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
