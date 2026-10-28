import type { FullConfig } from '@playwright/test'
import { prepareBuilds } from './builds.ts'
import {
  BUILT_SITE_ORIGIN,
  isDevMode,
  MAX_WORKERS,
  serverPort,
  sitePort,
  siteUrl,
} from './config.ts'
import { prepareDatabases } from './databases.ts'
import { assertPortsFree, startStack, stopStacks } from './processes.ts'

/**
 * Catches a site that does not serve its own patched build (`NEXT_DIST_DIR`
 * ignored). The sitemap is prerendered with the site URL, and the pages are
 * not: their HTML holds no origin to check.
 */
const assertServesOwnOrigin = async (i: number) => {
  const sitemap = await (await fetch(`${siteUrl(i)}/sitemap.xml`)).text()
  const origin = `localhost:${sitePort(i)}`
  if (!sitemap.includes(origin) || sitemap.includes(BUILT_SITE_ORIGIN)) {
    throw new Error(
      `${siteUrl(i)}/sitemap.xml does not list ${origin} only: the site is not serving its patched build.`
    )
  }
}

/**
 * Local suite: one stack per Playwright worker (database ngc_e2e_<i>, API, site
 * and site worker), keyed by parallel index. A worker restarted after a failure
 * gets the same index and reuses the running stack.
 */
export default async function globalSetup(config: FullConfig) {
  // The resolved count, `--workers` included: one stack per worker.
  const n = config.workers
  const dev = isDevMode()

  if (dev && n > 1) {
    throw new Error(
      `E2E_SITE_MODE=dev runs a single stack: run with --workers=1 (got ${n}).`
    )
  }
  if (n > MAX_WORKERS) {
    throw new Error(`At most ${MAX_WORKERS} workers (got ${n}).`)
  }

  const indexes = Array.from({ length: n }, (_, i) => i)
  await assertPortsFree(indexes.flatMap((i) => [sitePort(i), serverPort(i)]))

  await Promise.all([
    prepareDatabases(n),
    dev ? Promise.resolve() : prepareBuilds(n),
  ])

  console.log(`[e2e] Starting ${n} stack(s)…`)
  try {
    await Promise.all(
      indexes.map(async (i) => {
        await startStack(i, { dev })
        await assertServesOwnOrigin(i)
      })
    )
  } catch (error) {
    await stopStacks()
    throw error
  }

  return stopStacks
}
