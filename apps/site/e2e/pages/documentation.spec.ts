import { expect, test } from '@playwright/test'

export const DOCUMENTATION_TITLE = 'documentation-title'
export const DOCUMENTATION_LAUNCH_BUTTON = 'documentation-launch-button'

test('/documentation', async ({ page }) => {
  await page.goto('/documentation')

  expect(
    page.getByRole('heading', { level: 1, name: 'Documentation' })
  ).toBeDefined()
})

test.describe('/documentation/bilan', () => {
  test('should render without breaking the app (server side rendered)', async ({
    page,
  }) => {
    await page.goto('/documentation/bilan')

    expect(page.getByTestId(DOCUMENTATION_TITLE)).toBeDefined()
  })

  test('should render the client side documentation upon click on the launch button', async ({
    page,
  }) => {
    await page.goto('/documentation/bilan')

    await page.getByTestId(DOCUMENTATION_LAUNCH_BUTTON).click()

    expect(page.locator('div[id="documentation-rule-root"]')).toBeDefined()
  })
})
