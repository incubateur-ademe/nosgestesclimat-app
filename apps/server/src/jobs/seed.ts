import { seedDemoData } from '@nosgestesclimat/core/seeds/seed-demo-data.service'
import logger from '../logger.ts'

const main = async () => {
  try {
    const { accounts, organisations, polls } = await seedDemoData({
      report: (message) => logger.info(message),
    })

    logger.info(
      `Demo data seeded: ${accounts} account(s), ` +
        `${organisations} organisation(s), ${polls.length} poll(s)`
    )
    process.exit(0)
  } catch (e) {
    logger.error('Failed to seed demo data', e)
    process.exit(1)
  }
}

main()
