export const RULES_VERSION = 1;
export const CHALLENGE_MODES = ["last", "training", "rush", "night"];
export const CHALLENGE_VEHICLES = ["konstal", "pesa"];

export function utcDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("Nieprawidłowa data wyzwania");
  return date.toISOString().slice(0, 10);
}

export function createDailyChallenge(value = new Date(), rulesVersion = RULES_VERSION) {
  const date = utcDateKey(value);
  const seed = `kurs8:${rulesVersion}:${date}`;
  const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return {
    date,
    seed,
    mode: CHALLENGE_MODES[(dayNumber + rulesVersion * 3) % CHALLENGE_MODES.length],
    vehicle: CHALLENGE_VEHICLES[(Math.floor(dayNumber / CHALLENGE_MODES.length) + rulesVersion) % CHALLENGE_VEHICLES.length],
    rulesVersion
  };
}

export function isDailyChallenge(value) {
  return Boolean(
    value
    && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    && typeof value.seed === "string"
    && CHALLENGE_MODES.includes(value.mode)
    && CHALLENGE_VEHICLES.includes(value.vehicle)
    && Number.isInteger(value.rulesVersion)
  );
}
