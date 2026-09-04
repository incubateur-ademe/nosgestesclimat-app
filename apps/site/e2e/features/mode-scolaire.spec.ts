import { EMAIL_PAGE_PATH } from '@/constants/urls/paths'
import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { createPage } from '../fixtures/feature-flags'
import { NGCTest } from '../fixtures/ngc-test'
import { Organisation } from '../fixtures/organisations'
import { Poll } from '../fixtures/polls'
import { NEW_VISITOR_STATE, ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: NEW_VISITOR_STATE })

test.skip('should show youth tutorial when joining via the scolaire poll invite link', async ({
  scolairePoll,
  page,
}) => {
  await page.goto(scolairePoll.inviteLink)
  await expect(page.getByTestId('youth-tutorial')).toBeVisible()
  await expect(page.getByTestId('youth-tutorial-start-button')).toBeVisible()

  await expect(page.getByTestId('skip-tutorial-button')).toBeHidden()
})

test.describe('When a user completes the test via the scolaire poll invite link', () => {
  let page: Page

  test.skip.beforeAll(async ({ browser }) => {
    // Creating the organisation/poll and completing the whole youth test on a
    // loaded preprod is closer to the previous 60s budget than we'd like.
    test.setTimeout(120_000)

    page = await createPage(browser)

    const adminContext = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })
    const adminPage = await adminContext.newPage()

    const organisation = await Organisation.fromContext(adminPage)
    const scolairePoll = await Poll.fromContext(
      adminPage,
      organisation,
      'poll-scolaire'
    )
    await adminContext.close()

    await page.goto(scolairePoll.inviteLink)
    await page.getByTestId('youth-tutorial-start-button').click()

    const ngcTest = new NGCTest(page)
    await ngcTest.skipAllQuestions()

    // @TODO: temporary bandage, fix me soon
    // The scolaire flow can land directly on /fin when the poll is not yet
    // attached to the simulation when endTestAction runs (a race on preprod);
    // the email step is only displayed when it is. Skip it only when shown,
    // otherwise the click would wait forever for a button that never appears.
    if (page.url().includes(EMAIL_PAGE_PATH)) {
      await page.getByTestId('skip-email-button').click()
    }
    await expect(page).toHaveURL(/\/fin/)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.skip('sees the poll confirmation block on the end page', async ({}) => {
    await expect(page.getByTestId('poll-confirmation-block')).toBeVisible()
  })

  test.skip('can access the poll dashboard from the end page', async ({
    scolairePoll,
  }) => {
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(scolairePoll.url)
  })

  test.skip('cannot redo the test with the scolaire invite link', async ({
    scolairePoll,
  }) => {
    await page.goto(scolairePoll.inviteLink)
    await expect(page).toHaveURL(/\/simulateur\/campagne\//)
    await expect(page.getByTestId('skip-tutorial-button')).toBeHidden()
    await expect(
      page.locator(`a[href="${scolairePoll.url}"]`).filter({ visible: true })
    ).toBeVisible()
  })
})
