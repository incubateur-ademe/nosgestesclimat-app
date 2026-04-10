import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import utc from 'dayjs/plugin/utc.js'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import {
  MatomoStatsDevice,
  MatomoStatsSource,
  StatsKind,
} from '../../../adapters/prisma/generated.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import { PERIODS } from '../stats.constant.js'
import { upsertStat } from '../stats.repository.js'

dayjs.extend(isoWeek)
dayjs.extend(utc)

// to be sure week starts on monday
function isoWeekStartMsUTC(d: dayjs.Dayjs) {
  const du = d.utc()
  const dow = du.day()
  const offset = (dow + 6) % 7
  return du.startOf('day').subtract(offset, 'day').valueOf()
}

function startOfPeriodUTC(
  d: dayjs.Dayjs,
  unit: 'day' | 'week' | 'month' | 'year'
) {
  if (unit === 'week') return isoWeekStartMsUTC(d)
  return d.utc().startOf(unit).valueOf()
}

/**
 * Construit l'attendu "zéro-rempli"
 * - periodicity: 'day'|'week'|'month'|'year'
 * - since: nombre de dernières périodes (si null => depuis la première période ayant des données)
 * - points: Map<timestamp_ms, value> des données réellement insérées (début de période en UTC)
 */
function buildExpectedZeroFilled(
  periodicity: 'day' | 'week' | 'month' | 'year',
  since: number | null,
  points: Map<number, number>
) {
  const endMs = startOfPeriodUTC(dayjs(), periodicity)

  let startMs: number
  if (since != null) {
    // fenêtre calendaire: N dernières périodes, comme en SQL
    startMs = startOfPeriodUTC(dayjs(), periodicity)
    // recule (since - 1) périodes
    startMs = dayjs
      .utc(startMs)
      .subtract(since - 1, periodicity)
      .valueOf()
  } else {
    // depuis la première période où l'on a des données
    const minPoint = [...points.keys()].sort((a, b) => a - b)[0]
    // si aucune donnée => renvoie []
    if (minPoint == null) return []
    startMs = dayjs.utc(minPoint).valueOf()
  }

  // boucle et remplissage
  const out: { date: number; value: number }[] = []
  let cursor = dayjs.utc(startMs)
  const step = { day: 'day', week: 'week', month: 'month', year: 'year' }[
    periodicity
  ] as dayjs.ManipulateType

  // borne de sécurité pour éviter boucles infinies en cas de bug
  const maxSteps = 20000
  let steps = 0

  while (cursor.valueOf() <= endMs && steps < maxSteps) {
    const bucketStart = startOfPeriodUTC(cursor, periodicity)
    out.push({
      date: bucketStart,
      value: points.get(bucketStart) ?? 0,
    })
    cursor = cursor.add(1, step)
    steps++
  }
  return out
}

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

  afterEach(async () => {
    await prisma.matomoStats.deleteMany()
  })

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
      let insertedPoints: Map<number, number> // Map<ms, value>

      beforeEach(async () => {
        const fivePeriodsAgo = dayjs()
          .locale('fr', { weekStart: 1 })
          .endOf(periodicity)
          .subtract(4, periodicity)
          .startOf(periodicity)

        const lastFivePeriods = new Array(5)
          .fill(null)
          .map((_, i) => fivePeriodsAgo.add(i, periodicity))

        insertedPoints = new Map()

        for (const period of lastFivePeriods) {
          const finishedSimulations = faker.number.int({
            min: 1000,
            max: 999999,
          })
          const firstAnswer =
            finishedSimulations + faker.number.int({ min: 100, max: 9999 })
          const visits =
            finishedSimulations * faker.number.int({ min: 3, max: 15 })

          const isoStart = `${period.format('YYYY-MM-DD')}T00:00:00.000Z`
          await upsertStat(
            {
              date: new Date(isoStart),
              device: MatomoStatsDevice.all,
              iframe: false,
              source: MatomoStatsSource.beta,
              kind: StatsKind.all,
              finishedSimulations,
              firstAnswer,
              visits,
            },
            { session: prisma }
          )

          const bucketMs = new Date(isoStart).getTime()
          insertedPoints.set(bucketMs, finishedSimulations) // valeur par période
        }
      })

      test(`Then it returns a ${StatusCodes.OK} response with ${periodicity}ly stats`, async () => {
        const { body } = await agent
          .get(url)
          .query({ periodicity })
          .expect(StatusCodes.OK)

        const expected = buildExpectedZeroFilled(
          periodicity,
          null, // since absent
          insertedPoints
        )

        expect(body).toEqual({
          stats: expected,
          description: 'Nombre de simulations réalisées',
        })
      })

      describe('And since query', () => {
        test(`Then it returns a ${StatusCodes.OK} response with stats since the given periods`, async () => {
          // since strict: on construit la série calendaire N dernières périodes (zéro-remplie)
          const since = faker.number.int({ min: 1, max: 10 }) // libre: pas besoin de le borner à 1..stats.length maintenant

          const { body } = await agent
            .get(url)
            .query({ periodicity, since })
            .expect(StatusCodes.OK)

          const expected = buildExpectedZeroFilled(
            periodicity,
            since,
            insertedPoints
          )

          expect(body).toEqual({
            stats: expected,
            description: 'Nombre de simulations réalisées',
          })
        })

        test(`Then it returns a ${StatusCodes.OK} response with all stats if since is greater than the number of stats`, async () => {
          // Ici, on garde l'esprit du test: since très grand => on attend toute la série depuis le min(data) jusqu'à now (zéro-remplie)
          const since =
            [...insertedPoints.keys()].length +
            faker.number.int({ min: 1, max: 5 })

          const { body } = await agent
            .get(url)
            .query({ periodicity, since })
            .expect(StatusCodes.OK)

          const expected = buildExpectedZeroFilled(
            periodicity,
            since,
            insertedPoints
          )

          expect(body).toEqual({
            stats: expected,
            description: 'Nombre de simulations réalisées',
          })
        })
      })
    })

    describe('And database failure', () => {
      const databaseError = new Error('Something went wrong')

      beforeEach(() => {
        vi.spyOn(Object, 'getOwnPropertyDescriptor').mockReturnValue(undefined)
        vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(databaseError)
      })

      afterEach(() => {
        vi.spyOn(prisma, '$queryRaw').mockRestore()
        vi.spyOn(Object, 'getOwnPropertyDescriptor').mockRestore()
      })

      test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
        await agent.get(url).expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent.get(url)

        expect(logger.error).toHaveBeenCalledWith(
          'Northstar stats fetch failed',
          databaseError
        )
      })
    })
  })
})
