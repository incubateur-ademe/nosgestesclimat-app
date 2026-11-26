import { expect, test } from '../local/fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/international')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Le calculateur d’empreinte climat international',
    })
  ).toBeVisible()
})
