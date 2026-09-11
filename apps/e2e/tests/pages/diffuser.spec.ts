import { expect, test } from '@playwright/test'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/diffuser')

  expect(
    page.locator('h1').filter({ hasText: 'Diffuser Nos Gestes Climat' })
  ).toBeDefined()
})
