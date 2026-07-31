#!/bin/bash
# Usage : ./generate-cloud-init.sh preprod|prod

ENV=${1:?Usage: ./generate-cloud-init.sh preprod|prod}

REPO="incubateur-ademe/nosgestesclimat-app"

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

if ! sed "s|__DOMAIN__|$DOMAIN|g; s|__UPSTREAM__|$UPSTREAM|g; s|__ENVIRONMENT__|$ENVIRONMENT|g; s|__REPO__|$REPO|g; s|__TEMPLATE_REF__|$TEMPLATE_REF|g" \
    cloud-init.tpl.yaml > "$OUTPUT_FILE"; then
    echo "❌ Error: Failed to generate $OUTPUT_FILE" >&2
    exit 1
fi

echo "✅ infra/$OUTPUT_FILE généré"
