import { test as base, expect } from '@playwright/test'

/**
 * Fails the test as soon as an asset served from `/_next/static/…` comes back in
 * error: the chunk no longer exists, so the served HTML comes from another
 * deployment and React will never hydrate (page that looks fine but is inert,
 * e.g. no cookie banner). Auto-applied so the cause is reported with the first
 * failure instead of a cryptic locator timeout.
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
