import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger from '../logger.ts'

const main = async () => {
  const now = new Date()

  // The event period is stored on the Event row (seeded SEDD 2026 event), so
  // the refresh only runs while at least one event is active.
  const activeEvent = await prisma.event.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: { id: true, name: true },
  })

  if (!activeEvent) {
    logger.info('Outside event period, skipping refresh')
    process.exit(0)
  }

  try {
    logger.info(
      `Refreshing event_computation materialized view for event "${activeEvent.name}"...`
    )
    await prisma.$executeRawUnsafe(
      'REFRESH MATERIALIZED VIEW "ngc"."event_computation"'
    )
    logger.info('Materialized view refreshed successfully')
    process.exit(0)
  } catch (e) {
    logger.error('Failed to refresh materialized view', e)
    process.exit(1)
  }
}

main()
