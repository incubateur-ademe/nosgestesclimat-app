import { prisma } from '../src/adapters/prisma/client.js'
import { batchFindMany } from '../src/core/batch-find-many.js'
import { updatePollStats } from '../src/features/organisations/organisations.service.js'
import logger from '../src/logger.js'

const main = async () => {
  try {
    const batchPolls = batchFindMany((params) =>
      prisma.poll.findMany({
        ...params,
        select: {
          id: true,
        },
      })
    )

    let updatedPolls = 0

    for await (const poll of batchPolls) {
      await updatePollStats({ pollId: poll.id }, { session: prisma })

      updatedPolls++

      if (updatedPolls % 100 === 0) {
        logger.info('Updated polls', { updatedPolls })
      }
    }

    logger.info('Updated polls', { updatedPolls })
    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
