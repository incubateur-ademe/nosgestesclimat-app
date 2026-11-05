import { test as base, expect } from '@playwright/test'
import { generateUser, type UserData } from '../../helpers/test-data'
import { restoreUser } from './context'

interface UserFixtures {
  /** The user of the current storage state, or a new one for a new visitor. */
  user: UserData
}

const test = base.extend<UserFixtures>({
  user: async ({ page }, use) => {
    await use((await restoreUser(page)) ?? generateUser())
  },
})

export { expect, test }
