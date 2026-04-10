## Le site Web nosgestesclimat.fr

## C'est quoi ?

Un calculateur d'empreinte climat individuelle de consommation à l'année, utilisant le modèle [nosgestesclimat](https://github.com/incubateur-ademe/nosgestesclimat).

Pour contribuer au modèle, données sous-jacentes et textes du questionnaire (calculs, facteurs d'émission, infos, questions, réponses, suggestions de saisie), [suivez le guide de contribution](https://github.com/incubateur-ademe/nosgestesclimat/blob/master/CONTRIBUTING.md).

Pour tout ce qui touche à l'interface (style d'un bouton, graphique de résultat, code JavaScript, etc.) c'est ici [sur le dépôt du _site_](https://github.com/incubateur-ademe/nosgestesclimat-site-nextjs/issues).

> 🇬🇧 Most of the documentation (including issues and the wiki) is written in French, please raise an [issue](https://github.com/incubateur-ademe/nosgestesclimat-site-nextjs/issues/new) if you are interested and do not speak French.

## Et techniquement ?

Le code utilise Next.js / TypeScript / React / Tailwind CSS, entre autres.

### Installation

#### Pré requis

- [Node.js 22.14.0](https://nodejs.org/fr/download)
- [pnpm](https://pnpm.io/installation)
- Copier le fichier `.env.template`en `.env.local` et récupérer les variables d'environnement nécessaires

#### Lancement

> Ce dépôt ne contient pas les règles de calcul. Le site importe, depuis le [paquet npm `@incubateur-ademe/nosgestesclimat`](https://www.npmjs.com/package/@incubateur-ademe/nosgestesclimat), les règles compilées issues [des fichiers Publi.codes du modèle](https://github.com/incubateur-ademe/nosgestesclimat/tree/master/data).

Pour lancer le site, utilisant le dernier modèle de calcul publié, il suffit de lancer :

```
pnpm install && pnpm dev
```

### Tests

#### Tests end-to-end

Nous utilisons [Playwright](https://playwright.dev/) pour les tests end-to-end.

Pour lancer les tests :

1. lancez le serveur local : `pnpm dev`
2. dans un autre terminal, lancez `pnpm run e2e` pour ouvrir l'interface Playwright.

## Réutilisations de ce code

Attention, même si la licence MIT vous permet de réutiliser ce code à votre guise, en citant clairement le fait que vous reprenez nos travaux, vous ne pouvez pas réutiliser la marque Nos Gestes Climat. [Veuillez lire notre guide de personnalisation](https://accelerateur-transition-ecologique-ademe.notion.site/Personnaliser-Nos-Gestes-Climat-87f3e91110f8460f8089a4f15c870d6b)

This project is tested with BrowserStack.
