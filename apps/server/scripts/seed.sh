#!/usr/bin/env bash
#
# seed.sh
#
# Run during server postdeploy. Seeds the demo dataset on review apps only
# (preview), so those databases contain, for each SEED_ADMIN_EMAILS entry, a
# demo organisation with polls and simulations. Never runs on preprod or
# production.
#
# SEED_ADMIN_EMAILS is REQUIRED: the seed fails if it is unset (no fallback).
#
# The seed is idempotent: accounts/organisations are reused by email/slug on
# re-runs, so it is safe to execute on every deploy.

set -euo pipefail

APP_ENV="${APP_ENV:-}"

case "${APP_ENV}" in
  review)
    echo "── Seeding demo data (APP_ENV=${APP_ENV}) ────────────────"
    node --experimental-strip-types ./src/jobs/seed.ts
    echo "── Seed done ──────────────────────────────────────────────"
    ;;
  *)
    echo "Not seeding: APP_ENV=${APP_ENV:-unset} (seed only on review apps)."
    ;;
esac
