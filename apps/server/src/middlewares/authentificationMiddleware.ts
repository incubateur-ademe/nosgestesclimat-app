import type { RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import {
  COOKIE_NAME,
  getCookieOptions,
  createToken,
} from '../features/authentication/authentication.service.js'
const isValidResult = (
  result?: string | JwtPayload | undefined
): result is JwtPayload & { email: string; userId: string } =>
  typeof result === 'object' && 'email' in result && 'userId' in result

export const authentificationMiddleware =
  <
    ReqParams = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
  >({ passIfUnauthorized }: { passIfUnauthorized?: true } = {}): RequestHandler<
    ReqParams,
    ResBody,
    ReqBody,
    ReqQuery
  > =>
  (req, res, next) => {
    const cookiesHeader = req.headers.cookie

    const token =
      cookiesHeader &&
      cookiesHeader
        .split(';')
        .map((c) => c.trim())
        .find((cookie) => cookie.startsWith(COOKIE_NAME))
        ?.replace(`${COOKIE_NAME}=`, '')

    if (!token) {
      return passIfUnauthorized
        ? next()
        : res.status(StatusCodes.UNAUTHORIZED).end()
    }

    jwt.verify(token, config.security.jwt.secret, (err, result) => {
      if (err || !isValidResult(result)) {
        return passIfUnauthorized
          ? next()
          : res.status(StatusCodes.UNAUTHORIZED).end()
      }

      const { email, userId } = result

      req.user = {
        email,
        userId,
      }

      const newToken = createToken({ email, id: userId })
      const origin = req.get('origin') || config.app.origin
      res.cookie(COOKIE_NAME, newToken, getCookieOptions(origin))

      next()
    })
  }
