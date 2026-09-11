#!/usr/bin/env bash
#
# Starts the local e2e stack: mock server, database migrations, API server,
# site and worker. Background processes are intentionally detached so they
# outlive this step.
#
# Required environment variables:
#   DATABASE_URL — Postgres URL of the e2e database
#   REDIS_URL    — Redis URL

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load the committed CI configuration and export it to child processes.
set -a
# shellcheck disable=SC1091
source "$SCRIPT_DIR/../e2e-local.env"
set +a

# 1. Mock server (Brevo/Connect side-effects + local mailbox)
nohup pnpm -F @nosgestesclimat/e2e mock >mock.log 2>&1 &

# 2. Database migrations
pnpm -F @nosgestesclimat/server db:migrate

# 3. Seed the e2e DB — the simulation worker needs actions to assess
#    (ActionAssessmentPublicodesException otherwise)
pnpm -F @nosgestesclimat/core db:seed

# 4. API server (third-party URLs loaded from apps/server/.env.e2e)
nohup pnpm -F @nosgestesclimat/server start:e2e >server.log 2>&1 &

# 5. Site and worker
nohup pnpm -F @nosgestesclimat/site start:e2e >site.log 2>&1 &
nohup pnpm -F @nosgestesclimat/site start:worker >worker.log 2>&1 &
