import { faker } from '@faker-js/faker'
import { organisationFactory } from '@nosgestesclimat/core/features/organisations/factories/organisation.factory'
import { pollFactory } from '@nosgestesclimat/core/features/polls/factories/poll.factory'
import type { Poll } from '@nosgestesclimat/core/features/polls/types/poll'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { VerifiedUser } from '@nosgestesclimat/core/features/users/types/user'
import type { Organisation } from '@nosgestesclimat/core/prisma/generated/client'
import { ADMINISTRATOR_NAME_SEPARATOR } from '../constants'
import { signIn } from '../helpers/session'
import { test as base, expect } from '../local/fixtures'

/**
 * Organisation admin context, seeded in the e2e database: a verified user,
 * the organisation they administrate and one of its polls, signed in through
 * helpers/session (no verification code flow).
 *
 * The entities are returned as seeded, and the site routes are derived from
 * them; the tests derive the administrator's names from the stored name.
 */
interface OrganisationAdmin {
  admin: VerifiedUser
  organisation: Organisation
  poll: Poll
  /** Site routes, derived from the seeded entities. */
  urls: {
    organisation: string
    organisationParameters: string
    poll: string
    pollCreation: string
  }
}

const test = base.extend<{ organisationAdmin: OrganisationAdmin }>({
  organisationAdmin: async ({ context }, use) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    // The site stores an administrator's name as `firstName\n_\nlastName`:
    // the dashboard unformats it to greet the admin, and the parameters page
    // splits it back into the first/last name inputs.
    const admin = await userFactory.verified().create({
      name: `${firstName}${ADMINISTRATOR_NAME_SEPARATOR}${lastName}`,
    })
    const organisation = await organisationFactory
      .withAdministrator(admin.email)
      .create()
    const poll = await pollFactory.withOrganisation(organisation).create()
    await signIn(context, admin)

    const url = `/organisations/${organisation.slug}`
    await use({
      admin,
      organisation,
      poll,
      urls: {
        organisation: url,
        organisationParameters: `${url}/parametres`,
        poll: `${url}/campagnes/${poll.slug}`,
        pollCreation: `${url}/creer-campagne`,
      },
    })
  },
})

// The administrator's first and last name, split back out of the stored name.
const splitAdministratorName = (admin: VerifiedUser) =>
  admin.name?.split(ADMINISTRATOR_NAME_SEPARATOR) ?? []

test('can access the organisation dashboard from the user account', async ({
  page,
  organisationAdmin,
}) => {
  await page.goto('/mon-espace')
  await page.getByTestId('my-groups-tab').click()
  await page
    .getByRole('link', { name: organisationAdmin.organisation.name })
    .click()
  await expect(page).toHaveURL(organisationAdmin.urls.organisation)
})

test('is redirected to the dashboard when going to /organisation/connexion', async ({
  page,
  organisationAdmin,
}) => {
  await page.goto('/organisations/connexion')
  await expect(page).toHaveURL(organisationAdmin.urls.organisation)
})

test.describe('The dashboard', () => {
  test.beforeEach(async ({ page, organisationAdmin }) => {
    await page.goto(organisationAdmin.urls.organisation)
  })

  test('welcomes the admin', async ({ page, organisationAdmin }) => {
    const fullName = splitAdministratorName(organisationAdmin.admin).join(' ')
    await expect(
      page.getByRole('heading', {
        name: `Bienvenue ${fullName}`,
        level: 1,
      })
    ).toBeVisible()
  })

  test('displays the name of the organisation twice (the breadcrumb and description)', async ({
    page,
    organisationAdmin,
  }) => {
    await expect(
      page.getByRole('link', {
        name: organisationAdmin.organisation.name,
        exact: true,
      })
    ).toBeVisible()
  })

  test('lists the created poll', async ({ page, organisationAdmin }) => {
    await expect(
      page.getByRole('heading', {
        name: organisationAdmin.poll.name,
        level: 3,
        exact: true,
      })
    ).toBeVisible()
    await page.getByTestId('poll-card-see-details-button').first().click()
    await expect(page).toHaveURL(organisationAdmin.urls.poll)
  })

  test('allows to create a new campaign', async ({
    page,
    organisationAdmin,
  }) => {
    await expect(page.getByTestId('add-poll-card')).toBeVisible()
    await page.getByTestId('add-poll-card').click()
    await expect(page).toHaveURL(organisationAdmin.urls.pollCreation)
  })

  test('allows to access the organisation parameters', async ({
    page,
    organisationAdmin,
  }) => {
    await page.getByTestId('organisation-page-see-parameters-button').click()

    await expect(page).toHaveURL(organisationAdmin.urls.organisationParameters)
  })
})

test.describe('The parameters page', () => {
  test.beforeEach(async ({ page, organisationAdmin }) => {
    await page.goto(organisationAdmin.urls.organisationParameters)
  })

  test('should display the organisation parameters', async ({
    page,
    organisationAdmin,
  }) => {
    const [firstName, lastName] = splitAdministratorName(
      organisationAdmin.admin
    )
    await expect(page.getByTestId('input-organisation-name')).toHaveValue(
      organisationAdmin.organisation.name
    )
    await expect(
      page.getByTestId('input-administrator-first-name')
    ).toHaveValue(firstName)

    await expect(page.getByTestId('input-administrator-last-name')).toHaveValue(
      lastName
    )
  })
})
