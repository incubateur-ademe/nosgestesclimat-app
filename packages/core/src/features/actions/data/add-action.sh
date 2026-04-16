#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ACTIONS_DIR="${SCRIPT_DIR}/actions"
THEMES_DIR="${SCRIPT_DIR}/themes"

if [[ $# -ne 2 ]]; then
  echo "Usage : $0 <english-kebab-cased-name> <english-kebab-cased-theme>" >&2
  exit 1
fi

name="$1"
theme="$2"

# Validate kebab-case (lowercase letters and hyphens only)
kebab_re='^[a-z]+(-[a-z]+)*$'

if [[ ! "$name" =~ $kebab_re ]]; then
  echo "Le nom doit être en anglais, bas de casse et séparé par des tirets (e.g. 'my-action')" >&2
  exit 1
fi

if [[ ! "$theme" =~ $kebab_re ]]; then
  echo "Le thème doit être en anglais, bas de casse et séparé par des tirets (e.g. 'my-theme')" >&2
  exit 1
fi

# Check theme file exists
if [[ ! -f "${THEMES_DIR}/${theme}.ts" ]]; then
  echo "Le fichier de thème '${THEMES_DIR}/${theme}.ts' n'existe pas." >&2
  echo "Thèmes disponibles :" >&2
  ls "${THEMES_DIR}"/*.ts 2>/dev/null | grep -v index.ts | sed 's|.*/||; s|\.ts$||' | sed 's/^/  /' >&2
  exit 1
fi

# Convert kebab-case to camelCase
to_camel() { echo "$1" | perl -pe 's/-([a-z])/uc($1)/ge'; }

action_camel=$(to_camel "$name")
theme_camel=$(to_camel "$theme")

# Generate a lowercase UUID
uuid=$(uuidgen | tr '[:upper:]' '[:lower:]')
rule_uuid=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Write the action file
cat > "${ACTIONS_DIR}/${name}.ts" <<EOF
import type { ActionFile } from '../../types/action.js'
import { ${theme_camel} } from '../themes/index.js'

export const ${action_camel}: ActionFile = {
  id: '${uuid}',
  language: 'fr',
  title: '',
  themeId: ${theme_camel}.id,
  ruleId: '${rule_uuid}',
  longDescription: '',
}
EOF

# Append the re-export to index.ts
echo "export * from './${name}.js';" >> "${ACTIONS_DIR}/index.ts"

echo "Créé ${ACTIONS_DIR}/${name}.ts et mis à jour index.ts"
