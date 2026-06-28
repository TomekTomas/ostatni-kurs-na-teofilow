import { describe, expect, it } from "vitest";
import { createRunSummary, isValidRunSummary } from "../src/logic/runSummary.js";
import { toScorePayload } from "../src/services/leaderboard.js";

describe("payload rankingu", () => {
  it("normalizuje zakresy podsumowania", () => {
    const run = createRunSummary({ id: "limits", score: -5, satisfaction: 180, servedStops: 99 });
    expect(run).toMatchObject({ score: 0, satisfaction: 100, servedStops: 34 });
  });

  it("odrzuca zmodyfikowane podsumowanie", () => {
    const run = createRunSummary({ id: "tamper", score: 100, satisfaction: 90 });
    expect(isValidRunSummary({ ...run, satisfaction: 900 })).toBe(false);
  });

  it("mapuje kontrakt V1 na nazwy RPC", () => {
    const run = createRunSummary({ id: "rpc", mode: "night", vehicle: "pesa", score: 1234, completed: true, servedStops: 34 });
    expect(toScorePayload(run)).toMatchObject({ run_id: "rpc", mode: "night", vehicle: "pesa", score: 1234, completed: true, served_stops: 34 });
  });

  it("przenosi identyfikatory challenge'u", () => {
    const run = createRunSummary({ id: "daily", challengeDate: "2026-06-27", challengeSeed: "seed" });
    expect(toScorePayload(run)).toMatchObject({ challenge_date: "2026-06-27", challenge_seed: "seed", rules_version: 1 });
  });
});
