import { Poll } from '../../page-objects/poll'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { restorePoll } from './context'
import { test as base } from './organisation'

interface PollPageFixtures {
  poll: Poll
}

const test = base.extend<PollPageFixtures>({
  poll: async ({ browser, organisation, setup, page, storageState }, use) => {
    if (setup) {
      return await use(new Poll(page, organisation))
    }

    const useCurrentContext = storageState === ORGANISATION_ADMIN_STATE
    if (useCurrentContext) {
      return await use(await restorePoll(page, organisation))
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await restorePoll(page, organisation))
    await page.context().close()
  },
})

export { test }
