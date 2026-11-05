import { test as base, expect } from '@playwright/test'
import { ORGANISATION_ADMIN_STATE } from '../state'
import {
  restoreFromState,
  restoreOrganisation,
  type RestoredOrganisation,
} from './context'

interface OrganisationFixtures {
  organisation: RestoredOrganisation
}

const test = base.extend<OrganisationFixtures>({
  organisation: async ({ browser, page, storageState }, use) => {
    await use(
      storageState === ORGANISATION_ADMIN_STATE
        ? await restoreOrganisation(page)
        : await restoreFromState(
            browser,
            ORGANISATION_ADMIN_STATE,
            restoreOrganisation
          )
    )
  },
})

export { expect, test }
