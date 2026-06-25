import type { RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { config } from '../config.ts'

export const authentificationMiddleware =
  <
    ReqParams = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
  >({
    passIfUnauthorized,
  }: {
    /** Should only be used for endpoints that accept both unauthenticated requests but have a different behavior when authenticated (e.g. checks if `req.user` exists) */
    passIfUnauthorized?: true
  } = {}): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    const unauthorized = () =>
      passIfUnauthorized ? next() : res.status(StatusCodes.UNAUTHORIZED).end()

    const providedInternalKey = req.headers['x-internal-key']

    if (providedInternalKey !== config.security.internalApiKey) {
      return unauthorized()
    }

    const id = req.headers['x-user-id']
    const email = req.headers['x-user-email']

    if (typeof id !== 'string') {
      return unauthorized()
    }

    req.user = typeof email === 'string' ? { id, email } : { id }

    return next()
  }
