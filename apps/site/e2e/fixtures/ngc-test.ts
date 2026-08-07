import type { Situation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Page } from '@playwright/test'
import { TutorialPage, test as base, expect } from './tutorial'

export class NGCTest {
  constructor(
    public readonly page: Page,
    public readonly tutorialPage: TutorialPage = new TutorialPage(page)
  ) {}

  async start() {
    await this.tutorialPage.start()
    await this.tutorialPage.skip()
  }

  private async answerQuestion(situation: Situation) {
    // count() (non-waiting) instead of all(): the question page may not have
    // rendered its inputs yet on a loaded preprod, and all() would block
    // until the test timeout while the app is still navigating.
    const inputCount = await this.page.locator('input').count()
    let isAnswered = false
    for (let i = 0; i < inputCount; i++) {
      const input = this.page.locator('input').nth(i)
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
    return isAnswered
  }

  skipButton() {
    return this.page.getByTestId('skip-question-button')
  }

  private endButton() {
    return this.page.getByTestId('end-test-button')
  }

  // Returns true when at least one enabled and actually visible copy of the
  // button is in the DOM. Checked atomically in a single evaluate: the
  // visible-testid patch appends { visible: true } to getByTestId, and
  // isEnabled() on such a locator waits forever when the visible copy
  // disappears mid-check (React <Activity> keeps a hidden copy mounted while
  // the app navigates between questions), which previously stalled the whole
  // skip loop until the hook timeout.
  private async hasClickableButton(testId: string) {
    return await this.page.evaluate((id) => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)
      )
      return elements.some((el) => {
        if (el.getClientRects().length === 0) return false
        if (getComputedStyle(el).visibility === 'hidden') return false
        // The testid sometimes sits on a span inside the clickable button
        // (the simulateur end button); the disabled state then lives on the
        // closest button/a ancestor, as either a native disabled attribute
        // or an aria-disabled one (the design-system Button uses the latter).
        const clickable = el.closest('button, a')
        if (clickable?.hasAttribute('disabled')) return false
        if (clickable?.getAttribute('aria-disabled') === 'true') return false
        return true
      })
    }, testId)
  }

  private async canEndTest() {
    // The end button stays disabled until the current question is folded;
    // ending too early makes the following click wait for an enabled state
    // that never comes.
    return await this.hasClickableButton('end-test-button')
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
    await this.start()
    await this.skipAllQuestions()
  }

  // Clicks the skip button when it is available. Returns true when a click
  // was dispatched. The button is disabled once a question is answered and
  // absent while the app is navigating, in which case callers should wait
  // briefly instead of hot-looping.
  private async clickSkipIfPossible() {
    if (!(await this.hasClickableButton('skip-question-button'))) {
      return false
    }
    await this.skipButton().click({ timeout: 2000 }).catch(() => undefined)
    return true
  }

  async skipAllQuestions() {
    while (!(await this.canEndTest())) {
      if (await this.clickSkipIfPossible()) {
        continue
      }
      // Navigation in flight or the last question is being folded. Give the
      // UI time to catch up instead of spinning on clicks.
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    // The end button is clickable. Do not wait for the client-side navigation
    // it triggers: the implicit navigation wait can time out when the RSC
    // request stalls. Wait for it explicitly below with a generous timeout
    // instead, so every caller is covered regardless of its own assertion.
    await this.endButton().click({ noWaitAfter: true, timeout: 5000 })
    // End of test: the app either shows the result page or asks for the email
    // first. Wait for either before returning.
    await this.page.waitForURL(/\/(fin|simulateur\/email)/, { timeout: 30_000 })
  }

  async answerTest(situation: Situation) {
    while (!(await this.canEndTest())) {
      const isAnswered = await this.answerQuestion(situation)
      if (!isAnswered) {
        if (await this.clickSkipIfPossible()) {
          continue
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
        continue
      }
      try {
        await this.page
          .getByTestId('next-question-button')
          .click({ timeout: 2000 })
      } catch {
        continue
      }
    }
    await this.endButton().click({ noWaitAfter: true, timeout: 5000 })
    await this.page.waitForURL(/\/(fin|simulateur\/email)/, { timeout: 30_000 })
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
