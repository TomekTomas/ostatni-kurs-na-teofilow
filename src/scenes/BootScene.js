import { BACKGROUNDS } from "../config/route.js";
import { PASSENGER_KEYS, UI_ASSETS } from "../config/ui.js";

export class BootScene extends Phaser.Scene {
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
      "car-side-red",
      "compact-side-silver",
      "taxi-side-yellow",
      "police-side-blue",
      "van-side-white",
      "delivery-van-blue",
      "bus-side",
      "bus-articulated-side",
      "scooter-side",
      "cargo-bike-side",
      "maintenance-van-side",
      "roadworks-truck-side",
      "cyclist-side",
      "pedestrian-side-a",
      "pedestrian-side-b",
      "pedestrian-side-c",
      "pedestrian-side-d",
      "pedestrian-side-e",
      "prop-tree",
      "prop-lamp",
      "prop-pole",
      "prop-bin",
      "prop-bollard",
      "prop-ticket-machine",
      "prop-news-kiosk",
      "prop-ad-column",
      "prop-road-cone",
      "prop-road-cones",
      "road-pothole",
      "prop-road-barrier",
      "prop-roadwork-sign",
      "prop-construction-barrel",
      "prop-sandbags",
      "prop-manhole-cover",
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
    this.load.image("station-unicorn", "assets/generated/stajnia-jednorozcow-stop.png");
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
    this.load.image("landmark-widzew-fans", "assets/generated/widzew-fans-bg.png");
    this.load.image("landmark-unicorn-statue", "assets/generated/landmark-unicorn-statue.png");
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
