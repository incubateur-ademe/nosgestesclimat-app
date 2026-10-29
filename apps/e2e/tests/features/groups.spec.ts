import { faker } from '@faker-js/faker'
import { groupFactory } from '@nosgestesclimat/core/features/groups/factories/group.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { Page } from '@playwright/test'
import { TEST_EMAIL_DOMAIN } from '../constants'
import { createPage } from '../fixtures'
import { signIn } from '../helpers/session'
import { test as base, expect, resetDatabase } from '../local/fixtures'
import { Group } from '../page-objects/group'
import { NGCTest } from '../page-objects/ngc-test'
import { TutorialPage } from '../page-objects/tutorial'
import { User } from '../page-objects/user'
import { UserSpace } from '../page-objects/user-space'

/**
 * Seeds a group in the e2e database, with its administrator: a verified user
 * who administrates the group and participates in it (with a completed
 * simulation). The administrator's stored name is the given first name alone,
 * because the invitation page and the ranking render it verbatim.
 *
 * Returns the seeded administrator and the Group page object, with the site
 * routes derived from the seeded group. Signing the administrator in is left
 * to the caller: the « new user » describe reuses this helper without signing
 * in.
 */
async function seedGroupWithAdmin(page: Page) {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const admin = await userFactory.verified().create({ name: firstName })
  const seededGroup = await groupFactory
    .withAdministrator(admin.id)
    .withParticipant({ userId: admin.id })
    .create()
  const user = new User(page, {
    firstName,
    lastName,
    email: admin.email,
  })
  const group = new Group(page, user, {
    name: seededGroup.name,
    url: `/amis/resultats?groupId=${seededGroup.id}`,
    inviteLink: `/amis/invitation?groupId=${seededGroup.id}`,
  })
  return { admin, user, group }
}

// The local suite has no page-object fixtures: NGCTest and TutorialPage are
// stateless and take the page, so they are instantiated through fixtures here.
const test = base.extend<{ ngcTest: NGCTest; tutorialPage: TutorialPage }>({
  ngcTest: async ({ page }, use) => {
    await use(new NGCTest(page))
  },
  tutorialPage: async ({ page }, use) => {
    await use(new TutorialPage(page))
  },
})

interface GroupAdmin {
  user: User
  group: Group
}

/**
 * Group administrator context, seeded in the e2e database and signed in
 * through helpers/session (no verification code flow): a verified user who
 * administrates and participates in a seeded group.
 */
const adminTest = test.extend<{
  groupAdmin: GroupAdmin
  user: User
  userSpace: UserSpace
  group: Group
}>({
  groupAdmin: async ({ page }, use) => {
    const { admin, user, group } = await seedGroupWithAdmin(page)
    await signIn(page.context(), admin)
    await use({ user, group })
  },
  user: async ({ groupAdmin }, use) => {
    await use(groupAdmin.user)
  },
  userSpace: async ({ page, groupAdmin }, use) => {
    await use(new UserSpace(page, groupAdmin.user))
  },
  group: async ({ groupAdmin }, use) => {
    await use(groupAdmin.group)
  },
})

/**
 * New visitor context: the default context is already a fresh new visitor
 * (localVisitorState: cookie banner dismissed, no session), so only the group
 * has to be seeded — without signing anyone in.
 */
const newcomerTest = test.extend<{ group: Group; user: User }>({
  group: async ({ page }, use) => {
    const { group } = await seedGroupWithAdmin(page)
    await use(group)
  },
  user: async ({ page }, use) => {
    await use(new User(page))
  },
})

let page: Page
let seededGroup: Group

/**
 * The tests of the last describe share one page, seeded once in beforeAll: the
 * `group` fixture exposes the group seeded there.
 */
const joinedTest = test.extend<{ group: Group }>({
  group: async ({}, use) => {
    await use(seededGroup)
  },
})

test.describe('A group admin', () => {
  // The tests run signed in as the seeded group administrator: alias the
  // extended test type to keep the usual `test(...)` declaration shape.
  const test = adminTest

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
      await expect(
        page.getByText(newGroup.name).filter({ visible: true })
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
  // Same alias as above: the tests run signed in as the seeded administrator.
  const test = adminTest

  test.beforeEach(async ({ group, page }) => {
    await page.goto(group.url)
  })

  test('displays group name in h1', async ({ group, page }) => {
    await expect(page.getByTestId('group-name')).toHaveText(group.name)
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
  const test = newcomerTest

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
    await group.joinWithInviteLink(user)
    await expect(page).toHaveURL(new RegExp(TutorialPage.URL))
  })

  test('can leave its email after completing the test', async ({
    page,
    ngcTest,
    tutorialPage,
    group,
  }) => {
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
    await group.joinWithInviteLink(user)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await page.getByTestId('skip-email-button').click()
    await expect(page).toHaveURL('/fin')
    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)
  })

  test('sees its first name in the group ranking after joining', async ({
    page,
    ngcTest,
    tutorialPage,
    group,
  }) => {
    const participantName = faker.person.firstName()
    const user = new User(page, {
      firstName: participantName,
      lastName: faker.person.lastName(),
      email: faker.internet.email({
        provider: TEST_EMAIL_DOMAIN,
        firstName: participantName,
      }),
    })

    await group.joinWithInviteLink(user)
    await tutorialPage.skip()
    await ngcTest.skipAllQuestions()
    await user.fillEmailAndCompleteVerification()
    await expect(page).toHaveURL('/fin')

    await page.getByTestId('see-group-result-button').click()
    await expect(page).toHaveURL(group.url)

    await expect(
      page.getByTestId('participant-name').filter({ hasText: participantName })
    ).toBeVisible()
  })
})

test.describe('A user with a completed test that joined a group', () => {
  // The tests share one page, seeded once in beforeAll (a fresh visitor who
  // completed the test and joined the group): alias the extended test type
  // whose `group` fixture exposes the group seeded there.
  const test = joinedTest

  test.describe.configure({ mode: 'default' })
  // The per-test reset would wipe the data seeded in beforeAll: the database
  // is emptied once, there. The tests run in order on a single worker.
  test.use({ resetDatabase: false })

  test.beforeAll(async ({ browser }) => {
    // Completing the whole test and joining a group takes well over the 30s
    // default hook timeout on a loaded environment; the describe-level
    // test.setTimeout() does not raise the hook budget.
    test.setTimeout(120_000)

    await resetDatabase()

    page = await createPage(browser)
    await new NGCTest(page).skipAll()
    await expect(page).toHaveURL('/fin')

    const user = new User(page, {
      email: faker.internet.email({ provider: TEST_EMAIL_DOMAIN }),
      firstName: 'John',
      lastName: 'Doe',
    })

    // Seed the group (administrator included) in the e2e database.
    seededGroup = (await seedGroupWithAdmin(page)).group

    await seededGroup.joinWithInviteLink(user)
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
    await group.goFromGroupTabs(page)
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
    await group.leave(page)
    await page.goto('/fin')
    await page.getByTestId('my-groups-tab').click()
    await expect(
      page.getByText(group.name).filter({ visible: true })
    ).toHaveCount(0)
  })
})
