import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { createPage } from '../fixtures/feature-flags'
import { NGCTest } from '../fixtures/ngc-test'
import { Organisation } from '../fixtures/organisations'
import { Poll } from '../fixtures/polls'
import { NEW_VISITOR_STATE, ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: NEW_VISITOR_STATE })

test.describe('When a user completes the test via the scolaire poll invite link', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
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

    await expect(page).toHaveURL(/\/fin/)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('sees the poll confirmation block on the end page', async ({}) => {
    await expect(page.getByTestId('poll-confirmation-block')).toBeVisible()
  })

  test('can access the poll dashboard from the end page', async ({
    scolairePoll,
  }) => {
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(scolairePoll.url)
  })

  test('cannot redo the test with the scolaire invite link', async ({
    scolairePoll,
  }) => {
    await page.goto(scolairePoll.inviteLink)
    await expect(page).toHaveURL(/\/simulateur\/campagne\//)
    await expect(page.getByTestId('skip-tutorial-button')).toBeHidden()
    await expect(
      page.locator(`a[href="${scolairePoll.url}"]`).filter({ visible: true })
    ).toBeVisible()
  })

  test("shouldn't offer to reuse the previous scolaire test when joining a new scolaire poll", async ({
    scolairePoll,
  }) => {
    // Joining a new scolaire poll must offer to reuse the previous scolaire
    // test (same mode), with its date and result.
    await page.goto(scolairePoll.inviteLink)
    await expect(page.getByTestId('youth-tutorial-start-button')).toBeVisible()
  })

  test('starts a fresh test when joining a standard poll after completing a scolaire test', async ({
    poll,
  }) => {
    // The shared page has just completed a test via the scolaire poll invite
    // link. Joining a standard poll (different mode) must not offer to reuse
    // the scolaire test: the standard tutorial simply starts a fresh test,
    // while the scolaire simulation stays in the account.
    await page.goto(poll.inviteLink)
    await expect(page.getByTestId('tutoriel-title')).toBeVisible()
    await expect(page.getByTestId('reuse-simulation-banner-title')).toBeHidden()
    await page.getByTestId('skip-tutorial-button').click()
    await expect(page).toHaveURL(/\/simulateur\/bilan/)
  })
})
