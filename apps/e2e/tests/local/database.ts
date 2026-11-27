import { prisma } from '@nosgestesclimat/core/prisma/client'
import { emptyDatabase } from '@nosgestesclimat/core/test-utils/empty-database'
import { test as base } from '@playwright/test'
import { requestStackRestart } from '../../stack/control.ts'

/**
 * Empties the worker's database (ngc_e2e_<i>, see
 * stack/playwright-worker-env.ts), and nothing else: before deleting anything,
 * it checks the connection does point at it, so that an environment loaded in
 * the wrong order fails here instead of wiping a developer's own database.
 */
export async function resetDatabase() {
  const expected = `ngc_e2e_${process.env.TEST_PARALLEL_INDEX}`
  const [{ current_database }] = await prisma.$queryRaw<
    [{ current_database: string }]
  >`SELECT current_database()`

  if (current_database !== expected) {
    throw new Error(
      `Refusing to empty database "${current_database}": this worker's database is "${expected}".`
    )
  }

  await emptyDatabase(prisma)
  // The app holds cached reads of the deleted data in memory: only a fresh
  // process forgets them.
  await requestStackRestart()
}

interface DatabaseFixtures {
  /**
   * Empty the database before the test (default). Describes that seed once in
   * `beforeAll` turn it off, and call `resetDatabase()` there instead.
   */
  resetDatabase: boolean
  databaseReset: void
}

/**
 * Each test starts on an empty database and a restarted stack, and seeds
 * everything it needs. Safe with `fullyParallel`: a worker runs one test at a
 * time, and its database is used by no other worker.
 */
export const test = base.extend<DatabaseFixtures>({
  resetDatabase: [true, { option: true }],
  databaseReset: [
    async ({ resetDatabase: reset }, use) => {
      if (reset) await resetDatabase()
      await use()
    },
    { auto: true },
  ],
})
