// Must stay the first import: it points the process at its worker's stack
// before anything below reads the environment.
import './stack/worker-env.ts'

import { defineConfig, devices } from '@playwright/test'
import { firefoxLaunchOptions, sharedConfig } from './playwright.shared'
import { isDevMode } from './stack/config.ts'
import { localVisitorState } from './tests/local/fixtures'

const baseURL = process.env.NEXT_PUBLIC_SITE_URL!

/**
 * Local suite (tests/, except tests/preprod): run on local e2e stacks on each
 * PR. The preprod suite has its own config: playwright.preprod.config.ts.
 *
 * globalSetup starts one stack per worker (database, API, site, site worker,
 * see stack/); each test empties its worker's database, then seeds the data it
 * needs (core factories and services) and signs in through
 * tests/helpers/session. No setup project.
 */
export default defineConfig({
  ...sharedConfig,
  testDir: './tests',
  testIgnore: '**/preprod/**',
  globalSetup: './stack/global-setup.ts',
  // One stack per worker: Playwright's default (half the cores) would multiply
  // the stacks and the Postgres connections. Dev mode runs a single stack.
  workers: isDevMode() ? 1 : Number(process.env.E2E_WORKERS ?? 3),
  use: {
    ...sharedConfig.use,
    baseURL,
    storageState: localVisitorState(baseURL),
  },
  // Site and API come from globalSetup: Playwright only starts the mock server,
  // shared by the stacks. Its output goes next to their logs, uploaded by CI on
  // failure.
  webServer: {
    command: 'mkdir -p logs && pnpm mock > logs/mock.log 2>&1',
    port: 3002,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome HiDPI'],
      },
    },
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: firefoxLaunchOptions,
      },
    },
  ],
})
