import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/a-propos')
})

test('should render without breaking the app', ({ page }) => {
  const expectedText = 'À propos'
  expect(page.locator(`text=${expectedText}`)).toBeDefined()
})
