import { describe, expect, it } from "vitest";
import { CHALLENGE_MODES, CHALLENGE_VEHICLES, createDailyChallenge, isDailyChallenge, utcDateKey } from "../src/logic/dailyChallenge.js";

describe("wyzwanie dnia", () => {
  it("uzywa daty UTC", () => {
    expect(utcDateKey("2026-06-27T23:59:59-02:00")).toBe("2026-06-28");
  });

  it("jest deterministyczne dla dnia i wersji zasad", () => {
    expect(createDailyChallenge("2026-06-27T01:00:00Z", 1)).toEqual(createDailyChallenge("2026-06-27T22:00:00Z", 1));
  });

  it("zmienia seed po zmianie wersji zasad", () => {
    expect(createDailyChallenge("2026-06-27", 1).seed).not.toBe(createDailyChallenge("2026-06-27", 2).seed);
  });

  it("wybiera istniejacy tryb i pojazd", () => {
    const challenge = createDailyChallenge("2026-06-27");
    expect(CHALLENGE_MODES).toContain(challenge.mode);
    expect(CHALLENGE_VEHICLES).toContain(challenge.vehicle);
  });

  it("ma wybor zgodny z algorytmem SQL dla pracy offline", () => {
    const challenge = createDailyChallenge("2026-06-27", 1);
    const dayNumber = Math.floor(Date.parse("2026-06-27T00:00:00Z") / 86_400_000);
    expect(challenge.mode).toBe(CHALLENGE_MODES[(dayNumber + 3) % 4]);
    expect(challenge.vehicle).toBe(CHALLENGE_VEHICLES[(Math.floor(dayNumber / 4) + 1) % 2]);
  });

  it("odrzuca niepelny kontrakt challenge'u", () => {
    expect(isDailyChallenge(createDailyChallenge("2026-06-27"))).toBe(true);
    expect(isDailyChallenge({ date: "2026-06-27", mode: "last" })).toBe(false);
  });
});
