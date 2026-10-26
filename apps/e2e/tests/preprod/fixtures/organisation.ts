import { Organisation } from '../../pages/organisation'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { restoreOrganisation } from './context'
import { test as base, expect } from './user'

export { Organisation } from '../../pages/organisation'

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
      return await use(await restoreOrganisation(page))
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await restoreOrganisation(page))
    await page.context().close()
  },
})

export { expect, test }
