# Gdzie zjeść: kontynuacja

## Założenia od właściciela
- Aplikacja tylko wyświetla lokale (nazwa, adres, zdjęcia, po dotknięciu wszystkie szczegóły i link do strony). Żadnych rezerwacji ani innych funkcji.
- Na razie tylko Lublin. Inne miasta kiedyś, np. na wakacje.
- Zero kosztów: bez płatnego Google API. Dane czytane z publicznych stron (Mapy Google w przeglądarce bez logowania, strony lokali).
- Wygląd według projektu właściciela: czerń, bordo, złoto, krem. Ikona od właściciela. Bez błędów pisowni.
- Grafiki (tła, kafelki) generuje właściciel z gotowych promptów.

## Stan
- Wersja 1: ekran startowy, Odkrywaj (kuchnie, klimat, okazja, polecane), wyniki z filtrami, szczegóły lokalu (galeria, Informacje, Menu, Godziny, Kontakt), Kuchnie, Filtry, Ulubione (zapis w telefonie).
- Pełny ekran na iOS: `.app` jest fixed, przewija się `main`, w `index.html` jest niewidoczny `#docspacer` (ten sam sposób co w kalendarzu).

## Źródła danych i co sprawdzono 6.11.2026
- Mapy Google bez logowania działają z chmury i z serwera właściciela, ale w „ograniczonym widoku”: nie ma menu, przedziału cen ani zakładki „Informacje” (poza ułatwieniami dostępu). Są: nazwa, ocena, liczba opinii, kategoria, adres, strona, telefon, godziny, kilka opinii, ok. 10 zdjęć.
- Wyszukiwarka Google (panel z menu i cenami) daje captchę od pierwszego zapytania, zarówno z chmury, jak i z serwera. Nie używać.
- OpenStreetMap (Overpass) jest niedostępny z chmury Claude'a, ale powinien działać z serwera. Do uzupełnienia listy.
- Wolt odpowiada z serwera (status 200). Jeszcze niewykorzystany jako źródło menu.
- Menu ze stron lokali: `collector/menu.py` (zwykłe zapytania HTTP). Działa dla stron z menu w tekście. Menu w PDF i na obrazkach: tylko link (plan: Gemini z darmowym kluczem).

## Zbieranie danych (collector/)
1. `listing.py`: wyszukiwania w Mapach (kategorie i dzielnice) → `data/listing.json`.
2. `details_run.py N`: szczegóły każdego lokalu (N równoległych okien) → `data/details.json`.
3. `menu.py`: menu ze stron lokali → `data/menu.json`.
4. `build_data.py`: kuchnie, typ lokalu, klimat i okazja (z kategorii Google, nazwy i opinii) → `data/places.json` aplikacji.
Ścieżki w skryptach wskazują na środowisko Claude'a (`/home/claude/gz`). Przy przenosinach na serwer trzeba je zmienić.

## Klimat i okazja: tylko ręczna lista
- Etykiety eleganckie, romantyczne, luksusowe, kameralne i okazja biznesowa nadaje wyłącznie `collector/kuracja.json` (fragmenty nazw zatwierdzone przez Claude'a po przejrzeniu lokali). Słowa z opinii o tym nie decydują, bo dawały błędy (np. „Zestawy obiadowe” jako eleganckie).
- Automatycznie: taras (opinie: ogródek, taras), randka (romantyczne lub eleganckie), rocznica (eleganckie i romantyczne lub luksusowe), urodziny (restauracja, pub, bar lub klub z oceną 4,4+, ponad 300 opinii i wzmianką o urodzinach lub grupach).
- `collector/kontrola.py` sprawdza katalog przed wysłaniem (tanie kategorie z etykietą elegancką, brak zdjęć, duplikaty, lokale poza Lublinem). Musi przejść bez błędów.
- Nowe lokale trzeba przejrzeć i dopisać do kuracja.json.

## Blokada Google
Po ok. 700 lokalach w jedną sesję z chmury Claude'a Mapy też dały captchę. Dalsze zbieranie robić z serwera właściciela, wolno (1 okno, przerwy). Ok. 200 lokali z drugiej tury wyszukiwań czeka na szczegóły (`data/listing.json` w środowisku Claude'a).

## Mapa
Zakładka Mapa: Leaflet i markercluster w vendor/leaflet (ładowane dopiero po wejściu w zakładkę). Kafelki tile.openstreetmap.org z filtrem CSS (jasny, wyciszony styl). CARTO odpadło, bo bez klucza pokazuje znak wodny „API KEY REQUIRED”. Bordowe większe punkty to lokale eleganckie. Etykieta: zdjęcie, nazwa, kuchnia, ocena, link do karty. Lokalizacja przez watchPosition; mapa centruje się na użytkowniku tylko, gdy jest w Lublinie. Mapa trzyma stan (kontener #mapwrap poza #view).

## Aktualizacje w telefonie
Service worker (sw.js): pliki aplikacji i data/places.json zawsze najpierw z sieci (6 s limitu, potem kopia), przy starcie i powrocie do aplikacji `reg.update()`, po zmianie wersji jedno przeładowanie. Po 10 minutach w tle aplikacja sama dociąga świeże dane. Nie trzeba podbijać numerów wersji.

## Grafiki właściciela
img/start.jpg (ekran startowy) i img/kafle/*.jpg (kuchnia-…, klimat-…, okazja-…). build_data.py wpisuje listę dostępnych kafli do meta.tiles. Rodzaje lokali (lokal-…) mają ikony zamiast grafik.

## Zdjęcia
Adresy `lh3.googleusercontent.com/...` z dopiskiem rozmiaru (`=w900-h620-k-no`). Service worker trzyma w pamięci ok. 600 ostatnio oglądanych.

## Do zrobienia
- Uzupełnić listę lokali (OSM z serwera, kolejne wyszukiwania dzielnicami).
- Menu z PDF i obrazków (Gemini), menu z Wolta.
- Lepsze tagi klimatu i okazji (Gemini na opiniach), po rozmowie z właścicielem.
- Grafiki właściciela: tło ekranu startowego, kafelki kuchni i klimatu.
- Nocne odświeżanie na serwerze (wolno, żeby Google nie blokował).
