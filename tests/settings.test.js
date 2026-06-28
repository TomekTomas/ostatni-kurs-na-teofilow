import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, SETTINGS_KEY, loadSettings, normalizeSettings, saveSettings } from "../src/services/settings.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

describe("ustawienia gracza", () => {
  it("maja stabilne wartosci domyslne", () => {
    expect(loadSettings(memoryStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it("ograniczaja glosnosc do zakresu 0-1", () => {
    expect(normalizeSettings({ masterVolume: 2, musicVolume: -1 }).masterVolume).toBe(1);
    expect(normalizeSettings({ masterVolume: 2, musicVolume: -1 }).musicVolume).toBe(0);
  });

  it("migruja brakujace pola starego zapisu", () => {
    const settings = normalizeSettings({ version: 0, masterVolume: 0.25 });
    expect(settings.version).toBe(1);
    expect(settings.masterVolume).toBe(0.25);
    expect(settings.highContrastSignals).toBe(false);
  });

  it("nie ufa tekstowym wartosciom boolean", () => {
    expect(normalizeSettings({ screenShake: "false" }).screenShake).toBe(true);
  });

  it("zapisuje wersjonowany klucz", () => {
    const storage = memoryStorage();
    saveSettings({ ...DEFAULT_SETTINGS, reducedMotion: true }, storage);
    expect(JSON.parse(storage.getItem(SETTINGS_KEY)).reducedMotion).toBe(true);
  });

  it("wraca do domyslnych po uszkodzonym JSON", () => {
    expect(loadSettings(memoryStorage({ [SETTINGS_KEY]: "{" }))).toEqual(DEFAULT_SETTINGS);
  });
});
