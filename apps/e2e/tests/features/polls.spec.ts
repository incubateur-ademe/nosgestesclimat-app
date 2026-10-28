import { organisationFactory } from '@nosgestesclimat/core/features/organisations/factories/organisation.factory'
import { pollFactory } from '@nosgestesclimat/core/features/polls/factories/poll.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { Page } from '@playwright/test'
import { EMAIL_PAGE_PATH } from '../constants'
import { createPage } from '../fixtures'
import { signIn } from '../helpers/session'
import { test as base, expect, resetDatabase } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'
import { Organisation } from '../page-objects/organisation'
import { Poll } from '../page-objects/poll'
import { TutorialPage } from '../page-objects/tutorial'
import { User } from '../page-objects/user'

/**
 * Seeds an organisation and one of its polls in the e2e database, with a
 * verified user administrating the organisation.
 *
 * Returns the seeded administrator and the page objects, with the site routes
 * derived from the seeded entities (the poll invite link is the site's
 * campagne route, which resolves a poll by id or slug). Signing the
 * administrator in is left to the caller: the « new user » describe reuses
 * this helper without signing in.
 */
async function seedPollWithOrganisation(page: Page) {
  const admin = await userFactory.verified().create()
  const seededOrganisation = await organisationFactory
    .withAdministrator({ userEmail: admin.email })
    .create()
  const seededPoll = await pollFactory
    .withOrganisation(seededOrganisation)
    .create()
  const [firstName = '', ...lastNames] = admin.name?.split(' ') ?? []
  const organisation = new Organisation(
    page,
    new User(page, {
      firstName,
      lastName: lastNames.join(' '),
      email: admin.email,
    }),
    { name: seededOrganisation.name, slug: seededOrganisation.slug }
  )
  const poll = new Poll(page, organisation, {
    name: seededPoll.name,
    slug: seededPoll.slug,
    inviteLink: `/simulateur/campagne/${seededPoll.id}`,
  })
  return { admin, organisation, poll }
}

// The local suite has no page-object fixtures: NGCTest and TutorialPage are
// stateless and take the page, so they are instantiated through fixtures here.
const test = base.extend<{ ngcTest: NGCTest; tutorialPage: TutorialPage }>({
  ngcTest: async ({ page }, use) => {
    await use(new NGCTest(page))
  },
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
})

interface PollContext {
  organisation: Organisation
  poll: Poll
}

/**
 * Organisation administrator context, seeded in the e2e database and signed
 * in through helpers/session (no verification code flow).
 */
const adminTest = test.extend<{
  pollContext: PollContext
  organisation: Organisation
  poll: Poll
}>({
  pollContext: async ({ page }, use) => {
    const { admin, organisation, poll } = await seedPollWithOrganisation(page)
    await signIn(page.context(), admin)
    await use({ organisation, poll })
  },
  organisation: async ({ pollContext }, use) => {
    await use(pollContext.organisation)
  },
  poll: async ({ pollContext }, use) => {
    await use(pollContext.poll)
  },
})

/**
 * New visitor context: the default context is already a fresh new visitor
 * (localVisitorState: cookie banner dismissed, no session), so only the
 * organisation and the poll have to be seeded — without signing anyone in.
 */
const newcomerTest = test.extend<{
  pollContext: PollContext
  organisation: Organisation
  poll: Poll
}>({
  pollContext: async ({ page }, use) => {
    const { organisation, poll } = await seedPollWithOrganisation(page)
    await use({ organisation, poll })
  },
  organisation: async ({ pollContext }, use) => {
    await use(pollContext.organisation)
  },
  poll: async ({ pollContext }, use) => {
    await use(pollContext.poll)
  },
})

let page: Page
let seededPoll: Poll

/**
 * The tests of the last describe share one page, seeded once in beforeAll: the
 * `poll` fixture exposes the poll seeded there.
 */
const joinedTest = test.extend<{ poll: Poll }>({
  poll: async ({}, use) => {
    await use(seededPoll)
  },
})

test.describe('A poll admin', () => {
  // The tests run signed in as the seeded organisation administrator: alias
  // the extended test type to keep the usual `test(...)` declaration shape.
  const test = adminTest

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

  test.describe('can create a new poll and delete it', () => {
    let newPoll: Poll

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
      await expect(
        page.getByRole('heading', { name: newPoll.name, level: 3, exact: true })
      ).toBeHidden()
    })
  })
})

test.describe('The poll dashboard page, when accessed by an admin', () => {
  // Same alias as above: the tests run signed in as the seeded administrator.
  const test = adminTest

  test.beforeEach(async ({ poll, page }) => {
    await page.goto(poll.url)
  })

  test('displays poll name', async ({ poll, page }) => {
    await expect(
      page.getByRole('heading', { name: poll.name, level: 1, exact: true })
    ).toBeVisible()
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
  const test = newcomerTest

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
    ngcTest,
    tutorialPage,
    poll,
  }) => {
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
    await page.goto(poll.inviteLink)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await expect(page).toHaveURL('/simulateur/email')
    await page.getByTestId('skip-email-button').click()
    await expect(page).toHaveURL(/\/fin/)
  })
})

test.describe('A user with a completed test that joined a poll', () => {
  // The tests share one page, seeded once in beforeAll (a fresh visitor who
  // completed the test through the poll invite link): alias the extended test
  // type whose `poll` fixture exposes the poll seeded there.
  const test = joinedTest

  test.describe.configure({ mode: 'default' })
  // The per-test reset would wipe the data seeded in beforeAll: the database
  // is emptied once, there. The tests run in order on a single worker.
  test.use({ resetDatabase: false })

  test.beforeAll(async ({ browser }) => {
    // Skipping the whole test in the hook can exceed the 30s default hook
    // timeout on a loaded environment; the describe-level test.setTimeout()
    // does not raise the hook budget.
    test.setTimeout(120_000)

    await resetDatabase()

    page = await createPage(browser)

    // Seed the organisation and the poll in the e2e database.
    seededPoll = (await seedPollWithOrganisation(page)).poll

    await page.goto(seededPoll.inviteLink)
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
