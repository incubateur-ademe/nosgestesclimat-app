#!/usr/bin/env bash
set -euo pipefail

THEMES_DIR="$(cd "$(dirname "$0")/themes" && pwd)"

if [[ $# -ne 1 ]]; then
  echo "Usage : $0 <english-kebab-cased-name>" >&2
  exit 1
fi

name="$1"

# Validate kebab-case (lowercase letters and hyphens only)
if [[ ! "$name" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
  echo "Le nom doit être en anglais, bas de casse et séparé par des tirets (e.g. 'my-theme')" >&2
  exit 1
fi

# Convert kebab-case to camelCase
camel=$(echo "$name" | perl -pe 's/-([a-z])/uc($1)/ge')

# Generate a lowercase UUID
uuid=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Write the theme file
cat > "${THEMES_DIR}/${name}.ts" <<EOF
import type { Theme } from '../../types/theme.js'

export const ${camel}: Theme = {
  id: '${uuid}',
  language: 'fr',
  title: '',
}
EOF

# Append the re-export to index.ts
echo "export * from './${name}.js';" >> "${THEMES_DIR}/index.ts"

echo "Créé ${THEMES_DIR}/${name}.ts et mis à jour index.ts"
