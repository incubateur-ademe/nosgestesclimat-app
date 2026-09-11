import { test as base, expect } from '@playwright/test'

/**
 * Fails the test as soon as an asset served from `/_next/static/…` comes back
 * in error.
 *
 * That is the signature of a *deployment skew*: the HTML the browser received
 * was built by a previous deployment (e.g. served from a proxy cache), so the
 * chunk it references no longer exists in the container → 404 → React never
 * hydrates. The page « looks » fine but is inert (no cookie banner, dead
 * buttons), which used to surface as a cryptic locator timeout
 * (`cookie-banner-refuse-button` never visible).
 *
 * Auto-applied to every test (including the global setup) so the real cause is
 * always reported next to the first failure.
 */
export const test = base.extend<{ staticAssetsAreServed: void }>({
  staticAssetsAreServed: [
    async ({ page }, use) => {
      const failures: string[] = []

      page.on('response', (response) => {
        if (
          response.status() >= 400 &&
          new URL(response.url()).pathname.startsWith('/_next/static/')
        ) {
          failures.push(`${response.status()} ${response.url()}`)
        }
      })

      await use()

      expect(
        failures,
        `Next static assets failed to load — the served HTML probably comes from a previous deployment (proxy cache?): \n${failures.join('\n')}`
      ).toEqual([])
    },
    { auto: true },
  ],
})
