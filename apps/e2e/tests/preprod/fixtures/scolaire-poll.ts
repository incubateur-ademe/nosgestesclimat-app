import type { Poll } from '../../page-objects/poll'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { restorePoll } from './context'
import { test as base } from './organisation'

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
      return await use(
        await restorePoll(page, organisation, SCOLAIRE_POLL_STATE_KEY)
      )
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await restorePoll(page, organisation, SCOLAIRE_POLL_STATE_KEY))
    await page.context().close()
  },
})

export { test }
