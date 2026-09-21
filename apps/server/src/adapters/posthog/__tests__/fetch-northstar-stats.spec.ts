import { StatusCodes } from 'http-status-codes'
import { describe, expect, test } from 'vitest'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { PERIODS } from '../../../features/stats/stats.constant.ts'
import { fetchNorthstarStats } from '../client.ts'
import { posthogRunEndpoint } from './fixtures/server.fixture.ts'

describe('Given a PostHog northstar stats endpoint', () => {
  describe('When fetching northstar stats', () => {
    test('Then it returns mapped stats', async () => {
      mswServer.use(
        posthogRunEndpoint({
          expectBody: {
            variables: {
              periodicity: PERIODS.week,
              since: 52,
            },
          },
          customResponses: [
            {
              body: {
                results: [
                  [1757887200000, 13671],
                  [1758492000000, 26768],
                ],
                columns: ['date', 'value'],
                types: [
                  ['date', 'Nullable(Int64)'],
                  ['value', 'Int64'],
                ],
              },
            },
          ],
        })
      )

      const stats = await fetchNorthstarStats({
        periodicity: PERIODS.week,
        since: 52,
      })

      expect(stats).toEqual([
        { date: 1757887200000, value: 13671 },
        { date: 1758492000000, value: 26768 },
      ])
    })

    test('Then it returns mapped stats when periodicity is omitted', async () => {
      mswServer.use(
        posthogRunEndpoint({
          expectBody: {
            variables: {
              since: 52,
            },
          },
          customResponses: [
            {
              body: {
                results: [[1757887200000, 13671]],
              },
            },
          ],
        })
      )

      const stats = await fetchNorthstarStats({
        since: 52,
      })

      expect(stats).toEqual([{ date: 1757887200000, value: 13671 }])
    })

    test(`Then it throws on invalid body`, async () => {
      mswServer.use(
        posthogRunEndpoint({
          customResponses: [
            {
              status: StatusCodes.INTERNAL_SERVER_ERROR,
              body: {
                results: 'not-an-array',
              },
            },
          ],
        })
      )

      await expect(
        fetchNorthstarStats({
          periodicity: PERIODS.week,
          since: 52,
        })
      ).rejects.toThrow()
    })
  })
})
