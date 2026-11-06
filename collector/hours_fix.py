import asyncio, json, re, sys
from playwright.async_api import async_playwright
O="/home/claude/gz/data/details.json"
det=json.load(open(O))
P=json.load(open("/home/claude/gdzie_zjesc/data/places.json"))["places"]
need={p["gmaps"] for p in P if not p["hoursText"]}
todo=[k for k,v in det.items() if v.get("gurl") in need]
print("do uzupełnienia",len(todo),flush=True)
DAYS=["poniedziałek","wtorek","środa","czwartek","piątek","sobota","niedziela"]
def clean(s): return re.sub(r"\s+"," ",s or "").strip()
async def one(ctx,k):
    pg=await ctx.new_page(); hrs={}
    try:
        await pg.goto(det[k]["gurl"]+"?hl=pl",timeout=60000); await pg.wait_for_timeout(4000)
        if "/sorry/" in pg.url: return "CAPTCHA"
        for _ in range(2):
            if await pg.locator("table tr").count(): break
            b=pg.locator('div[role="main"] [jsaction*="openhours"], div[role="main"] [aria-expanded="false"]').filter(has_text=re.compile("Otwarcie|Zamknięte ·|Otwarte ·|Zamknięcie|Czynne"))
            if not await b.count(): b=pg.get_by_text(re.compile("Otwarcie:|Zamknięcie:|Otwarte 24"))
            b=b.first
            if await b.count():
                try: await b.click(timeout=3000)
                except: pass
            await pg.wait_for_timeout(2500)
        for tr in await pg.locator("table tr").all():
            tds=await tr.locator("td").all_inner_texts()
            if len(tds)>=2:
                day=clean(re.sub(r"\(.*?\)","",tds[0])); val=clean(tds[1].split("Godziny")[0])
                if day in DAYS: hrs[day]=val
    except Exception as e: pass
    finally: await pg.close()
    return hrs
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path="/usr/bin/google-chrome",headless=True,args=["--no-sandbox","--lang=pl-PL","--disable-blink-features=AutomationControlled"])
        ctxs=[await br.new_context(locale="pl-PL",viewport={"width":1280,"height":900},user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36") for _ in range(3)]
        q=list(todo); got=0; stop=False
        async def w(i):
            nonlocal got,stop
            while q and not stop:
                k=q.pop(0); h=await one(ctxs[i],k)
                if h=="CAPTCHA": stop=True; print("CAPTCHA",flush=True); return
                if h: det[k]["hours"]=h; got+=1
                await asyncio.sleep(2)
        await asyncio.gather(*[w(i) for i in range(3)])
        json.dump(det,open(O,"w"),ensure_ascii=False); print("uzupełniono",got,"z",len(todo))
        await br.close()
asyncio.run(main())
