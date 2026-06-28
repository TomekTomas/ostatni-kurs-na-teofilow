import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, achievementProgress, evaluateAchievements } from "../src/logic/achievements.js";
import { createRunSummary } from "../src/logic/runSummary.js";
import { createDefaultProfile, normalizeProfile, recordRun, sanitizeNickname } from "../src/services/profile.js";

const perfectRun = createRunSummary({
  id: "perfect", mode: "rush", vehicle: "pesa", score: 9000, grade: "S", completed: true,
  servedStops: 34, missedStops: 0, passengers: 180, satisfaction: 100, smoothness: 95,
  punctuality: 94, redSignals: 0, switchCorrect: 3, switchWrong: 0, durationSeconds: 600,
  challengeDate: "2026-06-27", challengeSeed: "kurs8:1:2026-06-27", rulesVersion: 1
});

describe("profil i osiagniecia", () => {
  it("definiuje dokladnie 12 osiagniec", () => {
    expect(ACHIEVEMENTS).toHaveLength(12);
  });

  it("idealny kurs odblokowuje pasujace osiagniecia", () => {
    const profile = createDefaultProfile();
    profile.stats.runs = 1;
    const ids = evaluateAchievements(perfectRun, profile).map(({ id }) => id);
    expect(ids).toEqual(expect.arrayContaining(["first-run", "grade-s", "all-stops", "smooth-90", "punctual-90", "no-red", "switch-master", "rush", "pesa"]));
  });

  it("nie odblokowuje ponownie zdobytych odznak", () => {
    const profile = createDefaultProfile();
    profile.achievements = ["grade-s"];
    expect(evaluateAchievements(perfectRun, profile).some(({ id }) => id === "grade-s")).toBe(false);
  });

  it("aktualizuje statystyki i rekord trybu", () => {
    const { profile } = recordRun(createDefaultProfile(), perfectRun);
    expect(profile.stats).toMatchObject({ runs: 1, completed: 1, passengers: 180 });
    expect(profile.stats.bestByMode.rush).toBe(9000);
  });

  it("nalicza serie kolejnych dni", () => {
    const first = recordRun(createDefaultProfile(), perfectRun).profile;
    const next = recordRun(first, { ...perfectRun, id: "next", challengeDate: "2026-06-28" }).profile;
    expect(next.stats.challengeStreak).toBe(2);
  });

  it("nie zwieksza serii za kolejna probe tego samego dnia", () => {
    const first = recordRun(createDefaultProfile(), perfectRun).profile;
    const retry = recordRun(first, { ...perfectRun, id: "retry" }).profile;
    expect(retry.stats.challengeStreak).toBe(1);
  });

  it("akceptuje polskie litery w nicku i odrzuca znaki specjalne", () => {
    expect(sanitizeNickname("Łódzki Motor_8")).toBe("Łódzki Motor_8");
    expect(sanitizeNickname("ja!" )).toBe("");
  });

  it("migruje niepelny profil i raportuje postep", () => {
    const profile = normalizeProfile({ nickname: "Tomek", stats: { runs: 3 }, achievements: ["first-run"] });
    expect(profile.stats.bestByMode.last).toBe(0);
    expect(achievementProgress(profile).filter(({ unlocked }) => unlocked)).toHaveLength(1);
  });
});
