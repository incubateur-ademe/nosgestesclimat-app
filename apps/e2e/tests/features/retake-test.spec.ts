import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import { expect, test } from '../fixtures'

test.setTimeout(250_000)

const persona = Object.values(personas)[0]

test.describe('Given a user that completed a test', () => {
  test('« Repasser le test » should start a brand new simulation', async ({
    ngcTest,
    page,
  }) => {
    // Given a first completed simulation
    await ngcTest.start()
    await page.waitForURL(/question=/)
    const firstQuestion = new URL(page.url()).searchParams.get('question')

    await ngcTest.answerTest(persona.situation)
    await page.waitForURL(/\/fin/)

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
