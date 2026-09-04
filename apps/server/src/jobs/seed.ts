import { seedDemoData } from '@nosgestesclimat/core/features/seed/services/seed-demo-data.service'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { updatePollStats } from '../features/organisations/organisations.service.ts'
import logger from '../logger.ts'

const main = async () => {
  try {
    const pollIds = await seedDemoData()

    // Compute the seeded polls' funFacts & computedResults now that their
    // simulations exist, so the organisation/poll pages render real stats
    for (const pollId of pollIds) {
      logger.info(`Compute stats for poll ${pollId}`)
      await updatePollStats({ pollId }, { session: prisma })
    }

    logger.info(`Demo data seeded, stats computed for ${pollIds.length} polls`)
    process.exit(0)
  } catch (e) {
    logger.error('Failed to seed demo data', e)
    process.exit(1)
  }
}

main()
