import { addOrUpdateContactAfterOrganisationChange } from '../adapters/brevo/client.js'
import { prisma } from '../adapters/prisma/client.js'
import { batchFindMany } from '../core/batch-find-many.js'
import {
  getLastPollParticipantsCount,
  getOrganisationSimulationData,
  getPollsCreatedCount,
} from '../features/organisations/organisations.repository.js'
import logger from '../logger.js'

const main = async () => {
  try {
    let processedCount = 0
    let errorCount = 0

    const batchOrganisations = batchFindMany((params) =>
      prisma.organisation.findMany({
        ...params,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          administrators: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  optedInForCommunications: true,
                },
              },
            },
            take: 1,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })
    )

    for await (const organisation of batchOrganisations) {
      const administrator = organisation.administrators[0]?.user
      if (!administrator) {
        logger.warn(
          `No administrator found for organisation ${organisation.id}`
        )
        continue
      }

      const {
        id: organisationId,
        name: organisationName,
        slug,
        type,
      } = organisation
      const {
        email,
        id: userId,
        name: administratorName,
        optedInForCommunications,
      } = administrator

      try {
        const [
          lastPollParticipantsCount,
          pollsCreatedCount,
          {
            organisationSimulationsCompletedCount,
            organisationLastSimulationDate,
          },
        ] = await Promise.all([
          getLastPollParticipantsCount(organisationId, { session: prisma }),
          getPollsCreatedCount(organisationId, { session: prisma }),
          getOrganisationSimulationData(organisationId, { session: prisma }),
        ])

        await addOrUpdateContactAfterOrganisationChange({
          slug,
          email,
          userId,
          organisationName,
          administratorName,
          optedInForCommunications,
          lastPollParticipantsCount,
          type,
          pollsCreatedCount,
          organisationSimulationsCompletedCount,
          organisationLastSimulationDate,
        })

        processedCount++
        logger.info(
          `Synced Brevo contact for organisation ${organisationId} (${organisationName})`
        )
      } catch (error) {
        errorCount++
        logger.error(
          `Failed to sync Brevo contact for organisation ${organisationId}`,
          { error }
        )
      }
    }

    logger.info(
      `Brevo sync completed: ${processedCount} processed, ${errorCount} errors`
    )
    process.exit(errorCount > 0 ? 1 : 0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
