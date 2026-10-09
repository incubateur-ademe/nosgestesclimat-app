import { env } from '@/env.server'
import logger from '@/logger'
import { Redis } from 'ioredis'

export const redisClientFactory = () =>
  new Redis(env.REDIS_URL, {
    lazyConnect: true,

    // Stricter retries and timeouts to avoid hanging throttled server actions
    maxRetriesPerRequest: 2,
    connectTimeout: 2_500,
    commandTimeout: 2_500,
  }).on('error', (error) => {
    logger.error('Redis error', { error })
  })

export const redis = redisClientFactory()
