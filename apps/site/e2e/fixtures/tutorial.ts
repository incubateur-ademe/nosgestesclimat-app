import { test as base, expect, type Page } from '@playwright/test'

export class TutorialPage {
  static SKIP_TUTORIAL_BUTTON = 'skip-tutorial-button'
  static URL = '/tutoriel'

  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto(TutorialPage.URL)
  }

  async skip() {
    await this.page.waitForTimeout(500)
    await this.page.getByTestId(TutorialPage.SKIP_TUTORIAL_BUTTON).click()
    await this.page.waitForURL(new RegExp(`^(?!.*${TutorialPage.URL}).*$`))
  }
}

interface TutorialPageFixtures {
  tutorialPage: TutorialPage
}
const test = base.extend<TutorialPageFixtures>({
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
})

export { expect, test }
