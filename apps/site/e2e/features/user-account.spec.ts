import { faker } from '@faker-js/faker'
import { expect, test } from '../fixtures'
import { UserMailbox } from '../helpers/user-mailbox'
import { GROUP_ADMIN_STATE, USER_ACCOUNT_STATE } from '../state'

test.use({ storageState: USER_ACCOUNT_STATE })

test.describe('Logout', () => {
  test('should log out and redirect to homepage', async ({ page }) => {
    await page.goto('/mon-espace')
    await expect(page.getByTestId('my-results-tab')).toBeVisible()

    await page.getByTestId('my-space-button').click()

    await page.getByTestId('my-space-logout-button').click()

    await expect(page).toHaveURL('/')

    await page.goto('/mon-espace')
    await expect(page).not.toHaveURL('/mon-espace')
  })
})

test.describe('Email change', () => {
  test.setTimeout(60_000)

  test('can change email from personal space', async ({ page }) => {
    const newEmail = faker.internet.email({
      provider: `${process.env.MAILISK_NAMESPACE!}.mailisk.net`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    })

    await page.goto('/mon-espace/parametres')
    await expect(page.getByTestId('user-email-display')).toBeVisible()

    await page.getByTestId('edit-email-button').click()

    await page.locator('input[name="email"]').first().fill(newEmail)
    await page.getByTestId('submit-button').click()

    const codeInput = page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport({ timeout: 10_000 })

    const code = await new UserMailbox(newEmail).getVerificationCode()
    await codeInput.fill(code)

    await expect(page.getByTestId('success-message')).toBeVisible({
      timeout: 10_000,
    })

    await page.reload()
    await expect(page.getByTestId('user-email-display')).toHaveText(
      newEmail.toLowerCase()
    )
  })
})

test.describe('Simulation deletion', () => {
  test.use({ storageState: GROUP_ADMIN_STATE })

  test('can delete a simulation from personal space', async ({ page }) => {
    await page.goto('/mon-espace')
    await expect(page.getByTestId('results-list-title')).toBeVisible()

    const deleteButtons = page.getByTestId('delete-simulation-button')
    const initialCount = await deleteButtons.count()
    expect(initialCount).toBeGreaterThan(0)

    await deleteButtons.first().click()
    await page.getByTestId('confirm-delete-simulation-button').click()

    await expect(deleteButtons).toHaveCount(initialCount - 1, {
      timeout: 10_000,
    })
  })
})
