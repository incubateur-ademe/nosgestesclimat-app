import type { JsonObject, JsonValue } from '@prisma/client/runtime/client'
import { prisma } from '../src/adapters/prisma/client.js'
import { batchFindMany } from '../src/core/batch-find-many.js'
import logger from '../src/logger.js'

const hasPreciseChoice = (situation: JsonValue): situation is JsonObject =>
  !!situation &&
  typeof situation === 'object' &&
  !Array.isArray(situation) &&
  !!Object.keys(situation).find(
    (key) =>
      key.startsWith('divers . textile . ') &&
      key.endsWith(' . nombre') &&
      typeof situation[key] === 'number'
  )

const main = async () => {
  try {
    const batchSimulations = batchFindMany((params) =>
      prisma.simulation.findMany({
        ...params,
        select: {
          id: true,
          situation: true,
        },
      })
    )

    let updatedSimulations = 0

    for await (const { id, situation } of batchSimulations) {
      if (hasPreciseChoice(situation)) {
        await prisma.simulation.update({
          where: {
            id,
          },
          data: {
            situation: {
              ...situation,
              'divers . textile . choix précis': 'oui',
            },
          },
        })

        updatedSimulations++

        if (updatedSimulations % 1000 === 0) {
          logger.info('Updated simulations', { updatedSimulations })
        }
      }
    }

    logger.info('Updated simulations', { updatedSimulations })
    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
