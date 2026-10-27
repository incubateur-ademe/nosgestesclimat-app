import { expect, test } from '../local/fixtures'

test.beforeEach(async ({ page }) => {
  await page.goto('/a-propos')
})

test('should render without breaking the app', ({ page }) => {
  const expectedText = 'À propos'
  expect(page.locator(`text=${expectedText}`)).toBeDefined()
})
