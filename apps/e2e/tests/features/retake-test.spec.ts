import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { UnverifiedUser } from '@nosgestesclimat/core/features/users/types/user'
import { signIn } from '../helpers/session'
import { test as base, expect } from '../local/fixtures'
import { NGCTest } from '../page-objects/ngc-test'

const test = base.extend<{
  ngcTest: NGCTest
  /** An anonymous user seeded in the e2e database and signed in. */
  user: UnverifiedUser
}>({
  ngcTest: async ({ page }, use) => {
    await use(new NGCTest(page))
  },
  user: [
    async ({ context }, use) => {
      const user = await userFactory.unverified().create()
      await signIn(context, user)
      await use(user)
    },
    { auto: true },
  ],
})

test.setTimeout(250_000)

const persona = Object.values(personas)[0]

test.describe('Given a user that completed a test', () => {
  test('« Repasser le test » should start a brand new simulation', async ({
    ngcTest,
    page,
    user,
  }) => {
    // The first question of a fresh test, read from a test start that is
    // never answered: running a whole test through the UI is what makes this
    // suite slow, so the completed simulation below is seeded instead.
    await ngcTest.start()
    await page.waitForURL(/question=/)
    const firstQuestion = new URL(page.url()).searchParams.get('question')

    // Given a first completed simulation, seeded in the e2e database through
    // the core factories rather than run through the UI. Seeded after the
    // test start above, it is the user's current (latest) simulation.
    await simulationFactory
      .completed()
      .params({ userId: user.id, situation: persona.situation })
      .withValidComputedResults()
      .create()

    await page.goto('/fin')

    // When the user goes back to the home page and retakes the test
    // (client-side navigation on purpose: a full reload would hide the bug)
    await page.getByTestId('home-logo-link').first().click()
    await page.getByTestId('restart-link').click()
    await page.waitForURL(/\/simulateur\/bilan/)

    // Then the test starts over from its first question
    await expect
      .poll(() => new URL(page.url()).searchParams.get('question'))
      .toBe(firstQuestion)
    await expect(page.getByTestId('end-test-button')).toBeHidden()

    // And completing it again updates the results shown on the home page
    await ngcTest.answerTest(persona.situation)
    await page.waitForURL(/\/fin/)

    await page.getByTestId('home-logo-link').first().click()
    await expect(page.getByTestId('restart-link')).toBeVisible()
    await expect(page.getByTestId('main-cta').first()).toContainText(
      'Voir mes résultats'
    )
  })
})
