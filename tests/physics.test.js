import { describe, expect, it } from "vitest";
import { GAME_MODES } from "../src/config/modes.js";
import { VEHICLES } from "../src/config/vehicles.js";
import {
  calculateRideComfortSample,
  calculateSafeSpeed,
  recommendedStopSpeed,
  toDisplaySpeed,
  updateDangerTime,
  updateSpeed
} from "../src/logic/physics.js";

describe("fizyka tramwaju", () => {
  it("bezpieczna predkosc spada przy gorszym torowisku", () => {
    const high = calculateSafeSpeed({ vehicle: VEHICLES.pesa, trackCondition: 0.9, mode: GAME_MODES.last });
    const low = calculateSafeSpeed({ vehicle: VEHICLES.pesa, trackCondition: 0.5, mode: GAME_MODES.last });
    expect(low).toBeLessThan(high);
  });

  it("tryb nocny podnosi limit przez speedAllowance", () => {
    const last = calculateSafeSpeed({ vehicle: VEHICLES.konstal, trackCondition: 0.7, mode: GAME_MODES.last });
    const night = calculateSafeSpeed({ vehicle: VEHICLES.konstal, trackCondition: 0.7, mode: GAME_MODES.night });
    expect(night).toBeGreaterThan(last);
  });

  it("wykolejenie pojawia sie po ponad 2.15 s przekroczenia predkosci", () => {
    const state = updateDangerTime({ speed: 120, safeSpeed: 90, dangerTime: 2.0, dt: 0.2 });
    expect(state.derailed).toBe(true);
  });

  it("czas zagrozenia maleje po powrocie pod limit", () => {
    const state = updateDangerTime({ speed: 70, safeSpeed: 90, dangerTime: 2.0, dt: 0.5 });
    expect(state).toEqual({ dangerTime: 1.2, derailed: false });
  });

  it("Pesa ma mocniejsze hamowanie niz Konstal", () => {
    const konstal = updateSpeed({ speed: 200, throttle: 0, dt: 0.2, vehicle: VEHICLES.konstal }).speed;
    const pesa = updateSpeed({ speed: 200, throttle: 0, dt: 0.2, vehicle: VEHICLES.pesa }).speed;
    expect(pesa).toBeLessThan(konstal);
  });

  it("predkosc pozostaje zerowa przy zerowym nastawniku", () => {
    expect(updateSpeed({ speed: 0, throttle: 0, dt: 1, vehicle: VEHICLES.konstal }).speed).toBe(0);
  });

  it("predkosc nie przekracza maxSpeed pojazdu", () => {
    expect(updateSpeed({ speed: 314, throttle: 1, dt: 2, vehicle: VEHICLES.pesa }).speed).toBe(VEHICLES.pesa.maxSpeed);
  });

  it("krzywa przyspieszenia odpowiada statystykom pojazdu", () => {
    expect(updateSpeed({ speed: 0, throttle: 1, dt: 1, vehicle: VEHICLES.konstal }).speed).toBe(VEHICLES.konstal.acceleration);
    expect(updateSpeed({ speed: 0, throttle: 1, dt: 1, vehicle: VEHICLES.pesa }).speed).toBe(VEHICLES.pesa.acceleration);
  });

  it("zalecana predkosc przy peronie ma dolny limit 10", () => {
    expect(recommendedStopSpeed({ distanceToStop: 100, vehicle: VEHICLES.konstal })).toBe(10);
  });

  it("zalecana predkosc hamowania jest wyzsza dla Pesy przy tym samym dystansie", () => {
    expect(recommendedStopSpeed({ distanceToStop: 250, vehicle: VEHICLES.pesa })).toBeGreaterThan(recommendedStopSpeed({ distanceToStop: 250, vehicle: VEHICLES.konstal }));
  });

  it("komfort jazdy maleje przy overspeedzie i szarpnieciu", () => {
    const smooth = calculateRideComfortSample({ speed: 70, safeSpeed: 100, vehicle: VEHICLES.pesa, trackCondition: 0.9, inputJerk: 0, rideEventPenalty: 0 });
    const rough = calculateRideComfortSample({ speed: 130, safeSpeed: 100, vehicle: VEHICLES.pesa, trackCondition: 0.5, inputJerk: 3, rideEventPenalty: 10 });
    expect(rough).toBeLessThan(smooth);
  });

  it("predkosc wyswietlana skaluje sie do realnego limitu tramwaju", () => {
    expect(toDisplaySpeed({ rawSpeed: VEHICLES.konstal.maxSpeed, vehicle: VEHICLES.konstal })).toBe(VEHICLES.konstal.displayMaxSpeed);
  });
});
