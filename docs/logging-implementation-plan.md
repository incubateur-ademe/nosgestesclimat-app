# NGC-3817 — Plan d'implémentation

La sémantique, l'API et les choix d'infrastructure sont figés dans
[`logging-validation-principles.md`](./logging-validation-principles.md)
(§5 API, §6 politique DomainError, §7 infrastructure). Ce document liste les
changements concrets, par étape, avec leurs fichiers.

Branche : `feat/improve-logs-NGC-3817`. Périmètre : **core d'abord, frontières
ensuite** ; le legacy (vieux site, `apps/server`) migre au fil de l'eau quand
une PR le touche — `apps/server` reste hors scope (winston inchangé).

Chaque étape est reviewable et déployable indépendamment ; les logs stdout
restent le filet pendant toute la transition.

---

## Étape ① — Contrat core + implémentation pino

Le socle, sans dépendance externe nouvelle (pino est déjà là).

### core (`packages/core`)

- `src/features/logger/index.ts` : nouvelle interface (manuel §5) —
  `child`, `debug/info/warn/error/fatal`, `LogOptions.capture`, types
  `LogLevel`/`LogMeta`/`LogBindings`. **Suppression de `CaptureException`**
  (export + tous les usages).
- `src/exception.ts` : `Exception.level` — `'warning'` → `'warn'`
  (vérifié : `.level` n'est consommé nulle part aujourd'hui).
- `src/lib/to-error.ts` (nouveau) : `toError(unknown): Error` — normalisation
  des `catch (unknown)` aux frontières (manuel §5).
- Services — retirer `captureException` des deps, appliquer la sémantique :
  - `features/actions/services/assess-actions.service.ts`
    - « No rule found with this id » (skip + continue) : `logger.warn('No rule found with this id', { actionId, ruleId })` — anomalie gérée, pas de capture (l'alerte taux prend le relais), et pas d'exception construite pour la seule logger.
    - « Unexpected nodeValue » et catch `engine.evaluate` : `logger.warn(...)` — même nature : l'action est sautée et on continue.
    - Les deux `throw` (aucune action en base / aucune `meta.id`) : inchangés, c'est le filet worker qui les loggue.
  - `features/simulation-computation/services/program-simulation-computation.ts`
    - `UnsupportedModelError` : `logger.warn(exception, { model })` sans capture (mitigation : calcul skipé, service continue).
    - `logger.warn(result.error.name, …)` → `logger.warn(result.error)` sur un logger enfant portant `simulationId` (jamais de message reconstitué).
  - `features/simulations/services/complete-simulation.service.ts`
    - `UnsupportedModelError` : `logger.warn(exception, { model })` sans capture.
    - Side effects en échec : `logger.child({ sideEffect: index }).error(toError(error))`.
  - `features/polls/services/participate-to-poll.service.ts`
    - Échec d'envoi email : `logger.child({ sideEffect: 'pollJoinedEmail', pollId, simulationId }).error(sent.error)` — capture par défaut (email transactionnel perdu = actionnable).
  - `features/polls/stats/legacy/compute-poll-stats.ts`
    - `logger.error('Cannot evaluate dottedName', { dottedName, error })` → `logger.error(toError(error), { dottedName })`.
  - `features/simulation-computation/services/engine-registry.service.ts` :
    appels `debug`/`info` compatibles — vérifier la compilation, rien d'autre.
  - `process-next-pending-computation.service.ts`,
    `process-next-pending-poll-stats.ts` : pas de logger (la boucle worker est
    la frontière) — inchangés.
- Tests :
  - `src/test-utils/logger.ts` (nouveau) : `createTestLogger()` — spies par
    niveau + `child` qui retourne lui-même + `fatal`. Remplace les mocks
    inline `{ error: vi.fn(), … }` et les `noopLogger`.
  - Réécrire les assertions des specs touchées :
    `complete-simulation.service.spec.ts`, `participate-to-poll.service.spec.ts`,
    `assess-actions.service.spec.ts` (formes `error(Error)`, `warn(Error)`,
    plus de `captureException`).

### site (`apps/site`)

- `src/logger.ts` : refondu en `createLogger({ service, level, pretty, onCapture })` :
  - **Bug à corriger** : `error(message, meta)` actuel ne sérialise pas un
    `Error` passé en message. Nouvelle forme :
    `error(err, { meta })` → `pino.error({ …meta, error: serialize(err) }, err.message)`.
  - Sérialiseur discriminant `Exception` / `DomainError` / `Error` (manuel §5),
    appliqué aussi à toute valeur `Error` dans `meta`.
  - Hook `capture` : `options.capture ?? (level === 'error' || level === 'fatal')`
    → `onCapture(errorOriginale)` (jamais la version sérialisée — Sentry a
    besoin du prototype et de la stack).
  - `child` : `pino.child(bindings)`, ré-exposé comme `Logger`.
  - Redaction pino (clés sensibles) + port de `maskEmail` depuis
    `apps/server/src/logger.ts` (manuel §7.6).
  - Sortie stdout inchangée : JSON une ligne, `LOG_LEVEL`, `LOG_PRETTY`.
  - L'export par défaut reste un singleton `service: 'site'`,
    `onCapture: Sentry.captureException` — les imports existants continuent de
    compiler.
  - Le `mixin()` trace_id/span_id arrive à l'étape ③ (l'API OTel est no-op
    sans provider : pas de risque à l'ajouter tôt, mais le test de corrélation
    suit le provider).
