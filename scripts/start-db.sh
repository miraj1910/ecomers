#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PG_DIR=/tmp/postgres-install
PG_DATA=/tmp/pgdata
PG_LIBS=/tmp/postgres-libs
PG_PORT=5432
PG_HOST=127.0.0.1
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=ecommers
PG_SOCKET_DIR=/tmp

export PATH="$PG_DIR/usr/lib/postgresql/17/bin:$PG_LIBS/usr/lib/postgresql/17/bin:$PATH"
export LD_LIBRARY_PATH="$PG_LIBS/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"

extract_deb() {
  local deb="$1"
  local target="$2"

  if [ ! -f "$ROOT_DIR/$deb" ]; then
    echo "Missing $deb. Cannot bootstrap local PostgreSQL." >&2
    exit 1
  fi

  mkdir -p "$target"
  dpkg-deb -x "$ROOT_DIR/$deb" "$target"
}

if ! command -v pg_ctl > /dev/null 2>&1; then
  echo "Bootstrapping PostgreSQL 17 into /tmp..."
  extract_deb "postgresql-17_17.10-0ubuntu0.25.10.1_amd64.deb" "$PG_DIR"
  extract_deb "postgresql-client-17_17.10-0ubuntu0.25.10.1_amd64.deb" "$PG_DIR"
  extract_deb "libpq5_17.10-0ubuntu0.25.10.1_amd64.deb" "$PG_LIBS"
fi

if [ ! -d "$PG_DATA/base" ]; then
  echo "Initializing PostgreSQL data directory at $PG_DATA..."
  rm -rf "$PG_DATA"
  mkdir -p "$PG_DATA"

  pwfile="$(mktemp)"
  printf "%s\n" "$PG_PASSWORD" > "$pwfile"
  initdb \
    -D "$PG_DATA" \
    --username="$PG_USER" \
    --pwfile="$pwfile" \
    --auth-local=trust \
    --auth-host=scram-sha-256
  rm -f "$pwfile"

fi

grep -q "^listen_addresses = '$PG_HOST'" "$PG_DATA/postgresql.conf" ||
  echo "listen_addresses = '$PG_HOST'" >> "$PG_DATA/postgresql.conf"
grep -q "^port = $PG_PORT" "$PG_DATA/postgresql.conf" ||
  echo "port = $PG_PORT" >> "$PG_DATA/postgresql.conf"
grep -q "^unix_socket_directories = '$PG_SOCKET_DIR'" "$PG_DATA/postgresql.conf" ||
  echo "unix_socket_directories = '$PG_SOCKET_DIR'" >> "$PG_DATA/postgresql.conf"

if pg_ctl -D "$PG_DATA" status > /dev/null 2>&1; then
  echo "PostgreSQL is already running."
else
  pg_ctl -D "$PG_DATA" -l "$PG_DATA/logfile" start
  echo "PostgreSQL started on port $PG_PORT."
fi

until pg_isready -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" > /dev/null 2>&1; do
  sleep 0.2
done

PGPASSWORD="$PG_PASSWORD" psql \
  -h "$PG_HOST" \
  -p "$PG_PORT" \
  -U "$PG_USER" \
  -d postgres \
  -tc "SELECT 1 FROM pg_database WHERE datname = '$PG_DATABASE'" |
  grep -q 1 ||
  PGPASSWORD="$PG_PASSWORD" createdb \
    -h "$PG_HOST" \
    -p "$PG_PORT" \
    -U "$PG_USER" \
    "$PG_DATABASE"

echo "Database '$PG_DATABASE' is ready at $PG_HOST:$PG_PORT."
