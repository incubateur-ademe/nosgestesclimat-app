import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import type { NGCTest } from '../fixtures/ngc-test'

test.setTimeout(250_000)
for (const persona of Object.values(personas)) {
  test(`It should work for persona « ${persona.nom} »`, async ({
    ngcTest,
    page,
  }) => {
    await ngcTest.start()
    await ngcTest.answerTest(persona.situation)
    await expect(page).toHaveURL(/\/fin/)
  })
}

test.describe('It should be possible to click "Je ne sais pas" after answering (NGC-3320)', () => {
  test(`for boolean`, async ({ ngcTest, page }) => {
    await testSkipAfterAnswer(
      ngcTest,
      page,
      () => ngcTest.isBooleanQuestion(),
      () => ngcTest.page.getByTestId(/oui-label/).first()
    )
  })

  test(`for choices`, async ({ ngcTest, page }) => {
    await testSkipAfterAnswer(
      ngcTest,
      page,
      () => ngcTest.isChoicesQuestion(),
      () => ngcTest.page.getByTestId(/-label/).first()
    )
  })

  test(`for mosaic`, async ({ ngcTest, page }) => {
    await testSkipAfterAnswer(
      ngcTest,
      page,
      () => ngcTest.isSelectionMosaic(),
      () => ngcTest.page.getByTestId(/oui-label/).first()
    )
  })
})

/**
 * Helper to test "Je ne sais pas" after answering for any question type.
 *
 * Tests the new behavior:
 * - The "Je ne sais pas" button stays enabled after answering
 * - Clicking it after answering navigates to the next question
 * - The question text actually changes
 */
async function testSkipAfterAnswer(
  ngcTest: NGCTest,
  page: Page,
  isQuestionType: () => Promise<boolean>,
  getAnswerInput: () => Locator
) {
  // 1. Find a question of the expected type
  await ngcTest.start()

  const questionLabel = page.getByTestId('question-label')

  while (!(await isQuestionType())) {
    const previousText = (await questionLabel.textContent()) ?? ''
    await ngcTest.skipButton().click()
    // Guard: fail cleanly instead of looping if we hit the last question
    await expect(questionLabel).not.toHaveText(previousText, { timeout: 5_000 })
  }

  // 2. Capture current question text to verify it changes later
  const initialQuestionText = (await questionLabel.textContent()) ?? ''

  // 3. Verify skip button is visible and enabled (always active)
  await expect(ngcTest.skipButton()).toBeVisible()
  await expect(ngcTest.skipButton()).toBeEnabled()

  // 4. Select an answer
  const answerInput = getAnswerInput()
  await answerInput.click()

  // 5. Verify next button appears (answer registered)
  await expect(ngcTest.page.getByTestId('next-question-button')).toBeVisible()

  // 6. Click "Je ne sais pas" AFTER answering (new behavior)
  await ngcTest.skipButton().click()

  // 7. Verify navigation happened: question text changed
  await expect(questionLabel).not.toHaveText(initialQuestionText, {
    timeout: 10_000,
  })

  // 8. Verify continued navigation works
  await ngcTest.skipButton().click()
  await expect(ngcTest.skipButton()).toBeVisible()
}
