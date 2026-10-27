import { expect, test } from '../local/fixtures'

test('has a start button', ({ page }) => {
  expect(page.getByTestId('main-cta')).toBeDefined()
})
