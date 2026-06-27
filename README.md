# Ostatni Kurs na Teofilow

Arcade survival w Phaser 3: dowiez pasazerow tramwajem przez przystanki, krzywe tory i lodzkie przeszkody.

Trasa gry jest wzorowana na linii tramwajowej 8 w kierunku `Cm. Zarzew -> Teofilow`, z duza liczba przystankow i lokalizacjami dopasowanymi do odcinkow trasy.

## Uruchomienie

Otworz `landing.html` w przegladarce, zeby zobaczyc strone promocyjna, albo `game.html`, zeby wejsc prosto do gry. `index.html` zostaje lekkim fallbackiem/redirectem do landing page.

Gra laduje Phaser 3 z CDN, wiec potrzebuje dostepu do internetu przy pierwszym uruchomieniu. Service worker cache'uje lokalne pliki gry i assety, ale runtime Phasera nadal pochodzi z CDN.

Wygodniej podczas pracy uruchomic lokalny serwer:

```powershell
node tools\dev-server.js
```

Projekt bedzie pod `http://127.0.0.1:4173`, a glowny flow to `landing.html -> game.html`.

Szybki audyt techniczny projektu:

```powershell
node tools\audit-game.js
```

Pelna lokalna weryfikacja:

```powershell
npm run verify
```

Sprawdza brakujace assety, komplet backgroundow, kolejnosc i odstepy przystankow, podstawowe referencje do polish assetow oraz testy czystej logiki gry.

## Sprite'y

Glowne sprite'y tramwajow wygenerowane komponentem obrazow sa w `assets/trams`.
Zrodlowy sheet jest w `assets/generated/tram-side-sprite-sheet.png`, a wycinki robi skrypt:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-trams.ps1 -SheetPath assets\generated\tram-side-sprite-sheet.png
```

Pomocnicze pixel-artowe PNG sa w `assets/sprites`. Mozesz je odtworzyc komenda:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-sprites.ps1
```

Ten generator tworzy tez male warianty pasazerow `passenger-a.png` do `passenger-e.png`, uzywane na peronach.

Sprite'y bocznych aut, autobusow, rowerzysty i pieszych dla ruchu ulicznego odtwarza:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-traffic-sprites.ps1
```

Otwarta wersje sprite'ow tramwajow, uzywana jako trick przy otwartych drzwiach, odtwarza:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-open-trams.ps1
```

Dodatkowe obiekty ulicy, drzewa, lampy, slupki i kosze:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-street-props.ps1
```

Assety stowarzyszenia Lodz Cala Naprzod, lokalne fonty Lexend Deca oraz pixel-artowe billboardy-easter eggi odtwarza:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-lcn-assets.ps1
```

Wygenerowany modulem obrazow billboard importuje i oczyszcza z tla:

```powershell
powershell -ExecutionPolicy Bypass -File tools\import-generated-billboard.ps1
```

Pixel-artowe elementy interfejsu sa w `assets/ui`. Odtworzenie pakietu przyciskow, paneli HUD, minimapy i ekranow modalnych:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-ui-assets.ps1
```

Tla trasy sa w `assets/backgrounds`. Zrodlowy sheet z 8 lokacjami Lodz-style jest w `assets/generated/lodz-route-background-sheet.png`, a wycinki robi:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-route-backgrounds.ps1 -SheetPath assets\generated\lodz-route-background-sheet.png
```

Skrypt zapisuje gotowe plansze `1280x440`, z kadrowaniem bez rozciagania proporcji.

Dodatkowe proceduralne tla osiedlowe dla wschodniego odcinka trasy mozna odtworzyc tak:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-extra-backgrounds.ps1
```

Nowszy arkusz tla wygenerowany wbudowanym generatorem obrazow jest w `assets/generated/lodz-route-background-sheet-v2.png`. Wycinki do gry robi:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-backgrounds-v2.ps1
```

