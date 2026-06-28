import { ROUTE_SCALE } from "./constants.js";

export const PASSENGER_KEYS = ["passenger-a", "passenger-b", "passenger-c", "passenger-d", "passenger-e"];
export const WORLD_PASSENGER_KEYS = ["pedestrian-side-a", "pedestrian-side-b", "pedestrian-side-c"];
export const PASSENGER_TINTS = [0xffffff, 0xfff1cf, 0xdcecff, 0xe6ffd9, 0xffdfd1];

export const UI_ASSETS = [
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

export const WIDZEW_STADIUM_MUSIC = {
  stopId: "widzew-stadion",
  sources: [],
  before: Math.round(0.035 * ROUTE_SCALE),
  after: Math.round(0.035 * ROUTE_SCALE),
  volume: 0.22,
  fadeSpeed: 3.4
};
