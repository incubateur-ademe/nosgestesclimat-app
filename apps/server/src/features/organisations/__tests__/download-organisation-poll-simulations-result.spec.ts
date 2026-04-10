import { PutObjectCommand } from '@aws-sdk/client-s3'
import { faker } from '@faker-js/faker'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import xlsx from 'xlsx'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import { client } from '../../../adapters/scaleway/client.js'
import app from '../../../app.js'
import { config } from '../../../config.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import {
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
  DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT_ROUTE,
  downloadOrganisationPollSimulationsResult,
} from './fixtures/organisations.fixture.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT_ROUTE

  afterEach(async () => {
    await prisma.organisationAdministrator.deleteMany()
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
      prisma.job.deleteMany(),
    ])
  })

  describe('And logged out', () => {
    describe('When downloading one of his organisation poll result', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
            url
              .replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
              .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And invalid cookie', () => {
    describe('When downloading one of his organisation poll result', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
            url
              .replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
              .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
          )
          .set('cookie', `${COOKIE_NAME}=invalid cookie`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And logged in', () => {
    let cookie: string
    let user: { userId: string; email: string }

    beforeEach(async () => {
      ;({ cookie, ...user } = await login({ agent }))
    })

    describe('When downloading one of his organisation poll result', () => {
      describe('And organisation does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And organisation does exist', () => {
        let organisationId: string
        let organisationSlug: string

        beforeEach(
          async () =>
            ({ id: organisationId, slug: organisationSlug } =
              await createOrganisation({
                agent,
                cookie,
              }))
        )

        describe('And poll does not exist in the organisation', () => {
          test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
            await agent
              .get(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
              )
              .set('cookie', cookie)
              .expect(StatusCodes.NOT_FOUND)
          })
        })

        describe('And poll does exist in the organisation', () => {
          let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
          let pollId: string
          let pollSlug: string

          beforeEach(async () => {
            vi.spyOn(client, 'send').mockImplementationOnce((command) => {
              if (!(command instanceof PutObjectCommand)) {
                throw command
              }

              return Promise.resolve({
                $metadata: {},
              })
            })

            poll = await createOrganisationPoll({
              agent,
              cookie,
              organisationId,
            })
            ;({ id: pollId, slug: pollSlug } = poll)
          })

          afterEach(async () => {
            await EventBus.flush()
            vi.spyOn(client, 'send').mockRestore()
          })

          test(`Then it returns a ${StatusCodes.ACCEPTED} response with the started job`, async () => {
            const params = {
              kind: 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
              organisationId,
              pollId,
            }

            const response = await agent
              .get(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', pollId)
              )
              .set('cookie', cookie)
              .expect(StatusCodes.ACCEPTED)

            const expectedId = crypto
              .createHash('sha256')
              .update(
                `${config.security.job.secret}${new URLSearchParams(
                  Object.entries({
                    ...params,
                    ...user,
                  })
                ).toString()}`
              )
              .digest('hex')

            expect(response.body).toEqual({
              id: expectedId,
              params,
              result: null,
              status: 'pending',
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          })

          describe('And using organisation and poll slugs', () => {
            test(`Then it returns a ${StatusCodes.ACCEPTED} response with the started job`, async () => {
              const params = {
                kind: 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
                organisationId,
                pollId,
              }

              const response = await agent
                .get(
                  url
                    .replace(':organisationIdOrSlug', organisationSlug)
                    .replace(':pollIdOrSlug', pollSlug)
                )
                .set('cookie', cookie)
                .expect(StatusCodes.ACCEPTED)

              const expectedId = crypto
                .createHash('sha256')
                .update(
                  `${config.security.job.secret}${new URLSearchParams(
                    Object.entries({
                      ...params,
                      ...user,
                    })
                  ).toString()}`
                )
                .digest('hex')

              expect(response.body).toEqual({
                id: expectedId,
                params: {
                  kind: 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
                  organisationId,
                  pollId,
                },
                result: null,
                status: 'pending',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })
            })
          })

          describe('And polling the job result', () => {
            let jobId: string

            describe('And job is pending/running', () => {
              beforeEach(async () => {
                vi.spyOn(EventBus, 'emit').mockImplementationOnce(
                  () => EventBus
                )
                ;({ id: jobId } =
                  await downloadOrganisationPollSimulationsResult({
                    agent,
                    cookie,
                    pollId,
                    organisationId,
                  }))
              })

              afterEach(() => {
                vi.spyOn(EventBus, 'emit').mockRestore()
              })

              test(`Then it returns a ${StatusCodes.ACCEPTED} response with the job status`, async () => {
                const response = await agent
                  .get(
                    url
                      .replace(':organisationIdOrSlug', organisationId)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .query({ jobId })
                  .set('cookie', cookie)
                  .expect(StatusCodes.ACCEPTED)

                expect(response.body).toEqual({
                  id: jobId,
                  params: {
                    kind: 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
                    organisationId,
                    pollId,
                  },
                  result: null,
                  status: 'pending',
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                })
              })

              describe('And running the job again', () => {
                test(`Then it returns a ${StatusCodes.ACCEPTED} response with the job status`, async () => {
                  const response = await agent
                    .get(
                      url
                        .replace(':organisationIdOrSlug', organisationId)
                        .replace(':pollIdOrSlug', pollId)
                    )
                    .set('cookie', cookie)
                    .expect(StatusCodes.ACCEPTED)

                  expect(response.body).toEqual({
                    id: jobId,
                    params: {
                      kind: 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
                      organisationId,
                      pollId,
                    },
                    result: null,
                    status: 'pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                  })
                })
              })
            })

            describe('And job is finished', () => {
              beforeEach(async () => {
                ;({ id: jobId } =
                  await downloadOrganisationPollSimulationsResult({
                    agent,
                    cookie,
                    pollId,
                    organisationId,
                  }))
              })

              test(`Then it returns a ${StatusCodes.OK} response with the job result`, async () => {
                const {
                  body: { url: rawDocumentUrl },
                } = await agent
                  .get(
                    url
                      .replace(':organisationIdOrSlug', organisationId)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .query({ jobId })
                  .set('cookie', cookie)
                  .expect(StatusCodes.OK)

                const baseUrl = new URL(process.env.SCALEWAY_ENDPOINT!)
                const documentUrl = new URL(rawDocumentUrl)

                expect(`${documentUrl.origin}${documentUrl.pathname}`).toBe(
                  `${baseUrl.protocol}//${process.env.SCALEWAY_BUCKET}.${baseUrl.hostname}/${process.env.SCALEWAY_ROOT_PATH}/jobs/polls/Export_${pollSlug}_Simulations.xlsx`
                )

                expect(Object.fromEntries(documentUrl.searchParams)).toEqual({
                  'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                  'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
                  'X-Amz-Credential': expect.any(String),
                  'X-Amz-Date': expect.any(String),
                  'X-Amz-Expires': '600',
                  'X-Amz-Signature': expect.any(String),
                  'X-Amz-SignedHeaders': 'host',
                  'x-amz-checksum-mode': 'ENABLED',
                  'x-id': 'GetObject',
                })
              })
            })

            describe('And simulations with different progressions exist', () => {
              let excelBuffer: Buffer

              beforeEach(async () => {
                // Create a complete simulation (progression: 1)
                await createOrganisationPollSimulation({
                  agent,
                  pollId,
                  simulation: { progression: 1 },
                })

                // Create an incomplete simulation (progression: 0.5)
                await createOrganisationPollSimulation({
                  agent,
                  pollId,
                  simulation: { progression: 0.5 },
                })

                // Capture the Excel buffer when uploaded
                vi.spyOn(client, 'send')
                  .mockReset()
                  .mockImplementationOnce((command) => {
                    if (!(command instanceof PutObjectCommand)) {
                      throw command
                    }
                    excelBuffer = command.input.Body as Buffer
                    return Promise.resolve({ $metadata: {} })
                  })

                await downloadOrganisationPollSimulationsResult({
                  agent,
                  cookie,
                  pollId,
                  organisationId,
                })
              })

              test('Then it only includes complete simulations in the export', () => {
                const workbook = xlsx.read(excelBuffer, { type: 'buffer' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const data = xlsx.utils.sheet_to_json(sheet)
                // Only the complete simulation should be in the export
                expect(data).toHaveLength(1)
              })
            })

            describe('And job is failed', () => {
              const jobError = new Error('Scaleway upload error')

              beforeEach(async () => {
                vi.spyOn(client, 'send')
                  .mockReset()
                  .mockRejectedValueOnce(jobError)
                ;({ id: jobId } =
                  await downloadOrganisationPollSimulationsResult({
                    agent,
                    cookie,
                    pollId,
                    organisationId,
                  }))
              })

              test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
                await agent
                  .get(
                    url
                      .replace(':organisationIdOrSlug', organisationId)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .query({ jobId })
                  .set('cookie', cookie)
                  .expect(StatusCodes.INTERNAL_SERVER_ERROR)
              })

              test('Then it logs the exception', () => {
                expect(logger.error).toHaveBeenCalledWith(
                  `Job ${jobId} DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT failed`,
                  jobError
                )
              })
            })
          })

          describe('And an other user tries to recover the job result', () => {
            let cookie2: string
            let jobId: string

            beforeEach(async () => {
              ;({ cookie: cookie2 } = await login({ agent }))
            })

            describe('And the job is pending/running', () => {
              beforeEach(async () => {
                vi.spyOn(EventBus, 'emit').mockImplementationOnce(
                  () => EventBus
                )
                ;({ id: jobId } =
                  await downloadOrganisationPollSimulationsResult({
                    agent,
                    cookie,
                    pollId,
                    organisationId,
                  }))
              })

              afterEach(() => {
                vi.spyOn(EventBus, 'emit').mockRestore()
              })

              test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
                await agent
                  .get(
                    url
                      .replace(':organisationIdOrSlug', organisationId)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .query({ jobId })
                  .set('cookie', cookie2)
                  .expect(StatusCodes.NOT_FOUND)
              })
            })

            describe('And the job is finished', () => {
              beforeEach(async () => {
                ;({ id: jobId } =
                  await downloadOrganisationPollSimulationsResult({
                    agent,
                    cookie,
                    pollId,
                    organisationId,
                  }))
              })

              test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
                await agent
                  .get(
                    url
                      .replace(':organisationIdOrSlug', organisationId)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .query({ jobId })
                  .set('cookie', cookie2)
                  .expect(StatusCodes.NOT_FOUND)
              })
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
            .get(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)

          expect(logger.error).toHaveBeenCalledWith(
            'Poll download simulations failed',
            databaseError
          )
        })
      })
    })
  })
})
