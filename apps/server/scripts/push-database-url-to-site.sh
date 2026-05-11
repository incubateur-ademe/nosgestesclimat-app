#!/usr/bin/env bash
#
# push-database-url-to-site.sh
#
# Run during server postdeploy. Pushes DATABASE_URL to the corresponding site
# review app so that Next.js Server Components can access the database directly.
#
# On production/preprod, this is a no-op (DATABASE_URL is set manually on the
# parent site app).
#
# Required environment variables:
#   APP                               - Set by Scalingo (e.g. "nosgestesclimat-preprod-pr42")
#   FGP_PUSH_DB_URL_TO_SITE_TOKEN     - FGP API token
#   FGP_PUSH_DB_URL_TO_SITE_URL       - URL to the FGP
#   DATABASE_URL                      - The database URL to share with the site app

set -euo pipefail

if [[ ! "${APP:-}" =~ -pr[0-9]+$ ]]; then
  echo "Not a review app (APP=${APP:-unset}). Nothing to do."
  exit 0
fi

: "${FGP_PUSH_DB_URL_TO_SITE_TOKEN:?FGP_PUSH_DB_URL_TO_SITE_TOKEN is required}"
: "${FGP_PUSH_DB_URL_TO_SITE_URL:?FGP_PUSH_DB_URL_TO_SITE_URL is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

SITE_REVIEW_APP="${APP/nosgestesclimat-/nosgestesclimat-site-}"

echo "── Pushing DATABASE_URL to site review app ───────────────"
echo "  Server review app : $APP"
echo "  Site review app   : $SITE_REVIEW_APP"
echo "──────────────────────────────────────────────────────────"

curl -sSf -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-FGP-Key: $FGP_PUSH_DB_URL_TO_SITE_TOKEN" \
  "${FGP_PUSH_DB_URL_TO_SITE_URL}/v1/apps/${SITE_REVIEW_APP}/variables" \
  -d "{\"variable\": {\"name\": \"DATABASE_URL\", \"value\": \"$DATABASE_URL\"}}" \
  || echo "DATABASE_URL may already exist, continuing."

echo "── Done ─────────────────────────────────────────────────"
