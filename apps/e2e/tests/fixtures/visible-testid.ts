/**
 * Monkey-patches `page.getByTestId` to always filter by `{ visible: true }`.
 *
 * During route transitions the previous page stays mounted until the new one
 * commits, so a testid can briefly exist in several states at once. Filtering
 * by visibility keeps locators from matching a copy that is not the one the
 * user sees.
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
