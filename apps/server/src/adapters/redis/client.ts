import { Redis } from 'ioredis'
import { config } from '../../config.js'
import logger from '../../logger.js'

export const redisClientFactory = () =>
  new Redis(config.app.redis.url, {
    lazyConnect: true,
  }).on('error', (err) => {
    logger.error('Redis error', err)
    throw err
  })

export const redis = redisClientFactory()
