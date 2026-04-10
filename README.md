# Le site Web nosgestesclimat.fr

## C'est quoi ?

Un calculateur d'empreinte climat individuelle de consommation à l'année, utilisant le modèle [nosgestesclimat](https://github.com/incubateur-ademe/nosgestesclimat).

Pour contribuer au modèle, données sous-jacentes et textes du questionnaire (calculs, facteurs d'émission, infos, questions, réponses, suggestions de saisie), [suivez le guide de contribution](https://github.com/incubateur-ademe/nosgestesclimat/blob/master/CONTRIBUTING.md).

Pour tout le reste (style d'un bouton, graphique de résultat, code JavaScript, logique etc.) c'est ici [sur le dépôt du _site_](https://github.com/incubateur-ademe/nosgestesclimat-app/issues).

> 🇬🇧 Most of the documentation (including issues and the wiki) is written in French, please raise an [issue](https://github.com/incubateur-ademe/nosgestesclimat-app/issues/new) if you are interested and do not speak French.

## Et techniquement ?

Le code utilise Next.js, TypeScript, React, Tailwind CSS, PostgreSQL, Redis, entre autres.

## Installation

Pré-requis :

- [Node.js 22.14.0](https://nodejs.org/fr/download)
- [pnpm](https://pnpm.io/installation)

Installez les dépendances du monorepo :

```bash
pnpm install
```

Puis, suivez les instructions d'installation dans les README de chaque application :

- [Serveur API](./apps/server/README.md)
- [Site Web](./apps/site/README.md)

## Commandes utiles

Installe les dépendances

```bash
pnpm install
```

Lance les services bases de données avec devcontainers via [l'extension VSCode](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) (`Cmd+Shift+P` > `Dev Containers: Reopen in Container`) ou via [la ligne de commande](https://github.com/devcontainers/cli) :

```bash
devcontainer up
```

Migre la base de donnée (requiert les dépendances, les .env et les services)

```bash
pnpm -F server db:migrate
```

Lance toutes les applications en mode développement (requiert les services, les .env et la migration)

```bash
pnpm dev
```

Builde toutes les applications (requiert les dépendances)

```bash
pnpm build
```

Lance toutes les applications en mode production (requiert le build, les services, les .env et la migration)

```bash
pnpm start
```

## Réutilisations de ce code

Attention, même si la licence MIT vous permet de réutiliser ce code à votre guise, en citant clairement le fait que vous reprenez nos travaux, vous ne pouvez pas réutiliser la marque Nos Gestes Climat. [Veuillez lire notre guide de personnalisation](https://accelerateur-transition-ecologique-ademe.notion.site/Personnaliser-Nos-Gestes-Climat-87f3e91110f8460f8089a4f15c870d6b)

This project is tested with BrowserStack.
