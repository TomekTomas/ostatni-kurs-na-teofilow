import { describe, expect, it } from "vitest";
import {
  ROUTE_END_DISTANCE,
  ROUTE_SCALE,
  STOPS,
  SWITCHES,
  classifyScheduleDelta,
  formatRouteDistance,
  realKilometersForStop,
  scheduleDeltaForStop,
  scheduleLabel,
  scheduleTimeForStop,
  shortLabel
} from "../src/logic/route.js";

describe("trasa linii 8", () => {
  it("ma dokladnie 34 przystanki", () => {
    expect(STOPS).toHaveLength(34);
  });

  it("zaczyna sie na Cm. Zarzew i konczy na Teofilowie", () => {
    expect(STOPS[0].name).toBe("Cm. Zarzew");
    expect(STOPS.at(-1).name).toBe("Teofilów");
  });

  it("odleglosci przystankow sa scisle rosnace", () => {
    for (let i = 1; i < STOPS.length; i += 1) {
      expect(STOPS[i].distance).toBeGreaterThan(STOPS[i - 1].distance);
    }
  });

  it("dlugosc trasy wynosi 16.7 km w skali gry", () => {
    expect(ROUTE_END_DISTANCE).toBe(Math.round(16.7 * ROUTE_SCALE));
    expect(realKilometersForStop(STOPS.at(-1))).toBeCloseTo(16.7);
  });

  it("formatRouteDistance pokazuje metry ponizej kilometra", () => {
    expect(formatRouteDistance(0.4 * ROUTE_SCALE)).toBe("400 m");
  });

  it("formatRouteDistance pokazuje kilometry od 1000 metrow", () => {
    expect(formatRouteDistance(1.25 * ROUTE_SCALE)).toBe("1.3 km");
  });

  it("formatRouteDistance ucina wartosci ujemne do zera", () => {
    expect(formatRouteDistance(-500)).toBe("0 m");
  });

  it("shortLabel zostawia krotkie nazwy bez zmian", () => {
    expect(shortLabel("Teofilów", 12)).toBe("Teofilów");
  });

  it("shortLabel skraca dlugie nazwy przystankow", () => {
    expect(shortLabel("Mickiewicza (Dw. Ł. Kaliska)", 18)).toBe("Mickiewicza (Dw...");
  });

  it("scheduleDeltaForStop zwraca zero przy czasie zgodnym z rozkladem", () => {
    const stop = STOPS[10];
    const scheduleDuration = 860;
    const elapsedTime = scheduleTimeForStop({ stop, scheduleDuration });
    expect(scheduleDeltaForStop({ stop, elapsedTime, scheduleDuration })).toBeCloseTo(0);
  });

  it("scheduleDeltaForStop rozpoznaje kurs za wczesny", () => {
    const stop = STOPS[12];
    const scheduleDuration = 860;
    const elapsedTime = scheduleTimeForStop({ stop, scheduleDuration }) - 25;
    const delta = scheduleDeltaForStop({ stop, elapsedTime, scheduleDuration });
    expect(classifyScheduleDelta(delta)).toBe("early");
    expect(scheduleLabel(delta)).toBe("za wcześnie 25s");
  });

  it("scheduleDeltaForStop rozpoznaje opoznienie", () => {
    const stop = STOPS[12];
    const scheduleDuration = 860;
    const elapsedTime = scheduleTimeForStop({ stop, scheduleDuration }) + 31;
    const delta = scheduleDeltaForStop({ stop, elapsedTime, scheduleDuration });
    expect(classifyScheduleDelta(delta)).toBe("late");
    expect(scheduleLabel(delta)).toBe("spóźnienie 31s");
  });

  it("scheduleDeltaForStop ma tolerancje punktualnosci do 18 sekund", () => {
    expect(classifyScheduleDelta(18)).toBe("ontime");
    expect(scheduleLabel(-18)).toBe("punktualnie");
  });

  it("kazda zwrotnica ma prawidlowy kierunek correct", () => {
    expect(SWITCHES.length).toBeGreaterThan(0);
    SWITCHES.forEach((sw) => expect(["left", "straight"]).toContain(sw.correct));
  });
});
