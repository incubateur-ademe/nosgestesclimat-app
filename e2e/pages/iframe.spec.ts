import { expect, test } from '@playwright/test'

test.describe('/demo-iframe-datashare.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demos/demo-iframe-datashare.html')
  })

  test('displays the data-share modal when simulation is complete', async ({
    page,
  }) => {
    const iframe = page.frameLocator('iframe').first()

    // await expect(iframe.getByTestId('do-the-test-link')).toBeVisible({
    //   timeout: 5000,
    // })
    await iframe.getByTestId('do-the-test-link').first().click({
      timeout: 3000,
    })

    await expect(iframe.getByTestId('skip-tutorial-button')).toBeVisible()
    await iframe.getByTestId('skip-tutorial-button').click()

    const ngcTest = iframe.locator('body')

    await expect(ngcTest.getByTestId('skip-question-button')).toBeVisible()

    while (
      !(await ngcTest
        .getByTestId('divers . tabac . consommation par semaine')
        .isVisible())
    ) {
      const skipButton = iframe.getByTestId('skip-question-button')
      if (await skipButton.isVisible()) {
        await skipButton.click()
      } else {
        break
      }
    }

    const endTestButton = iframe.getByTestId('end-test-button')
    if (await endTestButton.isVisible()) {
      await endTestButton.click()
    }

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
    expect(iframe.getByTestId('do-the-test-link')).toBeDefined()
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
