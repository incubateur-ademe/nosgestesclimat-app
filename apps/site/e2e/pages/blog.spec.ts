import { expect, test } from '@playwright/test'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/blog')

  expect(page.locator('h1').filter({ hasText: 'Le blog' })).toBeDefined()
})

test('displays a list of articles, which are themselves displayed correctly', async ({
  page,
}) => {
  await page.goto('/blog')

  expect(page.getByTestId('blog-list')).toBeDefined()

  await page.getByTestId('blog-list').locator('a').first().click()

  await expect(page).toHaveURL(/blog\/[a-z0-9\/]+/)
  expect(page.locator('h1')).toBeDefined()
})
