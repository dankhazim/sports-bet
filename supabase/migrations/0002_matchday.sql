-- Forduló (matchday) tárolása a fordulónkénti meccslistához
alter table public.matches add column if not exists matchday int;
