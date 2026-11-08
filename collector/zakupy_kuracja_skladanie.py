import json
M={}
for i in range(4):
    for k,v in json.load(open(f'/home/claude/gz/zk/wynik{i}.json')).items():
        if v.get('decyzja')!='tak': continue
        v=dict(v); [v.pop(x,None) for x in ('decyzja','powod')]
        if isinstance(v.get('co_kupic'),list): v['co_kupic']=", ".join(v['co_kupic'])
        M[k]=v
def by(n,addr=None):
    D=json.load(open('/home/claude/gz/data/zakupy_details.json'))
    r=[k for k in M if M[k]['nazwa']==n and (addr is None or addr in D[k]['address'])]; assert len(r)==1,(n,r); return M[r[0]]
by("Rany Julek!")['nazwa']="Rany Julek! – Olimp"
by("Rany Julek")['nazwa']="Rany Julek! – Zana"
by("Piekarnia Kuźmiuk","Furmańska")['nazwa']="Piekarnia Kuźmiuk – Furmańska"
by("Piekarnia Kuźmiuk","Peowiaków")['nazwa']="Piekarnia Kuźmiuk – Peowiaków"
by("Piekarnia-Cukiernia Marcin Orlikowski","Zana")['nazwa']="Piekarnia-Cukiernia Orlikowski – Zana"
by("Piekarnia-Cukiernia Marcin Orlikowski","Lubartowska")['nazwa']="Piekarnia-Cukiernia Orlikowski – Lubartowska"
by("Centrum Handlowe Felicity")['nazwa']="Felicity Lublin"
by("Galeria Sztuki Wirydarz")['www']=None
json.dump({"miejsca":M},open('collector/kuracja_zakupy.json','w'),ensure_ascii=False,indent=1)
print(len(M))
K=json.load(open('collector/kuracja_zakupy.json')); M=K['miejsca']
def by2(n): r=[k for k in M if M[k]['nazwa']==n]; assert len(r)==1,n; return M[r[0]]
by2("BOSKO")['nazwa']="Lody Bosko"
by2("Piekarnia-Cukiernia Orlikowski – Lubartowska")['nazwa']="Orlikowski – Lubartowska"
by2("Piekarnia-Cukiernia Orlikowski – Zana")['nazwa']="Orlikowski – Zana"
by2("Pracownia Cukiernicza Kania")['godziny']="pon–pt 06:00–18:00, sob 07:00–15:00"
k=by2("KHT Aria Shop"); k['godziny']="pon–pt 08:00–16:00"; k['godziny_uwaga']="W soboty po wcześniejszym umówieniu."; k['dla']="Przed wizytą warto zadzwonić, bo zdarzają się przerwy w godzinach otwarcia."
NOTE="Google nie podaje godzin otwarcia – przed wizytą zadzwoń."
for n in ("Polska Marka","Coffee & Sons","Antykwariat Krakowskie Przedmieście 41"): by2(n)['godziny_uwaga']=NOTE
for v in M.values():
    if v.get('zrodlo')=='internet': v['zrodlo']='siec'
json.dump(K,open('collector/kuracja_zakupy.json','w'),ensure_ascii=False,indent=1)
# --- weryfikacja niezależna ---
P={r['id']:r for i in range(3) for r in json.load(open(f'/home/claude/gz/zk/wer{i}.json'))}
F={'desc':'opis','coKupic':'co_kupic','dla':'dla','category':'kategoria','kind':'rodzaj','occ':'okazje','www':'www','godziny':'godziny','hoursNote':'godziny_uwaga','bez_godzin':'bez_godzin'}
n=0
for i in range(3):
    for pid,v in json.load(open(f'/home/claude/gz/zk/weryf{i}.json')).items():
        nm=P[pid]['name']; g=[k for k in M if M[k]['nazwa']==nm]; assert len(g)==1,nm; m=M[g[0]]
        for f,x in (v.get('popraw') or {}).items():
            if f=='usun':
                if x: M.pop(g[0]); break
                continue
            if f=='occ': x=[o for o in x if o not in ('niedziela','centrum')]
            if f=='coKupic' and isinstance(x,list): x=", ".join(x)
            if f=='godziny' and x: m.pop('godziny_uwaga',None) if 'hoursNote' not in v['popraw'] else None
            if x is None: m.pop(F[f],None)
            else: m[F[f]]=x
            n+=1
json.dump(K,open('collector/kuracja_zakupy.json','w'),ensure_ascii=False,indent=1)
print("poprawek",n,"miejsc",len(M))

by2("Piekarnia Artystyczna")['adres']="Wojciechowska 3 (róg Morwowej), 20-704 Lublin"
json.dump(K,open('collector/kuracja_zakupy.json','w'),ensure_ascii=False,indent=1)
for v in M.values():
    for f in ('opis','co_kupic','dla'):
        if v.get(f): v[f]=v[f].replace('macaroniki','makaroniki').replace('chemeksy','chemexy').replace('autorskie cebulage','autorskie „cebulage”')
json.dump(K,open('collector/kuracja_zakupy.json','w'),ensure_ascii=False,indent=1)
