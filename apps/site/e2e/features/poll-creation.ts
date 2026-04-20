import { expect, test } from '../fixtures'
import { Organisation } from '../fixtures/organisations'
import { User } from '../fixtures/user'
import { saveContext } from '../helpers/save-context'
import { ORGANISATION_ADMIN_STATE } from '../state'

test.use({ storageState: ORGANISATION_ADMIN_STATE })

test('it should access the organisation dashboard from the user account', async ({
  page,
  userSpace: userAccount,
  organisation,
}) => {
  await page.goto('/')
  await userAccount.goto()
  await page.getByTestId('my-groups-tab').click()
  await page.getByText(organisation.name).click()
  await expect(page).toHaveURL(organisation.url)
})

test('it should redirect to the dashboard when going to /organisation/connexion', async ({
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

  test('should welcome the admin', async ({ page, organisation }) => {
    await expect(
      page.getByText(`Bienvenue ${organisation.admin.fullName}`)
    ).toBeVisible()
  })

  test('should display the name of the organisation twice (the breadcrumb and description)', async ({
    page,
    organisation,
  }) => {
    await expect(page.getByText(organisation.name)).toHaveCount(2)
  })

  test('lists the created poll', async ({ page, poll }) => {
    await expect(page.getByText(poll.name)).toBeVisible()
    await page.getByTestId('poll-card-see-details-button').first().click()
    await expect(page).toHaveURL(poll.url)
  })

  test('it should allow to create a new campaign', async ({ page, poll }) => {
    await expect(page.getByTestId('add-poll-card')).toBeVisible()
    await page.getByTestId('add-poll-card').click()
    await expect(page).toHaveURL(poll.createUrl)
  })

  test('it should allow to access the organisation parameters', async ({
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

  test('should have a working logout button', async ({
    page,
    organisation,
  }) => {
    const logout = page.getByTestId('organisation-logout')
    await expect(logout).toBeVisible()
    await logout.click()
    await expect(page).toHaveURL('/organisations')
    await page.goto(organisation.url)
    await expect(page).toHaveURL(Organisation.CONNEXION_URL)
  })

  test('should allow to change the administrator info', async ({
    page,
    organisation,
  }) => {
    const admin = new User(page)
    await page
      .getByTestId('input-administrator-first-name')
      .fill(admin.firstName)

    await page.getByTestId('input-administrator-last-name').fill(admin.lastName)

    await page.getByTestId('button-submit').click()

    // Should display a verification code input
    const verificationCodeInput = page.getByTestId('verification-code-input')
    await expect(verificationCodeInput).toBeInViewport()

    const code = await admin.mailbox.getVerificationCode()

    await verificationCodeInput.fill(code)
    await expect(verificationCodeInput).toBeHidden()

    await expect(page.getByTestId('success-message')).toBeVisible()

    await page.reload()

    // We update the admin info in playwright state
    organisation.admin = admin
    await organisation.saveInContext()
    await saveContext(page, ORGANISATION_ADMIN_STATE)
  })
})
