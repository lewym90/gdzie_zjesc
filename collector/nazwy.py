"""Porządkowanie nazw z Map Google (dopiski „Lublin”, opisy po myślniku, WIELKIE LITERY, formy prawne)."""
import re
LOK = r"(felicity|plaza|vivo!?|olimp|czechów|lsm|felin|stare miasto|śródmieście|tarasowa|rogera|gęsia|tysiąclecia|(galeria )?(olimp|vivo!?|felicity|plaza)|[a-ząćęłńóśźż]+ \d+[a-z]?)"
SKROTY = {"KFC", "ABC", "BBQ", "VIP", "PRO", "PKP", "MPWIK", "UMCS", "IBB", "PUB", "BAR", "AE"}
def tytul(s):
    def w(m):
        x = m.group(0)
        if x.upper() in SKROTY and x.upper() not in {"PUB", "BAR", "PRO"}: return x
        return x[0] + x[1:].lower()
    return re.sub(r"[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ']{2,}", w, s)
def czysc(n):
    s = n.strip()
    s = re.sub(r"\s+(sp\.\s*(z\s*o\.\s*o\.|j\.|k\.).*)$", "", s, flags=re.I)
    s = re.sub(r"\s*\((restaurant in lublin|w [^)]*|12\+)\)", "", s, flags=re.I)
    lok = None
    m = re.match(r"^(.{3,}?)\s+[-–|•]\s+(.+)$", s)
    if m:
        a, b = m.group(1).strip(), m.group(2).strip()
        bb = re.sub(r"\blublin\b", "", b, flags=re.I).strip(" -|")
        if re.fullmatch(LOK, bb, re.I): lok = bb
        s = a
    s = re.sub(r"(?<=\S)\s+lublin\b!?$|^lublin\s+|\s+lublin(?=\s+(plaza|felicity|lsm|felin|śródmieście|city))", "", s, flags=re.I)
    s = re.sub(r"\s+lublin\b!?", "", s, flags=re.I) if re.search(r"\blublin\b\s*!?$", s, re.I) else s
    s = re.sub(r"\s*[•|]\s*$", "", s).strip(" -–!")
    if sum(c.isupper() for c in s) > 0.7 * sum(c.isalpha() for c in s): s = tytul(s)
    if lok: s = f"{s} · {lok[0].upper() + lok[1:]}"
    return re.sub(r"\s{2,}", " ", s).strip()
