
# ----------------------------------------------------------------------------
# Rate limiting
# ----------------------------------------------------------------------------

# Zone de 10 Mo (~160k IPs uniques) avec un taux de remplissage de 30 req/s.
# Déclaration uniquement — l'application se fait via `limit_req zone=web` plus bas
# dans `location /` ; les assets statiques et le HTML cacheable ne sont pas limités.
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;
# Force un 429 explicite (sinon nginx renvoie 503 par défaut).
limit_req_status 429;

# ----------------------------------------------------------------------------
# Cache disque partagé
# ----------------------------------------------------------------------------

# Cache disque partagé (max_size=30g, éviction après 3 jours d'inactivité).
# `keys_zone=ngc_cache:500m` alloue 500 Mo de RAM pour l'index des clés (métadonnées).
# `use_temp_path=off` évite une copie intermédiaire disque.
proxy_cache_path /var/cache/nginx levels=1:2
                 keys_zone=ngc_cache:500m
                 max_size=30g inactive=3d use_temp_path=off;

# ----------------------------------------------------------------------------
# Auth derivation (cache bypass pour utilisateurs connectés)
# ----------------------------------------------------------------------------

# Pré-calcul binaire "session présente ?"
map $cookie_ngc_session $ngc_is_auth {
    # Cookie absent → 0 (anonyme, on cache).
    ""       0;
    # Cookie présent → 1 (authentifié, on bypass le cache).
    default  1;
}

# ----------------------------------------------------------------------------
# Résolution DNS dynamique (résilience aux pannes DNS transitoires)
# ----------------------------------------------------------------------------

# Résolveurs Cloudflare + Google côté instance Scaleway.
# Résolus dynamiquement (30s) : en cas de reload pendant que le DNS est
# temporairement indisponible, nginx garde l'IP précédente en cache
# et évite le "host not found in upstream".
resolver 1.1.1.1 8.8.8.8 valid=30s;

upstream scalingo {
    # Zone partagée de 64 Ko requise par `resolve` ci-dessous pour propager l'IP entre workers.
    zone scalingo 64k;
    # Sans `resolve`, l'IP Scalingo est figée au parsing de la conf.
    #
    # Ce nom résout 4 IP = 4 serveurs (avec un seul, max_fails est ignoré).
    # Défaut = 1 : une seule requête en timeout (lecture des en-têtes incluse)
    # évince l'IP 10 s. On tolère 3 échecs pour qu'un pic de lenteur de l'app
    # — partagé par les 4 fronts — ne les évince pas tous.
    # → http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server
    server ${UPSTREAM}:443 resolve max_fails=3;
    # Défaut = 0 (32 depuis nginx 1.29.7) : le cache de connexions évite un
    # TCP+TLS par requête vers l'upstream.
    keepalive 64;
}

# ----------------------------------------------------------------------------
# Proxy vers Scalingo : tuning
# ----------------------------------------------------------------------------

# Le map ne vaut "upgrade" que sur une vraie négo websocket, vide sinon :
# un `Connection` hop-by-hop permanent empêche la réutilisation de connexion.
# → https://nginx.org/en/docs/http/websocket.html
# → http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive
map $http_upgrade $connection_upgrade {
    default upgrade;
    ""      "";
}

# ----------------------------------------------------------------------------
# Logs au format JSON (consommés par l'OpenTelemetry Collector → PostHog)
# ----------------------------------------------------------------------------

# JSON structuré : chaque champ devient un attribut filtrable dans PostHog.
# Les champs `http.*`, `url.*` et `user_agent.*` suivent les conventions
# sémantiques OTel (semconv) ; les autres restent nginx-spécifiques.
# Sans IP (remote_addr) ni referer. La query string est conservée pour le
# debugging : les emails qu'elle contient sont masqués par le collecteur, qui
# normalise aussi `network.protocol.version` (brut ici) en semconv.
# `escape=json` échappe l'user-agent (JSON valide).
log_format json_combined escape=json
  '{'
    '"time_iso8601":"$time_iso8601",'
    '"request_id":"$request_id",'
    '"connection":"$connection",'
    '"server.address":"$host",'
    '"network.protocol.version":"$server_protocol",'
    '"http.request.method":"$request_method",'
    '"url.path":"$uri",'
    '"url.query":"$args",'
    '"http.response.status_code":$status,'
    '"http.request.body.size":"$content_length",'
    '"http.response.body.size":$body_bytes_sent,'
    '"request_time":$request_time,'
    '"upstream_addr":"$upstream_addr",'
    '"upstream_status":"$upstream_status",'
    '"upstream_connect_time":"$upstream_connect_time",'
    '"upstream_header_time":"$upstream_header_time",'
    '"upstream_response_time":"$upstream_response_time",'
    '"upstream_cache_status":"$upstream_cache_status",'
    '"user_agent.original":"$http_user_agent"'
  '}';

