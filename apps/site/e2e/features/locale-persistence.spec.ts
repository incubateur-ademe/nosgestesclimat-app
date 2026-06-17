import { expect, test } from '@playwright/test'

test.describe('Locale persistence via cookie', () => {
  test('should switch to English locale after visiting /fr and navigating to /en', async ({
    page,
  }) => {
    await page.goto('/fr')

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

    await page.goto('/en')

    await expect(page).toHaveURL(/\/en/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('should switch to French locale after visiting /en and navigating to /fr', async ({
    page,
  }) => {
    await page.goto('/en')

    await expect(page).toHaveURL(/\/en/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.goto('/fr')

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })
})
