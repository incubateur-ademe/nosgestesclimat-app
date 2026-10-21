import type { PlaywrightTestConfig } from '@playwright/test'
import dotenv from 'dotenv'
import type { FixturesOptions } from './tests/fixtures/options'
import { BREVO_TEST_TIMEOUT_MS } from './tests/mailbox/brevo-mailbox'

dotenv.config({ quiet: true })

// Without this testing pref, `navigator.clipboard.readText()` returns an empty
// string in headless Firefox (the API requires a user gesture): the "invite
// link" tests were flaky and needed an extra retry. Chromium gets the
// permissions via `grantPermissions` instead.
export const firefoxLaunchOptions = {
  firefoxUserPrefs: { 'dom.events.testing.asyncClipboard': true },
}

/**
 * Settings shared by playwright.config.ts (local suite) and
 * playwright.preprod.config.ts (preprod suite).
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export const sharedConfig: PlaywrightTestConfig<FixturesOptions> = {
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
  // La lecture du code de vérification par Brevo impose de patienter (cf.
  // tests/mailbox/brevo-mailbox.ts) : timeout élargi dans ce cas seulement.
  timeout: process.env.E2E_MAILBOX === 'brevo' ? BREVO_TEST_TIMEOUT_MS : 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [['blob'], ['line']]
    : [['line'], ['html', { outputFolder: 'playwright-report' }]],
  /* Wait for the site before running tests. Locally it starts the dev server;
     in CI it reuses the one launched by .github/scripts/e2e-stack.sh. */
  webServer: {
    command: 'pnpm -F @nosgestesclimat/site dev:e2e',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
}
