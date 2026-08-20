import { EMAIL_PAGE_PATH } from '@/constants/urls/paths'
import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { createPage } from '../fixtures/feature-flags'
import { NGCTest } from '../fixtures/ngc-test'
import { Organisation } from '../fixtures/organisations'
import { Poll } from '../fixtures/polls'
import { User } from '../fixtures/user'
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

test('starts a fresh test when joining a scolaire poll after completing a classic test', async ({
  scolairePoll,
  page,
  ngcTest,
}) => {
  // A classic test was completed on this computer/session
  await ngcTest.skipAll()
  await page.waitForURL(/\/fin/)

  // The home page keeps offering the previous user's results (unchanged behavior)
  await page.goto('/')
  await expect(page.getByTestId('main-cta').first()).toContainText(
    'Voir mes résultats'
  )

  // Visiting the scolaire invite link must not send the user to the previous
  // results, nor offer to reuse the classic test (different mode): the youth
  // tutorial simply starts a fresh test, while the classic simulation stays in
  // the account.
  await page.goto(scolairePoll.inviteLink)
  await expect(page.getByTestId('youth-tutorial')).toBeVisible()
  await page.getByTestId('youth-tutorial-start-button').click()
  await expect(page).toHaveURL(/\/simulateur\/bilan/)
})

test('lists both the classic and the scolaire simulations in the account after creating one', async ({
  scolairePoll,
  page,
  ngcTest,
}) => {
  test.setTimeout(120_000)
  const user = new User(page)

  // A classic test was completed on this computer/session
  await ngcTest.skipAll()
  await page.waitForURL(/\/fin/)

  // Visiting the scolaire invite link must not send the user to the previous
  // results: the completed classic test (different mode) is not reused, the
  // youth tutorial starts a fresh test.
  await page.goto(scolairePoll.inviteLink)
  await expect(page.getByTestId('youth-tutorial')).toBeVisible()
  await page.getByTestId('youth-tutorial-start-button').click()
  await expect(page).toHaveURL(/\/simulateur\/bilan/)

  // Complete the fresh scolaire test
  await ngcTest.skipAllQuestions()
  await expect(page).toHaveURL('/simulateur/email')

  // Create an account
  await user.fillEmailAndCompleteVerification()
  await expect(page).toHaveURL(/\/fin/)

  // Both the classic and the scolaire simulations are listed in the account
  await page.goto('/mon-espace')
  await expect(page.getByTestId('results-list-title')).toBeVisible()
  await expect(page.getByTestId('delete-simulation-button')).toHaveCount(2)
})

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

  test('offers to reuse the previous scolaire test when joining a new scolaire poll', async ({
    browser,
  }) => {
    // Create a second scolaire poll
    const adminContext = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })
    const adminPage = await adminContext.newPage()

    const organisation = await Organisation.fromContext(adminPage)
    const newScolairePoll = new Poll(adminPage, organisation)
    await adminPage.goto(newScolairePoll.createUrl)
    await newScolairePoll.create('scolaire')
    await newScolairePoll.copyInviteLink()
    await adminContext.close()

    // Joining a new scolaire poll must offer to reuse the previous scolaire
    // test (same mode), with its date and result.
    await page.goto(newScolairePoll.inviteLink)
    await expect(
      page.getByTestId('reuse-simulation-banner-title')
    ).toBeVisible()
    await expect(page.getByText('Test réalisé le')).toBeVisible()
    await expect(page.getByText('Votre empreinte')).toBeVisible()
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
