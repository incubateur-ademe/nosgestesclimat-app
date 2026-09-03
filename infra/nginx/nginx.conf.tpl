
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
    server ${UPSTREAM}:443 resolve;
    keepalive 64;
}

# ----------------------------------------------------------------------------
# Redirections (HTTP → HTTPS, www → apex)
# ----------------------------------------------------------------------------

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.${DOMAIN};


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
    # Préserve la négo websocket si le client en initie une.
    proxy_set_header Upgrade $http_upgrade;
    # Conséquence de `Upgrade` ci-dessus — force l'header pour qu'il traverse nginx.
    proxy_set_header Connection "upgrade";


    proxy_cache ngc_cache;
    # Sert le cache même si l'upstream est en panne (500-504)
    # ou en revalidation par un autre worker (updating).
    proxy_cache_use_stale error timeout updating
                          http_500 http_502 http_503 http_504;


    # Assets statiques Next.js (hashés, immutables).
    # `proxy_cache_lock` évite le cache stampede.
    location /_next/static/ {
        proxy_pass https://scalingo;
        proxy_cache_lock on;
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
    }

    # Images Next.js, fonts et assets divers via Scalingo, cachés 30 jours.
    location ~ ^/(_next/image|images|misc|fonts)/ {
        proxy_pass https://scalingo;
        proxy_cache_valid 200 30d;
        proxy_cache_lock on;
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
        proxy_ssl_verify on;
        proxy_ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
        proxy_cache off;
    }

    location /revp/array/ {
        proxy_pass https://eu-assets.i.posthog.com/array/;
        proxy_set_header Host eu-assets.i.posthog.com;
        proxy_ssl_server_name on;
        proxy_ssl_name eu-assets.i.posthog.com;
        proxy_ssl_verify on;
        proxy_ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
        proxy_cache off;
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
        # Nettoie Origin/Referer pour éviter les rejets PostHog depuis des domaines inconnus.
        proxy_set_header Origin "";
        proxy_set_header Referer "";
        proxy_cache off;
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
