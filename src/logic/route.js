import { ROUTE_SCALE } from "../config/constants.js";
import { STOPS, ROUTE_END_DISTANCE, SWITCHES } from "../config/route.js";

export { STOPS, ROUTE_END_DISTANCE, ROUTE_SCALE, SWITCHES };

export function formatRouteDistance(gameUnits) {
  const meters = Math.max(0, Math.round((gameUnits / ROUTE_SCALE) * 1000));
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function shortLabel(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

export function scheduleTimeForStop({ stop, scheduleDuration, routeEnd = ROUTE_END_DISTANCE }) {
  return (stop.distance / routeEnd) * scheduleDuration;
}

export function scheduleDeltaForStop({ stop, elapsedTime, scheduleDuration, routeEnd = ROUTE_END_DISTANCE }) {
  return elapsedTime - scheduleTimeForStop({ stop, scheduleDuration, routeEnd });
}

export function scheduleLabel(delta) {
  const abs = Math.abs(delta);
  if (abs <= 18) return "punktualnie";
  if (delta < 0) return `za wcześnie ${Math.round(abs)}s`;
  return `spóźnienie ${Math.round(abs)}s`;
}

export function classifyScheduleDelta(delta) {
  if (Math.abs(delta) <= 18) return "ontime";
  return delta < 0 ? "early" : "late";
}

export function realKilometersForStop(stop) {
  return stop.distance / ROUTE_SCALE;
}
