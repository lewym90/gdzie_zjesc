# Procedura: nowe miasto (lub kategoria) w aplikacji

Cel: właściciel pisze w czacie „jadę do X” (albo „dodaj Kraków”), a po 1–2 dniach X jest w aplikacji, dopracowany tak samo jak Lublin. Ten plik to jedyne źródło prawdy o tym, jak to robimy. Przy każdej nowej nauczce dopisz ją tutaj.

Zasada nadrzędna: **lepiej mniej lokali, ale sprawdzonych**. Żadnych etykiet subiektywnych bez ręcznej weryfikacji. Zero kosztów (bez płatnych API).

---

## 0. Jednorazowo, przed pierwszym miastem poza Lublinem (jeszcze NIE zrobione)

1. Aplikacja wielomiejska: wybór miasta w nagłówku (pigułka „Lublin”), dane w `data/<miasto>/places.json`, lista miast w `data/miasta.json` (nazwa, slug, środek mapy, zoom, prostokąt granic, data aktualizacji). Ulubione z kluczem miasta.
2. Zbieracz sparametryzowany miastem: `--miasto krakow` → zapytania „… Kraków”, dzielnice z pliku `collector/miasta/<slug>.json` (nazwa, granice lat/lng, lista dzielnic lub osiedli, środek mapy). Dziś Lublin jest wpisany na sztywno w: `listing.py` (zapytania, dzielnice, EXTRA), `build_data.py` (granice 51.13–51.32 / 22.42–22.72, `"city"`), `kontrola.py` (granice), ścieżki `/home/claude/gz/...`.
3. `kuracja.json`, `korekty.json`, `wykluczone.json` jako osobne pliki dla każdego miasta: `collector/miasta/<slug>/...`.
4. Zmiana nazwy aplikacji (bez miasta w nazwie), nowa ikona i nowy ekran powitalny (prompty dla właściciela).
5. Później: kategorie (Restauracje, Mechanik, Kosmetyczka…) jako kafelki na starcie; każda kategoria ma własny plik konfiguracji (filtry, pola karty, etykiety, grafiki).

Pierwsze miasta: największe miasta wojewódzkie, po jednym, bez pośpiechu: Warszawa, Kraków, Łódź, Wrocław, Poznań, Gdańsk (Trójmiasto), Szczecin, Bydgoszcz, Białystok, Katowice, Rzeszów, Olsztyn, Kielce, Opole, Zielona Góra, Toruń. Plus miasta na życzenie (np. Giżycko).

---

## 1. Co zbieramy o każdym lokalu (restauracje, puby, bary, kluby, kawiarnie, winiarnie, szybkie jedzenie)

