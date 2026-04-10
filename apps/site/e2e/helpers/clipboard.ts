import type { Page } from '@playwright/test'
import { test } from '@playwright/test'

/**
 * Reads the clipboard content after clicking on a button.
 *
 * Handles:
 * - Granting clipboard permissions on Chromium
 * - Skipping on WebKit (clipboard read not supported yet)
 *
 * @see https://github.com/microsoft/playwright/issues/13037
 */
export async function copyAndReadClipboard({
  page,
  copyAction,
}: {
  page: Page
  copyAction: () => Promise<void>
}): Promise<string> {
  const browser = page.context().browser()

  if (browser?.browserType().name() === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }

  if (browser?.browserType().name() === 'webkit') {
    test.skip()
  }

  await copyAction()

  return page.evaluate(() => navigator.clipboard.readText())
}
