import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sql = fs.readFileSync(path.resolve("supabase/migrations/202606270001_release_rankings.sql"), "utf8");

describe("polityki rankingu Supabase", () => {
  it("wlacza RLS dla wszystkich tabel publicznych", () => {
    ["player_profiles", "daily_challenges", "daily_scores", "mode_scores"].forEach((table) => {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    });
  });

  it("blokuje bezposredni dostep authenticated i anon do tabel", () => {
    expect(sql).toMatch(/revoke all on public\.player_profiles,[\s\S]+from anon, authenticated/);
  });

  it("wiaze zapis z auth.uid", () => {
    expect(sql).toMatch(/v_uid uuid := auth\.uid\(\)/);
    expect(sql).toContain("where user_id = auth.uid() for update");
  });

  it("zapisuje tylko lepszy wynik dzienny i trybu", () => {
    expect(sql.match(/where excluded\.score > public\.(?:daily_scores|mode_scores)\.score/g)).toHaveLength(3);
  });

  it("ogranicza wysylki do jednej na 30 sekund", () => {
    expect(sql).toContain("now() - interval '30 seconds'");
    expect(sql).toContain("submission rate limit");
  });

  it("zwraca Top 20 i osobno pozycje zalogowanego gracza", () => {
    expect(sql.match(/limit least\(greatest\(p_limit, 1\), 20\)/g)).toHaveLength(2);
    expect(sql.match(/where user_id = auth\.uid\(\)/g).length).toBeGreaterThanOrEqual(2);
  });

  it("ukrywa moderowane profile i wyniki", () => {
    expect(sql.match(/not [dm]\.hidden and not p\.hidden/g)).toHaveLength(2);
  });

  it("udostepnia authenticated tylko publiczne RPC", () => {
    expect(sql).toMatch(/grant execute on function public\.upsert_player_profile[\s\S]+to authenticated/);
    expect(sql).toMatch(/revoke all on function public\.ensure_player_profile[\s\S]+from public, anon, authenticated/);
  });
});
