-- Új pontozási szabályok (0–5 pont):
--   5 – pontos végeredmény
--   3 – jó kimenetel és jó gólkülönbség
--   2 – jó kimenetel és az egyik csapat gólszáma stimmel
--   1 – csak a kimenetel jó
--   0 – rossz kimenetel
-- A packages/shared/src/scoring.ts tükörképe — a kettőnek szinkronban kell lennie!

create or replace function public.score_tip(tip_h int, tip_a int, res_h int, res_a int)
returns int
language sql
immutable
as $$
  select case
    when tip_h = res_h and tip_a = res_a then 5
    when sign(tip_h - tip_a) <> sign(res_h - res_a) then 0
    when (tip_h - tip_a) = (res_h - res_a) then 3
    when tip_h = res_h or tip_a = res_a then 2
    else 1
  end;
$$;

-- A ranglistán a telitalálat mostantól 5 pont
create or replace view public.leaderboard
with (security_invoker = true)
as
select
  p.id,
  p.display_name,
  p.avatar_url,
  coalesce(sum(t.points), 0)::int                       as total_points,
  count(t.points) filter (where t.points = 5)::int      as exact_hits,
  count(t.points) filter (where t.points > 0)::int      as correct_outcomes,
  count(t.points)::int                                  as scored_tips
from public.profiles p
left join public.tips t on t.user_id = p.id and t.points is not null
group by p.id
order by total_points desc, exact_hits desc, correct_outcomes desc, p.created_at asc;

-- A már lepontozott meccsek újraszámítása az új szabályokkal
do $$
declare
  m record;
begin
  for m in select id from public.matches where scored_at is not null loop
    perform public.rescore_match(m.id);
  end loop;
end $$;
