#!/bin/bash
# Usage : ./generate-cloud-init.sh preprod|prod

ENV=${1:?Usage: ./generate-cloud-init.sh preprod|prod}

REPO="incubateur-ademe/nosgestesclimat-app"

# PostHog project API key (préfixe `phc_`) → injectée dans la config du collecteur.
POSTHOG_PROJECT_TOKEN=${POSTHOG_PROJECT_TOKEN:?POSTHOG_PROJECT_TOKEN env var required (PostHog project API key, starts with phc_)}

# Version du collecteur OpenTelemetry, épinglée : pas de mise à jour surprise.
# À incrémenter manuellement lors d'un upgrade :
# https://github.com/open-telemetry/opentelemetry-collector-releases/releases
OTELCOL_VERSION="0.160.0"

case $ENV in
preprod)
  DOMAIN="preprod.nosgestesclimat.fr"
  UPSTREAM="nosgestesclimat-site-preprod.osc-fr1.scalingo.io"
  ENVIRONMENT="preprod"
  TEMPLATE_REF="main"
  ;;
prod)
  DOMAIN="nosgestesclimat.fr"
  UPSTREAM="nosgestesclimat-site.osc-secnum-fr1.scalingo.io"
  ENVIRONMENT="prod"
  TEMPLATE_REF="main"
  ;;
*)
  echo "Usage: ./generate-cloud-init.sh preprod|prod"
  exit 1
  ;;
esac

OUTPUT_FILE="cloud-init.$ENV.yaml"

if [ ! -f "cloud-init.tpl.yaml" ]; then
  echo "❌ Error: cloud-init.tpl.yaml template file not found!" >&2
  exit 1
fi

if ! sed "s|__DOMAIN__|$DOMAIN|g; s|__UPSTREAM__|$UPSTREAM|g; s|__ENVIRONMENT__|$ENVIRONMENT|g; s|__REPO__|$REPO|g; s|__TEMPLATE_REF__|$TEMPLATE_REF|g; s|__POSTHOG_PROJECT_TOKEN__|$POSTHOG_PROJECT_TOKEN|g; s|__OTELCOL_VERSION__|$OTELCOL_VERSION|g" \
  cloud-init.tpl.yaml >"$OUTPUT_FILE"; then
  echo "❌ Error: Failed to generate $OUTPUT_FILE" >&2
  exit 1
fi

echo "✅ infra/$OUTPUT_FILE généré"
