import { NGCTest } from '../pages/ngc-test'
import { test as base, expect } from './tutorial'

export { NGCTest } from '../pages/ngc-test'

interface NGCPageFixtures {
  ngcTest: NGCTest
}
const test = base.extend<NGCPageFixtures>({
  ngcTest: async ({ page, tutorialPage }, use) => {
    await use(new NGCTest(page, tutorialPage))
  },
})

export { expect, test }
