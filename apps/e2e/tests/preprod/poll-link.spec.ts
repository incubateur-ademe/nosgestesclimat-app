import { createPage } from '../fixtures'
import { expect, test } from './fixtures'
import {
  completeSimulationFromTutorial,
  createPollFromHome,
  expectResultsPage,
  gotoAsNewVisitor,
} from './helpers'

test('completes a simulation from a poll link', async ({ page, browser }) => {
  // The admin gets their own context: `page` stays a new visitor, not signed in.
  const adminPage = await createPage(browser)
  const { poll } = await createPollFromHome(adminPage)
  await adminPage.close()

  await gotoAsNewVisitor(page, poll.inviteLink)
  await completeSimulationFromTutorial(page)

  await expect(page).toHaveURL('/simulateur/email')
  await page.getByTestId('skip-email-button').click()

  await expectResultsPage(page)
  await expect(page.getByTestId('poll-confirmation-block')).toBeVisible()
})
