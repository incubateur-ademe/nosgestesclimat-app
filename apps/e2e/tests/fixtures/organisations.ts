import { getPlaywrightState } from '../helpers/save-context'
import { Organisation } from '../pages/organisation'
import { User } from '../pages/user'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { test as base, expect } from './user'

export { Organisation } from '../pages/organisation'

interface OrganisationPageFixtures {
  organisation: Organisation
}

const test = base.extend<OrganisationPageFixtures>({
  organisation: async ({ browser, user, setup, page, storageState }, use) => {
    if (setup) {
      return await use(new Organisation(page, user))
    }

    const useCurrentContext = storageState === ORGANISATION_ADMIN_STATE
    if (useCurrentContext) {
      const orgData = await getPlaywrightState<{
        name: string
        slug?: string
      }>(page, 'organisation')
      const userData = await getPlaywrightState<{
        firstName: string
        lastName: string
        email: string
      }>(page, 'user')
      return await use(
        new Organisation(page, new User(page, userData), orgData)
      )
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    const orgData = await getPlaywrightState<{
      name: string
      slug?: string
    }>(page, 'organisation')
    const userData = await getPlaywrightState<{
      firstName: string
      lastName: string
      email: string
    }>(page, 'user')
    await use(new Organisation(page, new User(page, userData), orgData))
    await page.context().close()
  },
})

export { expect, test }
