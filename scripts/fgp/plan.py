#!/usr/bin/env python3
"""
plan.py

Lecteur de scripts/fgp/config.toml (unique source des blob FGP, image
exacte des routes Scalingo autorisees) -> imprime sur stdout un plan JSON de
generation : une entree par env, adaptee a l'API FGP /api/generate.

Traduction mecanique des [[env.<x>.scope]] :
  * sans sous-table .body  -> scope PASSE sous forme de chaine  "METHOD:/route"
                              (sans contrainte de body, ex. GET de monitoring).
  * avec  sous-table .body -> le scope devient un OBJET FGP structure :
        { "methods":[METHOD], "pattern":route,
          "bodyFilters":[ {objectPath, objectValue:[...]} , ... ] }
      Chaque cle de .body est un "dot-path" JSON (deployment.git_ref, ...). Le
      filtre est decode ainsi pour objectValue :
          { eq = X }          -> {type:"any", value:X}
          { glob = P }        -> {type:"stringwildcard", value:P}
          { regex = P }       -> {type:"regex", value:P}
          { present = true }  -> {type:"wildcard", value:"*"}
      Plusieurs cles sous .body = plusieurs bodyFilters (tous combines en AND).

La cible (target) vient de env.<x>.api, sinon global.api. La base FGP, le TTL,
le mode d'auth et le nom de la variable d'env du secret upstream viennent du
[global] du TOML. Le script print pour chaque env la valeur url + token
(tok = cle client) — pas d'affectation nommee : juste les valeurs.

Sortie : JSON valide sur stdout (aucun log sur stderr sauf erreur).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import tomllib


def decode_object_value(filt: dict | str) -> dict:
    """Traduit une contrainte .body TOML en ObjectValue FGP."""
    if isinstance(filt, str):
        return {"type": "any", "value": filt}
    if isinstance(filt, bool):
        if filt:
            return {"type": "wildcard", "value": "*"}
        raise ValueError("body: une contrainte 'false' n'a pas de sens")
    if isinstance(filt, dict):
        if "eq" in filt:
            return {"type": "any", "value": filt["eq"]}
        if "glob" in filt:
            return {"type": "stringwildcard", "value": filt["glob"]}
        if "regex" in filt:
            # FGP ancre le motif (^(?:...)$) : on le fournit nu.
            return {"type": "regex", "value": filt["regex"]}
        if filt.get("present"):
            return {"type": "wildcard", "value": "*"}
    raise ValueError(f"body filter non reconnu : {filt!r}")


def to_fgp_scope(scope: dict) -> str | dict:
    """Convertit un scope TOML en scope FGP (chaine ou objet structure)."""
    method = str(scope.get("method", "GET")).upper()
    route = scope["route"]
    body = scope.get("body")
    if not body:  # pas de contrainte => scope "GET:path"
        return f"{method}:{route}"
    body_filters = []
    for obj_path, filt in body.items():
        obj_path = str(obj_path)
        body_filters.append(
            {
                "objectPath": obj_path,
                "objectValue": [decode_object_value(filt)],
            }
        )
    return {"methods": [method], "pattern": route, "bodyFilters": body_filters}


def as_int(value, default: int) -> int:
    """Coerce a TOML scalar to int ; fallback sur default si invalide."""
    if value is None:
        return default
    if isinstance(value, bool):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def main(argv: list[str]) -> int:
    conf = Path(argv[0] if argv else Path(__file__).resolve().parent / "config.toml")
    if not conf.is_file():
        print(f"config introuvable : {conf}", file=sys.stderr)
        return 2

    try:
        with conf.open("rb") as fh:
            cfg = tomllib.load(fh)
    except tomllib.TOMLDecodeError as err:
        print(f"TOML invalide : {err}", file=sys.stderr)
        return 2

    base_ttl = as_int(cfg.get("ttl"), 0)
    g = cfg.get("global", {})
    fgp_base = g.get("fgp_base_url", "https://fgp.incubateur.ademe.fr")
    default_api = g.get("api", "https://api.osc-fr1.scalingo.com")
    auth = g.get("auth", "scalingo-exchange")
    token_env = g.get("token_env", "SCALINGO_API_TOKEN")

    envs = []
    for key, ecfg in cfg.get("env", {}).items():
        # routes = liste de chaines METHOD:/route (sans body)
        plain = list(ecfg.get("routes", []) or [])
        # [[scope]] = objets qui portent eventuellement une contrainte .body
        structured = [to_fgp_scope(s) for s in ecfg.get("scope", [])]
        scopes = plain + structured
        envs.append(
            {
                "key": key,
                "api": ecfg.get("api") or default_api,
                "ttl": as_int(ecfg.get("ttl"), base_ttl),
                "scopes": scopes,
            }
        )

    json.dump(
        {
            "fgp_base_url": fgp_base,
            "auth": auth,
            "token_env": token_env,
            "envs": envs,
        },
        sys.stdout,
        ensure_ascii=False,
    )
    return 0


if __name__ == "__main__":
    try:
        rc = main(sys.argv[1:])
    except (ValueError, KeyError) as err:
        print(f"Erreur config : {err}", file=sys.stderr)
        rc = 2
    try:
        sys.stdout.flush()
    except BrokenPipeError:
        rc = 0
    raise SystemExit(rc)
