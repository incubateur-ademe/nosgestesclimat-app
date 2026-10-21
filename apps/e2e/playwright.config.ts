import { defineConfig, devices } from '@playwright/test'
import { firefoxLaunchOptions, sharedConfig } from './playwright.shared'
import type { FixturesOptions } from './tests/fixtures/options'

/**
 * Local suite (tests/, except tests/preprod): run on the local e2e stack on
 * each PR. The preprod suite has its own config: playwright.preprod.config.ts.
 */
export default defineConfig<FixturesOptions>({
  ...sharedConfig,
  testDir: './tests',
  testIgnore: '**/preprod/**',
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
