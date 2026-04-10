import type { Page } from '@playwright/test'
import { test as base, type User } from './user'

export class UserSpace {
  static URL = '/mon-espace'

  constructor(
    public readonly page: Page,
    public readonly user: User
  ) {}

  async goto() {
    await this.page.goto(UserSpace.URL)
  }

  async fromHeader() {
    await this.page.getByTestId('my-space-button').click()
    await this.page.getByTestId('my-space-link').click()
  }
}

interface UserSpaceFixtures {
  userSpace: UserSpace
}

const test = base.extend<UserSpaceFixtures>({
  userSpace: async ({ page, user }, use) => {
    await use(new UserSpace(page, user))
  },
})

export { test }
