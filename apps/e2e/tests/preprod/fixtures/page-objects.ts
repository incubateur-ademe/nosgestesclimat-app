import { mergeTests } from '@playwright/test'

import { CookieBanner } from '../../pages/cookie-banner'
import { NGCTest } from '../../pages/ngc-test'
import { TutorialPage } from '../../pages/tutorial'
import { UserSpace } from '../../pages/user-space'
import { test as base, expect } from './user'

export { CookieBanner } from '../../pages/cookie-banner'
export { NGCTest } from '../../pages/ngc-test'
export { TutorialPage } from '../../pages/tutorial'
export { UserSpace } from '../../pages/user-space'
export { expect }

const tutorialTest = base.extend<{ tutorialPage: TutorialPage }>({
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
})

const ngcTest = tutorialTest.extend<{ ngcTest: NGCTest }>({
  ngcTest: async ({ page, tutorialPage }, use) => {
    await use(new NGCTest(page, tutorialPage))
  },
})

const cookieBannerTest = base.extend<{ cookieBanner: CookieBanner }>({
  cookieBanner: async ({ page }, use) => {
    await use(new CookieBanner(page))
  },
})

const userSpaceTest = base.extend<{ userSpace: UserSpace }>({
  userSpace: async ({ page, user }, use) => {
    await use(new UserSpace(page, user))
  },
})

export const test = mergeTests(ngcTest, cookieBannerTest, userSpaceTest)
