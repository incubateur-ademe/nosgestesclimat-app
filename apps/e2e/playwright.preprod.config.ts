import { defineConfig, devices } from '@playwright/test'
import { firefoxLaunchOptions, sharedConfig } from './playwright.shared'
import type { FixturesOptions } from './tests/preprod/fixtures/options'
import { NEW_VISITOR_STATE } from './tests/state'

/**
 * Preprod suite (tests/preprod): run against the deployed preprod before each
 * production deploy.
 */
export default defineConfig<FixturesOptions>({
  ...sharedConfig,
  testDir: './tests/preprod',
  // Labels every test of this suite in the reports.
  tag: '@preprod',
  projects: [
    {
      name: 'Preprod setup',
      testMatch: /global\.setup\.ts/,
      use: {
        setup: true, // Custom option passed to fixtures (to launch them in setup mode)
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Preprod Chrome',
      dependencies: ['Preprod setup'],
      use: {
        ...devices['Desktop Chrome HiDPI'],
        storageState: NEW_VISITOR_STATE,
      },
    },
    {
      name: 'Preprod Firefox',
      dependencies: ['Preprod setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: NEW_VISITOR_STATE,
        launchOptions: firefoxLaunchOptions,
      },
    },
    // We remove Safari testing. It tends to have a lot of false negative,
    // where the playwright test fails but the manual test on Browserstack are always passing.
    // We'll see if we can reenable later, once there is less sync logic on test...
    // {
    //   name: 'Preprod Mobile Safari',
    //   dependencies: ['Preprod setup'],
    //   use: {
    //     ...devices['iPhone 12'],
    //     storageState: NEW_VISITOR_STATE,
    //   },
    // },
  ],
})
