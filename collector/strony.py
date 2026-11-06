"""Strony do udostępniania: l/<id>.html z podglądem (zdjęcie, nazwa, opis) dla iMessage, WhatsApp, Messengera."""
import json, os, html, glob
D = json.load(open("data/places.json"))
CZ = {c["id"]: c["label"] for c in D["meta"]["cuisines"]}
os.makedirs("l", exist_ok=True)
for f in glob.glob("l/*.html"): os.remove(f)
for p in D["places"]:
    e = lambda x: html.escape(str(x or ""), quote=True)
    bits = [", ".join(CZ[c] for c in p["cuisines"][:2])] if p["cuisines"] else []
    def pl(n):
        return "opinia" if n == 1 else "opinie" if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14) else "opinii"
    if p.get("rating"): bits.append(f"★ {str(p['rating']).replace('.', ',')} ({p['reviews']} {pl(p['reviews'])})")
    addr = (p.get("address") or "").replace(", Polska", "")
    desc = " · ".join(b for b in bits if b) + (f" · {addr}" if addr else "")
    imgu = p["photos"][0] + "=w1200-h630-k-no"
    open(f"l/{p['id']}.html", "w").write(f"""<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8">
<title>{e(p['name'])} · Gdzie zjeść</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:type" content="website"><meta property="og:site_name" content="Gdzie zjeść">
<meta property="og:title" content="{e(p['name'])}"><meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{e(imgu)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0909">
<style>body{{margin:0;background:#0b0909;color:#efe6da;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}}</style>
<script>location.replace("../#/lokal/{e(p['id'])}");</script></head>
<body><a href="../#/lokal/{e(p['id'])}" style="color:#d6a84e">{e(p['name'])}</a></body></html>""")
print("stron:", len(D["places"]))
