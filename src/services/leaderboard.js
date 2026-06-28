import { createDailyChallenge, isDailyChallenge } from "../logic/dailyChallenge.js";
import { isValidRunSummary } from "../logic/runSummary.js";
import { enqueueScore, markQueueAttempt, readScoreQueue, removeQueuedScore } from "./offlineQueue.js";
import { loadProfile, saveProfile, sanitizeNickname } from "./profile.js";

const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.2/+esm";
let clientPromise = null;

export function getSupabaseConfig() {
  const runtime = globalThis.window?.KURS8_SUPABASE || {};
  return { url: runtime.url || "", anonKey: runtime.anonKey || "", captchaToken: runtime.captchaToken || "" };
}

export function rankingAvailable() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey && globalThis.navigator?.onLine !== false);
}

export async function getLeaderboardClient() {
  if (clientPromise) return clientPromise;
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;
  clientPromise = import(SUPABASE_MODULE_URL).then(async ({ createClient }) => {
    const client = createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    const { data } = await client.auth.getSession();
    if (!data.session) {
      const options = config.captchaToken ? { options: { captchaToken: config.captchaToken } } : undefined;
      const { error } = await client.auth.signInAnonymously(options);
      if (error) throw error;
    }
    return client;
  }).catch(() => null);
  return clientPromise;
}

export async function syncPlayerProfile(nickname) {
  const clean = sanitizeNickname(nickname);
  if (!clean) return { ok: false, error: "Nick musi mieć od 3 do 16 dozwolonych znaków." };
  const client = await getLeaderboardClient();
  if (!client) return { ok: false, offline: true };
  const { data, error } = await client.rpc("upsert_player_profile", { p_nickname: clean });
  if (error) return { ok: false, error: error.message };
  const profile = loadProfile();
  profile.nickname = clean;
  profile.publicTag = data?.public_tag || data?.[0]?.public_tag || profile.publicTag;
  saveProfile(profile);
  return { ok: true, profile };
}

export async function submitRun(run, { queueOnFailure = true } = {}) {
  if (!isValidRunSummary(run)) return { ok: false, error: "Nieprawidłowe podsumowanie kursu." };
  const client = await getLeaderboardClient();
  if (!client) {
    const configured = Boolean(getSupabaseConfig().url);
    if (queueOnFailure && configured) enqueueScore(run);
    return { ok: false, offline: configured, unconfigured: !configured };
  }
  const payload = toScorePayload(run);
  const result = run.challengeDate
    ? await client.rpc("submit_daily_score", { p_payload: payload })
    : await client.rpc("submit_mode_score", { p_payload: payload });
  if (result.error) {
    if (queueOnFailure) enqueueScore(run);
    return { ok: false, error: result.error.message };
  }
  return { ok: true, mode: run.challengeDate ? result.data?.mode : result.data, daily: run.challengeDate ? result.data?.daily : null };
}

export async function flushScoreQueue() {
  if (!rankingAvailable()) return { sent: 0, remaining: readScoreQueue().length };
  let sent = 0;
  for (const item of readScoreQueue()) {
    markQueueAttempt(item.id);
    const result = await submitRun(item.run, { queueOnFailure: false });
    if (!result.ok) break;
    removeQueuedScore(item.id);
    sent += 1;
  }
  return { sent, remaining: readScoreQueue().length };
}

export async function fetchDailyChallenge() {
  const fallback = createDailyChallenge();
  const client = await getLeaderboardClient();
  if (!client) return fallback;
  const { data, error } = await client.rpc("get_daily_challenge", { p_date: fallback.date });
  const raw = Array.isArray(data) ? data[0] : data;
  const challenge = raw ? { ...raw, rulesVersion: raw.rulesVersion ?? raw.rules_version } : raw;
  return !error && isDailyChallenge(challenge) ? challenge : fallback;
}

export async function fetchLeaderboard({ type = "daily", mode = "last", date = null } = {}) {
  const client = await getLeaderboardClient();
  if (!client) return { rows: [], own: null, offline: true };
  const call = type === "daily"
    ? client.rpc("get_daily_leaderboard", { p_date: date || createDailyChallenge().date, p_limit: 20 })
    : client.rpc("get_mode_leaderboard", { p_mode: mode, p_limit: 20 });
  const { data, error } = await call;
  if (error) return { rows: [], own: null, error: error.message };
  const value = Array.isArray(data) ? data[0] || {} : data || {};
  return { rows: value.top || [], own: value.own || null, offline: false };
}

export function toScorePayload(run) {
  return {
    run_id: run.id,
    mode: run.mode,
    vehicle: run.vehicle,
    score: run.score,
    grade: run.grade,
    completed: run.completed,
    served_stops: run.servedStops,
    missed_stops: run.missedStops,
    passengers: run.passengers,
    satisfaction: run.satisfaction,
    smoothness: run.smoothness,
    punctuality: run.punctuality,
    red_signals: run.redSignals,
    switch_correct: run.switchCorrect,
    switch_wrong: run.switchWrong,
    duration_seconds: run.durationSeconds,
    finished_at: run.finishedAt,
    rules_version: run.rulesVersion,
    challenge_date: run.challengeDate,
    challenge_seed: run.challengeSeed
  };
}