# ----------------------------------------------------------------------------
# Logging conditionnel
# ----------------------------------------------------------------------------

# 1 si la route est "bavarde" (assets statiques Next.js/CMS, proxy PostHog).
# `~^/_next/` couvre aussi `/_next/image?…` ($uri = /_next/image, sans query).
map $uri $ngc_noisy {
    default                  0;
    ~^/_next/                 1;
    ~^/_static/cms/           1;
    ~^/(images|misc|fonts)/   1;
    ~^/revp/                  1;
}

# 1 si la réponse est une erreur (4xx/5xx).
map $status $ngc_is_error {
    default  0;
    ~^[45]   1;
}

# On loggue tout, sauf une route bavarde SANS erreur (combinaison "10").
map "$ngc_noisy$ngc_is_error" $ngc_loggable {
    "10"     0;
    default  1;
}

# ----------------------------------------------------------------------------
# Redirections (HTTP → HTTPS, www → apex)
# ----------------------------------------------------------------------------

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/access.log json_combined if=$ngc_loggable;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.${DOMAIN};

    access_log /var/log/nginx/access.log json_combined if=$ngc_loggable;

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    return 301 https://${DOMAIN}$request_uri;
}

# ----------------------------------------------------------------------------
# Server principal (HTTPS + cache + locations)
# ----------------------------------------------------------------------------

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    access_log /var/log/nginx/access.log json_combined if=$ngc_loggable;

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # HSTS 2 ans sur tous les sous-domaines, y compris sur les réponses d'erreur (`always`).
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    # Expose le statut cache (HIT/MISS/BYPASS) pour le debugging terrain.
    add_header X-Cache-Status $upstream_cache_status;

    # Doit être le hostname Scalingo (pas $host), sinon l'app rejette la requête.
    proxy_set_header Host ${UPSTREAM};
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    # Corrélation : nginx → app → collecteur (mappé en trace_id du log).
    proxy_set_header X-Request-ID $request_id;
    # Négo websocket transmise _uniquement_ si le client en initie une.
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    # Défaut = 1.0 : HTTP/1.0 n'ayant pas de connexion persistante, `keepalive 64`
    # ne servait à rien. Inutile à partir de nginx 1.29.7, où 1.1 est le défaut.
    # → https://blog.nginx.org/blog/keep-alive-to-upstreams-is-now-default-in-nginx-1-29-7
    proxy_http_version 1.1;

    # Défaut = 60 s : sur une connexion morte, la requête restait immobilisée
    # une minute. Une connexion TCP (Scaleway → Outscale) prend quelques ms.
    # → http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_connect_timeout
    proxy_connect_timeout 5s;

    # Défaut = 60 s, soit 1 s de marge sur les 59 s du routeur Scalingo : trop
    # juste. Un proxy doit être franchement plus patient que son backend, sinon
    # c'est notre 504 générique qui remonte au lieu du leur (X-Scalingo-Error).
    # → https://doc.scalingo.com/platform/networking/public/routing
    # → https://gateway.envoyproxy.io/docs/tasks/traffic/http-timeouts
    proxy_read_timeout 65s;

    # Défaut = illimité : des reprises de 60 s sur chacune des IP faisaient
    # durer une requête jusqu'à 296 s. Doit rester > proxy_connect_timeout.
    # → http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream_timeout
    proxy_next_upstream_timeout 10s;
    # Défaut = 0, soit une reprise par IP disponible (4 ici). 3 tentatives au
    # total (donc 2 reprises), comme le NGINX Ingress Controller.
    proxy_next_upstream_tries 3;
    # Défaut = `error timeout`, qu'on garde : les 4 IP sont les fronts d'une même
    # app, donc réessayer un 5xx du routeur (503 « file pleine ») ajouterait de la
    # charge sans réparer. Les non-idempotentes ne sont jamais réessayées.
    # → http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream


    proxy_cache ngc_cache;
    # Sert le cache même si l'upstream est en panne (502-504) ou en
    # revalidation par un autre worker (updating).
    # On ne sert volontairement PAS de stale sur `http_500` : une erreur
    # applicative doit laisser s'afficher la page 500 de Next.
    proxy_cache_use_stale error timeout updating
                          http_502 http_503 http_504;

    # ── Timeouts upstream ────────────────────────────────────────
    # Valeurs volontairement bornées : on ne laisse pas l'utilisateur
    # attendre les ~60 s par défaut quand Scalingo est saturé ou injoignable.
    # Passé ce délai, `error_page` en dessous prend le relais.
    proxy_connect_timeout 5s;
    proxy_send_timeout    15s;
    proxy_read_timeout    30s;

    # ── Page d'erreur applicative (indispo / timeout upstream) ───
    # Sur indisponibilité (502/503/504) ou dépassement de timeout, rejoue la
    # requête en interne vers /app-crash (location dédiée plus bas, cache
    # long + use_stale).
    # On n'intercepte volontairement PAS `500` : une erreur applicative rendue
    # par Next garde sa propre page 500.
    # Sans `=`, le code d'erreur d'origine (502, 503, 504) est conservé dans la
    # réponse au client — utile pour le monitoring et les robots.
    proxy_intercept_errors on;
    error_page 502 503 504 /app-crash;


    # Assets statiques Next.js (hashés, immutables).
    # `proxy_cache_lock` évite le cache stampede.
    location /_next/static/ {
        proxy_pass https://scalingo;
        proxy_cache_lock on;
        # Une 5xx sur un asset ne doit pas renvoyer la page HTML d'erreur.
        proxy_intercept_errors off;
    }

    # Proxy vers le bucket S3 des assets CMS (images, PDF) avec cache 30 jours.
    # Le `Host` est réécrit vers le bucket (sinon le `Host ${UPSTREAM}` global
    # le fait pointer vers l'app Scalingo → NoSuchBucket), et le préfixe
    # /_static/cms/ est mappé sur la clé /cms/ du bucket.
    # Les assets sont versionnés par hash dans leur nom → cache navigateur immutable.
    location /_static/cms/ {
        proxy_set_header Host nosgestesclimat-prod.s3.fr-par.scw.cloud;
        proxy_pass https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/;
        proxy_cache_valid 200 30d;
        proxy_cache_lock on;
        proxy_hide_header Cache-Control;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        # Un asset manquant/erroné ne doit pas renvoyer la page d'erreur HTML.
        proxy_intercept_errors off;
    }

    # Images Next.js (optimiseur `/_next/image?url=…`), fonts et assets divers
    # via Scalingo, cachés 30 jours.
    location ~ ^/(_next/image|images|misc|fonts)(/|$) {
        proxy_pass https://scalingo;
        proxy_cache_valid 200 30d;
        proxy_cache_lock on;
        # Une 5xx sur un asset ne doit pas renvoyer la page HTML d'erreur.
        proxy_intercept_errors off;
    }

    # Fichiers statiques racine servis par l'app : favicon, icônes Apple,
    # manifeste, robots/sitemap et les scripts d'iframe.
    #
    # Next.js les renvoie en `Cache-Control: max-age=0`, donc le catch-all ne
    # les cache jamais : ils sont reproxyés à chaque chargement de page (~3000
    # requêtes/jour rien que pour le manifeste) et tombent en 502 pendant une
    # panne upstream, sans entrée périmée à servir.
    #
    # Noms non hashés → TTL court (un déploiement se voit en 15 min). Identiques
    # pour tous → pas d'`$ngc_is_auth` dans la clé, contrairement aux pages HTML.
    location ~* ^/(favicon(\.ico|\.png)?|apple-touch-icon(-precomposed)?\.png|manifest\.webmanifest|robots\.txt|sitemap\.xml|scripts/iframeSimulation\.js|iframeSimulation\.js)$ {
        proxy_pass https://scalingo;
        proxy_ignore_headers Cache-Control Expires;
        proxy_cache_valid 200 15m;
        proxy_cache_lock on;
        proxy_cache_background_update on;
        proxy_hide_header Cache-Control;
        add_header Cache-Control "public, max-age=900";
    }

    # ── Pages publiques catégorie 2 ──────────────────────────────
    # Contenu identique pour tous les utilisateurs anonymes.
    # Cache-bypass automatique pour les utilisateurs authentifiés
    # (détection via le cookie ngc_session). TTL 1h.
    #
    # Exact-match : accueil, simulateur/tutoriel, empreinte-carbone,
    # empreinte-eau, cgu, mentions-legales,
    # mentions-legales-base-empreinte, politique-de-confidentialite,
    # accessibilite, contact, diffuser, nos-relais, plan-du-site,
    # budget, international, gestion-infolettres,
    # newsletter-confirmation, partenaire, questions-frequentes,
    # stats
    #
    # Sub-path : blog, documentation, nouveautes, guide, themes,
    # campagne-partenaire, evenement
    #
    # Note : /fr et /fr/* sont des 307 vers la locale par défaut,
    # donc exclus volontairement de la regex. /en/* n'est volontairement
    # PAS couvert : les pages anglaises (trafic minime) tombent dans le
    # catch-all et ne sont pas forcées en cache — le middleware Next gère
    # la langue côté app.
    location ~ ^/($|simulateur/tutoriel|empreinte-carbone|empreinte-eau|cgu|mentions-legales|mentions-legales-base-empreinte|politique-de-confidentialite|accessibilite|contact|diffuser|nos-relais|plan-du-site|budget|international|gestion-infolettres|newsletter-confirmation|partenaire|questions-frequentes|stats|blog($|/.*)|documentation($|/.*)|nouveautes($|/.*)|guide($|/.*)|themes($|/.*)|campagne-partenaire($|/.*)|evenement($|/.*))$ {
        proxy_pass https://scalingo;

        # L'auth dans la clé : utilisateurs anonymes et authentifiés ont des caches distincts.
        proxy_cache_key "$scheme$request_method$host$request_uri$ngc_is_auth";
        proxy_cache_lock on;
        # Quand un cache stale est servi, lance la mise à jour en tâche de fond
        # sans bloquer la réponse.
        proxy_cache_background_update on;
        # L'app Next.js peut marquer Cache-Control sur ses réponses :
        # on l'ignore et on applique notre politique à la place.
        proxy_ignore_headers Cache-Control;
        proxy_cache_valid 200 1h;
        # Ne pas lire le cache si l'utilisateur est authentifié ou en websocket :
        # bypass direct vers Scalingo.
        proxy_cache_bypass $ngc_is_auth$http_upgrade;
        # Et ne pas écrire dans le cache dans ces cas :
        # sinon on pollue avec un mix anon/auth.
        proxy_no_cache $ngc_is_auth$http_upgrade;
    }

    # ── PostHog reverse proxy (pathname /revp/) ──────────────────
    # https://posthog.com/docs/advanced/proxy/nginx
    # Check LVAO config https://github.com/incubateur-ademe/quefairedemesobjets/blob/main/servers.conf.erb#L83-L98

    location /revp/static/ {
        proxy_pass https://eu-assets.i.posthog.com/static/;
        proxy_set_header Host eu-assets.i.posthog.com;
        proxy_ssl_server_name on;
        proxy_ssl_name eu-assets.i.posthog.com;
        proxy_cache off;
        # Ne pas substituer une page HTML aux erreurs de l'API PostHog.
        proxy_intercept_errors off;
    }

    location /revp/array/ {
        proxy_pass https://eu-assets.i.posthog.com/array/;
        proxy_set_header Host eu-assets.i.posthog.com;
        proxy_ssl_server_name on;
        proxy_ssl_name eu-assets.i.posthog.com;
        proxy_cache off;
        # Ne pas substituer une page HTML aux erreurs de l'API PostHog.
        proxy_intercept_errors off;
    }

    location /revp/ {
        proxy_pass https://eu.i.posthog.com/;
        proxy_set_header Host eu.i.posthog.com;
        proxy_ssl_server_name on;
        proxy_ssl_name eu.i.posthog.com;
        proxy_ssl_verify on;
        proxy_ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
        # Conserve l'IP réelle du visiteur pour PostHog (geolocation, IP-based flags).
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache off;
        # Ne pas substituer une page HTML aux erreurs de l'API PostHog.
        proxy_intercept_errors off;
    }

    # ── Page d'erreur applicative (indispo / timeout upstream) ────
    # Cible de `error_page` ci-dessus, et servie en direct pour permettre le
    # pré-chauffage du cache par `pull-config.sh`.
    # Contenu identique pour tous les utilisateurs (aucune personnalisation) :
    # clé de cache unique, `use_stale` pour continuer à la servir si Scalingo
    # est totalement injoignable, `proxy_intercept_errors off` pour éviter une
    # boucle error_page → app-crash → error_page.
    location = /app-crash {
        proxy_pass https://scalingo;
        proxy_intercept_errors off;

        proxy_cache ngc_cache;
        proxy_cache_key "$scheme$host$uri";
        proxy_cache_valid 200 1h;
        # Contrairement aux autres locations, on garde `http_500` ici : si la
        # page d'erreur elle-même tombe, on préfère servir sa dernière copie.
        proxy_cache_use_stale error timeout updating
                              http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        # Next peut renvoyer des headers qui empêchent la mise en cache
        # (Cache-Control, Set-Cookie de session) : on les ignore pour garantir
        # une entrée stable et partageable.
        proxy_ignore_headers Cache-Control Expires Set-Cookie;
    }

    # Catch-all : rate-limit + cache générique, bypass sur websocket.
    location / {
        proxy_pass https://scalingo;
        # 20 requêtes supplémentaires peuvent déborder immédiatement (burst),
        # au-delà → 429 sans délai.
        limit_req zone=web burst=20 nodelay;

        proxy_cache_lock on;
        proxy_cache_background_update on;
        proxy_cache_bypass $http_upgrade;
    }
}
