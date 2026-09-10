#!/bin/bash
# ----------------------------------------------------------------------------
# Installe ou met à jour otelcol-contrib et configure le sidecar systemd qui
# expédie les logs nginx vers PostHog Logs.
#
# Idempotent : relançable pour upgrader (nouvelle version) ou pour installer
# sur une instance existante qui n'a pas encore le collecteur.
# Appelé par cloud-init au first boot ; utilisable à l'identique en SSH.
#
# Usage :
#   install-otelcol.sh <version>        # ex. install-otelcol.sh 0.160.0
#
# Variables d'environnement (optionnelles) :
#   NGC_REF   branche/tag d'où tirer otelcol-config.yaml (défaut : main)
#   NGC_REPO  dépôt GitHub (défaut : incubateur-ademe/nosgestesclimat-app)
#
# Prérequis : /etc/otelcol-contrib/otelcol-contrib.env doit exister (créé par
# cloud-init, ou à la main) avec :
#   POSTHOG_PROJECT_TOKEN=phc_...
#   ENVIRONMENT=prod|preprod
# ----------------------------------------------------------------------------
set -euo pipefail

VER=${1:?Usage: install-otelcol.sh <version> (ex. 0.160.0)}
NGC_REF=${NGC_REF:-main}
NGC_REPO=${NGC_REPO:-incubateur-ademe/nosgestesclimat-app}

CONF_DIR=/etc/otelcol-contrib
ENV_FILE="${CONF_DIR}/otelcol-contrib.env"
RAW="https://raw.githubusercontent.com/${NGC_REPO}/refs/heads/${NGC_REF}"
RAW="${RAW}/infra/nginx"

if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: à lancer en root (dpkg / systemctl)." >&2
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE introuvable." >&2
    echo "Créez-le (chmod 600) avec :" >&2
    echo "  POSTHOG_PROJECT_TOKEN=phc_..." >&2
    echo "  ENVIRONMENT=prod" >&2
    exit 1
fi

# ── 1. Binaire otelcol-contrib (version épinglée + intégrité sha256) ────────
BASE="https://github.com/open-telemetry/opentelemetry-collector-releases"
DEB_URL="${BASE}/releases/download/v${VER}/otelcol-contrib_${VER}_linux_amd64.deb"
echo "→ otelcol-contrib v${VER}"
curl -fsSL --retry 3 -o /tmp/otelcol-contrib.deb "$DEB_URL"
curl -fsSL --retry 3 -o /tmp/otelcol-contrib.deb.sha256 "${DEB_URL}.sha256"
EXPECTED=$(awk '{print $1}' /tmp/otelcol-contrib.deb.sha256)
ACTUAL=$(sha256sum /tmp/otelcol-contrib.deb | awk '{print $1}')
if [ "$EXPECTED" != "$ACTUAL" ]; then
    echo "ERROR: sha256 invalide (attendu ${EXPECTED}, obtenu ${ACTUAL})" >&2
    exit 1
fi
dpkg -i /tmp/otelcol-contrib.deb
rm -f /tmp/otelcol-contrib.deb /tmp/otelcol-contrib.deb.sha256

# ── 2. Config du collecteur (mise à jour ensuite par pull-config.sh) ───────
curl -fsSL "$RAW/otelcol-config.yaml" -o "${CONF_DIR}/config.yaml"

# ── 3. Override systemd (env file + redémarrage auto) ───────────────────────
mkdir -p /etc/systemd/system/otelcol-contrib.service.d
cat > /etc/systemd/system/otelcol-contrib.service.d/override.conf <<'EOF'
[Service]
EnvironmentFile=/etc/otelcol-contrib/otelcol-contrib.env
Restart=on-failure
RestartSec=10s
EOF

# ── 4. État persistant + lecture des logs nginx (groupe `adm`) ──────────────
mkdir -p /var/lib/otelcol-contrib
chown -R otelcol-contrib:otelcol-contrib /var/lib/otelcol-contrib
usermod -aG adm otelcol-contrib

# ── 5. Activation (le restart prend en compte le groupe `adm` et la version) ─
systemctl daemon-reload
systemctl enable otelcol-contrib
systemctl restart otelcol-contrib

echo "✅ otelcol-contrib v${VER} installé et démarré."
