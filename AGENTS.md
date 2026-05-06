# AGENTS.md — Ostatni Kurs na Teofilow

## Projekt
Gra arcade w Phaser 3 (vanilla JS, bez bundlera). Tramwaj linii 8 Łódź.
Gracz prowadzi tramwaj przez 34 przystanki od Cm. Zarzew do Teofilowa.

## Zasady
- Nie modyfikuj plików w assets/ ani tools/ bez wyraźnej instrukcji
- Gra musi przechodzić: `node tools/audit-game.js`
- Font: Lexend Deca. Kolory: #033968, #33b54b, #ffffff, #ffb22e, #10131a
- Komentarze i nazwy zmiennych po angielsku, tekst UI po polsku
- Phaser 3 z CDN (`https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js`), nie z npm

## Architektura
Projekt jest zmodularyzowany na ES modules:

- `src/main.js` — punkt wejścia (73 linie): importy, config Phasera, bootstrap, runtime guards
- `src/config/constants.js` — BASE_WIDTH, HEIGHT, WIDTH, TRACK_Y, TRAM_BASE_Y, ROUTE_SCALE, FONT_FAMILY, SCORE_WEIGHTS
- `src/config/vehicles.js` — VEHICLES (Konstal 805Na, Pesa Swing)
- `src/config/modes.js` — GAME_MODES (last, training, rush, night)
- `src/config/route.js` — STOPS (34), EVENTS, LIGHTS, SWITCHES, LCN_BILLBOARDS, ROUTE_MOMENTS, BACKGROUNDS
- `src/config/districts.js` — DISTRICT_PROFILES, SURFACE_PALETTES, DISTRICT_VISUALS, BG_LABELS, MAJOR_STOP_IDS
- `src/config/ui.js` — UI_ASSETS, PASSENGER_KEYS, STATION_KEYS, MAP_LABELS, WIDZEW_STADIUM_MUSIC
- `src/scenes/BootScene.js` — preload assetów (~90 linii)
- `src/scenes/MenuScene.js` — menu, wybór pojazdu/trybu (~180 linii)
- `src/scenes/GameScene.js` — główna pętla gry (~2450 linii): fizyka, przystanki, scoring, HUD, tutorial, audio, ruch uliczny, piesi, catenary, pogoda, detale
- `src/logic/scoring.js` — czysta logika scoringu (testowalna)
- `src/logic/physics.js` — czysta logika fizyki (testowalna)
- `src/logic/route.js` — pomocnicze funkcje trasy
- `src/logic/missions.js` — ewaluacja misji
- `src/logic/balance.js` — balans pasażerów
- `src/styles.css` — style CSS gry
- `index.html` — punkt wejścia HTML, ładuje Phaser z CDN + main.js (type=module)
- `tools/audit-game.js` — regresyjny audyt regex (czyta WSZYSTKIE pliki .js z src/ rekurencyjnie)
- `tools/dev-server.js` — lokalny serwer na porcie 4173

## Sceny Phasera
1. **BootScene** — preload assetów (obrazy, audio, tła, UI)
2. **MenuScene** — wybór pojazdu (Konstal/Pesa), trybu gry (4 tryby), wyświetlanie rekordu
3. **GameScene** — główna pętla gry: fizyka, przystanki, scoring, HUD, tutorial, audio

## Kluczowe mechaniki
- 4 tryby gry: Ostatni kurs, Trening, Godziny szczytu, Nocny kurs
- 2 pojazdy: Konstal 805Na, Pesa Swing (różne parametry)
- System zwrotnic (3 na trasie)
- Sygnalizacja świetlna (7 na trasie)
- Eventy losowe: dziury, auta na torach, zanik zasilania, zły tor
- System oceny: plynnosc, zadowolenie, punktualnosc, combo
- Ocena kursu: S/A/B/C/D/N
- 7 celów misji do zaliczenia
- Historia kursów w localStorage
- Profile dzielnic (ruch, piesi, tło, dispatcher radio)
- Touch controls na mobile (throttle slider)

## Weryfikacja zmian
Po każdej zmianie uruchom:
```
node tools/audit-game.js
```
Powinno wypisać `GAME AUDIT OK`. Jeśli nie — napraw przed kontynuacją.
