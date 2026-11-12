import type { Page } from '@playwright/test'

/**
 * Navigates to `url`, retrying when Firefox aborts the navigation.
 *
 * On a first visit, the server action every page calls on mount also saves the
 * region cookie, so Next.js refetches the page. A `page.goto` cancels that
 * refetch and Next.js falls back to `location.replace`. Firefox lets this
 * page-initiated navigation cancel the pending `page.goto`, which then fails
 * with NS_BINDING_ABORTED; Chromium ignores it. The cookie is saved by then, so
 * the retry triggers no refetch.
 *
 * Known Firefox behaviour, which Playwright will not work around:
 * - https://bugzilla.mozilla.org/show_bug.cgi?id=1263100
 *   (its title mentions `beforeunload`, but any script navigation does this)
 * - https://github.com/microsoft/playwright/issues/20749
 */
export async function gotoRetryOnAbort(page: Page, url: string, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(url)
      return
    } catch (error) {
      const aborted = /NS_BINDING_ABORTED/.test(
        error instanceof Error ? error.message : String(error)
      )
      if (!aborted || attempt >= attempts) {
        throw error
      }
    }
  }
}
