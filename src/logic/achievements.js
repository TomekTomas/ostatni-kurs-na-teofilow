export const ACHIEVEMENTS = [
  { id: "first-run", label: "Pierwszy kurs", test: ({ profile }) => profile.stats.runs >= 1 },
  { id: "last-course", label: "Ostatni kurs", test: ({ run }) => run.completed && run.mode === "last" },
  { id: "grade-s", label: "Mistrz linii 8", test: ({ run }) => run.completed && run.grade === "S" },
  { id: "all-stops", label: "Komplet przystanków", test: ({ run }) => run.completed && run.servedStops === 34 && run.missedStops === 0 },
  { id: "smooth-90", label: "Jazda jak po sznurku", test: ({ run }) => run.completed && run.smoothness >= 90 },
  { id: "punctual-90", label: "Co do minuty", test: ({ run }) => run.completed && run.punctuality >= 90 },
  { id: "no-red", label: "Zielona fala", test: ({ run }) => run.completed && run.redSignals === 0 },
  { id: "switch-master", label: "Zwrotniczy", test: ({ run }) => run.completed && run.switchWrong === 0 && run.switchCorrect >= 3 },
  { id: "rush", label: "Szczyt opanowany", test: ({ run }) => run.completed && run.mode === "rush" },
  { id: "night", label: "Nocna zmiana", test: ({ run }) => run.completed && run.mode === "night" },
  { id: "konstal", label: "Klasyka Łodzi", test: ({ run }) => run.completed && run.vehicle === "konstal" },
  { id: "pesa", label: "Nowoczesny motorniczy", test: ({ run }) => run.completed && run.vehicle === "pesa" }
];

export function evaluateAchievements(run, profile) {
  const unlocked = new Set(profile.achievements || []);
  return ACHIEVEMENTS.filter((achievement) => !unlocked.has(achievement.id) && achievement.test({ run, profile }));
}

export function achievementProgress(profile) {
  const unlocked = new Set(profile?.achievements || []);
  return ACHIEVEMENTS.map(({ id, label }) => ({ id, label, unlocked: unlocked.has(id) }));
}
