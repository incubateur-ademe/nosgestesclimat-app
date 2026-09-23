# Manuel : erreurs, logs et validation

Pense-bête pour toute nouvelle fonctionnalité. Arrêté le 22 septembre 2026 (NGC-3817) ; §5–7 ajoutés le même jour (API, politique, infrastructure — voir le plan d'implémentation `logging-implementation-plan.md`).
En cas de doute, la règle fait foi — pas l'habitude, et pas le code voisin.

---

## 1. La seule question : de quelle nature est cet échec ?

Trois natures, dans l'ordre où il faut se les poser :

1. **Est-ce que ça se produit dans un usage correct ?** → nominal.
2. Sinon, **le système s'en remet-il, ou l'impact reste-t-il borné ?** → anomalie.
3. Sinon, **quelqu'un doit-il agir maintenant ?** → cassé.

Le critère de la troisième question n'est pas « est-ce notre code ? » mais « faut-il une intervention humaine ? » — un correctif, un quota épuisé, une base injoignable après épuisement des retries. Si personne n'agit, ce n'est pas un échec cassé, c'est un log. C'est ce qui garde Sentry actionnable.

| Nature | Ce que ça veut dire | Comment ça circule | Niveau par défaut | Capture |
|---|---|---|---|---|
| **Nominal** | cas prévu par le métier, qui se produit normalement | retourné dans le `Result` | `info`, ou rien | non |
| **Anomalie** | ne devrait pas se produire : défaut en amont, ou échec rattrapé (retry, fallback) | retourné dans le `Result`, ou reprise après rattrapage | `warn` | non — alerte sur taux |
| **Cassé** | le monde n'est plus celui que le code suppose | `throw` | `error` / `fatal` | oui |

Ces niveaux sont des **défauts**. Qui peut s'en écarter, et comment, est défini au chapitre 2.

*Exemples.* `poll_not_found` atteint via un lien de partage périmé : usage normal, nominal — rien, ou un `info` d'audit.
`simulation_incomplete` à la complétion : un client correct ne produit jamais ça. C'est une anomalie — `warn` avec le contexte, et une alerte sur taux. La traiter comme nominale reviendrait à rendre invisible un défaut du client ; la capturer à chaque occurrence noierait Sentry.
`zero_footprint`, le calcul côté client ayant produit 0 : même raisonnement, anomalie.

### 1.1 La capture est une conséquence du niveau, pas un canal concurrent

`error` et `fatal` logguent **et** capturent. Une erreur cassée produit donc une ligne de log *et* un événement Sentry, reliés par le même `trace_id`.

C'est le but : on ouvre le ticket, on cherche le `trace_id` dans les logs, on lit le contexte. **Les logs contiennent toutes les erreurs, capturées ou non.**

L'option `capture` est une **soupape**, pas un knob : s'écarter du défaut (`false` sur un `error`/`fatal` — un autre filet capture déjà la même erreur ; `true` sur un `warn` — anomalie qu'on veut voir dans Sentry le temps d'un correctif) exige un commentaire de justification sur le site d'appel. Les deux axes restent orthogonaux : le niveau décrit la sévérité, `capture` le routage — les souder ferait mentir les niveaux le jour où le routage gêne.

---

## 2. Les frontières

**Vocabulaire.** Les termes employés ici, ancrés sur le dépôt :

| Terme | Où |
|---|---|
| **client** | `apps/site/src/**` marqué `'use client'` — composants, hooks, état publicodes. Il reçoit les `Result` désérialisés. |
| **server action**, ou **service site** | `apps/site/src/**`, fichier marqué `'use server'`. Le point d'entrée appelé par le navigateur — et, dans ce dépôt, le service site lui-même : le même fichier instancie le service core. |
| **service core** | `packages/core/src/features/**`. La logique métier ; retourne des `Result<_, DomainError>`. |
| **worker** | `apps/site/worker/worker.ts`. La boucle qui consomme les jobs. |
| **frontière** (*boundary*) | le seul terme sans dossier, parce qu'il couvre deux réalités : la **server action** et la **boucle du worker**. C'est l'endroit le plus externe qui traite une demande ou un job. |

### 2.1 Chaque couche ne décide que de ce qu'elle est seule à savoir

| Où | Ce qu'on y décide |
|---|---|
| **service core** | son lifecycle (`info`), ses échecs rattrapés (`warn` + `Error`), ses échecs cassés (`throw`). Core ne loggue pas les `DomainError` qu'il retourne : c'est la frontière qui le fait, si la politique le prévoit. |
| **frontière** | le log du `DomainError` qu'elle traite (§6), et le rattrapage des `throw`. |
| **client** | l'affichage. Ni log serveur, ni capture. |

### 2.2 L'escalade au-dessus du défaut appartient à la frontière

Elle est permise, mais **seulement à la frontière**, et **seulement de façon explicite** — à côté de l'action, jamais par un appel de logger ad hoc.

**Pourquoi.** Le même code ne veut pas dire la même chose partout. `simulation_completed` venant d'un double-clic est nominal ; le même code venant d'un client périmé qui rejoue une action est une anomalie. Le contexte, seule l'action le connaît.

Ce qui reste interdit, c'est de logguer là où l'échec se constate : la décision de le signaler s'écrit à la frontière, à côté de l'action.

### 2.3 Les anomalies se pilotent au taux, pas à l'unité

`warn` structuré, avec `ngc.scope` et `error.type` en attributs → PostHog → alerte sur taux ou sur nouveau motif, **avec un responsable nommé, configurée dès le premier jour**.

**Pourquoi.** Le besoin n'est pas d'être réveillé pour une requête, c'est de savoir que ça arrive et à quelle fréquence — par exemple détecter que le client fausse le calcul depuis telle release. Une capture par occurrence noie les vrais bugs ; un tableau de bord sans alerte ne sert à rien.

### 2.4 Le message d'un `DomainError` s'adresse à l'utilisateur

C'est un texte affiché, pas un diagnostic. Aucun détail interne — SQL, stack, identifiant sensible — n'y transite ; les détails vont dans le log serveur.

### 2.5 On capture côté serveur, jamais côté client sur l'objet reçu

**Pourquoi.** Seules des données traversent la frontière. Le `code` survit ; le prototype, les méthodes et généralement la stack, non. Le client reçoit un objet amputé : le capturer reviendrait à capturer sans stack, donc sans intérêt.

Retourner l'erreur à la vue *et* la logger côté serveur n'est pas un double traitement : la frontière décide une fois du niveau, puis diffuse vers deux destinations.

### 2.6 On loggue là où l'échec est traité

Un `throw` n'est jamais loggué sur son site. Il est rattrapé au plus externe de chaque runtime, et c'est là qu'il est loggué : le faire aux deux endroits, c'est traiter deux fois le même événement.

Un échec rattrapé en chemin est loggué à l'endroit où il est rattrapé.

Trois filets, jamais des try/catch dispersés :

1. **Frontière contrôlée** — server action ou boucle worker, lorsqu'on veut répondre proprement : `error` + capture, puis réponse générique sans fuite de détails. Les `DomainError` du `Result` n'y passent pas.
2. **`onRequestError`** (Next.js, déjà câblé sur Sentry) — filet des Server Components, Server Actions et Proxy. À étendre pour logger également, avec le `trace_id`.
3. **Garde-fous process** (`uncaughtException`, `unhandledRejection`) — à mettre en place : `fatal` + capture + arrêt du process. On laisse l'orchestrateur redémarrer un process sain plutôt que de servir dans un état inconnu. Même logique au démarrage : base injoignable → `fatal` et crash immédiat, pas de service bancal.

Un wrapper ne sert pas à logger les `throw` — le filet 2 le fait déjà. Il sert à contrôler la réponse, et à appliquer la politique des `DomainError` (§6).

*Note.* En Server Components, React peut substituer à l'erreur d'origine une erreur portant un `digest`, sans stack. C'est attendu : le `digest` sert précisément à retrouver l'erreur côté serveur.

---

## 3. Les niveaux

| Niveau | Quand | Porte un `Error` ? | Capture |
|---|---|---|---|
| `debug` | diagnostic de développement, jamais en production | non | non |
| `info` | événement large : une ligne riche par requête ou par job (ce qui est arrivé, avec son contexte), pas une étape de code | non | non |
| `warn` | anomalie : défaut en amont, ou échec rattrapé. « À surveiller, pas à réparer » | oui, quand on l'a | non |
| `error` | échec qui compte : inattendu, ou mitigation épuisée | **toujours** | oui |
| `fatal` | le service ne peut plus continuer ; suivi d'un arrêt du process | **toujours** | oui + alerte |

Les **étapes** d'un traitement vivent en `debug`, activé à la demande : c'est ce
qui garde le volume exploitable — les logs sont facturés au volume, et une boucle
qui tourne toutes les deux secondes noie les événements qui comptent
(recommandation PostHog pour les logs OTLP). Un service qui démarre loggue donc
son bilan en `info` (ce qui a été construit, combien, avec quelles ressources) et
le détail de chaque étape en `debug`.

### 3.1 `error` et `fatal` portent toujours un `Error`

Un message seul n'est jamais une erreur — c'est un `info` ou un `warn`.

**Pourquoi.** Sans stacktrace, on ne peut ni localiser ni dédupliquer. Le typage doit rendre l'usage impossible, pas seulement déconseillé.

### 3.2 Une erreur rattrapée sans conséquence est un `warn`, pas un `error`

Le niveau décrit ce que l'événement exige de nous, pas son intensité émotionnelle.

**Exemple — retry.** `warn(err, { meta: { attempt, maxAttempts } })` pendant les tentatives : la stack est dans le log, rien n'est capturé. À l'épuisement, l'échec devient cassé et on `throw` — la frontière loggue `error` et capture. On passe toujours l'`Error` elle-même, jamais un message reconstitué.

---

## 4. La validation

### 4.1 Toute action à effets de bord valide son payload

Les lectures pures restent légères : un identifiant, un slug.

**Critère.** On valide là où une entrée invalide peut faire des dégâts — et non « tout valider partout ».

Le schéma est **défini dans core**, pour être partagé avec le worker et les tests, et **exécuté à la frontière**, qui est le vrai point d'entrée.

### 4.2 Ce que le serveur établit fait foi ; ce qu'il reçoit est validé

L'identité et la session sont établies côté serveur, jamais lues dans le payload. Tout ce que le client transmet passe par le schéma.

**Pourquoi.** Le serveur ne voit que des octets : il ne peut pas observer un contrôle exécuté dans le navigateur. La validation côté formulaire relève donc de l'expérience utilisateur — feedback immédiat — et non de la confiance. Un client parfait ne supprime pas le contrôle dans la server action : il change sa fréquence, pas sa nécessité.

**Ce que la validation ne fait pas.** Elle protège de la **dérive**, pas de l'**attaque**.

- La dérive est sans malveillance : notre propre client d'il y a une semaine, un onglet ouvert depuis trois jours, une page en cache, un bug qui envoie `null`. Le contrat est rompu, et c'est constant.
- L'attaque — requête forgée, contournement volontaire — relève d'autre chose : autorisation, limitation de débit, WAF. Un payload forgé mais bien formé passe la validation *par construction*.

Lui demander de faire de la sécurité, c'est la sous-dimensionner comme contrat et se croire protégé à tort.

*Note.* Les identifiants d'actions Next.js sont recalculés à chaque build : un onglet périmé est rejeté proprement (`Failed to find Server Action`), il ne bascule pas silencieusement sur une nouvelle signature. La dérive réelle passe par les **valeurs** — état persisté ayant survécu au déploiement, identifiant tiré d'une ancienne URL — et par les requêtes POST directes.

### 4.3 La server action valide le message ; le service core valide l'opération

Deux questions distinctes, qui peuvent porter sur le même champ :

- **Le message** — ce que le client a envoyé est-il exploitable ? Types, plages de valeurs, formats, énumérations. Vérifié dans la **server action**, par schéma.
- **L'opération** — cette transition est-elle légale au vu de l'état ? Existence, appartenance, statut. Vérifiée dans le **service core**.

**Test.** La règle porte-t-elle sur le **message**, ou sur le **monde** ?

**Exemple.** `progression` : « un nombre entre 0 et 1 » est une propriété du message, donc du schéma. « Elle vaut 1 pour qu'on puisse terminer la simulation » est une propriété de l'opération, donc du service core. Les deux sont décidables sans I/O ; seule la première appartient à la server action.

Un schéma valibot est pur et synchrone : il ne peut pas savoir si la simulation existe, ni si elle appartient à cet utilisateur. À l'inverse, rien n'interdit — et c'est souhaitable — qu'il porte une contrainte métier (`footprint` non négatif, modèle connu).

Le service core est atteignable par plusieurs chemins — le site, le worker, un futur CLI. C'est donc lui qui vérifie la précondition, une seule fois, et le `code` retourné informe tous les appelants de la même façon.

---

## 5. L'API `Logger`

Le contrat vit dans core (`features/logger/index.ts`) ; les implémentations vivent dans les apps.

```ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * Attributs de la ligne : jamais de PII ni de payload métier (§7.6), et des
 * scalaires de préférence — un objet finit en JSON texte, donc peu requêtable.
 */
export type LogMeta = Record<string, unknown>

/** Contexte statique fusionné dans chaque ligne du logger enfant. */
export type LogBindings = Record<string, unknown>

export interface LogOptions {
  /**
   * Envoi vers Sentry. Défaut : true pour error/fatal, false sinon.
   * S'écarter du défaut exige un commentaire de justification (§1.1).
   */
  capture?: boolean
}

export interface Logger {
  child(bindings: LogBindings): Logger
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  warn(message: string | Error, meta?: LogMeta, options?: LogOptions): void
  error(error: Error, meta?: LogMeta, options?: LogOptions): void
  fatal(error: Error, meta?: LogMeta, options?: LogOptions): void
}
```

Appels types :

```ts
logger.info('job processed', { currentMemory: currentMemoryMB() })
logger.error(err, { pollId, simulationId })               // capture par défaut
logger.warn(err, { attempt: 2, maxAttempts: 5 })         // retry : stack logguée, rien de capturé
logger.warn(err, { route }, { capture: true })           // justifié par commentaire (§1.1)
```

Règles de conception, chacune conséquence d'un chapitre précédent :

- **`meta` en deuxième position, les options en troisième** : le cas courant — `logger.error(err, { pollId })` — s'écrit sans objet imbriqué, et `capture` reste hors du sac d'attributs, donc impossible à écraser par un attribut métier.
- **`error`/`fatal` exigent un `Error`** (§3.1). Pas de surcharge `string` : un message seul n'est jamais une erreur. `DomainError` étend `Error` — le type le couvre sans coupler l'interface à la taxonomie du domaine. Une seule famille d'erreurs métier : `code`, ses champs, et rien d'autre.
- **`warn` accepte `string | Error`** (§3.2) : le cas retry passe l'`Error` elle-même — la stack reste dans le log, sans capture. Jamais de message reconstitué à partir d'une erreur, et **jamais d'erreur fabriquée pour la logger** : à l'endroit où l'anomalie est constatée, un message et ses attributs suffisent — l'`Error` n'a de valeur que rattrapée, parce que sa stack dit d'où elle vient.
- **`child(bindings)` retourne un `Logger`** — l'interface, pas le type pino. Les bindings sont le contexte statique partagé par plusieurs lignes d'une même portée (service, route, job, ids de la requête ou de la boucle) ; **pour une ligne isolée, la `meta` suffit** : un `child` créé pour un seul appel ne fait que déplacer le contexte. Le `trace_id` ne passe **jamais** par `child` : c'est OTel qui l'injecte (§7.3).
- **La capture est portée par l'implémentation**, pas par les services : `captureException` disparaît des dépendances de core. Un service core ne reçoit que `logger`.
- **Sérialisation** (côté implémentation) : les **attributs exportés** sont **aplatis** — les objets d'une `meta` deviennent des clés pointées, `currentMemory.rssMB` — au moment de l'export, pas dans la fabrique : le JSON qui part sur stdout garde sa forme imbriquée, qu'un aplatissement abîmerait (`a.b` et `a: { b }` fusionneraient en une seule clé). L'`Error` passée à `error()`/`fatal()` prend les noms qu'OTel définit pour une exception de log : `exception.type`, `exception.message`, `exception.stacktrace` (chaîne des `cause` ajoutée).
  Ses propriétés propres suivent : `code` devient
  `error.type` (le nom semconv pour la classe d'erreur), et les champs que la
  classe déclare passent sous `ngc.`. Aucune erreur ne porte son niveau : c'est
  la frontière qui le décide (§6). Ne jamais s'appuyer sur `toJSON()` (qui ne
  garde que `code` pour `ErrorWithCode`). Une seconde erreur se lie par
  `cause`, jamais par la `meta` : celle-ci ne contient pas d'`Error`, et si l'une
  s'y glisse malgré tout, l'export l'écrit sous une seule clé — sa stack.
- **Le message d'une `error()` est celui de l'`Error`** : il n'y a pas de libellé libre à côté. Ce qu'un message portait autrefois (« Failed to send poll joined email ») est du contexte statique : il va dans un binding de `child` (`{ sideEffect: 'pollJoinedEmail' }`), donc en attribut filtrable.
- **Normalisation** : `toError()` s'applique à un `catch (unknown)` ou à une promesse rejetée, pas à une valeur déjà typée `Error` — un `Result<_, EmailRequestError>` en porte déjà une.

---

## 6. Le `DomainError` à la frontière

Core ne loggue jamais un `DomainError` : il le retourne. C'est la frontière qui
décide — **au cas par cas, à l'endroit où elle le traite** — s'il mérite une
ligne, et à quel niveau. Le `code` est un attribut de la ligne, pas une
politique : le même code peut être silencieux ici et bruyant là (§2.2).

Les trois natures de §1 suffisent à trancher :

- **nominal** — un lien de partage périmé, une coalescence : rien, ou un `info`
  d'audit. Une simulation absente n'apprend rien à personne.
- **anomalie** — un payload invalide, une complétion rejouée par un onglet
  périmé : `warn`, `code` en attribut, alerte sur taux (§2.3).
- **cassé** — un calcul front qui produit un bilan nul et fait refuser la
  sauvegarde, une simulation persistée sans modèle valide : `error`, donc
  capturé, avec la stack.

Ce n'est pas la régularité entre codes qui compte, mais que la décision soit
lisible **là où elle est prise** : quelques lignes dans l'action, pas une table
à tenir à jour ailleurs.

Une itération de worker qui échoue n'est pas `fatal` : la boucle l'isole — le
job est marqué en échec en base — et le process reste sain. `fatal` est réservé
aux garde-fous process et aux échecs de démarrage, seuls cas où l'état du
process n'est plus fiable.

---

## 7. Infrastructure (choix arrêtés)

### 7.1 Un seul runtime : Node

Next.js 16 exécute le proxy (`proxy.ts`, ex-middleware) sur le runtime Node — il n'y a plus aucun runtime edge dans l'app. Le logger pino est utilisable partout, y compris dans le proxy. `sentry.edge.config.ts` et la branche `NEXT_RUNTIME === 'edge'` de `instrumentation.ts` sont du code mort : à supprimer.

### 7.2 Logs : pino → stdout + PostHog

- **pino** est l'unique implémentation du `Logger`, partagée site et worker via une factory `createLogger({ service, onCapture, … })`. JSON une ligne sur stdout (drain Scalingo, inchangé) **et** pipeline OTel Logs → PostHog.
- Export OTLP : `https://eu.i.posthog.com/i/v1/logs`, `Authorization: Bearer <token projet phc_>` (PostHog EU — même projet que les logs nginx existants, cf. `infra/nginx/`). Le pont pino → OTel est notre propre émission (`observability/log-bridge.ts`) plutôt qu'une brique toute faite : une seule source de vérité pour le `trace_id` (le mixin, pas un second mécanisme), des attributs plats donc requêtables, et une portée par ligne — `pino-opentelemetry-transport` crée **un** logger par transport, donc une seule portée pour tout le process, et `@opentelemetry/instrumentation-pino` ne génère aucun attribut de semconv (`exception.*` compris) et patche le module `pino`, donc ne couvre ni le serveur (winston) ni le mock des tests. Le socle reste le SDK officiel : l'API des logs (`logs.getLogger(name).emit(record)`), `LoggerProvider`, `BatchLogRecordProcessor` et l'exporteur OTLP.
- **Pas de flush par action** : Scalingo exécute des process longue durée, le `BatchLogRecordProcessor` (~5 s / 64 entrées) fait le travail après la réponse. Le pattern `after(() => forceFlush())` de la doc PostHog vise le serverless. Flush uniquement : `SIGTERM`/`SIGINT` (site et worker) et avant `process.exit(1)` sur `fatal`.

### 7.3 Traces : provider OTel à nous, PostHog comme backend

- **Un `NodeTracerProvider` à nous**, enregistré dans `instrumentation.ts` — pas celui de Sentry. Raison : les traces vont dans PostHog ; ne garder Sentry comme instrumenteur serait payer le couplage vendor pour un produit qu'on ne consomme plus.
- Sources de spans : **Next.js natif** (`BaseServer.handleRequest`, `render`, `fetch` — Next émet ses spans via `@opentelemetry/api` dès qu'un provider est enregistré), **nos opérations** (`withSpan` ouvre une span nommée par le composant, y lie le logger et la ferme : deux opérations imbriquées donnent deux spans, chacune sa durée ; span par itération worker), **nos side effects** (`runSideEffect` instrumente la tâche différée sous `core.sideEffect.<nom>`, ouverte au démarrage du travail et non à sa mise en file), **`PrismaInstrumentation`** (requêtes DB, contexte propagé via l'adapter pg).
- **Le worker ne déclare pas de composant** : son unité de travail est le job, porté par l'attribut `job` (`ngc.job`), et ses lignes propres — démarrage, mémoire, arrêt — ont la portée du service (`worker`).
- **`withSpan` est un contrat core**, comme `Logger` : core déclare ce qui mérite une span — un side effect, un service qui fait de l'I/O ou du calcul — et reçoit le tracer du runtime. Core ne connaît toujours pas OpenTelemetry.
- **Le logger arrive en paramètre nommé**, pas en position : `withSpan('site.service.x', async ({ logger, ...payload }) => …)` rend une fonction de même signature : les champs de l'appel restent au premier niveau, et le logger s'ajoute à côté d'eux. Les services du site qui font un appel, une attente ou un geste produit passent par lui (`site.service.*`), les actions de formulaire aussi (`site.action.*`) ; `ensureSimulationModel` reste volontairement dehors — c'est une garde qui retourne presque toujours immédiatement, son rare appel réseau est déjà tracé.
- **On instrumente une opération, pas chaque helper.** Ce qui mérite une span : une frontière (action, itération de worker), un service qui fait un appel externe, du calcul ou de l'attente — et un side effect, qui vit de toute façon hors de la requête. Le reste déclare un composant et s'arrête là. Le nombre de spans dans une cascade est le prix de la lisibilité : mieux vaut dix spans qui se lisent que cinquante qui se comptent.
- Export OTLP : `https://eu.i.posthog.com/i/v1/traces`. Échantillonnage paramétrable par env ; les logs portent le `trace_id` même quand la trace n'est pas exportée.
- **`X-Request-ID` est notre racine de trace.** nginx génère déjà un `request_id` 32-hex, le propage à l'app via `X-Request-ID`, et le mappe en `trace_id` de ses propres logs PostHog (`infra/nginx/README.md`). L'app honore ce contrat : un propagateur OTel adopte `X-Request-ID` comme parent distant quand aucun `traceparent` W3C n'est présent. Un seul `trace_id` relie alors **nginx → app → DB** dans PostHog. Absent (dev local, worker) : racine OTel standard.
- Sentry : **erreurs seulement**. `skipOpenTelemetrySetup: true`, `tracesSampleRate: 0` — plus aucune span Sentry (ni bruit `sentry.*`, ni doublons). Les événements erreur portent `trace_id`/`span_id` lus du contexte OTel actif ; le bouton « View Trace » de Sentry est abandonné volontairement — le `trace_id` se recopie dans PostHog.
- Le bootstrap (provider, exporteurs, propagateurs, instrumentations) vit dans un module partagé `observability/setup.ts`, importé par le site **et** le worker — le worker n'a ni Next ni Sentry-Next, l'uniformité vient de là.

### 7.4 Identité dans les logs et les traces

Deux attributs OTel, noms exacts imposés par PostHog :

- **`posthogDistinctId`** — relie la ligne au profil personne (onglet Logs). Pour un utilisateur authentifié, c'est le **userId applicatif** : le client fait `posthog.identify(userId)` et le projet est en `person_profiles: 'identified_only'`. Le serveur le connaît (session décryptée) — source de vérité serveur, aucune confiance dans le client.
- **`sessionId`** — relie au **replay** (bouton « View recording » + onglet « Related errors », ±6 h). La session PostHog ne vit que dans le navigateur : c'est posthog-js qui l'envoie, via l'option `tracing_headers` (≥ 1.380 ; headers `X-POSTHOG-DISTINCT-ID` / `X-POSTHOG-SESSION-ID` ajoutés aux `fetch` same-origin — y compris les POST de server actions).

Injection côté serveur : `identifyRequest()`, appelé par `getUserSession` (qui lit déjà la session et les headers), dépose l'identité dans un **store asynchrone** de la requête — pas sur une span : une span ne porte que ses propres attributs, et l'identité se perdrait dès qu'une autre devient active, ce qui arrive à chaque service instrumenté. Le store suit la requête : le pont la lit pour chaque ligne quel que soit le span actif, et `IdentitySpanProcessor` tamponne chaque span de la requête au moment de sa fin (`onEnding`, seul moment où ses attributs restent modifiables — un `setAttribute` après `end()` est ignoré par le SDK) : y compris la span de requête du framework, déjà ouverte quand la session est lue, celle que PostHog affiche comme la requête.

*Pourquoi pas un baggage OTel.* Un baggage ne se pose qu'autour du travail (`context.with`) : il faudrait envelopper chaque corps d'action pour un attribut décoratif. Un store asynchrone rend le même service sans rien envelopper, et sans se rompre quand une span s'ouvre.

Le `posthogDistinctId` n'est posé que lorsque l'identité est établie côté serveur (session authentifiée). Pour un visiteur anonyme, on prend celui que posthog-js envoie : le nôtre n'est pas un `distinct_id` PostHog et créerait un profil fantôme.

Le consentement suit naturellement : `posthog.init` n'a lieu qu'après acceptation → pas de headers, pas d'attributs, pour les utilisateurs en refus/DNT.

Le worker n'a pas de session live : pas de `sessionId` ; `posthogDistinctId` éventuel en binding de `child` pour les jobs liés à un utilisateur.

### 7.5 Ce qu'on n'achète pas

- La liaison navigateur→serveur par spans interposées (propagateur Sentry) : la corrélation client passe par `posthogDistinctId`/`sessionId` et le replay. Si le besoin se matérialise, `SentryPropagator` en rattrapage — sans rendre la propriété du tracing à Sentry.
- Les spans par composant RSC (instrumentation Sentry) : tuning de perf fin, pas investigation de bug. Ajournable sans changement d'architecture.
- Sentry Performance : mort à 0,5 % d'échantillonnage, enterré officiellement.

### 7.6 PII — les logs applicatifs n'ont pas de filet

Les logs nginx passent par le collecteur OTel qui les scrubbe (emails, IP, query du referrer). **Les logs applicatifs vont directement à PostHog et contournent ce pipeline** — le masquage est à la charge du logger, sur deux couches : la redaction pino par chemins (emails, tokens, cookies, mots de passe — les clés préfixées se déclarent entre crochets (`'["ngc.email"]'`), parce que pino lit un point comme un séparateur de chemin, pas comme une clé) pour la ligne stdout ; et la censure par nom de segment de clé dans `toLogAttributes` (`log-attributes.ts`) pour l'export OTLP, qui ne passe pas par pino — pino censure sa sérialisation, jamais l'objet qu'on lui remet. Le nom de segment décide (`ngc.session.token` est censuré comme `ngc.token`), à toute profondeur, nom exact uniquement (`tokenCount` est une donnée). `userId` et `sessionId` PostHog sont les seules données identifiantes admises — exposition déjà couverte par le consentement analytics/replay. Les payloads métier (`situation`, `computedResults`, `foldedSteps`) n'ont rien à faire dans une ligne non plus, mais par volume : ce ne sont pas des PII, le logger ne les masque donc pas — c'est à l'appelant de ne pas les passer.

### 7.7 Nommer les choses

Les conventions de nommage suivent les standards quand il en existe un, et nos
attributs maison quand il n'y en a pas.

- **La ressource OTel décrit qui produit la télémétrie** : `service.namespace`
  (le produit, `nosgestesclimat`), `service.name` (le runtime : `site`, `worker`
  ou `browser` — trois runtimes, pas trois produits) et
  `deployment.environment.name` (le nom courant : `deployment.environment` est déprécié, et c'est la forme `.name` que PostHog facette ; le SDK navigateur n'émet que la forme dépréciée — à vérifier en staging que la facette suit). Un `service.name` seul ne dit pas de
  quel produit il s'agit — d'où le namespace ; la semconv demande que le
  triplet namespace / nom / instance identifie une instance unique.
- **`service.version` est le SHA du commit déployé**, sans suffixe d'environnement : la même chaîne que la release Sentry et que le `serviceVersion` du navigateur — un span, une ligne et une issue se rejoignent dessus. Les tags semver ne sont plus maintenus : tant que le pipeline ne pose pas `SOURCE_VERSION`, la clé est omise plutôt que remplie d'un faux numéro. Le format est libre côté semconv (`2.0.0` comme `a01dbef8a` y figurent en exemples).
- **Ce qui est interne à un service est un attribut, pas un service.** Un
  service core (`engine-registry`) porte `scope` en binding de `child` :
  OTel n'a pas de nom standard pour ça (comme pour `pollId` ou `simulationId`),
  c'est un attribut maison — préfixé, plat, stable, de forte dimensionnalité, ce que
  recommande PostHog. Le message, lui, dit ce qui est arrivé, sans préfixe
  `[composant]`.
- **Nos attributs portent le préfixe `ngc.`**, posé par la fabrique : un
  appelant écrit `{ simulationId }`, la ligne et l'export portent
  `ngc.simulationId`. La spec réserve les noms nus et déconseille explicitement
  les mots génériques (`code`, `job`, `count`) : quelqu'un d'autre les
  revendiquera un jour. Les noms **standards** gardent leur orthographe et
  sortent de producteurs typés (`memoryAttributes` pour la mémoire, l'identité
  de requête pour `posthogDistinctId`/`sessionId`, `instrumentation` pour
  `http.*`), pas d'une liste tenue à la main. Les clés d'un autre outil
  (`posthogDistinctId`, `sessionId`) sont son contrat. Ce schéma est un
  contrat : un renommage casse les recherches et les alertes en silence.
- **`scope` nomme l'unité qui émet**, sous la forme `paquet.couche.unité` — le mot de la spec pour ça (`InstrumentationScope`) :
  `core.service.engineRegistry`, `site.action.completeSimulation`,
  `site.middleware.auth`. La **couche** dit le rôle, et le nom de l'unité dit le
  reste : une **action** est un geste du produit (un formulaire, un bouton), un
  **service** sert ces gestes — y compris quand il est exposé au client depuis
  `services/` — `view` couvre les frontières de rendu (pages et layouts),
  `middleware`, `instrumentation` et `sideEffect` complètent la liste. La forme
  est **vérifiée par le compilateur** — `ScopeName` dans le contrat core : un
  nom nu ne compile pas —, la liste des couches restant fermée et son
  élargissement délibéré. Aucune valeur en double dans un même paquet et une
  même couche ; si deux features
  se télescopent, le nom gagne le segment de feature
  (`core.service.polls.computeStats`) — au moment de la collision, jamais par
  anticipation.
- **Le pont en fait aussi le nom de la portée OTel** (`InstrumentationScope`,
  le standard « qui a émis ») : la portée vaut exactement le `scope`, le
  service restant sur la ressource. Dans l'OTLP, la portée n'est pas un
  attribut du record : elle est sur l'enveloppe qui groupe les records
  (`scopeLogs`). PostHog ne le documente pas, mais l'expose bel et bien —
  `instrumentation_scope` revient dans la réponse, se filtre (`type: "log"`,
  valeur exacte `core.service.engineRegistry@` ou préfixe) et s'utilise en
  colonne calculée (vérifié par une sonde) ; ses attributs de portée, eux,
  n'apparaissent nulle part. L'attribut `scope`, lui, porte la valeur nue :
  c'est le filtre exact, celui que l'interface liste, et celui qui survit au
  changement de backend. Chaque émetteur se nomme une fois : un `child` au
  niveau du module, la `meta` pour une ligne isolée. Les autres clés disent
  autre chose — `sideEffect` la branche qui a échoué, `job` l'unité de travail
  du worker, `code` le verdict métier.
- **Ce que le nom n'est pas.** Ni le fichier — en prod le serveur Next est
  bundlé et minifié, le chemin runtime est celui du chunk (`/ROOT/node_modules/…`
  pour une dépendance externalisée, un id de chunk sinon) — ni les dossiers,
  qui bougent et mentent. Ni `otel.scope.name` : namespace réservé à la spec,
  et défini comme le miroir de la portée pour les exports *non* OTLP, alors que
  la nôtre arrive en OTLP et que PostHog la garde. Ni `code.function.name`,
  censé porter la représentation du runtime recoupable avec une pile —
  intenable quand le code est minifié, et l'unité est souvent un module, pas
  une fonction. Ni une capture automatique de pile : le frame capturé est
  souvent un helper inliné par V8, pas l'émetteur.
- **Un nom standard existe, on le prend** — même sur un log, et avec son unité :
  la mémoire d'un process s'écrit `process.memory.usage` (la mémoire physique,
  que l'OOM killer lit) et `v8js.memory.heap.used`, en **octets**. Un `rssMB`
  maison mourrait à la première migration vers une vraie métrique ; le nom
  standard, lui, survit au changement de signal.
- **Les attributs HTTP prennent les noms courants de la semconv** :
  `http.request.method`, `url.path`, `http.route` — ceux que les logs nginx
  portent déjà dans PostHog, donc un filtre couvre les deux. Ce qui est propre à
  Next reste dans son namespace `next.*`, comme Next le fait sur ses spans
  (`next.route`, `next.span_type`).
- **Les attributs exportés sont plats** : un objet de `meta` — ou d'un binding
  de `child` — est aplati en clés pointées (`engine.key`), séparateur que
  les noms semconv emploient eux-mêmes (`http.request.method`). C'est **le pont
  qui aplatit, à l'export**, pas la fabrique : l'aplatissement est une
  contrainte du backend, pas de la journalisation — PostHog ne le fait pas
  (vérifié par sonde : un `kvlistValue` y arrive en JSON texte et sa colonne
  pointée est nulle), donc un objet imbriqué envoyé tel quel ne serait pas
  requêtable. Si un `flatten` d'ingestion prenait le relais un jour (comme le
  collecteur des logs nginx), c'est cette étape-là qu'on supprimerait — pas
  celle de la fabrique. Au-delà de quatre niveaux, la valeur reste du JSON,
  faute de mieux. L'exception d'une ligne prend les trois noms `exception.*`.
