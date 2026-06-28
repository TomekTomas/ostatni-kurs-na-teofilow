import { browserStorage, readJson, writeJson } from "./storage.js";

export const SETTINGS_KEY = "kurs8.settings.v1";
export const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  masterVolume: 0.8,
  musicVolume: 0.7,
  effectsVolume: 0.85,
  screenShake: true,
  weatherIntensity: 1,
  reducedMotion: false,
  highContrastSignals: false
});

export function normalizeSettings(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    version: 1,
    masterVolume: unit(source.masterVolume, DEFAULT_SETTINGS.masterVolume),
    musicVolume: unit(source.musicVolume, DEFAULT_SETTINGS.musicVolume),
    effectsVolume: unit(source.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
    screenShake: boolean(source.screenShake, DEFAULT_SETTINGS.screenShake),
    weatherIntensity: unit(source.weatherIntensity, DEFAULT_SETTINGS.weatherIntensity),
    reducedMotion: boolean(source.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    highContrastSignals: boolean(source.highContrastSignals, DEFAULT_SETTINGS.highContrastSignals)
  };
}

export function loadSettings(storage = browserStorage()) {
  return normalizeSettings(readJson(storage, SETTINGS_KEY, DEFAULT_SETTINGS));
}

export function saveSettings(settings, storage = browserStorage()) {
  const normalized = normalizeSettings(settings);
  writeJson(storage, SETTINGS_KEY, normalized);
  globalThis.window?.dispatchEvent?.(new CustomEvent("kurs8:settings", { detail: normalized }));
  return normalized;
}

function unit(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
}

function boolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
