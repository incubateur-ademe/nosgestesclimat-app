import { prisma } from '@nosgestesclimat/core/prisma/client'
import { batchFindMany } from '../core/batch-find-many.ts'
import { updatePollStats } from '../features/organisations/organisations.service.ts'
import logger from '../logger.ts'

const main = async () => {
  try {
    const batchPolls = batchFindMany((params) =>
      prisma.poll.findMany({
        ...params,
        where: {
          computeRealTimeStats: false,
        },
        select: {
          id: true,
        },
      })
    )

    for await (const poll of batchPolls) {
      logger.info(`Update poll ${poll.id}`)
      await updatePollStats({ pollId: poll.id }, { session: prisma })
    }

    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
