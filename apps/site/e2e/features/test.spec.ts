import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import type { NGCTest } from '../fixtures/ngc-test'
import { getCarbonFootprintElem } from '../helpers/carbon-footprint'

test.setTimeout(250_000)
for (const persona of Object.values(personas)) {
  test(`It should work for persona « ${persona.nom} »`, async ({
    ngcTest,
    page,
  }) => {
    await ngcTest.goto()
    await ngcTest.answerTest(persona.situation)
    await expect(page).toHaveURL(/\/fin/)
  })
}

test.describe('It should be possible to deselect an answer', () => {
  test(`for boolean`, async ({ ngcTest, page }) => {
    await testDeselectAnswer(
      ngcTest,
      page,
      () => ngcTest.isBooleanQuestion(),
      () => ngcTest.page.getByTestId(new RegExp('oui-label'))
    )
  })

  test(`for multiple answer`, async ({ ngcTest, page }) => {
    await testDeselectAnswer(
      ngcTest,
      page,
      () => ngcTest.isChoicesQuestion(),
      () => ngcTest.page.getByTestId(/-label/).last()
    )
  })

  test(`for mosaic`, async ({ ngcTest, page }) => {
    await testDeselectAnswer(
      ngcTest,
      page,
      () => ngcTest.isSelectionMosaic(),
      () => ngcTest.page.getByTestId(/oui-label/).first()
    )
  })
})

/**
 * Helper function to test deselection behavior for any question type
 */
async function testDeselectAnswer(
  ngcTest: NGCTest,
  page: Page,
  isQuestionType: () => Promise<boolean>,
  getAnswerInput: () => Locator
) {
  //  1. Trouver la question du type spécifique
  await ngcTest.goto()
  while (!(await isQuestionType())) {
    await ngcTest.clickOnSkip()
  }

  //  2. Récupérer la valeur du bilan
  await page.waitForTimeout(1000)
  const carbonFootprintValueBeforeChange =
    await getCarbonFootprintElem(page).innerText()

  //  3. Selectionner une réponse
  const answerInput = getAnswerInput()
  await answerInput.click()

  //  4. Vérifier que le bouton suivant est affiché
  await expect(ngcTest.page.getByTestId('next-question-button')).toBeVisible()
  //  5. Recliquer sur l'element (input) en question
  await answerInput.click()

  //  6. Vérifier que la valeur du bilan est identique au 2.
  await page.waitForTimeout(2000)
  const carbonFootprintValueAfterChange = getCarbonFootprintElem(page)

  await expect(carbonFootprintValueAfterChange).toHaveText(
    carbonFootprintValueBeforeChange
  )

  //  7. Vérifier que le bouton « je ne sais pas » est affiché
  await expect(ngcTest.page.getByTestId('skip-question-button')).toBeVisible()
}
