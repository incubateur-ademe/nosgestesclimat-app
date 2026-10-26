import { getPlaywrightState } from '../helpers/save-context'
import { Poll } from '../pages/poll'
import { ORGANISATION_ADMIN_STATE } from '../state'

import { test as base } from './organisations'

export { Poll } from '../pages/poll'

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
      const pollData = await getPlaywrightState<{
        name: string
        slug?: string
        inviteLink?: string
      }>(page, 'poll')
      return await use(new Poll(page, organisation, pollData))
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    const pollData = await getPlaywrightState<{
      name: string
      slug?: string
      inviteLink?: string
    }>(page, 'poll')
    await use(new Poll(page, organisation, pollData))
    await page.context().close()
  },
})

export { test }
