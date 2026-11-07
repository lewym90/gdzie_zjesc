# Pobiera treść stron obiektów bez pełnych danych (opis, cena, udogodnienia, doba) do przeglądu ręcznego; wyniki wpisuje się w kuracja_noclegi.json -> "uzupelnienia".
import json,re,requests,sys,concurrent.futures as cf
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
d=json.load(open('/home/claude/gdzie_zjesc/data/noclegi.json'))['places']
T=[p for p in d if p['www'] and 'facebook' not in p['www'] and (not p['desc'] or not p['price'] or not p['amen'] or not p['checkin'])]
UA={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36","Accept-Language":"pl-PL,pl"}
KW=re.compile(r"cennik|ceny|price|o-nas|o nas|onas|about|pokoj|pokoi|room|apartament|oferta|udogodn|regulamin|informacje|faq|hotel|kontakt",re.I)
def txt(html):
    s=BeautifulSoup(html,"html.parser")
    for t in s(["script","style","noscript","svg"]): t.decompose()
    return re.sub(r"\n\s*\n+","\n",s.get_text("\n")).strip(), s
def get(p):
    out=[]; seen=set()
    try:
        r=requests.get(p['www'],headers=UA,timeout=15); r.encoding=r.apparent_encoding
        t,s=txt(r.text); out.append(("HOME "+r.url,t[:6000])); seen.add(r.url)
        host=urlparse(r.url).netloc
        links=[]
        for a in s.find_all("a",href=True):
            u=urljoin(r.url,a["href"]).split("#")[0]
            if urlparse(u).netloc==host and u not in seen and (KW.search(u) or KW.search(a.get_text())) and not re.search(r"\.(jpg|png|pdf)$",u,re.I):
                seen.add(u); links.append(u)
        for u in links[:6]:
            try:
                r2=requests.get(u,headers=UA,timeout=15); r2.encoding=r2.apparent_encoding
                out.append(("PAGE "+u,txt(r2.text)[0][:5000]))
            except Exception as e: pass
    except Exception as e: out.append(("ERR",str(e)[:100]))
    return p['id'],out
with cf.ThreadPoolExecutor(8) as ex:
    for pid,out in ex.map(get,T):
        open(f"/home/claude/gz/www/{pid}.txt","w").write("\n\n".join(f"=== {a}\n{b}" for a,b in out))
        print(pid,len(out),sum(len(b) for a,b in out))
