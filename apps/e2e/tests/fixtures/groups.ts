import { getPlaywrightState } from '../helpers/save-context'
import { Group } from '../pages/group'
import { User } from '../pages/user'
import { GROUP_ADMIN_STATE } from '../state'
import { test as base, expect } from './user'

export { Group } from '../pages/group'

interface GroupPageFixtures {
  group: Group
}

const test = base.extend<GroupPageFixtures>({
  group: async ({ browser, user, setup, page, storageState }, use) => {
    if (setup) {
      return await use(new Group(page, user))
    }

    const useCurrentContext = storageState === GROUP_ADMIN_STATE
    if (useCurrentContext) {
      const groupData = await getPlaywrightState<{
        name: string
        inviteLink?: string
        url?: string
      }>(page, 'group')
      const userData = await getPlaywrightState<{
        firstName: string
        lastName: string
        email: string
      }>(page, 'user')
      return await use(new Group(page, new User(page, userData), groupData))
    }

    const context = await browser.newContext({
      storageState: GROUP_ADMIN_STATE,
    })

    page = await context.newPage()
    const groupData = await getPlaywrightState<{
      name: string
      inviteLink?: string
      url?: string
    }>(page, 'group')
    const userData = await getPlaywrightState<{
      firstName: string
      lastName: string
      email: string
    }>(page, 'user')
    await use(new Group(page, new User(page, userData), groupData))
    await page.context().close()
  },
})

export { expect, test }
