import { expect, test } from '../local/fixtures'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/diffuser')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Diffuser Nos Gestes Climat' })
  ).toBeVisible()
})
