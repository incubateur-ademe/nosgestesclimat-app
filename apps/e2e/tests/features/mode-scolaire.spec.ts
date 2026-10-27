import { organisationFactory } from '@nosgestesclimat/core/features/organisations/factories/organisation.factory'
import { pollFactory } from '@nosgestesclimat/core/features/polls/factories/poll.factory'
import type { Poll as PollEntity } from '@nosgestesclimat/core/features/polls/types/poll'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { VerifiedUser } from '@nosgestesclimat/core/features/users/types/user'
import type { Organisation as OrganisationEntity } from '@nosgestesclimat/core/prisma/generated/client'
import type { Page } from '@playwright/test'
import { EMAIL_PAGE_PATH } from '../constants'
import { createPage } from '../fixtures'
import { signIn } from '../helpers/session'
import { test as base, expect } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'
import { Organisation } from '../page-objects/organisation'
import { Poll } from '../page-objects/poll'
import { User } from '../page-objects/user'

/**
 * Organisation administrator context, seeded in the e2e database: a verified
 * user and the organisation they administrate, signed in through
 * helpers/session (no verification code flow).
 *
 * The entities are exposed as seeded, and the site routes are derived from
 * them.
 */
interface OrganisationAdmin {
  admin: VerifiedUser
  organisation: OrganisationEntity
}

interface ScolaireModeFixtures {
  organisationAdmin: OrganisationAdmin
  poll: Poll
  /** Poll in scolaire mode, for the youth tutorial flow. */
  scolairePoll: Poll
}

/**
 * Organisation page object for a seeded organisation: the page objects are
 * stateless, they derive the site routes (organisation dashboard, poll
 * dashboard) from the seeded entity's data.
 */
const organisationPageObject = (
  page: Page,
  { admin, organisation }: OrganisationAdmin
) => {
  const [firstName = '', ...lastNames] = admin.name?.split(' ') ?? []
  return new Organisation(
    page,
    new User(page, {
      firstName,
      lastName: lastNames.join(' '),
      email: admin.email,
    }),
    { name: organisation.name, slug: organisation.slug }
  )
}

/**
 * Poll page object for a poll seeded in the e2e database: the invite link is
 * the site's campagne route, which resolves a poll by id or slug.
 */
const pollPageObject = (
  page: Page,
  organisationAdmin: OrganisationAdmin,
  poll: PollEntity
) =>
  new Poll(page, organisationPageObject(page, organisationAdmin), {
    name: poll.name,
    slug: poll.slug,
    inviteLink: `/simulateur/campagne/${poll.id}`,
  })

const test = base.extend<ScolaireModeFixtures>({
  organisationAdmin: async ({ context }, use) => {
    const admin = await userFactory.verified().create()
    const organisation = await organisationFactory
      .withAdministrator({ userEmail: admin.email })
      .create()
    await signIn(context, admin)
    await use({ admin, organisation })
  },

  poll: async ({ page, organisationAdmin }, use) => {
    const poll = await pollFactory
      .withOrganisation(organisationAdmin.organisation)
      .create()
    await use(pollPageObject(page, organisationAdmin, poll))
  },

  scolairePoll: async ({ page, organisationAdmin }, use) => {
    const poll = await pollFactory
      .withOrganisation(organisationAdmin.organisation)
      .scolaire()
      .create()
    await use(pollPageObject(page, organisationAdmin, poll))
  },
})

// @TODO: re-enable (replace `describe.skip` with `describe`) once the scolaire
// mode is back.
// eslint-disable-next-line playwright/no-skipped-test
test.describe.skip('scolaire mode', () => {
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
    let page: Page

    test.beforeAll(async ({ browser, scolairePoll }) => {
      // Creating the organisation/poll and completing the whole youth test on a
      // loaded preprod is closer to the previous 60s budget than we'd like.
      test.setTimeout(120_000)

      page = await createPage(browser)

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

    test('sees the poll confirmation block on the end page', async () => {
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
  })

  test("shouldn't offer to reuse the previous scolaire test when joining a new scolaire poll", async ({
    page,
    scolairePoll,
  }) => {
    // Joining a new scolaire poll must offer to reuse the previous scolaire
    // test (same mode), with its date and result.
    await page.goto(scolairePoll.inviteLink)
    await expect(page.getByTestId('youth-tutorial-start-button')).toBeVisible()
  })

  test('starts a fresh test when joining a standard poll after completing a scolaire test', async ({
    page,
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
