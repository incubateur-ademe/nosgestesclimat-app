import { expect, test } from '../local/fixtures'

test('has a start button', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('main-cta').first()).toBeVisible()
})
