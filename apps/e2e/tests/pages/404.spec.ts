import { expect, test } from '../local/fixtures'

test('should display 404 page', async ({ page }) => {
  await page.goto('/definitely-not-a-page-url')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('404')).toBeVisible()
})
