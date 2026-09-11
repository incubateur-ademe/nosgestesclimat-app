# FGP — génération des blobs

## C'est quoi FGP ?

**FGP** (fine-grained-proxy) est un proxy HTTP stateless devant n'importe quelle
API. On lui donne un blob chiffré (dans l'URL) qui garde, pour un périmètre
donné, un secret upstream, la liste des routes autorisées (méthode + chemin) et,
optionnellement, des contraintes sur le **corps** des requêtes POST.

Un fichier TOML (`config.toml`, `config.brevo.toml`) **est** cette liste de
routes/contraintes, en source unique. Un exécutable le lit et appelle FGP pour
produire, par environnement, un couple **URL + token** (= clé client).

Deux usages :

- **Scalingo** (`config.toml`) : déclencher/monitorer les déploiements depuis le
  CI sans exposer le token Scalingo complet — 4 blobs (`prod`, `preprod`,
  `review apps`, **hook postdeploy**).
- **Brevo** (`config.brevo.toml`) : lire en **lecture seule** les logs d'emails
  transactionnels, pour le gate e2e preprod, sans exposer la clé Brevo complète.

## Fichiers

| Fichier               | Rôle                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `config.toml`         | Config **Scalingo** : 1 bloc `[env.*]` par environnement, ses `routes` (sans body) et ses `[[scope]]` POST avec `[body]`. |
| `config.brevo.toml`   | Config **Brevo** (lecture seule des logs) : `auth = "header:api-key"`, `token_env = "BREVO_API_KEY"`.                     |
| `plan.py`             | Utilitaire (pas à lancer) : transforme `config.toml` en plan JSON pour FGP. Le .sh l'appelle en interne.                  |
| `generate-configs.sh` | **Le script à lancer** : lit la config, interroge `/api/generate` et affiche url + token par env.                         |

## Usage

```bash
# Scalingo (défauts) :
SCALINGO_API_TOKEN=tk-us-xxx ./generate-configs.sh
# Brevo (lecture seule) :
BREVO_API_KEY=xkeysib-xxx ./generate-configs.sh config.brevo.toml
```

Le TOML porte le mode d'auth (`global.auth`) et le nom de la variable d'env du
secret upstream (`global.token_env`) — d'où les deux commandes ci-dessus. Le
chemin du TOML est le 1er argument (défaut : `config.toml`).

Défauts lus dans le TOML : instance FGP (`global.fgp_base_url`) et TTL.
Surcharge possible : `FGP_BASE_URL=…` et `FGP_TTL=…` (0 = sans expiration).

Sorties sensibles (url/blobs + token) : ne pas les fuiter.

`JSON_ONLY=1` affiche un JSON consommable (`{env, url, token}` par ligne).

## Modifier une route

Éditer `config.toml` (ajouter une entrée `routes` sans body, ou un
`[[scope]]` POST avec sa sous-table `[body]`). Légende des body filters dans
l'en-tête du fichier.
