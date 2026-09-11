#!/usr/bin/env bash
#
# generate-configs.sh
#
# Genere les blobs FGP (un par env declare dans un TOML) : chacun = un couple
# (url + token), via l'API /api/generate de fine-grained-proxy.
#
# Le TOML (defaut : config.toml, colocalise) est la source unique : cible(s),
# routes/contraintes, mode d'auth et nom de la variable d'env portant le secret
# upstream. Ce script :
#   1. lit le TOML via plan.py -> plan JSON (une entree par env)
#   2. pour chaque env, POST /api/generate
#   3. affiche, par env, la valeur de l'url et du token a utiliser.
#
# Usage :
#   SCALINGO_API_TOKEN=tk-us-xxx ./generate-configs.sh
#   BREVO_API_KEY=xkeysib-xxx   ./generate-configs.sh config.brevo.toml
#
# Arguments :
#   $1  chemin du TOML (defaut : config.toml colocalise, sinon $FGP_CONFIG)
#
# Variables d'environnement :
#   <token_env>   (requis) secret upstream declare par le TOML
#                 (defaut SCALINGO_API_TOKEN ; BREVO_API_KEY pour Brevo)
#   FGP_BASE_URL  (defaut) instance FGP (vient du TOML [global])
#   FGP_TTL       (defaut) TTL du blob, 0 = sans expiration (vient du TOML)
#   JSON_ONLY     (1)      ne sort qu'un JSON consommable (par env)
# Sortie sensible (url/blobs + token) : ne pas les fuiter dans du texte partage.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_TOML="${1:-${FGP_CONFIG:-${SCRIPT_DIR}/config.toml}}"
PLAN_PY="${SCRIPT_DIR}/plan.py"

command -v curl >/dev/null || {
  echo "Erreur : curl requis." >&2
  exit 1
}
command -v jq >/dev/null || {
  echo "Erreur : jq requis." >&2
  exit 1
}
command -v python3 >/dev/null || {
  echo "Erreur : python3 requis (tomllib)." >&2
  exit 1
}

# ------------------------------------------------
# 1) Charger le plan (lecture TOML)
# ------------------------------------------------
PLAN="$(python3 "$PLAN_PY" "$CONF_TOML")" || {
  echo "Erreur : echec de plan.py (TOML invalide ?)." >&2
  exit 1
}
FGP_BASE_URL="${FGP_BASE_URL:-$(jq -r '.fgp_base_url' <<<"$PLAN")}"
GENERATE_ENDPOINT="${FGP_BASE_URL}/api/generate"
AUTH="$(jq -r '.auth' <<<"$PLAN")"
TOKEN_ENV="$(jq -r '.token_env' <<<"$PLAN")"
JSON_ONLY="${JSON_ONLY:-}"

if [[ -z "${!TOKEN_ENV:-}" ]]; then
  echo "Erreur : ${TOKEN_ENV} est requis (secret upstream attendu par ${CONF_TOML})." >&2
  exit 1
fi

mapfile -t ENV_KEYS < <(jq -r '.envs[] | .key' <<<"$PLAN")
[[ ${#ENV_KEYS[@]} -gt 0 ]] || {
  echo "Aucun [env.*] dans la config." >&2
  exit 1
}

ttl_for() { # env_key -> ttl
  if [[ -n "${FGP_TTL:-}" ]]; then
    [[ "$FGP_TTL" =~ ^[0-9]+$ ]] || {
      echo "FGP_TTL doit etre un entier >=0." >&2
      exit 1
    }
    printf '%s' "$FGP_TTL"
  else
    jq -r --arg k "$1" '.envs[]|select(.key==$k)|.ttl' <<<"$PLAN"
  fi
}

# ------------------------------------------------
# 2) Helper : genere l'url+token d'un envoi
# ------------------------------------------------
generate_one() { # env_key
  local env_key="$1"
  local env api_url scope_json ttl
  env="$(jq -c --arg k "$env_key" '.envs[]|select(.key==$k)' <<<"$PLAN")"
  api_url="$(jq -r '.api' <<<"$env")"
  scope_json="$(jq -c '.scopes' <<<"$env")"
  ttl="$(ttl_for "$env_key")"

  if [[ "$JSON_ONLY" != "1" ]]; then
    echo
    echo "──────────────────────────────"
    echo "  [$env_key] via ${GENERATE_ENDPOINT}  (auth: ${AUTH})"
    printf '    scopes  : %s\n' "$(jq 'length' <<<"$scope_json") route(s)"
  fi

  local body resp url token
  body="$(jq -nc \
    --arg token "${!TOKEN_ENV}" \
    --arg target "$api_url" --arg name "$env_key" --arg auth "$AUTH" \
    --argjson ttl "$ttl" --argjson scopes "$scope_json" \
    '{ token:$token, target:$target, name:$name,
       auth:$auth, scopes:$scopes, ttl:$ttl }')"

  if ! resp="$(curl -sS --fail-with-body -H "Content-Type: application/json" \
    -X POST "$GENERATE_ENDPOINT" -d "$body")"; then
    echo "  ::error:: /api/generate echoue pour [$env_key]." >&2
    return 1
  fi

  url="$(jq -r '.url' <<<"$resp")"
  token="$(jq -r '.key' <<<"$resp")"
  if [[ "${url}" = "null" || "${token}" = "null" ]]; then
    echo "  ::error:: reponse inattendue pour [$env_key]: $resp" >&2
    return 1
  fi

  if [[ "$JSON_ONLY" == "1" ]]; then
    jq -cn --arg e "$env_key" --arg u "$url" --arg t "$token" \
      '{env:$e, url:$u, token:$t}'
  else
    echo "  URL   : $url"
    echo "  token : $token"
  fi
}

# ------------------------------------------------
# 3) Exec
# ------------------------------------------------
[[ "$JSON_ONLY" != "1" ]] && {
  echo "Instance FGP : ${FGP_BASE_URL}   (config ${CONF_TOML})"
}
for key in "${ENV_KEYS[@]}"; do
  generate_one "$key"
done
