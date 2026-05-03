const WIDTH = 1280;
const HEIGHT = 720;
const TRACK_Y = 560;
const TRAM_BASE_Y = 628;
const ROUTE_SCALE = 5500;
const ROUTE_LENGTH = 94000;
const FONT_FAMILY = '"Lexend Deca", "Segoe UI", Arial, sans-serif';

const VEHICLES = {
  konstal: {
    name: "Konstal 805Na",
    maxSpeed: 315,
    displayMaxSpeed: 65,
    acceleration: 116,
    braking: 236,
    handling: 0.82,
    comfort: 0.78,
    shake: 1.45,
    capacity: 92,
    spriteScale: 0.31,
    door: { xs: [-520, -105, 448], y: -106, w: 92, h: 142, color: 0x050607, edge: 0xf4d35e },
    passengerSeats: [-430, -385, -250, -205, -30, 38, 126, 196, 318, 382],
    passengerY: -132
  },
  pesa: {
    name: "Pesa Swing",
    maxSpeed: 315,
    displayMaxSpeed: 70,
    acceleration: 148,
    braking: 270,
    handling: 1.05,
    comfort: 1.13,
    shake: 0.72,
    capacity: 78,
    spriteScale: 0.43,
    door: { xs: [-493, -110, 405, 658], y: -86, w: 82, h: 132, color: 0x050607, edge: 0xe8c13c },
    passengerSeats: [-590, -530, -440, -380, -260, -200, -70, -10, 120, 185, 315, 380, 500, 565],
    passengerY: -68
  }
};

const GAME_MODES = {
  last: {
    label: "Ostatni kurs",
    description: "Normalny balans, pelna punktacja",
    timeLimit: 860,
    traffic: 1,
    eventPressure: 1,
    speedAllowance: 1,
    trackMin: 0.36,
    trackMax: 0.94,
    passengerDemand: 1,
    dwellScale: 1,
    night: false,
    allowGameOver: true
  },
  training: {
    label: "Trening",
    description: "Dluzszy czas, lagodniejsze kary",
    timeLimit: 1260,
    traffic: 0.75,
    eventPressure: 0.65,
    speedAllowance: 1.12,
    trackMin: 0.44,
    trackMax: 0.98,
    passengerDemand: 0.85,
    dwellScale: 0.9,
    night: false,
    allowGameOver: false
  },
  rush: {
    label: "Godziny szczytu",
    description: "Wiecej ruchu i mniej czasu",
    timeLimit: 760,
    traffic: 1.65,
    eventPressure: 1.25,
    speedAllowance: 0.94,
    trackMin: 0.32,
    trackMax: 0.9,
    passengerDemand: 1.25,
    dwellScale: 1.14,
    night: false,
    allowGameOver: true
  },
  night: {
    label: "Nocny kurs",
    description: "Ciemniej, luzniejszy ruch, wyzsze tempo",
    timeLimit: 900,
    traffic: 0.55,
    eventPressure: 0.8,
    speedAllowance: 1.22,
    trackMin: 0.48,
    trackMax: 0.98,
    passengerDemand: 0.58,
    dwellScale: 0.72,
    night: true,
    allowGameOver: true
  }
};

const STOPS = [
  { id: "zarzew", street: "Lodowa", name: "Cm. Zarzew", distance: 0.0, board: 30, alight: 0, timeBonus: 4, bg: "zarzew" },
  { id: "przybyszewskiego", street: "Lodowa", name: "Przybyszewskiego", distance: 0.4, board: 7, alight: 3, timeBonus: 3, bg: "widzew-wschod" },
  { id: "lodowa", street: "Przybyszewskiego", name: "Lodowa", distance: 0.7, board: 6, alight: 4, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-sybirakow-a", street: "Przybyszewskiego", name: "Rondo Sybirakow", distance: 1.2, board: 8, alight: 6, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-sybirakow-b", street: "Puszkina", name: "Rondo Sybirakow", distance: 1.4, board: 5, alight: 5, timeBonus: 3, bg: "widzew-wschod" },
  { id: "chmielowskiego", street: "Puszkina", name: "Chmielowskiego", distance: 1.8, board: 6, alight: 5, timeBonus: 3, bg: "widzew-wschod" },
  { id: "rondo-inwalidow", street: "Puszkina", name: "Rondo Inwalidow", distance: 2.3, board: 7, alight: 6, timeBonus: 3, bg: "rokicinska" },
  { id: "maszynowa", street: "Rokicinska", name: "Maszynowa", distance: 2.9, board: 6, alight: 6, timeBonus: 3, bg: "rokicinska" },
  { id: "widzew-stadion", street: "Pilsudskiego", name: "Widzew Stadion", distance: 3.4, board: 12, alight: 10, timeBonus: 4, bg: "widzew" },
  { id: "niciarniana", street: "Pilsudskiego", name: "Niciarniana", distance: 4.0, board: 9, alight: 8, timeBonus: 3, bg: "wima" },
  { id: "konstytucyjna", street: "Pilsudskiego", name: "Konstytucyjna (Wi-Ma)", distance: 4.5, board: 10, alight: 9, timeBonus: 4, bg: "wima" },
  { id: "sarnia", street: "Pilsudskiego", name: "Sarnia", distance: 5.1, board: 7, alight: 7, timeBonus: 3, bg: "wima" },
  { id: "smiglego", street: "Pilsudskiego", name: "Smiglego-Rydza", distance: 5.6, board: 10, alight: 9, timeBonus: 3, bg: "wima" },
  { id: "przedzalniana", street: "Pilsudskiego", name: "Przedzalniana", distance: 6.0, board: 7, alight: 8, timeBonus: 3, bg: "centrum" },
  { id: "targowa", street: "Pilsudskiego", name: "Targowa", distance: 6.5, board: 10, alight: 10, timeBonus: 3, bg: "centrum" },
  { id: "kilinskiego", street: "Pilsudskiego", name: "Kilinskiego", distance: 6.9, board: 12, alight: 12, timeBonus: 3, bg: "centrum" },
  { id: "sienkiewicza", street: "Pilsudskiego", name: "Sienkiewicza", distance: 7.4, board: 10, alight: 12, timeBonus: 3, bg: "piotrkowska" },
  { id: "piotrkowska", street: "Mickiewicza", name: "Piotrkowska Centrum", distance: 8.0, board: 22, alight: 20, timeBonus: 5, bg: "piotrkowska" },
  { id: "zeromskiego", street: "Mickiewicza", name: "Zeromskiego", distance: 8.6, board: 10, alight: 13, timeBonus: 3, bg: "piotrkowska" },
  { id: "mickiewicza", street: "Wlokniarzy", name: "Mickiewicza (Dw. L. Kaliska)", distance: 9.3, board: 14, alight: 16, timeBonus: 4, bg: "kaliska" },
  { id: "karolewska", street: "Wlokniarzy", name: "Karolewska (Dw. L. Kaliska)", distance: 9.6, board: 13, alight: 14, timeBonus: 4, bg: "kaliska" },
  { id: "legionow", street: "Wlokniarzy", name: "Legionow", distance: 10.5, board: 10, alight: 13, timeBonus: 3, bg: "wlokniarzy" },
  { id: "srebrzynska", street: "Wlokniarzy", name: "Srebrzynska", distance: 11.0, board: 8, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "dlugosza", street: "Wlokniarzy", name: "Dlugosza", distance: 11.4, board: 8, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "zubardzka", street: "Wlokniarzy", name: "Zubardzka", distance: 11.9, board: 8, alight: 11, timeBonus: 3, bg: "wlokniarzy" },
  { id: "lutomierska", street: "Wlokniarzy", name: "Lutomierska", distance: 12.3, board: 10, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "pulaskiego", street: "Limanowskiego", name: "Pulaskiego", distance: 12.9, board: 7, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "woronicza", street: "Limanowskiego", name: "Woronicza", distance: 13.4, board: 7, alight: 12, timeBonus: 3, bg: "wlokniarzy" },
  { id: "bielicowa", street: "Aleksandrowska", name: "Bielicowa", distance: 14.1, board: 6, alight: 14, timeBonus: 3, bg: "teofilow" },
  { id: "traktorowa", street: "Aleksandrowska", name: "Traktorowa", distance: 14.6, board: 5, alight: 16, timeBonus: 3, bg: "teofilow" },
  { id: "kaczencowa", street: "Aleksandrowska", name: "Kaczencowa", distance: 15.2, board: 3, alight: 18, timeBonus: 3, bg: "teofilow" },
  { id: "szparagowa", street: "Aleksandrowska", name: "Szparagowa", distance: 15.6, board: 2, alight: 18, timeBonus: 3, bg: "teofilow" },
  { id: "szczecinska", street: "Aleksandrowska", name: "Szczecinska", distance: 16.2, board: 1, alight: 20, timeBonus: 3, bg: "teofilow" },
  { id: "teofilow", street: "-", name: "Teofilow", distance: 16.7, board: 0, alight: 999, timeBonus: 14, bg: "teofilow" }
].map((stop) => ({ ...stop, distance: Math.round(stop.distance * ROUTE_SCALE), timeBonus: Math.round(stop.timeBonus * 1.8) }));

