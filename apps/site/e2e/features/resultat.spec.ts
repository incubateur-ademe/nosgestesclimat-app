import type { Situation } from '@/publicodes-state/types'
import { expect, test } from '../fixtures'
import { getCarbonFootprintElem } from '../helpers/carbon-footprint'
import { skipOnSafari } from '../helpers/skip-on-safari'
import { COMPLETED_TEST_STATE, USER_ACCOUNT_STATE } from '../state'

test.beforeEach(async ({ page }) => {
  await page.goto('/fin')
})

test('Should redirect to the home if no simulation', async ({ page }) => {
  await expect(page).toHaveURL('/', {
    timeout: 3000,
  })
})

test.describe('Given a user that completed a test without an account', () => {
  test.use({ storageState: COMPLETED_TEST_STATE })

  test('can access the end page directly', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp('/fin'))
  })

  test('should be accessible from the home', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('do-the-test-link').first().click()
    await expect(page).toHaveURL(new RegExp('/fin'))
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
    expect(waterFootprintResult).toBeGreaterThan(6000)
  })

  test('should not display a tendency indicator on the first simulation', async ({
    page,
  }) => {
    await page.waitForTimeout(3500)
    await expect(page.getByTestId('tendency-indicator')).toBeHidden()
  })
})

test.describe('Given an authenticated user that completed the test twice with different results', () => {
  test.use({ storageState: USER_ACCOUNT_STATE })
  test.setTimeout(120_000)

  test('should display a tendency indicator on the result page', async ({
    page,
    ngcTest,
    browser,
  }) => {
    skipOnSafari(browser)
    // The authenticated user already has a completed simulation saved in their account
    await expect(page).toHaveURL(/\/fin/)

    // 2. Restart and do a second simulation with different answers
    await page.goto('/')
    await page.getByTestId('restart-link').click()
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
    await expect(page.getByText(/votre dernier résultat/)).toBeVisible()
  })
})
