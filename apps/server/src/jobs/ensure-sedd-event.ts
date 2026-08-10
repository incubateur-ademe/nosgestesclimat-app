import { ensureSeddEvent } from '@nosgestesclimat/core/features/events/services/ensure-sedd-event.service'
import logger from '../logger.ts'

const main = async () => {
  try {
    const event = await ensureSeddEvent()
    logger.info(`SEDD event ensured (${event.id})`)
    process.exit(0)
  } catch (e) {
    logger.error('Failed to ensure SEDD event', e)
    process.exit(1)
  }
}

main()
