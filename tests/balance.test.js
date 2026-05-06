import { describe, expect, it } from "vitest";
import { GAME_MODES } from "../src/config/modes.js";
import { STOPS } from "../src/config/route.js";
import { VEHICLES } from "../src/config/vehicles.js";
import {
  addRidePenalty,
  adjustSatisfaction,
  initialPassengers,
  missedStopPenalty,
  passengerExchange,
  schedulePenalty,
  waitingCrowdSize
} from "../src/logic/balance.js";

describe("balans pasazerow i kar", () => {
  it("wymiana pasazerow respektuje mnoznik passengerDemand trybu", () => {
    const stop = { board: 10, alight: 4 };
    const last = passengerExchange({ stop, mode: GAME_MODES.last, vehicle: VEHICLES.konstal, passengers: 20 });
    const rush = passengerExchange({ stop, mode: GAME_MODES.rush, vehicle: VEHICLES.konstal, passengers: 20 });
    expect(rush.boarding).toBe(Math.round(stop.board * 1.48));
    expect(rush.leaving).toBeGreaterThan(last.leaving);
  });

  it("Teofilow jako ostatni przystanek wysadza wszystkich pozostalych pasazerow", () => {
    const teofilow = STOPS.at(-1);
    const result = passengerExchange({ stop: teofilow, mode: GAME_MODES.last, vehicle: VEHICLES.konstal, passengers: 47 });
    expect(result.leaving).toBe(47);
    expect(result.passengers).toBe(0);
  });

  it("kara za pominiety przystanek zmniejsza satysfakcje", () => {
    const result = missedStopPenalty({ score: 500, satisfaction: 90, rideEventPenalty: 0, mode: GAME_MODES.last, vehicle: VEHICLES.konstal });
    expect(result.satisfaction).toBe(74);
    expect(result.score).toBe(340);
    expect(result.combo).toBe(1);
  });

  it("tryb szczytu zwieksza popyt pasazerow 1.48x", () => {
    expect(initialPassengers(GAME_MODES.rush)).toBe(Math.round(18 * 1.48));
  });

  it("tryb nocny obniza popyt pasazerow do 0.58x", () => {
    expect(initialPassengers(GAME_MODES.night)).toBe(Math.round(18 * 0.58));
  });

  it("tryb treningowy lagodzi kary przez nizsze eventPressure", () => {
    const last = adjustSatisfaction({ satisfaction: 100, delta: -10, mode: GAME_MODES.last });
    const training = adjustSatisfaction({ satisfaction: 100, delta: -10, mode: GAME_MODES.training });
    expect(training).toBeGreaterThan(last);
  });

  it("dodatnia satysfakcja nie jest skalowana przez eventPressure", () => {
    expect(adjustSatisfaction({ satisfaction: 50, delta: 1.2, mode: GAME_MODES.rush })).toBe(51.2);
  });

  it("kara rideEventPenalty zalezy od komfortu pojazdu", () => {
    const konstal = addRidePenalty({ rideEventPenalty: 0, amount: 10, mode: GAME_MODES.last, vehicle: VEHICLES.konstal });
    const pesa = addRidePenalty({ rideEventPenalty: 0, amount: 10, mode: GAME_MODES.last, vehicle: VEHICLES.pesa });
    expect(konstal).toBeGreaterThan(pesa);
  });

  it("tlum oczekujacy na przystanku skaluje sie z trybem gry", () => {
    const stop = STOPS.find((item) => item.id === "piotrkowska");
    expect(waitingCrowdSize(stop, GAME_MODES.rush)).toBeGreaterThan(waitingCrowdSize(stop, GAME_MODES.night));
  });

  it("kara rozkladu ma minimum 1 i maksimum 9", () => {
    expect(schedulePenalty(19)).toBe(1);
    expect(schedulePenalty(500)).toBe(9);
  });
});
