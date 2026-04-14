import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { ZodError } from 'zod'
import { twoTonsExportSituation } from '../../../adapters/2tonnes/__tests__/fixtures/server.fixture.js'
import { agirExportSituation } from '../../../adapters/agir/__tests__/fixtures/server.fixture.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { getRandomPersonaSituation } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import type { SituationSchema } from '../../simulations/simulations.validator.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/integrations/v1/:externalService/export-situation'

  describe('When exporting his simulation situation', () => {
    let situation: SituationSchema

    beforeEach(() => (situation = getRandomPersonaSituation()))

    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent.post(url).expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid external Service', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent.post(url).send(situation).expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And agir external service', () => {
      const serviceName = 'agir'

      test(`Then it returns a ${StatusCodes.OK} with a redirectionUrl`, async () => {
        mswServer.use(
          agirExportSituation({
            customResponses: [
              {
                body: {
                  redirect_url: 'http://app.agir.com',
                },
              },
            ],
          })
        )

        const response = await agent
          .post(url.replace(':externalService', serviceName))
          .send(situation)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          redirectUrl: 'http://app.agir.com',
        })
      })

      test('Then it sends situation on agir service', async () => {
        mswServer.use(
          agirExportSituation({
            expectBody: { situation },
            customResponses: [
              {
                body: {
                  redirect_url: 'http://app.agir.com',
                },
              },
            ],
          })
        )

        await agent
          .post(url.replace(':externalService', serviceName))
          .send(situation)
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      describe('And agir interface changes', () => {
        test('Then it raises an exception', async () => {
          mswServer.use(
            agirExportSituation({
              customResponses: [{ body: {} }],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          mswServer.use(
            agirExportSituation({
              customResponses: [{ body: {} }],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Situation export failed',
            expect.any(ZodError)
          )
        })
      })

      describe('And service is down', () => {
        test('Then it retries several times and then raises the exception', async () => {
          mswServer.use(
            agirExportSituation({
              customResponses: [
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
              ],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          mswServer.use(
            agirExportSituation({
              customResponses: [
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
              ],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Situation export failed',
            expect.objectContaining({
              message: 'Request failed with status code 500',
              name: 'AxiosError',
              code: 'ERR_BAD_RESPONSE',
            })
          )
        })
      })
    })

    describe('And 2 tonnes external service', () => {
      const serviceName = '2-tonnes'

      describe('And invalid external Service queryParams', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':externalService', serviceName))
            .query({
              queryParamNotStartingWithPartnerDash: true,
            })
            .send(situation)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      test(`Then it returns a ${StatusCodes.OK} with a redirectionUrl`, async () => {
        mswServer.use(
          twoTonsExportSituation({
            customResponses: [
              {
                body: {
                  redirect_url: 'http://app.2-tonnes.com',
                },
              },
            ],
          })
        )

        const response = await agent
          .post(url.replace(':externalService', serviceName))
          .send(situation)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          redirectUrl: 'http://app.2-tonnes.com',
        })
      })

      test('Then it sends situation on 2 tonnes service', async () => {
        mswServer.use(
          twoTonsExportSituation({
            expectBody: { situation },
            customResponses: [
              {
                body: {
                  redirect_url: 'http://app.2-tonnes.com',
                },
              },
            ],
          })
        )

        await agent
          .post(url.replace(':externalService', serviceName))
          .send(situation)
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })

      describe('And valid external Service queryParams', () => {
        test('Then it sends situation on 2 tonnes service', async () => {
          mswServer.use(
            twoTonsExportSituation({
              expectParams: {
                token: 'token',
                boolean: 'true',
                id: '42',
                object: JSON.stringify({ foo: 'bar' }),
              },
              customResponses: [
                {
                  body: {
                    redirect_url: 'http://app.2-tonnes.com',
                  },
                },
              ],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .query({
              'partner-token': 'token',
              'partner-boolean': true,
              'partner-id': 42,
              'partner-object': JSON.stringify({ foo: 'bar' }),
            })
            .send(situation)
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })
      })

      describe('And 2 tonnes returns handled error', () => {
        test(`Then it returns a ${StatusCodes.OK} with a redirectionUrl`, async () => {
          mswServer.use(
            twoTonsExportSituation({
              customResponses: [
                {
                  body: {
                    redirect_url: 'http://app.2-tonnes.com/error',
                  },
                  status: StatusCodes.UNAUTHORIZED,
                },
              ],
            })
          )

          const response = await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            redirectUrl: 'http://app.2-tonnes.com/error',
          })
        })

        describe('And 2 tonnes interface changes', () => {
          test('Then it raises the exception', async () => {
            mswServer.use(
              twoTonsExportSituation({
                customResponses: [
                  {
                    body: {},
                    status: StatusCodes.BAD_REQUEST,
                  },
                ],
              })
            )

            await agent
              .post(url.replace(':externalService', serviceName))
              .send(situation)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)
          })

          test('Then it logs the exception', async () => {
            mswServer.use(
              twoTonsExportSituation({
                customResponses: [
                  {
                    body: {},
                    status: StatusCodes.BAD_REQUEST,
                  },
                ],
              })
            )

            await agent
              .post(url.replace(':externalService', serviceName))
              .send(situation)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)

            expect(logger.error).toHaveBeenCalledWith(
              'Situation export failed',
              expect.objectContaining({
                message: 'Request failed with status code 500',
                name: 'AxiosError',
                code: 'ERR_BAD_RESPONSE',
              })
            )
          })
        })
      })

      describe('And 2 tonnes interface changes', () => {
        test('Then it raises the exception', async () => {
          mswServer.use(
            twoTonsExportSituation({
              customResponses: [{ body: {} }],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          mswServer.use(
            twoTonsExportSituation({
              customResponses: [{ body: {} }],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Situation export failed',
            expect.any(ZodError)
          )
        })

        describe('And fallback parameter', () => {
          test('Then it redirects to the fallback', async () => {
            mswServer.use(
              twoTonsExportSituation({
                customResponses: [{ body: {} }],
              })
            )

            const response = await agent
              .post(url.replace(':externalService', serviceName))
              .query({
                'partner-fallback': 'http://app.2-tonnes.com/fallback',
              })
              .send(situation)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              redirectUrl: 'http://app.2-tonnes.com/fallback',
            })
          })
        })
      })

      describe('And service is down', () => {
        test('Then it retries several times and then raises the exception', async () => {
          mswServer.use(
            twoTonsExportSituation({
              customResponses: [
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
              ],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          mswServer.use(
            twoTonsExportSituation({
              customResponses: [
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
              ],
            })
          )

          await agent
            .post(url.replace(':externalService', serviceName))
            .send(situation)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Situation export failed',
            expect.objectContaining({
              message: 'Request failed with status code 500',
              name: 'AxiosError',
              code: 'ERR_BAD_RESPONSE',
            })
          )
        })

        describe('And fallback parameter', () => {
          test('Then it redirects to the fallback', async () => {
            mswServer.use(
              twoTonsExportSituation({
                customResponses: [
                  { status: StatusCodes.INTERNAL_SERVER_ERROR },
                  { status: StatusCodes.INTERNAL_SERVER_ERROR },
                  { status: StatusCodes.INTERNAL_SERVER_ERROR },
                  { status: StatusCodes.INTERNAL_SERVER_ERROR },
                ],
              })
            )

            const response = await agent
              .post(url.replace(':externalService', serviceName))
              .query({
                'partner-fallback': 'http://app.2-tonnes.com/fallback',
              })
              .send(situation)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              redirectUrl: 'http://app.2-tonnes.com/fallback',
            })
          })
        })
      })
    })
  })
})
