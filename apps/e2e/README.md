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

- `tests/page-objects/` — classes page object (User, Group, Organisation,
  Poll, NGCTest, TutorialPage, CookieBanner, UserSpace, FeatureFlags). Sans
  état, sans fixture : des classes pures qui prennent une `Page` en
  constructeur.
- `tests/helpers/` — helpers purs (hydration, clipboard, session,
  user-mailbox…).
- `tests/fixtures/` — base commune : `hydrationGuard` (auto), `visibleTestId`
  (patch `page`), drapeaux par défaut (auto), plus `createPage` et
  `DEFAULT_FLAGS`.

### Suite locale uniquement

- `stack/` — orchestration des stacks par worker (bases, copies du build,
  processus), lancée par le `globalSetup` de `playwright.config.ts`.
  `stack/worker-env.ts` pointe chaque worker sur sa base et son site.
- `tests/local/fixtures.ts` — la base commune, plus le reset de la base du
  worker avant chaque test (`tests/local/database.ts`, option
  `resetDatabase`), et `localVisitorState` (bandeau cookies refusé, pas de
  session).
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

Chaque worker Playwright a sa propre stack : une base
`ngc_e2e_<i>`, un serveur API (port `3200+i`), un site (port `3100+i`) et un
worker du site. Le `globalSetup` de la suite locale (`stack/global-setup.ts`)
les prépare et les démarre, puis les arrête en fin de run :

- il migre la base modèle `ngc_e2e_template`, puis recrée chaque
  `ngc_e2e_<i>` à partir d'elle ;
- il copie le build du site (`apps/site/.next`) dans
  `apps/site/.next-e2e-<i>`, en y remplaçant les URL inlinées au build
  (`localhost:3000` → `localhost:310i`, `localhost:3001` → `localhost:320i`).
  Une copie déjà patchée pour le même build est réutilisée ;
- avant chaque test, la base du worker est vidée : rien n'est seedé, chaque
  test crée ses données (actions comprises) avec les factories de core.

Le mock (port 3002) est démarré par Playwright et partagé entre les workers.
Les logs sont écrits dans `apps/e2e/logs/` : `<app>-<i>.log` pour les stacks,
`mock.log` pour le mock. Un processus qui s'arrête en cours de route met fin
au run, sans relance : c'est une erreur à corriger, son log en donne la cause.

Prérequis : Postgres et Redis en local.

1. Configurez `apps/e2e/.env` (copie de `.env.template`) :

   ```env
   E2E_MAILBOX=stub
   E2E_MAILBOX_URL=http://localhost:3002
   E2E_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
   SESSION_ENCRYPTION_KEY=…
   ```

   `E2E_DATABASE_URL` est l'URL d'administration de l'instance Postgres : les
   bases e2e sont créées à côté. `SESSION_ENCRYPTION_KEY` doit être la même que
   celle du site (`apps/site/.env`).

   > ⚠️ Si votre `.env` date d'avant les stacks par worker, retirez-en
   > `DATABASE_URL` et `NEXT_PUBLIC_SITE_URL` : ils sont désormais dérivés pour
   > chaque worker. Une base autre que `ngc_e2e_<i>` n'est de toute façon jamais
   > vidée (le reset vérifie la base courante).

2. Buildez le site, une fois par changement du site (il migre aussi la base
   modèle, que le build interroge) :

   ```bash
   pnpm -F @nosgestesclimat/e2e build:site
   ```

3. Lancez les tests :

   ```bash
   pnpm -F @nosgestesclimat/e2e test:e2e --project=Chrome
   # ou l'interface Playwright :
   pnpm -F @nosgestesclimat/e2e test:ui
   ```

   Le nombre de workers (donc de stacks) vaut 3 par défaut : `E2E_WORKERS` ou
   `--workers` le changent.

   Pour itérer sur le site sans rebuild, `E2E_SITE_MODE=dev` lance une seule
   stack, avec `next dev` sur le port 3100. Il utilise `.next` comme votre
   `pnpm dev` : arrêtez celui-ci avant de lancer les tests.

   ```bash
   E2E_SITE_MODE=dev pnpm -F @nosgestesclimat/e2e test:e2e --project=Chrome
   ```

   Si un run précédent a été tué, ses processus peuvent encore occuper les
   ports : le `globalSetup` les signale, arrêtez-les avant de relancer.

4. Suite preprod (avec `NEXT_PUBLIC_SITE_URL` pointant sur la preprod) :

   ```bash
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
