# E2E

Boîte à outils des tests end-to-end (Playwright), extraite de `apps/site`.

## Contenu

- `mock/` — serveur mock [MSW](https://mswjs.io) autonome (side-effects
  Brevo/Connect + boîte mail locale) exposé en HTTP via
  [`@mswjs/http-middleware`](https://www.npmjs.com/package/@mswjs/http-middleware).
- `tests/` — la suite Playwright, qui pilote le site en HTTP (boîte noire).
  - `tests/preprod/` — suite exécutée contre la preprod.
- `playwright.config.ts` — configuration Playwright de la suite locale (tout
  `tests/` sauf `tests/preprod`), utilisée par défaut.
- `playwright.preprod.config.ts` — configuration de la suite preprod (projets
  `Preprod *`).
- `playwright.shared.ts` — réglages communs aux deux configurations.

## Lancer les tests en local

Le workflow `.github/workflows/e2e:local.yaml` est la référence de la
stack complète (postgres, redis, mock, serveur API, site, worker). En local,
reproduisez-la sans Docker :

> ⚠️ Les étapes 1 (mock) et 2 (serveur) sont des **processus qui restent
> actifs** : lancez chacun dans un terminal dédié et gardez-les ouverts pendant
> les tests. Sans le mock, la lecture des emails échoue avec un
> `TypeError: fetch failed`.

1. Démarrez le mock (port 3002) :

   ```bash
   pnpm -F @nosgestesclimat/e2e mock
   ```

2. Démarrez le serveur API en mode mock (Brevo/Connect/… redirigés vers le
   mock) :

   ```bash
   pnpm -F @nosgestesclimat/server dev:e2e
   ```

3. Configurez l'adaptateur mailbox, dans `apps/e2e/.env` (copie de
   `.env.template`) :

   ```env
   E2E_MAILBOX=stub
   E2E_MAILBOX_URL=http://localhost:3002
   ```

4. Lancez les tests (le serveur de dev du site est démarré automatiquement,
   avec `apps/site/.env.e2e` préchargé) :

   ```bash
   pnpm -F @nosgestesclimat/e2e test:e2e
   # ou l'interface Playwright :
   pnpm -F @nosgestesclimat/e2e test:ui

   # Suite preprod :
   pnpm -F @nosgestesclimat/e2e test:e2e:preprod --project="Preprod Chrome"
   pnpm -F @nosgestesclimat/e2e test:ui:preprod
   ```

## CI

- `common:e2e.yaml` — exécute sur une stack locale, à chaque PR, les tests
  hors `tests/preprod` (projets `Chrome` et `Firefox`).
- `common:deploy.yaml` (job `e2e-preprod`) — exécute la suite preprod contre
  la preprod (mailbox Brevo), sur `main`, avant le déploiement en production.
  La lecture des logs Brevo passe par un FGP en lecture seule : le var GitHub
  `FGP_BREVO_READONLY_URL` et le secret `FGP_BREVO_READONLY_TOKEN`.
