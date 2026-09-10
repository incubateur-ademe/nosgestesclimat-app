#!/bin/bash
# Installe/upgrade le collecteur OpenTelemetry (logs nginx → PostHog Logs).
# Idempotent : à relancer pour upgrader, ou pour installer sur une instance
# existante.
# Usage : install-otelcol.sh <version>
#   (NGC_REF=<branche> pour tirer otelcol-config.yaml ailleurs que sur main.)
set -eu

VER=${1:?usage: install-otelcol.sh <version>}
REF=${NGC_REF:-main}
RAW="https://raw.githubusercontent.com/incubateur-ademe/nosgestesclimat-app/refs/heads/${REF}/infra/nginx"

# Binaire. Le paquet crée le user, /etc/otelcol-contrib + /var/lib/otelcol-contrib
# (bon propriétaire) et l'unit systemd (EnvironmentFile + Restart=on-failure).
curl -fsSL -o /tmp/otelcol-contrib.deb \
  "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${VER}/otelcol-contrib_${VER}_linux_amd64.deb"
dpkg -i /tmp/otelcol-contrib.deb

# Config : on écrase celle du paquet.
curl -fsSL "$RAW/otelcol-config.yaml" -o /etc/otelcol-contrib/config.yaml

# L'unit ne charge que /etc/otelcol-contrib/otelcol-contrib.conf ; le token est
# dans otelcol-contrib.env → on l'ajoute via un drop-in.
mkdir -p /etc/systemd/system/otelcol-contrib.service.d
cat > /etc/systemd/system/otelcol-contrib.service.d/override.conf <<'EOF'
[Service]
EnvironmentFile=/etc/otelcol-contrib/otelcol-contrib.env
EOF

# Lire /var/log/nginx/*.log (groupe adm), puis appliquer conf + groupe.
usermod -aG adm otelcol-contrib
systemctl daemon-reload
systemctl restart otelcol-contrib
