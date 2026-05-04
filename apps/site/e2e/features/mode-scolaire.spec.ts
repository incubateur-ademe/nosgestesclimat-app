import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { NGCTest } from '../fixtures/ngc-test'
import { Organisation } from '../fixtures/organisations'
import { Poll } from '../fixtures/polls'
import { NEW_VISITOR_STATE, ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: NEW_VISITOR_STATE })

test('should show youth tutorial when joining via the scolaire poll invite link', async ({
  scolairePoll,
  page,
}) => {
  await page.goto(scolairePoll.inviteLink)
  await expect(page.getByTestId('youth-tutorial')).toBeVisible()
  await expect(page.getByTestId('youth-tutorial-start-button')).toBeVisible()

  await expect(page.getByTestId('skip-tutorial-button')).toBeHidden()
})

test.describe('When a user completes the test via the scolaire poll invite link', () => {
  // test.describe.configure({ mode: 'default' })
  test.setTimeout(60_000)

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

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

    // Skip the email step
    await page.getByTestId('skip-email-button').click()
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
    await expect(page.locator(`a[href="${scolairePoll.url}"]`)).toBeVisible()
  })
})
