import { ORGANISATION_ADMIN_STATE } from '../state'
import { test as base } from './organisations'
import { Poll } from './polls'

const SCOLAIRE_POLL_STATE_KEY = 'poll-scolaire'

/**
 * Fixture that provides the scolaire-mode poll created during global setup.
 */
interface ScolairePollFixtures {
  scolairePoll: Poll
}

const test = base.extend<ScolairePollFixtures>({
  scolairePoll: async ({ browser, organisation, page, storageState }, use) => {
    const useCurrentContext = storageState === ORGANISATION_ADMIN_STATE
    if (useCurrentContext) {
      return use(
        await Poll.fromContext(page, organisation, SCOLAIRE_POLL_STATE_KEY)
      )
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(
      await Poll.fromContext(page, organisation, SCOLAIRE_POLL_STATE_KEY)
    )
    await page.context().close()
  },
})

export { test }
