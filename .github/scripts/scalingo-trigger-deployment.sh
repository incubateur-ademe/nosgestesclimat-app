#!/usr/bin/env bash
#
# scalingo-trigger-deployment.sh
#
# Triggers a deployment on Scalingo and outputs the deployment ID.
#
# Required environment variables:
#   FGP_DEPLOY_TOKEN  — FGP deploy token
#   SCALINGO_APP_NAME — name of the Scalingo app
#   GIT_REF           — git ref to deploy (e.g. "preprod")
#   GIT_REPO          — Github repo to deploy (<orga>/<repo>)
#   FGP_DEPLOY_URL    – URL to the FGP that triggers the deploy

# Outputs (when running in GitHub Actions):
#   deployment_id  — the ID of the triggered deployment

set -euo pipefail

: "${FGP_DEPLOY_TOKEN:?FGP_DEPLOY_TOKEN is required}"
: "${SCALINGO_APP_NAME:?SCALINGO_APP_NAME is required}"
: "${GIT_REF:?GIT_REF is required}"
: "${FGP_DEPLOY_URL:?FGP_DEPLOY_URL is required}"


if [ "$FGP_DEPLOY_TOKEN" = "null" ]; then
  echo "::error::FGP deploy token is empty. Check FGP_DEPLOY_TOKEN secret."
  exit 1
fi

SOURCE_URL="https://github.com/incubateur-ademe/nosgestesclimat-app/archive/${GIT_REF}.tar.gz"
API="${FGP_DEPLOY_URL}/v1/apps/${SCALINGO_APP_NAME}/deployments"

PAYLOAD=$(jq -n \
  --arg ref "$GIT_REF" \
  --arg url "$SOURCE_URL" \
  '{ deployment: { git_ref: $ref, source_url: $url } }')


# Capture body + status without losing the error details
HTTP_BODY="$(mktemp)"
trap 'rm -f "$HTTP_BODY"' EXIT

HTTP_CODE=$(curl -sS -o "$HTTP_BODY" -w "%{http_code}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-FGP-Key: $FGP_DEPLOY_TOKEN" \
  -X POST "$API" \
  -d "$PAYLOAD" || true)

echo "Scalingo HTTP status: $HTTP_CODE"
echo "Scalingo response:"
cat "$HTTP_BODY" || true

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "::error::Failed to trigger Scalingo deployment (HTTP $HTTP_CODE)."
  exit 1
fi

DEPLOYMENT_ID=$(jq -r '.deployment.id' < "$HTTP_BODY")
if [ -z "$DEPLOYMENT_ID" ] || [ "$DEPLOYMENT_ID" = "null" ]; then
  echo "::error::No deployment.id found in Scalingo response."
  exit 1
fi

echo "deployment_id=$DEPLOYMENT_ID" >> "$GITHUB_OUTPUT"
