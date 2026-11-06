import { actionFactory } from '@nosgestesclimat/core/features/actions/factories/action.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import {
  seedActionsCatalogue,
  seedAssessedSimulation,
  type CatalogueActionKey,
  type SeededActionsCatalogue,
} from '../helpers/actions'
import { signIn } from '../helpers/session'
import { test as base } from './fixtures'

export { expect } from './fixtures'

interface AssessedUserOptions {
  /** A user with an account, rather than an anonymous visitor (the default). */
  verified?: boolean
  /** The actions of the user's plan: none by default. */
  plan?: readonly CatalogueActionKey[]
}

/**
 * Local fixtures for the action specs: the action catalogue (CATALOGUE_ACTIONS)
 * is seeded in the e2e database before each test.
 */
export const test = base.extend<{
  /** The seeded action catalogue, keyed as CATALOGUE_ACTIONS. */
  catalogue: SeededActionsCatalogue
  /**
   * Signs the browser in as a new user owning a simulation assessed with
   * SEEDED_ASSESSMENTS, without going through the test nor the verification
   * code flow. An anonymous visitor gets the session the site issues to anyone
   * taking the test (no email). Returns the user.
   */
  signInAssessedUser: (
    options?: AssessedUserOptions
  ) => Promise<{ id: string; email: string | null }>
}>({
  catalogue: [
    async ({}, use) => {
      await use(await seedActionsCatalogue())
    },
    { auto: true },
  ],
  signInAssessedUser: async ({ context, catalogue }, use) => {
    await use(async ({ verified = false, plan = [] } = {}) => {
      const user = verified
        ? await userFactory.verified().create()
        : await userFactory.unverified().create()

      await seedAssessedSimulation(catalogue, user.id)
      await Promise.all(
        plan.map((key) =>
          actionFactory.chosen({
            userId: user.id,
            actionId: catalogue[key].id,
          })
        )
      )

      await signIn(context, user)
      return user
    })
  },
})
