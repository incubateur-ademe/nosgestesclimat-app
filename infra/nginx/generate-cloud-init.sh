#!/bin/bash
# Usage : ./generate-cloud-init.sh preprod|prod

ENV=${1:?Usage: ./generate-cloud-init.sh preprod|prod}

case $ENV in
  preprod)
    DOMAIN="preprod.nosgestesclimat.fr"
    UPSTREAM="nosgestesclimat-site-preprod.osc-fr1.scalingo.io"
    ;;
  prod)
    DOMAIN="nosgestesclimat.fr"
    UPSTREAM="nosgestesclimat-site.osc-secnum-fr1.scalingo.io"
    ;;
  *)
    echo "Usage: ./generate-cloud-init.sh preprod|prod"
    exit 1
    ;;
esac


# Create the output file path
OUTPUT_FILE="cloud-init.$ENV.yaml"

# Check if the template file exists
if [ ! -f "cloud-init.tpl.yaml" ]; then
    echo "❌ Error: cloud-init.tpl.yaml template file not found!" >&2
    exit 1
fi

# Perform the substitution and write to the output file
if ! sed "s/__DOMAIN__/$DOMAIN/g; s/__UPSTREAM__/$UPSTREAM/g" cloud-init.tpl.yaml > "$OUTPUT_FILE"; then
    echo "❌ Error: Failed to generate $OUTPUT_FILE" >&2
    exit 1
fi

echo "✅ infra/$OUTPUT_FILE généré"
