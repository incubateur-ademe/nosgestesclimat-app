import type { Page } from '@playwright/test'
import { generateUser } from '../helpers/test-data'
import { EmailVerification } from '../page-objects/email-verification'
import { UserSpace } from '../page-objects/user-space'
import { expect, test } from './fixtures'
import {
  completeSimulationFromTutorial,
  expectResultsPage,
  gotoAsNewVisitor,
} from './helpers'

async function expectWelcomeInUserSpace(page: Page) {
  await expect(page).toHaveURL(new RegExp(UserSpace.URL))
  // Scoped: Next's route announcer repeats the page's title out of the content.
  await expect(
    page.locator('#main-content').getByText('Bienvenue dans votre espace')
  ).toBeVisible()
}

test('completes a simulation from the home page, sees the results and creates an account', async ({
  page,
}) => {
  await gotoAsNewVisitor(page, '/')
  await page.getByTestId('main-cta').first().click()
  await completeSimulationFromTutorial(page)
  await expectResultsPage(page)

  await new EmailVerification(page).complete(generateUser().email)

  await expectWelcomeInUserSpace(page)
  await expect(page.getByTestId('results-list-title')).toBeVisible()
})

test('creates an account, then completes a simulation', async ({ page }) => {
  await gotoAsNewVisitor(page, '/inscription')
  await new EmailVerification(page).complete(generateUser().email)
  await expectWelcomeInUserSpace(page)

  await page.getByRole('link', { name: 'Passer le test' }).click()
  await completeSimulationFromTutorial(page)
  await expectResultsPage(page)

  await new UserSpace(page).goto()
  await expect(page.getByTestId('results-list-title')).toBeVisible()
})
