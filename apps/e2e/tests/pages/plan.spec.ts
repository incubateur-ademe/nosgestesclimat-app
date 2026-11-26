import { expect, test } from '../local/fixtures'

export const PLAN_OUTILS_TITLE = 'plan-outils-title'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/plan-du-site')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Plan du site' })
  ).toBeVisible()
  await expect(page.getByTestId(PLAN_OUTILS_TITLE)).toBeVisible()
})
