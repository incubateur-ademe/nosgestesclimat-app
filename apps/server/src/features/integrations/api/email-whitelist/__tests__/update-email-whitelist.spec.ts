import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.js'
import { prisma } from '../../../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../../../adapters/prisma/transaction.js'
import app from '../../../../../app.js'
import { config } from '../../../../../config.js'
import logger from '../../../../../logger.js'
import {
  randomApiScopeName,
  recoverApiToken,
} from '../../authentication/__tests__/fixtures/authentication.fixtures.js'
import {
  createEmailWhitelist,
  UPDATE_EMAIL_WHITELIST_ROUTE,
} from './fixtures/email-whitelist.fixture.js'

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = UPDATE_EMAIL_WHITELIST_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When updating an Email Whitelist', () => {
    describe('And not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.put(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(url)
          .set('authorization', 'Bearer invalid token')
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And expired token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        const token = jwt.sign(
          { email: faker.internet.email(), scopes: [ApiScopeName.ngc] },
          config.security.jwt.secret,
          {
            expiresIn: -1,
          }
        )

        await agent
          .put(url)
          .set('authorization', `Bearer ${token}`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe.each(
      Object.values(ApiScopeName)
        .filter((scopeName) => scopeName != ApiScopeName.ngc)
        .map((scope) => ({ scope }))
    )('And valid $scope token', ({ scope }) => {
      let whitelist: Awaited<ReturnType<typeof createEmailWhitelist>>
      let token: string

      beforeEach(async () => {
        ;({ token } = await recoverApiToken({
          apiScope: { name: scope },
          prisma,
          agent,
        }))
      })

      describe.each(
        Object.values(ApiScopeName)
          .filter((scopeName) => scopeName != scope)
          .map((forbiddenScope) => ({ forbiddenScope }))
      )('And whitelist has $forbiddenScope scope', ({ forbiddenScope }) => {
        beforeEach(async () => {
          const { token: ngcToken } = await recoverApiToken({
            prisma,
            agent,
          })
          whitelist = await createEmailWhitelist({
            agent,
            prisma,
            token: ngcToken,
            emailWhitelist: {
              scope: forbiddenScope,
            },
          })
        })

        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .put(url.replace(':whitelistId', whitelist.id))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe(`And whitelist has ${scope} scope`, () => {
        beforeEach(async () => {
          whitelist = await createEmailWhitelist({
            agent,
            token,
            prisma,
            emailWhitelist: {
              scope,
            },
          })
        })

        test(`Then it return a ${StatusCodes.OK} response`, async () => {
          const { body } = await agent
            .put(url.replace(':whitelistId', whitelist.id))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.OK)

          expect(body).toEqual(whitelist)
        })
      })
    })

    describe(`And valid ${ApiScopeName.ngc} token`, () => {
      let token: string

      beforeEach(async () => {
        ;({ token } = await recoverApiToken({
          prisma,
          agent,
        }))
      })

      describe('And invalid whitelistId', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(url.replace(':whitelistId', faker.string.alpha(34)))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid email pattern', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(url.replace(':whitelistId', faker.string.alpha(34)))
            .send({
              emailPattern: 'Je ne donne jamais mon email',
            })
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid scope', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(url.replace(':whitelistId', faker.string.alpha(34)))
            .send({
              scope: 'MySuperScope',
            })
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And whitelist does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .put(url.replace(':whitelistId', faker.string.uuid()))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And whitelist does exist', () => {
        let whitelist: Awaited<ReturnType<typeof createEmailWhitelist>>

        beforeEach(async () => {
          whitelist = await createEmailWhitelist({
            agent,
            token,
            prisma,
          })
        })

        test(`Then it return a ${StatusCodes.OK} response`, async () => {
          const payload = {
            emailPattern: faker.internet.email().toLocaleLowerCase(),
            description: faker.lorem.sentence(),
          }

          const { body } = await agent
            .put(url.replace(':whitelistId', whitelist.id))
            .set('authorization', `Bearer ${token}`)
            .send(payload)
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            ...whitelist,
            ...payload,
            updatedAt: expect.any(String),
          })
        })

        describe('And updating scope', () => {
          describe('And scope does not exist', () => {
            test(`Then it return a ${StatusCodes.NOT_FOUND} response`, async () => {
              const payload = {
                scope: randomApiScopeName(
                  Object.values(ApiScopeName).filter(
                    (scope) =>
                      scope !== whitelist.scope && scope !== ApiScopeName.ngc
                  )
                ),
              }

              await agent
                .put(url.replace(':whitelistId', whitelist.id))
                .set('authorization', `Bearer ${token}`)
                .send(payload)
                .expect(StatusCodes.NOT_FOUND)
            })
          })

          describe('And scope does exist', () => {
            let scope: ApiScopeName

            beforeEach(async () => {
              scope = randomApiScopeName(
                Object.values(ApiScopeName).filter(
                  (scope) => scope !== whitelist.scope
                )
              )
              await prisma.integrationApiScope.upsert({
                where: {
                  name: scope,
                },
                create: {
                  name: scope,
                  description: faker.lorem.sentence(),
                },
                update: {
                  description: faker.lorem.sentence(),
                },
                select: {
                  name: true,
                },
              })
            })

            test(`Then it return a ${StatusCodes.OK} response`, async () => {
              const payload = {
                scope,
              }

              const { body } = await agent
                .put(url.replace(':whitelistId', whitelist.id))
                .set('authorization', `Bearer ${token}`)
                .send(payload)
                .expect(StatusCodes.OK)

              expect(body).toEqual({
                ...whitelist,
                ...payload,
                updatedAt: expect.any(String),
              })
            })
          })
        })

        describe('And database failure', () => {
          const databaseError = new Error('Something went wrong')

          beforeEach(() => {
            vi.spyOn(
              prismaTransactionAdapter,
              'transaction'
            ).mockRejectedValueOnce(databaseError)
          })

          afterEach(() => {
            vi.spyOn(prismaTransactionAdapter, 'transaction').mockRestore()
          })

          test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
            await agent
              .put(url.replace(':whitelistId', faker.string.uuid()))
              .set('authorization', `Bearer ${token}`)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)
          })

          test('Then it logs the exception', async () => {
            await agent
              .put(url.replace(':whitelistId', faker.string.uuid()))
              .set('authorization', `Bearer ${token}`)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)

            expect(logger.error).toHaveBeenCalledWith(
              'Email Whitelist update failed',
              databaseError
            )
          })
        })
      })
    })
  })
})
