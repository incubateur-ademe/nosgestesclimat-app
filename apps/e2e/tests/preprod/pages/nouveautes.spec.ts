import { expect, test } from '../fixtures'

test('displays at least one news title', async ({ page }) => {
  await page.goto('/nouveautes')

  expect(page.getByTestId('news-title')).toBeDefined()
})
