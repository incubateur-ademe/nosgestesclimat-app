/**
 * Monkey-patches `page.getByTestId` to always filter by `{ visible: true }`.
 *
 * With `cacheComponents`, React <Activity> keeps previous routes in the DOM
 * (hidden via `display: none`). Playwright locators would otherwise match
 * those hidden copies and fail strict-mode.
 *
 * Call this once per page (the fixture below does it for `page` from the
 * test fixture; `createPage` in feature-flags.ts does it for pages created
 * via `browser.newPage()`).
 */
import type { Page } from '@playwright/test'

export function patchGetByTestId(page: Page) {
  const original = page.getByTestId.bind(page)
  ;(page as unknown as { getByTestId: typeof page.getByTestId }).getByTestId =
    ((id: string | RegExp) =>
      original(id).filter({ visible: true })) as typeof page.getByTestId
}

import { test as base } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    patchGetByTestId(page)
    await use(page)
  },
})
