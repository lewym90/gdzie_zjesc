import asyncio, json, os, sys, random
sys.path.insert(0,"/home/claude/scripts")
from detail import detail
from playwright.async_api import async_playwright
L="/home/claude/gz/data/listing.json"; O="/home/claude/gz/data/details.json"
async def main():
    places=json.load(open(L))["places"]
    out=json.load(open(O)) if os.path.exists(O) else {}
    todo=[k for k in places if k not in out]
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
