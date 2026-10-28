import type { Page } from '@playwright/test'

/**
 * Navigates to `url`, retrying when Firefox aborts the navigation.
 *
 * Every page fires requests after its load event (the layout calls a server
 * action on mount, links are prefetched…). Firefox aborts a navigation that
 * races such an in-flight request — `page.goto` then fails with
 * NS_BINDING_ABORTED under parallel load. The aborted navigation has already
 * canceled the page's pending requests, so a retry goes through.
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
