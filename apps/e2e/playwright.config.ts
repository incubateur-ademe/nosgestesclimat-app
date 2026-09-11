import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import type { FixturesOptions } from './tests/fixtures/options'
import { NEW_VISITOR_STATE } from './tests/state'

dotenv.config({ quiet: true })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<FixturesOptions>({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL,
    trace: process.env.CI ? 'on-first-retry' : 'on',
    locale: 'fr-FR',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [['blob'], ['line'], ['./reporters/hydration-summary.ts']]
    : [
        ['line'],
        ['html', { outputFolder: 'playwright-report' }],
        ['./reporters/hydration-summary.ts'],
      ],

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
      use: {
        setup: true, // Custom option passed to fixtures (to launch them in setup mode)
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Chrome',
      dependencies: ['global setup'],
      use: {
        ...devices['Desktop Chrome HiDPI'],
        storageState: NEW_VISITOR_STATE,
      },
    },
    {
      name: 'Firefox',
      dependencies: ['global setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: NEW_VISITOR_STATE,
        // Without this testing pref, `navigator.clipboard.readText()` returns
        // an empty string in headless Firefox (the API requires a user
        // gesture): the "invite link" tests were flaky and needed an extra
        // retry. Chromium gets the permissions via `grantPermissions` instead.
        launchOptions: {
          firefoxUserPrefs: { 'dom.events.testing.asyncClipboard': true },
        },
      },
    },
    // We remove Safari testing. It tends to have a lot of false negative,
    // where the playwright test fails but the manual test on Browserstack are always passing.
    // We'll see if we can reenable later, once there is less sync logic on test...
    // {
    //   name: 'Mobile Safari',
    //   dependencies: ['global setup'],
    //   use: {
    //     ...devices['iPhone 12'],
    //     storageState: NEW_VISITOR_STATE,
    //   },
    // },
  ],
  /* Wait for the site before running tests. Locally it starts the dev server;
     in CI it reuses the one launched by .github/scripts/e2e-stack.sh. */
  webServer: {
    command: 'pnpm -F @nosgestesclimat/site dev:e2e',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})
