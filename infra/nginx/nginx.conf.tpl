limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;
limit_req_status 429;

proxy_cache_path /var/cache/nginx levels=1:2
                 keys_zone=ngc_cache:500m
                 max_size=30g inactive=3d use_temp_path=off;

map $cookie_ngc_session $ngc_is_auth {
    ""       0;
    default  1;
}

upstream scalingo {
    server ${UPSTREAM}:443;
    keepalive 64;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.${DOMAIN};


    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    return 301 https://${DOMAIN}$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};


    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Cache-Status $upstream_cache_status;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_cache ngc_cache;
    proxy_cache_use_stale error timeout updating
                          http_500 http_502 http_503 http_504;

    location /_next/static/ {
        proxy_pass https://scalingo;
        proxy_cache_lock on;
    }

    location /_static/cms/ {
        proxy_pass https://nosgestesclimat-prod.s3.fr-par.scw.cloud;
        proxy_cache_valid 200 30d;
        proxy_cache_lock on;
    }

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
    # donc exclus volontairement de la regex.
    location ~ ^/(en/)?($|simulateur/tutoriel|empreinte-carbone|empreinte-eau|cgu|mentions-legales|mentions-legales-base-empreinte|politique-de-confidentialite|accessibilite|contact|diffuser|nos-relais|plan-du-site|budget|international|gestion-infolettres|newsletter-confirmation|partenaire|questions-frequentes|stats|blog($|/.*)|documentation($|/.*)|nouveautes($|/.*)|guide($|/.*)|themes($|/.*)|campagne-partenaire($|/.*)|evenement($|/.*))$ {
        proxy_pass https://scalingo;

        proxy_cache_key "$scheme$request_method$host$request_uri$ngc_is_auth";
        proxy_cache_lock on;
        proxy_cache_background_update on;
        proxy_ignore_headers Cache-Control;
        proxy_cache_valid 200 1h;
        proxy_cache_bypass $ngc_is_auth$http_upgrade;
        proxy_no_cache $ngc_is_auth$http_upgrade;
    }

    location / {
        proxy_pass https://scalingo;
        limit_req zone=web burst=20 nodelay;

        proxy_cache_lock on;
        proxy_cache_background_update on;
        proxy_cache_bypass $http_upgrade;
    }
}
