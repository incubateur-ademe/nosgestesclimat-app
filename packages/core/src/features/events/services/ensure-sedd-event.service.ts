import { prisma } from '../../../prisma/client.ts'
import { SEDD_EVENT } from '../constants/sedd-event.ts'

/**
 * Idempotently ensures the default SEDD event exists, creating it when absent
 * and backfilling the slug on an event created by an earlier seed version.
 *
 * Used by the seed, the server review-app postdeploy and the refresh cron so
 * the /evenement/sedd page always has a row to read from.
 */
export const ensureSeddEvent = async () => {
  const existing = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: SEDD_EVENT.slug },
        { name: SEDD_EVENT.name, startDate: SEDD_EVENT.startDate },
      ],
    },
  })

  if (!existing) {
    return prisma.event.create({ data: { ...SEDD_EVENT } })
  }

  if (existing.slug !== SEDD_EVENT.slug) {
    return prisma.event.update({
      where: { id: existing.id },
      data: { slug: SEDD_EVENT.slug },
    })
  }

  return existing
}
