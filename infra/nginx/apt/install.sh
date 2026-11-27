#!/bin/bash
# Install the automatic-update policy (security only, Ubuntu + nginx.org).
# Idempotent: cloud-init runs it at first boot, SSH re-runs it to apply a change.
# Usage : install.sh   (NGC_REF=<branch> to pull from elsewhere than main)
set -euo pipefail

REF=${NGC_REF:-main}
RAW="https://raw.githubusercontent.com/incubateur-ademe/nosgestesclimat-app/refs/heads/${REF}/infra/nginx/apt"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

for f in 52unattended-upgrades-ngc apt-daily.timer.conf apt-daily-upgrade.timer.conf; do
    curl -fsSL --max-time 30 --retry 3 "$RAW/$f" -o "$TMP/$f"
done

# A malformed apt.conf.d file breaks every apt invocation.
apt-config -c "$TMP/52unattended-upgrades-ngc" dump >/dev/null

install -D -m 0644 "$TMP/52unattended-upgrades-ngc" \
    /etc/apt/apt.conf.d/52unattended-upgrades-ngc
install -D -m 0644 "$TMP/apt-daily.timer.conf" \
    /etc/systemd/system/apt-daily.timer.d/window.conf
install -D -m 0644 "$TMP/apt-daily-upgrade.timer.conf" \
    /etc/systemd/system/apt-daily-upgrade.timer.d/window.conf

systemctl daemon-reload
systemctl enable apt-daily.timer apt-daily-upgrade.timer
systemctl restart apt-daily.timer apt-daily-upgrade.timer
systemctl list-timers 'apt-daily*' --no-pager
