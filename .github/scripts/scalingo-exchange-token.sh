#!/usr/bin/env bash
#
# scalingo-exchange-token.sh
# Exchanges a Scalingo API token for a short-lived Bearer token.
#
# Required environment variables:
#   SCALINGO_API_TOKEN — Scalingo API token used to authenticate
#
# Outputs (when running in GitHub Actions):
#   bearer_token  — the exchanged Bearer token (masked in logs)
#
# Exit codes:
#   0  success
#   1  missing env var or token exchange failed

set -euo pipefail

: "${SCALINGO_API_TOKEN:?SCALINGO_API_TOKEN is required}"

BEARER_TOKEN=$(curl -s -H "Accept: application/json" -H "Content-Type: application/json" \
  -u ":${SCALINGO_API_TOKEN}" \
  -X POST https://auth.scalingo.com/v1/tokens/exchange | jq -r '.token')

if [ -z "$BEARER_TOKEN" ] || [ "$BEARER_TOKEN" = "null" ]; then
  echo "::error::Failed to exchange Scalingo API token for a Bearer token. Check SCALINGO_API_TOKEN secret." >&2
  exit 1
fi

# Mask the token so it never appears in plain text in CI logs
echo "::add-mask::$BEARER_TOKEN"
echo "bearer_token=$BEARER_TOKEN" >> "$GITHUB_OUTPUT"
