import crypto from 'crypto'
import type { Request, RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { redis } from '../adapters/redis/client.js'
import { KEYS } from '../adapters/redis/constant.js'
import logger from '../logger.js'

export const rateLimitSameRequestMiddleware =
  <
    ReqParams = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
  >({
    hashRequest = ({ method, url, requestParams }) =>
      `${method}_${url}_${requestParams}`,
    ttlInSeconds = 2,
  }: {
    hashRequest?: (req: Request) => string | undefined
    ttlInSeconds?: number
  } = {}): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> =>
  async (req, res, next) => {
    try {
      const hash = hashRequest(req as Request)

      if (!hash) {
        return next()
      }

      const requestHash = crypto.createHash('sha256').update(hash).digest('hex')

      const redisKey = `${KEYS.rateLimitSameRequests}_${requestHash}`

      const currentRequest = await redis.get(redisKey)

      if (currentRequest) {
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          message: 'Too many requests',
        } as ResBody)
      }

      await redis.set(redisKey, requestHash)
      await redis.expire(redisKey, ttlInSeconds)
    } catch (error) {
      logger.warn('Could not rate limit same requests', error)
    }

    return next()
  }
