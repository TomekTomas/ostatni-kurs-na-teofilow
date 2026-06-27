import { BACKGROUNDS } from "./route.js";
import { PASSENGER_KEYS, UI_ASSETS } from "./ui.js";

const SPRITE_PATH = "assets/sprites";

export const MENU_ASSET_PATHS = [
  "assets/sprites/track.png",
  "assets/sprites/plac.png",
  "assets/trams/tram-konstal.png",
  "assets/trams/tram-pesa.png",
  "assets/backgrounds/bg-piotrkowska.png",
  "assets/branding/lcn-logo-menu.png",
  ...UI_ASSETS.map((key) => `assets/ui/${key}.png`)
];

export const GAME_ASSET_PATHS = [
  "assets/trams/tram-konstal-open.png",
  "assets/trams/tram-pesa-open.png",
  "assets/audio/konstal_ride_loop.ogg",
  "assets/audio/pesa_ride_loop.ogg",
  ...BACKGROUNDS.filter((name) => name !== "piotrkowska").map((name) => `assets/backgrounds/bg-${name}.png`)
];

export function queueMenuAssets(scene) {
  scene.load.image("track", `${SPRITE_PATH}/track.png`);
  scene.load.image("plac", `${SPRITE_PATH}/plac.png`);
  scene.load.image("tram-konstal", "assets/trams/tram-konstal.png");
  scene.load.image("tram-pesa", "assets/trams/tram-pesa.png");
  scene.load.image("bg-piotrkowska", "assets/backgrounds/bg-piotrkowska.png");
  scene.load.image("lcn-logo-menu", "assets/branding/lcn-logo-menu.png");
  UI_ASSETS.forEach((key) => scene.load.image(key, `assets/ui/${key}.png`));
}

export function queueGameAssets(scene) {
  [
    "manufaktura", "unicorn", "pothole", "car", "powerline", "passenger",
    "car-side-green", "car-side-cyan", "car-side-orange", "car-side-red",
    "compact-side-silver", "taxi-side-yellow", "police-side-blue", "van-side-white",
    "delivery-van-blue", "bus-side", "bus-articulated-side", "scooter-side", "cargo-bike-side",
    "maintenance-van-side", "roadworks-truck-side", "cyclist-side",
    "pedestrian-side-a", "pedestrian-side-b", "pedestrian-side-c", "pedestrian-side-d", "pedestrian-side-e",
    "prop-tree", "prop-lamp", "prop-pole", "prop-bin", "prop-bollard", "prop-ticket-machine",
    "prop-news-kiosk", "prop-ad-column", "prop-road-cone", "prop-road-cones", "road-pothole",
    "prop-road-barrier", "prop-roadwork-sign", "prop-construction-barrel", "prop-sandbags", "prop-manhole-cover",
    ...PASSENGER_KEYS
  ].forEach((key) => scene.load.image(key, `${SPRITE_PATH}/${key}.png`));

  scene.load.image("tram-konstal-open", "assets/trams/tram-konstal-open.png");
  scene.load.image("tram-pesa-open", "assets/trams/tram-pesa-open.png");
  scene.load.image("ai-car", "assets/sprites-ai/car.png");
  scene.load.image("ai-car-green", "assets/sprites-ai/car-green.png");
  scene.load.image("station", "assets/sprites/station-shelter-modern.png");
  scene.load.image("station-long", "assets/sprites/station-shelter-long.png");
  scene.load.image("station-board", "assets/sprites/station-shelter-board.png");
  scene.load.image("station-pole-bench", "assets/sprites/station-pole-bench.png");
  scene.load.image("station-unicorn", "assets/generated/stajnia-jednorozcow-stop.png");
  scene.load.image("lcn-billboard-generated", "assets/branding/lcn-billboard-generated.png");
  scene.load.image("lcn-billboard-1", "assets/branding/lcn-billboard-1.png");
  scene.load.image("lcn-billboard-2", "assets/branding/lcn-billboard-2.png");
  scene.load.image("lcn-billboard-3", "assets/branding/lcn-billboard-3.png");
  scene.load.image("lodz-detail-lcn", "assets/generated/lodz-detail-lcn.png");
  scene.load.image("lodz-detail-mural", "assets/generated/lodz-detail-mural.png");
  scene.load.image("lodz-detail-cafe", "assets/generated/lodz-detail-cafe.png");
  scene.load.image("lodz-detail-works", "assets/generated/lodz-detail-works-alpha.png");
  scene.load.image("landmark-znicze", "assets/generated/landmark-znicze.png");
  scene.load.image("landmark-drzewo", "assets/generated/landmark-drzewo.png");
  scene.load.image("landmark-smolarek-mural", "assets/generated/landmark-smolarek-mural.png");
  scene.load.image("landmark-witcher-mural", "assets/generated/landmark-witcher-mural.png");
  scene.load.image("landmark-widzew-fans", "assets/generated/widzew-fans-bg.png");
  scene.load.image("landmark-unicorn-statue", "assets/generated/landmark-unicorn-statue.png");
  scene.load.image("arrow-left", "assets/sprites-ai/arrow-left.png");
  scene.load.image("arrow-right", "assets/sprites-ai/arrow-right.png");
  scene.load.audio("ride-konstal", "assets/audio/konstal_ride_loop.ogg");
  scene.load.audio("ride-pesa", "assets/audio/pesa_ride_loop.ogg");
  BACKGROUNDS.filter((name) => name !== "piotrkowska").forEach((name) => {
    scene.load.image(`bg-${name}`, `assets/backgrounds/bg-${name}.png`);
  });
}
