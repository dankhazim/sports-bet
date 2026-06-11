-- Sport Tippelő App – kezdeti séma
-- Futtatás: Supabase Dashboard → SQL Editor, vagy `supabase db push`

-- =========================================================================
-- Táblák
-- =========================================================================

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table public.competitions (
  id          bigint generated always as identity primary key,
  external_id text unique,
  name        text not null,
  sport       text not null default 'football',
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true
);

create table public.teams (
  id          bigint generated always as identity primary key,
  external_id text unique,
  name        text not null,
  short_name  text,
  crest_url   text
);

create type public.match_status as enum
  ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED');

create table public.matches (
  id             bigint generated always as identity primary key,
  competition_id bigint not null references public.competitions (id),
  external_id    text unique not null,
  home_team_id   bigint references public.teams (id),
  away_team_id   bigint references public.teams (id),
  stage          text,
  group_name     text,
  kickoff_at     timestamptz not null,
  status         public.match_status not null default 'SCHEDULED',
  home_score     int,
  away_score     int,
  scored_at      timestamptz
);

create index matches_kickoff_at_idx on public.matches (kickoff_at);

create table public.tips (
  id         bigint generated always as identity primary key,
  user_id    uuid   not null references public.profiles (id) on delete cascade,
  match_id   bigint not null references public.matches (id) on delete cascade,
  home_score int    not null check (home_score between 0 and 99),
  away_score int    not null check (away_score between 0 and 99),
  points     int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index tips_match_id_idx on public.tips (match_id);

-- =========================================================================
-- Pontszámítás
-- =========================================================================

-- A packages/shared/src/scoring.ts tükörképe — a kettőnek szinkronban kell lennie!
create or replace function public.score_tip(tip_h int, tip_a int, res_h int, res_a int)
returns int
language sql
immutable
as $$
  select case
    when tip_h = res_h and tip_a = res_a then 3
    when (tip_h - tip_a) = (res_h - res_a) then 2
    when sign(tip_h - tip_a) = sign(res_h - res_a) then 1
    else 0
  end;
$$;

-- Egy lezárt meccs összes tippjének kiértékelése, idempotensen.
create or replace function public.score_match(p_match_id bigint)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match matches%rowtype;
  v_count int;
begin
  select * into v_match from matches where id = p_match_id for update;

  if v_match.id is null then
    raise exception 'Match % not found', p_match_id;
  end if;
  if v_match.status <> 'FINISHED' or v_match.home_score is null or v_match.away_score is null then
    raise exception 'Match % is not finished or has no result', p_match_id;
  end if;
  if v_match.scored_at is not null then
    return 0; -- már kiértékelve
  end if;

  update tips
  set points = score_tip(home_score, away_score, v_match.home_score, v_match.away_score)
  where match_id = p_match_id;
  get diagnostics v_count = row_count;

  update matches set scored_at = now() where id = p_match_id;

  return v_count;
end;
$$;

-- Csak a service role (cron) hívhatja
revoke execute on function public.score_match(bigint) from public, anon, authenticated;
grant execute on function public.score_match(bigint) to service_role;

-- Admin/javítás célra: eredménykorrekció utáni újraszámítás
create or replace function public.rescore_match(p_match_id bigint)
returns int
language sql
security definer
set search_path = public
as $$
  update matches set scored_at = null where id = p_match_id;
  select score_match(p_match_id);
$$;

revoke execute on function public.rescore_match(bigint) from public, anon, authenticated;
grant execute on function public.rescore_match(bigint) to service_role;

-- =========================================================================
-- Triggerek
-- =========================================================================

-- Új auth user → profil automatikus létrehozása
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A points mezőt kliens soha nem írhatja, csak a pontszámító függvény / service role
create or replace function public.protect_tip_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    if tg_op = 'INSERT' then
      new.points := null;
    else
      new.points := old.points;
      new.user_id := old.user_id;
      new.match_id := old.match_id;
      new.created_at := old.created_at;
    end if;
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger protect_tip_columns
  before insert or update on public.tips
  for each row execute function public.protect_tip_columns();

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.profiles     enable row level security;
alter table public.competitions enable row level security;
alter table public.teams        enable row level security;
alter table public.matches      enable row level security;
alter table public.tips         enable row level security;

-- Profilok: mindenki (bejelentkezett) láthatja, mindenki csak a sajátját szerkesztheti
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Törzsadatok: csak olvashatók (írás kizárólag service role-lal, az RLS-t megkerülve)
create policy "competitions_select" on public.competitions
  for select to authenticated using (true);

create policy "teams_select" on public.teams
  for select to authenticated using (true);

create policy "matches_select" on public.matches
  for select to authenticated using (true);

-- Tippek:
--  - a sajátomat mindig látom
--  - másét csak a meccs kezdete után (előtte ne lehessen másolni)
create policy "tips_select" on public.tips
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.matches m
      where m.id = tips.match_id and m.kickoff_at <= now()
    )
  );

--  - tippelni/módosítani csak a saját nevemben, a kezdésig lehet
create policy "tips_insert_own_before_kickoff" on public.tips
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.kickoff_at > now()
        and m.status in ('SCHEDULED', 'TIMED')
    )
  );

create policy "tips_update_own_before_kickoff" on public.tips
  for update to authenticated using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.kickoff_at > now()
        and m.status in ('SCHEDULED', 'TIMED')
    )
  );

-- =========================================================================
-- Ranglista nézet
-- =========================================================================

create view public.leaderboard
with (security_invoker = true)
as
select
  p.id,
  p.display_name,
  p.avatar_url,
  coalesce(sum(t.points), 0)::int                       as total_points,
  count(t.points) filter (where t.points = 3)::int      as exact_hits,
  count(t.points) filter (where t.points > 0)::int      as correct_outcomes,
  count(t.points)::int                                  as scored_tips
from public.profiles p
left join public.tips t on t.user_id = p.id and t.points is not null
group by p.id
order by total_points desc, exact_hits desc, correct_outcomes desc, p.created_at asc;
