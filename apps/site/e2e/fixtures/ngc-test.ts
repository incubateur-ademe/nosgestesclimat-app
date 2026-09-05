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
    // Visible-only inputs: the question is remounted on each navigation
    // (key={currentQuestion}), but during a route transition the previous
    // question can stay mounted briefly, so counting only rendered inputs
    // avoids answering the same question twice.
    // count() is non-waiting on purpose: the page may not have rendered its
    // inputs yet on a loaded preprod, and all() would block until the test
    // timeout while the app is still navigating.
    const inputs = this.page.locator('input:visible')
    const inputCount = await inputs.count()
    let isAnswered = false
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
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

  // Progress is persisted when a question is submitted, not on a timer, so a
  // spec that needs the server to know about it waits for that server action.
  // Server actions POST with a `next-action` header, which sets them apart from
  // the RSC GETs the question query-param sync triggers.
  async waitForProgressSave(action: () => Promise<void>) {
    const progressSaved = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        !!response.request().headers()['next-action']
    )
    await action()
    await progressSaved
  }

  private endButton() {
    return this.page.getByTestId('end-test-button')
  }

  // Returns true when at least one enabled and actually visible copy of the
  // button is in the DOM. Checked atomically in a single evaluate: the testid
  // can sit on a span inside the button (the simulateur end button), and the
  // design-system Button disables via aria-disabled, which Playwright's
  // isEnabled() ignores — so the disabled state must be read from the closest
  // button/a ancestor. A single evaluate avoids blocking on locator methods
  // that auto-wait while the element vanishes mid-check.
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

  // Returns the text of the first visible question label, or null when no
  // question is displayed (navigation in flight, intercalaire pages).
  // <Label> is rendered by every question page — including the special
  // questions (voiture, textile, plats), which all render <Question>.
  private async getCurrentQuestionLabel(): Promise<string | null> {
    return await this.page.evaluate(() => {
      const label = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid="question-label"]')
      ).find(
        (el) =>
          el.getClientRects().length > 0 &&
          getComputedStyle(el).visibility !== 'hidden'
      )
      return label ? label.textContent.trim() : null
    })
  }

  // Resolves once the app has moved past the question identified by
  // previousLabel: a different question label is displayed, the end button
  // became clickable, or — on an intercalaire page, which has no question
  // label — a clickable skip button is available. Event-driven replacement
  // for a fixed sleep: waitForFunction polls at the browser's frame rate, so
  // the loop converges as fast as the app renders instead of paying a
  // constant delay per question. Waiting on the question label rather than
  // on a button predicate also makes a double-click impossible: the loop
  // cannot interact with the previous question again while its label is
  // still displayed.
  private async waitForQuestionChange(
    previousLabel: string | null,
    timeout = 30_000
  ) {
    await this.page.waitForFunction(
      ({ prev }: { prev: string | null }) => {
        const visibleLabel = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[data-testid="question-label"]'
          )
        ).find(
          (el) =>
            el.getClientRects().length > 0 &&
            getComputedStyle(el).visibility !== 'hidden'
        )
        const currentLabel = visibleLabel
          ? visibleLabel.textContent.trim()
          : null

        const isClickable = (testId: string) =>
          Array.from(
            document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)
          ).some((el) => {
            if (el.getClientRects().length === 0) return false
            if (getComputedStyle(el).visibility === 'hidden') return false
            // Same disabled-state logic as hasClickableButton: the testid can
            // sit on a span inside the button, so check the closest button/a
            // ancestor (native or aria-disabled).
            const clickable = el.closest('button, a')
            if (clickable?.hasAttribute('disabled')) return false
            if (clickable?.getAttribute('aria-disabled') === 'true')
              return false
            return true
          })

        // A new question is displayed.
        if (currentLabel !== null && currentLabel !== prev) return true
        // The test is over: the end button is clickable.
        if (isClickable('end-test-button')) return true
        // Intercalaire page: no question label, the skip button is the only
        // advancement signal.
        if (currentLabel === null && isClickable('skip-question-button'))
          return true

        return false
      },
      { prev: previousLabel },
      { timeout }
    )
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
    await this.skipButton()
      .click({ timeout: 2000 })
      .catch(() => undefined)
    return true
  }

  async skipAllQuestions() {
    let label = await this.getCurrentQuestionLabel()
    while (!(await this.canEndTest())) {
      if (await this.clickSkipIfPossible()) {
        // Navigation in flight: wait for the next question to render (or for
        // the end of the test) before looking for the next skip button.
        await this.waitForQuestionChange(label)
        label = await this.getCurrentQuestionLabel()
        continue
      }
      // No clickable skip button: the question is still rendering or the app
      // is navigating between pages. Wait for the UI to settle instead of
      // spinning on clicks.
      await this.waitForQuestionChange(label)
      label = await this.getCurrentQuestionLabel()
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
      const label = await this.getCurrentQuestionLabel()
      const isAnswered = await this.answerQuestion(situation)
      if (!isAnswered) {
        // Not a target question (or an input-less special question): skip it.
        // The "Je ne sais pas" button and the question's inputs render in the
        // same commit, so a clickable skip button means the question is fully
        // rendered — a target question whose inputs are still rendering can
        // never be skipped here.
        if (await this.clickSkipIfPossible()) {
          // Wait for the next question to render before interacting with it.
          await this.waitForQuestionChange(label)
          continue
        }
        // The question is still rendering (its inputs and the skip button
        // appear in the same commit): wait for it to be ready, then loop back
        // — a target question whose inputs just appeared will be answered,
        // the others skipped.
        await this.waitForQuestionChange(label)
        continue
      }
      // Target question answered: go to the next one. The click can race with
      // the fold that enables the button (and the last question shows the
      // end-test button instead), so retry on timeout rather than failing.
      const nextClicked = await this.page
        .getByTestId('next-question-button')
        .click({ timeout: 2000 })
        .then(() => true)
        .catch(() => false)
      if (!nextClicked) {
        continue
      }
      // Wait for the next question to render before reading its inputs.
      await this.waitForQuestionChange(label)
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
