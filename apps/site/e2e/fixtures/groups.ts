import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'

import { copyAndReadClipboard } from '../helpers/clipboard'
import {
  getPlaywrightState,
  savePlaywrightState,
} from '../helpers/save-context'
import { GROUP_ADMIN_STATE } from '../state'
import { test as base, expect, User } from './user'

function generateName() {
  return `${faker.word.adjective()} ${faker.word.noun()}`
}

interface Data {
  name: string
  inviteLink?: string
  url?: string
}
export class Group {
  static CREATION_URL = '/amis/creer'

  constructor(
    public readonly page: Page,
    public admin: User,
    public readonly data: Data = {
      name: generateName(),
    }
  ) {}

  get name() {
    return this.data.name
  }

  get url() {
    return this.data.url!
  }

  get inviteLink() {
    return this.data.inviteLink!
  }

  async create() {
    await this.page
      .getByTestId('group-input-owner-name')
      .fill(this.admin.firstName)
    await this.page.getByTestId('group-name').fill(this.name)
    await this.page.getByTestId(`group-select-emoji-🍒`).click()
    await this.page.getByTestId('button-validate-create-group').click()
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveURL(/groupId=.*/)
    this.data.url = this.page.url()
  }

  async delete() {
    await this.page.getByTestId('button-delete-group').click()
    await this.page.getByTestId('button-confirm-delete-group').click()
  }

  async changeName() {
    const newName = generateName()
    await this.page.getByTestId('group-name-edit-button').click()
    await this.page.getByTestId('group-edit-input-name').fill(newName)
    await this.page.getByTestId('button-inline-input').click()
    await this.page.waitForLoadState('networkidle')
    this.data.name = newName
  }

  async joinWithInviteLink(user: User) {
    await user.page.goto(this.inviteLink)
    await user.page.getByTestId('member-name').fill(user.firstName)
    await user.page.getByTestId('button-join-group').click()
  }

  async leave(page: Page) {
    await page.getByTestId('button-leave-group').click()
    await page.getByTestId('button-confirm-leave-group').click()
  }

  async copyInviteLink() {
    const clipboardContent = await copyAndReadClipboard({
      page: this.page,
      copyAction: () => this.page.getByTestId('invite-button').click(),
    })
    this.data.inviteLink = clipboardContent
    return clipboardContent
  }

  async goFromGroupTabs(page: Page) {
    await page.getByTestId('my-groups-tab').click()
    await page.waitForTimeout(500)
    await page.getByText(this.name).click()
  }

  async saveInContext() {
    await this.admin.saveInContext()
    await savePlaywrightState(this.page, 'group', this.data)
  }

  static async fromContext(page: Page) {
    const data = await getPlaywrightState<Data>(page, 'group')

    const admin = await User.fromContext(page)

    return new Group(page, admin, data)
  }
}

interface GroupPageFixtures {
  group: Group
}

const test = base.extend<GroupPageFixtures>({
  group: async ({ browser, user, setup, page, storageState }, use) => {
    if (setup) {
      return use(new Group(page, user))
    }

    const useCurrentContext = storageState === GROUP_ADMIN_STATE
    if (useCurrentContext) {
      return use(await Group.fromContext(page))
    }

    const context = await browser.newContext({
      storageState: GROUP_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await Group.fromContext(page))
    await page.context().close()
  },
})

export { expect, test }
