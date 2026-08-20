import { refreshEventComputation } from '@nosgestesclimat/core/features/events/repositories/event.repository'
import { ensureSeddEvent } from '@nosgestesclimat/core/features/events/services/ensure-sedd-event.service'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger from '../logger.ts'

const main = async () => {
  // Ensure the default SEDD event exists so /evenement/sedd always has a row
  // to read from, in every environment. Idempotent, so it is safe to run on
  // every cron tick.
  await ensureSeddEvent()

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
    await prisma.$disconnect()
    process.exit(0)
  }

  try {
    logger.info(
      `Refreshing event_computation materialized view for event "${activeEvent.name}"...`
    )
    await refreshEventComputation()
    logger.info('Materialized view refreshed successfully')
    process.exit(0)
  } catch (e) {
    logger.error('Failed to refresh materialized view', e)
    process.exit(1)
  }
}

main()
