import { expect, test } from '../local/fixtures'

test('displays at least one news title', async ({ page }) => {
  await page.goto('/nouveautes')

  expect(page.getByTestId('news-title')).toBeDefined()
})
