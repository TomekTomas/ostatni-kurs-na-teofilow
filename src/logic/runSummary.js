import { GAME_MODES } from "../config/modes.js";
import { VEHICLES } from "../config/vehicles.js";

export const RUN_SUMMARY_VERSION = 1;

export function createRunId(now = Date.now(), random = Math.random) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `run-${now.toString(36)}-${Math.floor(random() * 0xffffffff).toString(36)}`;
}

export function createRunSummary(input = {}) {
  const mode = GAME_MODES[input.mode] ? input.mode : "last";
  const vehicle = VEHICLES[input.vehicle] ? input.vehicle : "konstal";
  return {
    version: RUN_SUMMARY_VERSION,
    id: String(input.id || createRunId()),
    mode,
    vehicle,
    score: integer(input.score, 0, 10_000_000),
    grade: ["S", "A", "B", "C", "D", "N"].includes(input.grade) ? input.grade : "N",
    completed: Boolean(input.completed),
    servedStops: integer(input.servedStops, 0, 34),
    missedStops: integer(input.missedStops, 0, 34),
    passengers: integer(input.passengers, 0, 100_000),
    satisfaction: percent(input.satisfaction),
    smoothness: percent(input.smoothness),
    punctuality: percent(input.punctuality),
    redSignals: integer(input.redSignals, 0, 1000),
    switchCorrect: integer(input.switchCorrect, 0, 1000),
    switchWrong: integer(input.switchWrong, 0, 1000),
    durationSeconds: integer(input.durationSeconds, 0, 86_400),
    finishedAt: validIso(input.finishedAt) || new Date().toISOString(),
    rulesVersion: integer(input.rulesVersion, 1, 1000),
    challengeDate: input.challengeDate || null,
    challengeSeed: input.challengeSeed || null
  };
}

export function isValidRunSummary(value) {
  if (!value || value.version !== RUN_SUMMARY_VERSION) return false;
  const normalized = createRunSummary(value);
  return normalized.id === value.id
    && normalized.mode === value.mode
    && normalized.vehicle === value.vehicle
    && normalized.score === value.score
    && normalized.servedStops === value.servedStops
    && normalized.satisfaction === value.satisfaction
    && normalized.rulesVersion === value.rulesVersion;
}

function percent(value) {
  return integer(Math.round(Number(value) || 0), 0, 100);
}

function integer(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
}

function validIso(value) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}