- Tests : `logger.spec.ts` — sérialisation (Exception/DomainError/Error/cause
  imbriquée), défauts de capture par niveau, opt-out/opt-in, `child`,
  redaction/PII.

**Vérification ①** : `pnpm -F @nosgestesclimat/core test`,
`pnpm -F @nosgestesclimat/site test`, `pnpm typecheck`, `pnpm lint` — et plus
aucune référence à `CaptureException` dans core.

---

## Étape ② — Frontières site + politique DomainError

### Politique (nouveau module)

- `apps/site/src/services/domain-error-policy.ts` :
  - Table `Record<code, { level: 'silent' | 'info' | 'warn'; context?: … }>`
    — deux colonnes du manuel §6 pour la partie site ; défaut `silent`.
  - `applyDomainErrorPolicy(error: DomainError, ctx: { route: string })` :
    `logger.child({ route, code }).warn(…)` selon la table. C'est le seul
    endroit où un `DomainError` produit un log côté site.

### Server actions (fichiers `'use server'`)

- `services/simulations/complete-simulation.ts` :
  - **Supprimer le double check `progression !== 1`** et le commentaire
    « the caller reports to Sentry » (manuel §4.3 : le message dit 0..1 via le
    schéma, l'opération dit ===1 dans core). Le schéma passe de `v.literal(1)`
    à `ProgressionSchema` ; le type `CompleteSimulationPayload` retrouve sa
    forme simple (plus de `Omit` + commentaire).
  - Retirer `captureException` des deps du service ; appliquer la politique
    sur `result` en échec.
  - Mettre à jour `__tests__/complete-simulation.test.ts` (le test « rejects an
    unfinished simulation without reaching the core service » devient
    « passes through to core, which answers simulation_incomplete »).
- `services/simulations/update-simulation-situation.ts` : appliquer la
  politique ; **supprimer le `TODO: move carbon footprint check to schema`**
  dans le service core — le check porte sur le monde, pas sur le message
  (manuel §4.3), il reste dans core.
- `services/organisations/participate-to-poll.ts` : ajouter le schéma valibot
    (défini dans core, `features/polls/…-payload.schema.ts`, exécuté ici —
    manuel §4.1) + `validatePayload` + politique ; retirer `captureException`
    des deps.
- `actions/newsletters/postNewsletterFormAction.ts` : validation + politique ;
    les `throw` inattendus remontent au filet (§2.6).

### Filets et divers (site)

- `src/instrumentation.ts` :
  - `onRequestError` : logger aussi (nodejs uniquement), en plus du
    `Sentry.captureRequestError` existant.
  - Garde-fous process : `uncaughtException` / `unhandledRejection` →
    `logger.fatal(toError(err))` + `process.exit(1)` (manuel §2.6).
  - Startup : env invalide throw déjà à l'import (`env.server.ts`) — conforme
    (« crash immédiat, pas de service bancal »), rien à ajouter.
- `src/proxy.ts` / `helpers/server/proxy/auth.middleware.ts` (runtime Node,
  manuel §7.1) : remplacer les `captureException` par le logger —
  cas B (cookie corrompu), D (session expirée sans refresh), F (replay limit) :
  `logger.warn(err)` sans capture ; cas G (erreur inconnue de rotation) :
  `logger.error(err)` (capture par défaut).
- `services/auth/get-user-session.ts` : « Malformed x-session header » →
  `logger.warn(err)` sans capture.
- `app/[locale]/(server)/(large)/fin/page.tsx` et
  `app/[locale]/simulateur/(simulator-flow)/(root)/layout.tsx` :
  `captureException(new …Error(), { level: 'warning' })` →
  `logger.warn(err)` **avant** le `redirect()`.
- `services/geolocation/get-geolocation.ts` : `captureException(e, { level:
  'warning' })` → `logger.warn(e)` (fallback région = anomalie gérée).
- `services/simulations/ensure-simulation-model.ts` : →
  `logger.child({ simulationId }).warn(err, { model })` (repair + report).
- Nettoyage edge (manuel §7.1) : supprimer `sentry.edge.config.ts` et la
  branche `NEXT_RUNTIME === 'edge'` de `instrumentation.ts` (vérifier avant
  qu'aucun route handler ne déclare `runtime = 'edge'` — grep déjà fait :
  aucun).

**Vérification ②** : tests site à jour ; en dev, une action avec payload
invalide produit un `warn` structuré (`code`, `route`) et rien dans Sentry ;
une erreur inattendue dans une action produit un `error` + un événement
Sentry ; `grep -r captureException apps/site/src/services apps/site/src/app`
ne montre plus que les cas assumés (triés au fil de l'eau).

---

## Étape ③ — Observabilité OTel : provider, exports PostHog, identité

### Bootstrap partagé

- Deps (site) : `@opentelemetry/api`, `@opentelemetry/sdk-trace-node`,
  `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-logs`,
  `@opentelemetry/api-logs`, `@opentelemetry/resources`,
  `@opentelemetry/exporter-trace-otlp-proto`,
  `@opentelemetry/exporter-logs-otlp-http`, `@opentelemetry/instrumentation`,
  `@opentelemetry/instrumentation-pino` (ou `mixin()` manuel — décision en
  intégration, voir PV-5), `@prisma/instrumentation`.
- `apps/site/src/observability/setup.ts` (nouveau) :
  `initObservability({ service })` —
  - `NodeTracerProvider` : resource `{ service.name, deployment.environment }`,
    `BatchSpanProcessor` + `OTLPTraceExporter` →
    `https://eu.i.posthog.com/i/v1/traces`, `Authorization: Bearer phc_…`,
    sampler paramétrable par env.
  - `LoggerProvider` : `BatchLogRecordProcessor` + `OTLPLogExporter` →
    `https://eu.i.posthog.com/i/v1/logs` (mêmes headers ;
    `Content-Type: application/json`).
  - Propagateur composite : W3C TraceContext **puis** propagateur
    `X-Request-ID` (nouveau, ~20 lignes) : si pas de `traceparent` et un
    `x-request-id` 32-hex valide → contexte distant synthétique
    (`traceId = request_id`). Manuel §7.3 : c'est le contrat déjà publié par
    `infra/nginx` (le collecteur mappe `request_id` → `trace_id` des logs
    nginx).
  - `registerInstrumentations([new PrismaInstrumentation(), …])`.
  - `BaggageSpanProcessor` (nouveau, `onStart`) : recopie les clés baggage
    `posthogDistinctId` / `sessionId` en attributs de span.
  - Garde d'environnement : inactif en dev et en test ; OTLP actif en
    prod/preprod (flag env), stdout toujours actif.
- `src/logger.ts` : le `mixin()` lit `trace.getSpan(context.active())` →
  `trace_id`/`span_id`, et `propagation.getBaggage(context.active())` →
  `posthogDistinctId`/`sessionId`. (Mécanisme déjà validé par le PoC
  `trace_id`/`span_id` ; le baggage suit le même chemin.)

### Câblage

- `src/instrumentation.ts` `register()` (nodejs) : `initObservability({
  service: 'site' })` **avant** tout import instrumenté, puis
  `sentry.server.config` avec `skipOpenTelemetrySetup: true` et
  `tracesSampleRate: 0` (manuel §7.3). Ajouter
  `loggerProvider.forceFlush()` aux hooks `SIGTERM`/`SIGINT` existants.
- Frontières : le wrapper de server action ouvre
  `tracer.startActiveSpan('action:<nom>', …)` avec attributs métier
  (`code` du résultat, ids) — la span racine nginx/Next reste le parent.
- Identité (manuel §7.4) :
  - Client : `posthog.init` — ajouter
    `tracing_headers: [<hostname de NEXT_PUBLIC_SITE_URL>]`
    (posthog-js `^1.428.8` ≥ 1.380 requis : OK).
  - Proxy : lire `X-POSTHOG-DISTINCT-ID` (recoupement seulement — la source
    de vérité du distinctId est la session serveur) et
    `X-POSTHOG-SESSION-ID` ; avec le userId de la session décryptée →
    `propagation.setBaggage(…)` les deux clés.
  - **PV-2** : si le contexte OTel ne survit pas du proxy au handler, plan B —
    le proxy re-forward les valeurs en header interne (pattern `x-session`
    existant) et le wrapper de frontière pose le baggage.

### Env

- `POSTHOG_PROJECT_TOKEN` (server-side, déjà utilisé par l'infra nginx —
  même token `phc_`), `OTEL_TRACES_SAMPLER`/ratio, `LOG_LEVEL`, `LOG_PRETTY`
  inchangés. Endpoints EU dérivés d'une seule variable si possible.

**Vérification ③** : en preprod — une requête passant par nginx produit le
même `trace_id` dans le log nginx PostHog, les logs app, les spans app et les
spans Prisma ; un utilisateur authentifié voit ses logs sur son profil
personne (onglet Logs) et le bouton « View recording » apparaît si replay en
cours ; une erreur Sentry porte `trace_id`/`span_id` recopiables dans
PostHog ; volume d'ingestion mesuré sur une semaine avant d'ajuster le
sampler.

---

## Étape ④ — Worker

- `apps/site/worker/worker.ts` :
  - Sentry réel : `@sentry/node` + `Sentry.init` (DSN, env) — remplace le
    `captureException() {}` / TODO.
  - `initObservability({ service: 'worker' })` (même module partagé qu'à
    l'étape ③) — pas de proxy ni de Next : racines de trace locales.
  - `createLogger({ service: 'worker', onCapture: Sentry.captureException })`.
  - Chaque itération de `loop()` :
    `tracer.startActiveSpan('worker:<name>', …)` + `logger.child({ job, … })` ;
    succès → `info` ; `Result` en échec → politique worker (manuel §6 :
    `error` + capture pour les échecs de job) ; `throw` → `error` + capture
    (filet), puis sleep et continue.
  - Garde-fous : `uncaughtException`/`unhandledRejection` → `fatal` + exit(1) ;
    échec de `warmUpHotEngines` au démarrage → `fatal` + exit(1).
  - `SIGTERM`/`SIGINT` existants : ajouter flush spans + logs avant l'arrêt.
- Core : rien de plus (l'étape ① a déjà retiré `captureException` des deps ;
  le worker ne passe plus que `logger`).

**Vérification ④** : une itération de job produit un `trace_id` unique
couvrant les logs et les requêtes DB ; un échec de calcul apparaît dans
Sentry avec le `trace_id` ; `SIGTERM` flush avant sortie (logs visibles dans
PostHog).

---

## Étape ⑤ — Client (allègement)

- `bilan/_hooks/useCompleteSimulation.ts` et `useAutoSaveSimulation.ts` :
  supprimer `captureException(result.error)` + `setExtra` et les commentaires
  associés (« lands in Sentry below ») — l'objet désérialisé n'a ni prototype
  ni stack, le serveur a déjà loggé selon la politique (manuel §2.5). L'UX
  d'erreur existante ne change pas.
- `captureMessageForSentryAndPosthog` (captures sans stack fabriquées) :
  remplacer les usages (`getSubcategories`, `useCategories`, `useEngine`) par
  des logs client PostHog (`posthog.logger` / `captureLog`, config `logs` de
  posthog-js — `distinct_id` et `session_id` attachés automatiquement) ou des
  événements PostHog explicites selon la nature. Supprimer le helper.
- `captureErrorForSentryAndPosthog` : conservé **uniquement** pour les vraies
  exceptions client inattendues (ErrorBoundary, global-error, handlers UI) —
  documenter ce rôle dans le fichier.
- Optionnel : config `logs: { serviceName: 'site-web', environment }` dans
  `posthog.init` si on active les logs client.

**Vérification ⑤** : plus aucune capture Sentry client sur un `Result`
désérialisé ; les warns client apparaissent dans PostHog liés à la personne.

---

## Points à valider en intégration (PV)

1. **PV-1 — Sentry sans son provider** : avec `skipOpenTelemetrySetup: true`
   et `tracesSampleRate: 0`, les événements erreur portent-ils bien
   `trace_id`/`span_id` du contexte OTel actif ? (Test : capture dans une
   span, assertion sur `contexts.trace`.)
2. **PV-2 — Continuité proxy → handler** : le baggage posé dans `proxy.ts`
   survit-il jusqu'au handler/action (même contexte async sous Next 16) ?
   Sinon, plan B headers internes + baggage posé par le wrapper.
3. **PV-3 — `tracing_headers` sur les server actions** : les POST d'actions
   Next (fetch RSC) passent-ils par le `fetch` global patché par posthog-js
   (headers `X-POSTHOG-*` présents) ?
4. **PV-4 — Propagateur `X-Request-ID`** : comportement aux limites —
   valeur non-hex ou tronquée (ignorer, racine locale), doublon avec
   `traceparent` (W3C gagne), review apps sans nginx (racine locale).
5. **PV-5 — Pont pino → OTel Logs** : `@opentelemetry/instrumentation-pino`
   (corrélation auto + émission vers le LoggerProvider global) vs `mixin()` +
   transport dédié. Critères : une seule source de vérité pour trace_id, pas
   de double émission stdout/OTLP, compatible `LOG_PRETTY` en local.
6. **PV-6 — Noms d'attributs PostHog** : `posthogDistinctId` / `sessionId`
   sur les log records ET les spans — vérifier le lien personne + « View
   recording » sur le projet EU réel.
7. **PV-7 — Volume d'ingestion** : traces 100 % commandes + worker, logs sans
   `debug` en prod — mesurer la première semaine, ajuster sampler/`LOG_LEVEL`.

## Ops (jour 1, pas après)

- Alertes PostHog : taux de `warn` par `(route, code)` + apparition de nouveau
  motif — **avec responsable nommé** (manuel §2.3, §6).
- Dashboards : volume par niveau/service ; taux d'erreurs par code.
- Vérifier `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` identique sur toutes les
  instances (déjà au `.env.template`) — sinon `Failed to find Server Action`
  aléatoires au déploiement.
- Documenter la recherche par `trace_id` (Sentry → PostHog) dans le runbook.

## Non-goals

- Migration d'`apps/server` (winston) — legacy, hors scope.
- Tri exhaustif des `captureException` legacy du site — au fil de l'eau,
  le manuel sert de référence à chaque PR qui les touche.
- Sentry Performance / spans RSC par composant / liaison navigateur→serveur
  par propagation de trace (manuel §7.5).
- `posthog-node` comme exporteur de logs (l'OTLP standard le remplace).
