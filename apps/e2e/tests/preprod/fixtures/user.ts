import type { User } from '../../page-objects/user'
import { restoreUser } from './context'
import { test as base, expect } from './options'

interface UserFixtures {
  user: User
}

const test = base.extend<UserFixtures>({
  user: async ({ page }, use) => {
    await use(await restoreUser(page))
  },
})

export { expect, test }
