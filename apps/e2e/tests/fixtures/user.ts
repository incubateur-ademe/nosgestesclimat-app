import { getPlaywrightState } from '../helpers/save-context'
import { User } from '../pages/user'
import { test as base, expect } from './options'

export { User } from '../pages/user'

interface UserFixtures {
  user: User
}

const test = base.extend<UserFixtures>({
  user: async ({ page }, use) => {
    const data = await getPlaywrightState<{
      firstName: string
      lastName: string
      email: string
    }>(page, 'user')
    await use(new User(page, data))
  },
})

export { expect, test }
