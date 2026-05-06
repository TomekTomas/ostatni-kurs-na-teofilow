import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS } from "../src/config/constants.js";
import { STOPS } from "../src/config/route.js";
import {
  calculateCurrentScore,
  calculateFinishBonus,
  courseGrade,
  nextStopCombo,
  nextSwitchCombo,
  stopServiceScore
} from "../src/logic/scoring.js";

describe("punktacja kursu", () => {
  it("liczy wynik idealnego przejazdu z kompletem parametrow", () => {
    const result = calculateCurrentScore({
      score: 1000,
      delivered: 180,
      satisfaction: 100,
      smoothness: 100,
      punctuality: 100,
      timeLeft: 120
    });
    expect(result).toBe(1000 + 180 * 38 + 100 * 8 + 100 * 7 + 100 * 6 + 120 * 3);
  });

  it("nie schodzi ponizej zera przy najgorszym wyniku", () => {
    expect(calculateCurrentScore({ score: -999, delivered: 0, satisfaction: 0, smoothness: 0, punctuality: 0, timeLeft: -30 })).toBe(0);
  });

  it("ocena S zaczyna sie od 92 punktow jakości", () => {
    expect(courseGrade({ satisfaction: 100, smoothness: 100, punctuality: 100, servedStops: STOPS.length, timeLeft: 560 })).toBe("S");
  });

  it("ocena A obejmuje prog od 82", () => {
    expect(courseGrade({ satisfaction: 61.2, smoothness: 61.2, punctuality: 61.2, servedStops: STOPS.length, timeLeft: 560 })).toBe("A");
  });

  it("ocena B obejmuje prog od 70", () => {
    expect(courseGrade({ satisfaction: 44.5, smoothness: 44.5, punctuality: 44.5, servedStops: STOPS.length, timeLeft: 560 })).toBe("B");
  });

  it("ocena C obejmuje prog od 58", () => {
    expect(courseGrade({ satisfaction: 27.8, smoothness: 27.8, punctuality: 27.8, servedStops: STOPS.length, timeLeft: 560 })).toBe("C");
  });

  it("ocena D jest ponizej 58", () => {
    expect(courseGrade({ satisfaction: 30, smoothness: 40, punctuality: 45, servedStops: 12, timeLeft: 0 })).toBe("D");
  });

  it("ocena N oznacza przerwany kurs", () => {
    expect(courseGrade({ interrupted: true, satisfaction: 100, smoothness: 100, punctuality: 100, servedStops: STOPS.length, timeLeft: 999 })).toBe("N");
  });

  it("combo rosnie po postoju S albo A", () => {
    expect(nextStopCombo({ combo: 1.5, rating: "S", bestCombo: 1.5 })).toEqual({ combo: 1.75, bestCombo: 1.75, stopStreakDelta: 1 });
  });

  it("combo resetuje sie po slabszym postoju", () => {
    expect(nextStopCombo({ combo: 2.5, rating: "B", bestCombo: 2.8 }).combo).toBe(1);
  });

  it("combo nie przekracza limitu x3", () => {
    expect(nextStopCombo({ combo: 2.9, rating: "A", bestCombo: 2.9 }).combo).toBe(3);
  });

  it("zwrotnica poprawna dodaje mniejsze combo", () => {
    expect(nextSwitchCombo({ combo: 1.1, correct: true, bestCombo: 1.1 }).combo).toBeCloseTo(1.25);
  });

  it("zwrotnica bledna resetuje combo", () => {
    expect(nextSwitchCombo({ combo: 2.1, correct: false, bestCombo: 2.4 })).toEqual({ combo: 1, bestCombo: 2.4 });
  });

  it("kazdy skladnik SCORE_WEIGHTS wnosi oczekiwana wartosc", () => {
    expect(calculateCurrentScore({ delivered: 1 })).toBe(SCORE_WEIGHTS.deliveredPassenger);
    expect(calculateCurrentScore({ satisfaction: 1 })).toBe(SCORE_WEIGHTS.satisfaction);
    expect(calculateCurrentScore({ smoothness: 1 })).toBe(SCORE_WEIGHTS.smoothness);
    expect(calculateCurrentScore({ punctuality: 1 })).toBe(SCORE_WEIGHTS.punctuality);
    expect(calculateCurrentScore({ timeLeft: 1 })).toBe(SCORE_WEIGHTS.remainingTime);
  });

  it("premia koncowa uzywa osobnych wag finiszu", () => {
    expect(calculateFinishBonus({ timeLeft: 10, satisfaction: 10, smoothness: 10, punctuality: 10 })).toBe(10 * 4 + 10 * 12 + 10 * 10 + 10 * 7);
  });

  it("premia koncowa z brakami jest obcinana do 45 procent", () => {
    expect(calculateFinishBonus({ timeLeft: 10, satisfaction: 10, smoothness: 10, punctuality: 10, missed: true })).toBe(Math.round(330 * 0.45));
  });

  it("punktacja przystanku laczy wysiadajacych, wsiadajacych, satysfakcje i combo", () => {
    expect(stopServiceScore({ leaving: 3, boarding: 5, satisfaction: 87.4, precisionScore: 95, scheduleScore: 130, combo: 1.25 })).toEqual({
      baseScore: 3 * 65 + 5 * 12 + 175 + 95 + 130,
      scored: Math.round((3 * 65 + 5 * 12 + 175 + 95 + 130) * 1.25)
    });
  });
});
