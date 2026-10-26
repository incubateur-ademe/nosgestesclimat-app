import { UserSpace } from '../pages/user-space'
import { test as base } from './user'

export { UserSpace } from '../pages/user-space'

interface UserSpaceFixtures {
  userSpace: UserSpace
}

const test = base.extend<UserSpaceFixtures>({
  userSpace: async ({ page, user }, use) => {
    await use(new UserSpace(page, user))
  },
})

export { test }
