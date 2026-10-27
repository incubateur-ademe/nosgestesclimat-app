import { mergeTests } from '@playwright/test'

import { CookieBanner } from '../../page-objects/cookie-banner'
import { NGCTest } from '../../page-objects/ngc-test'
import { TutorialPage } from '../../page-objects/tutorial'
import { UserSpace } from '../../page-objects/user-space'
import { test as base, expect } from './user'

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
