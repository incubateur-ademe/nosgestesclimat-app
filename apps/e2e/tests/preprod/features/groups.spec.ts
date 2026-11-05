import type { Page } from '@playwright/test'
import { createPage } from '../../fixtures/feature-flags'
import { generateGroupName, generateUser } from '../../helpers/test-data'
import { EmailVerification } from '../../page-objects/email-verification'
import { Group } from '../../page-objects/group'
import { NGCTest } from '../../page-objects/ngc-test'
import { TutorialPage } from '../../page-objects/tutorial'
import { UserSpace } from '../../page-objects/user-space'
import { expect, test } from '../fixtures'
import { restoreFromState, restoreGroup } from '../fixtures/context'
import { GROUP_ADMIN_STATE, NEW_VISITOR_STATE } from '../state'

test.use({ storageState: GROUP_ADMIN_STATE })

test.describe('A group admin', () => {
  test('can go to its group from its user account', async ({ page, group }) => {
    await new UserSpace(page).goto()
    await new Group(page).goFromGroupTabs(group.name)
  })

  test.describe('can create a new group and delete it', () => {
    let newGroupName: string

    test.beforeEach(async ({ page, user }) => {
      newGroupName = generateGroupName()
      await page.goto(Group.CREATION_URL)
      await page.waitForTimeout(500)
      await new Group(page).create({
        name: newGroupName,
        ownerName: user.firstName,
      })
    })

    test('and change its name', async ({ page }) => {
      newGroupName = generateGroupName()
      await new Group(page).changeName(newGroupName)
      await expect(
        page.getByTestId('group-name').getByText(newGroupName)
      ).toBeVisible()
    })

    test.afterEach(async ({ page }) => {
      await new Group(page).delete()
      await expect(page).toHaveURL('/mon-espace/groupes')
      await expect(
        page.getByText(newGroupName).filter({ visible: true })
      ).toHaveCount(0)
    })
  })

  test('lands on the result page if it use its own group invite link', async ({
    page,
    group,
  }) => {
    await page.goto(group.inviteLink)
    await expect(page).toHaveURL(group.url)
  })
})

test.describe('The group result page, when accessed by an admin', () => {
  test.beforeEach(async ({ group, page }) => {
    await page.goto(group.url)
  })

  test('displays group name in h1', async ({ group, page }) => {
    await expect(page.getByTestId('group-name')).toHaveText(group.name)
  })

  test('has an invite link that can be copied with good utm', async ({
    page,
    baseURL,
  }) => {
    const clipboardContent = await new Group(page).copyInviteLink()
    expect(clipboardContent).toMatch(new RegExp(`^${baseURL}`))
    expect(clipboardContent).toMatch(/utm_medium=sharelink/)
    expect(clipboardContent).toMatch(/utm_source=NGC/)
  })

  test('displays main section', async ({ page }) => {
    await expect(page.getByTestId('votre-empreinte-title')).toBeVisible()
  })

  test('displays the admin first name in the ranking', async ({
    page,
    group,
  }) => {
    await expect(
      page
        .getByTestId('participant-name')
        .filter({ hasText: group.admin.firstName })
    ).toBeVisible()
    await expect(page.getByTestId('current-member-badge')).toBeVisible()
  })
})

test.describe('A new user', () => {
  test.use({ storageState: NEW_VISITOR_STATE })

  test('is redirected to the invite screen if it goes to the result page', async ({
    group,
    page,
  }) => {
    await page.goto(group.url)
    await expect(
      page.getByRole('heading', {
        name: `${group.admin.firstName} vous a invité à rejoindre le groupe`,
      })
    ).toBeInViewport()
  })

  test('can join a group', async ({ group, user, page }) => {
    await new Group(page).joinWithInviteLink(group.inviteLink, user.firstName)
    await expect(page).toHaveURL(new RegExp(TutorialPage.URL))
  })

  test('can leave its email after completing the test', async ({
    page,
    group,
  }) => {
    const ngcTest = new NGCTest(page)
    const tutorialPage = new TutorialPage(page)

    const user = generateUser()
    await new Group(page).joinWithInviteLink(group.inviteLink, user.firstName)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await new EmailVerification(page).complete(user.email)
    await expect(page).toHaveURL('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
  })

  test('can skip leaving its email after completing the test', async ({
    page,
    user,
    group,
  }) => {
    const ngcTest = new NGCTest(page)
    const tutorialPage = new TutorialPage(page)

    await new Group(page).joinWithInviteLink(group.inviteLink, user.firstName)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await page.getByTestId('skip-email-button').click()
    await expect(page).toHaveURL('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
  })

  test('sees its first name in the group ranking after joining', async ({
    page,
    group,
  }) => {
    const ngcTest = new NGCTest(page)
    const tutorialPage = new TutorialPage(page)

    const user = generateUser()

    await new Group(page).joinWithInviteLink(group.inviteLink, user.firstName)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await new EmailVerification(page).complete(user.email)
    await expect(page).toHaveURL('/fin')

    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)

    await expect(
      page.getByTestId('participant-name').filter({ hasText: user.firstName })
    ).toBeVisible()
  })
})

test.describe('A user with a completed test that joined a group', () => {
  test.use({ storageState: NEW_VISITOR_STATE })

  test.describe.configure({ mode: 'default' })
  let page: Page

  test.beforeAll(async ({ browser }) => {
    // Completing the whole test and joining a group takes well over the 30s
    // default hook timeout on a loaded preprod; the describe-level
    // test.setTimeout() does not raise the hook budget.
    test.setTimeout(120_000)

    page = await createPage(browser)
    await new NGCTest(page).skipAll()
    await expect(page).toHaveURL('/fin')

    const group = await restoreFromState(
      browser,
      GROUP_ADMIN_STATE,
      restoreGroup
    )

    await new Group(page).joinWithInviteLink(group.inviteLink, 'John')
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('see the group result page after joining', async ({ group }) => {
    await expect(page).toHaveURL(group.url)
    await expect(page.getByTestId('group-name')).toContainText(group.name)
  })

  test('can access the group result page directly', async ({ group }) => {
    await page.goto(group.url)
    await expect(page).toHaveURL(group.url)
    await expect(page.getByTestId('group-name')).toContainText(group.name)
  })

  test('can go to the group from the end page of his test', async ({
    group,
  }) => {
    await page.goto('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
    await expect(page.getByTestId('group-name')).toContainText(group.name)
  })

  test('can see the group in the « mes groupes » tab', async ({ group }) => {
    await page.goto('/fin')
    await new Group(page).goFromGroupTabs(group.name)
    await expect(page).toHaveURL(group.url)
    await expect(page.getByTestId('group-name')).toContainText(group.name)
  })

  test('when he reuses the invite link, lands directly on the result page', async ({
    group,
  }) => {
    await page.goto(group.inviteLink)
    await expect(page).toHaveURL(group.url)
    await expect(page.getByTestId('group-name')).toContainText(group.name)
  })

  test('can leave a group', async ({ group }) => {
    await expect(page.getByTestId('button-leave-group')).toBeVisible()
    await new Group(page).leave()
    await page.goto('/fin')
    await page.getByTestId('my-groups-tab').click()
    await expect(
      page.getByText(group.name).filter({ visible: true })
    ).toHaveCount(0)
  })
})
