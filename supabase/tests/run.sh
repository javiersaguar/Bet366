#!/usr/bin/env bash
# Levanta un Postgres local, aplica las migraciones y ejecuta los tests de la
# logica de apuestas (motor de cuotas, anti-arbitraje, pagos, permisos).
#
#   ./supabase/tests/run.sh
#
# Requiere postgresql-16 instalado. No toca tu proyecto de Supabase.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PGDATA="${PGDATA:-/var/lib/pgtest/data}"
PORT="${PORT:-5433}"
PSQL="psql -h /tmp -p $PORT -U postgres"

if ! $PSQL -c 'select 1' >/dev/null 2>&1; then
  echo "== arrancando postgres en el puerto $PORT"
  install -d -o postgres -g postgres -m 700 "$(dirname "$PGDATA")"
  [ -d "$PGDATA" ] || su postgres -c "$PGBIN/initdb -D $PGDATA -U postgres --auth=trust" >/dev/null
  su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l /tmp/pgtest.log -o '-p $PORT -k /tmp' start" >/dev/null
fi

echo "== recreando base de datos"
$PSQL -q -c 'drop database if exists apuestas'
$PSQL -q -c 'create database apuestas'
$PSQL -d apuestas -q -f "$ROOT/supabase/tests/00_supabase_stub.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "   migracion $(basename "$f")"
  $PSQL -d apuestas -q -v ON_ERROR_STOP=1 -f "$f" 2>&1 | grep -v NOTICE || true
done
$PSQL -d apuestas -q -c 'create schema if not exists test; grant usage on schema test to authenticated;'

fail=0
for f in "$ROOT"/supabase/tests/[0-9][0-9]_*.sql; do
  echo "== $(basename "$f")"
  if ! $PSQL -d apuestas -v ON_ERROR_STOP=1 -f "$f" 2>&1 \
        | grep -E 'OK  |FALLO|ERROR' | sed 's/^.*NOTICE:  //;s/^/   /'; then fail=1; fi
done
exit $fail
