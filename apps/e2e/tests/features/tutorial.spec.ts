import { test as base, expect } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'
import { TutorialPage } from '../page-objects/tutorial'

// The local suite has no page-object fixtures: TutorialPage and NGCTest are
// stateless and take the page, so they are instantiated inline. The default
// context is a fresh new visitor (localVisitorState: cookie banner dismissed,
// no session).
const test = base.extend<{ tutorialPage: TutorialPage; ngcTest: NGCTest }>({
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
  ngcTest: async ({ page, tutorialPage }, use) => {
    await use(new NGCTest(page, tutorialPage))
  },
})

test('should be displayed when coming from the home', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('main-cta').first().click()
  await expect(page).toHaveURL(TutorialPage.URL)
})

test('should start test when clicking on the start button', async ({
  page,
  tutorialPage,
}) => {
  await tutorialPage.start()
  await tutorialPage.skip()
  await expect(page).toHaveURL(/\/simulateur\/bilan/)
})

test.describe('when a user starts to answer test', () => {
  test.beforeEach(async ({ page, ngcTest }) => {
    await ngcTest.start()
    await page.waitForURL(/\/simulateur\/bilan/)
    await ngcTest.skipButton().click()
    await ngcTest.skipButton().click()
    await ngcTest.skipButton().click()
    // Wait for the autosave to trigger: the hook debounces by 5 s, so this
    // has to stay above it.
    await page.waitForTimeout(7000)
  })

  test('it should not be displayed if the user continue the test', async ({
    page,
    tutorialPage,
  }) => {
    await tutorialPage.goto()
    await expect(page).toHaveURL(/\/simulateur\/bilan/)
  })

  test('it should be displayed when the user restart a new test', async ({
    page,
    tutorialPage,
  }) => {
    await tutorialPage.start()
    await expect(page).toHaveURL(/\/simulateur\/bilan/)
  })
})

test.describe('when a user completes a test', () => {
  test.beforeEach(async ({ page, ngcTest }) => {
    await ngcTest.skipAll()
    await page.waitForURL('/fin')
  })

  test('it should redirect to the fin page when accessed directly', async ({
    page,
    tutorialPage,
  }) => {
    await tutorialPage.goto()
    await expect(page).toHaveURL(/\/fin/)
  })

  test('it should not be displayed when starting a new test', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('restart-link').first().click()
    await expect(page).toHaveURL(/\/simulateur\/bilan/)
  })
})
