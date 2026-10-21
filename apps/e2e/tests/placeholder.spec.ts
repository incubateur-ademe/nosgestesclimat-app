import { expect, test } from './fixtures'

// Keeps the local suite non-empty until the first real local test lands:
// delete it then.
test('the site is up', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.ok()).toBe(true)
})
