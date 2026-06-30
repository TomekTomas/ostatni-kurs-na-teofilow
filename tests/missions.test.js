import { describe, expect, it } from "vitest";
import { STOPS, SWITCHES } from "../src/config/route.js";
import { missionByLabel, missionResults } from "../src/logic/missions.js";

const perfectStats = {
  missedStops: 0,
  servedStops: STOPS.length,
  redSignals: 0,
  switchWrong: 0,
  switchCorrect: SWITCHES.length
};

describe("cele misji", () => {
  it("wszystkie 7 misji przechodzi przy idealnym kursie", () => {
    const results = missionResults({ stats: perfectStats, smoothness: 100, satisfaction: 100, punctuality: 100 });
    expect(results).toHaveLength(7);
    expect(results.every((mission) => mission.ok)).toBe(true);
  });

  it("Dojedz do Teofilowa nie przechodzi po przerwaniu kursu", () => {
    const result = missionByLabel(missionResults({ interrupted: true, stats: perfectStats, smoothness: 100, satisfaction: 100, punctuality: 100 }), "Dojedź do Teofilowa");
    expect(result.ok).toBe(false);
  });

  it("Obsluz wszystkie przystanki nie przechodzi przy pominietym stopie", () => {
    const result = missionByLabel(missionResults({ stats: { ...perfectStats, missedStops: 1 }, smoothness: 100, satisfaction: 100, punctuality: 100 }), "Obsłuż wszystkie przystanki");
    expect(result.ok).toBe(false);
  });

  it("Plynnosc minimum 75% przechodzi na granicy 75", () => {
    const result = missionByLabel(missionResults({ stats: perfectStats, smoothness: 75, satisfaction: 100, punctuality: 100 }), "Płynność minimum 75%");
    expect(result.ok).toBe(true);
  });

  it("Plynnosc minimum 75% nie przechodzi przy 74", () => {
    const result = missionByLabel(missionResults({ stats: perfectStats, smoothness: 74, satisfaction: 100, punctuality: 100 }), "Płynność minimum 75%");
    expect(result.ok).toBe(false);
  });

  it("Punktualnosc minimum 70% przechodzi na granicy 70", () => {
    const result = missionByLabel(missionResults({ stats: perfectStats, smoothness: 100, satisfaction: 100, punctuality: 70 }), "Punktualność minimum 70%");
    expect(result.ok).toBe(true);
  });

  it("Punktualnosc minimum 70% nie przechodzi przy 69", () => {
    const result = missionByLabel(missionResults({ stats: perfectStats, smoothness: 100, satisfaction: 100, punctuality: 69 }), "Punktualność minimum 70%");
    expect(result.ok).toBe(false);
  });

  it("Zadowolenie minimum 70% pilnuje granicy", () => {
    expect(missionByLabel(missionResults({ stats: perfectStats, smoothness: 100, satisfaction: 70, punctuality: 100 }), "Zadowolenie minimum 70%").ok).toBe(true);
    expect(missionByLabel(missionResults({ stats: perfectStats, smoothness: 100, satisfaction: 69, punctuality: 100 }), "Zadowolenie minimum 70%").ok).toBe(false);
  });

  it("Bez przejazdu na czerwonym nie przechodzi po czerwonym swietle", () => {
    const result = missionByLabel(missionResults({ stats: { ...perfectStats, redSignals: 1 }, smoothness: 100, satisfaction: 100, punctuality: 100 }), "Bez przejazdu na czerwonym");
    expect(result.ok).toBe(false);
  });

  it("Zwrotnice bez pomylki nie przechodzi po bledzie zwrotnicy", () => {
    const result = missionByLabel(missionResults({ stats: { ...perfectStats, switchWrong: 1 }, smoothness: 100, satisfaction: 100, punctuality: 100 }), "Zwrotnice bez pomyłki");
    expect(result.ok).toBe(false);
  });

  it("Zwrotnice bez pomylki wymaga zaliczenia wszystkich zwrotnic", () => {
    const result = missionByLabel(missionResults({ stats: { ...perfectStats, switchCorrect: SWITCHES.length - 1 }, smoothness: 100, satisfaction: 100, punctuality: 100 }), "Zwrotnice bez pomyłki");
    expect(result.ok).toBe(false);
  });
});
