import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { prisma } from '../../../../../adapters/prisma/client.ts'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.ts'
import app from '../../../../../app.ts'
import { config } from '../../../../../config.ts'
import { ExternalServiceTypeEnum } from '../../../integrations.validator.ts'
import {
  REFRESH_TOKEN_MAX_AGE,
  REFRESH_TOKEN_SCOPE,
} from '../authentication.service.ts'
import {
  generateApiToken,
  recoverApiToken,
  REFRESH_API_TOKEN_ROUTE,
} from './fixtures/authentication.fixtures.ts'

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = REFRESH_API_TOKEN_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When refreshing his/her API token', () => {
    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.post(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(url)
          .set('authorization', 'Bearer invalid token')
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And expired token', () => {
      let token: string
      let email: string

      beforeEach(async () => {
        ;({ email } = await generateApiToken({
          agent,
          prisma,
        }))
        token = jwt.sign(
          { email, scopes: [ApiScopeName.ngc] },
          config.security.jwt.secret,
          {
            expiresIn: -1,
          }
        )
      })

      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url)
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid refresh token', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url)
            .set('authorization', `Bearer ${token}`)
            .send({ refreshToken: 'invalid token' })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid refresh token scopes', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          const refreshToken = jwt.sign(
            {
              email,
              scopes: [...Object.values(ExternalServiceTypeEnum), 'ngc'],
            },
            config.security.jwt.secret,
            {
              expiresIn: REFRESH_TOKEN_MAX_AGE,
            }
          )

          await agent
            .post(url)
            .set('authorization', `Bearer ${token}`)
            .send({ refreshToken })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And expired refresh token', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          const refreshToken = jwt.sign(
            {
              email,
              scopes: [REFRESH_TOKEN_SCOPE],
            },
            config.security.jwt.secret,
            {
              expiresIn: -1,
            }
          )

          await agent
            .post(url)
            .set('authorization', `Bearer ${token}`)
            .send({ refreshToken })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And valid refresh token', () => {
        test(`Then it returns a ${StatusCodes.OK} response with tokens`, async () => {
          const refreshToken = jwt.sign(
            {
              email,
              scopes: [REFRESH_TOKEN_SCOPE],
            },
            config.security.jwt.secret,
            {
              expiresIn: REFRESH_TOKEN_MAX_AGE,
            }
          )

          const {
            body: { token: newToken, refreshToken: newRefreshToken },
          } = await agent
            .post(url)
            .set('authorization', `Bearer ${token}`)
            .send({ refreshToken })
            .expect(StatusCodes.OK)

          expect(jwt.decode(newToken)).toEqual({
            scopes: [ApiScopeName.ngc],
            email,
            exp: expect.any(Number),
            iat: expect.any(Number),
          })

          expect(jwt.decode(newRefreshToken)).toEqual({
            scopes: ['refresh-token'],
            email,
            exp: expect.any(Number),
            iat: expect.any(Number),
          })
        })
      })
    })

    describe('And non expired token', () => {
      let token: string
      let email: string
      let refreshToken: string

      beforeEach(async () => {
        ;({ email, token, refreshToken } = await recoverApiToken({
          agent,
          prisma,
          apiScope: {
            name: ApiScopeName.ngc,
          },
        }))
      })

      test(`Then it returns a ${StatusCodes.OK} response with tokens`, async () => {
        const {
          body: { token: newToken, refreshToken: newRefreshToken },
        } = await agent
          .post(url)
          .set('authorization', `Bearer ${token}`)
          .send({ refreshToken })
          .expect(StatusCodes.OK)

        expect(jwt.decode(newToken)).toEqual({
          scopes: [ApiScopeName.ngc],
          email,
          exp: expect.any(Number),
          iat: expect.any(Number),
        })

        expect(jwt.decode(newRefreshToken)).toEqual({
          scopes: ['refresh-token'],
          email,
          exp: expect.any(Number),
          iat: expect.any(Number),
        })
      })
    })
  })
})
