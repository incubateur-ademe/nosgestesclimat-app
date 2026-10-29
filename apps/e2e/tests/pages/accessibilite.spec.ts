import { expect, test } from '../local/fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/accessibilite')

  const expectedText = 'Accessibilité'
  expect(page.locator(`text=${expectedText}`)).toBeDefined()
})
