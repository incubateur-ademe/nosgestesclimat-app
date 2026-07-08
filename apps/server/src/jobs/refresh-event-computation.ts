import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger from '../logger.ts'

const EVENT_START = new Date('2026-09-18T00:00:00Z')
const EVENT_END = new Date('2026-10-08T23:59:59Z')

const main = async () => {
  const now = new Date()
  if (now < EVENT_START || now > EVENT_END) {
    logger.info('Outside event period, skipping refresh')
    process.exit(0)
  }

  try {
    logger.info('Refreshing event_computation materialized view...')
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
