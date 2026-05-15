import { prisma } from '@nosgestesclimat/core/prisma/client'
import { addOrUpdateContact } from '../adapters/brevo/client.js'
import { Attributes } from '../adapters/brevo/constant.js'
import type { Session } from '../adapters/prisma/transaction.js'
import {
  getOrganisationsBatchBrevoStats,
  type OrganisationsBatchBrevoStats,
} from '../features/organisations/organisations.repository.js'
import logger from '../logger.js'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 300

interface SyncResult {
  processedCount: number
  errorCount: number
}

export const syncOrganisationToBrevo = async (
  stats: OrganisationsBatchBrevoStats
): Promise<void> => {
  const {
    organisationId,
    organisationType,
    administratorEmail,
    lastPollParticipantsCount,
    pollsCreatedCount,
    organisationSimulationsCompletedCount,
    organisationLastSimulationDate,
  } = stats

  if (!administratorEmail) {
    logger.warn(`No administrator found for organisation ${organisationId}`)
    return
  }

  const attributes = {
    [Attributes.ORGANISATION_TYPE]: organisationType,
    ...(lastPollParticipantsCount != null
      ? {
          [Attributes.LAST_POLL_PARTICIPANTS_NUMBER]: lastPollParticipantsCount,
        }
      : {}),
    ...(pollsCreatedCount != null
      ? {
          [Attributes.NUMBER_ORGANISATION_CREATED_POLLS]: pollsCreatedCount,
        }
      : {}),
    ...(organisationSimulationsCompletedCount != null
      ? {
          [Attributes.NUMBER_ORGANISATION_COMPLETED_SIMULATIONS]:
            organisationSimulationsCompletedCount,
        }
      : {}),
    ...(organisationLastSimulationDate != null
      ? {
          [Attributes.LAST_ORGANISATION_SIMULATION_DATE]:
            organisationLastSimulationDate.toISOString().slice(0, 10),
        }
      : {}),
  }

  await addOrUpdateContact({
    email: administratorEmail,
    attributes,
  })

  logger.info(`Synced Brevo contact for organisation ${organisationId}`)
}

export const runSync = async ({
  session,
}: {
  session: Session
}): Promise<SyncResult> => {
  let processedCount = 0
  let errorCount = 0

  const allStats = await getOrganisationsBatchBrevoStats({ session })

  for (const stats of allStats) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await syncOrganisationToBrevo(stats)
        processedCount++
        break
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          errorCount++
          logger.error(
            `Failed to sync Brevo contact for organisation ${stats.organisationId}`,
            { error }
          )
        } else {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
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
