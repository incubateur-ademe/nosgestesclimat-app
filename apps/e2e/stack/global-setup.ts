import type { FullConfig } from '@playwright/test'
import { prepareBuilds } from './builds.ts'
import { isDevMode, MAX_WORKERS, serverPort, sitePort } from './config.ts'
import { prepareDatabases } from './databases.ts'
import { assertPortsFree, startStack, stopStacks } from './processes.ts'

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
    await Promise.all(indexes.map((i) => startStack(i, { dev })))
  } catch (error) {
    await stopStacks()
    throw error
  }

  return stopStacks
}
