import { defineConfig, devices } from '@playwright/test'
import { firefoxLaunchOptions, sharedConfig } from './playwright.shared'
import { localVisitorState } from './tests/local/fixtures'

/**
 * Local suite (tests/, except tests/preprod): run on the local e2e stack on
 * each PR. The preprod suite has its own config: playwright.preprod.config.ts.
 *
 * No setup project: each test seeds the data it needs in the e2e database
 * (core factories and services) and signs in through tests/helpers/session.
 */
export default defineConfig({
  ...sharedConfig,
  testDir: './tests',
  testIgnore: '**/preprod/**',
  use: {
    ...sharedConfig.use,
    storageState: localVisitorState(process.env.NEXT_PUBLIC_SITE_URL!),
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
