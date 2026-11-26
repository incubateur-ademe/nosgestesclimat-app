import { expect, test } from '../local/fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/nos-relais')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Ils relaient Nos Gestes Climat',
    })
  ).toBeVisible()
})
