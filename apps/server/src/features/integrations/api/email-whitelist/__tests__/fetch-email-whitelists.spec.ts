import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../../../adapters/prisma/client.js'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.js'
import * as prismaTransactionAdapter from '../../../../../adapters/prisma/transaction.js'
import app from '../../../../../app.js'
import { config } from '../../../../../config.js'
import logger from '../../../../../logger.js'
import {
  createIntegrationEmailWhitelist,
  recoverApiToken,
} from '../../authentication/__tests__/fixtures/authentication.fixtures.js'
import { FETCH_EMAIL_WHITELISTS_ROUTE } from './fixtures/email-whitelist.fixture.js'

vi.mock('../../../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../../../adapters/prisma/transaction')),
}))

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = FETCH_EMAIL_WHITELISTS_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When fetching Email Whitelists', () => {
    describe('And not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.get(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(url)
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
          .get(url)
          .set('authorization', `Bearer ${token}`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe.each(
      Object.values(ApiScopeName)
        .filter((scopeName) => scopeName != ApiScopeName.ngc)
        .map((scope) => ({ scope }))
    )('And valid $scope token', ({ scope }) => {
      let token: string
      let emailWhitelist: Awaited<
        ReturnType<typeof createIntegrationEmailWhitelist>
      >

      beforeEach(async () => {
        ;({ token, emailWhitelist } = await recoverApiToken({
          apiScope: { name: scope },
          prisma,
          agent,
        }))
      })

      test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists`, async () => {
        const { body } = await agent
          .get(url)
          .set('authorization', `Bearer ${token}`)
          .expect(StatusCodes.OK)

        expect(body).toEqual([
          {
            id: expect.any(String),
            emailPattern: emailWhitelist.emailPattern,
            description: emailWhitelist.description,
            scope: emailWhitelist.apiScope.name,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ])
      })

      describe('And others whitelists exist for others scopes', () => {
        beforeEach(async () => {
          await createIntegrationEmailWhitelist({
            prisma,
          })
        })

        test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists for the token scope only`, async () => {
          const { body } = await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.OK)

          expect(body).toEqual([
            {
              id: expect.any(String),
              emailPattern: emailWhitelist.emailPattern,
              description: emailWhitelist.description,
              scope: emailWhitelist.apiScope.name,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ])
        })
      })
    })

    describe(`And a valid ${ApiScopeName.ngc} token`, () => {
      let token: string
      let emailWhitelist: Awaited<
        ReturnType<typeof createIntegrationEmailWhitelist>
      >

      beforeEach(async () => {
        ;({ token, emailWhitelist } = await recoverApiToken({
          prisma,
          agent,
        }))
      })

      test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists`, async () => {
        const { body } = await agent
          .get(url)
          .set('authorization', `Bearer ${token}`)
          .expect(StatusCodes.OK)

        expect(body).toEqual([
          {
            id: expect.any(String),
            emailPattern: emailWhitelist.emailPattern,
            description: emailWhitelist.description,
            scope: emailWhitelist.apiScope.name,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ])
      })

      describe('And others whitelists exist for others scopes', () => {
        let emailWhitelists: Awaited<
          ReturnType<typeof createIntegrationEmailWhitelist>
        >[]

        beforeEach(async () => {
          emailWhitelists = await Promise.all(
            Object.values(ApiScopeName)
              .filter((scope) => scope != ApiScopeName.ngc)
              .map((scope) =>
                createIntegrationEmailWhitelist({
                  apiScope: {
                    name: scope,
                  },
                  prisma,
                })
              )
          )
        })

        test(`Then it returns a ${StatusCodes.OK} code and a list of all email whitelists`, async () => {
          const { body } = await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.OK)

          expect(body).toEqual(
            expect.arrayContaining([
              {
                id: expect.any(String),
                emailPattern: emailWhitelist.emailPattern,
                description: emailWhitelist.description,
                scope: emailWhitelist.apiScope.name,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
              ...emailWhitelists.map((whitelist) => ({
                id: expect.any(String),
                emailPattern: whitelist.emailPattern,
                description: whitelist.description,
                scope: whitelist.apiScope.name,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })),
            ])
          )
        })
      })

      describe('And filtering with the emailPattern queryParam *@emailDomain', () => {
        test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists for the filter`, async () => {
          const [, emailDomain] = emailWhitelist.emailPattern.split('@')

          const { body } = await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .query({
              emailPattern: `*@${emailDomain}`,
            })
            .expect(StatusCodes.OK)

          expect(body).toEqual([
            {
              id: expect.any(String),
              emailPattern: emailWhitelist.emailPattern,
              description: emailWhitelist.description,
              scope: emailWhitelist.apiScope.name,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ])
        })
      })

      describe('And filtering with the emailPattern queryParam email@emailDomain', () => {
        test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists for the filter`, async () => {
          const { body } = await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .query({
              emailPattern: emailWhitelist.emailPattern,
            })
            .expect(StatusCodes.OK)

          expect(body).toEqual([
            {
              id: expect.any(String),
              emailPattern: emailWhitelist.emailPattern,
              description: emailWhitelist.description,
              scope: emailWhitelist.apiScope.name,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ])
        })

        describe('And email whitelist exists for the whole email domain', () => {
          let wholeDomainEmailWhitelist: Awaited<
            ReturnType<typeof createIntegrationEmailWhitelist>
          >

          beforeEach(async () => {
            const [, emailDomain] = emailWhitelist.emailPattern.split('@')

            wholeDomainEmailWhitelist = await createIntegrationEmailWhitelist({
              integrationWhitelist: {
                emailPattern: `*@${emailDomain}`,
              },
              prisma,
            })
          })

          test(`Then it returns a ${StatusCodes.OK} code and a list of email whitelists`, async () => {
            const { body } = await agent
              .get(url)
              .set('authorization', `Bearer ${token}`)
              .expect(StatusCodes.OK)

            expect(body).toEqual(
              expect.arrayContaining([
                {
                  id: expect.any(String),
                  emailPattern: emailWhitelist.emailPattern,
                  description: emailWhitelist.description,
                  scope: emailWhitelist.apiScope.name,
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                },
                {
                  id: expect.any(String),
                  emailPattern: wholeDomainEmailWhitelist.emailPattern,
                  description: wholeDomainEmailWhitelist.description,
                  scope: wholeDomainEmailWhitelist.apiScope.name,
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                },
              ])
            )
          })
        })
      })

      describe('And filtering with the emailPattern queryParam', () => {
        test(`Then it returns a ${StatusCodes.OK} code and an empty list of email whitelists`, async () => {
          const [, emailDomain] = emailWhitelist.emailPattern.split('@')

          const { body } = await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .query({
              emailPattern: `*@does-not-exist${emailDomain}`,
            })
            .expect(StatusCodes.OK)

          expect(body).toEqual([])
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
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(url)
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Email Whitelists fetch failed',
            databaseError
          )
        })
      })
    })
  })
})
