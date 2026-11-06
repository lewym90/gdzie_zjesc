"""Menu z PDF-ów: tekst (pdfplumber), a gdy PDF to skan, OCR (tesseract, polski)."""
import json, io, sys, subprocess, tempfile, os, re
sys.path.insert(0, "/home/claude/scripts")
from menu import items_from, get, OUT
import pdfplumber, pypdfium2

def pdf_lines(data):
    lines = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for pg in pdf.pages[:12]:
            t = pg.extract_text(layout=False) or ""
            lines += [re.sub(r"\s+", " ", l).strip() for l in t.split("\n") if l.strip()]
    if sum(len(l) for l in lines) > 300: return lines, "tekst"
    doc = pypdfium2.PdfDocument(data); out = []
    for i in range(min(len(doc), 8)):
        im = doc[i].render(scale=2.2).to_pil()
        with tempfile.NamedTemporaryFile(suffix=".png") as f:
            im.save(f.name)
            t = subprocess.run(["tesseract", f.name, "-", "-l", "pol", "--psm", "4"], capture_output=True, text=True, timeout=120).stdout
        out += [re.sub(r"\s+", " ", l).strip() for l in t.split("\n") if l.strip()]
    return out, "ocr"

res = json.load(open(OUT))
todo = [(k, v) for k, v in res.items() if v.get("pdf") and v.get("status") != "menu" and (not v.get("pdf_done") or "--again" in sys.argv)]
print("PDF do sprawdzenia:", len(todo), flush=True)
ok = 0
for k, v in todo:
    try:
        r = get(v["pdf"])
        lines, how = pdf_lines(r.content)
        items = items_from(lines)
        if len(items) < 6:
            b = items_from(lines, bare=True)
            if len(b) > len(items): items = b
        v["pdf_done"] = True
        if len(items) >= 6:
            vals = sorted(i["v"] for i in items); mains = [x for x in vals if x >= 15] or vals
            lo, hi = mains[len(mains) // 10], mains[-1 - len(mains) // 10]
            v.update({"status": "menu", "url": v["pdf"], "items": [{x: i[x] for x in ("cat", "name", "desc", "price") if i.get(x)} for i in items[:150]], "range": f"{lo:.0f}–{hi:.0f} zł", "zrodlo": "pdf-" + how})
            ok += 1
        print(how, len(items), v["pdf"][-60:], flush=True)
    except Exception as e:
        v["pdf_done"] = True; print("błąd", str(e)[:60], flush=True)
    json.dump(res, open(OUT, "w"), ensure_ascii=False)
print("nowych menu z PDF:", ok)
