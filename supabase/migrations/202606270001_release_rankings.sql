begin;

create extension if not exists pgcrypto;

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Motorniczy',
  public_tag text not null,
  hidden boolean not null default false,
  last_submission_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nickname_length check (char_length(nickname) between 3 and 16),
  constraint nickname_characters check (nickname ~ '^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 _-]+$'),
  constraint public_tag_format check (public_tag ~ '^[A-Z0-9]{4}$')
);

create table if not exists public.daily_challenges (
  challenge_date date primary key,
  seed text not null unique,
  mode text not null check (mode in ('last', 'training', 'rush', 'night')),
  vehicle text not null check (vehicle in ('konstal', 'pesa')),
  rules_version integer not null check (rules_version > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_scores (
  challenge_date date not null references public.daily_challenges(challenge_date) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id text not null,
  mode text not null,
  vehicle text not null,
  score integer not null,
  grade text not null,
  stats jsonb not null,
  hidden boolean not null default false,
  submitted_at timestamptz not null default now(),
  primary key (challenge_date, user_id),
  unique (run_id)
);

create table if not exists public.mode_scores (
  mode text not null check (mode in ('last', 'training', 'rush', 'night')),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id text not null,
  vehicle text not null check (vehicle in ('konstal', 'pesa')),
  score integer not null check (score between 0 and 10000000),
  grade text not null check (grade in ('S', 'A', 'B', 'C', 'D')),
  stats jsonb not null,
  hidden boolean not null default false,
  submitted_at timestamptz not null default now(),
  primary key (mode, user_id),
  unique (run_id)
);

alter table public.player_profiles enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_scores enable row level security;
alter table public.mode_scores enable row level security;

revoke all on public.player_profiles, public.daily_challenges, public.daily_scores, public.mode_scores from anon, authenticated;

create or replace function public.ensure_player_profile(p_nickname text default 'Motorniczy')
returns public.player_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.player_profiles;
  v_nickname text := trim(regexp_replace(coalesce(p_nickname, 'Motorniczy'), '\s+', ' ', 'g'));
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if char_length(v_nickname) not between 3 and 16 or v_nickname !~ '^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 _-]+$' then
    raise exception 'invalid nickname';
  end if;
  insert into public.player_profiles (user_id, nickname, public_tag)
  values (v_uid, v_nickname, upper(substr(md5(v_uid::text), 1, 4)))
  on conflict (user_id) do update set nickname = excluded.nickname, updated_at = now()
  returning * into v_profile;
  return v_profile;
end;
$$;

create or replace function public.upsert_player_profile(p_nickname text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object('nickname', p.nickname, 'public_tag', p.public_tag)
  from public.ensure_player_profile(p_nickname) p;
$$;

create or replace function public.get_daily_challenge(p_date date default (now() at time zone 'utc')::date)
returns table(date text, seed text, mode text, vehicle text, "rulesVersion" integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seed text := 'kurs8:1:' || p_date::text;
  v_day integer := p_date - date '1970-01-01';
begin
  insert into public.daily_challenges (challenge_date, seed, mode, vehicle, rules_version)
  values (
    p_date,
    v_seed,
    (array['last', 'training', 'rush', 'night'])[((v_day + 3) % 4) + 1],
    (array['konstal', 'pesa'])[((floor(v_day::numeric / 4)::integer + 1) % 2) + 1],
    1
  ) on conflict (challenge_date) do nothing;
  return query
    select c.challenge_date::text, c.seed, c.mode, c.vehicle, c.rules_version
    from public.daily_challenges c where c.challenge_date = p_date;
end;
$$;

create or replace function public.validate_score_payload(p_payload jsonb, p_daily boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode text := p_payload->>'mode';
  v_vehicle text := p_payload->>'vehicle';
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if coalesce((p_payload->>'completed')::boolean, false) is not true then raise exception 'run not completed'; end if;
  if v_mode not in ('last', 'training', 'rush', 'night') then raise exception 'invalid mode'; end if;
  if v_vehicle not in ('konstal', 'pesa') then raise exception 'invalid vehicle'; end if;
  if coalesce((p_payload->>'score')::integer, -1) not between 0 and 10000000 then raise exception 'invalid score'; end if;
  if coalesce((p_payload->>'served_stops')::integer, -1) not between 0 and 34 then raise exception 'invalid stops'; end if;
  if coalesce((p_payload->>'missed_stops')::integer, -1) not between 0 and 34 then raise exception 'invalid missed stops'; end if;
  if coalesce((p_payload->>'satisfaction')::integer, -1) not between 0 and 100
    or coalesce((p_payload->>'smoothness')::integer, -1) not between 0 and 100
    or coalesce((p_payload->>'punctuality')::integer, -1) not between 0 and 100 then
    raise exception 'invalid percentages';
  end if;
  if coalesce((p_payload->>'duration_seconds')::integer, -1) not between 0 and 86400 then raise exception 'invalid duration'; end if;
  if coalesce((p_payload->>'rules_version')::integer, 0) <> 1 then raise exception 'unsupported rules version'; end if;
  if p_daily and (p_payload->>'challenge_date' is null or p_payload->>'challenge_seed' is null) then raise exception 'missing challenge'; end if;
end;
$$;

create or replace function public.claim_submission_slot()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_profile public.player_profiles;
begin
  insert into public.player_profiles (user_id, nickname, public_tag)
  values (auth.uid(), 'Motorniczy', upper(substr(md5(auth.uid()::text), 1, 4)))
  on conflict (user_id) do nothing;
  select * into v_profile from public.player_profiles where user_id = auth.uid() for update;
  if v_profile.last_submission_at is not null and v_profile.last_submission_at > now() - interval '30 seconds' then
    raise exception 'submission rate limit';
  end if;
  update public.player_profiles set last_submission_at = now(), updated_at = now() where user_id = auth.uid();
end;
$$;

create or replace function public.submit_mode_score(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid := auth.uid();
begin
  perform public.validate_score_payload(p_payload, false);
  perform public.claim_submission_slot();
  insert into public.mode_scores (mode, user_id, run_id, vehicle, score, grade, stats)
  values (p_payload->>'mode', v_uid, p_payload->>'run_id', p_payload->>'vehicle', (p_payload->>'score')::integer,
    p_payload->>'grade', p_payload - array['run_id', 'mode', 'vehicle', 'score', 'grade'])
  on conflict (mode, user_id) do update set
    run_id = excluded.run_id, vehicle = excluded.vehicle, score = excluded.score,
    grade = excluded.grade, stats = excluded.stats, submitted_at = now()
  where excluded.score > public.mode_scores.score;
  return jsonb_build_object('accepted', true);
end;
$$;

create or replace function public.submit_daily_score(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_date date := (p_payload->>'challenge_date')::date;
  v_challenge public.daily_challenges;
begin
  perform public.validate_score_payload(p_payload, true);
  select * into v_challenge from public.daily_challenges where challenge_date = v_date;
  if v_challenge.challenge_date is null then raise exception 'unknown challenge'; end if;
  if v_challenge.seed <> p_payload->>'challenge_seed' or v_challenge.mode <> p_payload->>'mode'
    or v_challenge.vehicle <> p_payload->>'vehicle' or v_challenge.rules_version <> (p_payload->>'rules_version')::integer then
    raise exception 'challenge mismatch';
  end if;
  perform public.claim_submission_slot();
  insert into public.daily_scores (challenge_date, user_id, run_id, mode, vehicle, score, grade, stats)
  values (v_date, v_uid, p_payload->>'run_id', p_payload->>'mode', p_payload->>'vehicle', (p_payload->>'score')::integer,
    p_payload->>'grade', p_payload - array['run_id', 'mode', 'vehicle', 'score', 'grade'])
  on conflict (challenge_date, user_id) do update set
    run_id = excluded.run_id, mode = excluded.mode, vehicle = excluded.vehicle,
    score = excluded.score, grade = excluded.grade, stats = excluded.stats, submitted_at = now()
  where excluded.score > public.daily_scores.score;
  insert into public.mode_scores (mode, user_id, run_id, vehicle, score, grade, stats)
  values (p_payload->>'mode', v_uid, 'mode-' || p_payload->>'run_id', p_payload->>'vehicle', (p_payload->>'score')::integer,
    p_payload->>'grade', p_payload - array['run_id', 'mode', 'vehicle', 'score', 'grade'])
  on conflict (mode, user_id) do update set
    run_id = excluded.run_id, vehicle = excluded.vehicle, score = excluded.score,
    grade = excluded.grade, stats = excluded.stats, submitted_at = now()
  where excluded.score > public.mode_scores.score;
  return jsonb_build_object('accepted', true, 'daily', jsonb_build_object('score', (p_payload->>'score')::integer), 'mode', jsonb_build_object('score', (p_payload->>'score')::integer));
end;
$$;

create or replace function public.get_daily_leaderboard(p_date date, p_limit integer default 20)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select d.user_id, p.nickname, p.public_tag, d.score, d.vehicle,
      rank() over (order by d.score desc, d.submitted_at asc) as rank
    from public.daily_scores d join public.player_profiles p on p.user_id = d.user_id
    where d.challenge_date = p_date and not d.hidden and not p.hidden
  )
  select jsonb_build_object(
    'top', coalesce((select jsonb_agg(to_jsonb(t)) from (select nickname, public_tag, score, vehicle, rank from ranked order by rank limit least(greatest(p_limit, 1), 20)) t), '[]'::jsonb),
    'own', (select to_jsonb(o) from (select nickname, public_tag, score, vehicle, rank from ranked where user_id = auth.uid()) o)
  );
$$;

create or replace function public.get_mode_leaderboard(p_mode text, p_limit integer default 20)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select m.user_id, p.nickname, p.public_tag, m.score, m.vehicle,
      rank() over (order by m.score desc, m.submitted_at asc) as rank
    from public.mode_scores m join public.player_profiles p on p.user_id = m.user_id
    where m.mode = p_mode and not m.hidden and not p.hidden
  )
  select jsonb_build_object(
    'top', coalesce((select jsonb_agg(to_jsonb(t)) from (select nickname, public_tag, score, vehicle, rank from ranked order by rank limit least(greatest(p_limit, 1), 20)) t), '[]'::jsonb),
    'own', (select to_jsonb(o) from (select nickname, public_tag, score, vehicle, rank from ranked where user_id = auth.uid()) o)
  );
$$;

revoke all on function public.ensure_player_profile(text), public.validate_score_payload(jsonb, boolean), public.claim_submission_slot() from public, anon, authenticated;
grant execute on function public.upsert_player_profile(text), public.get_daily_challenge(date), public.submit_mode_score(jsonb),
  public.submit_daily_score(jsonb), public.get_daily_leaderboard(date, integer), public.get_mode_leaderboard(text, integer) to authenticated;

commit;
