import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { Group } from '../fixtures/groups'
import { NGCTest } from '../fixtures/ngc-test'
import { TutorialPage } from '../fixtures/tutorial'
import { User } from '../fixtures/user'
import { GROUP_ADMIN_STATE, NEW_VISITOR_STATE } from '../state'

test.use({ storageState: GROUP_ADMIN_STATE })

test.describe('A group admin', () => {
  test('can go to its group from its user account', async ({
    userSpace,
    page,
    group,
  }) => {
    await userSpace.goto()
    await group.goFromGroupTabs(page)
  })

  test.describe('can create a new group and delete it', () => {
    let newGroup: Group
    test.setTimeout(60_000)

    test.beforeEach(async ({ page, user }) => {
      newGroup = new Group(page, user)
      await page.goto(Group.CREATION_URL)
      await page.waitForTimeout(500)
      await newGroup.create()
    })

    test('and change its name', async ({ page }) => {
      await newGroup.changeName()
      await expect(
        page.getByTestId('group-name').getByText(newGroup.name)
      ).toBeVisible()
    })

    test.afterEach(async ({ page }) => {
      await newGroup.delete()
      await expect(page).toHaveURL('/mon-espace/groupes')
      await expect(page.getByText(newGroup.name)).toBeHidden()
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
    await expect(page.locator('h1')).toHaveText(group.name)
  })

  test('has an invite link that can be copied with good utm', async ({
    group,
    baseURL,
  }) => {
    const clipboardContent = await group.copyInviteLink()
    expect(clipboardContent).toMatch(new RegExp(`^${baseURL}`))
    expect(clipboardContent).toMatch(/utm_medium=sharelink/)
    expect(clipboardContent).toMatch(/utm_source=NGC/)
  })

  test('displays main section', async ({ page }) => {
    await expect(page.getByTestId('votre-empreinte-title')).toBeVisible()
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
      page.getByText(
        `${group.admin.firstName} vous a invité à rejoindre le groupe`
      )
    ).toBeInViewport()
  })

  test('can join a group', async ({ group, user, page }) => {
    await group.joinWithInviteLink(user)
    await expect(page).toHaveURL(new RegExp(TutorialPage.URL))
  })

  test('can leave its email after completing the test', async ({
    page,
    ngcTest,
    tutorialPage,
    group,
  }) => {
    test.setTimeout(60_000)
    const user = new User(page)
    await group.joinWithInviteLink(user)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await user.fillEmailAndCompleteVerification()
    await expect(page).toHaveURL('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
  })

  test('can skip leaving its email after completing the test', async ({
    page,
    ngcTest,
    tutorialPage,
    user,
    group,
  }) => {
    test.setTimeout(60_000)
    await group.joinWithInviteLink(user)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await page.getByTestId('skip-email-button').click()
    await expect(page).toHaveURL('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
  })
})

test.describe('A user with a completed test that joined a group', () => {
  test.use({ storageState: NEW_VISITOR_STATE })

  test.describe.configure({ mode: 'default' })
  test.setTimeout(60_000)
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await new NGCTest(page).skipAll()
    await expect(page).toHaveURL('/fin')

    const user = new User(page, {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    })

    const group = await Group.fromContext(
      await browser
        .newContext({
          storageState: GROUP_ADMIN_STATE,
        })
        .then((context) => context.newPage())
    )

    await group.joinWithInviteLink(user)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('see the group result page after joining', async ({ group }) => {
    await expect(page).toHaveURL(group.url)
    await expect(page.locator('h1')).toContainText(group.name)
  })

  test('can access the group result page directly', async ({ group }) => {
    await page.goto(group.url)
    await expect(page).toHaveURL(group.url)
    await expect(page.locator('h1')).toContainText(group.name)
  })

  test('can go to the group from the end page of his test', async ({
    group,
  }) => {
    await page.goto('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
    await expect(page.locator('h1')).toContainText(group.name)
  })

  test('can see the group in the « mes groupes » tab', async ({ group }) => {
    await page.goto('/fin')
    await group.goFromGroupTabs(page)
    await expect(page).toHaveURL(group.url)
    await expect(page.locator('h1')).toContainText(group.name)
  })

  test('when he reuses the invite link, lands directly on the result page', async ({
    group,
  }) => {
    await page.goto(group.inviteLink)
    await expect(page).toHaveURL(group.url)
    await expect(page.locator('h1')).toContainText(group.name)
  })

  test('can leave a group', async ({ group }) => {
    await page.goto(group.url)
    await group.leave(page)
    await page.goto('/fin')
    await page.getByTestId('my-groups-tab').click()
    await expect(page.getByText(group.name)).toBeHidden()
  })
})
