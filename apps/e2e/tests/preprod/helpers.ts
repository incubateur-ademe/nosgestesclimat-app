import type { Page } from '@playwright/test'
import { getCarbonFootprintElem } from '../helpers/carbon-footprint'
import {
  generateOrganisationName,
  generatePollName,
  generateUser,
} from '../helpers/test-data'
import { CookieBanner } from '../page-objects/cookie-banner'
import { EmailVerification } from '../page-objects/email-verification'
import { NGCTest } from '../page-objects/ngc-test'
import { Organisation } from '../page-objects/organisation'
import { Poll } from '../page-objects/poll'
import { expect } from './fixtures'

/** Every journey starts this way: a fresh context, with nothing stored. */
export async function gotoAsNewVisitor(page: Page, url: string) {
  await page.goto(url)
  await new CookieBanner(page).dismiss()
}

export async function completeSimulationFromTutorial(page: Page) {
  const ngcTest = new NGCTest(page)
  await ngcTest.tutorialPage.skip()
  await ngcTest.skipAllQuestions()
}

export async function expectResultsPage(page: Page) {
  await expect(page).toHaveURL(/\/fin/)
  await expect(getCarbonFootprintElem(page)).toBeVisible()
}

export async function createOrganisationFromHome(page: Page) {
  const admin = generateUser()
  const name = generateOrganisationName()

  await gotoAsNewVisitor(page, '/')
  await page.getByTestId('organisation-link').click()
  await new EmailVerification(page).complete(admin.email)
  const slug = await new Organisation(page).create({
    name,
    administrator: admin,
  })

  return { admin, name, slug }
}

/** Leaves the page on the poll's dashboard, with its invite link copied. */
export async function createPollFromHome(page: Page) {
  const organisation = await createOrganisationFromHome(page)
  const name = generatePollName()

  const poll = new Poll(page)
  const slug = await poll.create(name)
  const inviteLink = await poll.copyInviteLink()

  return { organisation, poll: { name, slug, inviteLink } }
}
