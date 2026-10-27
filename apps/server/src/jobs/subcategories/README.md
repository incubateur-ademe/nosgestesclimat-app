# Export des sous catégories

Calcule les **sous catégories** pour les simulations stockées en base, et les
exporte en CSV dans le bucket Scaleway.

Le format du CSV (séparateur `;`, virgule décimale) est celui attendu par les
outils d'analyse des postes (Ravijen, page de fin, import PostHog).

## Lancer un mois

```sh
# Sur Scalingo (le code doit être déployé sur l'app)
scalingo --app nosgestesclimat-preprod run --detached \
  "npm run jobs:exportSubcategories -- --period 2026-01"

# Suivre l'exécution (remplacer one-off-XXXX par l'identifiant affiché)
scalingo --app nosgestesclimat-preprod logs --filter one-off-XXXX
```

> ⚠️ La CLI Scalingo (< 1.51) n'arrive pas à s'attacher aux one-offs :
> `run` sans `--detached` échoue avec `exit status 1` alors que le conteneur
> démarre. Utiliser `--detached` puis `logs --filter`.

Un worker one-off est tué après **1 h sans écriture sur stdout** : le job écrit
un heartbeat toutes les 5 min, et la progression de chaque lot.

| Option                        | Défaut  | Rôle                                                                 |
| ----------------------------- | ------- | -------------------------------------------------------------------- |
| `-p`, `--period`              | —       | Mois à exporter (`YYYY-MM`)                                          |
| `--start-date` / `--end-date` | —       | Période explicite (`--end-date` incluse)                             |
| `-b`, `--batch`               | `1000`  | Taille des lots (~20 s par lot)                                      |
| `-s`, `--schema`              | `ngc`   | Schéma Postgres                                                      |
| `-f`, `--from`                | `auto`  | Reprise depuis le checkpoint du bucket, ou `0` pour repartir de zéro |
| `--no-upload`                 | —       | Écrit en local seulement (debug)                                     |
| `--sample-per-version`        | —       | **Pré-vol** : au plus N simulations par version                      |
| `--sample-mode`               | `first` | Pré-vol : `first`, `spread` (réparti) ou `random`                    |
| `--sample-seed`               | `0`     | Pré-vol, mode `random` : graine                                      |
| `--versions`                  | —       | Pré-vol : restreindre à certaines versions                           |
| `-v`, `--verbose`             | —       | Détail par simulation                                                |

## Sorties

```
ngc/export-subcategories/<période>/sous-categories-<période>.csv
ngc/export-subcategories/<période>/sous-categories-<période>.csv.checkpoint.json
ngc/export-subcategories/_model-cache/<version>.json
```

Le CSV et le checkpoint sont envoyés tous les 25 lots et en fin de run : un run
interrompu reprend au lot suivant avec `--from auto` (défaut). Le cache des
règles de modèle évite de retélécharger les tarballs npm en cas de reprise.

## Pré-vol avant un run complet

Sur une longue période, valider d'abord la compatibilité des règles sur un
échantillon :

```sh
scalingo --app nosgestesclimat-preprod run --detached \
  "npm run jobs:exportSubcategories -- --period 2026-01 --sample-per-version 50 --sample-mode spread"
```

Le rapport final donne, par version de modèle : nombre de simulations en base,
taille de l'échantillon, lignes écrites, incohérentes, erreurs, ignorées et jeu
de règles appliqué. Un CSV d'échantillon n'est **pas** exhaustif : il sert au
diagnostic, pas à l'analyse.

## Règles de sous catégories

Elles vivent dans [`rules/`](./rules) et **font foi** :

| Fichier                            | Rôle                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `subcategories.yaml`               | fichier de base, définit les colonnes du CSV                  |
| `subcategories.before-4.16.0.yaml` | petit déjeuner (profil → composants), électricité du logement |
| `subcategories.before-4.10.1.yaml` | électricité via `consommation totale collectif`               |
| `subcategories.before-4.10.0.yaml` | chauffage sans `mode`, gabarit voiture `berline`              |
| `subcategories.before-4.9.1.yaml`  | `services sociétaux` non ventilables par branche NAF          |

Le catalogue [`lib/rules.ts`](./lib/rules.ts) associe chaque plage de versions
aux fichiers à fusionner (plancher : **4.6.0**). Une variante ne doit que
**redéfinir** des règles existantes : le job refuse de démarrer si elle en
ajoute, car les colonnes du CSV en dépendraient. Il refuse aussi de démarrer si
un fichier référencé n'existe pas — `getModelFromSource` ignore silencieusement
un fichier absent, une variante renommée serait sinon perdue sans erreur.

## Détails d'implémentation

- **Connexion** : `psql` (présent dans l'image) avec
  `SCALINGO_POSTGRESQL_URL`. `DATABASE_URL` contient `connection_limit`, un
  paramètre Prisma que libpq refuse — l'URL est nettoyée si nécessaire.
- **Règles du modèle** : téléchargées depuis npm version par version
  (`lib/model-rules.ts`), avec 4 tentatives et repli sur le cache bucket. Un
  `ECONNRESET` isolé ne fait pas perdre de simulation.
- **Mémoire** : ~45 Mo de RSS par moteur Publicodes, mis en cache par version
  sans éviction. Sur un mois (≤ 9 versions en pratique) on reste sous ~500 Mo ;
  pour une période longue, lancer mois par mois. Taille **L** suffisante.
- **Débit mesuré** : ~23 ms par simulation, soit ~40 min pour un mois de prod
  (100 k simulations) et ~8 h pour une année.

## Tests

```sh
npx vitest run src/jobs/subcategories
```

Les tests couvrent la résolution de période, le nettoyage d'URL, les clés S3, le
catalogue de versions et l'intégrité des fichiers de règles.
