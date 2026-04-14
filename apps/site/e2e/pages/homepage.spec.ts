import { expect, test } from '@playwright/test'

test('has a start button', ({ page }) => {
  expect(page.getByTestId('do-the-test-link')).toBeDefined()
})
