import { expect, test } from '../fixtures'
import { ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: ORGANISATION_ADMIN_STATE })

test('can access the organisation dashboard from the user account', async ({
  page,
  userSpace,
  organisation,
}) => {
  await userSpace.goto()
  await page.getByTestId('my-groups-tab').click()
  await page.getByText(organisation.name).click()
  await expect(page).toHaveURL(organisation.url)
})

test('is redirected to the dashboard when going to /organisation/connexion', async ({
  page,
  organisation,
}) => {
  await page.goto('/organisations/connexion')
  await expect(page).toHaveURL(organisation.url)
})

test.describe('The dashboard', () => {
  test.beforeEach(async ({ organisation, page }) => {
    await page.goto(organisation.url)
  })

  test('welcomes the admin', async ({ page, organisation }) => {
    await expect(
      page.getByText(`Bienvenue ${organisation.admin.fullName}`)
    ).toBeVisible()
  })

  test('displays the name of the organisation twice (the breadcrumb and description)', async ({
    page,
    organisation,
  }) => {
    await expect(page.getByText(organisation.name)).toBeVisible()
  })

  test('lists the created poll', async ({ page, poll }) => {
    await expect(page.getByText(poll.name)).toBeVisible()
    await page.getByTestId('poll-card-see-details-button').first().click()
    await expect(page).toHaveURL(poll.url)
  })

  test('allows to create a new campaign', async ({ page, poll }) => {
    await expect(page.getByTestId('add-poll-card')).toBeVisible()
    await page.getByTestId('add-poll-card').click()
    await expect(page).toHaveURL(poll.createUrl)
  })

  test('allows to access the organisation parameters', async ({
    page,
    organisation,
  }) => {
    await page.getByTestId('organisation-page-see-parameters-button').click()

    await expect(page).toHaveURL(organisation.parametersUrl)
  })
})

test.describe('The parameters page', () => {
  test.beforeEach(async ({ organisation, page }) => {
    await page.goto(organisation.parametersUrl)
  })

  test('should display the organisation parameters', async ({
    page,
    organisation,
  }) => {
    await expect(page.getByTestId('input-organisation-name')).toHaveValue(
      organisation.name
    )
    await expect(
      page.getByTestId('input-administrator-first-name')
    ).toHaveValue(organisation.admin.firstName)

    await expect(page.getByTestId('input-administrator-last-name')).toHaveValue(
      organisation.admin.lastName
    )
  })
})
