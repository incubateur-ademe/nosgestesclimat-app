import dotenv from 'dotenv'
import { siteUrl, workerDatabaseUrl } from './config.ts'

/**
 * Points the process at the stack of its Playwright worker. Side effects only,
 * and the very first import of playwright.config.ts: the config's import chain
 * reads `NEXT_PUBLIC_SITE_URL` (page-objects/feature-flags.ts) and
 * `DATABASE_URL` (core's `prisma` singleton) as it loads.
 *
 * Assigned after apps/e2e/.env is loaded, so its values never win: that file
 * may still point `DATABASE_URL` at a developer's own database.
 */
dotenv.config({ quiet: true })

const parallelIndex = process.env.TEST_PARALLEL_INDEX

if (parallelIndex === undefined) {
  // Main process: the config only needs a valid origin to load.
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl(0)
} else {
  const i = Number(parallelIndex)
  process.env.DATABASE_URL = workerDatabaseUrl(i)
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl(i)
}
