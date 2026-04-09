#!/usr/bin/env bash
#
# scalingo-monitor-deployment.sh
#
# Monitors a Scalingo deployment, streaming logs until the deployment
# reaches a terminal status (success or failure).
#
# Required environment variables:
#   BEARER_TOKEN      – Scalingo bearer token
#   DEPLOYMENT_ID     – ID of the deployment to monitor
#   SCALINGO_APP_NAME – Name of the Scalingo application
#
# Optional environment variables:
#   SCALINGO_API_HOST – Base URL of the Scalingo API (default: https://api.osc-fr1.scalingo.com)
#   POLL_INTERVAL     – Seconds between status checks (default: 10)

set -euo pipefail

: "${BEARER_TOKEN:?BEARER_TOKEN is required}"
: "${DEPLOYMENT_ID:?DEPLOYMENT_ID is required}"
: "${SCALINGO_APP_NAME:?SCALINGO_APP_NAME is required}"

SCALINGO_API_HOST="${SCALINGO_API_HOST:-https://api.osc-fr1.scalingo.com}"
POLL_INTERVAL="${POLL_INTERVAL:-10}"

API_URL="${SCALINGO_API_HOST}/v1/apps/${SCALINGO_APP_NAME}/deployments/${DEPLOYMENT_ID}"

PRINTED_LINES=0

while true; do
  # Get deployment status
  STATUS=$(curl -s -H "Accept: application/json" \
    -H "Authorization: Bearer ${BEARER_TOKEN}" \
    "${API_URL}" | jq -r '.deployment.status')

  # Get deployment logs and print only new lines
  LOGS=$(curl -s -H "Accept: text/plain" \
    -H "Authorization: Bearer ${BEARER_TOKEN}" \
    "${API_URL}/output")

  TOTAL_LINES=$(echo "$LOGS" | wc -l)

  if [ "$TOTAL_LINES" -gt "$PRINTED_LINES" ]; then
    echo "$LOGS" | tail -n +$((PRINTED_LINES + 1))
    PRINTED_LINES=$TOTAL_LINES
  fi

  # Check terminal statuses
  case "$STATUS" in
    success)
      echo "::notice::Deployment completed successfully!"
      exit 0
      ;;
    crashed-error|timeout-error|build-error|aborted)
      echo "::error::Deployment failed with status: $STATUS"
      exit 1
      ;;
  esac

  sleep "$POLL_INTERVAL"
done
