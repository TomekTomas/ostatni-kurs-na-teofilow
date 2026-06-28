import { evaluateAchievements } from "../logic/achievements.js";
import { browserStorage, readJson, writeJson } from "./storage.js";

export const PROFILE_KEY = "kurs8.profile.v1";

export function createDefaultProfile(now = new Date().toISOString()) {
  return {
    version: 1,
    nickname: "Motorniczy",
    publicTag: "----",
    createdAt: now,
    stats: {
      runs: 0,
      completed: 0,
      passengers: 0,
      bestByMode: { last: 0, training: 0, rush: 0, night: 0 },
      dailyBest: {},
      challengeStreak: 0,
      lastChallengeDate: null
    },
    achievements: []
  };
}

export function normalizeProfile(value = {}) {
  const fallback = createDefaultProfile();
  const stats = value?.stats || {};
  return {
    version: 1,
    nickname: sanitizeNickname(value.nickname) || fallback.nickname,
    publicTag: /^[A-Z0-9]{4}$/.test(value.publicTag || "") ? value.publicTag : fallback.publicTag,
    createdAt: Number.isNaN(Date.parse(value.createdAt)) ? fallback.createdAt : new Date(value.createdAt).toISOString(),
    stats: {
      runs: count(stats.runs),
      completed: count(stats.completed),
      passengers: count(stats.passengers),
      bestByMode: {
        last: count(stats.bestByMode?.last),
        training: count(stats.bestByMode?.training),
        rush: count(stats.bestByMode?.rush),
        night: count(stats.bestByMode?.night)
      },
      dailyBest: normalizeDailyBest(stats.dailyBest),
      challengeStreak: count(stats.challengeStreak),
      lastChallengeDate: /^\d{4}-\d{2}-\d{2}$/.test(stats.lastChallengeDate || "") ? stats.lastChallengeDate : null
    },
    achievements: Array.isArray(value.achievements) ? [...new Set(value.achievements.filter((id) => typeof id === "string"))] : []
  };
}

export function loadProfile(storage = browserStorage()) {
  return normalizeProfile(readJson(storage, PROFILE_KEY, createDefaultProfile()));
}

export function saveProfile(profile, storage = browserStorage()) {
  const normalized = normalizeProfile(profile);
  writeJson(storage, PROFILE_KEY, normalized);
  return normalized;
}

export function recordRun(profileValue, run) {
  const profile = normalizeProfile(profileValue);
  profile.stats.runs += 1;
  profile.stats.completed += run.completed ? 1 : 0;
  profile.stats.passengers += count(run.passengers);
  profile.stats.bestByMode[run.mode] = Math.max(profile.stats.bestByMode[run.mode] || 0, count(run.score));
  if (run.challengeDate && run.completed) {
    profile.stats.dailyBest[run.challengeDate] = Math.max(profile.stats.dailyBest[run.challengeDate] || 0, count(run.score));
    profile.stats.challengeStreak = nextChallengeStreak(profile.stats.lastChallengeDate, run.challengeDate, profile.stats.challengeStreak);
    profile.stats.lastChallengeDate = run.challengeDate;
  }
  const newlyUnlocked = evaluateAchievements(run, profile);
  profile.achievements.push(...newlyUnlocked.map(({ id }) => id));
  return { profile, newlyUnlocked };
}

export function sanitizeNickname(value) {
  const nickname = String(value || "").trim().replace(/\s+/g, " ");
  if (nickname.length < 3 || nickname.length > 16) return "";
  return /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 _-]+$/u.test(nickname) ? nickname : "";
}

function nextChallengeStreak(previousDate, date, streak) {
  if (previousDate === date) return streak;
  if (!previousDate) return 1;
  const previous = Date.parse(`${previousDate}T00:00:00Z`);
  const current = Date.parse(`${date}T00:00:00Z`);
  return current - previous === 86_400_000 ? streak + 1 : 1;
}

function count(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function normalizeDailyBest(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .slice(-60)
    .map(([date, score]) => [date, count(score)]));
}
