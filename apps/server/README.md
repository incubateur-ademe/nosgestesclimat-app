# nosgestesclimat-server

Une application express qui gère l'API de [nosgestesclimat-site-nextjs](https://github.com/incubateur-ademe/nosgestesclimat-site-nextjs).

## Pré-requis

Ce projet utilise [node](https://nodejs.org), [pnpm](https://pnpm.io/), [docker](https://www.docker.com/) et [docker compose](https://docs.docker.com/compose/).

Pour l'utiliser en local, cloner ce repo et créer un fichier .env contenant les variables contenues dans le fichier [`.env.development`](./.env.development).

## Commandes utiles

Installe les dépendances

```bash
pnpm install
```

Lance les services bases de données

```bash
docker compose up
```

Lance les tests (requiert les dépendances)

```bash
pnpm test
```

Builde le projet (requiert les dépendances)

```bash
pnpm build
```

Migre la base de donnée (requiert les dépendances, l'env et les services)

```bash
pnpm db:migrate
```

Lance le service en mode développement (requiert les services, l'env et la migration)

```bash
pnpm dev
```

Lance le service en mode production (requiert le build, les services, l'env et la migration)

```bash
pnpm start
```

## Scalingo

### cli

Il est fortement recommandé d'utiliser la [cli scaligo](https://doc.scalingo.com/tools/cli/start).

Cette dernière permet de

- Se connecter à la base de données
- Lancer des commandes à distance
- Récupérer les logs (même si un token API est plutôt recommandé)

### Base de données

Pour se connecter à la base de données, meci de consulter [la documentation scalingo](https://doc.scalingo.com/databases/about/overview).

Pour une interface graphique, on peut utiliser nimporte quel client SGBD (pgAdmin, Dbeaver, extensions vscode ...).

Une documentation complète de l'utilisation des bases de données par ce projet peut être trouvée dans Notion (Développement / Docs / Base de données). Vous y trouverez de l'aide sur

- Les différents addons scalingo utilisés
- La documentation vivante
- Les utilisateurs base de données et leurs accès
- L'utilisation de metabase
- ...

### Services

L'application utilise des services pour exposer l'API et un autre pour les tâches de fond (worker). La feature pub/sub de redis est utilisé car scalingo ne propose aucun autre service de queue (à part sidekiq pour du ruby)

### Stockage

Scalingo ne proposant pas de solution de stockage, des buckets sont disponibles sur Scaleway et la documentation dans Notion (Développement / Docs / Scaleway).

## Conventions

### Git

- Les commits utililisent [gimoji](https://gitmoji.dev/).
- Chaque PR doit être ouverte vers la branche de `preprod`.
- À chaque release on fait
  - Un commit de version sur préprod (push)
  - Une PR de `preprod` vers `main`
  - Une fois la release merged on merge `main` dans `preprod`
- Toutes les Pull requests sont squash

### Ci/Cd

Une github action `check` vérifie dans chaque PR

- Le lint & le typage
- Les tests
- Le build

L'intégration `scalingo` déploient en préprod au merge dans `preprod` et en prod au merge sur `main`

### Code

#### ORM

l'orm utilisé est `prisma`. Merci de vous référer à [la documentation existante](https://www.prisma.io/docs).

Tout le code relatif à la base de données se trouve dans le répertoire [`prisma`](./prisma) du projet. Vous y trouverez

- Le schéma BDD
- Les migrations
- les scripts exécutés à chaque deploy

#### API

L'API est développée en MVC standard.

- Les controllers sont organisés par features et exposent des routes par version dans l'URL. Ils se chargent d'appeler le code business et de gérer la réponse de manière explicite en fonction du succès ou de l'erreur métier.
- Les services gèrent la logique business
- Les repositories accèdent à la base de données et gèrent les transactions déclenchées par les services au besoin (paramètre `session`)
- Les adapteurs se chargent d'appeler les APIs externes (brevo, connect, matomo ...)
- L'event bus, les évènements et les handlers sont utilisés pour gérer tous les effets de bord. Aucun effet de bord ne doit être trigger depuis les services. Il faut passer par un évènement.

#### Worker & Jobs

Pour tout ce qui est traitement asynchrone, un service worker est disponible.

On se contente d'envoyer un event de l'event bus dans un channel redis comme on l'aurait fait en synchrone. Le worker va traiter l'évènement.

## Intégrations

Ce projet s'intègre avec des partenaires. Des documentations sont disponibles dans Notion (Développement / Docs / Export données simulateur et Portail intégrations).

## Statistiques

Bénéficiant de plusieurs outils de statistiques. Le serveur scrappe les données de la veille sur Matomo pour les mettre en base afin qu'elles soient accessibles via metabase. Là encore des documentations existent dans Notion (Développement / Docs / Import des stats).
