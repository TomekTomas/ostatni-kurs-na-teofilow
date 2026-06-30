# Rejestr licencji assetów

| Zakres | Pochodzenie / licencja | Status publikacji |
| --- | --- | --- |
| `assets/fonts/lexend-deca-*.woff2` | Lexend Deca, SIL Open Font License 1.1 | Do publikacji |
| `assets/icons/`, `assets/ui/`, `assets/branding/` | Assety projektu Ostatni Kurs / Tomasz Tomas; billboardy LCN pozostają lokalnym elementem świata gry | Do publikacji w ramach projektu |
| `assets/backgrounds/`, `assets/sprites/`, wybrane `assets/generated/` | Assety wygenerowane i opracowane dla projektu | Do publikacji w ramach projektu |
| `assets/audio/konstal_ride_loop.ogg`, `pesa_ride_loop.ogg` | Dźwięki wygenerowane przez Tomasza Tomasa, autora projektu | Prawa potwierdzone przez autora 2026-06-30; do publikacji |
| `assets/audio/taniec-eleny.ogg` | Brak potwierdzonej licencji dystrybucyjnej | Wykluczony z artefaktu `_site` i runtime |
| Arkusze w `assets/generated/*sheet*.png` | Pliki zrodlowe do ciecia sprite'ow | Wykluczone z artefaktu `_site` |

`tools/build-release.js` kopiuje tylko jawną listę plików runtime. Nie kopiuje testów,
narzędzi, arkuszy źródłowych ani pliku `taniec-eleny.ogg`.

Workflow Pages wymaga zmiennej repozytorium `AUDIO_LICENSES_CONFIRMED=true`.
Prawa do obu pętli jazdy zostały potwierdzone przez autora projektu. Zmienna pozostaje
dodatkowym zabezpieczeniem przed przypadkową publikacją niezweryfikowanego audio.
