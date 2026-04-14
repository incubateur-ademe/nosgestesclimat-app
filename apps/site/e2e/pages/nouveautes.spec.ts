import { expect, test } from '@playwright/test'

test('displays at least one news title', async ({ page }) => {
  await page.goto('/nouveautes')

  expect(page.getByTestId('news-title')).toBeDefined()
})
