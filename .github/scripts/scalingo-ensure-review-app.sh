#!/usr/bin/env bash
#
# scalingo-ensure-review-app.sh
#
# Ensures the Scalingo review app exists for a given PR.
# Calls manual_review_app; if it fails (app already exists), we continue.
#
# Required environment variables:
#   FGP_DEPLOY_TOKEN  - FGP API token
#   SCALINGO_APP_NAME - Name of the parent Scalingo application
#   PR_NUMBER         - Pull request number
#   FGP_DEPLOY_URL    - URL to the FGP

set -euo pipefail

: "${FGP_DEPLOY_TOKEN:?FGP_DEPLOY_TOKEN is required}"
: "${SCALINGO_APP_NAME:?SCALINGO_APP_NAME is required}"
: "${PR_NUMBER:?PR_NUMBER is required}"
: "${FGP_DEPLOY_URL:?FGP_DEPLOY_URL is required}"

echo "Ensuring review app exists for PR #${PR_NUMBER} on ${SCALINGO_APP_NAME}..."

PAYLOAD=$(jq -n --arg pr "$PR_NUMBER" '{ pull_request_id: ($pr | tonumber) }')

HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-FGP-Key: $FGP_DEPLOY_TOKEN" \
  -X POST "${FGP_DEPLOY_URL}/v1/apps/${SCALINGO_APP_NAME}/scm_repo_link/manual_review_app" \
  -d "$PAYLOAD" || true)

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "Review app created (HTTP $HTTP_CODE). Waiting for it to be ready..."
    sleep 15
  else
    echo "Review app creation returned HTTP $HTTP_CODE. Continuing."
  fi
