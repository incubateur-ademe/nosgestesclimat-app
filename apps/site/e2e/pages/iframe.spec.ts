import { expect, test, type Page } from '@playwright/test'
import { NGCTest } from '../fixtures/ngc-test'

test.describe('/demo-iframe-datashare.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/demo-iframe-datashare.html')
  })

  test('displays the data-share modal when simulation is complete', async ({
    page,
  }) => {
    const iframe = page.frameLocator('iframe').first()

    await iframe.getByTestId('main-cta').first().click({
      timeout: 3000,
    })

    await iframe.getByTestId('skip-tutorial-button').click()
    const ngcTest = new NGCTest(iframe.locator('body') as unknown as Page)
    await ngcTest.skipAllQuestions()

    await expect(
      iframe.locator('[data-testid="iframe-datashare-modal"]')
    ).toBeVisible({
      timeout: 10000,
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

  test('displays the iframe correctly', ({ page }) => {
    const iframe = page.frameLocator('iframe').first()
    expect(iframe.getByTestId('main-cta')).toBeDefined()
  })
})

test.describe('/demo-iframeSimulation.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo-iframeSimulation.html')
  })

  test('displays the iframe correctly', ({ page }) => {
    const iframe = page.frameLocator('iframe').first()
    expect(iframe.getByTestId('skip-tutorial-button')).toBeDefined()
  })
})
