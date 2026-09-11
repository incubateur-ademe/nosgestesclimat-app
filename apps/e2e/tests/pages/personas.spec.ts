import { expect, test } from '../fixtures'

test('has a title', async ({ page }) => {
  await page.goto('/personas')

  expect(page.getByTestId('personas-title')).toBeDefined()
})
