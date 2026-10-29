import { faker } from '@faker-js/faker'
import { test as base } from '@playwright/test'

/**
 * Seeds faker before each test and reports the seed, so that a failure caused
 * by generated data (a name too long, an email already taken…) can be replayed
 * with the same data: `FAKER_SEED=<seed> pnpm -F @nosgestesclimat/e2e test:e2e`.
 *
 * The seed is attached to the test as an annotation (HTML report) and logged
 * when the test fails. The core factories share the suite's faker instance, so
 * the data they seed is covered too.
 */
const test = base.extend<{ fakerSeed: number }>({
  fakerSeed: [
    async ({}, use, testInfo) => {
      const seed = faker.seed(
        process.env.FAKER_SEED ? Number(process.env.FAKER_SEED) : undefined
      )
      testInfo.annotations.push({ type: 'faker seed', description: `${seed}` })

      await use(seed)

      if (testInfo.status !== testInfo.expectedStatus) {
        console.warn(`Faker seed: ${seed} (replay with FAKER_SEED=${seed})`)
      }
    },
    { auto: true },
  ],
})

export { test }
