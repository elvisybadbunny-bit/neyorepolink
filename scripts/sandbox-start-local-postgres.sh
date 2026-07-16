#!/usr/bin/env bash
# Sandbox-only helper: starts a real embedded Postgres 18 instance for local
# dev/testing when the sandbox has no system Postgres/apt access and
# binaries.prisma.sh (Prisma's own engine-binary CDN) is network-blocked.
#
# WHY THIS EXISTS: this sandbox cannot download Prisma's native query-engine
# binary at `prisma generate` time (binaries.prisma.sh connection reset).
# The real fix is Prisma 5.17's own "driverAdapters" preview feature
# (already enabled in prisma/schema.prisma's generator block) + a real
# `pg` Postgres driver + the already-bundled WASM query engine — this
# script just gets a real Postgres server running for that driver to talk
# to. See docs/CONTEXT-ANCHOR.md (2026-07-16, part 22) for the full
# recovery story and the exact env vars needed for `prisma generate` itself
# to succeed offline.
#
# Usage:
#   bash scripts/sandbox-start-local-postgres.sh
#   # then: export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/neyo"
set -euo pipefail

PG_HOME="/home/user/pg-embedded"
PG_DATA="/home/user/pgdata"
PG_LOG="/home/user/pglog/pg.log"
PG_BIN="$PG_HOME/node_modules/@embedded-postgres/linux-x64/native/bin"

mkdir -p /home/user/pglog

if [ ! -d "$PG_HOME/node_modules/embedded-postgres" ]; then
  echo "Installing embedded-postgres (one-time, ~60MB download from the npm registry)..."
  mkdir -p "$PG_HOME"
  cd "$PG_HOME"
  npm init -y >/dev/null 2>&1
  npm install embedded-postgres --no-audit --no-fund
fi

if [ ! -f "$PG_DATA/PG_VERSION" ]; then
  echo "Initialising a fresh Postgres data directory at $PG_DATA..."
  cat > "$PG_HOME/init.mjs" << 'EOF'
import EmbeddedPostgres from 'embedded-postgres';
const pg = new EmbeddedPostgres({
  databaseDir: '/home/user/pgdata',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true,
});
await pg.initialise();
await pg.start();
await pg.createDatabase('neyo');
await pg.stop();
EOF
  (cd "$PG_HOME" && node init.mjs)
fi

if "$PG_BIN/pg_ctl" -D "$PG_DATA" status >/dev/null 2>&1; then
  echo "Postgres is already running."
else
  echo "Starting Postgres on 127.0.0.1:5432..."
  (setsid "$PG_BIN/pg_ctl" -D "$PG_DATA" -l "$PG_LOG" -o "-p 5432" start &)
  sleep 3
  "$PG_BIN/pg_ctl" -D "$PG_DATA" status
fi

echo ""
echo "Postgres is up. Set this before running prisma/npm commands:"
echo "  export DATABASE_URL=\"postgresql://postgres:postgres@127.0.0.1:5432/neyo\""
