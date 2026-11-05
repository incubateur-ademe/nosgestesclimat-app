import {
  generateGroupName,
  generateOrganisationName,
  generatePollName,
  generateUser,
} from '../../helpers/test-data'
import { CookieBanner } from '../../page-objects/cookie-banner'
import { EmailVerification } from '../../page-objects/email-verification'
import { Group } from '../../page-objects/group'
import { NGCTest } from '../../page-objects/ngc-test'
import { Organisation } from '../../page-objects/organisation'
import { Poll } from '../../page-objects/poll'
import { UserSpace } from '../../page-objects/user-space'
import { expect, test as setup } from '../fixtures'
import {
  saveContext,
  saveGroup,
  saveOrganisation,
  savePoll,
  saveUser,
} from '../fixtures/context'

import {
  COMPLETED_TEST_STATE,
  GROUP_ADMIN_STATE,
  NEW_VISITOR_STATE,
  ORGANISATION_ADMIN_STATE,
  USER_ACCOUNT_STATE,
} from '../state'

setup.setTimeout(120_000)

setup('new visitor', async ({ page }) => {
  // We go to the blog to not create a userId from the start
  await page.goto('/blog')
  await new CookieBanner(page).dismiss()
  // Delete anon session cookie
  await page.context().clearCookies()
  await saveContext(page, NEW_VISITOR_STATE)
})

setup('complete test', async ({ page }) => {
  await page.goto('/')
  await new CookieBanner(page).dismiss()
  await new NGCTest(page).skipAll()
  await page.waitForURL(/\/fin/)
  await saveContext(page, COMPLETED_TEST_STATE)
})

setup('complete test and save its simulation', async ({ page }) => {
  const user = generateUser()

  await page.goto('/')
  await new CookieBanner(page).dismiss()
  await new NGCTest(page).skipAll()
  await page.waitForURL(/\/fin/)
  await new EmailVerification(page).complete(user.email)

  // User should be redirected to the user space
  await expect(page).toHaveURL(new RegExp(UserSpace.URL))

  // User should be greeted
  await expect(page.getByText('Bienvenue dans votre espace')).toBeInViewport()

  await saveUser(page, user)
  await saveContext(page, USER_ACCOUNT_STATE)
})

setup('complete test and create group', async ({ page }) => {
  const admin = generateUser()
  const name = generateGroupName()
  const group = new Group(page)

  await page.goto('/')
  await new CookieBanner(page).dismiss()
  await new NGCTest(page).skipAll()
  await page.waitForURL(/\/fin/)

  await page.getByTestId('my-groups-tab').click()
  await page.getByTestId('create-group-button').click()

  await expect(page).toHaveURL(new RegExp(Group.CREATION_URL))
  await new EmailVerification(page).complete(admin.email)
  const url = await group.create({ name, ownerName: admin.firstName })
  const inviteLink = await group.copyInviteLink()

  await saveGroup(page, { name, url, inviteLink }, admin)
  await saveContext(page, GROUP_ADMIN_STATE)
})

setup('create an organisation with a poll', async ({ page }) => {
  const admin = generateUser()
  const organisationName = generateOrganisationName()
  const pollName = generatePollName()
  const organisation = new Organisation(page)
  const poll = new Poll(page)

  await page.goto('/')
  await new CookieBanner(page).dismiss()
  await organisation.goFromLandingPage()
  await new EmailVerification(page).complete(admin.email)
  const organisationSlug = await organisation.create({
    name: organisationName,
    administrator: admin,
  })
  const pollSlug = await poll.create(pollName)
  const inviteLink = await poll.copyInviteLink()

  await saveOrganisation(
    page,
    { name: organisationName, slug: organisationSlug },
    admin
  )
  await savePoll(page, { name: pollName, slug: pollSlug, inviteLink })

  // @TODO: uncomment when re-enabling mode scolaire
  // Create a second poll in scolaire mode for youth tutorial testing
  // const scolairePollName = generatePollName()
  // await page.goto(Poll.createUrl(organisationSlug))
  // const scolairePollSlug = await poll.create(scolairePollName, 'scolaire')
  // const scolaireInviteLink = await poll.copyInviteLink()
  // await savePoll(
  //   page,
  //   {
  //     name: scolairePollName,
  //     slug: scolairePollSlug,
  //     inviteLink: scolaireInviteLink,
  //   },
  //   'poll-scolaire'
  // )

  await saveContext(page, ORGANISATION_ADMIN_STATE)
})
