export const BASE_WIDTH = 1280;
export const HEIGHT = 720;
export const WIDTH = Math.max(
  BASE_WIDTH,
  Math.round(((window.visualViewport?.width || window.innerWidth || BASE_WIDTH) / (window.visualViewport?.height || window.innerHeight || HEIGHT)) * HEIGHT)
);
export const START_ASPECT = WIDTH / HEIGHT;
export const TRACK_Y = 560;
export const TRAM_BASE_Y = 628;
export const ROUTE_SCALE = 5500;
export const ROUTE_LENGTH = 94000;
export const FONT_FAMILY = '"Lexend Deca", "Segoe UI", Arial, sans-serif';
export const SCORE_WEIGHTS = {
  deliveredPassenger: 38,
  satisfaction: 8,
  smoothness: 7,
  punctuality: 6,
  remainingTime: 3,
  finishTime: 4,
  finishSatisfaction: 12,
  finishSmoothness: 10,
  finishPunctuality: 7
};
export const MESSAGE_PRIORITY = {
  ambient: 0,
  info: 1,
  success: 2,
  warning: 3,
  danger: 4,
  critical: 5
};
