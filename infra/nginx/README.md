# Infra — nosgestesclimat.fr

Proxy cache Nginx devant l'application Scalingo.

## Architecture

    Navigateur
      │
      ▼
    Instance Scaleway DEV1-S (Nginx)
      ├── cache (proxy_cache, 500 Mo RAM / 10 Go disque)
      ├── rate limiting (30 req/s/IP)
      └── SSL (Let's Encrypt, renouvellement automatique)
      │
      ▼
    nosgestesclimat-site.osc-secnum-fr1.scalingo.io (Scalingo)

## Fichiers

| Fichier                  | Rôle                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `cloud-init.tpl.yaml`    | Template cloud-init avec placeholders `__DOMAIN__` et `__UPSTREAM__` |
| `generate-cloud-init.sh` | Génère `cloud-init.preprod.yaml` et `cloud-init.prod.yaml`           |
| `cloud-init.*.yaml`      | Fichiers générés, prêts à coller dans la console Scaleway            |

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

L'instance démarre. Nginx est configuré mais **arrêté** (le certificat SSL n'existe pas encore).

## Obtenir le certificat SSL

Récupérer l'IP publique dans la console Scaleway, puis :

    ssh root@<ip>

    # Challenge DNS : zéro downtime, le DNS ne bouge pas
    certbot certonly --manual --preferred-challenges dns \
      -d preprod.nosgestesclimat.fr

    # → Certbot affiche un TXT record à créer
    # → Créer le TXT _acme-challenge.preprod.nosgestesclimat.fr
    # → Vérifier la propagation : dig TXT _acme-challenge.preprod.nosgestesclimat.fr
    # → Appuyer sur Entrée

    # Certbot configure Nginx et démarre tout
    certbot --nginx -d preprod.nosgestesclimat.fr

Pour la prod, ajouter `www` :

    certbot certonly --manual --preferred-challenges dns \
      -d nosgestesclimat.fr -d www.nosgestesclimat.fr
    certbot --nginx -d nosgestesclimat.fr -d www.nosgestesclimat.fr

## Tester avant bascule DNS

    curl -I --resolve preprod.nosgestesclimat.fr:443:<ip> \
      https://preprod.nosgestesclimat.fr

    # X-Cache-Status: MISS  (premier appel)
    # X-Cache-Status: HIT   (deuxième appel — le cache fonctionne)

## Basculer le DNS

Baisser le TTL à 60 secondes, attendre l'expiration de l'ancien TTL, puis :

    preprod.nosgestesclimat.fr  A  <ip-instance>
    nosgestesclimat.fr          A  <ip-instance>
    www.nosgestesclimat.fr      CNAME  nosgestesclimat.fr

Une fois le trafic stabilisé, remonter le TTL à 3600.

## Mettre à jour la config Nginx

Modifier `cloud-init.tpl.yaml`, puis appliquer sur l'instance existante :

    # Générer la config mise à jour
    DOMAIN="nosgestesclimat.fr"
    UPSTREAM="nosgestesclimat-site.osc-secnum-fr1.scalingo.io"
    sed "s/__DOMAIN__/$DOMAIN/g; s/__UPSTREAM__/$UPSTREAM/g" \
      cloud-init.tpl.yaml \
      | awk '/write_files/,/^$/' \
      | sed -n '/content: |/,/^  [a-z]/p' \
      | tail -n +2 | sed 's/^      //' \
      > /tmp/nginx.conf

    scp /tmp/nginx.conf root@<ip>:/etc/nginx/sites-available/nosgestesclimat
    ssh root@<ip> "nginx -t && systemctl reload nginx"

Ou, plus simplement, éditer directement sur l'instance :

    ssh root@<ip>
    nano /etc/nginx/sites-available/nosgestesclimat
    nginx -t && systemctl reload nginx

Puis reporter les modifications dans `cloud-init.tpl.yaml` pour la prochaine recréation.

## Vérifier le cache

    # Hit ratio sur l'instance
    tail -100 /var/log/nginx/access.log | grep -c HIT

    # Statut du renouvellement SSL
    certbot renew --dry-run

    # Timer de renouvellement
    systemctl status certbot.timer

## Recréer une instance

1. Détruire l'ancienne instance
2. Créer une nouvelle avec le même cloud-init
3. Reprendre à « Obtenir le certificat SSL »
4. Basculer le DNS vers la nouvelle IP si elle a changé

Le cache Nginx repart de zéro mais se repeuple en quelques minutes de trafic.
