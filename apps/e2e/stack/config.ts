import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Names, ports and paths of the per-worker e2e stacks: Playwright worker `i`
 * gets its own database, site, API and site worker.
 *
 * Imported by playwright.config.ts (through worker-env.ts) and by the Node
 * scripts of this folder, so it only depends on Node built-ins.
 */

export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
export const SITE_DIR = join(REPO_ROOT, 'apps/site')
export const CORE_DIR = join(REPO_ROOT, 'packages/core')
export const LOGS_DIR = join(REPO_ROOT, 'apps/e2e/logs')

/** Committed configuration of the e2e stack, loaded into every process. */
export const E2E_LOCAL_ENV_FILE = join(REPO_ROOT, '.github/e2e-local.env')
/** Mock third-party URLs of the site, loaded by the site build. */
export const SITE_E2E_ENV_FILE = join(SITE_DIR, '.env.e2e')

/**
 * URLs inlined into the site build (`NEXT_PUBLIC_SITE_URL` and
 * `NEXT_PUBLIC_SERVER_URL` from e2e-local.env). Each worker's copy of the build
 * has them replaced by its own: see builds.ts.
 */
export const BUILT_SITE_ORIGIN = 'localhost:3000'
export const BUILT_SERVER_ORIGIN = 'localhost:3001'

/**
 * Worker ports keep the byte length of the built ones as long as there are
 * fewer than 100 workers, so patching the build never shifts an offset.
 */
export const MAX_WORKERS = 100

export const sitePort = (i: number) => 3100 + i
export const serverPort = (i: number) => 3200 + i
export const siteUrl = (i: number) => `http://localhost:${sitePort(i)}`
export const serverUrl = (i: number) => `http://localhost:${serverPort(i)}`

/** Next.js build directory of site `i`, relative to apps/site. */
export const distDir = (i: number) => `.next-e2e-${i}`

export const TEMPLATE_DATABASE = 'ngc_e2e_template'
export const workerDatabase = (i: number) => `ngc_e2e_${i}`

/** Admin URL of the Postgres instance that holds every e2e database. */
export const adminDatabaseUrl = () => {
  const url = process.env.E2E_DATABASE_URL
  if (!url) {
    throw new Error(
      'E2E_DATABASE_URL is required (e.g. postgresql://postgres:postgres@localhost:5432/postgres): see apps/e2e/.env.template.'
    )
  }
  return url
}

const databaseUrl = (database: string) => {
  const url = new URL(adminDatabaseUrl())
  url.pathname = `/${database}`
  return url.toString()
}

export const templateDatabaseUrl = () => databaseUrl(TEMPLATE_DATABASE)
export const workerDatabaseUrl = (i: number) => databaseUrl(workerDatabase(i))

/** `E2E_SITE_MODE=dev` runs a single stack on `next dev`, without a build. */
export const isDevMode = () => process.env.E2E_SITE_MODE === 'dev'
