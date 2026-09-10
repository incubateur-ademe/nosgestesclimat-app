# Infra — nosgestesclimat.fr

Proxy cache Nginx devant l'application Scalingo.

## Architecture

    Navigateur
      │
      ▼
    Instance Scaleway (Nginx)
      ├── cache
      ├── rate limiting
      ├── SSL (Let's Encrypt, renouvellement automatique)
      └── logs JSON → OpenTelemetry Collector → PostHog Logs (OTLP)
      │
      ▼
    nosgestesclimat-site.osc-secnum-fr1.scalingo.io (Scalingo)

## Déploiement pull-based

La conf Nginx est tirée depuis GitHub par chaque instance, toutes les 5 minutes.
La branche source est configurée via `TEMPLATE_REF` dans `deploy.env`.

    GitHub (TEMPLATE_REF, ex. main)
      │
      ├── preprod : tire depuis la branche configurée (canary)
      │
      └── prod : tire uniquement si toutes les check-runs CI du commit
                 sont vertes (success/skipped, CI + E2E)

Aucun secret en CI, aucune clé SSH dans GitHub Actions, aucune branche
spécifique. Le gate est le statut CI du commit, vérifié par le script
de pull lui-même.

### Fichiers

| Fichier                     | Rôle                                                            |
| --------------------------- | --------------------------------------------------------------- |
| `nginx.conf.tpl`            | Template Nginx (source de vérité unique, placeholders envsubst) |
| `pull-config.sh`            | Script de pull (tourne sur l'instance via systemd timer)        |
| `nginx-config-pull.service` | Unit systemd (oneshot)                                          |
| `nginx-config-pull.timer`   | Timer systemd (5 min)                                           |
| `cloud-init.tpl.yaml`       | Template cloud-init (setup machine + first boot)                |
| `install-otelcol.sh`        | Installe/upgrade le collecteur (idempotent, version épinglée)   |
| `otelcol-config.yaml`       | Config OpenTelemetry Collector (nginx → PostHog Logs)           |
| `generate-cloud-init.sh`    | Génère `cloud-init.preprod.yaml` et `cloud-init.prod.yaml`      |

### `deploy.env`

Sur chaque instance, `/etc/nginx/deploy.env` contient :

    DOMAIN=preprod.nosgestesclimat.fr
    UPSTREAM=nosgestesclimat-site-preprod.osc-fr1.scalingo.io
    ENVIRONMENT=preprod          # preprod ou prod
    REPO=incubateur-ademe/nosgestesclimat-app
    TEMPLATE_REF=main            # main ou chore/nginx-proxy-for-cache ou autre

Créé par cloud-init au first boot. Ne change pas ensuite.
`TEMPLATE_REF` détermine quelle branche/branch le script de pull surveille.

### Modifier la conf Nginx

1. Éditer `nginx.conf.tpl` dans le repo
2. Ouvrir une PR
3. Merger sur `main`
4. Preprod tire dans les 5 min
5. Le workflow `common:deploy.yaml` déploie l'app + fait tourner les E2E sur preprod
6. Quand le combined status du commit passe à `success` → prod tire dans les 5 min

Si les E2E échouent : prod ne tire pas. Revert sur `main` → preprod se auto-heal →
le statut repasse vert → prod tire la version revertée.

### Modifier le pull script ou les units systemd

Ces fichiers sont téléchargés au first boot (via cloud-init `runcmd`) et ne sont
**pas** auto-updatés ensuite. Pour déployer une correction :

- Soit recréer l'instance (cloud-init télécharge les nouvelles versions)
- Soit SSH manuel : `curl -fsSL https://raw.githubusercontent.com/incubateur-ademe/nosgestesclimat-app/refs/heads/main/infra/nginx/pull-config.sh -o /usr/local/bin/nginx-config-pull.sh`

## Logs Nginx → PostHog (OpenTelemetry)

Les logs d'accès et d'erreur de Nginx sont envoyés vers PostHog Logs via
l'OpenTelemetry Collector (`otelcol-contrib`), installé sur la même instance
par cloud-init. Aucun SDK PostHog : PostHog Logs est nativement OTLP.

### Fonctionnement

- `nginx.conf.tpl` écrit `access.log` au format JSON (`log_format json_combined`),
  chaque champ devenant un attribut filtrable dans PostHog — sans IP, sans
  referer. Les champs `http.*`, `url.*`, `network.*`, `server.*` et
  `user_agent.original` suivent les **conventions sémantiques OTel** (semconv) ;
  les champs upstream restent nginx-spécifiques (`upstream_cache_status`, …).
- Logging conditionnel : les routes bavardes (assets `/_next/`, `/_static/cms/`,
  `/(images|misc|fonts)/` et proxy PostHog `/revp/`) ne sont écrites dans
  `access.log` qu'en cas d'erreur (4xx/5xx) → moins de volume et de bruit.
- `otelcol-contrib` (service systemd, user `otelcol-contrib`) :
  - lit `/var/log/nginx/access.log` (JSON) et `error.log` (texte parsé par
    regex : préfixe `time [level] pid#tid: *connection` + contexte `server`,
    `request`, `upstream`, `host`). `client` et `referrer` sont exclus (PII),
    et le `error_log json` est Plus-only ;
  - supprime le `body` de l'access log (JSON brut redondant avec les attributs)
    pour alléger le volume envoyé à PostHog ;
  - masque les IP (`client: <ip>`, IPv4 et IPv6), la query du `referrer` et les
    emails (`transform/scrub_pii`) avant l'envoi ;
  - ajoute `service.name=nginx` et `deployment.environment=preprod|prod` ;
  - exporte vers `https://eu.i.posthog.com/i/v1/logs` (OTLP HTTP) avec
    `Authorization: Bearer <POSTHOG_PROJECT_TOKEN>`.
- Corrélation : `$request_id` (généré par nginx) est propagé à l'app via
  `X-Request-ID` et mappé en `trace_id` du log côté collecteur (convention
  OTel) — l'attribut `request_id` est ensuite supprimé (la valeur vit dans le
  `trace_id`, filtrable dans PostHog). Pour relier logs nginx et logs
  applicatifs partageant cet ID.
  `connection` (extrait des deux logs) permet de filtrer dans PostHog une ligne
  d'`access.log` et la ligne d'`error.log` correspondante ; `upstream_addr`
  distingue un 502 « upstream a répondu » d'un 502 « aucun serveur joignable ».
- La clé est stockée dans `/etc/otelcol-contrib/otelcol-contrib.env` (0600),
  chargée par systemd (`EnvironmentFile`).

### Résilience

- nginx n'a aucune dépendance vers PostHog : si le collecteur ou PostHog sont
  indisponibles, le trafic n'est pas affecté et les logs restent sur disque.
- Offsets de lecture persistés (`file_storage`) : reprise exacte après restart
  ou rotation de logs (ni trou, ni doublon).
- File-queue persistée + retry avec backoff (5s → 30s, 5 min max) : coupure
  réseau absorbée sans perte.

### Données personnelles (RGPD)

Aucune donnée directement identifiante n'est envoyée à PostHog :

- **IP** : retirée de `access.log` (pas de `remote_addr`). Dans `error.log`
  (format nginx figé, qui inclut `client: <ip>`), elles sont masquées côté
  collecteur (`transform/scrub_pii`) — **IPv4 et IPv6**.
- **Query strings** : conservées (attribut `args`, séparé du chemin `uri`) pour
  le debugging, mais les emails qu'elles contiennent sont masqués côté collecteur.
- **Bodies POST** : jamais loggés par nginx (pas de `$request_body`). Attention
  en revanche aux logs applicatifs Next.js, qui sont hors de ce pipeline.
- **Referer** : retiré de `access.log`. Dans `error.log` (où nginx l'ajoute au
  message), on ne garde que le **chemin** : la **query** — où vit la PII — est
  supprimée (`referrer: "https://host/path"`).

Restent : méthode, chemin + query string (emails masqués), statut, tailles,
temps de réponse, statut cache et user-agent (borderline — retirable si besoin).

Rétention sur disque : `/var/log/nginx/*.log` tournent sur 2 jours (logrotate
`daily` + `rotate 2`, au lieu de 14 j par défaut). Le buffer du collecteur
(`/var/lib/otelcol-contrib`) est déjà masqué (le scrub précède l'export).

### Consulter les logs

PostHog → Logs, filtrer sur `service.name = nginx` puis
`deployment.environment = prod` (ou `preprod`). Exemples de recherche :
`429`, `upstream_cache_status = MISS`, `status = 500`.

### Modifier la config du collecteur

`otelcol-config.yaml` est tiré depuis GitHub par `pull-config.sh`, comme
`nginx.conf.tpl` : quand elle change (après validation `otelcol-contrib
validate`), le collecteur est redémarré automatiquement. Le token et
l'environnement restent dans `/etc/otelcol-contrib/otelcol-contrib.env`.

### Volume & coût

PostHog Logs est facturé au volume. Le filtrage des routes bavardes se fait
**côté nginx**, pas dans le collecteur : les lignes concernées ne sont jamais
écrites sur disque (économie d'I/O et d'espace), ne traversent pas le pipeline
du collecteur et n'atteignent pas PostHog.

- **Routes bavardes** (`/_next/`, `/_static/cms/`, `/(images|misc|fonts)/`,
  `/revp/`) : seules les réponses en **erreur (4xx/5xx)** sont écrites (cf.
  « Logging conditionnel » plus haut). Pour ne garder que les 5xx, ajuster le
  `map $status $ngc_is_error` dans `nginx.conf.tpl`.
- **body** de l'access log : supprimé côté collecteur (JSON brut redondant avec
  les attributs) — cf. « Fonctionnement ».

## Créer une instance

Le script requiert désormais la variable d'environnement `POSTHOG_PROJECT_TOKEN`
(clé de projet PostHog, préfixe `phc_`) pour générer la config du collecteur :

    POSTHOG_PROJECT_TOKEN=phc_... ./generate-cloud-init.sh preprod   # ou prod

Puis dans la console Scaleway :

1. **Instances → Create Instance**
2. Zone : `FR-PAR-1` ou `FR-PAR-2`
3. Image : `Ubuntu 24.04 LTS`
4. Type : `DEV1-S`
5. Volume : `Local Storage` (valeur par défaut)
6. **Advanced settings → cloud-init** : coller le contenu de `cloud-init.preprod.yaml` (ou `prod`)
7. Créer l'instance

L'instance démarre, télécharge la conf Nginx depuis GitHub, mais Nginx reste
**arrêté** (le certificat SSL n'existe pas encore).

## Obtenir le certificat SSL

Récupérer l'IP publique dans la console Scaleway, puis :

    ssh root@<ip>

    # Certificat initial via challenge DNS (zéro downtime, avant bascule DNS)
    certbot certonly --manual --preferred-challenges dns \
      -d preprod.nosgestesclimat.fr

    # → Certbot affiche un TXT record à créer
    # → Créer le TXT _acme-challenge.preprod.nosgestesclimat.fr
    # → Vérifier la propagation : dig TXT _acme-challenge.preprod.nosgestesclimat.fr
    # → Appuyer sur Entrée

    # Démarrer Nginx
    systemctl start nginx

    # Tester, puis basculer le DNS.  Une fois le DNS propagé :

    # Basculer vers l'authenticator nginx (challenge HTTP, renouvellement auto)
    certbot --nginx -d preprod.nosgestesclimat.fr

Pour la prod, ajouter `www` :

    certbot certonly --manual --preferred-challenges dns \
      -d nosgestesclimat.fr -d www.nosgestesclimat.fr
    systemctl start nginx
    # Après bascule DNS :
    certbot --nginx -d nosgestesclimat.fr -d www.nosgestesclimat.fr

**Important** : `certbot --nginx` peut ajouter quelques lignes dans la conf Nginx
(bloc challenge HTTP, redirects). Le pull script (5 min) ramènera la conf au
template. Le certificat reste valide — les fichiers dans
`/etc/letsencrypt/live/` ne sont pas affectés.

Le renouvellement automatique via `certbot.timer` utilise l'authenticator nginx
et fonctionne sans intervention.

## Reverse proxy PostHog (`/revp/`)

Le tracking PostHog transite par un pathname de notre domaine (`/revp/`) au lieu
du domaine `eu.i.posthog.com` : les ad-blockers filtrent par domaine, donc le
trafic analytics vers `nosgestesclimat.fr/revp/...` n'est pas bloqué.

Implémentation dans `nginx.conf.tpl`, dans le `server` principal :

- `/revp/static/*` → `eu-assets.i.posthog.com/static/*` (assets SDK)
- `/revp/array/*` → `eu-assets.i.posthog.com/array/*` (remote config)
- `/revp/*` → `eu.i.posthog.com/*` (capture, flags, API)

Ces `location` désactivent le cache disque (`proxy_cache off`) — l'API PostHog est
dynamique — et réécrivent `Host` vers PostHog (le `server` force par défaut
`Host ${UPSTREAM}`).

Côté app, `api_host` pointe sur `/revp` (chemin relatif au domaine courant) et
`ui_host` reste `https://eu.i.posthog.com` (voir
`apps/site/src/services/tracking/Posthog.ts`).

## Tester avant bascule DNS

    curl -I --resolve preprod.nosgestesclimat.fr:443:<ip> \
      https://preprod.nosgestesclimat.fr

    # X-Cache-Status: MISS  (premier appel)
    # X-Cache-Status: HIT   (deuxième appel — le cache fonctionne)

## Basculer le DNS

## Vérifier le cache

    # Hit ratio sur l'instance
    tail -100 /var/log/nginx/access.log | grep -c HIT

    # Statut du timer de pull
    systemctl status nginx-config-pull.timer

    # Dernier pull
    journalctl -u nginx-config-pull.service --no-pager -n 20

    # Statut du renouvellement SSL
    certbot renew --dry-run
