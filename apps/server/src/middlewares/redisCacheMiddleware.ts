import type { Request, RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { redis } from '../adapters/redis/client.js'
import { ALIVE_SUFFIX } from '../adapters/redis/constant.js'
import logger from '../logger.js'

export const redisCacheMiddleware =
  <
    ReqParams = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
  >({
    key,
    status = StatusCodes.OK,
  }: {
    key: (req: Request<ReqParams, ResBody, ReqBody, ReqQuery>) => string
    status?: StatusCodes
  }): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> =>
  async (req, res, next) => {
    try {
      const redisKey = key(req)
      const cacheAlive = await redis.exists(`${redisKey}${ALIVE_SUFFIX}`)

      if (cacheAlive) {
        const cache = await redis.get(redisKey)
        if (cache) {
          return res.status(status).json(JSON.parse(cache))
        }
      }
    } catch (error) {
      logger.warn('Could not use redis cache', error)
    }

    return next()
  }
