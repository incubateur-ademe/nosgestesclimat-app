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

  // Reading the clipboard can fail before anything was ever copied (or when the
  // document isn't focused): treat that as "empty" rather than an error.
  const readClipboard = () =>
    page.evaluate(() => navigator.clipboard.readText()).catch(() => '')

  // Clipboard write requires the document to be focused: with parallel workers,
  // this page may have lost focus, making writeText reject.
  await page.bringToFront()

  const contentBeforeCopy = await readClipboard()

  await copyAction()

  // `navigator.clipboard.writeText` resolves asynchronously and a click returns
  // as soon as the event is dispatched, so the write may still be in flight
  // here: read back until the new content lands.
  let clipboardContent = contentBeforeCopy

  await expect
    .poll(async () => {
      clipboardContent = await readClipboard()
      return clipboardContent
    })
    .not.toBe(contentBeforeCopy)

  return clipboardContent
}
