import { computedResultsFactory } from '@nosgestesclimat/core/features/simulations/factories/computed-results.factory'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import type { Simulation } from '@nosgestesclimat/core/features/simulations/types/simulation'
import type { Situation } from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type {
  UnverifiedUser,
  VerifiedUser,
} from '@nosgestesclimat/core/features/users/types/user'
import { getCarbonFootprintElem } from '../helpers/carbon-footprint'
import { signIn } from '../helpers/session'
import { test as base, expect } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'

interface AnonymousCompletedTest {
  user: UnverifiedUser
  simulation: Simulation
}

interface AuthenticatedUserWithCompletedTest {
  user: VerifiedUser
  simulation: Simulation
}

base.beforeEach(async ({ page }) => {
  await page.goto('/fin')
})

base('Should redirect to the home if no simulation', async ({ page }) => {
  await expect(page).toHaveURL('/')
})

base.describe('Given a user that completed a test without an account', () => {
  /**
   * An anonymous (unverified) user with one completed simulation — a carbon
   * footprint displayed as « 8,4 tonnes » and a water footprint as
   * « 5 479 litres » per day — signed in with an anonymous session (no
   * email, hence no tendency on /fin).
   *
   * Auto fixture: the seeding must be done before the file-level beforeEach
   * navigates to /fin, and fixtures requested only by the test body are set
   * up after the beforeEach hooks have run.
   */
  const test = base.extend<{ anonymousCompletedTest: AnonymousCompletedTest }>({
    anonymousCompletedTest: [
      async ({ context }, use) => {
        const user = await userFactory.create()
        const computedResults = computedResultsFactory
          .valid()
          .withCarboneBilan(8400)
          .withEauBilan(2000000)
          .build()
        const simulation = await simulationFactory
          .completed()
          .params({ userId: user.id, computedResults })
          .create()
        await signIn(context, { id: user.id })
        await use({ user, simulation })
      },
      { auto: true },
    ],
  })

  test('can access the end page directly', async ({ page }) => {
    await expect(page).toHaveURL(/\/fin/)
  })

  test('should be accessible from the home', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('main-cta').first().click()
    await expect(page).toHaveURL(/\/fin/)
  })

  test('should display the carbon footprint', async ({ page }) => {
    const carbonFootprintElem = getCarbonFootprintElem(page)
    await expect(carbonFootprintElem).toBeInViewport()

    const carbonFootprintResult = parseFloat(
      (await carbonFootprintElem.innerText()).replace(',', '.')
    )
    expect(carbonFootprintResult).toBeGreaterThan(7)
  })

  test('should display the water footprint on water page', async ({ page }) => {
    // Wait for animation to finish
    await page.getByTestId('water-footprint-link').click()
    const waterFootprintElem = page
      .getByText(/[\d]+[\s]?litres/)
      .filter({ visible: true })
      .first()
    await expect(waterFootprintElem).toBeInViewport()

    const waterFootprintResult = parseInt(
      (await waterFootprintElem.innerText()).replace(/[\s]/, '')
    )
    expect(waterFootprintResult).toBeGreaterThan(5000)
  })

  test('should not display a tendency indicator on the first simulation', async ({
    page,
  }) => {
    await page.waitForTimeout(3500)
    await expect(page.getByTestId('tendency-indicator')).toBeHidden()
  })
})

base.describe(
  'Given an authenticated user that completed the test twice with different results',
  () => {
    /**
     * A verified user with one completed simulation (a carbon footprint of 1
     * tonne) dated yesterday, signed in with an authenticated session. The
     * simulation the test then runs through the UI is newer, so /fin computes
     * a tendency between the two. The seeding is an auto fixture for the same
     * reason as above: it must run before the file-level beforeEach navigates
     * to /fin.
     */
    const test = base.extend<{
      ngcTest: NGCTest
      authenticatedUserWithCompletedTest: AuthenticatedUserWithCompletedTest
    }>({
      ngcTest: async ({ page }, use) => {
        await use(new NGCTest(page))
      },
      authenticatedUserWithCompletedTest: [
        async ({ context }, use) => {
          const user = await userFactory.verified().create()
          const simulation = await simulationFactory
            .completed()
            .params({
              userId: user.id,
              computedResults: computedResultsFactory
                .valid()
                .withCarboneBilan(1000)
                .build(),
              // Dated before the simulation the test runs through the UI, so
              // that it is the previous result of the tendency.
              date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            })
            .create()
          await signIn(context, user)
          await use({ user, simulation })
        },
        { auto: true },
      ],
    })

    test.setTimeout(120_000)

    test('should display a tendency indicator on the result page', async ({
      page,
      ngcTest,
    }) => {
      await expect(page).toHaveURL(/\/fin/)

      // 2. Restart and do a second simulation with different answers
      await page.goto('/')

      await page.getByTestId('restart-link').first().click()
      const differentSituation: Situation = {
        'transport . voiture . utilisateur': "'propriétaire'",
        'transport . voiture . km': Math.round(Math.random() * 10000),
      }
      await ngcTest.answerTest(differentSituation)
      await expect(page).toHaveURL(/\/fin/)

      // 3. Verify the tendency indicator is visible
      const tendencyIndicator = page.getByTestId('tendency-indicator')
      await expect(tendencyIndicator).toBeVisible()

      // Verify it shows the correct text (increase or decrease)
      await expect(
        page.getByText(/votre dernier résultat/).filter({ visible: true })
      ).toBeVisible()
    })
  }
)
