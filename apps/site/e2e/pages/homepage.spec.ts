import { expect, test } from '@playwright/test'

test('has a start button', ({ page }) => {
  expect(page.getByTestId('main-cta')).toBeDefined()
})
