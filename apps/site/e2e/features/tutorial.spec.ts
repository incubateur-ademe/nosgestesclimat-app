import { expect, test } from '../fixtures'
import { TutorialPage } from '../fixtures/tutorial'

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
  await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
})

test('should redirect to home for new users', async ({
  page,
  tutorialPage,
}) => {
  await tutorialPage.goto()
  await expect(page).toHaveURL('/')
})

test.describe('when a user starts to answer test', () => {
  test.beforeEach(async ({ page, ngcTest }) => {
    await ngcTest.start()
    await page.waitForURL(/\/simulateur\/bilan/)
    await ngcTest.clickOnSkip()
    await ngcTest.clickOnSkip()
    // Wait for the autosave to trigger
    await page.waitForTimeout(3000)
  })

  test('it should not be displayed if the user continue the test', async ({
    page,
    tutorialPage,
  }) => {
    await tutorialPage.goto()
    await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
  })

  test('it should be displayed when the user restart a new test', async ({
    page,
    tutorialPage,
  }) => {
    await tutorialPage.start()
    await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
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
    await expect(page).toHaveURL(new RegExp('/fin'))
  })

  test('it should not be displayed when starting a new test', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('restart-link').click()
    await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
  })
})
