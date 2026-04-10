import { HeadObjectCommand, NotFound } from '@aws-sdk/client-s3'
import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.js'
import { prisma } from '../../../../../adapters/prisma/client.js'
import { client } from '../../../../../adapters/scaleway/client.js'
import app from '../../../../../app.js'
import { config } from '../../../../../config.js'
import logger from '../../../../../logger.js'
import { ExternalServiceTypeEnum } from '../../../integrations.validator.js'
import { recoverApiToken } from '../../authentication/__tests__/fixtures/authentication.fixtures.js'
import { SCOPES_FOR_PARTNERS } from '../mapping-file.service.js'
import {
  FETCH_MAPPING_FILE_ROUTE,
  randomMappingFileKind,
  randomPartner,
} from './fixtures/index.js'

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = FETCH_MAPPING_FILE_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When fetching a mapping file', () => {
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

      beforeEach(async () => {
        vi.spyOn(client, 'send').mockImplementationOnce((command) => {
          if (!(command instanceof HeadObjectCommand)) {
            throw command
          }

          return Promise.resolve({
            $metadata: {},
          })
        })
        ;({ token } = await recoverApiToken({
          apiScope: { name: scope },
          prisma,
          agent,
        }))
      })

      afterEach(() => {
        vi.spyOn(client, 'send').mockRestore()
      })

      describe.each(
        Object.values(ExternalServiceTypeEnum)
          .filter((partner) =>
            SCOPES_FOR_PARTNERS[partner].every(
              (partnerScope) => partnerScope !== scope
            )
          )
          .map((forbiddenPartner) => ({ forbiddenPartner }))
      )('And forbidden $forbiddenPartner partner', ({ forbiddenPartner }) => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', forbiddenPartner)
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.FORBIDDEN)
        })
      })

      describe.each(
        Object.values(ExternalServiceTypeEnum)
          .filter((partner) =>
            SCOPES_FOR_PARTNERS[partner].some(
              (partnerScope) => partnerScope === scope
            )
          )
          .map((allowedPartner) => ({ allowedPartner }))
      )('And allowed $allowedPartner partner', ({ allowedPartner }) => {
        test(`Then it return a ${StatusCodes.MOVED_TEMPORARILY} redirection to bucket URL`, async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', allowedPartner)
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.MOVED_TEMPORARILY)
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

      afterEach(() => {
        vi.spyOn(client, 'send').mockRestore()
      })

      describe('And invalid kind provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .get(
              url
                .replace(':kind', 'MyKind')
                .replace(':partner', randomPartner())
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid partner provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', 'MyPartner')
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And file does not exist', () => {
        beforeEach(async () => {
          vi.spyOn(client, 'send').mockImplementationOnce((command) => {
            if (!(command instanceof HeadObjectCommand)) {
              throw command
            }

            return Promise.reject(
              new NotFound({
                message: 'NotFound: UnknownError',
                $metadata: {
                  httpStatusCode: StatusCodes.NOT_FOUND,
                },
              })
            )
          })
          ;({ token } = await recoverApiToken({
            prisma,
            agent,
          }))
        })

        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', randomPartner())
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And file does exist', () => {
        beforeEach(() => {
          vi.spyOn(client, 'send').mockImplementationOnce((command) => {
            if (!(command instanceof HeadObjectCommand)) {
              throw command
            }

            return Promise.resolve({
              $metadata: {},
            })
          })
        })

        test(`Then it returns a ${StatusCodes.MOVED_TEMPORARILY} redirection to bucket URL`, async () => {
          const kind = randomMappingFileKind()
          const partner = randomPartner()

          const {
            headers: { location },
          } = await agent
            .get(url.replace(':kind', kind).replace(':partner', partner))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.MOVED_TEMPORARILY)

          const baseUrl = new URL(process.env.SCALEWAY_ENDPOINT!)
          const documentUrl = new URL(location)

          expect(`${documentUrl.origin}${documentUrl.pathname}`).toBe(
            `${baseUrl.protocol}//${process.env.SCALEWAY_BUCKET}.${baseUrl.hostname}/${process.env.SCALEWAY_ROOT_PATH}/mapping-files/${partner}/${kind}.yml`
          )

          expect(Object.fromEntries(documentUrl.searchParams)).toEqual({
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
            'X-Amz-Credential': expect.any(String),
            'X-Amz-Date': expect.any(String),
            'X-Amz-Expires': '60',
            'X-Amz-Signature': expect.any(String),
            'X-Amz-SignedHeaders': 'host',
            'x-amz-checksum-mode': 'ENABLED',
            'x-id': 'GetObject',
          })
        })
      })

      describe('And bucket failure', () => {
        const bucketError = new Error('Something went wrong')

        beforeEach(() => {
          vi.spyOn(client, 'send').mockImplementationOnce(() =>
            Promise.reject(bucketError)
          )
        })

        test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', randomPartner())
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url
                .replace(':kind', randomMappingFileKind())
                .replace(':partner', randomPartner())
            )
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Mapping File fetch failed',
            bucketError
          )
        })
      })
    })
  })
})
