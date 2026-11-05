import { defineConfig, devices } from '@playwright/test'
import { firefoxLaunchOptions, sharedConfig } from './playwright.shared'

/**
 * Preprod suite (tests/preprod): the critical journeys, run against the deployed
 * preprod before each production deploy. Each test starts as a new visitor: no
 * setup project, no recorded state.
 */
export default defineConfig({
  ...sharedConfig,
  testDir: './tests/preprod',
  // Labels every test of this suite in the reports.
  tag: '@preprod',
  // Full journeys, each with a whole simulation and often an email to read.
  timeout: 120_000,
  /* Wait for the site before running tests. */
  webServer: {
    command: 'pnpm -F @nosgestesclimat/site dev:e2e',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'Preprod Chrome',
      use: {
        ...devices['Desktop Chrome HiDPI'],
      },
    },
    {
      name: 'Preprod Firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: firefoxLaunchOptions,
      },
    },
    // We remove Safari testing. It tends to have a lot of false negative,
    // where the playwright test fails but the manual test on Browserstack are always passing.
    // We'll see if we can reenable later, once there is less sync logic on test...
    // {
    //   name: 'Preprod Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],
})
