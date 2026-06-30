export const BG_LABELS = {
  zarzew: "Zarzew / cmentarz",
  "widzew-wschod": "Widzew Wschód",
  rokicinska: "Rokicińska",
  widzew: "Widzew i stadion",
  wima: "Księży Młyn / Wi-Ma",
  centrum: "Kamienice Łódzkie",
  piotrkowska: "Stajnia Jednorożców",
  kaliska: "Atlas Arena / Kaliska",
  wlokniarzy: "Włókniarzy",
  teofilow: "Teofilów"
};

export const DISTRICT_PROFILES = {
  zarzew: {
    traffic: 0.82,
    pedestrians: 0.95,
    windows: 0.38,
    tint: 0xc7d0d0,
    dispatch: [
      "Dyspozytor: wyjazd z Zarzewa, uwaga na pieszych przy cmentarzu.",
      "Dyspozytor: pierwszy odcinek spokojnie, zbierz rytm jazdy."
    ]
  },
  "widzew-wschod": {
    traffic: 1.18,
    pedestrians: 1.25,
    windows: 0.62,
    tint: 0xdbe8f0,
    dispatch: [
      "Dyspozytor: Widzew Wschód, więcej pieszych przy przejściach.",
      "Dyspozytor: osiedle przed Tobą, pilnuj hamowania przed przystankami."
    ]
  },
  rokicinska: {
    traffic: 1.05,
    pedestrians: 0.95,
    windows: 0.5,
    tint: 0xd6e0da,
    dispatch: ["Dyspozytor: Rokicińska czysta, ale uważaj na torowisko po prawej."]
  },
  widzew: {
    traffic: 1.35,
    pedestrians: 1.45,
    windows: 0.7,
    tint: 0xf0ded2,
    dispatch: [
      "Dyspozytor: okolice stadionu, spodziewaj się większego ruchu.",
      "Dyspozytor: nie goń rozkładu przez stadion, czerwone dalej kosztuje."
    ]
  },
  wima: {
    traffic: 1.04,
    pedestrians: 1.05,
    windows: 0.54,
    tint: 0xe0d4c5,
    dispatch: ["Dyspozytor: Wi-Ma i stare torowisko, jedź płynnie na nastawniku."]
  },
  centrum: {
    traffic: 1.52,
    pedestrians: 1.55,
    windows: 0.92,
    tint: 0xf1e2c5,
    dispatch: [
      "Dyspozytor: centrum, korki i piesi, trzymaj oczy na sygnałach.",
      "Dyspozytor: Piotrkowska blisko, punktualność ważna, ale bez szarpania."
    ]
  },
  piotrkowska: {
    traffic: 1.42,
    pedestrians: 1.7,
    windows: 1,
    tint: 0xf4d35e,
    dispatch: ["Dyspozytor: przesiadkowe centrum, postaraj się o czysty postój."]
  },
  kaliska: {
    traffic: 1.28,
    pedestrians: 1.25,
    windows: 0.74,
    tint: 0xd8e2e8,
    dispatch: ["Dyspozytor: przed Kaliską pamiętaj o skręcie we Włókniarzy."]
  },
  wlokniarzy: {
    traffic: 1.2,
    pedestrians: 1,
    windows: 0.56,
    tint: 0xd8d6ca,
    dispatch: ["Dyspozytor: Włókniarzy, długi przelot. Trzymaj tempo i nie przestrzel przystanku."]
  },
  teofilow: {
    traffic: 0.75,
    pedestrians: 0.7,
    windows: 0.46,
    tint: 0xd2dbe5,
    dispatch: ["Dyspozytor: Teofilów coraz bliżej, dowieź skład do końca."]
  }
};

export const SURFACE_PALETTES = {
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

export const DISTRICT_VISUALS = {
  zarzew: { sky: 0xa9c7c2, skyAlpha: 0.08, horizon: 0x697a65, horizonAlpha: 0.08, accent: 0xb9c5b8, accentAlpha: 0.28, propTint: 0xc8d2bc, decor: "cemetery" },
  "widzew-wschod": { sky: 0x9fc0dc, skyAlpha: 0.1, horizon: 0x496171, horizonAlpha: 0.09, accent: 0x8fb7e8, accentAlpha: 0.3, propTint: 0xc7d8e4, decor: "housing" },
  rokicinska: { sky: 0xb2cdbf, skyAlpha: 0.08, horizon: 0x4b6a61, horizonAlpha: 0.08, accent: 0x7ab89a, accentAlpha: 0.24, propTint: 0xbdd2cc, decor: "road" },
  widzew: { sky: 0xd8b0a6, skyAlpha: 0.12, horizon: 0x7b2029, horizonAlpha: 0.1, accent: 0xd71920, accentAlpha: 0.35, propTint: 0xf0ded2, decor: "stadium" },
  wima: { sky: 0xd0b08c, skyAlpha: 0.12, horizon: 0x6a4b35, horizonAlpha: 0.12, accent: 0xc58a4a, accentAlpha: 0.32, propTint: 0xd9b98e, decor: "factory" },
  centrum: { sky: 0xe4c98a, skyAlpha: 0.1, horizon: 0x7a5a36, horizonAlpha: 0.1, accent: 0xf4d35e, accentAlpha: 0.35, propTint: 0xe5c37d, decor: "city" },
  piotrkowska: { sky: 0xffd56a, skyAlpha: 0.13, horizon: 0x8a4c2c, horizonAlpha: 0.1, accent: 0xffb22e, accentAlpha: 0.4, propTint: 0xf4d35e, decor: "festival" },
  kaliska: { sky: 0xb9d7e8, skyAlpha: 0.11, horizon: 0x4b6470, horizonAlpha: 0.1, accent: 0x8fb7e8, accentAlpha: 0.32, propTint: 0xd8e2e8, decor: "arena" },
  wlokniarzy: { sky: 0xc5c8b6, skyAlpha: 0.09, horizon: 0x5d6558, horizonAlpha: 0.09, accent: 0xb8c36a, accentAlpha: 0.28, propTint: 0xc4c8b7, decor: "artery" },
  teofilow: { sky: 0xbfd0dc, skyAlpha: 0.11, horizon: 0x526675, horizonAlpha: 0.1, accent: 0x9db9ce, accentAlpha: 0.34, propTint: 0xc9d7df, decor: "suburb" }
};

export const MAJOR_STOP_IDS = new Set([
  "zarzew",
  "widzew-stadion",
  "konstytucyjna",
  "piotrkowska",
  "mickiewicza",
  "legionow",
  "lutomierska",
  "teofilow"
]);

export const STATION_KEYS = ["station", "station-long", "station-board"];

export const MAP_LABELS = {
  zarzew: "Zarzew",
  "widzew-stadion": "Widzew",
  piotrkowska: "Centrum",
  mickiewicza: "Kaliska",
  lutomierska: "Lutom.",
  teofilow: "Teofilów"
};
