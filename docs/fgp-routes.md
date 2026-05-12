# FGP Routes Reference

All requests authenticated with `X-FGP-Key: $FGP_DEPLOY_TOKEN`.

---

## Prod

| Route                                                     | Method | Payload                                                                                                                            |
| --------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/apps/nosgestesclimat-server/deployments`             | POST   | `{"deployment": {"git_ref": "main", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/main.tar.gz"}}` |
| `/v1/apps/nosgestesclimat-server/deployments/{id}`        | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-server/deployments/{id}/output` | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-site/deployments`               | POST   | `{"deployment": {"git_ref": "main", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/main.tar.gz"}}` |
| `/v1/apps/nosgestesclimat-site/deployments/{id}`          | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-site/deployments/{id}/output`   | GET    | —                                                                                                                                  |

`DATABASE_URL` is set manually on `nosgestesclimat-site` — no FGP route needed.

---

## Preprod

| Route                                                           | Method | Payload                                                                                                                            |
| --------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/apps/nosgestesclimat-preprod/deployments`                  | POST   | `{"deployment": {"git_ref": "main", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/main.tar.gz"}}` |
| `/v1/apps/nosgestesclimat-preprod/deployments/{id}`             | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-preprod/deployments/{id}/output`      | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-site-preprod/deployments`             | POST   | `{"deployment": {"git_ref": "main", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/main.tar.gz"}}` |
| `/v1/apps/nosgestesclimat-site-preprod/deployments/{id}`        | GET    | —                                                                                                                                  |
| `/v1/apps/nosgestesclimat-site-preprod/deployments/{id}/output` | GET    | —                                                                                                                                  |

`DATABASE_URL` is set manually on `nosgestesclimat-site-preprod` — no FGP route needed.

---

## Review (preprod PR)

| Route                                                                   | Method | Payload                                                                                                                              | Notes                                       |
| ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `/v1/apps/nosgestesclimat-preprod/scm_repo_link/manual_review_app`      | POST   | `{"pull_request_id": 42}`                                                                                                            | Creates `nosgestesclimat-preprod-pr42`      |
| `/v1/apps/nosgestesclimat-site-preprod/scm_repo_link/manual_review_app` | POST   | `{"pull_request_id": 42}`                                                                                                            | Creates `nosgestesclimat-site-preprod-pr42` |
| `/v1/apps/nosgestesclimat-preprod-pr*/deployments`                      | POST   | `{"deployment": {"git_ref": "{sha}", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/{sha}.tar.gz"}}` |                                             |
| `/v1/apps/nosgestesclimat-preprod-pr*/deployments/{id}`                 | GET    | —                                                                                                                                    |                                             |
| `/v1/apps/nosgestesclimat-preprod-pr*/deployments/{id}/output`          | GET    | —                                                                                                                                    |                                             |
| `/v1/apps/nosgestesclimat-site-preprod-pr*/deployments`                 | POST   | `{"deployment": {"git_ref": "{sha}", "source_url": "https://github.com/incubateur-ademe/nosgestesclimat-app/archive/{sha}.tar.gz"}}` |                                             |
| `/v1/apps/nosgestesclimat-site-preprod-pr*/deployments/{id}`            | GET    | —                                                                                                                                    |                                             |
| `/v1/apps/nosgestesclimat-site-preprod-pr*/deployments/{id}/output`     | GET    | —                                                                                                                                    |                                             |

## From postdeploy scalingo hook on server review app

| Route                                                 | Method | Payload                                                               | Notes                                                                                       |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/v1/apps/nosgestesclimat-site-preprod-pr*/variables` | POST   | `{"variable": {"name": "DATABASE_URL", "value": "postgresql://..."}}` | Called from server postdeploy, not GitHub Actions. Idempotent — ignored if variable exists. |
