import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { NGCTest } from '../fixtures/ngc-test'
import { Organisation } from '../fixtures/organisations'
import { Poll } from '../fixtures/polls'
import { TutorialPage } from '../fixtures/tutorial'
import { User } from '../fixtures/user'
import { NEW_VISITOR_STATE, ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: ORGANISATION_ADMIN_STATE })

test.describe('A poll admin', () => {
  test('can go to its poll from the organisation dashboard', async ({
    page,
    organisation,
    poll,
  }) => {
    await page.goto(organisation.url)
    await expect(page.getByText(poll.name)).toBeVisible()
    await page.getByTestId('poll-card-see-details-button').first().click()
    await expect(page).toHaveURL(poll.url)
  })

  test.describe('can create a new poll and delete it', () => {
    let newPoll: Poll
    test.setTimeout(60_000)

    test.beforeEach(async ({ page, organisation }) => {
      newPoll = new Poll(page, organisation)
      await page.goto(newPoll.createUrl)
      await newPoll.create()
    })

    test.afterEach(async ({ page, organisation }) => {
      await page.goto(`${newPoll.url}/parametres`)
      await page.getByText('Supprimer cette campagne').click()
      await page.getByText('Confirmer').click()
      await expect(page).toHaveURL(organisation.url)
      await expect(page.getByText(newPoll.name)).toBeHidden()
    })
  })
})

test.describe('The poll dashboard page, when accessed by an admin', () => {
  test.beforeEach(async ({ poll, page }) => {
    await page.goto(poll.url)
  })

  test('displays poll name', async ({ poll, page }) => {
    await expect(page.locator('h1')).toHaveText(poll.name)
  })

  test('has an invite link that can be copied with good utm', async ({
    poll,
    baseURL,
  }) => {
    const clipboardContent = await poll.copyInviteLink()
    expect(clipboardContent).toMatch(new RegExp(`^${baseURL}`))
    expect(clipboardContent).toMatch(/utm_medium=sharelink/)
    expect(clipboardContent).toMatch(/utm_source=NGC/)
  })

  test('displays a settings button', async ({ page }) => {
    await expect(
      page.getByTestId('poll-admin-section-see-parameters-button')
    ).toBeVisible()
  })
})

test.describe('A new user', () => {
  test.use({ storageState: NEW_VISITOR_STATE })

  test('can join a poll via the invite link and reach the tutorial', async ({
    poll,
    page,
    organisation,
  }) => {
    await page.goto(poll.inviteLink)
    await expect(page.getByText(organisation.name)).toBeVisible()
    await expect(page).toHaveURL(new RegExp('/simulateur/campagne/'))
  })

  test('can leave its email after completing the test via poll invite', async ({
    page,
    ngcTest,
    tutorialPage,
    poll,
  }) => {
    test.setTimeout(60_000)
    const user = new User(page)
    await page.goto(poll.inviteLink)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await expect(page).toHaveURL('/simulateur/email')
    await user.fillEmailAndCompleteVerification()

    await expect(page).toHaveURL(/\/fin/)
  })

  test('can skip leaving its email after completing the test via poll invite', async ({
    page,
    ngcTest,
    tutorialPage,
    poll,
  }) => {
    test.setTimeout(60_000)
    await page.goto(poll.inviteLink)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await expect(page).toHaveURL('/simulateur/email')
    await page.getByTestId('skip-email-button').click()
    await expect(page).toHaveURL(/\/fin/)
  })
})

test.describe('A user with a completed test that joined a poll', () => {
  test.use({ storageState: NEW_VISITOR_STATE })

  test.describe.configure({ mode: 'default' })
  test.setTimeout(60_000)
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const adminContext = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })
    const adminPage = await adminContext.newPage()
    const organisation = await Organisation.fromContext(adminPage)
    const poll = await Poll.fromContext(adminPage, organisation)
    await adminContext.close()

    await page.goto(poll.inviteLink)
    const tutorialPage = new TutorialPage(page)
    await tutorialPage.skip()

    const ngcTest = new NGCTest(page)
    await ngcTest.skipAllQuestions()

    // Skip the email step
    await page.getByTestId('skip-email-button').click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('sees the end page after completing the test', async () => {
    await expect(page).toHaveURL(/\/fin/)
  })

  test('sees the poll confirmation block on the end page', async () => {
    await expect(page.getByTestId('poll-confirmation-block')).toBeVisible()
  })

  test('can access the poll dashboard from the end page', async ({ poll }) => {
    await page.goto('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(poll.url)
  })

  test('cannot redo the test with the invite link', async ({ poll }) => {
    await page.goto(poll.inviteLink)
    await expect(page).toHaveURL(/\/simulateur\/campagne\//)
    await expect(page.getByTestId('skip-tutorial-button')).toBeHidden()
    await expect(page.locator(`a[href="${poll.url}"]`)).toBeVisible()
  })
})
