import { expect, test } from '../fixtures'

test('should display 404 page', async ({ page }) => {
  await page.goto('/definitely-not-a-page-url')

  expect(page.locator('h1')).toBeDefined()
  expect(page.getByTestId('404')).toBeDefined()
})
