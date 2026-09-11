import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Reads the clipboard content after clicking on a button.
 *
 * Handles:
 * - Granting clipboard permissions on Chromium
 * - Skipping on WebKit (clipboard read not supported yet)
 * - Firefox: the project enables the `dom.events.testing.asyncClipboard` pref
 *   (see playwright.config.ts), without which `navigator.clipboard.readText()`
 *   returns an empty string in headless mode
 *
 * The click is not retried: it used to be, to paper over the hydration
 * mismatches that made React replace the clicked node. Those are fixed and
 * guarded by `fixtures/hydration-guard.ts`, so a click that has no effect now
 * has to fail the test rather than be silently replayed.
 *
 * @see https://github.com/microsoft/playwright/issues/13037
 */
export async function copyAndReadClipboard({
  page,
  copyAction,
  timeout = 10_000,
}: {
  page: Page
  copyAction: () => Promise<void>
  timeout?: number
}): Promise<string> {
  const browser = page.context().browser()

  if (browser?.browserType().name() === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }

  if (browser?.browserType().name() === 'webkit') {
    test.skip()
  }

  // Reading the clipboard can fail before anything was ever copied (or when the
  // document isn't focused): treat that as "empty" rather than an error.
  const readClipboard = () =>
    page.evaluate(() => navigator.clipboard.readText()).catch(() => '')

  // Clipboard writes are refused when the document isn't focused.
  await page.bringToFront()

  const contentBeforeCopy = await readClipboard()

  await copyAction()

  // `navigator.clipboard.writeText` resolves asynchronously and a click returns
  // as soon as the event is dispatched, so the write may still be in flight
  // here: read back until the new content lands.
  let clipboardContent = contentBeforeCopy

  await expect
    .poll(
      async () => {
        clipboardContent = await readClipboard()
        return clipboardContent
      },
      { timeout }
    )
    .not.toBe(contentBeforeCopy)

  return clipboardContent
}
