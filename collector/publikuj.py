"""Ustawia nowy numer wersji w app.js, sw.js i version.json. Uruchamiać przed każdym commitem z repo."""
import re, json, time
v = time.strftime("%Y%m%d-%H%M%S")
for f in ("app.js", "sw.js"):
    s = open(f).read()
    s = re.sub(r'(APP_V|WERSJA) = "[^"]*"', lambda m: f'{m.group(1)} = "{v}"', s, count=1)
    open(f, "w").write(s)
json.dump({"v": v}, open("version.json", "w"))
print("wersja", v)
