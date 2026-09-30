#!/usr/bin/env bash
#
# review-app-postdeploy.sh
#
# Run during server postdeploy. Performs tasks specific to review apps
# (ensuring the default SEDD event, syncing Notion actions, pushing
# DATABASE_URL and REDIS_URL to the site review app).
#
# On production/preprod, this is a no-op.
#
# Required environment variables (for the DB URL push step):
#   APP                               - Set by Scalingo (e.g. "nosgestesclimat-preprod-pr42")
#   FGP_PUSH_DB_URL_TO_SITE_TOKEN     - FGP API token
#   FGP_PUSH_DB_URL_TO_SITE_URL       - URL to the FGP
#   DATABASE_URL                      - The database URL to share with the site app
#   REDIS_URL                         - The Redis URL to share with the site app

set -euo pipefail

if [[ ! "${APP:-}" =~ -pr[0-9]+$ ]]; then
  echo "Not a review app (APP=${APP:-unset}). Nothing to do."
  exit 0
fi

echo "── Review app postdeploy ─────────────────────────────────"
echo "  App: $APP"
echo "──────────────────────────────────────────────────────────"

# 1. Ensure the default SEDD event exists so /evenement/sedd renders
echo "── Ensuring SEDD event ───────────────────────────────────"
node --experimental-strip-types ./src/jobs/ensure-sedd-event.ts

# 2. Sync Notion actions to the review app database
actions_synced=false
if [[ -n "${NOTION_API_KEY:-}" && -n "${NOTION_ACTION_DATABASE_ID:-}" ]]; then
  echo "── Syncing Notion actions ───────────────────────────────"
  node --experimental-strip-types ./src/jobs/sync-notion-actions.ts
  actions_synced=true
else
  echo "Notion credentials not configured. Skipping actions sync."
fi

# 3. Seed the demo data (accounts, organisations, campaigns and their
# participants; the campaign statistics are queued for the worker).
#
# Only when the catalogue was synced: the simulations' action assessments are
# built from it, and where a review app starts from an empty database there is
# nothing else to build them from. The seed refuses to run without actions
# rather than seed half-answered simulations, so this guard is what keeps a
# missing Notion key from failing the whole deployment.
if [[ "$actions_synced" == true ]]; then
  echo "── Seeding demo data ─────────────────────────────────────"
  node --experimental-strip-types ./src/jobs/seed.ts
else
  echo "Skipping demo data seed: no action catalogue to assess against."
fi

# 4. Push DATABASE_URL and REDIS_URL to the corresponding site review app
: "${FGP_PUSH_DB_URL_TO_SITE_TOKEN:?FGP_PUSH_DB_URL_TO_SITE_TOKEN is required}"
: "${FGP_PUSH_DB_URL_TO_SITE_URL:?FGP_PUSH_DB_URL_TO_SITE_URL is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

SITE_REVIEW_APP="${APP/nosgestesclimat-/nosgestesclimat-site-}"

push_variable_to_site_review_app() {
  local name="$1"
  local value="$2"

  echo "── Pushing $name to site review app ──────────────────────"
  echo "  Server review app : $APP"
  echo "  Site review app   : $SITE_REVIEW_APP"
  echo "──────────────────────────────────────────────────────────"

  curl -sSf -X POST \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "X-FGP-Key: $FGP_PUSH_DB_URL_TO_SITE_TOKEN" \
    "${FGP_PUSH_DB_URL_TO_SITE_URL}/v1/apps/${SITE_REVIEW_APP}/variables" \
    -d "{\"variable\": {\"name\": \"$name\", \"value\": \"$value\"}}" \
    || echo "$name may already exist, continuing."
}

push_variable_to_site_review_app "DATABASE_URL" "$DATABASE_URL"
push_variable_to_site_review_app "REDIS_URL" "$REDIS_URL"

echo "── Done ─────────────────────────────────────────────────"
