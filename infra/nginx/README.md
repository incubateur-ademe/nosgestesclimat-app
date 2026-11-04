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
    ENVIRONMENT=preprod          # preprod ou production
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

Les erreurs de Nginx sont envoyées vers PostHog Logs via l'OpenTelemetry
Collector (`otelcol-contrib`), installé sur la même instance par cloud-init — et
ses accès par le span du module OTel, voir « Traces ». Aucun SDK PostHog :
PostHog est nativement OTLP.

### Fonctionnement

- Aucun `access.log` n'est écrit : `access_log off;` au niveau `http`, sans quoi
  nginx hérite de celui de `nginx.conf`. Le span porte tout ce que le log
  portait — `url.path`, `url.query`, `upstream_*`, `request_time` — et ses champs
  suivent les **conventions sémantiques OTel** (semconv) ; les champs upstream
  restent nginx-spécifiques (`upstream_cache_status`, …).
- `otelcol-contrib` (service systemd, user `otelcol-contrib`) :
  - lit `/var/log/nginx/error.log` (texte parsé par regex : préfixe
    `time [level] pid#tid: *connection` + contexte `server`, `request`,
    `upstream`, `host` — `client` et `referrer` ne sont pas extraits, et le
    `error_log json` est Plus-only) ;
  - masque sur la ligne brute, **avant parsing** : emails, IP client (IPv4 et
    IPv6) et query du `referrer` — donc dans tous les champs d'un coup ;
  - normalise les attributs du span d'nginx vers la sémantique actuelle, et en
    retire l'IP du visiteur (voir « Traces ») ;
  - pose `event_name=nginx.error` : attribut semconv promu en champ natif
    `EventName` (que stanza ne sait pas écrire) puis retiré ;
  - ajoute `service.name=nginx` et
    `deployment.environment.name=preprod|production` ;
  - exporte vers `https://eu.i.posthog.com/i/v1/logs` (OTLP HTTP) avec
    `Authorization: Bearer <POSTHOG_PROJECT_TOKEN>`.
- Corrélation : le span d'nginx ouvre la trace (`$otel_trace_id`), et c'est lui
  qui porte le contexte de la requête — `connection`, `upstream_addr`,
  `upstream_cache_status`. `connection` rapproche la requête de la ligne
  d'`error.log` correspondante ; `upstream_addr` distingue un 502 « l'upstream a
  répondu » d'un 502 « aucun serveur joignable ».
- La clé est stockée dans `/etc/otelcol-contrib/otelcol-contrib.env` (0600),
  chargée par systemd (`EnvironmentFile`).

### Traces

Nginx émet un span par requête grâce au module **`ngx_otel_module`**, exporté en
OTLP/gRPC vers le collecteur (pipeline `traces/nginx`, port 4317). Ce span est la
**racine** des traces de l'application : sans lui, les spans de l'app arrivent
sans parent, PostHog les marque orphelines, et la vue traces n'affiche rien.

Le module ne vient que de nginx.org : ni Debian ni Ubuntu n'empaquettent de
`libnginx-mod-http-otel`. On déclare donc leur dépôt, puis on installe `nginx`
**et** `nginx-module-otel` ensemble — un module dynamique doit correspondre au
binaire.

```bash
. /etc/os-release
curl -fsSL https://nginx.org/keys/nginx_signing.key \
  | sudo gpg --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg
# `printf` plutôt qu'un `echo` : la ligne doit tenir sur une seule, sinon apt
# lit quatre champs au lieu de cinq (« Malformed entry ... (Component) »).
printf 'deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu %s nginx\n' \
  "$VERSION_CODENAME" | sudo tee /etc/apt/sources.list.d/nginx.list
cat /etc/apt/sources.list.d/nginx.list     # doit afficher une seule ligne

sudo apt-get update && sudo apt-get install -y nginx nginx-module-otel
ls -l /etc/nginx/modules/ngx_otel_module.so

# Le nginx de nginx.org tourne en `nginx` (Ubuntu : `www-data`) : sans ce
# chown, il ne peut pas écrire son cache et tronque chaque réponse.
sudo chown -R nginx:nginx /var/cache/nginx

# Le `nginx.conf` de nginx.org n'inclut pas `modules-enabled`, contrairement à
# celui d'Ubuntu : le `load_module` va dans le contexte principal.
grep -qs ngx_otel_module /etc/nginx/nginx.conf || \
  sudo sed -i '1i load_module modules/ngx_otel_module.so;' /etc/nginx/nginx.conf
```

