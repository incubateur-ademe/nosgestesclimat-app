
import {test as setup, expect} from '../fixtures'
import { Group } from '../fixtures/groups'
import { UserSpace } from '../fixtures/user-account'
import { saveContext } from '../helpers/save-context'

import { NEW_VISITOR_STATE, COMPLETED_TEST_STATE, USER_ACCOUNT_STATE, GROUP_ADMIN_STATE, ORGANISATION_ADMIN_STATE } from '../state'

setup.setTimeout(60_000)


setup('new visitor', async ({ page, cookieBanner }) => {
  // We go to the blog to not create a userId from the start
  await page.goto('/blog')
  await cookieBanner.dismiss()
  // Delete anon session cookie
  await page.context().clearCookies()
  await saveContext(page, NEW_VISITOR_STATE)
})


setup('complete test', async ({ page, ngcTest, cookieBanner }) => {
  await page.goto('/')
  await cookieBanner.dismiss()
  await ngcTest.skipAll()
  await expect(page).toHaveURL(/\/fin/)

  await page.waitForTimeout(3000)

  await saveContext(page, COMPLETED_TEST_STATE)

})


setup('complete test and create group', async ({ page, group, ngcTest, cookieBanner }) => {
  await page.goto('/')
  await cookieBanner.dismiss()
  await ngcTest.skipAll()

  // Wait for simulation to be saved
  await page.waitForTimeout(3000)

  await page.getByTestId("my-groups-tab").click();
  await page.getByTestId("create-group-button").click()

  await expect(page).toHaveURL(new RegExp(Group.CREATION_URL))
  await group.admin.fillEmailAndCompleteVerification()
  await group.create()
  await group.copyInviteLink()

  await group.saveInContext()
  await saveContext(page, GROUP_ADMIN_STATE)
})

setup('complete test and save its simulation', async ({ page, ngcTest, cookieBanner, user }) => {
  await page.goto('/')
  await cookieBanner.dismiss()
  await ngcTest.skipAll()
  await user.fillEmailAndCompleteVerification()

  // User should be redirected to the user space
  await expect(page).toHaveURL(new RegExp(UserSpace.URL))

  // User should be greeted
  await expect(page.getByText('Bienvenue dans votre espace')).toBeInViewport()

  await user.saveInContext()
  await saveContext(page, USER_ACCOUNT_STATE)
})

setup('create an organisation with a poll', async ({ page, organisation, poll, cookieBanner }) => {
  await page.goto('/')
  await cookieBanner.dismiss()
  await organisation.goFromLandingPage()
  await organisation.admin.fillEmailAndCompleteVerification()
  await organisation.create()
  await poll.create()
  await poll.copyInviteLink()

  await organisation.saveInContext()
  await poll.saveInContext()
  await saveContext(page, ORGANISATION_ADMIN_STATE)
})
