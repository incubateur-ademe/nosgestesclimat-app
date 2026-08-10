#!/usr/bin/env bash
#
# refresh-event-computation-nonprod.sh
#
# Fast (every 2 minutes) event computation refresh for review apps and local
# development. No-op on production and preproduction, which keep the
# 15-minute cadence defined in cron.json.
#
# Cron only runs on Scalingo; for local development run it manually:
#   pnpm jobs:refreshEventComputation

set -euo pipefail

case "${APP_ENV:-}" in
  development | review)
    pnpm jobs:refreshEventComputation
    ;;
  *)
    echo "APP_ENV=${APP_ENV:-unset}, skipping fast event refresh."
    ;;
esac