Si `apt-cache policy nginx nginx-module-otel` ne montre rien après `apt-get
update`, le nom de code n'est pas servi par le dépôt stable : remplacer
`/packages/ubuntu` par `/packages/mainline/ubuntu` dans la ligne ci-dessus.

Le module est un **prérequis** du vhost : `otel_exporter`, `otel_trace` et
`$otel_trace_id` sont inconnus sans lui, et nginx refuse de démarrer. Le
provisioning l'installe donc avant tout pull, et la CI l'installe pour valider la
configuration.

Le span porte aussi les champs propres au proxy — `upstream_*`, `request_time`,
`connection` — posés par `otel_span_attr`, donc évalués à la fin de la requête,
une fois l'amont connu. Ils portent **les mêmes noms** que dans `log_format` :
une requête PostHog écrite sur l'un vaut sur l'autre.

Le **nom** du span vaut par défaut celui de la location. Deux endroits l'écrasent
pour prendre `$request_method $uri` : la fourre-tout `/`, qui sinon nommerait `/`
toutes les pages du site, et la location des pages de contenu, dont le défaut
serait le motif regex. Les assets gardent le défaut, qui les nomme déjà par leur
location.

Le module les émet en revanche dans la sémantique HTTP d'avant 1.23
(`http.method`, `http.status_code`, `http.flavor`…) : le collecteur les renomme
vers les noms actuels. Renommer en amont casserait ce collecteur.

### Résilience

- nginx n'a aucune dépendance vers PostHog : si le collecteur ou PostHog sont
  indisponibles, le trafic n'est pas affecté et les logs restent sur disque.
- Offsets de lecture persistés (`file_storage`) : reprise exacte après restart
  ou rotation de logs (ni trou, ni doublon).
- File d'export persistée sur disque : les logs en attente survivent à un
  redémarrage du collecteur et repartent à la reprise (coupure réseau absorbée).

### Données personnelles (RGPD)

Aucune donnée directement identifiante n'est envoyée à PostHog :

- **IP** : absente de tout ce qui sort. Plus d'`access.log` du tout, et les
  `net.sock.peer.addr` et `net.sock.peer.port` que le module ajoute au span sont
  supprimés par le collecteur. Dans `error.log` (format nginx figé, qui inclut
  `client: <ip>`), elles sont masquées par le collecteur — **IPv4 et IPv6**.
- **Query strings** : conservées dans l'attribut `url.query` du span, séparé du
  chemin `url.path`, pour le debugging — les emails qu'elles contiennent sont
  masqués par le collecteur.
- **Bodies POST** : jamais loggés par nginx (pas de `$request_body`). Attention
  en revanche aux logs applicatifs Next.js, qui sont hors de ce pipeline.
- **Referer** : jamais journalisé. Dans `error.log` (où nginx l'ajoute au
  message), on ne garde que le **chemin** : la **query** — où vit la PII — est
  supprimée (`referrer: "https://host/path"`).

Restent : méthode, chemin + query string (emails masqués), statut, tailles,
temps de réponse, statut cache et user-agent (borderline — retirable si besoin).

Rétention sur disque : `/var/log/nginx/*.log` tournent sur 2 jours (logrotate
`daily` + `rotate 2`, au lieu de 14 j par défaut). Le buffer du collecteur
(`/var/lib/otelcol-contrib`) est déjà masqué (le scrub précède l'export).

### Consulter les logs

PostHog → Logs, filtrer sur `service.name = nginx` puis
`deployment.environment.name = production` (ou `preprod`) : il n'y reste que les
erreurs d'nginx. Les accès sont dans **Tracing**, avec les mêmes filtres — le
span porte les mêmes attributs que l'ancien log (`url.path`,
`upstream_cache_status`, `http.response.status_code`, …).

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
- **access.log** : plus écrit du tout. Le span porte le même contenu —
  `url.path`, `url.query`, `upstream_*`, `request_time`.
- **error.log** : livré, et c'est désormais le seul flux de logs nginx.
- **Traces `/revp/`** : le filtre du collecteur écarte les 200 — un quart du
  volume pour un contenu toujours identique. Les échecs (4xx, 5xx) restent, et
  un 4xx n'existant nulle part ailleurs, c'est leur seule trace.

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

