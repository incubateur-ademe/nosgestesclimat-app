import {
  MatomoStatsDevice,
  MatomoStatsSource,
  Prisma,
  StatsKind,
} from '../../adapters/prisma/generated.js'
import type { ListIds } from '../../adapters/brevo/constant.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import type { PERIODS } from './stats.constant.js'

export const upsertStat = (
  {
    date,
    kind,
    device,
    iframe,
    source,
    referrer,
    visits,
    finishedSimulations,
    firstAnswer,
  }: {
    date: Date
    source: MatomoStatsSource
    kind: StatsKind
    referrer?: string
    device: MatomoStatsDevice
    iframe: boolean
    visits: number
    firstAnswer: number
    finishedSimulations: number
  },
  { session }: { session: Session }
) => {
  return session.matomoStats.upsert({
    where: {
      date_source_kind_referrer_device_iframe: {
        date,
        kind,
        iframe,
        device,
        source,
        referrer: referrer || 'all',
      },
    },
    update: {
      visits,
      firstAnswer,
      finishedSimulations,
    },
    create: {
      date,
      kind,
      iframe,
      device,
      source,
      referrer,
      visits,
      firstAnswer,
      finishedSimulations,
    },
  })
}

export const createNewsLetterStats = (
  {
    listId,
    subscriptions,
    date,
  }: { listId: ListIds; subscriptions: number; date: Date },
  { session }: { session: Session }
) => {
  return session.brevoNewsletterStats.create({
    data: {
      date,
      newsletter: listId,
      subscriptions,
    },
  })
}

export type NorthstarStat = {
  /**
   * Timestamp (in ms) of the start of the period (UTC)
   */
  date: number
  value: number
}

export const getNorthstarStats = (
  { periodicity, since }: { periodicity: PERIODS; since: number | null },
  { session }: { session: Session }
) => {
  const unit = Prisma.raw(`'${periodicity}'`)
  const oneUnit = Prisma.raw(`INTERVAL '1 ${periodicity}'`)

  return session.$queryRaw<NorthstarStat[]>(
    Prisma.sql`
      WITH
      filters AS (
        SELECT
          cast(${MatomoStatsSource.beta} as ngc."MatomoStatsSource") AS src,
          cast(${StatsKind.all} as ngc."StatsKind")                  AS knd,
          cast(${MatomoStatsDevice.all} as ngc."MatomoStatsDevice")  AS dev
      ),
      min_trunc AS (
        SELECT date_trunc(
                ${unit},
                (MIN(m.date)::timestamp AT TIME ZONE 'UTC')
              ) AS first_period
        FROM "ngc"."MatomoStats" m, filters f
        WHERE m."source" = f.src
          AND m."kind"   = f.knd
          AND m."referrer" = 'all'
          AND m."device" = f.dev
          AND m."iframe" = false
      ),
      bounds AS (
        SELECT
          CASE
            WHEN ${since}::int IS NOT NULL
              THEN date_trunc(${unit}, now()) - ((${since}::int - 1) * ${oneUnit})
            ELSE (SELECT first_period FROM min_trunc)
          END AS start_at,
          CASE
            WHEN ${since}::int IS NOT NULL
              THEN date_trunc(${unit}, now())
            ELSE CASE WHEN (SELECT first_period FROM min_trunc) IS NOT NULL
              THEN date_trunc(${unit}, now())
              ELSE NULL
            END
          END AS end_at
      ),
      period_intervals AS (
        SELECT gs AS start_period_utc
        FROM bounds b
        CROSS JOIN LATERAL generate_series(b.start_at, b.end_at, ${oneUnit}) AS gs
        WHERE b.start_at IS NOT NULL AND b.end_at IS NOT NULL
      ),
      period_data AS (
        SELECT
          date_trunc(${unit}, (m.date::timestamp AT TIME ZONE 'UTC')) AS start_period_utc,
          SUM(m."finishedSimulations")::int AS value
        FROM "ngc"."MatomoStats" m, filters f, bounds b
        WHERE m."source" = f.src
          AND m."kind"   = f.knd
          AND m."referrer" = 'all'
          AND m."device" = f.dev
          AND m."iframe" = false
          AND date_trunc(${unit}, (m.date::timestamp AT TIME ZONE 'UTC')) >= b.start_at
          AND date_trunc(${unit}, (m.date::timestamp AT TIME ZONE 'UTC')) <= b.end_at
        GROUP BY 1
      )
      SELECT
        (EXTRACT(EPOCH FROM pi.start_period_utc) * 1000)::double precision AS "date",
        COALESCE(pd.value, 0) AS "value"
      FROM period_intervals pi
      LEFT JOIN period_data pd USING (start_period_utc)
      ORDER BY pi.start_period_utc;
    `
  )
}
