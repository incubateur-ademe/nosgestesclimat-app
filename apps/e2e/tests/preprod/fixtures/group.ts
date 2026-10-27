import { Group } from '../../page-objects/group'
import { GROUP_ADMIN_STATE } from '../state'
import { restoreGroup } from './context'
import { test as base, expect } from './user'

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
      return await use(await restoreGroup(page))
    }

    const context = await browser.newContext({
      storageState: GROUP_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await restoreGroup(page))
    await page.context().close()
  },
})

export { expect, test }
