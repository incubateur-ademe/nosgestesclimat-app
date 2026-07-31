# Infra — nosgestesclimat.fr

Proxy cache Nginx devant l'application Scalingo.

## Architecture

    Navigateur
      │
      ▼
    Instance Scaleway (Nginx)
      ├── cache
      ├── rate limiting
      └── SSL (Let's Encrypt, renouvellement automatique)
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
      └── prod : tire uniquement si le combined status du commit
                 est "success" (CI + E2E verts)

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

## Créer une instance

    ./generate-cloud-init.sh preprod   # ou prod

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
