#!/usr/bin/env bash
#
# scalingo-monitor-deployment.sh
#
# Monitors a Scalingo deployment, streaming logs until the deployment
# reaches a terminal status (success or failure).
#
# Required environment variables:
#   FGP_DEPLOY_TOKEN  – FGP deploy token
#   DEPLOYMENT_ID     – ID of the deployment to monitor
#   SCALINGO_APP_NAME – Name of the Scalingo application
#   FGP_DEPLOY_URL    – URL to the FGP that triggers the deploy
#
# Optional environment variables:
#   POLL_INTERVAL     – Seconds between status checks (default: 10)

set -euo pipefail

: "${FGP_DEPLOY_TOKEN:?FGP_DEPLOY_TOKEN is required}"
: "${DEPLOYMENT_ID:?DEPLOYMENT_ID is required}"
: "${SCALINGO_APP_NAME:?SCALINGO_APP_NAME is required}"
: "${FGP_DEPLOY_URL:?FGP_DEPLOY_URL is required}"

POLL_INTERVAL="${POLL_INTERVAL:-10}"

API_URL="${FGP_DEPLOY_URL}/v1/apps/${SCALINGO_APP_NAME}/deployments/${DEPLOYMENT_ID}"

PRINTED_LINES=0

while true; do
  # Get deployment status
  STATUS=$(curl -s -f -H "Accept: application/json" \
    -H "X-FGP-Key: ${FGP_DEPLOY_TOKEN}" \
    "${API_URL}" | jq -r '.deployment.status')

  # Get deployment logs and print only new lines
  LOGS=$(curl -s -f -H "Accept: text/plain" \
    -H "X-FGP-Key: ${FGP_DEPLOY_TOKEN}" \
    "${API_URL}/output" || echo "")

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
    crashed-error|timeout-error|build-error|aborted|hook-error)
      echo "::error::Deployment failed with status: $STATUS"
      exit 1
      ;;
  esac
  sleep "$POLL_INTERVAL"
done
