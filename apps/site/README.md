# Interface utilisateur du site Web nosgestesclimat.fr

Application next.js qui gère le site Web de [nosgestesclimat.fr](https://nosgestesclimat.fr/).

## Installation

Pré-requis :

- [Node.js 22.14.0](https://nodejs.org/fr/download)
- [pnpm](https://pnpm.io/installation)

```bash
pnpm install

cp .env.template .env

# Puis, ajoutez manuellement les variables d'environnement et secrets requis dans le fichier .env
```

## Lancement

Pour lancer le site, utilisant le dernier modèle de calcul publié, il suffit de lancer :

```bash
pnpm -F site dev
```

## Tests

### Tests end-to-end

Nous utilisons [Playwright](https://playwright.dev/) pour les tests end-to-end.

Pour lancer les tests :

1. lancez le serveur local : `pnpm -F site dev`
2. dans un autre terminal, lancez `pnpm -F site e2e` pour ouvrir l'interface Playwright.
