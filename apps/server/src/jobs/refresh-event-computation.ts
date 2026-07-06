import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger from '../logger.ts'

const main = async () => {
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
