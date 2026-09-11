import { expect, test } from '../fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/nos-relais')

  const expectedText = 'Ils relaient Nos Gestes Climat'
  expect(page.locator('h1').filter({ hasText: expectedText })).toBeDefined()
})