Nowszy arkusz pojazdow i pieszych jest w `assets/generated/traffic-sprite-sheet-v2.png`. Wycinki z usuwaniem tla robi:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-traffic-v2.ps1
```

Finalny arkusz pojazdow, roweru cargo, pieszych i rekwizytow jest w `assets/generated/traffic-sprite-sheet-v3.png`. Wycinki z chroma-key i recznym kadrowaniem robi:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-traffic-v3.ps1
```

Arkusz roadwork z pacholkiem, dziura w asfalcie, barierka, znakiem, beczka, workami i wlazem jest w `assets/generated/roadwork-sprite-sheet-v1.png`. Wycinki:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-roadworks-v1.ps1
```

Proste awaryjne warianty ruchu ulicznego i male rekwizyty uliczne odtwarza:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-extra-traffic-sprites.ps1
```

Arkusz nowoczesnych wiat przystankowych jest w `assets/generated/station-shelter-sheet-v2.png`. Wycinki:

```powershell
powershell -ExecutionPolicy Bypass -File tools\crop-generated-stations-v2.ps1
```

## Sterowanie

- Strzalki lub `A` / `D`: zmiana nastawnika predkosci.
- `Spacja`: drzwi, gdy stoisz w strefie przystanku; dzwonek poza przystankiem.
- `Q` / `E`: ustawienie zwrotnicy, skret lub prosto.
- `P`: pauza.
- `R`: restart po zakonczeniu kursu.
- `Esc`: powrot do menu po zakonczeniu kursu.

## Petla gry

Jedziesz od przystanku do przystanku. W zoltej strefie trzeba wyhamowac prawie do zera, nacisnac `Spacja`, odczekac wymiane pasazerow i ruszyc dalej. Kazdy obsluzony przystanek daje punkty i troche czasu, a pominiety przystanek mocno obniza wynik.

Za szybka jazda po slabym torowisku przez ponad 2 sekundy konczy kurs wykolejeniem. Dodatkowo liczony jest rating zatrzymania `S/A/B/C`, combo za serie dobrych przystankow, podpowiedz zalecanej predkosci hamowania, swiatla z kara za przejazd na czerwonym i ruch uliczny w tle. Dziury, odcinki remontowe, auta na torach i zaniki napiecia obnizaja zadowolenie pasazerow oraz bonus za plynna jazde.

Predkosci pojazdow sa wewnetrznie zbalansowane na skali silnika, ale HUD przelicza je na czytelne km/h: Konstal ok. `65 km/h`, Pesa ok. `70 km/h`.

Przy obsludze przystanku drzwi tramwaju maja prosta animacje rozsuwania paneli na sprite'cie.

Menu ma wybor Konstala/Pesy, cztery tryby gry, podglad celow kursu przed startem oraz rekordy zapisywane per tryb w `localStorage`. W grze sa komunikaty segmentow trasy, milestone bonusy, animowani pasazerowie na peronach, popupy punktowe i pixel-artowe panele zamiast tymczasowych prostokatow.

Odleglosci trasy sa przeskalowane tak, aby miedzy przystankami byl realny odcinek jazdy, a nie kilka sekund slalomu. Na trasie sa tez zwrotnice: Pilsudskiego wymaga jazdy prosto, okolice Mickiewicza/Kaliskiej wymagaja skretu w Wlokniarzy, a dalej trzeba pilnowac kierunku na Teofilow.

Konstal jest renderowany jako sklad dwuwagonowy. Przy otwarciu drzwi gra podmienia sprite tramwaju na wersje z otwartymi drzwiami, auta po dzwonku zjezdzaja z torow zamiast znikac, a ruch uliczny i piesi poruszaja sie w tle. W oknach tramwaju pojawiaja sie sylwetki pasazerow proporcjonalnie do oblozenia.

HUD ma kompaktowy gorny pasek, licznik dystansu, mini predkosciomierz i wskaznik combo. W trybie `Ostatni kurs` trasa przechodzi przez zachod slonca w strone nocnego przejazdu. Menu i teksty w grze uzywaja fontu Lexend Deca, a na trasie pojawiaja sie billboardy Lodz Cala Naprzod jako easter egg.
