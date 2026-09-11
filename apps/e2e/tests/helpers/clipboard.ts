import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Returns the content of the clipboard after clicking on a copy button.
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
  timeout = 15_000,
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

  const contentBeforeCopy = await readClipboard()

  let clipboardContent = contentBeforeCopy

  // The click can be lost. These pages keep the main thread busy for seconds
  // after load (publicodes parsing, plus a full re-render while React recovers
  // from a hydration mismatch), and a click dispatched in that window lands on
  // nodes React is replacing. So retry the whole interaction, waiting for the
  // asynchronous `writeText` in between so a lost click is not mistaken for a
  // slow write.
  await expect(async () => {
    await page.bringToFront()
    await copyAction()

    await expect
      .poll(readClipboard, { timeout: 2_000 })
      .not.toBe(contentBeforeCopy)

    clipboardContent = await readClipboard()
  }).toPass({ timeout, intervals: [0, 500, 1_000, 2_000] })

  return clipboardContent
}
