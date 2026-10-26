import { getPlaywrightState } from '../helpers/save-context'
import { Poll } from '../pages/poll'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { test as base } from './organisations'

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
      const pollData = await getPlaywrightState<{
        name: string
        slug?: string
        inviteLink?: string
      }>(page, SCOLAIRE_POLL_STATE_KEY)
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
    }>(page, SCOLAIRE_POLL_STATE_KEY)
    await use(new Poll(page, organisation, pollData))
    await page.context().close()
  },
})

export { test }
