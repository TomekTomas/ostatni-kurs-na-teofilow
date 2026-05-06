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
- `src/main.js` — cała logika gry (3171 linii, 3 sceny Phasera: BootScene, MenuScene, GameScene)
- `src/styles.css` — style CSS gry
- `index.html` — punkt wejścia, ładuje Phaser z CDN + main.js
- `tools/audit-game.js` — regresyjny audyt regex (czyta src/main.js i sprawdza obecność kluczowych wzorców)
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
