import { prisma } from '../adapters/prisma/client.js'
import { batchFindMany } from '../core/batch-find-many.js'
import { updatePollStats } from '../features/organisations/organisations.service.js'
import logger from '../logger.js'

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
