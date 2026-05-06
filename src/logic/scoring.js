import { SCORE_WEIGHTS } from "../config/constants.js";
import { STOPS } from "../config/route.js";

export function calculateCurrentScore({
  score = 0,
  delivered = 0,
  satisfaction = 0,
  smoothness = 0,
  punctuality = 0,
  timeLeft = 0
} = {}) {
  return Math.max(0, Math.round(
    score
    + delivered * SCORE_WEIGHTS.deliveredPassenger
    + satisfaction * SCORE_WEIGHTS.satisfaction
    + smoothness * SCORE_WEIGHTS.smoothness
    + punctuality * SCORE_WEIGHTS.punctuality
    + Math.max(0, timeLeft) * SCORE_WEIGHTS.remainingTime
  ));
}

export function calculateFinishBonus({ timeLeft = 0, satisfaction = 0, smoothness = 0, punctuality = 0, missed = false } = {}) {
  const bonus = Math.round(
    Math.max(0, timeLeft) * SCORE_WEIGHTS.finishTime
    + satisfaction * SCORE_WEIGHTS.finishSatisfaction
    + smoothness * SCORE_WEIGHTS.finishSmoothness
    + punctuality * SCORE_WEIGHTS.finishPunctuality
  );
  return missed ? Math.round(Math.max(0, bonus) * 0.45) : Math.max(0, bonus);
}

export function courseGrade({
  interrupted = false,
  satisfaction = 0,
  smoothness = 0,
  punctuality = 0,
  servedStops = 0,
  timeLeft = 0,
  totalStops = STOPS.length
} = {}) {
  if (interrupted) return "N";
  const score = satisfaction * 0.26
    + smoothness * 0.28
    + punctuality * 0.18
    + (servedStops / totalStops) * 22
    + Math.min(16, timeLeft / 35);
  if (score >= 92) return "S";
  if (score >= 82) return "A";
  if (score >= 70) return "B";
  if (score >= 58) return "C";
  return "D";
}

export function nextStopCombo({ combo = 1, rating = "C", bestCombo = combo } = {}) {
  if (rating === "S" || rating === "A") {
    const nextCombo = clamp(combo + 0.25, 1, 3);
    return {
      combo: nextCombo,
      bestCombo: Math.max(bestCombo, nextCombo),
      stopStreakDelta: 1
    };
  }
  return { combo: 1, bestCombo, stopStreakDelta: 0 };
}

export function nextSwitchCombo({ combo = 1, correct = false, bestCombo = combo } = {}) {
  if (!correct) return { combo: 1, bestCombo };
  const nextCombo = clamp(combo + 0.15, 1, 3);
  return { combo: nextCombo, bestCombo: Math.max(bestCombo, nextCombo) };
}

export function stopServiceScore({ leaving = 0, boarding = 0, satisfaction = 0, precisionScore = 0, scheduleScore = 0, combo = 1 } = {}) {
  const baseScore = leaving * 65 + boarding * 12 + Math.round(satisfaction * 2) + precisionScore + scheduleScore;
  return {
    baseScore,
    scored: Math.round(baseScore * combo)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
