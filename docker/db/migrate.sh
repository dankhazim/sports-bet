#!/bin/sh
# Az app sémáját tölti be a lokális adatbázisba. Idempotens: a
# schema_migrations táblában követi, mely fájlok futottak már le.
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -h db -p 5432 -U supabase_admin -d postgres -v ON_ERROR_STOP=1"

$PSQL -q -c "create table if not exists public.schema_migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
)"

# Régebbi lokális DB-k a schema_migrations tábla előtt jöttek létre:
# ha a séma már megvan, a 0001-et lefuttatottnak jelöljük.
if $PSQL -tAc "select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles'" | grep -q 1; then
  $PSQL -q -c "insert into schema_migrations (filename) values ('0001_init.sql') on conflict do nothing"
fi

for f in /migrations/*.sql; do
  name=$(basename "$f")
  if $PSQL -tAc "select 1 from schema_migrations where filename = '$name'" | grep -q 1; then
    echo "Kihagyva (már lefutott): $name"
    continue
  fi
  echo "Migráció futtatása: $name"
  $PSQL -f "$f"
  $PSQL -q -c "insert into schema_migrations (filename) values ('$name')"
done

echo "Kész."