| Pole | Źródło | Sposób |
|---|---|---|
| nazwa, kategoria Google, ocena, liczba opinii | Mapy Google | przeglądarka bez logowania (Playwright), `detail.py` |
| adres, współrzędne, telefon, strona www | Mapy Google | jw. (`data-item-id` address / authority / phone, współrzędne z URL `!3d!4d`) |
| zdjęcia (ok. 10–14) | Mapy Google | galeria, adresy `lh*.googleusercontent.com/...`, rozmiar dopisywany `=w900-h620-k-no` |
| godziny tygodniowe | 1) Mapy Google (tabela), 2) strona lokalu (`godziny_strony.py`), 3) OpenStreetMap z serwera (`osm_godziny.py`) | kolejność jak obok; w karcie dopisek o źródle, jeśli nie z Google |
| opinie (kilka–kilkanaście tekstów) | Mapy Google | zakładka Opinie, przewijanie |
| menu z cenami | strona lokalu (`menu.py`, tekst HTML) | tylko jeśli przejdzie `menu_ok()`; PDF i obrazki tylko jako link/przycisk (OCR dawał sieczkę) |
| link do menu | strona lokalu / Mapy | gdy nie ma rozpisanego menu |
| typ lokalu | kategoria Google → reguły w `build_data.py` | sieci (McDonald's, KFC…) na sztywno jako szybkie jedzenie |
| kuchnia | kategoria Google + nazwa → reguły, potem **ręczny przegląd** | poprawki w `korekty.json` → `kuchnie` |
| klimat: eleganckie, romantyczne, luksusowe, kameralne, nowoczesne, taras | **tylko ręcznie** | `kuracja.json` |
| okazje: biznesowa, rodzinna, urodziny | **tylko ręcznie** | `kuracja.json` |
| okazje: randka, rocznica | z klimatu (randka = eleganckie lub romantyczne; rocznica = eleganckie + romantyczne/luksusowe) | automatycznie |

Czego NIE da się dostać za darmo: Google Places API (płatne, właściciel odmówił), wyszukiwarka Google (captcha od pierwszego zapytania, z chmury i z serwera), pełny widok Map (menu i ceny są tylko po zalogowaniu; logowanie automatu ryzykowne).

---

## 2. Kolejne kroki dla nowego miasta

### Krok 1. Lista lokali (`listing.py`)
- Zapytania w Mapach: kategorie × miasto, potem kategorie × dzielnice (restauracja, pub, bar, kawiarnia, pizzeria, sushi, bistro, klub nocny, winiarnia, koktajl bar, kuchnie narodowe…).
- Celowane wyszukiwania elegancji: „elegancka restauracja X”, „fine dining X”, „restauracja hotelowa X”, „wine bar X”, „restauracja na randkę X”, „restauracja z widokiem X”, „restauracja Stare Miasto X”.
- Zapytanie, które otwiera od razu kartę lokalu (a nie listę), też jest zapisywane (poprawka z 6.11).
- Duże miasta: ograniczyć do najlepszych (np. min. 4,0 i 50+ opinii, a potem top 600–800 wg wyniku bayesowskiego). Małe miasta (Giżycko): bierzemy wszystko.

### Krok 2. Szczegóły (`details_run.py N`)
- 3 okna, przerwy 3–6 s. **Limit Google: ok. 700 lokali na sesję, potem captcha na ok. 1 h.** Większe miasta zbierać na raty albo z serwera właściciela (Mapy go wpuszczają).

### Krok 3. Menu (`menu.py`, `pdfmenu.py`) i godziny (`godziny_strony.py`, potem `osm_godziny.py` na serwerze: `curl -s https://raw.githubusercontent.com/lewym90/gdzie_zjesc/main/collector/osm_godziny.py | python3` → wklejone linie G|id|godziny → `godziny_osm.json`).
- Przejrzeć KAŻDY wynik godzin ze stron (odrzucić: godziny śniadań hotelu, dowozu, kuchni, sprzeczne zestawy na jednej stronie).
- Przejrzeć KAŻDY wynik z OSM (odrzucić „23:00-23:00”, samo „off”). Parser OSM: reguły dzielone po „;” albo „, ” tylko po godzinie (nie rozbijać „Sa,Su”), późniejsza reguła nadpisuje wcześniejszą.

### Krok 4. Budowa katalogu (`build_data.py`) i odsiew automatyczny
Odrzucane automatycznie:
- kategorie spoza gastronomii (biała lista GASTRO), salony urody („Eyebrow bar”!), sklepy, piekarnie-sklepy, catering, sale weselne, kasyna, kręgielnie, domy kultury, escape roomy, mobilne bary,
- mniej niż 5 opinii albo brak oceny,
- strony typu youtube/tiktok/twitch/gdladder/discord, opinie o grach (Geometry Dash, Minecraft…) — żarty w Mapach,
- lokale poza granicami miasta,
- lokale bez zdjęć,
- wpisy z `wykluczone.json`.

### Krok 5. RĘCZNY PRZEGLĄD (to decyduje o jakości)
1. **Nazwy wszystkich lokali**: szukać żartów (Siedziba Geometry Dash, Heisenberg's Grill House z memami z Breaking Bad), klubów ze striptizem, rzeczy niebędących lokalami (Żabka, automat z kawą na uczelni) → `wykluczone.json`.
2. **Lokale z małą liczbą opinii (< 60)**: kategoria, strona, pierwsza opinia.
3. **Okładki zdjęć**: plansze 8×6 miniatur z numerami (pierwsze zdjęcie każdego lokalu); złe okładki to kartki z telefonem, logo, tablice z cenami, paragony, banery polityczne, reklamy, ciemne nocne ujęcia, widok ulicy z daleka. Dla podejrzanych plansza 6 kolejnych zdjęć, wybrać okładkę i zdjęcia do usunięcia → `korekty.json` → `zdjecia` (indeksy wg kolejności w details.json).
4. **Kuchnie**: lista id | nazwa | kategoria | typ | kuchnie; typowe błędy: azjatyckie z doklejoną „europejską”, „Masala Polska” jako polska, puby z „owocami morza”, lokale gruzińskie, uzbeckie, wietnamskie, hot pot bez kuchni, sieci burgerowe bez „amerykańskiej”, eleganckie restauracje bez kuchni → `korekty.json` → `kuchnie`.
5. **Klimat i okazje**: przejrzeć restauracje, bary i winiarnie z oceną 4,2+ i 60+ opiniami (opinie + zdjęcia) i wpisać do `kuracja.json`. NIGDY z samych słów w opiniach (błędy: „znajdziecie” → „dzieci”, „przyjęcie zamówienia” → urodziny, „elegancko podane” przy zestawach obiadowych, narzekania na obsługę rodzin z dziećmi jako „rodzinna”, „okno z widokiem na patio” jako taras). Taras tylko, gdy opinia mówi, że da się siedzieć na zewnątrz.
6. **Sieci o tej samej nazwie** (Stół i Wół, Grill Bar): etykiety tylko dla konkretnego adresu: `"id:<id lokalu>"` w kuracja.json.
7. Celowo sprawdzić, czy najbardziej znane eleganckie miejsca miasta są w bazie (w Lublinie brakowało na początku Winestone i Alterii); jeśli nie, dociągnąć je wyszukiwaniem po nazwie.

### Krok 6. Kontrola i publikacja
- `collector/kontrola.py` musi przejść bez błędów.
- Test na symulowanym iPhonie (Playwright, iPhone 13 Pro Max): start, Odkrywaj, wyniki, karta, mapa z filtrami, brak błędów w konsoli; obejrzeć zrzuty.
- `python3 collector/publikuj.py` (nowy numer wersji, aplikacja sama się przeładuje), commit, push. GitHub Pages publikuje z opóźnieniem do ok. 7 minut.
- Dopisać miasto w `KONTYNUACJA.md` i w tym pliku (nauczki).

### Krok 7. Raport dla właściciela
Liczba lokali, ile ma menu i godziny, lista eleganckich i romantycznych, czego brakuje i dlaczego. Bez „wszystko sprawdzone”, jeśli czegoś nie sprawdzono.

---

## 3. Czas i obciążenie (szacunki)
- Małe miasto (Giżycko, ok. 100–150 lokali): kilka godzin, w tym przegląd.
- Duże miasto (top 600–800 lokali): 1–2 dni ze względu na limit Google i przegląd ręczny.
- Zbieranie na serwerze właściciela: tylko w folderze `/opt/gdzie-zjesc-*`, bez ruszania Caddyfile, portów innych aplikacji i nocnych zadań (3:10–4:20). Przed instalacją sprawdzić wolną pamięć (min. 700 MB).

## 4. Inne kategorie (gdy przyjdzie czas)
Ta sama procedura, z inną konfiguracją: mechanik (marki, usługi: klimatyzacja, hamulce, geometria, diagnostyka, opony; źródła: opisy, strony warsztatów, opinie, ręczny przegląd), kosmetyczka i fryzjer (usługi; Booksy ma cenniki i terminy), rozrywka (kino, teatr: link do repertuaru). Bez sklepów i lekarzy (brak wartości dodanej albo za duże ryzyko pomyłki).

## 5. Kategoria Noclegi (zrobiona dla Lublina, listopad 2026)
Dane w `data/noclegi.json`, widoki w `nocl.js`, adresy `#/n/...` (`#/n`, `#/n/wyniki`, `#/n/obiekt/<id>`, `#/n/rodzaj`, `#/n/cena`, `#/n/okazje`, `#/n/udogodnienia`, `#/n/mapa`, `#/n/filtry`, `#/n/ulubione`). Restauracje działają bez zmian pod `#/restauracje` i starymi adresami; ekran startowy to `#/`.
1. `noclegi_listing.py`: zapytania „hotel / apartamenty / pensjonat / hostel / noclegi … <miasto> [dzielnica]” → `noclegi_listing.json`.
2. `noclegi_details_run.py N` (moduł `hotel_detail.py`; adres z `?hl=pl&gl=pl`, żeby ceny były w złotych): cena za noc z datą, gwiazdki, rodzaj, zameldowanie i wymeldowanie, opis z zakładki Informacje, udogodnienia z etykiet „opcja dostępna / niedostępna”, opinie, zdjęcia.
3. `noclegi_build.py`: rodzaj (hotel, apartament, pensjonat, hostel) z nazwy i z Google, odległość od Rynku i dworca (strefy: Stare Miasto do 650 m, Centrum do 1,6 km, blisko dworca do 900 m), mapowanie udogodnień, link do restauracji w obiekcie, odsiew (min. 10 opinii i zdjęcia).
4. `kuracja_noclegi.json`: RĘCZNIE okazje (romantyczny, biznes, rodzina; spa z udogodnień + `spa_nie`), `nazwy` (krótkie, czyste nazwy zamiast reklamowych), `wykluczone`, `restauracje` (ręczne powiązanie z restauracją).
5. Ceny są orientacyjne (jedna noc w terminie, który akurat pokazał Google). Data w `price_date`. Przy odświeżaniu danych zaktualizować datę.
6. Uzupełnienia ze stron obiektów: `noclegi_strony.py` pobiera strony obiektów bez opisu, ceny, udogodnień lub godzin doby. Treść czyta się RĘCZNIE i wpisuje do `kuracja_noclegi.json` → `uzupelnienia` (opis własnymi słowami, cena z cennika za pokój dwuosobowy, doba, udogodnienia tylko podane wprost, `"www": null` przy błędnym linku z Google). W aplikacji widać dopisek „na podstawie strony obiektu” i „cennik na stronie obiektu”.
7. Ceny (ustalone z właścicielem 7.11.2026): ZAWSZE jedna miara = cena za noc za pokój/apartament dla 2 osób, w jednym wspólnym terminie (noc z piątku na sobotę). `noclegi_ceny.py RRRR-MM-DD` ustawia w Mapach Google datę przyjazdu i wyjazdu (obie trzeba kliknąć, inaczej Google nie przelicza) i czyta cenę „Od X zł za noc w dniach …”. Brak wolnych pokoi → `noclegi_ceny.py <następny piątek> --brakujace`; wtedy w aplikacji widać termin. Cennik ze strony obiektu tylko, gdy podaje wprost pokój dla 2 osób. Ceny z innych terminów i „za osobę” odrzucamy. Datę opisuje `price_date` i `ceny_terminy` w kuracja_noclegi.json. Odświeżać co jakiś czas (nowy piątek, ponowne uruchomienie, build, kontrola, publikacja).
8. Przegląd 7.11.2026: okazję „Z dziećmi” wybieramy RĘCZNIE (plac zabaw, pokoje rodzinne, apartamenty dla 4 osób). Oznaczenie Google „przyjazny dzieciom” jest za szerokie. Gwiazdki pokazujemy tylko przy hotelach, bo przy apartamentach i hostelach to szacunek Google, a nie kategoria. Zdjęcia główne przeglądamy wszystkie (`zdjecia` w kuracji: `pierwsze`, `usun`). Literówki w opisach Google poprawia `literowki`.

## 6. Kategoria Rozrywka (Lublin, listopad 2026) i wspólny mechanizm kategorii
- Od Rozrywki wszystkie kategorie poza Restauracjami działają na `kat.js` (`makeKat(konfiguracja)`). Konfiguracje: `nocl.js` (Noclegi, `#/n`), `rozr.js` (Rozrywka, `#/rz`). Nowa kategoria = nowy plik z konfiguracją + `<script>` w index.html + wpis w sw.js.
- Rozrywka: `rozrywka_listing.py` → `rozrywka_details_run.py 4` (moduł `hotel_detail.py`, zapisuje też zakładkę Informacje) → `rozrywka_build.py --przeglad` → RĘCZNA kuracja `kuracja_rozrywka.json` → `rozrywka_kontrola.py` (0 błędów).
- Grupy: kino i scena, ruch i sport, gry i zagadki, woda i zabawa, dla dzieci, wieczorem. Grupę daje kategoria Google, a wyjątki ustawia `grupa`.
- Odsiewamy: szkoły, kursy i półkolonie (to nie rozrywka na jeden raz), animatorów i organizatorów imprez, baseny szkolne i uczelniane, małe osiedlowe place zabaw, filie domów kultury, kluby nocne i puby (są w Restauracjach), muzea i trasy (będą w Zwiedzaniu) oraz salony gier hazardowych.
- Ceny tylko jako tekst z jednostką (`cena` w `uzupelnienia`), np. „Pokój dla grupy 2–4 osób: od 240 zł”. Filtra ceny nie ma, bo każdy liczy inaczej.
- „Pod dachem” jest domyślne, a wyjątki ustawia `indoor: false`. Okazja „Na deszczowy dzień” = wszystko pod dachem poza grupą „wieczorem”.
- ZASADA (właściciel, 7.11.2026): miejsce może być w kilku kategoriach naraz, jeśli dobrze pasuje. Rozrywka bierze z Restauracji wszystkie kluby (do grupy „Wieczorem”) oraz wybrane puby i bary z karaoke, koncertami, planszówkami, bilardem lub rzutkami (`z_restauracji` w kuracji). Karta ma link „Także w Restauracjach”. To samo zrobimy w Relaksie (spa hotelowe z Noclegów).

## 9. Uzupełnianie braków (opisy, godziny, ceny) – Rozrywka
- `kuracja_rozrywka.json` → `uzupelnienia[nazwa wyświetlana]`: `desc`, `cena`, `godziny` (tekst „pon–pt 10:00–20:00, sob–nd 9:00–21:00”, nadpisuje Mapy), `zrodlo` (`strona` / `siec` / `opinie` – pokazywane pod opisem), `wiek`, `indoor`, `link`, `www`. Działa też dla miejsc wziętych z Restauracji.
- Kolejność źródeł: strona obiektu → portale miejskie, GoOut, eBilet, Tripadvisor (wyszukiwarka) → opinie w Mapach Google (tylko fakty powtarzane przez wielu gości). Facebook i Instagram wymagają logowania – nie obchodzimy tego.
- Opisy zawsze własnymi słowami, 1 zdanie, bez „najlepszy”. Godziny tylko z aktualnego, jednoznacznego źródła; miejsca sezonowe opisujemy w `desc`, bez godzin.
- `tagi` (kategoria → synonimy) trafiają do wyszukiwarki, np. Kręgielnia → „kręgle bowling”.
- `wykluczone_z_restauracji`: nazwy z places.json, których nie przenosimy do Rozrywki (np. słabe oceny).
- Telefony: build usuwa ukryty znak ikonki z Map (U+E0B0) – bez tego link „zadzwoń” był błędny.
- Adresy i godziny: obowiązują te z Map Google (najbardziej aktualne); inne serwisy często mają stare adresy – nie poprawiamy na ich podstawie.
- Kluby/stowarzyszenia bez stałego miejsca (np. „Legia Paintballowa” – klub fanów) wykluczamy.

## 10. Nazwy, kontrola całości
- Nazwy restauracji porządkuje `collector/nazwy.py` (bez „Lublin”, bez opisów po myślniku, bez WIELKICH LITER i form prawnych; oddział sieci jako „Nazwa · Felicity”). Ręczne wyjątki: `korekty.json` → `nazwy`. Oryginał z Map zostaje w polu `gname` (wyszukiwarka, kuracja, Rozrywka dopasowują po nim; id się nie zmienia).
- Ograniczony widok Map Google pokazuje dla części lokali godziny tylko na dziś (gdy mają kilka grafików, np. „Kuchnia”) – pełnego tygodnia nie da się wtedy pobrać; zostają bez godzin, chyba że poda je strona lub OSM.
- Pełny przegląd: crawl wszystkich kart (`scripts_n/crawl.py`: błędy JS, puste widoki, niewczytane zdjęcia), przegląd tras (`trasy.py`), słownik pl_PL (spylls) na opisach, losowa próbka zdjęć.

## 11. Kategoria Relaks (Lublin, listopad 2026)
- Prefiks `rl`, konfiguracja `relaks.js`, dane `data/relaks.json`, grafiki `img/banery/relaks-*.jpg` (7 rodzajów: spa, masaz, zabiegi, sauna, baseny, grota, joga; 4 okazje: dwoje, solo, znajomi, prezent) i `kat-relaks.jpg`.
- Zbieranie: `collector/relaks_listing.py` (≈75 zapytań w Mapach) → `relaks_details_run.py` (filtr nazw: bez kosmetyki, klinik, fizjoterapii, siłowni, masażu erotycznego, „auto spa”) → strony WWW (`scripts_n/rlwww.py`).
- Do aplikacji trafia WYŁĄCZNIE to, co jest w `kuracja_relaks.json` → `miejsca` (klucz = id z Map): nazwa, rodzaj, kategoria, opis (2–3 zdania, własnymi słowami), źródło, `ma`, okazje, cena ze strony/cennika, `cennik`, `godziny`/`godziny_uwaga`, `adres` (tylko gdy Mapy podają go nieczytelnie), `nocleg` (id w Noclegach – wtedy w Noclegach pokazuje się link „Spa na miejscu”).
- Hotele tylko z prawdziwym spa (sauna, basen, jacuzzi lub zabiegi); zaznaczamy, czy wejdą goście spoza hotelu.
- Dwie niezależne kontrole: kuracja (sprawdzenie stron i cenników), potem osobna weryfikacja każdego faktu; `relaks_kontrola.py` musi dać 0 błędów. Kolejność buildów: relaks_build → noclegi_build (link zwrotny).
