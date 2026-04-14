import { expect, test } from '@playwright/test'

export const PLAN_OUTILS_TITLE = 'plan-outils-title'
export const PLAN_ACTIONS_TITLE = 'plan-actions-title'

test('should render without breaking the app', async ({ page }) => {
  await page.goto('/plan-du-site')

  const expectedText = 'Plan du site'
  expect(page.locator('h1').filter({ hasText: expectedText })).toBeDefined()
})

test('should display hardcoded elements and dynamically generated elements (the actions list)', async ({
  page,
}) => {
  await page.goto('/plan-du-site')

  expect(page.getByTestId(PLAN_OUTILS_TITLE)).toBeDefined()
  expect(page.getByTestId(PLAN_ACTIONS_TITLE)).toBeDefined()
})
