import asyncio, json, re, sys, os
from playwright.async_api import async_playwright
OUT="/home/claude/gz/data/relaks_listing.json"
CATS=["restauracja","pub","bar","klub nocny","kawiarnia","pizzeria","sushi","restauracja włoska","restauracja azjatycka","steakhouse","bistro","winiarnia","burger","kuchnia polska","restauracja indyjska","kebab","pierogarnia","koktajl bar","browar","restauracja wegańska"]
DIST=["Stare Miasto","Śródmieście","Czuby","Wrotków","Węglin","Sławin","Czechów","Bronowice","Kalinowszczyzna","Tatary","Felin","Rury","Konstantynów","Ponikwoda","Dziesiąta","Zemborzyce","Abramowice","Hajdów","Szerokie","Wieniawa","Za Cukrownią","Kośminek","Majdan Tatarski","Sławinek"]
def load():
    return json.load(open(OUT)) if os.path.exists(OUT) else {"done":[], "places":{}}
async def run_q(ctx, q, st):
    pg=await ctx.new_page(); n=0
    try:
        await pg.goto("https://www.google.com/maps/search/"+q.replace(" ","+")+"?hl=pl", timeout=60000)
        await pg.wait_for_timeout(4000)
        if "/sorry/" in pg.url: return -1
        feed=pg.locator('div[role="feed"]')
        if await feed.count():
            for i in range(30):
                await feed.evaluate("e=>e.scrollBy(0,4000)"); await pg.wait_for_timeout(1200)
                if "Dotarłeś do końca listy" in await feed.inner_text(): break
        found=await pg.eval_on_selector_all('a[href*="/maps/place/"]',"e=>e.map(a=>[a.href,a.getAttribute('aria-label')])")
        if "/maps/place/" in pg.url:
            h1=pg.locator("h1").first
            found.append([pg.url,(await h1.inner_text()).strip() if await h1.count() else q])
        for href,label in found:
            m=re.search(r"!1s(0x[0-9a-f]+:0x[0-9a-f]+)",href)
            if not m: continue
            k=m.group(1)
            if k not in st["places"]: st["places"][k]={"name":label,"url":href.split("?")[0],"q":[]}; n+=1
            if q not in st["places"][k]["q"]: st["places"][k]["q"].append(q)
    finally: await pg.close()
    return n
async def main():
    st=load()
    CATS=["spa","day spa","hotel spa","strefa wellness","strefa saun","sauna","sauna fińska","łaźnia","hammam","jacuzzi","masaż","salon masażu","masaż tajski","masaż balijski","masaż relaksacyjny","masaż dla par","gabinet masażu","grota solna","jaskinia solna","tężnia solankowa","kriokomora","floating","joga","studio jogi","szkoła jogi","medytacja","pilates","gabinet odnowy biologicznej","odnowa biologiczna","zabiegi spa","rytuały spa","wellness","basen","termy"]
    DC=["spa","masaż","sauna","joga"]
    DIST2=["Czuby","Czechów","Bronowice","Śródmieście","Wrotków","Felin","Sławin","Tatary","Stare Miasto","Węglin"]
    qs=[c+" Lublin" for c in CATS]+[f"{c} Lublin {d}" for c in DC for d in DIST2]
    todo=[q for q in qs if q not in st["done"]]
    lim=int(sys.argv[1]) if len(sys.argv)>1 else len(todo)
    todo=todo[:lim]
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path="/usr/bin/google-chrome",headless=True,args=["--no-sandbox","--lang=pl-PL","--disable-blink-features=AutomationControlled"])
        ctxs=[await br.new_context(locale="pl-PL",viewport={"width":1280,"height":900},user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36") for _ in range(3)]
        async def worker(i):
            while todo:
                q=todo.pop(0)
                try: n=await run_q(ctxs[i],q,st)
                except Exception as e: n=f"err {str(e)[:50]}"
                if n==-1: print("CAPTCHA",q,flush=True); todo.clear(); return
                st["done"].append(q); print(len(st["places"]),n,q,flush=True)
                json.dump(st,open(OUT,"w"),ensure_ascii=False)
                await asyncio.sleep(2)
        await asyncio.gather(*[worker(i) for i in range(3)])
        await br.close()
asyncio.run(main())
