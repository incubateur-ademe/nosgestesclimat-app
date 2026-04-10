import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import { FixturesOptions } from './e2e/fixtures/options'
import { NEW_VISITOR_STATE } from './e2e/state'

dotenv.config({quiet: true})


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<FixturesOptions>({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL,
    trace: process.env.CI ? 'on-first-retry' : 'on',
    locale: 'fr-FR',
  },
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [['blob'], ['line']]
    : [['line'], ['html', { outputFolder: 'playwright-report' }]],


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
      },
    },
    {
      name: 'Mobile Safari',
      dependencies: ['global setup'],
      use: {
        ...devices['iPhone 12'],
        storageState: NEW_VISITOR_STATE,
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        reuseExistingServer: true,
        timeout: 120 * 1000,
        // env: process.env as Record<string, string>,
      },
})