const EVENTS = [
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

const LIGHTS = [
  { id: "l1", distance: 1.22, offset: 0.5 },
  { id: "l2", distance: 3.4, offset: 4.2 },
  { id: "l3", distance: 5.6, offset: 7.1 },
  { id: "l4", distance: 7.4, offset: 2.4 },
  { id: "l5", distance: 9.3, offset: 6.3 },
  { id: "l6", distance: 12.3, offset: 1.6 },
  { id: "l7", distance: 14.6, offset: 5.6 }
].map((light) => ({ ...light, distance: Math.round(light.distance * ROUTE_SCALE) }));

const SWITCHES = [
  {
    id: "pilsudskiego",
    name: "Pilsudskiego / centrum",
    distance: Math.round(7.55 * ROUTE_SCALE),
    correct: "straight",
    correctLabel: "PROSTO Pilsudskiego",
    wrongLabel: "SKRET w bok",
    hint: "Zwrotnica: trzymaj PROSTO na Pilsudskiego"
  },
  {
    id: "kaliska",
    name: "Mickiewicza / Wlokniarzy",
    distance: Math.round(9.18 * ROUTE_SCALE),
    correct: "left",
    correctLabel: "SKRET w Wlokniarzy",
    wrongLabel: "PROSTO na Kaliska",
    hint: "Zwrotnica: skrec w Wlokniarzy przed Kaliska"
  },
  {
    id: "lutomierska",
    name: "Lutomierska / Limanowskiego",
    distance: Math.round(12.45 * ROUTE_SCALE),
    correct: "straight",
    correctLabel: "PROSTO na Teofilow",
    wrongLabel: "SKRET na Lutomierska",
    hint: "Zwrotnica: prosto, nie zjezdzaj z kursu"
  }
];

const LCN_BILLBOARDS = [
  { distance: Math.round(2.05 * ROUTE_SCALE), key: "lcn-billboard-1", y: 494, scale: 0.68 },
  { distance: Math.round(4.35 * ROUTE_SCALE), key: "lcn-billboard-2", y: 488, scale: 0.64 },
  { distance: Math.round(7.25 * ROUTE_SCALE), key: "lcn-billboard-3", y: 490, scale: 0.66 },
  { distance: Math.round(10.2 * ROUTE_SCALE), key: "lcn-billboard-1", y: 494, scale: 0.64 },
  { distance: Math.round(14.7 * ROUTE_SCALE), key: "lcn-billboard-2", y: 488, scale: 0.62 }
];

const BACKGROUNDS = [
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

const PASSENGER_KEYS = ["passenger-a", "passenger-b", "passenger-c", "passenger-d", "passenger-e"];
const WORLD_PASSENGER_KEYS = ["pedestrian-side-a", "pedestrian-side-b", "pedestrian-side-c"];
const PASSENGER_TINTS = [0xffffff, 0xfff1cf, 0xdcecff, 0xe6ffd9, 0xffdfd1];

const UI_ASSETS = [
  "button-primary",
  "button-secondary",
  "button-selected",
  "button-danger",
  "button-small",
  "panel-hud",
  "panel-dark",
  "route-pin",
  "warning-icon",
  "logo-plaque",
  "title-plaque",
  "stop-card",
  "pause-panel",
  "mini-map-panel"
];

const BG_LABELS = {
  zarzew: "Zarzew / cmentarz",
  "widzew-wschod": "Widzew Wschod",
  rokicinska: "Rokicinska",
  widzew: "Widzew i stadion",
  wima: "Ksiezy Mlyn / Wi-Ma",
  centrum: "Kamienice Lodzkie",
  piotrkowska: "Stajnia Jednorozcow",
  kaliska: "Atlas Arena / Kaliska",
  wlokniarzy: "Wlokniarzy",
  teofilow: "Teofilow"
};

const SURFACE_PALETTES = {
  zarzew: { sidewalk: 0x6b7479, street: 0x242b31, laneBack: 0x2d363d, laneFront: 0x1f262c, platform: 0x444a46, curb: 0xc4c1ad, tint: 0xb9c5b8 },
  "widzew-wschod": { sidewalk: 0x718190, street: 0x26313a, laneBack: 0x304050, laneFront: 0x202a32, platform: 0x465765, curb: 0xd0d8d2, tint: 0xc8d7e0 },
  rokicinska: { sidewalk: 0x657276, street: 0x222c32, laneBack: 0x2b363b, laneFront: 0x1e272c, platform: 0x414c4f, curb: 0xcbd1c9, tint: 0xbdd2cc },
  widzew: { sidewalk: 0x6b7886, street: 0x27313b, laneBack: 0x303b48, laneFront: 0x222a34, platform: 0x485461, curb: 0xd3d7d0, tint: 0xc4d2e4 },
  wima: { sidewalk: 0x786f66, street: 0x282724, laneBack: 0x332f28, laneFront: 0x211f1d, platform: 0x51483e, curb: 0xd0c0a0, tint: 0xd1b28a },
  centrum: { sidewalk: 0x69686b, street: 0x24272d, laneBack: 0x303035, laneFront: 0x202228, platform: 0x4e4b49, curb: 0xd0cabd, tint: 0xc9c0b5 },
  piotrkowska: { sidewalk: 0x726b67, street: 0x26262a, laneBack: 0x302d2d, laneFront: 0x211f21, platform: 0x554d48, curb: 0xd6c6af, tint: 0xd8c0a8 },
  kaliska: { sidewalk: 0x697684, street: 0x242b35, laneBack: 0x2d3642, laneFront: 0x1f252e, platform: 0x46515d, curb: 0xd1d6d8, tint: 0xc1cbd8 },
  wlokniarzy: { sidewalk: 0x606c74, street: 0x222a31, laneBack: 0x2a333b, laneFront: 0x1d242a, platform: 0x424b53, curb: 0xc5ced0, tint: 0xbac6cc },
  teofilow: { sidewalk: 0x697d77, street: 0x22302f, laneBack: 0x2b3b38, laneFront: 0x1d2928, platform: 0x435a51, curb: 0xc7d6cb, tint: 0xb7d4c0 }
};

const MAJOR_STOP_IDS = new Set([
  "zarzew",
  "widzew-stadion",
  "konstytucyjna",
  "piotrkowska",
  "mickiewicza",
  "legionow",
  "lutomierska",
  "teofilow"
]);

const STATION_KEYS = ["station", "station-long", "station-board"];

const MAP_LABELS = {
  zarzew: "Zarzew",
  "widzew-stadion": "Widzew",
  piotrkowska: "Centrum",
  mickiewicza: "Kaliska",
  lutomierska: "Lutom.",
  teofilow: "Teofilow"
};

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const spritePath = "assets/sprites";
    [
      "track",
      "manufaktura",
      "unicorn",
      "plac",
      "pothole",
      "car",
      "powerline",
      "passenger",
      "car-side-green",
      "car-side-cyan",
      "car-side-orange",
      "van-side-white",
      "bus-side",
      "bus-articulated-side",
      "maintenance-van-side",
      "roadworks-truck-side",
      "cyclist-side",
      "pedestrian-side-a",
      "pedestrian-side-b",
      "pedestrian-side-c",
      "prop-tree",
      "prop-lamp",
      "prop-pole",
      "prop-bin",
      "prop-bollard",
      ...PASSENGER_KEYS
    ].forEach((key) => {
      this.load.image(key, `${spritePath}/${key}.png`);
    });

    this.load.image("tram-konstal", "assets/trams/tram-konstal.png");
    this.load.image("tram-pesa", "assets/trams/tram-pesa.png");
    this.load.image("tram-konstal-open", "assets/trams/tram-konstal-open.png");
    this.load.image("tram-pesa-open", "assets/trams/tram-pesa-open.png");
    this.load.image("ai-car", "assets/sprites-ai/car.png");
    this.load.image("ai-car-green", "assets/sprites-ai/car-green.png");
    this.load.image("station", "assets/sprites/station-shelter-modern.png");
    this.load.image("station-long", "assets/sprites/station-shelter-long.png");
    this.load.image("station-board", "assets/sprites/station-shelter-board.png");
    this.load.image("station-pole-bench", "assets/sprites/station-pole-bench.png");
    this.load.image("lcn-logo-menu", "assets/branding/lcn-logo-menu.png");
    this.load.image("lcn-billboard-generated", "assets/branding/lcn-billboard-generated.png");
    this.load.image("lcn-billboard-1", "assets/branding/lcn-billboard-1.png");
    this.load.image("lcn-billboard-2", "assets/branding/lcn-billboard-2.png");
    this.load.image("lcn-billboard-3", "assets/branding/lcn-billboard-3.png");
    this.load.image("lodz-detail-lcn", "assets/generated/lodz-detail-lcn.png");
    this.load.image("lodz-detail-mural", "assets/generated/lodz-detail-mural.png");
    this.load.image("lodz-detail-cafe", "assets/generated/lodz-detail-cafe.png");
    this.load.image("lodz-detail-works", "assets/generated/lodz-detail-works-alpha.png");
    this.load.image("landmark-znicze", "assets/generated/landmark-znicze.png");
    this.load.image("landmark-drzewo", "assets/generated/landmark-drzewo.png");
    this.load.image("landmark-smolarek-mural", "assets/generated/landmark-smolarek-mural.png");
    this.load.image("landmark-witcher-mural", "assets/generated/landmark-witcher-mural.png");
    this.load.image("arrow-left", "assets/sprites-ai/arrow-left.png");
    this.load.image("arrow-right", "assets/sprites-ai/arrow-right.png");
    this.load.audio("ride-konstal", "assets/audio/konstal_ride_loop.ogg");
    this.load.audio("ride-pesa", "assets/audio/pesa_ride_loop.ogg");
    BACKGROUNDS.forEach((name) => this.load.image(`bg-${name}`, `assets/backgrounds/bg-${name}.png`));
    UI_ASSETS.forEach((key) => this.load.image(key, `assets/ui/${key}.png`));
  }

  create() {
    this.scene.start("MenuScene");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.selected = "konstal";
    this.selectedMode = "last";
    this.highScore = this.readHighScore();
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x10131a).setOrigin(0);
    this.add.image(WIDTH / 2, 302, "bg-piotrkowska").setAlpha(0.86);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x070808, 0.2).setOrigin(0);
    this.add.rectangle(0, 526, WIDTH, 194, 0x202832, 0.92).setOrigin(0);
    this.add.tileSprite(0, 560, WIDTH, 96, "track").setOrigin(0).setAlpha(0.95);
    this.add.rectangle(0, 655, WIDTH, 65, 0x3f4448).setOrigin(0);
    this.add.tileSprite(0, 663, WIDTH, 26, "plac").setOrigin(0).setScale(0.62, 0.2).setAlpha(0.24);

    this.add.image(WIDTH / 2, 74, "title-plaque").setOrigin(0.5).setScale(0.88, 0.86);
    this.add.text(WIDTH / 2, 50, "OSTATNI KURS", {
      fontSize: "31px",
      fontStyle: "700",
      color: "#ffb22e",
      stroke: "#111319",
      strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 94, "NA TEOFILOW", {
      fontSize: "19px",
      fontStyle: "700",
      color: "#f4efe4",
      stroke: "#111319",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.image(70, 156, "panel-hud").setOrigin(0).setScale(1.04, 1.22);
    this.add.text(98, 176, "REKORD", { fontSize: "15px", color: "#8ea0a8", fontStyle: "700" });
    this.add.text(98, 202, `${this.highScore}`, { fontSize: "32px", color: "#ffb22e", fontStyle: "700" });
    this.add.text(98, 240, "Linia 8: Zarzew -> Teofilow", { fontSize: "12px", color: "#f4efe4" });
    this.add.text(98, 262, "Cel: dowiez komplet pasazerow", { fontSize: "12px", color: "#d9d3c4" });
    this.add.image(462, 224, "lcn-logo-menu").setOrigin(0.5).setScale(0.3).setAlpha(0.96);

    this.konstalButton = this.makeVehicleButton(596, 156, "konstal");
    this.pesaButton = this.makeVehicleButton(596, 286, "pesa");
    this.refreshButtons();

    this.previewRear = this.add.sprite(500, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.preview = this.add.sprite(850, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.add.image(640, 570, "route-pin").setScale(1.2);
    this.add.image(1080, 570, "route-pin").setScale(1.2);
    this.add.text(622, 598, "Zarzew", { fontSize: "14px", color: "#f4efe4" });
    this.add.text(1052, 598, "Teofilow", { fontSize: "14px", color: "#f4efe4" });

    this.add.image(70, 318, "panel-dark").setOrigin(0).setScale(1.04, 1.34);
    this.add.text(98, 340, "STEROWANIE", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.add.text(98, 372, [
      "A/D lub strzalki: nastawnik",
      "SPACJA: drzwi lub dzwonek",
      "Q/E: zwrotnica skret/prosto",
      "P: pauza | R: restart"
    ], { fontSize: "12px", color: "#d9d3c4", lineSpacing: 3 });

    this.add.image(70, 488, "panel-dark").setOrigin(0).setScale(1.04, 1.5);
    this.add.text(98, 510, "TRYB", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.modeButtons = [
      this.makeModeButton(98, 544, "last"),
      this.makeModeButton(256, 544, "training"),
      this.makeModeButton(98, 594, "rush"),
      this.makeModeButton(256, 594, "night")
    ];
    this.modeDescription = this.add.text(98, 648, "", { fontSize: "11px", color: "#d9d3c4", wordWrap: { width: 360, useAdvancedWrap: true } });
    this.refreshModes();

    this.startButton = this.makeImageButton(914, 612, "button-primary", "START", () => this.startSelectedGame());

    this.input.keyboard.once("keydown-SPACE", () => this.startSelectedGame());
  }

  startSelectedGame() {
    this.scene.start("GameScene", { vehicleKey: this.selected, modeKey: this.selectedMode });
  }

  makeVehicleButton(x, y, key) {
    const vehicle = VEHICLES[key];
    const bg = this.add.image(x, y, "panel-hud").setOrigin(0).setScale(1.3, 1);
    const tramScale = vehicle.spriteScale * (key === "konstal" ? 0.3 : 0.36);
    const rear = key === "konstal"
      ? this.add.sprite(x + 260, y + 88, `tram-${key}`).setOrigin(0.5, 0.91).setScale(tramScale).setAlpha(0.92)
      : null;
    const tram = this.add.sprite(x + (key === "konstal" ? 380 : 360), y + 88, `tram-${key}`).setOrigin(0.5, 0.91).setScale(tramScale);
    const label = this.add.text(x + 22, y + 18, vehicle.name, { fontSize: "24px", color: "#f4efe4", fontStyle: "700" });
    const stats = this.add.text(x + 22, y + 54, `Vmax ${vehicle.displayMaxSpeed} km/h\nKomfort ${Math.round(vehicle.comfort * 100)}%  Ham. ${Math.round(vehicle.braking / vehicle.maxSpeed * 100)}%`, {
      fontSize: "12px",
      color: "#c6c1b8"
    });
    const zone = this.add.zone(x, y, 546, 112).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerdown", () => {
      this.selected = key;
      this.preview.setTexture(`tram-${key}`).setScale(vehicle.spriteScale * (key === "konstal" ? 0.82 : 0.74)).setX(key === "konstal" ? 850 : 760);
      this.previewRear.setTexture(`tram-${key}`).setScale(vehicle.spriteScale * 0.82).setX(500).setVisible(key === "konstal");
      this.refreshButtons();
    });
    return { key, bg, label, stats, tram, rear };
  }

  makeImageButton(x, y, texture, label, callback) {
    const image = this.add.image(x, y, texture).setOrigin(0);
    const text = this.add.text(x + 130, y + 36, label, {
      fontSize: "24px",
      fontStyle: "700",
      color: texture === "button-primary" ? "#111319" : "#f4efe4"
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 260, 74).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => image.setTexture(texture === "button-primary" ? "button-selected" : "button-primary"));
    zone.on("pointerout", () => image.setTexture(texture));
    zone.on("pointerdown", callback);
    return { image, text, zone };
  }

  makeModeButton(x, y, key) {
    const mode = GAME_MODES[key];
    const rect = this.add.rectangle(x, y, 138, 38, 0x111820, 0.92).setOrigin(0).setStrokeStyle(2, 0x4b5961, 1);
    const label = this.add.text(x + 69, y + 20, mode.label, {
      fontSize: "12px",
      fontStyle: "700",
      color: "#f4efe4"
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 138, 38).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerdown", () => {
      this.selectedMode = key;
      this.refreshModes();
    });
    return { key, rect, label };
  }

  readHighScore() {
    try {
      return Number(window.localStorage.getItem("ostatni-kurs-highscore") || 0);
    } catch (_) {
      return 0;
    }
  }

  refreshButtons() {
    [this.konstalButton, this.pesaButton].forEach((button) => {
      const active = button.key === this.selected;
      button.bg.setTint(active ? 0xffe0a6 : 0xffffff);
      button.label.setColor(active ? "#ffb22e" : "#f4efe4");
      button.tram.setAlpha(active ? 1 : 0.65);
      if (button.rear) button.rear.setAlpha(active ? 0.92 : 0.5);
    });
  }

  refreshModes() {
    this.modeButtons.forEach((button) => {
      const active = button.key === this.selectedMode;
      button.rect.setFillStyle(active ? 0xf4d35e : 0x111820, active ? 0.95 : 0.92);
      button.rect.setStrokeStyle(2, active ? 0xf4efe4 : 0x4b5961, 1);
      button.label.setColor(active ? "#111319" : "#f4efe4");
    });
    this.modeDescription.setText(GAME_MODES[this.selectedMode].description);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.vehicleKey = data.vehicleKey || "konstal";
    this.vehicle = VEHICLES[this.vehicleKey];
    this.modeKey = data.modeKey || (data.training ? "training" : "last");
    this.mode = GAME_MODES[this.modeKey] || GAME_MODES.last;
    this.training = this.modeKey === "training";
  }

  create() {
    this.distance = 0;
    this.speed = 0;
    this.throttle = 0;
    this.trackCondition = 0.74;
    this.nextConditionAt = 700;
    this.dangerTime = 0;
    this.satisfaction = 100;
    this.smoothness = 100;
    this.smoothnessSamples = [];
    this.rideEventPenalty = 0;
    this.inputJerk = 0;
    this.score = 0;
    this.timeLeft = this.mode.timeLimit;
    this.initialTimeLimit = this.mode.timeLimit;
    this.elapsedTime = 0;
    this.scheduleDuration = this.mode.timeLimit * 0.86;
    this.punctuality = 100;
    this.lastScheduleDelta = 0;
    this.passengers = Math.round(18 * this.mode.passengerDemand);
    this.pendingBoardingVisual = 0;
    this.delivered = 0;
    this.doorsOpen = false;
    this.dwell = 0;
    this.doorAnim = 0;
    this.bellCooldown = 0;
    this.powerTimer = 0;
    this.finished = false;
    this.lastThrottle = 0;
    this.currentStopIndex = 0;
    this.messageUntil = 0;
    this.signalPenaltyUntil = 0;
    this.precisionBonus = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.stopRating = "-";
    this.stopStreak = 0;
    this.currentBg = "zarzew";
    this.paused = false;
    this.finishBonusApplied = false;
    this.lastBgMessage = "zarzew";
    this.switchChoice = "straight";
    this.switchPenaltyUntil = 0;
    this.stats = {
      servedStops: 0,
      missedStops: 0,
      perfectStops: 0,
      onTimeStops: 0,
      earlyStops: 0,
      lateStops: 0,
      switchCorrect: 0,
      switchWrong: 0,
      bells: 0,
      carsCleared: 0,
      redSignals: 0,
      potholes: 0,
      powerLosses: 0,
      roughSections: 0
    };
    this.audioContext = null;
    this.rideLoop = null;
    this.rideLoopStarted = false;

    this.createWorld();
    this.createRouteObjects();
    this.createHud();
    this.createPauseOverlay();
    this.createControls();
    this.createRideLoop();
    this.showMessage(`${this.mode.label}: dowiez pasazerow na Teofilow`, 2400, "#f4d35e");
  }

  createWorld() {
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x6fb2d8).setOrigin(0);
    this.bgA = this.add.tileSprite(0, 86, WIDTH, 440, "bg-zarzew").setOrigin(0);
    this.bgB = this.add.tileSprite(0, 86, WIDTH, 440, "bg-zarzew").setOrigin(0).setAlpha(0);
    this.fitBackground(this.bgA);
    this.fitBackground(this.bgB);
    this.createNightLayer();
    this.sidewalkBack = this.add.rectangle(0, 496, WIDTH, 42, 0x69798a, 0.94).setOrigin(0);
    this.sidewalkBackBand = this.add.tileSprite(0, 504, WIDTH, 10, "plac").setOrigin(0).setScale(0.42, 0.09).setAlpha(0.2);
    this.street = this.add.rectangle(0, 538, WIDTH, 98, 0x242c35, 0.98).setOrigin(0);
    this.roadBackLane = this.add.rectangle(0, 540, WIDTH, 38, 0x2d363d, 0.92).setOrigin(0);
    this.roadFrontLane = this.add.rectangle(0, 588, WIDTH, 40, 0x1f262c, 0.94).setOrigin(0);
    this.curbBack = this.add.tileSprite(0, 532, WIDTH, 8, "plac").setOrigin(0).setScale(0.32, 0.06).setAlpha(0.42);
    this.roadStripeA = this.add.tileSprite(0, 548, WIDTH, 5, "track").setOrigin(0).setScale(1, 0.05).setAlpha(0.16);
    this.roadMedian = this.add.tileSprite(0, 570, WIDTH, 5, "plac").setOrigin(0).setScale(0.42, 0.08).setAlpha(0.18);
    this.laneA = this.add.tileSprite(0, 584, WIDTH, 6, "track").setOrigin(0).setScale(1, 0.06).setAlpha(0.18);
    this.roadStripeB = this.add.tileSprite(0, 626, WIDTH, 6, "track").setOrigin(0).setScale(1, 0.06).setAlpha(0.16);
    this.curbFront = this.add.tileSprite(0, 630, WIDTH, 8, "plac").setOrigin(0).setScale(0.32, 0.06).setAlpha(0.38);
    this.track = this.add.tileSprite(0, TRACK_Y, WIDTH, 96, "track").setOrigin(0);
    this.platform = this.add.rectangle(0, 650, WIDTH, 70, 0x3f4448).setOrigin(0);
    this.platformCurb = this.add.rectangle(0, 648, WIDTH, 5, 0xc9d0ce, 0.8).setOrigin(0);
    this.platformLines = this.add.tileSprite(0, 655, WIDTH, 28, "plac").setOrigin(0).setScale(0.62, 0.2).setAlpha(0.28);
    this.applySurfacePalette("zarzew");

    const tramX = this.vehicleKey === "konstal" ? 620 : 350;
    this.trams = [];
    if (this.vehicleKey === "konstal") {
      const rear = this.add
        .sprite(210, TRAM_BASE_Y, "tram-konstal")
        .setOrigin(0.5, 0.91)
        .setScale(this.vehicle.spriteScale)
        .setDepth(20);
      rear.carOffset = -410;
      this.trams.push(rear);
    }
    this.tram = this.add
      .sprite(tramX, TRAM_BASE_Y, `tram-${this.vehicleKey}`)
      .setOrigin(0.5, 0.91)
      .setScale(this.vehicle.spriteScale)
      .setDepth(21);
    this.tram.carOffset = 0;
    this.trams.push(this.tram);
    this.openTrams = this.trams.map((car) => {
      const overlay = this.add
        .sprite(car.x, car.y, `tram-${this.vehicleKey}-open`)
        .setOrigin(0.5, 0.91)
        .setScale(this.vehicle.spriteScale)
        .setDepth(car.depth + 0.2)
        .setAlpha(0);
      overlay.car = car;
      return overlay;
    });
    this.createDoorPanels();
    this.createOnboardPassengers();

    this.passengerSprites = this.add.group();
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(72 + i * 42, 682, WORLD_PASSENGER_KEYS[i % WORLD_PASSENGER_KEYS.length])
        .setScale(0.34)
        .setAlpha(0.86);
      p.baseY = 682;
      this.passengerSprites.add(p);
    }

    this.trafficCars = [
      this.makeTrafficCar(1320, 556, "car-side-green", 0.68, 74, "left", "back"),
      this.makeTrafficCar(1780, 556, "car-side-cyan", 0.68, 88, "left", "back"),
      this.makeTrafficCar(2340, 556, "van-side-white", 0.72, 62, "left", "back"),
      this.makeTrafficCar(-220, 606, "car-side-orange", 0.72, 54, "right", "front"),
      this.makeTrafficCar(-840, 606, "bus-side", 0.82, 42, "right", "front"),
      this.makeTrafficCar(-1560, 606, "bus-articulated-side", 0.82, 34, "right", "front")
    ];
    this.pedestrians = this.makePedestrians();
    this.catenary = this.makeCatenary();
    this.streetProps = this.makeStreetProps();
    this.streetLights = this.makeStreetLights();
    this.lcnBillboards = this.makeLcnBillboards();
    this.lodzDetails = this.makeLodzDetails();
  }

  createRouteObjects() {
    this.stations = STOPS.map((stop) => {
      const zone = this.add.rectangle(this.screenX(stop.distance), TRAM_BASE_Y + 18, 390, 58, 0xf4d35e, 0.09)
        .setStrokeStyle(2, 0xf4d35e, 0.62)
        .setVisible(false);
      const shelterKey = STATION_KEYS[(stop.id.length + stop.name.length) % STATION_KEYS.length];
      const shelterScale = shelterKey === "station" ? 0.48 : shelterKey === "station-long" ? 0.45 : 0.43;
      const shelter = this.add.image(this.screenX(stop.distance) + 106, 540, shelterKey).setScale(shelterScale).setAlpha(0.95).setDepth(12).setVisible(false);
      const card = this.add.image(this.screenX(stop.distance) - 118, 404, "stop-card").setOrigin(0).setScale(0.82, 0.82).setVisible(false);
      const label = this.add.text(this.screenX(stop.distance) - 102, 418, `${stop.name}\n${stop.street}`, {
        fontSize: stop.name.length > 18 ? "11px" : "13px",
        color: "#f4d35e",
        fontStyle: "700",
        wordWrap: { width: 218, useAdvancedWrap: true }
      }).setDepth(55).setVisible(false);
      card.setDepth(54);
      const waiting = this.add.group();
      const crowdSize = Math.max(1, Math.ceil((stop.board * this.mode.passengerDemand) / 7));
      for (let i = 0; i < crowdSize; i++) {
        const platformY = 676 - (i % 2) * 5;
        const person = this.createPassengerFigure(
          this.screenX(stop.distance) + 84 + i * 26,
          platformY,
          WORLD_PASSENGER_KEYS[(i + stop.id.length) % WORLD_PASSENGER_KEYS.length],
          0.38,
          48,
          {
            tint: PASSENGER_TINTS[(i + stop.name.length) % PASSENGER_TINTS.length],
            flip: i % 2 === 0
          },
          { shadow: true }
        ).setVisible(false);
        person.baseY = platformY;
        person.localStopOffset = 84 + i * 26;
        waiting.add(person);
      }
      return { ...stop, zone, shelter, card, label, waiting, served: false };
    });

    this.events = EVENTS.map((event, index) => {
      const key = event.type === "car" ? (index % 2 ? "car-side-green" : "car-side-orange") : event.type === "power" ? "powerline" : "pothole";
      const y = event.type === "car" ? 600 : event.type === "power" ? 160 : TRAM_BASE_Y - 14;
      const sprite = this.add.image(this.screenX(event.distance), y, key).setOrigin(0.5);
      if (event.type === "car") {
        sprite.setScale(0.84).setDepth(28);
        sprite.setFlipX(index % 2 === 0);
      }
      if (event.type === "power") sprite.setScale(0.9);
      if (event.type === "rough") sprite.setScale(1.4).setTint(0xffc14d);
      return {
        ...event,
        sprite,
        cleared: false,
        active: false,
        detouring: false,
        clearedByBell: false,
        warnDistance: event.type === "car" ? 320 : 0,
        stopDistance: event.type === "car" ? 116 : 0,
        collisionDistance: event.type === "car" ? 54 : 0,
        collisionHalfWidth: event.type === "car" ? 82 : 0
      };
    });

    this.lights = LIGHTS.map((light) => {
      const pole = this.add.rectangle(this.screenX(light.distance), 514, 6, 88, 0x2a2d31).setOrigin(0.5, 1);
      const box = this.add.rectangle(this.screenX(light.distance), 458, 24, 62, 0x121418).setStrokeStyle(2, 0x4c4f55, 1);
      const red = this.add.circle(this.screenX(light.distance), 440, 6, 0x522126);
      const amber = this.add.circle(this.screenX(light.distance), 458, 6, 0x5f4e21);
      const green = this.add.circle(this.screenX(light.distance), 476, 6, 0x1d4e33);
      const line = this.add.rectangle(this.screenX(light.distance) - 34, 592, 6, 74, 0xf4efe4).setOrigin(0.5);
      return { ...light, pole, box, red, amber, green, line, state: "green", penalized: false };
    });

    this.switches = SWITCHES.map((sw) => {
      const x = this.screenX(sw.distance);
      const base = this.add.rectangle(x, TRACK_Y + 54, 92, 8, 0x9aa0a5, 0.8).setOrigin(0.5);
      const branch = this.add.rectangle(x + 38, TRACK_Y + 36, 86, 7, 0x9aa0a5, 0.72).setOrigin(0, 0.5).setRotation(sw.correct === "left" ? -0.36 : 0.36);
      const lever = this.add.rectangle(x - 44, TRACK_Y + 20, 10, 42, 0x2a2d31).setOrigin(0.5, 1);
      const lamp = this.add.circle(x - 44, TRACK_Y - 28, 8, 0xf4d35e);
      const label = this.add.text(x - 122, TRACK_Y - 132, "", {
        fontSize: "13px",
        color: "#f4efe4",
        fontStyle: "700",
        backgroundColor: "#111319",
        padding: { x: 7, y: 4 },
        wordWrap: { width: 238, useAdvancedWrap: true }
      });
      return { ...sw, base, branch, lever, lamp, label, resolved: false, warned: false };
    });
  }

  createHud() {
    this.add.rectangle(0, 0, WIDTH, 92, 0x0f1419, 0.78).setOrigin(0);
    this.add.image(16, 8, "panel-dark").setOrigin(0).setScale(0.5, 0.68);
    this.add.image(WIDTH / 2 - 150, 8, "panel-dark").setOrigin(0).setScale(0.84, 0.68);
    this.add.rectangle(WIDTH - 430, 8, 408, 72, 0x0c1116, 0.94).setOrigin(0).setStrokeStyle(2, 0x4b5961, 0.95);

    this.clockText = this.add.text(36, 27, "", { fontSize: "26px", color: "#ffb22e", fontStyle: "700" });
    this.scoreText = this.add.text(WIDTH / 2, 28, "", { fontSize: "24px", color: "#ffb22e", fontStyle: "700" }).setOrigin(0.5, 0);
    this.nextText = this.add.text(WIDTH - 382, 18, "", {
      fontSize: "11px",
      color: "#f4efe4",
      fontStyle: "700",
      lineSpacing: -2,
      wordWrap: { width: 354, useAdvancedWrap: true }
    });
    this.signalText = this.add.text(WIDTH - 382, 52, "", { fontSize: "10px", color: "#d9d3c4" });
    this.scheduleText = this.add.text(WIDTH - 382, 66, "", { fontSize: "10px", color: "#ffb22e", fontStyle: "700" });

    this.warningText = this.add.text(WIDTH / 2, 250, "", {
      fontSize: "20px",
      color: "#ffb22e",
      fontStyle: "700",
      stroke: "#111319",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 820, useAdvancedWrap: true }
    }).setOrigin(0.5);

    this.add.image(16, 104, "panel-hud").setOrigin(0).setScale(1.32, 0.92).setAlpha(0.9);
    this.speedText = this.add.text(34, 120, "", { fontSize: "14px", color: "#f4efe4", fontStyle: "700" });
    this.trackText = this.add.text(34, 145, "", { fontSize: "12px", color: "#d9d3c4" });
    this.passengerText = this.add.text(34, 168, "", { fontSize: "12px", color: "#d9d3c4" });
    this.brakeText = this.add.text(34, 188, "", { fontSize: "12px", color: "#ffb22e", fontStyle: "700" });
    this.throttleBg = this.add.rectangle(282, 128, 140, 10, 0x20242b).setOrigin(0, 0.5);
    this.throttleFill = this.add.rectangle(282, 128, 1, 10, 0xf4d35e).setOrigin(0, 0.5);
    this.condBg = this.add.rectangle(282, 154, 140, 9, 0x20242b).setOrigin(0, 0.5);
    this.condFill = this.add.rectangle(282, 154, 1, 9, 0x50d2c2).setOrigin(0, 0.5);
    this.modeBadgeBg = this.add.rectangle(16, 210, 410, 62, 0x0f1419, 0.86).setOrigin(0).setStrokeStyle(2, 0x4b5961, 0.9);
    this.modeBadgeText = this.add.text(34, 220, "", { fontSize: "11px", color: "#f4efe4", fontStyle: "700", lineSpacing: 1, wordWrap: { width: 374, useAdvancedWrap: true } });
    this.nextSwitchText = this.add.text(34, 246, "", { fontSize: "10px", color: "#ffb22e", fontStyle: "700", wordWrap: { width: 374, useAdvancedWrap: true } });

    this.add.image(180, 672, "mini-map-panel").setOrigin(0).setScale(1, 0.86).setAlpha(0.94);
    this.routeLabel = this.add.text(200, 680, "Linia 8: Zarzew -> Teofilow", { fontSize: "12px", color: "#d9d3c4", fontStyle: "700" });
    this.progressBg = this.add.rectangle(210, 704, 860, 7, 0x111319, 0.85).setOrigin(0, 0.5);
    this.progressFill = this.add.rectangle(210, 704, 1, 7, 0xf4d35e).setOrigin(0, 0.5);
    STOPS.forEach((stop) => {
      const x = 210 + (stop.distance / ROUTE_LENGTH) * 860;
      const major = MAJOR_STOP_IDS.has(stop.id);
      this.add.rectangle(x, 704, major ? 5 : 2, major ? 22 : 10, major ? 0xf4efe4 : 0x8c9298, major ? 0.9 : 0.55).setOrigin(0.5);
      if (MAP_LABELS[stop.id]) this.add.text(x - 22, 672, MAP_LABELS[stop.id], { fontSize: "10px", color: "#f4efe4" });
    });
  }

  createControls() {
    this.touchState = {
      accelerate: false,
      brake: false
    };
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      p: Phaser.Input.Keyboard.KeyCodes.P,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    });
    this.createTouchControls();
  }

  createTouchControls() {
    const hasTouch = this.sys.game.device.input.touch || navigator.maxTouchPoints > 0;
    this.touchLayer = this.add.container(0, 0).setDepth(1500).setVisible(hasTouch);
    if (!hasTouch) return;

    const makeButton = (x, y, w, h, label, color, onDown, onUp = null) => {
      const bg = this.add.rectangle(x, y, w, h, 0x0c1116, 0.64)
        .setOrigin(0.5)
        .setStrokeStyle(2, color, 0.88);
      const text = this.add.text(x, y, label, {
        fontSize: "15px",
        fontStyle: "700",
        color: "#f4efe4",
        align: "center"
      }).setOrigin(0.5);
      const zone = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive();
      zone.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        bg.setFillStyle(color, 0.42);
        onDown();
      });
      const release = (pointer) => {
        pointer?.event?.preventDefault?.();
        bg.setFillStyle(0x0c1116, 0.64);
        if (onUp) onUp();
      };
      zone.on("pointerup", release);
      zone.on("pointerout", release);
      zone.on("pointerupoutside", release);
      this.touchLayer.add([bg, text, zone]);
      return { bg, text, zone };
    };

    makeButton(116, 590, 150, 72, "HAMUJ", 0xffb22e, () => { this.touchState.brake = true; }, () => { this.touchState.brake = false; });
    makeButton(1164, 590, 150, 72, "JAZDA", 0x50d2c2, () => { this.touchState.accelerate = true; }, () => { this.touchState.accelerate = false; });
    makeButton(640, 620, 154, 64, "DRZWI\nDZWONEK", 0xf4d35e, () => this.useActionButton());
    makeButton(1006, 672, 104, 54, "Q\nSKRET", 0x8fb7e8, () => this.setSwitchChoice("left"));
    makeButton(1130, 672, 104, 54, "E\nPROSTO", 0x8fb7e8, () => this.setSwitchChoice("straight"));
    makeButton(1226, 112, 72, 44, "PAUZA", 0xf4efe4, () => this.togglePause());
  }

  createPauseOverlay() {
    this.pauseLayer = this.add.container(0, 0).setDepth(1000).setVisible(false);
    this.pauseLayer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.45).setOrigin(0));
    this.pauseLayer.add(this.add.image(WIDTH / 2, HEIGHT / 2, "pause-panel").setOrigin(0.5));
    this.pauseLayer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 74, "PAUZA", {
      fontSize: "42px",
      fontStyle: "700",
      color: "#ffb22e"
    }).setOrigin(0.5));
    this.pauseLayer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 8, [
      "P: powrot do kursu",
      "R: restart",
      "Esc: menu"
    ], {
      fontSize: "22px",
      color: "#f4efe4",
      align: "center",
      lineSpacing: 12
    }).setOrigin(0.5));
  }

  update(_, deltaMs) {
    if (this.finished) {
      this.updateRideLoop(0, true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.scene.restart({ vehicleKey: this.vehicleKey, modeKey: this.modeKey });
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.scene.start("MenuScene");
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) this.togglePause();
    if (this.paused) {
      this.updateRideLoop(0, true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.scene.restart({ vehicleKey: this.vehicleKey, modeKey: this.modeKey });
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.scene.start("MenuScene");
      return;
    }

    const dt = deltaMs / 1000;
    this.updateInput(dt);
    this.updateMotion(dt);
    this.updateStations(dt);
    this.updateEvents(dt);
    this.updateSwitches();
    this.updateSignals();
    this.updateWorld(dt);
    this.updateRideLoop(dt);
    this.updateHud();
    this.checkEnd();
  }

  updateInput(dt) {
    const accelerate = this.cursors.up.isDown || this.cursors.right.isDown || this.keys.d.isDown || this.touchState.accelerate;
    const brake = this.cursors.down.isDown || this.cursors.left.isDown || this.keys.a.isDown || this.touchState.brake;
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
      this.setSwitchChoice("left");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      this.setSwitchChoice("straight");
    }
    if (!this.doorsOpen) {
      if (accelerate) this.throttle += 0.75 * dt;
      if (brake) this.throttle -= 1.15 * dt;
    } else {
      this.throttle = 0;
    }
    this.throttle = Phaser.Math.Clamp(this.throttle, 0, 1);

    const throttleRate = Math.abs(this.throttle - this.lastThrottle) / Math.max(dt, 0.016);
    this.inputJerk = Math.max(0, throttleRate - 0.95);
    if (this.inputJerk > 0) {
      this.adjustSatisfaction(-this.inputJerk * dt * (2.8 / this.vehicle.comfort));
    }
    this.lastThrottle = this.throttle;

    if (this.bellCooldown > 0) this.bellCooldown -= dt;
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.useActionButton();
    }
  }

  togglePause() {
    if (this.finished) return;
    this.paused = !this.paused;
    this.pauseLayer.setVisible(this.paused);
  }

  setSwitchChoice(choice) {
    this.switchChoice = choice;
    this.showMessage(choice === "left" ? "Zwrotnica ustawiona: SKRET" : "Zwrotnica ustawiona: PROSTO", 650, "#f4d35e");
  }

  useActionButton() {
    const stop = this.activeStop();
    if (stop && Math.abs(this.distance - stop.distance) < 138 && this.speed < 11) {
      this.toggleDoors(stop);
    } else if (stop && Math.abs(this.distance - stop.distance) < 138) {
      this.showMessage("Za szybko na otwarcie drzwi", 900, "#ffb22e");
    } else {
      this.ringBell();
    }
  }

  updateMotion(dt) {
    if (this.doorsOpen && this.speed > 3) {
      this.gameOver("Ruszono z otwartymi drzwiami");
      return;
    }

    const target = this.vehicle.maxSpeed * this.throttle;
    const force = this.speed < target ? this.vehicle.acceleration : this.vehicle.braking;
    this.speed += Math.sign(target - this.speed) * force * dt;
    if (Math.abs(target - this.speed) < force * dt) this.speed = target;
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      this.speed = Math.max(0, this.speed - 150 * dt);
    }

    this.speed = Phaser.Math.Clamp(this.speed, 0, this.vehicle.maxSpeed);
    this.distance += this.speed * dt;
    this.elapsedTime += dt;
    this.timeLeft -= dt;

    if (this.distance > this.nextConditionAt) {
      this.trackCondition = Phaser.Math.FloatBetween(this.mode.trackMin, this.mode.trackMax);
      this.nextConditionAt += Phaser.Math.Between(420, 720);
    }

    const safeSpeed = this.vehicle.maxSpeed * this.trackCondition * this.vehicle.handling * this.mode.speedAllowance;
    if (this.speed > safeSpeed) {
      this.dangerTime += dt;
      this.cameras.main.shake(35, 0.0026 * this.vehicle.shake);
      this.showMessage("ZA SZYBKO NA TYCH TORACH!", 220, "#ff5c8a");
      if (this.dangerTime > 2.15) this.gameOver("Wykolejenie na krzywym torowisku");
    } else {
      this.dangerTime = Math.max(0, this.dangerTime - dt * 1.6);
    }

    this.updateRideComfort(dt, safeSpeed);
  }

  updateRideComfort(dt, safeSpeed) {
    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const safeRatio = safeSpeed > 0 ? this.speed / safeSpeed : 0;
    const overSpeedPenalty = safeRatio > 1 ? Phaser.Math.Clamp((safeRatio - 1) * 82, 0, 58) : 0;
    const roughness = Phaser.Math.Clamp(1 - this.trackCondition, 0, 1);
    const trackPenalty = speedRatio * roughness * this.vehicle.shake * 9;
    const jerkPenalty = Phaser.Math.Clamp(this.inputJerk * (18 / this.vehicle.comfort), 0, 32);

    this.rideEventPenalty = Math.max(0, this.rideEventPenalty - dt * 7.5);
    const sample = Phaser.Math.Clamp(100 - overSpeedPenalty - trackPenalty - jerkPenalty - this.rideEventPenalty, 0, 100);
    const now = this.time.now / 1000;
    this.smoothnessSamples.push({ t: now, v: sample });
    this.smoothnessSamples = this.smoothnessSamples.filter((entry) => now - entry.t <= 8);
    const total = this.smoothnessSamples.reduce((sum, entry) => sum + entry.v, 0);
    this.smoothness = Phaser.Math.Clamp(total / Math.max(1, this.smoothnessSamples.length), 0, 100);

    const discomfort = Math.max(0, 72 - this.smoothness) * 0.012;
    const steadyRideBonus = this.smoothness > 88 && this.speed > 12 ? 0.035 : 0;
    this.adjustSatisfaction((steadyRideBonus - 0.045 - discomfort) * dt);
  }

  addRidePenalty(amount) {
    this.rideEventPenalty = Phaser.Math.Clamp(this.rideEventPenalty + (amount * this.mode.eventPressure) / this.vehicle.comfort, 0, 70);
  }

  adjustSatisfaction(delta) {
    const scaledDelta = delta < 0 ? delta * this.mode.eventPressure : delta;
    this.satisfaction = Phaser.Math.Clamp(this.satisfaction + scaledDelta, 0, 100);
  }

  updateStations(dt) {
    const stop = this.activeStop();
    if (!stop) return;

    const delta = stop.distance - this.distance;
    if (delta < 380 && delta > -160 && !stop.served) {
      this.showMessage(`${stop.name}: zatrzymaj w strefie i nacisnij SPACJA`, 260, "#f4d35e");
    }

    if (delta > 0 && delta < 720 && !stop.served) {
      const recommended = this.recommendedStopSpeed(delta);
      if (this.speed > recommended + 34) {
        this.adjustSatisfaction(-dt * 0.55);
        this.addRidePenalty(dt * 1.4);
        this.showMessage(`Hamuj do ${Math.round(this.toDisplaySpeed(recommended))} km/h przed ${stop.name}`, 260, "#ffb22e");
      }
    }

    if (this.doorsOpen) {
      this.dwell += dt;
      this.speed = Math.min(this.speed, 2);
      if (this.dwell >= 3.6 * this.mode.dwellScale) this.serveStop(stop);
    }

    if (!stop.served && this.distance > stop.distance + 210) {
      this.adjustSatisfaction(-16);
      this.addRidePenalty(7);
      this.score -= 160;
      this.combo = 1;
      this.stopStreak = 0;
      this.stopRating = "MISS";
      this.stats.missedStops += 1;
      stop.served = true;
      this.currentStopIndex += 1;
      this.playCue("bad");
      this.showMessage(`Pominieto przystanek: ${stop.name}`, 1800, "#ff5c8a");
    }
  }

  serveStop(stop) {
    const leaving = Math.min(this.passengers, Math.round(stop.alight * this.mode.passengerDemand));
    const boarding = Math.min(Math.round(stop.board * this.mode.passengerDemand), this.vehicle.capacity - this.passengers + leaving);
    const precision = Math.abs(this.distance - stop.distance);
    const scheduleDelta = this.scheduleDeltaForStop(stop);
    const scheduleScore = this.applyScheduleResult(scheduleDelta);
    const precisionScore = precision < 18 ? 180 : precision < 40 ? 95 : 35;
    const rating = precision < 18 ? "S" : precision < 40 ? "A" : precision < 74 ? "B" : "C";
    const baseScore = leaving * 65 + boarding * 12 + Math.round(this.satisfaction * 2) + precisionScore + scheduleScore;
    const scored = Math.round(baseScore * this.combo);
    this.passengers = this.passengers - leaving + boarding;
    this.delivered += leaving;
    this.precisionBonus = precisionScore;
    this.stopRating = rating;
    this.score += scored;
    this.stats.servedStops += 1;
    if (rating === "S") this.stats.perfectStops += 1;
    this.timeLeft += stop.timeBonus + (rating === "S" ? 3 : rating === "A" ? 1.5 : 0);
    if (rating === "S" || rating === "A") {
      this.stopStreak += 1;
      this.combo = Phaser.Math.Clamp(this.combo + 0.25, 1, 3);
      this.bestCombo = Math.max(this.bestCombo, this.combo);
    } else {
      this.stopStreak = 0;
      this.combo = 1;
    }
    stop.served = true;
    this.currentStopIndex += 1;
    this.doorsOpen = false;
    this.dwell = 0;
    this.pendingBoardingVisual = 0;
    this.animateDoors(false);
    stop.zone.setFillStyle(0x50d2c2, 0.1);
    stop.waiting.getChildren().forEach((person) => person.destroy());
    stop.shelter.setVisible(false);
    stop.card.setVisible(false);
    stop.label.setVisible(false);
    stop.zone.setVisible(false);
    const precisionLabel = rating === "S" ? "perfekcyjny stop" : rating === "A" ? "dobry stop" : rating === "B" ? "ciasny dojazd" : "daleko od peronu";
    this.playCue(rating === "S" || rating === "A" ? "good" : "neutral");
    this.showMessage(`${stop.name}: ${precisionLabel}, ${this.scheduleLabel(scheduleDelta)}, combo x${this.combo.toFixed(2)}`, 1900, "#50d2c2");
    this.scorePopup(`+${scored}`, this.screenX(stop.distance), 430, rating === "S" ? "#50d2c2" : "#f4d35e");
  }

  toggleDoors(stop) {
    if (this.doorsOpen) return;
    if (Math.abs(this.distance - stop.distance) > 138) {
      this.showMessage("Staniesz blizej krawedzi przystanku", 1000, "#ffb22e");
      return;
    }
    this.doorsOpen = true;
    this.dwell = 0;
    this.speed = 0;
    this.throttle = 0;
    this.score += 40;
    this.showMessage("DRZWI OTWARTE - wymiana pasazerow", 900, "#50d2c2");
    this.playCue("doors");
    this.animateDoors(true);
    this.animatePassengerExchange(stop);
    stop.zone.setFillStyle(0x50d2c2, 0.22);
  }

  animatePassengerExchange(stop) {
    if (!stop || stop.boardingAnimated) return;
    stop.boardingAnimated = true;
    const boardingVisual = Math.min(Math.round(stop.board * this.mode.passengerDemand), Math.max(0, this.vehicle.capacity - this.passengers));
    this.pendingBoardingVisual = Math.min(boardingVisual, Math.max(0, this.vehicle.capacity - this.passengers));
    const doors = this.doorPanels
      .filter((panel) => panel.car === this.tram || this.vehicleKey === "pesa")
      .map((panel) => ({
        x: panel.car.x + panel.localX * this.vehicle.spriteScale,
        y: panel.car.y + panel.localY * this.vehicle.spriteScale + 26
      }));
    stop.waiting.getChildren().forEach((person, index) => {
      if (index >= boardingVisual) return;
      const target = doors[index % Math.max(1, doors.length)] || { x: this.tram.x, y: TRAM_BASE_Y - 42 };
      person.boarding = true;
      person.setVisible(true);
      person.setDepth(58);
      this.tweens.add({
        targets: person,
        x: target.x + Phaser.Math.Between(-8, 8),
        y: target.y + Phaser.Math.Between(-6, 6),
        alpha: 0,
        scaleX: 0.18,
        scaleY: 0.18,
        duration: 620 + index * 90,
        delay: index * 110,
        ease: "Sine.easeInOut",
        onComplete: () => person.setVisible(false)
      });
    });
  }

  scheduleTimeForStop(stop) {
    const routeEnd = STOPS[STOPS.length - 1].distance;
    return (stop.distance / routeEnd) * this.scheduleDuration;
  }

  scheduleDeltaForStop(stop) {
    return this.elapsedTime - this.scheduleTimeForStop(stop);
  }

  scheduleLabel(delta) {
    const abs = Math.abs(delta);
    if (abs <= 18) return "punktualnie";
    if (delta < 0) return `za wczesnie ${Math.round(abs)}s`;
    return `spoznienie ${Math.round(abs)}s`;
  }

  formatScheduleDelta(delta) {
    const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
    return `${sign}${Math.round(Math.abs(delta))}s`;
  }

  applyScheduleResult(delta) {
    this.lastScheduleDelta = delta;
    const abs = Math.abs(delta);
    if (abs <= 18) {
      this.stats.onTimeStops += 1;
      this.punctuality = Phaser.Math.Clamp(this.punctuality + 1.6, 0, 100);
      this.adjustSatisfaction(1.2);
      return 130;
    }
    const penalty = Phaser.Math.Clamp((abs - 18) * 0.08, 1, 9);
    this.punctuality = Phaser.Math.Clamp(this.punctuality - penalty, 0, 100);
    this.adjustSatisfaction(-penalty * 0.42);
    this.addRidePenalty(penalty * 0.35);
    if (delta < 0) this.stats.earlyStops += 1;
    else this.stats.lateStops += 1;
    return -Math.round(penalty * 18);
  }

  updateEvents() {
    this.events.forEach((event) => {
      const relative = event.distance - this.distance;
      const noseRelative = relative - this.tramNoseReach();
      if (!event.detouring) event.sprite.x = this.screenX(event.distance);

      if (event.type === "car" && !event.cleared) {
        if (noseRelative < event.warnDistance && noseRelative > event.stopDistance) {
          this.showMessage("AUTO NA TORACH - zwolnij i SPACJA: dzwonek", 260, "#ffb22e");
        }
        if (noseRelative <= event.stopDistance && noseRelative > event.collisionHalfWidth && this.speed > 7) {
          this.showMessage("Auto blokuje tor - hamuj albo DRYN", 240, "#ffb22e");
        }
        if (Math.abs(noseRelative) <= event.collisionHalfWidth && this.speed > 5) {
          this.gameOver("Kolizja ze zle zaparkowanym autem");
        }
      }

      if (event.type === "pothole" && !event.cleared && Math.abs(relative) < 32) {
        event.cleared = true;
        this.stats.potholes += 1;
        const hard = this.speed > this.vehicle.maxSpeed * 0.46;
        this.speed *= hard ? 0.76 : 0.9;
        this.adjustSatisfaction(hard ? -11 : -3.5);
        this.addRidePenalty(hard ? 26 : 8);
        this.cameras.main.shake(hard ? 320 : 140, hard ? 0.012 : 0.005);
        this.playCue(hard ? "bad" : "neutral");
        this.showMessage(hard ? "DZIURA! Pasazerowie polecieli z siedzen" : "Dziura przejechana ostroznie", 1200, hard ? "#ff5c8a" : "#f4d35e");
      }

      if (event.type === "rough" && !event.cleared && relative < 36 && relative > -28) {
        event.cleared = true;
        this.stats.roughSections += 1;
        this.trackCondition = Math.min(this.trackCondition, 0.42);
        this.nextConditionAt = Math.max(this.nextConditionAt, this.distance + 520);
        const roughFast = this.speed > this.vehicle.maxSpeed * 0.38;
        this.adjustSatisfaction(roughFast ? -6 : -1.5);
        this.addRidePenalty(roughFast ? 18 : 5);
        this.playCue(roughFast ? "bad" : "neutral");
        this.showMessage("Odcinek remontowy: trzymaj spokojny nastawnik", 1500, "#ffb22e");
      }

      if (event.type === "power" && !event.cleared && Math.abs(relative) < 34) {
        event.cleared = true;
        this.stats.powerLosses += 1;
        this.powerTimer = 2.8;
        this.adjustSatisfaction(-3);
        this.addRidePenalty(4);
        this.playCue("power");
        this.showMessage("ZANIK NAPIECIA - tracisz ped", 1600, "#ffb22e");
      }
    });
  }

  ringBell() {
    if (this.bellCooldown > 0) return;
    this.bellCooldown = 1.2;
    this.timeLeft -= 1.2;
    this.adjustSatisfaction(-0.8);
    this.stats.bells += 1;
    this.playCue("bell");
    let cleared = false;
    this.events.forEach((event) => {
      const relative = event.distance - this.distance;
      const noseRelative = relative - this.tramNoseReach();
      if (event.type === "car" && !event.cleared && noseRelative < 340 && noseRelative > -25) {
        event.cleared = true;
        event.detouring = true;
        event.clearedByBell = true;
        cleared = true;
        this.stats.carsCleared += 1;
        this.score += 75;
        event.sprite.setDepth(18);
        event.sprite.setFlipX(false);
        this.tweens.add({
          targets: event.sprite,
          x: event.sprite.x + 250,
          y: 606,
          angle: 0,
          alpha: 0.92,
          duration: 920,
          ease: "Cubic.easeOut",
          onComplete: () => {
            this.tweens.add({
              targets: event.sprite,
              x: WIDTH + 260,
              alpha: 0,
              duration: 1300,
              ease: "Sine.easeIn",
              onComplete: () => event.sprite.setVisible(false)
            });
          }
        });
        this.scorePopup("+75", event.sprite.x, event.sprite.y - 38, "#50d2c2");
      }
    });
    this.showMessage(cleared ? "Drryn! Auto zjezdza z toru" : "Drryn!", 850, cleared ? "#50d2c2" : "#f4d35e");
  }

  updateSwitches() {
    this.switches.forEach((sw) => {
      const relative = sw.distance - this.distance;
      if (!sw.resolved && relative < 760 && relative > 160 && !sw.warned) {
        sw.warned = true;
        this.showMessage(`${sw.hint} | Q skret, E prosto`, 2400, "#ffb22e");
        this.playCue("neutral");
      }
      if (!sw.resolved && relative < 36 && relative > -52) {
        sw.resolved = true;
        const correct = this.switchChoice === sw.correct;
        if (correct) {
          this.stats.switchCorrect += 1;
          this.score += 260;
          this.combo = Phaser.Math.Clamp(this.combo + 0.15, 1, 3);
          this.scorePopup("+260", this.screenX(sw.distance), TRACK_Y - 50, "#50d2c2");
          this.playCue("good");
          this.showMessage(`Dobra zwrotnica: ${sw.correctLabel}`, 1400, "#50d2c2");
        } else {
          this.stats.switchWrong += 1;
          this.score -= 520;
          this.timeLeft -= 12;
          this.adjustSatisfaction(-10);
          this.addRidePenalty(18);
          this.speed *= 0.54;
          this.combo = 1;
          this.switchPenaltyUntil = this.time.now + 1800;
          this.cameras.main.shake(260, 0.008);
          this.playCue("bad");
          this.showMessage(`Zla zwrotnica: ${sw.wrongLabel}. Dyspozytor zawraca kurs`, 2100, "#ff5c8a");
        }
      }
    });
  }

  updateSignals() {
    const cycleTime = this.time.now / 1000;
    this.lights.forEach((light) => {
      const phase = (cycleTime + light.offset) % 10;
      let state = "green";
      if (phase < 4) state = "green";
      else if (phase < 5.2) state = "amber";
      else if (phase < 8.6) state = "red";
      else state = "amber";
      light.state = state;

      light.red.setFillStyle(state === "red" ? 0xff5c5c : 0x522126);
      light.amber.setFillStyle(state === "amber" ? 0xffc14d : 0x5f4e21);
      light.green.setFillStyle(state === "green" ? 0x5ae08c : 0x1d4e33);

      const relative = light.distance - this.distance;
      if (!light.penalized && state === "red" && relative < 14 && relative > -22 && this.speed > 42) {
        light.penalized = true;
        this.stats.redSignals += 1;
        this.score -= 140;
        this.adjustSatisfaction(-7);
        this.addRidePenalty(8);
        this.signalPenaltyUntil = this.time.now + 1200;
        this.playCue("bad");
        this.showMessage("Przelot na czerwonym!", 1200, "#ff5c8a");
      }
      if (relative > 240 || relative < -80) {
        light.penalized = false;
      }
    });
  }

  updateWorld(dt) {
    const scroll = this.speed * dt;
    this.bgA.tilePositionX += scroll * 0.08;
    this.bgB.tilePositionX += scroll * 0.08;
    this.curbBack.tilePositionX += scroll * 0.35;
    this.sidewalkBackBand.tilePositionX += scroll * 0.24;
    this.roadStripeA.tilePositionX += scroll * 0.4;
    this.roadMedian.tilePositionX += scroll * 0.32;
    this.track.tilePositionX += scroll * 0.88;
    this.platformLines.tilePositionX += scroll * 0.5;
    this.laneA.tilePositionX += scroll * 0.45;
    this.roadStripeB.tilePositionX += scroll * 0.4;
    this.curbFront.tilePositionX += scroll * 0.5;
    this.updateRouteBackground();

    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const roughness = Phaser.Math.Clamp(1 - this.trackCondition, 0, 1);
    const shakeAmount = this.speed < 12 ? 0 : (0.25 + speedRatio * 1.1 + roughness * 1.5) * this.vehicle.shake;
    const shake = Math.sin(this.time.now * 0.045) * shakeAmount;
    const tramRotation = Phaser.Math.Clamp((this.throttle - 0.45) * 0.006 + shake * 0.0008, -0.012, 0.012);
    this.trams.forEach((car, index) => {
      car.x = this.tram.x + car.carOffset;
      car.y = TRAM_BASE_Y + shake + Math.sin(this.time.now * 0.028 + index) * (this.speed < 12 ? 0 : 0.35);
      car.rotation = tramRotation;
    });
    this.openTrams.forEach((overlay) => {
      overlay.x = overlay.car.x;
      overlay.y = overlay.car.y;
      overlay.rotation = overlay.car.rotation;
      overlay.setScale(overlay.car.scaleX, overlay.car.scaleY);
    });
    this.updateDoorOverlay();
    this.passengerSprites.getChildren().forEach((person, index) => {
      person.y = person.baseY + Math.sin(this.time.now * 0.004 + index) * 1.2;
      person.setAlpha(0.62 + Math.min(0.28, this.passengers / this.vehicle.capacity * 0.28));
    });
    this.updateOnboardPassengers();
    this.updatePedestrians(dt);
    this.updateCatenary();
    this.updateStreetProps();
    this.updateStreetLights();
    this.updateNightLayer(dt);
    this.updateLcnBillboards();
    this.updateLodzDetails();

    const activeStop = this.activeStop();
    this.stations.forEach((stop) => {
      const x = this.screenX(stop.distance);
      const active = stop === activeStop;
      const near = Math.abs(stop.distance - this.distance) < 520;
      stop.zone.x = x;
      stop.shelter.x = x + 106;
      stop.shelter.y = 540;
      stop.card.x = x - 118;
      stop.card.y = 404;
      stop.label.x = x - 102;
      stop.label.y = 418;
      stop.zone.setVisible(active && near && !stop.served);
      stop.shelter.setVisible(active && near && !stop.served);
      stop.card.setVisible(active && near && !stop.served);
      stop.label.setVisible(active && near && !stop.served);
      stop.waiting.getChildren().forEach((person, index) => {
        if (person.boarding) return;
        person.x = x + person.localStopOffset;
        person.y = person.baseY + Math.sin(this.time.now * 0.005 + index * 1.8) * 1.5;
        person.setVisible(active && near && !stop.served);
      });
      if (stop.served) {
        stop.zone.setStrokeStyle(2, 0x50d2c2, 0.65);
        stop.label.setColor("#50d2c2");
      }
    });

    this.lights.forEach((light) => {
      const x = this.screenX(light.distance);
      light.pole.x = x;
      light.box.x = x;
      light.red.x = x;
      light.amber.x = x;
      light.green.x = x;
      light.line.x = x - 34;
      const visible = x > -60 && x < WIDTH + 60;
      light.pole.setVisible(visible);
      light.box.setVisible(visible);
      light.red.setVisible(visible);
      light.amber.setVisible(visible);
      light.green.setVisible(visible);
      light.line.setVisible(visible);
    });

    this.switches.forEach((sw) => {
      const x = this.screenX(sw.distance);
      const visible = x > -140 && x < WIDTH + 140;
      sw.base.x = x;
      sw.branch.x = x + 2;
      sw.lever.x = x - 44;
      sw.lamp.x = x - 44;
      sw.label.x = x - 122;
      sw.label.y = TRACK_Y - 132;
      sw.base.setVisible(visible);
      sw.branch.setVisible(visible);
      sw.lever.setVisible(visible);
      sw.lamp.setVisible(visible);
      sw.label.setVisible(visible);
      sw.lamp.setFillStyle(sw.resolved ? 0x50d2c2 : this.switchChoice === sw.correct ? 0xf4d35e : 0xff5c8a);
      sw.branch.setFillStyle(this.switchChoice === "left" ? 0xf4d35e : 0x9aa0a5, 0.78);
      sw.base.setFillStyle(this.switchChoice === "straight" ? 0xf4d35e : 0x9aa0a5, 0.85);
      sw.label.setText(`${sw.name}\nQ ${sw.correct === "left" ? sw.correctLabel : sw.wrongLabel}\nE ${sw.correct === "straight" ? sw.correctLabel : sw.wrongLabel}`);
    });

    this.updateTrafficCars(dt);
  }

  updateTrafficCars(dt) {
    const relativeScroll = this.speed * dt * 0.08;
    this.trafficCars.forEach((car) => {
      car.x += car.direction * car.screenSpeed * dt - relativeScroll * car.parallax;
      if (car.direction < 0 && car.x < -car.resetMargin) {
        car.x = WIDTH + car.resetMargin + Phaser.Math.Between(0, car.resetJitter);
      } else if (car.direction > 0 && car.x > WIDTH + car.resetMargin) {
        car.x = -car.resetMargin - Phaser.Math.Between(0, car.resetJitter);
      }
      car.y = car.baseY + Math.sin(this.time.now * 0.0023 + car.wobble) * 0.45;
      car.flipX = car.facing === "left";
      car.setVisible(car.x > -300 && car.x < WIDTH + 300);
    });
  }

  makeTrafficCar(x, y, key, scale, flowSpeed, facing = "right", lane = "front") {
    const car = this.add.image(x, y, key).setOrigin(0.5).setScale(scale).setAlpha(0.88).setDepth(lane === "front" ? 18 : 10);
    car.screenSpeed = Math.abs(flowSpeed) * this.mode.traffic;
    car.direction = facing === "left" ? -1 : 1;
    car.baseY = y;
    car.facing = facing;
    car.lane = lane;
    car.parallax = lane === "front" ? 0.42 : 0.28;
    car.resetMargin = key.includes("bus") ? 360 : 240;
    car.resetJitter = key.includes("bus") ? 520 : 360;
    car.wobble = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return car;
  }

  createNightLayer() {
    this.nightLayer = this.add.container(0, 0).setDepth(8);
    const sky = this.add.rectangle(0, 86, WIDTH, 260, 0x050b18, this.mode.night ? 0.68 : 0).setOrigin(0);
    const horizon = this.add.rectangle(0, 300, WIDTH, 226, 0x091421, this.mode.night ? 0.48 : 0).setOrigin(0);
    const road = this.add.rectangle(0, 496, WIDTH, 224, 0x05080d, this.mode.night ? 0.24 : 0).setOrigin(0);
    this.nightLayer.add([sky, horizon, road]);
    this.nightSkyOverlay = sky;
    this.nightHorizonOverlay = horizon;
    this.nightRoadOverlay = road;
    this.stars = Array.from({ length: 86 }, (_, index) => {
      const star = this.add.rectangle(Phaser.Math.Between(20, WIDTH - 20), Phaser.Math.Between(100, 265), index % 6 === 0 ? 2 : 1, 1, 0xf4efe4, this.mode.night ? 0.45 : 0);
      star.twinkle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.nightLayer.add(star);
      return star;
    });
  }

  updateNightLayer(dt) {
    if (!this.nightLayer) return;
    const skyAlpha = this.mode.night ? 0.68 : 0;
    const horizonAlpha = this.mode.night ? 0.48 : 0;
    const roadAlpha = this.mode.night ? 0.24 : 0;
    this.nightSkyOverlay.setAlpha(Phaser.Math.Linear(this.nightSkyOverlay.alpha, skyAlpha, dt * 2.5));
    this.nightHorizonOverlay.setAlpha(Phaser.Math.Linear(this.nightHorizonOverlay.alpha, horizonAlpha, dt * 2.5));
    this.nightRoadOverlay.setAlpha(Phaser.Math.Linear(this.nightRoadOverlay.alpha, roadAlpha, dt * 2.5));
    this.stars.forEach((star, index) => {
      star.x -= this.speed * dt * 0.012;
      if (star.x < -10) star.x = WIDTH + Phaser.Math.Between(0, 80);
      const target = this.mode.night ? 0.34 + Math.sin(this.time.now * 0.002 + star.twinkle + index) * 0.16 : 0;
      star.setAlpha(Phaser.Math.Clamp(target, 0, 0.62));
    });
  }

  makePedestrians() {
    const pedestrianKeys = ["pedestrian-side-a", "pedestrian-side-b", "pedestrian-side-c", "cyclist-side"];
    return Array.from({ length: 9 }, (_, index) => {
      const key = pedestrianKeys[index % pedestrianKeys.length];
      const laneY = index % 2 ? 506 : 676;
      const direction = index % 2 ? -1 : 1;
      const p = this.add.image(direction < 0 ? WIDTH + 160 + index * 120 : -160 - index * 120, laneY, key)
        .setScale(key === "cyclist-side" ? 0.5 : 0.43)
        .setAlpha(0.72)
        .setDepth(index % 2 ? 13 : 49);
      p.screenSpeed = key === "cyclist-side" ? 46 : 20 + (index % 3) * 5;
      p.direction = direction;
      p.baseY = laneY;
      p.resetMargin = key === "cyclist-side" ? 140 : 80;
      p.resetJitter = 420;
      return p;
    });
  }

  updatePedestrians(dt) {
    this.pedestrians.forEach((p, index) => {
      p.x += p.direction * p.screenSpeed * dt;
      if (p.direction < 0 && p.x < -p.resetMargin) {
        p.x = WIDTH + p.resetMargin + Phaser.Math.Between(0, p.resetJitter);
      } else if (p.direction > 0 && p.x > WIDTH + p.resetMargin) {
        p.x = -p.resetMargin - Phaser.Math.Between(0, p.resetJitter);
      }
      p.y = p.baseY + Math.sin(this.time.now * 0.006 + index) * 2;
      p.flipX = p.direction < 0;
      p.setVisible(p.x > -160 && p.x < WIDTH + 160);
    });
  }

  makeCatenary() {
    return Array.from({ length: 8 }, (_, index) => {
      const worldDistance = this.distance - 520 + index * 360;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(19);
      const poleX = 74;
      const wireY = 414;
      const messengerY = 378;
      const pole = this.add.rectangle(poleX, 372, 7, 178, 0x263038, 0.92).setOrigin(0.5, 0);
      const base = this.add.rectangle(poleX, 548, 24, 8, 0x111820, 0.9).setOrigin(0.5);
      const arm = this.add.rectangle(poleX - 170, 390, 174, 5, 0x263038, 0.9).setOrigin(0, 0.5).setRotation(index % 2 ? 0.04 : -0.04);
      const brace = this.add.rectangle(poleX - 132, 406, 94, 3, 0x3c4a52, 0.76).setOrigin(0, 0.5).setRotation(index % 2 ? -0.32 : -0.38);
      const hanger = this.add.rectangle(poleX - 160, 392, 3, wireY - 392, 0x2b363d, 0.78).setOrigin(0.5, 0);
      const contact = this.add.rectangle(-590, wireY, 1180, 3, 0x101820, 0.82).setOrigin(0, 0.5);
      const messenger = this.add.rectangle(-590, messengerY, 1180, 2, 0x303b42, 0.5).setOrigin(0, 0.5);
      const dropperA = this.add.rectangle(-260, messengerY, 2, wireY - messengerY, 0x303b42, 0.48).setOrigin(0.5, 0);
      const dropperB = this.add.rectangle(120, messengerY, 2, wireY - messengerY, 0x303b42, 0.48).setOrigin(0.5, 0);
      group.add([messenger, contact, dropperA, dropperB, pole, base, arm, brace, hanger]);
      group.worldDistance = worldDistance;
      group.spacing = 360;
      return group;
    });
  }

  updateCatenary() {
    if (!this.catenary) return;
    this.catenary.forEach((group, index) => {
      if (group.worldDistance < this.distance - 760) {
        group.worldDistance += group.spacing * this.catenary.length;
      }
      group.x = this.screenX(group.worldDistance);
      group.setVisible(group.x > -720 && group.x < WIDTH + 720);
      group.alpha = 0.78 + Math.sin(this.time.now * 0.001 + index) * 0.06;
    });
  }

  makeStreetProps() {
    const defs = [
      ["prop-tree", 520, 490, 0.85],
      ["prop-lamp", 860, 510, 0.9],
      ["prop-pole", 1120, 512, 0.9],
      ["prop-bin", 1340, 626, 1],
      ["prop-bollard", 1480, 638, 1.1],
      ["prop-tree", 1760, 490, 0.75],
      ["prop-lamp", 2140, 510, 0.9],
      ["prop-bin", 2420, 626, 1]
    ];
    return defs.map(([key, offset, y, scale]) => {
      const sprite = this.add.image(this.screenX(this.distance + offset), y, key)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setAlpha(0.9)
        .setDepth(y > 600 ? 33 : 11);
      sprite.worldDistance = this.distance + offset;
      sprite.spawnOffset = offset;
      return sprite;
    });
  }

  updateStreetProps() {
    this.streetProps.forEach((prop, index) => {
      if (prop.worldDistance < this.distance - 420) {
        prop.worldDistance = this.distance + 1700 + prop.spawnOffset + index * 45;
      }
      prop.x = this.screenX(prop.worldDistance);
      prop.setVisible(prop.x > -120 && prop.x < WIDTH + 120);
    });
  }

  makeLodzDetails() {
    const defs = [
      { type: "landmark", key: "landmark-znicze", distance: Math.round(0.02 * ROUTE_SCALE), y: 532, scale: 0.26, depth: 13 },
      { type: "landmark", key: "landmark-drzewo", distance: Math.round(1.55 * ROUTE_SCALE), y: 534, scale: 0.26, depth: 13 },
      { type: "landmark", key: "landmark-smolarek-mural", distance: Math.round(3.46 * ROUTE_SCALE), y: 536, scale: 0.32, depth: 10 },
      { type: "landmark", key: "landmark-witcher-mural", distance: Math.round(7.3 * ROUTE_SCALE), y: 536, scale: 0.31, depth: 10 },
      { type: "gate", offset: 2500, y: 492, label: "BRAMA" },
      { type: "generated", key: "lodz-detail-cafe", offset: 3380, y: 502, scale: 0.15 },
      { type: "generated", key: "lodz-detail-mural", offset: 4260, y: 496, scale: 0.16 },
      { type: "generated", key: "lodz-detail-works", offset: 5200, y: 642, scale: 0.14 },
      { type: "generated", key: "lodz-detail-lcn", offset: 6140, y: 504, scale: 0.15 },
      { type: "generated", key: "lodz-detail-cafe", offset: 7200, y: 502, scale: 0.14 },
      { type: "generated", key: "lodz-detail-lcn", offset: 8280, y: 508, scale: 0.13 },
      { type: "generated", key: "lodz-detail-mural", offset: 9400, y: 496, scale: 0.15 },
      { type: "generated", key: "lodz-detail-cafe", offset: 10520, y: 506, scale: 0.13 }
    ];
    return defs.map((def) => {
      const worldDistance = def.distance ?? this.distance + def.offset;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(def.depth ?? (def.y > 600 ? 35 : 13));
      if (def.type === "landmark") {
        group.add(this.add.image(0, def.y, def.key).setScale(def.scale).setOrigin(0.5, 1));
      } else if (def.type === "generated") {
        group.add(this.add.image(0, def.y - 54, def.key).setScale(def.scale).setOrigin(0.5));
        if (def.y < 600) {
          group.add(this.add.rectangle(-50, def.y - 4, 6, 54, 0x2a3238, 0.95).setOrigin(0.5, 0));
          group.add(this.add.rectangle(50, def.y - 4, 6, 54, 0x2a3238, 0.95).setOrigin(0.5, 0));
        }
      } else if (def.type === "gate") {
        group.add(this.add.rectangle(0, def.y - 54, 86, 82, 0x5b3c2c, 0.88).setStrokeStyle(3, 0x2a1a14, 1));
        group.add(this.add.rectangle(-22, def.y - 42, 18, 58, 0x241914, 0.8));
        group.add(this.add.rectangle(22, def.y - 42, 18, 58, 0x241914, 0.8));
      } else if (def.type === "mural") {
        group.add(this.add.rectangle(0, def.y - 52, 134, 78, 0x173c4f, 0.9).setStrokeStyle(3, 0xd09b46, 1));
        group.add(this.add.text(0, def.y - 64, def.label, { fontSize: "15px", color: "#f4d35e", fontStyle: "700", align: "center" }).setOrigin(0.5));
        group.add(this.add.rectangle(-34, def.y - 30, 44, 12, 0x50d2c2, 0.82).setRotation(-0.22));
      } else if (def.type === "works") {
        group.add(this.add.image(0, def.y, "roadworks-truck-side").setScale(0.66).setOrigin(0.5, 1));
        group.add(this.add.rectangle(72, def.y - 18, 16, 28, 0xffb22e, 0.94).setRotation(0.15));
        group.add(this.add.rectangle(102, def.y - 18, 16, 28, 0xffb22e, 0.94).setRotation(-0.12));
      } else {
        const fill = def.type === "lcn" ? 0x1b7c53 : 0x1f2630;
        group.add(this.add.rectangle(0, def.y - 52, 132, 56, fill, 0.9).setStrokeStyle(3, 0x111319, 1));
        group.add(this.add.text(0, def.y - 64, def.label, { fontSize: def.type === "lcn" ? "13px" : "12px", color: def.type === "lcn" ? "#f4efe4" : "#f4d35e", fontStyle: "700", align: "center" }).setOrigin(0.5));
        group.add(this.add.rectangle(-48, def.y - 24, 8, 48, 0x2a3238, 1));
        group.add(this.add.rectangle(48, def.y - 24, 8, 48, 0x2a3238, 1));
      }
      group.worldDistance = worldDistance;
      group.spawnOffset = def.offset;
      group.fixed = Boolean(def.distance);
      group.kind = def.type;
      return group;
    });
  }

  updateLodzDetails() {
    if (!this.lodzDetails) return;
    this.lodzDetails.forEach((detail, index) => {
      if (!detail.fixed && detail.worldDistance < this.distance - 520) {
        detail.worldDistance = this.distance + 6200 + detail.spawnOffset + index * 140;
      }
      detail.x = this.screenX(detail.worldDistance);
      detail.setVisible(detail.x > -220 && detail.x < WIDTH + 220);
    });
  }

  makeStreetLights() {
    return Array.from({ length: 6 }, (_, index) => {
      const worldDistance = this.distance + 260 + index * 520;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(14);
      const pole = this.add.rectangle(0, 406, 5, 118, 0x222a30, 0.82).setOrigin(0.5, 0);
      const arm = this.add.rectangle(-36, 414, 72, 4, 0x222a30, 0.78).setOrigin(0, 0.5).setRotation(-0.08);
      const lamp = this.add.rectangle(-72, 416, 22, 8, 0xf4d35e, this.mode.night ? 0.96 : 0.5).setOrigin(0.5);
      const glow = this.add.ellipse(-72, 438, 116, 78, 0xf4d35e, this.mode.night ? 0.2 : 0.03).setOrigin(0.5);
      group.add([glow, pole, arm, lamp]);
      group.worldDistance = worldDistance;
      group.spacing = 520;
      group.glow = glow;
      group.lamp = lamp;
      return group;
    });
  }

  updateStreetLights() {
    if (!this.streetLights) return;
    this.streetLights.forEach((light, index) => {
      if (light.worldDistance < this.distance - 420) {
        light.worldDistance += light.spacing * this.streetLights.length;
      }
      light.x = this.screenX(light.worldDistance);
      light.setVisible(light.x > -160 && light.x < WIDTH + 160);
      const pulse = 0.03 + Math.sin(this.time.now * 0.003 + index) * 0.015;
      light.glow.setAlpha(this.mode.night ? 0.18 + pulse : 0.03);
      light.lamp.setAlpha(this.mode.night ? 0.95 : 0.5);
    });
  }

  makeLcnBillboards() {
    return LCN_BILLBOARDS.map((billboard) => {
      const sprite = this.add.image(this.screenX(billboard.distance), billboard.y, billboard.key)
        .setOrigin(0.5, 1)
        .setScale(billboard.scale)
        .setAlpha(0.92)
        .setDepth(12);
      sprite.worldDistance = billboard.distance;
      return sprite;
    });
  }

  updateLcnBillboards() {
    this.lcnBillboards.forEach((billboard) => {
      billboard.x = this.screenX(billboard.worldDistance);
      billboard.setVisible(billboard.x > -260 && billboard.x < WIDTH + 260);
    });
  }

  createPassengerFigure(x, y, key, scale, depth, variant = {}, options = {}) {
    const container = this.add.container(x, y).setDepth(depth);
    if (options.shadow !== false) {
      const shadow = this.add.ellipse(0, 1, Math.max(8, scale * 8), Math.max(3, scale * 2.5), 0x111319, 0.24);
      container.add(shadow);
    }
    const sprite = this.add.image(0, 0, key).setOrigin(0.5, 1).setScale(scale);
    if (variant.flip) sprite.setFlipX(true);
    if (variant.tint) sprite.setTint(variant.tint);
    if (options.onboard) {
      const source = sprite.texture.getSourceImage();
      sprite.setOrigin(0.5, 0.5);
      sprite.setCrop(0, 0, source.width, Math.round(source.height * 0.58));
      sprite.y = 0;
      sprite.setAlpha(0.82);
    }
    container.add(sprite);
    container.sprite = sprite;
    return container;
  }

  createOnboardPassengerFigure(x, y, seed, depth) {
    const key = PASSENGER_KEYS[seed % PASSENGER_KEYS.length];
    const container = this.add.container(x, y).setDepth(depth);
    const glassGlow = this.add.rectangle(0, 1, 14, 11, 0xbad8d1, 0.13).setOrigin(0.5);
    const sprite = this.add.image(0, 3, key).setOrigin(0.5, 0.45).setScale(0.46).setAlpha(0.72);
    const source = sprite.texture.getSourceImage();
    sprite.setCrop(0, 0, source.width, Math.round(source.height * 0.56));
    if (seed % 3 === 0) sprite.setFlipX(true);
    if (seed % 5 === 0) sprite.setTint(0xfff1cf);
    const lowerMask = this.add.rectangle(0, 8, 14, 5, 0x3f4b4a, 0.26).setOrigin(0.5);
    const shine = this.add.rectangle(-4, -2, 1.2, 10, 0xf4efe4, 0.15).setOrigin(0.5).setRotation(0.12);
    container.add([glassGlow, sprite, lowerMask, shine]);
    return container;
  }

  createOnboardPassengers() {
    const seats = this.vehicle.passengerSeats;
    this.onboardPassengers = [];
    for (let seatIndex = 0; seatIndex < seats.length; seatIndex += 1) {
      this.trams.forEach((car, carIndex) => {
        const x = seats[seatIndex];
        const seed = seatIndex * this.trams.length + carIndex;
        const p = this.createOnboardPassengerFigure(car.x, car.y, seed, 24 + carIndex);
        p.localX = x;
        p.localY = this.vehicle.passengerY;
        p.car = car;
        p.seed = seed;
        p.setDepth(car.depth + 0.12);
        this.onboardPassengers.push(p);
      });
    }
    this.updateOnboardPassengers();
  }

  updateOnboardPassengers() {
    if (!this.onboardPassengers) return;
    const visualPassengers = this.passengers + (this.doorsOpen ? this.pendingBoardingVisual : 0);
    const loadFactor = Phaser.Math.Clamp(visualPassengers / this.vehicle.capacity, 0, 1);
    const visibleCount = Phaser.Math.Clamp(
      Math.max(Math.round(visualPassengers * 0.32), Math.round(this.onboardPassengers.length * loadFactor * 0.9)),
      0,
      this.onboardPassengers.length
    );
    this.onboardPassengers.forEach((p, index) => {
      p.x = p.car.x + p.localX * this.vehicle.spriteScale;
      p.y = p.car.y + p.localY * this.vehicle.spriteScale + Math.sin(this.time.now * 0.004 + p.seed) * 0.4;
      p.rotation = p.car.rotation;
      p.setAlpha(index < visibleCount ? 0.96 : 0);
    });
  }

  updateHud() {
    const next = this.activeStop();
    const nextSignal = this.nextRelevantSignal();
    const nextSwitch = this.nextRelevantSwitch();
    const safeSpeed = this.vehicle.maxSpeed * this.trackCondition * this.vehicle.handling * this.mode.speedAllowance;
    const remainingToStop = next ? Math.max(0, next.distance - this.distance) : Math.max(0, ROUTE_LENGTH - this.distance);
    const scheduleDelta = next ? this.scheduleDeltaForStop(next) : this.elapsedTime - this.scheduleDuration;
    const recommended = next && remainingToStop < 850 ? this.recommendedStopSpeed(remainingToStop) : null;
    this.clockText.setText(this.formatTime(this.timeLeft));
    this.scoreText.setText(`SCORE: ${this.currentScore()}`);
    this.nextText.setText(next ? `NEXT: ${this.shortLabel(next.name, 22)}\n${this.shortLabel(next.street, 18)} | ${this.formatRouteDistance(remainingToStop)}` : `FINISH\nPax ${Math.round(this.passengers)}`);
    this.signalText.setText(nextSignal ? `Signal ${nextSignal.state.toUpperCase()} | ${this.formatRouteDistance(nextSignal.distance - this.distance)}` : "Signal clear");
    this.scheduleText.setText(`Rozklad ${this.formatScheduleDelta(scheduleDelta)} | Punkt. ${Math.round(this.punctuality)}%`);
    this.scheduleText.setColor(Math.abs(scheduleDelta) <= 18 ? "#50d2c2" : scheduleDelta > 0 ? "#ffb22e" : "#8fb7e8");
    this.speedText.setText(`Pred ${Math.round(this.toDisplaySpeed(this.speed))}/${Math.round(this.toDisplaySpeed(safeSpeed))} km/h | Drzwi ${this.doorsOpen ? "OPEN" : "CLOSED"}`);
    this.trackText.setText(`Tor ${Math.round(this.trackCondition * 100)}% | Zad ${Math.round(this.satisfaction)}% | Plyn ${Math.round(this.smoothness)}%`);
    this.passengerText.setText(`Pax ${Math.round(this.passengers)} | Dow ${this.delivered} | Combo x${this.combo.toFixed(2)}`);
    const switchText = `Zwrotnica ${this.switchChoice === "straight" ? "PROSTO(E)" : "SKRET(Q)"}`;
    this.brakeText.setText(recommended === null ? `${switchText} | Rating ${this.stopRating}` : `Hamuj do ${Math.round(this.toDisplaySpeed(recommended))} km/h | ${switchText}`);
    this.modeBadgeText.setText(`${this.mode.label}\nTor ${Math.round(this.mode.trackMin * 100)}-${Math.round(this.mode.trackMax * 100)}% | Ruch x${this.mode.traffic.toFixed(2)}`);
    this.nextSwitchText.setText(nextSwitch ? `Zwrotnica za ${this.formatRouteDistance(nextSwitch.distance - this.distance)}: ${nextSwitch.correct === "left" ? "Q SKRET" : "E PROSTO"}` : "Zwrotnice: brak blisko");
    this.fitText(this.nextText, 354, 11, 8);
    this.fitText(this.signalText, 354, 10, 8);
    this.fitText(this.scheduleText, 354, 10, 8);
    this.fitText(this.speedText, 390, 14, 11);
    this.fitText(this.trackText, 390, 12, 10);
    this.fitText(this.passengerText, 390, 12, 10);
    this.fitText(this.brakeText, 390, 12, 10);
    this.fitText(this.modeBadgeText, 374, 11, 9);
    this.fitText(this.nextSwitchText, 374, 10, 8);
    this.throttleFill.width = 140 * this.throttle;
    this.condFill.width = 140 * this.trackCondition;
    this.condFill.setFillStyle(this.trackCondition < 0.5 ? 0xff5c8a : 0x50d2c2);
    this.progressFill.width = Phaser.Math.Clamp((this.distance / ROUTE_LENGTH) * 860, 0, 860);

    if (this.timeLeft < 25 && !this.warningText.text.includes("CZAS")) {
      this.showMessage("TIME RUNNING OUT!", 500, "#ffb22e");
    }
    if (this.time.now > this.messageUntil) this.warningText.setText("");
  }

  checkEnd() {
    if (this.timeLeft <= 0) this.gameOver("Czas kursu sie skonczyl");
    if (this.distance >= ROUTE_LENGTH || this.currentStopIndex >= STOPS.length) {
      const bonus = Math.round(this.timeLeft * 12 + this.satisfaction * 10 + this.smoothness * 8);
      if (!this.finishBonusApplied) {
        this.score += Math.max(0, bonus);
        this.finishBonusApplied = true;
      }
      this.playCue("finish");
      this.endScreen("Teofilow osiagniety", this.buildEndReport(Math.max(0, bonus), false));
    }
  }

  shortLabel(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3).trim()}...`;
  }

  formatRouteDistance(gameUnits) {
    const meters = Math.max(0, Math.round((gameUnits / ROUTE_SCALE) * 1000));
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  }

  fitText(textObject, maxWidth, maxFontSize, minFontSize) {
    let size = maxFontSize;
    textObject.setFontSize(size);
    while (textObject.width > maxWidth && size > minFontSize) {
      size -= 1;
      textObject.setFontSize(size);
    }
  }

  currentScore() {
    return Math.max(0, Math.round(this.score + this.delivered * 35 + this.satisfaction * 7 + this.smoothness * 5 + this.punctuality * 4 + Math.max(0, this.timeLeft) * 9));
  }

  activeStop() {
    return this.stations[this.currentStopIndex];
  }

  nextRelevantSignal() {
    return this.lights.find((light) => light.distance > this.distance - 20 && light.distance < this.distance + 1200) || null;
  }

  nextRelevantSwitch() {
    return this.switches.find((sw) => !sw.resolved && sw.distance > this.distance - 80 && sw.distance < this.distance + 1600) || null;
  }

  updateRouteBackground() {
    const next = this.activeStop();
    const fallback = this.stations[this.stations.length - 1];
    const bg = next ? next.bg : fallback.bg;
    if (bg === this.currentBg) return;

    this.currentBg = bg;
    this.applySurfacePalette(bg);
    if (this.lastBgMessage !== bg) {
      this.lastBgMessage = bg;
      this.showMessage(`Segment: ${BG_LABELS[bg] || bg}`, 1400, "#f4efe4");
    }
    this.bgB.setTexture(`bg-${bg}`);
    this.bgB.tilePositionX = this.bgA.tilePositionX;
    this.fitBackground(this.bgB);
    this.bgB.setAlpha(0);
    this.tweens.add({
      targets: this.bgB,
      alpha: 1,
      duration: 650,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.bgA.setTexture(`bg-${bg}`);
        this.bgA.tilePositionX = this.bgB.tilePositionX;
        this.fitBackground(this.bgA);
        this.bgB.setAlpha(0);
      }
    });
  }

  applySurfacePalette(bg) {
    const palette = SURFACE_PALETTES[bg] || SURFACE_PALETTES.zarzew;
    this.sidewalkBack.setFillStyle(palette.sidewalk, 0.94);
    this.street.setFillStyle(palette.street, 0.98);
    this.roadBackLane.setFillStyle(palette.laneBack, 0.92);
    this.roadFrontLane.setFillStyle(palette.laneFront, 0.94);
    this.platform.setFillStyle(palette.platform, 1);
    this.platformCurb.setFillStyle(palette.curb, 0.82);
    this.sidewalkBackBand.setTint(palette.tint);
    this.curbBack.setTint(palette.curb);
    this.roadStripeA.setTint(palette.curb);
    this.roadMedian.setTint(palette.tint);
    this.laneA.setTint(palette.curb);
    this.roadStripeB.setTint(palette.curb);
    this.curbFront.setTint(palette.curb);
    this.platformLines.setTint(palette.tint);
  }

  applyBackgroundLighting(image) {
    if (this.mode.night) {
      image.setTint(0x485875);
      return;
    }
    image.clearTint();
  }

  fitBackground(image) {
    const source = image.texture.getSourceImage();
    const targetW = WIDTH;
    const targetH = 440;
    const scale = source.width === targetW && source.height === targetH ? 1 : Math.max(targetW / source.width, targetH / source.height);
    if (image.tilePositionX !== undefined) {
      image.setSize(targetW, targetH);
      image.setTileScale(scale, scale);
      image.setPosition(0, 86);
    } else {
      image.setScale(scale);
      image.setPosition(WIDTH / 2, 86 + targetH / 2);
    }
    this.applyBackgroundLighting(image);
  }

  setTramDoorTexture(open) {
    if (!this.openTrams) return;
    this.openTrams.forEach((overlay) => overlay.setAlpha(0).setVisible(false));
  }

  animateDoors(open) {
    if (!this.openTrams || !this.doorPanels) return;
    if (this.doorTween) this.doorTween.stop();
    this.openTrams.forEach((overlay) => overlay.setAlpha(0).setVisible(false));
    this.doorPanels.forEach((panel) => {
      panel.setVisible(true);
      if (open) {
        panel.alpha = 1;
        panel.slide = panel.slide || 0;
      }
    });
    this.doorTween = this.tweens.add({
      targets: this.doorPanels,
      slide: open ? 1 : 0,
      alpha: open ? 1 : 0,
      duration: open ? 420 : 280,
      ease: "Cubic.easeOut",
      onComplete: () => {
        if (!open) this.doorPanels.forEach((panel) => panel.setVisible(false));
      }
    });
  }

  updateDoorOverlay() {
    if (!this.doorPanels) return;
    this.doorPanels.forEach((panel) => {
      const scale = this.vehicle.spriteScale;
      panel.x = panel.car.x + panel.localX * scale;
      panel.y = panel.car.y + panel.localY * scale;
      panel.rotation = panel.car.rotation;
      const slide = panel.slide || 0;
      if (panel.leftLeaf && panel.rightLeaf) {
        const offset = panel.slideDistance * slide;
        panel.leftLeaf.x = -offset;
        panel.rightLeaf.x = offset;
        panel.leftGlass.x = -offset - panel.glassShift;
        panel.rightGlass.x = offset + panel.glassShift;
        panel.centerGap.setAlpha(0.2 + slide * 0.76);
        panel.recess.setAlpha(0.28 + slide * 0.42);
      }
    });
  }

  createDoorPanels() {
    const cfg = this.vehicle.door;
    this.doorPanels = [];
    this.trams.forEach((car) => {
      cfg.xs.forEach((localX, index) => {
        const width = cfg.w * this.vehicle.spriteScale * 1.05;
        const height = cfg.h * this.vehicle.spriteScale * 0.9;
        const panel = this.add.container(car.x, car.y).setDepth(car.depth + 0.55).setAlpha(0).setVisible(false);
        const recess = this.add.rectangle(0, 0, width, height, cfg.color, 0.44).setOrigin(0.5);
        const centerGap = this.add.rectangle(0, height * 0.04, width * 0.26, height * 0.84, 0x050607, 0.2).setOrigin(0.5);
        const leftLeaf = this.add.rectangle(-width * 0.19, 0, width * 0.42, height * 0.96, 0x151a1b, 0.82).setOrigin(0.5);
        const rightLeaf = this.add.rectangle(width * 0.19, 0, width * 0.42, height * 0.96, 0x151a1b, 0.82).setOrigin(0.5);
        const leftEdge = this.add.rectangle(-width * 0.48, 0, 2, height, cfg.edge, 0.78).setOrigin(0.5);
        const rightEdge = this.add.rectangle(width * 0.48, 0, 2, height, cfg.edge, 0.78).setOrigin(0.5);
        const leftGlass = this.add.rectangle(-width * 0.18, -height * 0.18, width * 0.18, height * 0.42, 0x8dc6c9, 0.2).setOrigin(0.5);
        const rightGlass = this.add.rectangle(width * 0.18, -height * 0.18, width * 0.18, height * 0.42, 0x8dc6c9, 0.2).setOrigin(0.5);
        panel.add([recess, centerGap, leftLeaf, rightLeaf, leftEdge, rightEdge, leftGlass, rightGlass]);
        panel.car = car;
        panel.localX = localX;
        panel.localY = cfg.y + (index % 2 === 0 ? 0 : 1);
        panel.slide = 0;
        panel.slideDistance = width * 0.24;
        panel.glassShift = width * 0.04;
        panel.recess = recess;
        panel.centerGap = centerGap;
        panel.leftLeaf = leftLeaf;
        panel.rightLeaf = rightLeaf;
        panel.leftGlass = leftGlass;
        panel.rightGlass = rightGlass;
        this.doorPanels.push(panel);
      });
    });
  }

  screenX(worldDistance) {
    return this.tram.x + worldDistance - this.distance;
  }

  tramNoseReach() {
    return this.tram.displayWidth * 0.5 - 10;
  }

  toDisplaySpeed(rawSpeed) {
    return (rawSpeed / this.vehicle.maxSpeed) * this.vehicle.displayMaxSpeed;
  }

  recommendedStopSpeed(distanceToStop) {
    if (distanceToStop <= 138) return 10;
    const brakingDistance = Math.max(0, distanceToStop - 138);
    return Phaser.Math.Clamp(Math.sqrt(2 * this.vehicle.braking * brakingDistance) * 0.62, 10, this.vehicle.maxSpeed * 0.72);
  }

  showMessage(text, duration = 1200, color = "#f4d35e") {
    this.warningText.setText(text);
    this.warningText.setColor(color);
    this.messageUntil = Math.max(this.messageUntil, this.time.now + duration);
  }

  scorePopup(text, x, y, color = "#f4d35e") {
    const popup = this.add.text(x, y, text, {
      fontSize: "22px",
      fontStyle: "700",
      color,
      stroke: "#111319",
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: y - 42,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => popup.destroy()
    });
  }

  formatTime(value) {
    const t = Math.max(0, Math.ceil(value));
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  createRideLoop() {
    const key = this.vehicleKey === "pesa" ? "ride-pesa" : "ride-konstal";
    if (!this.sound || !this.cache.audio.exists(key)) return;
    this.rideLoop = this.sound.add(key, {
      loop: true,
      volume: 0,
      rate: 0.92
    });
  }

  startRideLoop() {
    if (!this.rideLoop || this.rideLoopStarted) return;
    this.rideLoopStarted = true;
    this.rideLoop.play();
  }

  updateRideLoop(dt, mute = false) {
    if (!this.rideLoop) return;
    if (!mute && (this.speed > 3 || this.throttle > 0.02)) this.startRideLoop();
    if (!this.rideLoopStarted) return;

    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const targetVolume = mute ? 0 : Phaser.Math.Clamp(0.035 + speedRatio * 0.18, 0, this.vehicleKey === "konstal" ? 0.24 : 0.2);
    const currentVolume = this.rideLoop.volume || 0;
    const blend = dt > 0 ? Phaser.Math.Clamp(dt * 3.5, 0, 1) : 1;
    this.rideLoop.setVolume(Phaser.Math.Linear(currentVolume, targetVolume, blend));
    this.rideLoop.setRate((this.vehicleKey === "konstal" ? 0.84 : 0.94) + speedRatio * (this.vehicleKey === "konstal" ? 0.42 : 0.28));
  }

  stopRideLoop() {
    if (!this.rideLoop) return;
    this.rideLoop.stop();
    this.rideLoopStarted = false;
  }

  ensureAudio() {
    if (this.audioContext) return this.audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.audioContext = new AudioContextClass();
    return this.audioContext;
  }

  playCue(type) {
    const ctx = this.ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const patterns = {
      bell: [[880, 0.04], [1320, 0.07], [1760, 0.05]],
      doors: [[280, 0.06], [360, 0.08]],
      good: [[660, 0.06], [990, 0.08]],
      neutral: [[440, 0.05]],
      bad: [[180, 0.12], [120, 0.1]],
      power: [[120, 0.08], [90, 0.16]],
      finish: [[523, 0.08], [659, 0.08], [784, 0.14]]
    };
    let t = ctx.currentTime;
    (patterns[type] || patterns.neutral).forEach(([freq, duration]) => {
      this.playTone(ctx, freq, t, duration, type === "bad" || type === "power" ? 0.055 : 0.04);
      t += duration + 0.025;
    });
  }

  playTone(ctx, frequency, start, duration, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  gameOver(reason) {
    if (this.mode && !this.mode.allowGameOver) {
      this.adjustSatisfaction(-18);
      this.addRidePenalty(24);
      this.speed = 0;
      this.throttle = 0;
      this.score = Math.max(0, this.score - 420);
      this.playCue("bad");
      this.showMessage(`Trening: ${reason}`, 2200, "#ffb22e");
      return;
    }
    this.satisfaction = Math.max(0, this.satisfaction - 30);
    this.playCue("bad");
    this.endScreen("Kurs przerwany", this.buildEndReport(0, true, reason));
  }

  endScreen(title, detail) {
    if (this.finished) return;
    this.finished = true;
    this.speed = 0;
    this.throttle = 0;
    this.stopRideLoop();
    const finalScore = this.currentScore();
    const highScore = this.readHighScore();
    const isRecord = finalScore > highScore;
    if (isRecord) this.writeHighScore(finalScore);

    const layer = this.add.container(0, 0).setDepth(2200);
    layer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.68).setOrigin(0));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, 760, 500, 0x0d1318, 0.98)
      .setStrokeStyle(5, 0xf4d35e, 1));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, 704, 424, 0x101820, 0.94)
      .setStrokeStyle(2, 0x56636c, 1));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2 - 205, 690, 14, 0x26323a, 0.9));

    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 218, title, {
      fontSize: "32px",
      fontStyle: "700",
      color: "#f4efe4",
      stroke: "#111319",
      strokeThickness: 4,
      align: "center"
    }).setOrigin(0.5));

    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 165, `SCORE: ${finalScore}`, {
      fontSize: "30px",
      fontStyle: "700",
      color: isRecord ? "#50d2c2" : "#ffb22e",
      align: "center"
    }).setOrigin(0.5));
    if (isRecord) {
      layer.add(this.add.text(WIDTH / 2 + 186, HEIGHT / 2 - 158, "NEW RECORD", {
        fontSize: "13px",
        fontStyle: "700",
        color: "#50d2c2"
      }).setOrigin(0.5));
    }

    this.addResultBars(layer, WIDTH / 2 - 330, HEIGHT / 2 - 130);

    const lines = detail.split("\n");
    const summary = lines.slice(0, 7).join("\n");
    const missions = lines.slice(8).join("\n");
    layer.add(this.add.text(WIDTH / 2 - 330, HEIGHT / 2 - 108, "RAPORT KURSU", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#f4d35e"
    }));
    layer.add(this.add.text(WIDTH / 2 - 330, HEIGHT / 2 - 78, summary, {
      fontSize: "14px",
      color: "#d9d3c4",
      align: "left",
      lineSpacing: 4,
      wordWrap: { width: 650, useAdvancedWrap: true }
    }));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2 + 72, 650, 2, 0x34434b, 1));
    layer.add(this.add.text(WIDTH / 2 - 330, HEIGHT / 2 + 92, "CELE", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#f4d35e"
    }));
    layer.add(this.add.text(WIDTH / 2 - 330, HEIGHT / 2 + 120, missions, {
      fontSize: "14px",
      color: "#f4efe4",
      align: "left",
      lineSpacing: 3,
      wordWrap: { width: 650, useAdvancedWrap: true }
    }));
    layer.add(this.add.text(WIDTH / 2 - 330, HEIGHT / 2 + 205, `Rekord: ${Math.max(finalScore, highScore)}`, {
      fontSize: "16px",
      color: "#f4efe4"
    }));
    layer.add(this.add.text(WIDTH / 2 + 330, HEIGHT / 2 + 205, "R: jeszcze raz    Esc: menu", {
      fontSize: "17px",
      fontStyle: "700",
      color: "#f4d35e"
    }).setOrigin(1, 0));
  }

  addResultBars(layer, x, y) {
    const values = [
      ["Plynnosc", this.smoothness, 0x50d2c2],
      ["Zadow.", this.satisfaction, 0xf4d35e],
      ["Przyst.", (this.stats.servedStops / STOPS.length) * 100, 0x8fb7e8],
      ["Punkt.", this.punctuality, 0xffb22e],
      ["Zwrotn.", SWITCHES.length ? (this.stats.switchCorrect / SWITCHES.length) * 100 : 100, 0xd987ff]
    ];
    values.forEach(([label, value, color], index) => {
      const yy = y + index * 18;
      layer.add(this.add.text(x, yy - 7, label, { fontSize: "11px", color: "#d9d3c4", fontStyle: "700" }));
      layer.add(this.add.rectangle(x + 72, yy, 130, 7, 0x26323a, 1).setOrigin(0, 0.5));
      layer.add(this.add.rectangle(x + 72, yy, Phaser.Math.Clamp(value, 0, 100) * 1.3, 7, color, 0.95).setOrigin(0, 0.5));
    });
  }

  buildEndReport(bonus, interrupted = false, reason = "") {
    const grade = this.courseGrade(interrupted);
    const missions = this.missionResults(interrupted);
    const passed = missions.filter((mission) => mission.ok).length;
    const missionLines = missions.map((mission) => `${mission.ok ? "OK" : "--"} ${mission.label}`);
    return [
      `Ocena kursu: ${grade} | Cele: ${passed}/${missions.length}`,
      interrupted ? `Powod: ${reason}` : `Bonus koncowy: ${bonus}`,
      `Przystanki: ${this.stats.servedStops}/${STOPS.length} | Pominiete: ${this.stats.missedStops} | S-stop: ${this.stats.perfectStops}`,
      `Pax dowiezieni: ${this.delivered} | W skladzie: ${Math.round(this.passengers)} | Combo max x${this.bestCombo.toFixed(2)}`,
      `Plynnosc ${Math.round(this.smoothness)}% | Zadowolenie ${Math.round(this.satisfaction)}% | Punktualnosc ${Math.round(this.punctuality)}%`,
      `Rozklad: ${this.stats.onTimeStops} punkt., ${this.stats.earlyStops} wcz., ${this.stats.lateStops} opozn. | Czas ${this.formatTime(this.timeLeft)}`,
      `Incydenty: auta ${this.stats.carsCleared}, dziury ${this.stats.potholes}, zasilanie ${this.stats.powerLosses}, czerwone ${this.stats.redSignals}`,
      "",
      ...missionLines
    ].join("\n");
  }

  courseGrade(interrupted) {
    if (interrupted) return "N";
    const score = this.satisfaction * 0.26 + this.smoothness * 0.28 + this.punctuality * 0.18 + (this.stats.servedStops / STOPS.length) * 22 + Math.min(16, this.timeLeft / 35);
    if (score >= 92) return "S";
    if (score >= 82) return "A";
    if (score >= 70) return "B";
    if (score >= 58) return "C";
    return "D";
  }

  missionResults(interrupted) {
    return [
      { label: "Dojedz do Teofilowa", ok: !interrupted },
      { label: "Obsluz wszystkie przystanki", ok: this.stats.missedStops === 0 && this.stats.servedStops >= STOPS.length },
      { label: "Plynnosc minimum 75%", ok: this.smoothness >= 75 },
      { label: "Zadowolenie minimum 70%", ok: this.satisfaction >= 70 },
      { label: "Punktualnosc minimum 70%", ok: this.punctuality >= 70 },
      { label: "Bez przejazdu na czerwonym", ok: this.stats.redSignals === 0 },
      { label: "Zwrotnice bez pomylki", ok: this.stats.switchWrong === 0 && this.stats.switchCorrect >= SWITCHES.length }
    ];
  }

  readHighScore() {
    try {
      return Number(window.localStorage.getItem("ostatni-kurs-highscore") || 0);
    } catch (_) {
      return 0;
    }
  }

  writeHighScore(score) {
    try {
      window.localStorage.setItem("ostatni-kurs-highscore", String(score));
    } catch (_) {
      // Local storage can be blocked in some browser contexts.
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#10131a",
  render: {
    pixelArt: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, GameScene]
};

window.addEventListener("load", () => {
  if (!window.Phaser) {
    document.getElementById("game").innerHTML = "<p style='padding:24px;color:#f4efe4;font:20px Lexend Deca, Segoe UI, sans-serif'>Nie udalo sie zaladowac Phaser 3 z CDN.</p>";
    return;
  }
  const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
  Phaser.GameObjects.GameObjectFactory.prototype.text = function patchedLexendText(x, y, text, style = {}) {
    return originalTextFactory.call(this, x, y, text, { fontFamily: FONT_FAMILY, ...style });
  };
  const startGame = () => new Phaser.Game(config);
  if (document.fonts && document.fonts.load) {
    document.fonts.load('16px "Lexend Deca"').finally(startGame);
  } else {
    startGame();
  }
});
