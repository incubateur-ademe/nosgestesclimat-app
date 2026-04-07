import type { Situation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Page } from '@playwright/test'
import { TutorialPage, test as base, expect } from './tutorial'

export class NGCTest {
  constructor(
    public readonly page: Page,
    public readonly tutorialPage: TutorialPage = new TutorialPage(page)
  ) {}

  async goto() {
    await this.tutorialPage.goto()
    await this.tutorialPage.skip()
  }

  async answerQuestion(situation: Situation) {
    const inputs = this.page.locator('input')
    let isAnswered = false
    for (const input of await inputs.all()) {
      const testId = await input.getAttribute('data-testid')
      if (!testId) {
        continue
      }
      const [dottedName, answer] = testId.split('-')
      if (!(dottedName in situation)) {
        continue
      }
      const value = situation[dottedName as DottedName]

      if (
        typeof value === 'string' &&
        (value === `'${answer}'` || value === answer)
      ) {
        await this.page.getByTestId(`${dottedName}-${answer}-label`).click()
        isAnswered = true
        continue
      }
      if (typeof value === 'number') {
        // Check if there's a switch to select main unit (for questions with assistance)
        const mainUnitSwitch = this.page.getByTestId('switch-main-unit')
        if (await mainUnitSwitch.isVisible()) {
          await mainUnitSwitch.click()
        }
        // @TODO : when copying a number with a "." instead of ",", it removes it
        await this.page
          .getByTestId(dottedName)
          .fill(String(value).replace('.', ','))

        isAnswered = true
        continue
      }
    }
    if (isAnswered) {
      await this.page.getByTestId('next-question-button').click()
    } else {
      await this.clickOnSkip()
    }
  }

  async clickOnSkip() {
    await this.page.getByTestId('skip-question-button').click()
  }

  async isLastQuestion() {
    return this.page
      .getByTestId('services sociétaux . question rhétorique-ok-label')
      .isVisible()
  }

  async isBooleanQuestion() {
    // if boolean question, test id contains "oui" or "non"
    const ouiCount = await this.page.getByTestId(/oui-label/).count()
    const nonCount = await this.page.getByTestId(/non-label/).count()
    return ouiCount === 1 && nonCount === 1
  }

  async isChoicesQuestion() {
    // we consider that if there are more than 3 labels (question label + at least 3 answers), it's a choices question
    const labelInput = await this.page.getByTestId(/-label/).count()
    return labelInput > 3
  }

  async isSelectionMosaic() {
    // we consider that if there are more than 2 oui-label, it's a selection mosaic question
    const labelInput = await this.page.getByTestId(/oui-label/).count()
    return labelInput > 2
  }

  async skipAll() {
    await this.goto()
    await this.skipAllQuestions()
  }

  async skipAllQuestions() {
    while (!(await this.isLastQuestion())) {
      await this.clickOnSkip()
    }
    await this.page.getByTestId('end-test-button').click()
  }

  async answerTest(situation: Situation) {
    // @TODO : test that there are no unit warning in publicodes
    while (!(await this.isLastQuestion())) {
      await this.answerQuestion(situation)
    }
    await this.page.getByTestId('end-test-button').click()
  }
}

interface NGCPageFixtures {
  ngcTest: NGCTest
}
const test = base.extend<NGCPageFixtures>({
  ngcTest: async ({ page, tutorialPage }, use) => {
    await use(new NGCTest(page, tutorialPage))
  },
})

export { expect, test }
