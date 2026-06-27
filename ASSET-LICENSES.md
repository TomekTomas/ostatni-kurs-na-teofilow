# Rejestr licencji assetow

| Zakres | Pochodzenie / licencja | Status publikacji |
| --- | --- | --- |
| `assets/fonts/lexend-deca-*.woff2` | Lexend Deca, SIL Open Font License 1.1 | Do publikacji |
| `assets/icons/`, `assets/ui/`, `assets/branding/` | Assety projektu LCN / Ostatni Kurs | Do publikacji w ramach projektu |
| `assets/backgrounds/`, `assets/sprites/`, wybrane `assets/generated/` | Assety wygenerowane i opracowane dla projektu | Do publikacji w ramach projektu |
| `assets/audio/konstal_ride_loop.ogg`, `pesa_ride_loop.ogg` | Lokalne nagrania/petle projektu | Do publikacji po potwierdzeniu autora repozytorium |
| `assets/audio/taniec-eleny.ogg` | Brak potwierdzonej licencji dystrybucyjnej | Wykluczony z artefaktu `_site` i runtime |
| Arkusze w `assets/generated/*sheet*.png` | Pliki zrodlowe do ciecia sprite'ow | Wykluczone z artefaktu `_site` |

`tools/build-release.js` kopiuje tylko jawna liste plikow runtime. Nie kopiuje testow,
narzedzi, arkuszy zrodlowych ani pliku `taniec-eleny.ogg`.

Workflow Pages wymaga zmiennej repozytorium `AUDIO_LICENSES_CONFIRMED=true`.
Ustaw ja dopiero po potwierdzeniu praw do obu petli jazdy; bez niej deployment jest celowo blokowany.
