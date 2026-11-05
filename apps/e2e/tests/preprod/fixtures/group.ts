import { test as base, expect } from '@playwright/test'
import { GROUP_ADMIN_STATE } from '../state'
import { restoreFromState, restoreGroup, type RestoredGroup } from './context'

interface GroupFixtures {
  group: RestoredGroup
}

const test = base.extend<GroupFixtures>({
  group: async ({ browser, page, storageState }, use) => {
    await use(
      storageState === GROUP_ADMIN_STATE
        ? await restoreGroup(page)
        : await restoreFromState(browser, GROUP_ADMIN_STATE, restoreGroup)
    )
  },
})

export { expect, test }
