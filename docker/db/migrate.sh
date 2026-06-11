#!/bin/sh
# Az app sémáját tölti be a lokális adatbázisba (idempotens: ha a
# profiles tábla már létezik, nem csinál semmit).
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -h db -p 5432 -U supabase_admin -d postgres -v ON_ERROR_STOP=1"

if $PSQL -tAc "select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles'" | grep -q 1; then
  echo "A séma már be van töltve, nincs teendő."
  exit 0
fi

for f in /migrations/*.sql; do
  echo "Migráció futtatása: $f"
  $PSQL -f "$f"
done

echo "Kész."
