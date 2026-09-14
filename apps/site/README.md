# Interface utilisateur du site Web nosgestesclimat.fr

Application next.js qui gère le site Web de [nosgestesclimat.fr](https://nosgestesclimat.fr/).

## Installation

Pré-requis :

- [Node.js 24.16.0](https://nodejs.org/fr/download)
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

Les tests end-to-end (Playwright) vivent désormais dans le package `apps/e2e`.
Voir le [README du package e2e](../e2e/README.md) pour les lancer en local.
