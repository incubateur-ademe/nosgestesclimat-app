import { ORGANISATION_ADMIN_STATE } from '../state'
import { restoreFromState, restorePoll, type RestoredPoll } from './context'
import { test as base } from './organisation'

interface PollFixtures {
  poll: RestoredPoll
}

const test = base.extend<PollFixtures>({
  poll: async ({ browser, organisation, page, storageState }, use) => {
    await use(
      storageState === ORGANISATION_ADMIN_STATE
        ? await restorePoll(page, organisation)
        : await restoreFromState(
            browser,
            ORGANISATION_ADMIN_STATE,
            (adminPage) => restorePoll(adminPage, organisation)
          )
    )
  },
})

export { test }
