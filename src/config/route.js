import { ROUTE_SCALE } from "./constants.js";

export const STOPS = [
  { id: "zarzew", street: "Lodowa", name: "Cm. Zarzew", distance: 0.0, board: 30, alight: 0, timeBonus: 4, bg: "zarzew" },
  { id: "przybyszewskiego", street: "Lodowa", name: "Przybyszewskiego", distance: 0.4, board: 7, alight: 3, timeBonus: 3, bg: "widzew-wschod" },
  { id: "lodowa", street: "Przybyszewskiego", name: "Lodowa", distance: 0.7, board: 6, alight: 4, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-sybirakow-a", street: "Przybyszewskiego", name: "Rondo Sybiraków", distance: 1.2, board: 8, alight: 6, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-sybirakow-b", street: "Puszkina", name: "Rondo Sybiraków", distance: 1.4, board: 5, alight: 5, timeBonus: 3, bg: "widzew-wschod" },
  { id: "chmielowskiego", street: "Puszkina", name: "Chmielowskiego", distance: 1.8, board: 6, alight: 5, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-inwalidow", street: "Puszkina", name: "Rondo Inwalidów", distance: 2.3, board: 7, alight: 6, timeBonus: 3, bg: "rokicinska" },
  { id: "maszynowa", street: "Rokicińska", name: "Maszynowa", distance: 2.9, board: 6, alight: 6, timeBonus: 3, bg: "rokicinska" },
  { id: "widzew-stadion", street: "Piłsudskiego", name: "Widzew Stadion", distance: 3.4, board: 12, alight: 10, timeBonus: 4, bg: "widzew" },
  { id: "niciarniana", street: "Piłsudskiego", name: "Niciarniana", distance: 4.0, board: 9, alight: 8, timeBonus: 3, bg: "wima" },
  { id: "konstytucyjna", street: "Piłsudskiego", name: "Konstytucyjna (Wi-Ma)", distance: 4.5, board: 10, alight: 9, timeBonus: 4, bg: "wima" },
  { id: "sarnia", street: "Piłsudskiego", name: "Sarnia", distance: 5.1, board: 7, alight: 7, timeBonus: 3, bg: "wima" },
  { id: "smiglego", street: "Piłsudskiego", name: "Śmigłego-Rydza", distance: 5.6, board: 10, alight: 9, timeBonus: 3, bg: "wima" },
  { id: "przedzalniana", street: "Piłsudskiego", name: "Przędzalniana", distance: 6.0, board: 7, alight: 8, timeBonus: 3, bg: "centrum" },
  { id: "targowa", street: "Piłsudskiego", name: "Targowa", distance: 6.5, board: 10, alight: 10, timeBonus: 3, bg: "centrum" },
  { id: "kilinskiego", street: "Piłsudskiego", name: "Kilińskiego", distance: 6.9, board: 12, alight: 12, timeBonus: 3, bg: "centrum" },
  { id: "sienkiewicza", street: "Piłsudskiego", name: "Sienkiewicza", distance: 7.4, board: 10, alight: 12, timeBonus: 3, bg: "piotrkowska" },
  { id: "piotrkowska", street: "Mickiewicza", name: "Piotrkowska Centrum", distance: 8.0, board: 22, alight: 20, timeBonus: 5, bg: "piotrkowska" },
  { id: "zeromskiego", street: "Mickiewicza", name: "Żeromskiego", distance: 8.6, board: 10, alight: 13, timeBonus: 3, bg: "piotrkowska" },
  { id: "mickiewicza", street: "Włókniarzy", name: "Mickiewicza (Dw. Ł. Kaliska)", distance: 9.3, board: 14, alight: 16, timeBonus: 4, bg: "kaliska" },
  { id: "karolewska", street: "Włókniarzy", name: "Karolewska (Dw. Ł. Kaliska)", distance: 9.6, board: 13, alight: 14, timeBonus: 4, bg: "kaliska" },
  { id: "legionow", street: "Włókniarzy", name: "Legionów", distance: 10.5, board: 10, alight: 13, timeBonus: 3, bg: "wlokniarzy" },
  { id: "srebrzynska", street: "Włókniarzy", name: "Srebrzyńska", distance: 11.0, board: 8, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "dlugosza", street: "Włókniarzy", name: "Długosza", distance: 11.4, board: 8, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "zubardzka", street: "Włókniarzy", name: "Zubardzka", distance: 11.9, board: 8, alight: 11, timeBonus: 3, bg: "wlokniarzy" },
  { id: "lutomierska", street: "Włókniarzy", name: "Lutomierska", distance: 12.3, board: 10, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "pulaskiego", street: "Limanowskiego", name: "Pułaskiego", distance: 12.9, board: 7, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "woronicza", street: "Limanowskiego", name: "Woronicza", distance: 13.4, board: 7, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "bielicowa", street: "Aleksandrowska", name: "Bielicowa", distance: 14.1, board: 6, alight: 14, timeBonus: 3, bg: "teofilow" },
  { id: "traktorowa", street: "Aleksandrowska", name: "Traktorowa", distance: 14.6, board: 5, alight: 16, timeBonus: 3, bg: "teofilow" },
  { id: "kaczencowa", street: "Aleksandrowska", name: "Kaczencowa", distance: 15.2, board: 3, alight: 18, timeBonus: 3, bg: "teofilow" },
  { id: "szparagowa", street: "Aleksandrowska", name: "Szparagowa", distance: 15.6, board: 2, alight: 18, timeBonus: 3, bg: "teofilow" },
  { id: "szczecinska", street: "Aleksandrowska", name: "Szczecińska", distance: 16.2, board: 1, alight: 20, timeBonus: 3, bg: "teofilow" },
  { id: "teofilow", street: "-", name: "Teofilów", distance: 16.7, board: 0, alight: 999, timeBonus: 14, bg: "teofilow" }
].map((stop) => ({ ...stop, distance: Math.round(stop.distance * ROUTE_SCALE), timeBonus: Math.round(stop.timeBonus * 1.8) }));
export const ROUTE_END_DISTANCE = STOPS[STOPS.length - 1].distance;

export const EVENTS = [
  { type: "pothole", distance: 1.05 },
  { type: "car", distance: 1.58 },
  { type: "power", distance: 2.55 },
  { type: "rough", distance: 3.72 },
  { type: "pothole", distance: 4.82 },
  { type: "car", distance: 5.92 },
  { type: "rough", distance: 6.62 },
  { type: "power", distance: 7.85 },
  { type: "pothole", distance: 8.95 },
  { type: "car", distance: 9.72 },
  { type: "rough", distance: 10.82 },
  { type: "power", distance: 12.12 },
  { type: "pothole", distance: 13.05 },
  { type: "car", distance: 14.38 },
  { type: "rough", distance: 15.88 }
].map((event) => ({ ...event, distance: Math.round(event.distance * ROUTE_SCALE) }));

export const LIGHTS = [
  { id: "l1", distance: 1.22, offset: 0.5 },
  { id: "l2", distance: 3.4, offset: 4.2 },
  { id: "l3", distance: 5.6, offset: 7.1 },
  { id: "l4", distance: 7.4, offset: 2.4 },
  { id: "l5", distance: 9.3, offset: 6.3 },
  { id: "l6", distance: 12.3, offset: 1.6 },
  { id: "l7", distance: 14.6, offset: 5.6 }
].map((light) => ({ ...light, distance: Math.round(light.distance * ROUTE_SCALE) }));

export const SWITCHES = [
  {
    id: "pilsudskiego",
    name: "Piłsudskiego / centrum",
    distance: Math.round(7.55 * ROUTE_SCALE),
    correct: "straight",
    correctLabel: "PROSTO Piłsudskiego",
    wrongLabel: "SKRĘT w bok",
    hint: "Zwrotnica: trzymaj PROSTO na Piłsudskiego"
  },
  {
    id: "kaliska",
    name: "Mickiewicza / Włókniarzy",
    distance: Math.round(9.18 * ROUTE_SCALE),
    correct: "left",
    correctLabel: "SKRĘT we Włókniarzy",
    wrongLabel: "PROSTO na Kaliską",
    hint: "Zwrotnica: skręć we Włókniarzy przed Kaliską"
  },
  {
    id: "lutomierska",
    name: "Lutomierska / Limanowskiego",
    distance: Math.round(12.45 * ROUTE_SCALE),
    correct: "straight",
    correctLabel: "PROSTO na Teofilów",
    wrongLabel: "SKRĘT na Lutomierską",
    hint: "Zwrotnica: prosto, nie zjeżdżaj z kursu"
  }
];

export const LCN_BILLBOARDS = [
  { distance: Math.round(2.05 * ROUTE_SCALE), key: "lcn-billboard-1", y: 494, scale: 0.68 },
  { distance: Math.round(4.35 * ROUTE_SCALE), key: "lcn-billboard-2", y: 488, scale: 0.64 },
  { distance: Math.round(7.25 * ROUTE_SCALE), key: "lcn-billboard-3", y: 490, scale: 0.66 },
  { distance: Math.round(10.2 * ROUTE_SCALE), key: "lcn-billboard-1", y: 494, scale: 0.64 },
  { distance: Math.round(14.7 * ROUTE_SCALE), key: "lcn-billboard-2", y: 488, scale: 0.62 }
];

export const ROUTE_MOMENTS = [
  { id: "zarzew-cemetery", distance: Math.round(0.18 * ROUTE_SCALE), text: "Zarzew: spokojny start przy cmentarzu, nie szarp nastawnikiem.", color: "#d9d3c4" },
  { id: "sybirakow-roundabout", distance: Math.round(1.12 * ROUTE_SCALE), text: "Rondo Sybiraków: ciasny rytm przystanków, lepiej hamować wcześniej.", color: "#f4d35e" },
  { id: "rokicinska-track", distance: Math.round(2.55 * ROUTE_SCALE), text: "Rokicińska: tor potrafi podrzucić, trzymaj spokojny przelot.", color: "#8fb7e8" },
  { id: "widzew-crowd", distance: Math.round(3.22 * ROUTE_SCALE), text: "Stadion po prawej: spodziewaj się tłumu i pilnuj czerwonego.", color: "#ffb22e" },
  { id: "widzew-good-run", distance: Math.round(3.52 * ROUTE_SCALE), text: "Widzew Stadion: czysty przejazd tutaj smakuje jak wygrany mecz.", color: "#ffb22e" },
  { id: "wima-factory", distance: Math.round(4.46 * ROUTE_SCALE), text: "Wi-Ma / Księży Młyn: fabryczne tło, stare torowisko i dużo cierpliwości.", color: "#d9d3c4" },
  { id: "kilinskiego-city", distance: Math.round(6.85 * ROUTE_SCALE), text: "Kilińskiego i centrum: patrz na pieszych, nie tylko na rozkład.", color: "#f4d35e" },
  { id: "piotrkowska-transfer", distance: Math.round(7.85 * ROUTE_SCALE), text: "Centrum przesiadkowe: lepiej czysty postój niż gonienie sekund.", color: "#f4d35e" },
  { id: "unicorn-stable", distance: Math.round(8.05 * ROUTE_SCALE), text: "Stajnia Jednorożców: dużo przesiadek, pokaż ładne zatrzymanie.", color: "#ffb22e" },
  { id: "kaliska-switch", distance: Math.round(9.02 * ROUTE_SCALE), text: "Za chwilę Kaliska: przygotuj skręt we Włókniarzy.", color: "#8fb7e8" },
  { id: "atlas-arena", distance: Math.round(9.42 * ROUTE_SCALE), text: "Kaliska / Atlas Arena: ruch miesza się z dworcem, trzymaj bufor.", color: "#8fb7e8" },
  { id: "wlokniarzy-run", distance: Math.round(10.85 * ROUTE_SCALE), text: "Włókniarzy: długi odcinek kusi prędkością, ale przystanki są blisko.", color: "#d9d3c4" },
  { id: "lutomierska-choice", distance: Math.round(12.35 * ROUTE_SCALE), text: "Lutomierska: jeden zły skręt i Teofilów robi się wspomnieniem.", color: "#ffb22e" },
  { id: "teofilow-suburb", distance: Math.round(14.55 * ROUTE_SCALE), text: "Teofilów: robi się spokojniej, ale ludzie chcą dojechać do domu.", color: "#50d2c2" },
  { id: "teofilow-final", distance: Math.round(15.8 * ROUTE_SCALE), text: "Ostatni odcinek: dowieź skład do Teofilowa bez szarpania.", color: "#50d2c2" }
];

export const BACKGROUNDS = [
  "zarzew",
  "widzew-wschod",
  "rokicinska",
  "widzew",
  "wima",
  "centrum",
  "piotrkowska",
  "kaliska",
  "wlokniarzy",
  "teofilow"
];
