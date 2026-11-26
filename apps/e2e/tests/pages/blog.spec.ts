import { expect, test } from '../local/fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/blog')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('displays a list of articles, which are themselves displayed correctly', async ({
  page,
}) => {
  await page.goto('/blog')

  const articleLink = page.getByTestId('blog-list').locator('a').first()

  await expect(articleLink).toBeVisible()

  await articleLink.click()

  await expect(page).toHaveURL(/blog\/[a-z0-9/]+/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
