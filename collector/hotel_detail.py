import asyncio, json, re, sys, os, random
from playwright.async_api import async_playwright
def clean(s): return re.sub(r"\s+"," ",s or "").strip()
async def consent(pg):
    for t in ["Zaakceptuj wszystko","Accept all"]:
        b=pg.get_by_role("button",name=t)
        if await b.count():
            try: await b.first.click(timeout=3000); await pg.wait_for_timeout(2000)
            except: pass
async def detail(ctx, url):
    pg=await ctx.new_page(); d={}
    try:
        await pg.goto(url+"?hl=pl&gl=pl",timeout=60000); await pg.wait_for_timeout(4500); await consent(pg)
        if "/sorry/" in pg.url: return "CAPTCHA"
        m=re.search(r"!3d(-?[\d.]+)!4d(-?[\d.]+)",pg.url) or re.search(r"@(-?[\d.]+),(-?[\d.]+)",pg.url)
        if m: d["lat"],d["lng"]=float(m.group(1)),float(m.group(2))
        main=pg.locator('div[role="main"]').first
        h1=pg.locator("h1").first
        d["name"]=clean(await h1.inner_text()) if await h1.count() else None
        lab=await main.get_attribute("aria-label"); d["name"]=d["name"] or lab
        txt=await main.inner_text()
        r=re.search(r"\n(\d,\d)\n\(([\d\s ]+)\)",txt)
        if r: d["rating"]=float(r.group(1).replace(",",".")); d["reviews"]=int(re.sub(r"\D","",r.group(2)))
        if (d.get("reviews") or 0) < 10:
            d["skip"]="malo opinii"; return d
        cat=pg.locator('button[jsaction*="category"]').first
        d["category"]=clean(await cat.inner_text()) if await cat.count() else None
        async def item(sel,attr=None):
            e=pg.locator(sel).first
            if not await e.count(): return None
            return await e.get_attribute(attr) if attr else clean(await e.inner_text())
        d["address"]=(await item('button[data-item-id="address"]') or "").strip(" \ue0c8")
        d["www"]=await item('a[data-item-id="authority"]','href')
        d["phone"]=await item('button[data-item-id^="phone"]')
        d["menu_url"]=await item('a[data-item-id="menu"]','href')
        hrs={}
        for tr in await pg.locator("table tr").all():
            tds=await tr.locator("td").all_inner_texts()
            if len(tds)>=2:
                day=clean(re.sub(r"\(.*?\)","",tds[0])); val=clean(tds[1].split("Godziny")[0])
                if day in ["poniedziałek","wtorek","środa","czwartek","piątek","sobota","niedziela"]: hrs[day]=val
        d["hours"]=hrs
        revs=[]
        async def grab():
            for el in await pg.locator('div[data-review-id] span.wiI7pd').all():
                t=clean(await el.inner_text())
                if len(t)>30 and t not in revs: revs.append(t)
        await grab()
        tab=pg.locator('button[role="tab"]').filter(has_text="Opinie")
        if await tab.count():
            await tab.first.click(); await pg.wait_for_timeout(2500)
            for _ in range(3):
                await pg.mouse.move(200,600); await pg.mouse.wheel(0,5000); await pg.wait_for_timeout(1000)
            await grab()
            ov=pg.locator('button[role="tab"]').filter(has_text="Przegląd")
            if await ov.count(): await ov.first.click(); await pg.wait_for_timeout(1500)
        d["review_texts"]=revs[:12]
        # hotel
        m=re.search(r"(\d[\d\s\u00a0\u202f]*?)\s*zł\s*\n([^\n]+)",txt[:80])
        if m: d["price"]=int(re.sub(r"\D","",m.group(1))); d["price_dates"]=clean(m.group(2))
        m=re.search(r"\n·([^\n]+)\n",txt); d["kind"]=clean(m.group(1)) if m else None
        m=re.search(r"(\d)-gwiazdkow",txt); d["stars"]=int(m.group(1)) if m else None
        m=re.search(r"Godzina zameldowania: (\d{1,2}:\d\d)",txt); d["checkin"]=m.group(1) if m else None
        m=re.search(r"Godzina wymeldowania: (\d{1,2}:\d\d)",txt); d["checkout"]=m.group(1) if m else None
        info=pg.locator('button[role="tab"]').filter(has_text="Informacje")
        d["desc"]=[]; d["amen"]={}
        if await info.count():
            await info.first.click(); await pg.wait_for_timeout(2500)
            d["desc"]=[clean(t) for t in await pg.locator('div[role="main"] div.P1LL5e').all_inner_texts() if clean(t)]
            d["info"]=[l.strip() for l in (await pg.locator('div[role="main"]').first.inner_text()).split("\n") if l.strip() and not l.strip() in ("Przegląd","Opinie","Informacje","Ceny","Menu") and len(l.strip())<80][:60]
            for lab in await pg.eval_on_selector_all('div[role="main"] div[role="img"][aria-label*="opcja"]',"e=>e.map(x=>x.getAttribute('aria-label'))"):
                lab=lab.replace("\u00a0"," ")
                mm=re.match(r"(.+?) – opcja (dostępna|niedostępna)",lab)
                if mm: d["amen"][mm.group(1).strip()]=mm.group(2)=="dostępna"
            ov=pg.locator('button[role="tab"]').filter(has_text="Przegląd")
            if await ov.count(): await ov.first.click(); await pg.wait_for_timeout(1500)
        # photos
        btn=pg.locator('button[jsaction*="heroHeaderImage"]').first
        urls=[]
        if await btn.count():
            await btn.click(); await pg.wait_for_timeout(3500)
            for _ in range(6):
                await pg.mouse.move(200,500); await pg.mouse.wheel(0,4000); await pg.wait_for_timeout(900)
            for u in re.findall(r'https://lh\d\.googleusercontent\.com/(?:gps-cs-s|p)/[A-Za-z0-9_\-]+',await pg.content()):
                if u not in urls: urls.append(u)
        d["photos"]=urls[:14]
    except Exception as e: d["err"]=str(e)[:100]
    finally: await pg.close()
    return d
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path="/usr/bin/google-chrome",headless=True,args=["--no-sandbox","--lang=pl-PL","--disable-blink-features=AutomationControlled"])
        ctx=await br.new_context(locale="pl-PL",viewport={"width":1280,"height":900},user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36")
        print(json.dumps(await detail(ctx,sys.argv[1]),ensure_ascii=False,indent=1))
        await br.close()
if __name__=="__main__": asyncio.run(main())
