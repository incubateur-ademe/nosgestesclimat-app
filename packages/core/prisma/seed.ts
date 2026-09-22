import { prisma } from '../src/prisma/client.ts'
import { seedDemoData } from '../src/seeds/seed-demo-data.service.ts'

/**
 * Seeds a local database with the demo dataset.
 *
 * The dataset itself is described by the feature seeds and composed by
 * `seedDemoData`; this entry point only reports progress and closes the
 * connection. Every line carries the elapsed time, so a run that spends most of
 * its time evaluating the model says so.
 */
const startedAt = Date.now()

const report = (message: string) => {
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`[seed +${elapsed}s] ${message}`)
}

seedDemoData({ report })
  .then(async ({ accounts, organisations, polls }) => {
    report(
      `Done: ${accounts} account(s), ${organisations} organisation(s), ` +
        `${polls.length} poll(s)`
    )

    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
