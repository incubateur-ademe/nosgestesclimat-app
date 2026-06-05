import { expect, test } from '../fixtures'
import { DEFAULT_FLAGS } from '../fixtures/feature-flags'

test.setTimeout(60_000)

test('should redirect to simulator when clicking Passer on the age page', async ({
  page,
  featureFlags,
  tutorialPage,
}) => {
  // Enable the A/B test flag so the age page is shown
  await featureFlags.set({
    ...DEFAULT_FLAGS,
    'ab-test-question-tranche-dage': 'test',
  })

  await tutorialPage.start()
  await tutorialPage.skip()

  await expect(page).toHaveURL(/\/simulateur\/age/)

  await page.getByTestId('skip-age-button').click()

  await expect(page).toHaveURL(/\/simulateur\/bilan/)

  // The "skip question" button only appears when a question is displayed
  await expect(page.getByTestId('skip-question-button')).toBeVisible()

  // Disable the A/B test flag after the test
  await featureFlags.set({
    ...DEFAULT_FLAGS,
    'ab-test-question-tranche-dage': 'control',
  })
})
