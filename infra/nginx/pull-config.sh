#!/bin/bash
set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────
DEPLOY_ENV="/etc/nginx/deploy.env"
NGINX_CONF="/etc/nginx/sites-available/nosgestesclimat"
BACKUP_CONF="${NGINX_CONF}.bak"
STATE_DIR="/var/lib/nginx-config"
LAST_SHA_FILE="${STATE_DIR}/last-sha"
GITHUB_RAW="https://raw.githubusercontent.com"
GITHUB_API="https://api.github.com"

# ─── Load environment ───────────────────────────────────────────
if [ ! -f "$DEPLOY_ENV" ]; then
    echo "ERROR: $DEPLOY_ENV not found"
    exit 1
fi
# shellcheck source=/dev/null
source "$DEPLOY_ENV"
export DOMAIN UPSTREAM ENVIRONMENT REPO TEMPLATE_REF

: "${DOMAIN:?DOMAIN must be set in $DEPLOY_ENV}"
: "${UPSTREAM:?UPSTREAM must be set in $DEPLOY_ENV}"
: "${ENVIRONMENT:?ENVIRONMENT must be set in $DEPLOY_ENV}"
: "${REPO:?REPO must be set in $DEPLOY_ENV}"
: "${TEMPLATE_REF:?TEMPLATE_REF must be set in $DEPLOY_ENV}"

mkdir -p "$STATE_DIR"

# ─── Get latest commit SHA ───────────────────────────────────────
SHA=$(curl -fsSL --max-time 30 --retry 3 \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: nginx-config-pull" \
    "${GITHUB_API}/repos/${REPO}/git/refs/heads/${TEMPLATE_REF}" \
    | jq -r '.object.sha')

if [ -z "$SHA" ] || [ "$SHA" = "null" ]; then
    echo "ERROR: could not fetch latest SHA from GitHub"
    exit 1
fi

# ─── Skip if already up to date ─────────────────────────────────
if [ -f "$LAST_SHA_FILE" ] && [ "$(cat "$LAST_SHA_FILE")" = "$SHA" ]; then
    exit 0
fi

# ─── Prod gate: check combined CI status ────────────────────────
if [ "$ENVIRONMENT" = "prod" ]; then
    STATE=$(curl -fsSL --max-time 30 --retry 3 \
        -H "Accept: application/vnd.github+json" \
        -H "User-Agent: nginx-config-pull" \
        "${GITHUB_API}/repos/${REPO}/commits/${SHA}/status" \
        | jq -r '.state')

    if [ "$STATE" != "success" ]; then
        echo "SKIP: commit ${SHA:0:7} has status '${STATE}' — waiting for CI"
        exit 0
    fi
fi

# ─── Download template ──────────────────────────────────────────
TMP_TEMPLATE=$(mktemp)
TMP_RENDERED=$(mktemp)
trap 'rm -f "$TMP_TEMPLATE" "$TMP_RENDERED"' EXIT

if ! curl -fsSL --max-time 30 --retry 3 \
    -H "User-Agent: nginx-config-pull" \
    "${GITHUB_RAW}/${REPO}/refs/heads/${TEMPLATE_REF}/infra/nginx/nginx.conf.tpl" \
    -o "$TMP_TEMPLATE"; then
    echo "ERROR: failed to download nginx.conf.tpl"
    exit 1
fi

# Validate: non-empty and looks like Nginx config (not a GitHub 404 HTML page)
if [ ! -s "$TMP_TEMPLATE" ] || ! head -1 "$TMP_TEMPLATE" | grep -qv '^<!DOCTYPE'; then
    echo "ERROR: downloaded template is empty or not a valid config file"
    exit 1
fi

# ─── Render ─────────────────────────────────────────────────────
envsubst '${DOMAIN} ${UPSTREAM}' < "$TMP_TEMPLATE" > "$TMP_RENDERED"

# ─── Skip if rendered config is identical ───────────────────────
if [ -f "$NGINX_CONF" ] && cmp -s "$NGINX_CONF" "$TMP_RENDERED"; then
    echo "$SHA" > "$LAST_SHA_FILE"
    exit 0
fi

# ─── Backup + install ───────────────────────────────────────────
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "$BACKUP_CONF"
fi
cp "$TMP_RENDERED" "$NGINX_CONF"

# ─── Validate + reload ──────────────────────────────────────────
# Invariant: if nginx is running, SSL certs exist (the config references them
# and nginx can't start without them). So we gate on nginx being active.
if ! systemctl is-active --quiet nginx; then
    echo "OK: config installed (nginx not running yet — commit ${SHA:0:7})"
    echo "$SHA" > "$LAST_SHA_FILE"
    exit 0
fi

if ! nginx -t 2>&1; then
    echo "ERROR: nginx -t failed"
    if [ -f "$BACKUP_CONF" ]; then
        cp "$BACKUP_CONF" "$NGINX_CONF"
        echo "Rolled back to previous config"
    fi
    exit 1
fi

systemctl reload nginx

sleep 1

# ─── Health check ───────────────────────────────────────────────
if ! curl -fsS --max-time 10 \
    --resolve "${DOMAIN}:443:127.0.0.1" \
    "https://${DOMAIN}/" -o /dev/null; then
    echo "ERROR: health check failed after reload — rolling back"
    cp "$BACKUP_CONF" "$NGINX_CONF"
    systemctl reload nginx
    exit 1
fi

echo "OK: config deployed and nginx reloaded (commit ${SHA:0:7})"
echo "$SHA" > "$LAST_SHA_FILE"
