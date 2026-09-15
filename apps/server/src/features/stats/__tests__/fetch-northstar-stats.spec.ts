import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { posthogRunEndpoint } from '../../../adapters/posthog/__tests__/fixtures/server.fixture.ts'
import app from '../../../app.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import logger from '../../../logger.ts'
import { PERIODS } from '../stats.constant.ts'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/api/stats'

  describe('When fetching northstar stats', () => {
    test(`Then it returns a ${StatusCodes.MOVED_PERMANENTLY} redirection`, async () => {
      const response = await agent
        .get(url)
        .expect(StatusCodes.MOVED_PERMANENTLY)

      expect(response.get('location')).toBe('/stats/v1/northstar')
    })
  })
})

describe('Given a redirected NGC user', () => {
  const agent = supertest(app)
  const url = '/stats/v1/northstar'

  describe('When fetching northstar stats', () => {
    describe('And invalid period', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({ periodicity: 'hour' })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid since', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({ since: -1 })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And no stats', () => {
      test(`Then it returns a ${StatusCodes.OK} response with empty stats`, async () => {
        mswServer.use(
          posthogRunEndpoint({
            customResponses: [
              {
                body: {
                  results: [],
                },
              },
            ],
          })
        )

        const { body } = await agent.get(url).expect(StatusCodes.OK)

        expect(body).toEqual({
          stats: [],
          description: 'Nombre de simulations réalisées',
        })
      })
    })

    describe.each(
      Object.values(PERIODS).map((periodicity) => ({ periodicity }))
    )('And $periodicity stats', ({ periodicity }) => {
      let rows: Array<[number, number]>

      beforeEach(() => {
        rows = Array.from({ length: 5 }, () => [
          faker.date.past().getTime(),
          faker.number.int({ min: 1000, max: 999999 }),
        ])
      })

      test(`Then it returns a ${StatusCodes.OK} response with ${periodicity}ly stats`, async () => {
        mswServer.use(
          posthogRunEndpoint({
            expectBody: {
              variables: {
                periodicity,
              },
            },
            customResponses: [
              {
                body: {
                  results: rows,
                },
              },
            ],
          })
        )

        const { body } = await agent
          .get(url)
          .query({ periodicity })
          .expect(StatusCodes.OK)

        expect(body).toEqual({
          stats: rows.map(([date, value]) => ({ date, value })),
          description: 'Nombre de simulations réalisées',
        })
      })

      describe('And since query', () => {
        test(`Then it returns a ${StatusCodes.OK} response with stats since the given periods`, async () => {
          const since = faker.number.int({ min: 1, max: 10 })

          mswServer.use(
            posthogRunEndpoint({
              expectBody: {
                variables: {
                  periodicity,
                  since,
                },
              },
              customResponses: [
                {
                  body: {
                    results: rows,
                  },
                },
              ],
            })
          )

          const { body } = await agent
            .get(url)
            .query({ periodicity, since })
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            stats: rows.map(([date, value]) => ({ date, value })),
            description: 'Nombre de simulations réalisées',
          })
        })
      })
    })

    describe('And posthog failure', () => {
      test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
        mswServer.use(
          posthogRunEndpoint({
            networkError: true,
          })
        )

        await agent.get(url).expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error')

        mswServer.use(
          posthogRunEndpoint({
            networkError: true,
          })
        )

        await agent.get(url)

        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Northstar stats fetch failed',
          expect.any(Error)
        )
      })
    })
  })
})
