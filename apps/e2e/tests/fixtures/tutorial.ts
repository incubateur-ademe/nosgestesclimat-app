import { test as base, expect } from '@playwright/test'

import { TutorialPage } from '../pages/tutorial'

export { TutorialPage } from '../pages/tutorial'

interface TutorialPageFixtures {
  tutorialPage: TutorialPage
}
const test = base.extend<TutorialPageFixtures>({
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
})

export { expect, test }
