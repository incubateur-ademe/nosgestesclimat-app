import { faker } from '@faker-js/faker'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import type { Simulation } from '@nosgestesclimat/core/features/simulations/types/simulation'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { VerifiedUser } from '@nosgestesclimat/core/features/users/types/user'
import { START_SIMULATION_PATH, TEST_EMAIL_DOMAIN } from '../constants'
import { signIn } from '../helpers/session'
import { UserMailbox } from '../helpers/user-mailbox'
import { test as base, expect } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'

/**
 * The users are seeded in the e2e database with the core factories and signed
 * in through helpers/session; the default context stays a fresh new visitor
 * (localVisitorState), so the login flow runs unauthenticated.
 *
 * `ngcTest` is instantiated inline, and each signed-in describe aliases its
 * extended test type (whose sign-in fixture is automatic) to `test`, so the
 * tests are declared the usual way.
 */
const test = base.extend<{
  ngcTest: NGCTest
  /** A verified user seeded in the e2e database, not signed in. */
  user: VerifiedUser
}>({
  ngcTest: async ({ page }, use) => {
    await use(new NGCTest(page))
  },
  user: async ({}, use) => {
    await use(await userFactory.verified().create())
  },
})

/** Test type whose context is signed in as a freshly seeded verified user. */
const signedInTest = test.extend<{ signedInUser: VerifiedUser }>({
  signedInUser: [
    async ({ context }, use) => {
      const user = await userFactory.verified().create()
      await signIn(context, user)
      await use(user)
    },
    { auto: true },
  ],
})

interface SignedInUserWithSimulation {
  user: VerifiedUser
  simulation: Simulation
}

/** Test type signed in as a verified user owning one completed simulation. */
const simulationDeletionTest = signedInTest.extend<{
  signedInUserWithSimulation: SignedInUserWithSimulation
}>({
  signedInUserWithSimulation: [
    async ({ signedInUser }, use) => {
      const simulation = await simulationFactory
        .completed()
        .params({ userId: signedInUser.id })
        .withValidComputedResults()
        .create()
      await use({ user: signedInUser, simulation })
    },
    { auto: true },
  ],
})

test.describe('Login - invalid verification code', () => {
  test('should display error when entering a wrong code', async ({
    page,
    user,
  }) => {
    await page.goto('/connexion')

    const emailInput = page.getByTestId('verification-code-email-input')
    await expect(emailInput).toBeVisible()
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill(user.email)
    await page.waitForTimeout(500)
    await emailInput.press('Enter')

    const codeInput = page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport()

    await codeInput.fill('000000')
    await page.getByTestId('verification-code-submit-button').click()

    await expect(page.getByText('Le code est invalide')).toBeVisible()
  })
})

test.describe.fixme('Logout', () => {
  // The tests below run signed in: alias the extended test type to keep the
  // usual `test(...)` declaration shape.
  const test = signedInTest

  test('should log out and redirect to homepage', async ({ page }) => {
    await page.goto('/mon-espace')
    await expect(page.getByTestId('my-results-tab')).toBeVisible()

    await page.getByTestId('my-space-button').click()

    await page.getByTestId('my-space-logout-button').click()

    await expect(page).toHaveURL('/')

    // After logout, the personal space must redirect to the login page. This
    // redirect is served through the PPR/RSC stream (the unauthorized
    // boundary calls `redirect('/connexion')`), which can abort the document
    // load in Chromium (net::ERR_ABORTED). Commit to the navigation first,
    // then assert where the app actually lands.
    await page
      .goto('/mon-espace', { waitUntil: 'commit' })
      .catch(() => undefined)
    await expect(page).toHaveURL(/\/connexion/)
  })
})

test.describe.fixme('Email change', () => {
  // Same alias as above: the test runs signed in as a seeded verified user.
  const test = signedInTest

  test('can change email from personal space', async ({ page }) => {
    const newEmail = faker.internet.email({
      provider: TEST_EMAIL_DOMAIN,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    })

    await page.goto('/mon-espace/parametres')
    await expect(page.getByTestId('user-email-display')).toBeVisible()

    await page.getByTestId('edit-email-button').click()

    await page.locator('input[name="email"]').first().fill(newEmail)
    await page.getByTestId('submit-button').click()

    const codeInput = page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport()

    const code = await new UserMailbox(newEmail).getVerificationCode()
    await codeInput.fill(code)

    await page.getByTestId('verification-code-submit-button').click()

    await expect(page.getByTestId('success-message')).toBeVisible()

    await expect(page.getByTestId('user-email-display')).toHaveText(
      newEmail.toLowerCase()
    )
  })
})

test.describe('Simulation deletion', () => {
  // The test runs signed in as a verified user owning one completed
  // simulation (seeded below through the auto fixture).
  const test = simulationDeletionTest

  test.setTimeout(120_000)

  test('can delete a simulation from personal space', async ({
    page,
    ngcTest,
  }) => {
    await page.goto(START_SIMULATION_PATH)
    await ngcTest.skipAllQuestions()

    await page.goto('/mon-espace')
    await expect(page.getByTestId('results-list-title')).toBeVisible()

    const deleteButtons = page.getByTestId('delete-simulation-button')
    const initialCount = await deleteButtons.count()
    expect(initialCount).toBeGreaterThan(0)

    await deleteButtons.first().click()
    await page.getByTestId('confirm-delete-simulation-button').click()

    // The deletion goes through a server action (fetch + revalidatePath); on a
    await expect(deleteButtons).toHaveCount(initialCount - 1)
  })
})
