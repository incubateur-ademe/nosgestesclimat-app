import {
  seedActionsCatalogue,
  type SeededActionsCatalogue,
} from '../helpers/actions'
import { ActionDetail } from '../page-objects/action-detail'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'
import { test as base } from './fixtures'

export { expect } from './fixtures'

/**
 * Local fixtures for the action specs: the action catalogue (CATALOGUE_ACTIONS)
 * is seeded in the e2e database before each test.
 */
export const test = base.extend<{
  actionsCatalogue: ActionsCatalogue
  actionDetail: ActionDetail
  /** The seeded action catalogue, keyed as CATALOGUE_ACTIONS. */
  catalogue: SeededActionsCatalogue
}>({
  actionsCatalogue: async ({ page }, use) => {
    await use(new ActionsCatalogue(page))
  },
  actionDetail: async ({ page }, use) => {
    await use(new ActionDetail(page))
  },
  catalogue: [
    async ({}, use) => {
      await use(await seedActionsCatalogue())
    },
    { auto: true },
  ],
})
