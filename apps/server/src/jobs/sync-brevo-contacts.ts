import { addOrUpdateContactAfterOrganisationChange } from '../adapters/brevo/client.js'
import { prisma } from '../adapters/prisma/client.js'
import type { Session } from '../adapters/prisma/transaction.js'
import { batchFindMany } from '../core/batch-find-many.js'
import { getOrganisationsBatchBrevoStats } from '../features/organisations/organisations.repository.js'
import logger from '../logger.js'

interface SyncResult {
  processedCount: number
  errorCount: number
}

export const syncOrganisationToBrevo = async (
  organisation: {
    id: string
    name: string
    slug: string
    type?: string
    administrators: Array<{
      user: {
        id: string
        name: string | null
        email: string
        optedInForCommunications: boolean
      }
    }>
  },
  stats:
    | {
        lastPollParticipantsCount: number
        pollsCreatedCount: number
        organisationSimulationsCompletedCount: number
        organisationLastSimulationDate: Date | null
      }
    | undefined
): Promise<void> => {
  const administrator = organisation.administrators[0]?.user
  if (!administrator) {
    logger.warn(`No administrator found for organisation ${organisation.id}`)
    return
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

  await addOrUpdateContactAfterOrganisationChange({
    slug,
    email,
    userId,
    organisationName,
    administratorName,
    optedInForCommunications,
    type,
    lastPollParticipantsCount: stats?.lastPollParticipantsCount,
    pollsCreatedCount: stats?.pollsCreatedCount,
    organisationSimulationsCompletedCount:
      stats?.organisationSimulationsCompletedCount,
    organisationLastSimulationDate:
      stats?.organisationLastSimulationDate ?? undefined,
  })

  logger.info(
    `Synced Brevo contact for organisation ${organisationId} (${organisationName})`
  )
}

export const runSync = async ({
  session,
}: {
  session: Session
}): Promise<SyncResult> => {
  let processedCount = 0
  let errorCount = 0

  // Batch-load all organisation stats in a single query
  const allStats = await getOrganisationsBatchBrevoStats({ session })
  const statsByOrganisationId = new Map(
    allStats.map((stats) => [stats.organisationId, stats])
  )

  const batchOrganisations = batchFindMany((params) =>
    session.organisation.findMany({
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
    const stats = statsByOrganisationId.get(organisation.id)

    try {
      await syncOrganisationToBrevo(organisation, stats)
      processedCount++
    } catch (error) {
      errorCount++
      logger.error(
        `Failed to sync Brevo contact for organisation ${organisation.id}`,
        { error }
      )
    }
  }

  return { processedCount, errorCount }
}

const main = async () => {
  try {
    const { processedCount, errorCount } = await runSync({ session: prisma })

    logger.info(
      `Brevo sync completed: ${processedCount} processed, ${errorCount} errors`
    )
    process.exit(errorCount > 0 ? 1 : 0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

// Only run when executed directly, not when imported (required for the tests)
const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main()
}
