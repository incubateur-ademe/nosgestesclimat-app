import { cleanupExpiredTokens } from '@nosgestesclimat/core/features/auth/services/cleanup-expired-tokens.service.ts'
import logger from '../logger.ts'

const main = async () => {
  try {
    await cleanupExpiredTokens()
    logger.info('Cleaned up expired refresh tokens')
    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
