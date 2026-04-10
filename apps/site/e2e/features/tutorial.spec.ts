import { expect, test, TutorialPage } from '../fixtures/tutorial'

test('should be displayed when coming from the home', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('do-the-test-link').first().click()
  await expect(page).toHaveURL(TutorialPage.URL)
})

test('should start test when clicking on the start button', async ({
  page,
  tutorialPage,
}) => {
  await tutorialPage.goto()
  await tutorialPage.skip()
  await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
})

test('should only be displayed once when coming from home', async ({
  page,
  tutorialPage,
}) => {
  await tutorialPage.goto()
  await tutorialPage.skip()
  await page.waitForURL(/\/simulateur\/bilan\?question=/)
  await page.goto('/')
  await page.getByTestId('do-the-test-link').first().click()
  await expect(page).toHaveURL(new RegExp('/simulateur/bilan'))
})
