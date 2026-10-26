# E2E

Boîte à outils des tests end-to-end (Playwright), extraite de `apps/site`.

## Contenu

- `mock/` — serveur mock [MSW](https://mswjs.io) autonome (side-effects
  Brevo/Connect + boîte mail locale) exposé en HTTP via
  [`@mswjs/http-middleware`](https://www.npmjs.com/package/@mswjs/http-middleware).
- `tests/` — la suite Playwright, qui pilote le site en HTTP (boîte noire).
  - `tests/preprod/` — suite exécutée contre la preprod.
  - le reste (`tests/features/`…) — suite locale : chaque test est isolé et
    crée ses propres données en base via les factories/services de
    `@nosgestesclimat/core`, puis se connecte avec `helpers/session.ts`
    (session émise par core, posée en cookie) sans passer par le code de
    vérification.
- `playwright.config.ts` — configuration Playwright de la suite locale (tout
  `tests/` sauf `tests/preprod`), utilisée par défaut.
- `playwright.preprod.config.ts` — configuration de la suite preprod (projets
  `Preprod *`).
- `playwright.shared.ts` — réglages communs aux deux configurations.

## Structure

La suite est découpée en deux : une partie **commune** aux deux suites (locale
et preprod), et une partie **propre à chaque suite**.

### Commun

- `tests/pages/` — classes page object (User, Group, Organisation, Poll,
  NGCTest, TutorialPage, CookieBanner, UserSpace, FeatureFlags). Sans état,
  sans fixture : des classes pures qui prennent une `Page` en constructeur.
- `tests/helpers/` — helpers purs (hydration, clipboard, session,
  user-mailbox…).
- `tests/fixtures/` — base commune : `hydrationGuard` (auto), `visibleTestId`
  (patch `page`), drapeaux par défaut (auto), plus `createPage` et
  `DEFAULT_FLAGS`.

### Suite locale uniquement

- `tests/local/fixtures.ts` — ré-exporte la base commune, fournit
  `localVisitorState` (bandeau cookies refusé, pas de session).
- `tests/features/` — specs locaux : chaque test crée ses données en base via
  les factories de `@nosgestesclimat/core`, puis se connecte avec
  `helpers/session`.

### Suite preprod uniquement

- `tests/preprod/fixtures/` — fixtures avec état (user, group, organisation,
  poll, scolairePoll) qui restaurent depuis l'état enregistré, plus les fixtures
  page object (ngcTest, tutorialPage, cookieBanner, userSpace), l'option
  `setup`, le garde static-assets, et les helpers save/restore
  (`context.ts`).
- `tests/preprod/state/` — états enregistrés (fichiers JSON `storageState`)
  écrits par le projet setup.
- `tests/preprod/setup/` — setup global qui enregistre les états.
- `tests/preprod/features/` et `tests/preprod/pages/` — specs preprod.

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

   Pour la suite locale, ajoutez aussi la base et la clé de session **du site
   testé** (mêmes valeurs que `apps/site/.env`) :

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ngc
   SESSION_ENCRYPTION_KEY=…
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