Trois écarts au routage strict, alignés sur la
[conf de référence PostHog](https://posthog.com/docs/advanced/proxy/nginx) :

- `Cookie` et `Authorization` vidés avant l'envoi : l'ingestion n'utilise que
  l'identifiant lu côté navigateur, les cookies de session NGC n'ont pas à
  transiter vers un tiers.
- Vérification TLS active sur les trois `location` — `/revp/static/` sert du JS
  exécuté par les navigateurs — avec `proxy_ssl_verify_depth 5` : le défaut (1)
  refuse une chaîne à deux intermédiaires, comme celle d'`eu-assets`
  (`YE2` → `Root YE`).
- `client_max_body_size 64M` sur `/revp/` : les enregistrements de session
  PostHog montent à 64 Mo, contre 1 Mo par défaut.

Côté app, `api_host` pointe sur `/revp` (chemin relatif au domaine courant) et
`ui_host` reste `https://eu.i.posthog.com` (voir
`apps/site/src/services/tracking/Posthog.ts`).

## Cache HTTP

| Route                             | TTL      | Ce qui le rend sûr                           |
| --------------------------------- | -------- | -------------------------------------------- |
| Pages publiques (liste explicite) | 1 h      | anonymes : l'app n'y pose pas de cookie      |
| `/_next/static/…`                 | 1 an     | noms hashés par le contenu, immuables        |
| `/_static/cms/…`                  | 30 jours | assets CMS versionnés par hash dans leur nom |
| `/_next/image`, `/images`, `…`    | 30 jours | images dérivées, adressées par URL complète  |
| `favicon`, `manifest`, `sitemap`… | 15 min   | noms non hashés, TTL court volontaire        |

Deux règles gouvernent tout le reste :

- **Pas de `Set-Cookie` sur une réponse cacheable.** Nginx n'enregistre jamais une
  réponse qui en pose : la page ne serait ni mise en cache ni rafraîchie. C'est
  `apps/site/src/helpers/server/proxy/region.middleware.ts` qui s'en assure (la
  région n'est persistée que sur les requêtes non cacheables et les forçages
  `?region=`).
- **Sur `/_next/static/`, seuls les 200 sont cachés, et un an**
  (`proxy_ignore_headers` + `proxy_cache_valid 200 365d`). Les chunks sont hashés
  par le contenu, donc immuables ; quand un déploiement en retire, `use_stale
http_404` sert la copie en cache plutôt que de laisser un 404 que le HTML
  encore en cache ne peut pas rattraper.

L'invalidation se fait par **génération de clé** : bumper le préfixe
`ngc-html-v2` dans `nginx.conf.tpl` vide le cache HTML.

## Page d'erreur applicative (indispo / timeout upstream)

Sur 502/503/504, nginx sert `/app-crash` via `error_page`, avec `=code` pour que
le statut d'origine remonte jusqu'au client. La clé de cache et le TTL restent
ceux par défaut : la page est statique (`s-maxage=86400`), et dans la
sous-requête `$uri` vaut `/app-crash` avec `$args` vide, donc la clé héritée est
déjà celle du pré-chauffage. `pull-config.sh` réécrit l'entrée toutes les 5 min :
sans elle, la sous-requête repart vers l'upstream, injoignable.

Le `500` n'est pas intercepté : l'erreur applicative garde la page 500 de Next.
La page est en `noindex` et interdite dans `robots.txt`.

## Tester avant bascule DNS

    curl -I --resolve preprod.nosgestesclimat.fr:443:<ip> \
      https://preprod.nosgestesclimat.fr

    # X-Cache-Status: MISS  (premier appel)
    # X-Cache-Status: HIT   (deuxième appel — le cache fonctionne)

## Basculer le DNS

## Vérifier le cache

    # Hit ratio : dans PostHog → Tracing, filtrer sur `upstream_cache_status`

    # Ce qui est réellement mis en cache, et où (une entrée = un fichier)
    grep -c "" /var/cache/nginx/*/*/* 2>/dev/null | head

    # Statut du timer de pull
    systemctl status nginx-config-pull.timer

    # Dernier pull
    journalctl -u nginx-config-pull.service --no-pager -n 20

    # Statut du renouvellement SSL
    certbot renew --dry-run
