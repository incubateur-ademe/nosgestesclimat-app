import type { Request, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../adapters/prisma/client.js'
import { ApiScopeName } from '../../../../adapters/prisma/generated.js'
import { transaction } from '../../../../adapters/prisma/transaction.js'
import { config } from '../../../../config.js'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import { UnauthorizedException } from '../../../../core/errors/UnauthorizedException.js'
import { Locales } from '../../../../core/i18n/constant.js'
import { isPrismaErrorNotFound } from '../../../../core/typeguards/isPrismaError.js'
import { findVerificationCode } from '../../../authentication/verification-codes.repository.js'
import { createVerificationCode } from '../../../authentication/verification-codes.service.js'
import { fetchWhitelists } from '../email-whitelist/email-whitelist.repository.js'
import type {
  GenerateAPITokenRequestDto,
  RecoverApiTokenQuery,
} from './authentication.contract.js'

const { TokenExpiredError } = jwt

export const TOKEN_MAX_AGE = 1000 * 60 * 15 // 15 minutes

export const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 61 // 2 months

export const REFRESH_TOKEN_SCOPE = 'refresh-token' as const

export const generateAuthenticationMiddleware =
  ({ passIfExpired }: { passIfExpired?: true } = {}): RequestHandler =>
  (req, res, next) => {
    const [, token] = (req.get('authorization') || '').split(' ')

    jwt.verify(token, config.security.jwt.secret, (err, parsedToken) => {
      try {
        const shouldPassIfExpired =
          !!passIfExpired && err instanceof TokenExpiredError
        const user = parsedToken || jwt.decode(token)

        if (!isValidParsedToken(user) || (err && !shouldPassIfExpired)) {
          throw new UnauthorizedException()
        }

        const userScopes = new Set(user.scopes)

        req.apiUser = {
          scopes: userScopes.has(ApiScopeName.ngc)
            ? new Set(Object.values(ApiScopeName))
            : userScopes,
          email: user.email,
        }

        return next()
      } catch (err) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            err instanceof UnauthorizedException ? err.message : 'Unauthorized'
          )
          .end()
      }
    })
  }

export const isValidParsedToken = (
  parsedToken?: string | JwtPayload | null
): parsedToken is JwtPayload & { email: string; scopes: string[] } =>
  typeof parsedToken === 'object' &&
  !!parsedToken &&
  'email' in parsedToken &&
  'scopes' in parsedToken &&
  Array.isArray(parsedToken.scopes) &&
  parsedToken.scopes.every((scope) => typeof scope === 'string')

const isValidParsedRefreshToken = (
  parsedToken?: string | JwtPayload | null
): parsedToken is JwtPayload & { email: string; scopes: string[] } =>
  isValidParsedToken(parsedToken) &&
  new Set(parsedToken.scopes).has(REFRESH_TOKEN_SCOPE)

export const isValidRefreshToken = async (refreshToken: string) => {
  return new Promise((res) => {
    jwt.verify(refreshToken, config.security.jwt.secret, (err, parsedToken) =>
      err || !isValidParsedRefreshToken(parsedToken) ? res(false) : res(true)
    )
  })
}

const signTokens = async (email: string) => {
  const emailWhitelist = await transaction(
    (session) => fetchWhitelists({ emailPattern: email }, { session }),
    prisma
  )

  const scopes = new Set(emailWhitelist.map(({ apiScopeName }) => apiScopeName))

  return {
    token: jwt.sign(
      { email, scopes: Array.from(scopes) },
      config.security.jwt.secret,
      {
        expiresIn: TOKEN_MAX_AGE,
      }
    ),
    refreshToken: jwt.sign(
      { email, scopes: [REFRESH_TOKEN_SCOPE] },
      config.security.jwt.secret,
      {
        expiresIn: REFRESH_TOKEN_MAX_AGE,
      }
    ),
  }
}

export const generateApiToken = async ({
  generateApiTokenDto: { email },
  origin,
}: {
  generateApiTokenDto: GenerateAPITokenRequestDto
  origin: string
}) => {
  await transaction(async (session) => {
    const emailWhitelist = await fetchWhitelists(
      { emailPattern: email },
      { session }
    )

    if (emailWhitelist.length) {
      await createVerificationCode(
        {
          verificationCodeDto: {
            email,
          },
          locale: Locales.fr,
          origin,
        },
        { session }
      )
    }
  })
}

export const exchangeCredentialsForToken = async (
  query: RecoverApiTokenQuery
) => {
  try {
    const { email } = await transaction(
      (session) => findVerificationCode(query, { session }),
      prisma
    )

    return signTokens(email)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('VerificationCode not found')
    }
    throw e
  }
}

export const refreshApiToken = ({
  apiUser,
}: {
  apiUser: NonNullable<Request['apiUser']>
}) => {
  return signTokens(apiUser.email)
}
