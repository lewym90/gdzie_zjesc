import asyncio, json, os, sys, random
sys.path.insert(0,"/home/claude/gdzie_zjesc/collector")
from hotel_detail import detail
from playwright.async_api import async_playwright
L="/home/claude/gz/data/relaks_listing.json"; O="/home/claude/gz/data/relaks_details.json"
async def main():
    places=json.load(open(L))["places"]
    out=json.load(open(O)) if os.path.exists(O) else {}
    import re
    ZLE=r"auto ?spa|detailing|ppf|powłok|spa dla psa|psa spa|psów|dentyst|stomatolog|chirurg|medycyn[ay] estetyczn|depilacj|\blaser\b|klinik|clinic|szpital|przychodni|poradni|rehabilitac|fizjo|osteopat|\bkurs\b|szkoleni|siłowni|fitness|\bgym\b|squash|tantr|nuru|erot|kominki|strzelnic|włosy|\bhair\b|nails|makijaż|podolog|solarium|wanny|balia|mobiln|na wynajem|odchudz|\bems\b|kosmetolog|kosmetyczn|beauty|urody|\bskin\b|piękn|estetyk|normobar|komora tlenowa|hiperbar|medycyny pracy|zakład|centrum rehabilit|car |pink spa party|dywan|apartament|apartments|residence|efoil|gimnastyka|pilates|sport club|klub sportowy|mosir im|\bhala\b"
    DOBRE=r"spa|wellness|sauna|saun|masaż|massage|masu|thai|bali|grot|jaskini|tężni|jog|yoga|medytac|łaźni|hammam|hotel|aqua|basen|h2o|termy|relaks|kobido|odnowa|odnowy|holisty|refleksolog"
    todo=[k for k in places if k not in out and re.search(DOBRE,places[k]["name"] or "",re.I) and (not re.search(ZLE,places[k]["name"] or "",re.I) or re.search(r"\bspa\b|wellness|hotel",places[k]["name"] or "",re.I) and not re.search(r"auto ?spa|detailing|psa|psów|dentyst|beauty clinic|klinik|clinic|apartament|apartments|residence",places[k]["name"] or "",re.I))]
    print("todo",len(todo),flush=True)
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path="/usr/bin/google-chrome",headless=True,args=["--no-sandbox","--lang=pl-PL","--disable-blink-features=AutomationControlled"])
        W=int(sys.argv[1]) if len(sys.argv)>1 else 3
        ctxs=[await br.new_context(locale="pl-PL",viewport={"width":1280,"height":900},user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36") for _ in range(W)]
        stop=False; n=0
        async def worker(i):
            nonlocal stop,n
            while todo and not stop:
                k=todo.pop(0)
                d=await detail(ctxs[i],places[k]["url"])
                if d=="CAPTCHA": print("CAPTCHA",flush=True); stop=True; return
                d["q"]=places[k]["q"]; d["gurl"]=places[k]["url"]; out[k]=d; n+=1
                if n%10==0:
                    json.dump(out,open(O,"w"),ensure_ascii=False); print(n,len(todo),d.get("name"),len(d.get("photos",[])),flush=True)
                await asyncio.sleep(random.uniform(3,6))
        await asyncio.gather(*[worker(i) for i in range(W)])
        json.dump(out,open(O,"w"),ensure_ascii=False); await br.close()
asyncio.run(main())
