import { expect } from '@playwright/test'
import { test } from '../fixtures/index'

test.describe('/demo-iframe-datashare.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/demo-iframeSimulation-datashare.html')
  })

  test('displays the data-share modal when simulation is complete', async ({
    page,
  }) => {
    await page.waitForTimeout(3000)
    const iframe = page.frameLocator('iframe').first()

    // Click skip-tutorial-button inside the iframe
    await iframe.getByTestId('skip-tutorial-button').click()

    // // Wait for navigation to complete / need to get the iframe after page change
    await expect(
      page.frameLocator('iframe').first().getByTestId('skip-question-button')
    ).toBeVisible()

    // In production builds, a full page navigation inside the iframe destroys
    // the underlying Frame object and creates a new one. Storing a reference to
    // `iframe.locator('body')` (as NGCTest does) keeps a handle on the old,
    // now-invalid Frame, causing "Target page, context or browser has been closed"
    // errors on subsequents calls to `isVisible()` or `click()`.
    //
    // To avoid this, we re-acquire the FrameLocator on every iteration via
    // `page.frameLocator('iframe').first()`. Each call returns a fresh reference
    // to the current (live) Frame — even after navigation.
    //
    // We also use `.catch()` around `isVisible` / `click` to guard against
    // transient frame-disconnect errors that can occur while the iframe is still
    // settling after a navigation.
    for (let i = 0; i < 100; i++) {
      const endButton = iframe.getByTestId('end-test-button')
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (
        // eslint-disable-next-line playwright/no-conditional-in-test
        (await endButton.isVisible().catch(() => false)) &&
        (await endButton.isEnabled().catch(() => false))
      ) {
        await endButton.click()
        break
      }
      const skipButton = iframe.getByTestId('skip-question-button')
      await skipButton.click({ timeout: 3000 }).catch(() => {
        // Do nothing
      })
    }

    await expect(
      iframe.locator('[data-testid="iframe-datashare-modal"]')
    ).toBeVisible({
      timeout: 15000,
    })

    await expect(iframe.getByTestId('iframe-datashare-title')).toBeVisible()
    await expect(iframe.getByTestId('iframe-datashare-accepter')).toBeVisible()
    await expect(iframe.getByTestId('iframe-datashare-refuser')).toBeVisible()
  })
})

test.describe('/demo-iframe.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo-iframe.html')
  })

  test('displays the iframe correctly', async ({ page }) => {
    const iframe = page.frameLocator('iframe').first()

    await expect(iframe.getByTestId('main-cta').first()).toBeVisible()
  })
})

test.describe('/demo-iframeSimulation.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo-iframeSimulation.html')
  })

  test('displays the iframe correctly', async ({ page }) => {
    const iframe = page.frameLocator('iframe').first()
    await expect(iframe.getByTestId('skip-tutorial-button')).toBeVisible()
  })
})

test.describe('/demos/demo-iframeSimulation-fr.html', () => {
  test.use({ locale: 'en-US' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/demo-iframeSimulation-fr.html')
  })

  test('displays the French version even when the browser is in English', async ({
    page,
  }) => {
    const iframe = page.frameLocator('iframe').first()
    await expect(iframe.getByTestId('skip-tutorial-button')).toBeVisible({
      timeout: 10000,
    })
    await expect(iframe.getByTestId('skip-tutorial-button')).toContainText(
      "C'est parti !"
    )
  })
})

test.describe('/demos/demo-iframeSimulation-en.html', () => {
  test.use({ locale: 'fr-FR' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/demo-iframeSimulation-en.html')
  })

  test('displays the English version even when the browser is in French', async ({
    page,
  }) => {
    const iframe = page.frameLocator('iframe').first()
    await expect(iframe.getByTestId('skip-tutorial-button')).toBeVisible({
      timeout: 10000,
    })
    await expect(iframe.getByTestId('skip-tutorial-button')).toContainText(
      'Start now!'
    )
  })
})
