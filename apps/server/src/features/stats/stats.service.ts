import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorUniqueConstraintFailed } from '@nosgestesclimat/core/prisma/utils'
import { isAxiosError } from 'axios'
import dayjs from 'dayjs'
import { fetchNewsletter } from '../../adapters/brevo/client.ts'
import { ListIds } from '../../adapters/brevo/constant.ts'
import { fetchNorthstarStats as fetchPosthogNorthstarStats } from '../../adapters/posthog/client.ts'
import logger from '../../logger.ts'
import { createNewsLetterStats } from './stats.repository.ts'
import type { NorthstarStatsFetchQuery } from './stats.validator.ts'

export const recoverNewsletterSubscriptions = async (date: string) => {
  try {
    for (const listId of Object.values(ListIds)) {
      try {
        const {
          data: { totalSubscribers },
        } = await fetchNewsletter(listId)

        await createNewsLetterStats(
          {
            listId,
            subscriptions: totalSubscribers,
            date: new Date(`${date}T00:00:00.000Z`),
          },
          { session: prisma }
        )
      } catch (err) {
        if (!isPrismaErrorUniqueConstraintFailed(err)) {
          throw err
        }
        logger.warn(
          `Newsletter ${listId} ${dayjs(date).format('DD/MM/YYYY')} ignored. Value already exists, script is not idempotent`
        )
      }
    }
  } catch (err) {
    logger.error(
      `Newsletter ${dayjs(date).format('DD/MM/YYYY')} import failed`,
      isAxiosError(err)
        ? {
            code: err.code,
            message: err.message,
            stack: err.stack,
            status: err.status,
          }
        : err
    )
  }
}

export const fetchNorthstarStats = async (query: NorthstarStatsFetchQuery) => {
  const { periodicity, since } = query

  const stats = await fetchPosthogNorthstarStats({
    ...(periodicity ? { periodicity } : {}),
    ...(since ? { since } : {}),
  })

  return {
    description: 'Nombre de simulations réalisées',
    stats,
  }
}
