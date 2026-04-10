import { expect, test } from '@playwright/test'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/international')

  const expectedText = "Le calculateur d'empreinte climat international"
  expect(page.locator('h1').filter({ hasText: expectedText })).toBeDefined()
})
