import type { Page } from '@playwright/test'
import { EMAIL_PAGE_PATH } from '../../constants'
import { createPage } from '../../fixtures/feature-flags'
import { generatePollName, generateUser } from '../../helpers/test-data'
import { EmailVerification } from '../../page-objects/email-verification'
import { NGCTest } from '../../page-objects/ngc-test'
import { Poll } from '../../page-objects/poll'
import { TutorialPage } from '../../page-objects/tutorial'
import { expect, test } from '../fixtures'
import {
  restoreFromState,
  restoreOrganisation,
  restorePoll,
} from '../fixtures/context'
import { NEW_VISITOR_STATE, ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: ORGANISATION_ADMIN_STATE })

test.describe('A poll admin', () => {
  test('can go to its poll from the organisation dashboard', async ({
    page,
    organisation,
    poll,
  }) => {
    await page.goto(organisation.url)
    await expect(
      page.getByRole('heading', { name: poll.name, level: 3, exact: true })
    ).toBeVisible()
    await page.getByTestId('poll-card-see-details-button').first().click()
    await expect(page).toHaveURL(poll.url)
  })

  test('can create a new poll and delete it', async ({
    page,
    organisation,
  }) => {
    const name = generatePollName()
    await page.goto(Poll.createUrl(organisation.slug))
    const slug = await new Poll(page).create(name)
    const url = Poll.url(organisation.slug, slug)

    await expect(page).toHaveURL(url)
    await expect(
      page.getByRole('heading', { name, level: 1, exact: true })
    ).toBeVisible()

    await page.goto(`${url}/parametres`)
    await page
      .getByRole('button', { name: 'Supprimer ce test collectif', exact: true })
      .click()
    // Not a role locator: react-modal sets aria-hidden on its app element, the
    // body here, which hides the modal from the accessibility tree.
    await page.getByText('Confirmer', { exact: true }).click()

    await expect(page).toHaveURL(organisation.url)
    await expect(
      page.getByRole('heading', { name, level: 3, exact: true })
    ).toBeHidden()
  })
})

test.describe('The poll dashboard page, when accessed by an admin', () => {
  test.beforeEach(async ({ poll, page }) => {
    await page.goto(poll.url)
  })

  test('displays poll name', async ({ poll, page }) => {
    await expect(
      page.getByRole('heading', { name: poll.name, level: 1, exact: true })
    ).toBeVisible()
  })

  test('has an invite link that can be copied with good utm', async ({
    page,
    baseURL,
  }) => {
    const clipboardContent = await new Poll(page).copyInviteLink()
    expect(clipboardContent).toMatch(new RegExp(`^${baseURL}`))
    expect(clipboardContent).toMatch(/utm_medium=sharelink/)
    expect(clipboardContent).toMatch(/utm_source=NGC/)
  })

  test('displays a settings button', async ({ page }) => {
    await expect(
      page.getByTestId('poll-admin-section-see-parameters-button')
    ).toBeVisible()
  })

  test('reaches its campaign from the legacy results address', async ({
    page,
    poll,
    organisation,
  }) => {
    await page.goto(`${organisation.url}/resultats-detailles`)

    await expect(page).toHaveURL(poll.url)
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
    await expect(page).toHaveURL(/\/simulateur\/campagne\//)
  })

  test('can leave its email after completing the test via poll invite', async ({
    page,
    poll,
  }) => {
    const ngcTest = new NGCTest(page)
    const tutorialPage = new TutorialPage(page)

    const user = generateUser()
    await page.goto(poll.inviteLink)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await expect(page).toHaveURL('/simulateur/email')
    await new EmailVerification(page).complete(user.email)

    await expect(page).toHaveURL(/\/fin/)
  })

  test('can skip leaving its email after completing the test via poll invite', async ({
    page,
    poll,
  }) => {
    const ngcTest = new NGCTest(page)
    const tutorialPage = new TutorialPage(page)

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

  let page: Page

  test.beforeAll(async ({ browser }) => {
    // Skipping the whole test in the hook can exceed the 30s default hook
    // timeout on a loaded preprod; the describe-level test.setTimeout() does
    // not raise the hook budget.
    test.setTimeout(120_000)

    page = await createPage(browser)

    const poll = await restoreFromState(
      browser,
      ORGANISATION_ADMIN_STATE,
      async (adminPage) =>
        await restorePoll(adminPage, await restoreOrganisation(adminPage))
    )

    await page.goto(poll.inviteLink)
    const tutorialPage = new TutorialPage(page)
    await tutorialPage.skip()

    const ngcTest = new NGCTest(page)
    await ngcTest.skipAllQuestions()

    // @TODO: temporary bandage, fix me soon
    // The flow can land directly on /fin when the poll is not yet attached to
    // the simulation when endTestAction runs (a race on preprod); the email
    // step is only displayed when it is. Skip it only when shown, otherwise
    // the click would wait forever for a button that never appears. When the
    // race does hit, the tests below fail fast on the poll-confirmation
    // assertions instead of hanging in this hook.
    if (page.url().includes(EMAIL_PAGE_PATH)) {
      await page.getByTestId('skip-email-button').click()
    }
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
    await expect(
      page.locator(`a[href="${poll.url}"]`).filter({ visible: true })
    ).toBeVisible()
  })
})
