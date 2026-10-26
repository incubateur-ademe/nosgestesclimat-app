import { expect, test } from '../fixtures'

test('has a start button', ({ page }) => {
  expect(page.getByTestId('main-cta')).toBeDefined()
})
