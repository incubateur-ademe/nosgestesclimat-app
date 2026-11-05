import { ORGANISATION_ADMIN_STATE } from '../state'
import { restoreFromState, restorePoll, type RestoredPoll } from './context'
import { test as base } from './organisation'

const SCOLAIRE_POLL_STATE_KEY = 'poll-scolaire'

/**
 * Fixture that provides the scolaire-mode poll created during global setup.
 */
interface ScolairePollFixtures {
  scolairePoll: RestoredPoll
}

const test = base.extend<ScolairePollFixtures>({
  scolairePoll: async ({ browser, organisation, page, storageState }, use) => {
    await use(
      storageState === ORGANISATION_ADMIN_STATE
        ? await restorePoll(page, organisation, SCOLAIRE_POLL_STATE_KEY)
        : await restoreFromState(
            browser,
            ORGANISATION_ADMIN_STATE,
            (adminPage) =>
              restorePoll(adminPage, organisation, SCOLAIRE_POLL_STATE_KEY)
          )
    )
  },
})

export { test }
