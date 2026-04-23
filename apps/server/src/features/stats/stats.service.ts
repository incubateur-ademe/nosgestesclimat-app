import { isAxiosError } from 'axios'
import dayjs from 'dayjs'
import { fetchNewsletter } from '../../adapters/brevo/client.js'
import { ListIds } from '../../adapters/brevo/constant.js'
import { ReferrerKind } from '../../adapters/matomo/client.js'
import { clients } from '../../adapters/matomo/index.js'
import { prisma } from '../../adapters/prisma/client.js'
import {
  MatomoStatsDevice,
  MatomoStatsSource,
  StatsKind,
} from '../../adapters/prisma/generated.js'
import { isPrismaErrorUniqueConstraintFailed } from '../../core/typeguards/isPrismaError.js'
import logger from '../../logger.js'
import {
  createNewsLetterStats,
  getNorthstarStats,
  upsertStat,
} from './stats.repository.js'
import type { NorthstarStatsFetchQuery } from './stats.validator.js'

const NB_VISITS_MIN = 10

type RecoverSource = keyof typeof clients

type BaseParams = {
  source: RecoverSource
  date: string
}

type RecoverIframeDayStats = RecoverDeviceDayStats & {
  iframe: boolean
}

const recoverIframeDayStats = async ({
  source,
  date,
  kind,
  device,
  iframe,
  segment,
  referrer,
  nbVisits,
}: RecoverIframeDayStats) => {
  const client = clients[source]
  const filterParams = {
    device,
    iframe,
    segment,
  }

  const [visits, { firstAnswer, finishedSimulations }] = await Promise.all([
    client.getDayVisits(date, filterParams),
    client.getDayActions(date, filterParams),
  ])

  if (
    visits.value === 0 &&
    typeof nbVisits === 'number' &&
    iframe === false &&
    !device
  ) {
    visits.value = nbVisits
  }

  await upsertStat(
    {
      date: new Date(`${date}T00:00:00.000`),
      source,
      iframe,
      kind: kind || StatsKind.all,
      device: device || MatomoStatsDevice.all,
      ...(referrer ? { referrer } : {}),
      visits: visits.value,
      finishedSimulations,
      firstAnswer,
    },
    { session: prisma }
  )
}

type RecoverDeviceDayStats = RecoverReferrerDayStats & {
  device: MatomoStatsDevice | null
}

const recoverDeviceDayStats = (params: RecoverDeviceDayStats) => {
  return Promise.all([
    recoverIframeDayStats({
      ...params,
      iframe: false,
    }),
    recoverIframeDayStats({
      ...params,
      iframe: true,
    }),
  ])
}

type RecoverReferrerDayStats = BaseParams &
  (
    | {
        kind: StatsKind
        segment?: string
        referrer: string
        nbVisits: number
      }
    | {
        kind: StatsKind
        segment?: string
        referrer: null
        nbVisits?: undefined
      }
    | { kind: null; segment?: undefined; referrer: null; nbVisits?: undefined }
  )

const recoverReferrerDayStats = (params: RecoverReferrerDayStats) =>
  Promise.all(
    [MatomoStatsDevice.desktop, null].map((device) =>
      recoverDeviceDayStats({
        ...params,
        device,
      })
    )
  )

type RecoverKindDayStats = BaseParams &
  ({ kind: StatsKind; segment?: string } | { kind: null; segment?: undefined })

const recoverKindDayStats = async (params: RecoverKindDayStats) => {
  const { source, date, kind } = params
  const client = clients[source]
  switch (kind) {
    case StatsKind.website: {
      const referrersWebsites = await client.getReferrersWebsites(date)
      for (const referrerWebsite of [
        ...referrersWebsites.filter(
          ({ nb_visits }) => nb_visits >= NB_VISITS_MIN
        ),
        null,
      ]) {
        await recoverReferrerDayStats({
          ...params,
          ...(referrerWebsite
            ? {
                referrer: referrerWebsite.label,
                segment: referrerWebsite.segment,
                nbVisits: referrerWebsite.nb_visits,
              }
            : { referrer: null }),
        })
      }
      break
    }
    case StatsKind.campaign: {
      const referrersCampaigns = await client.getReferrersCampaigns(date)
      for (const referrerCampaign of [
        ...referrersCampaigns.filter(
          ({ nb_visits }) => nb_visits >= NB_VISITS_MIN
        ),
        null,
      ]) {
        await recoverReferrerDayStats({
          ...params,
          ...(referrerCampaign
            ? {
                referrer: referrerCampaign.label,
                segment: referrerCampaign.segment,
                nbVisits: referrerCampaign.nb_visits,
              }
            : { referrer: null }),
        })
      }
      break
    }
    default:
      return recoverReferrerDayStats({
        ...params,
        referrer: null,
      })
  }
}

type RecoverSourceDayStatsParams = BaseParams

const recoverSourceDayStats = async ({
  source,
  date,
}: RecoverSourceDayStatsParams) => {
  const client = clients[source]

  for (const referrer of [...(await client.getReferrers(date)), null]) {
    await recoverKindDayStats({
      source,
      ...(referrer
        ? {
            kind: ReferrerKind[referrer.referrer_type],
            segment: referrer.segment,
          }
        : { kind: null }),
      date,
    })
  }
}

export const recoverDayStats = async (date: string) => {
  try {
    const sourcesToRecover = [MatomoStatsSource.beta] as const

    await Promise.all(
      sourcesToRecover.map((source) =>
        recoverSourceDayStats({
          source,
          date,
        })
      )
    )
  } catch (err) {
    logger.error(
      `Stats ${dayjs(date).format('DD/MM/YYYY')} import failed`,
      isAxiosError(err)
        ? {
            code: err.code,
            message: err.message,
            stack: err.stack,
            status: err.status,
          }
        : err
    )
  }
}

export const recoverNewsletterSubscriptions = async (date: string) => {
  try {
    for (const listId of Object.values(ListIds)) {
      try {
        const {
          data: { totalSubscribers },
        } = await fetchNewsletter(listId)

        await createNewsLetterStats(
          {
            listId,
            subscriptions: totalSubscribers,
            date: new Date(`${date}T00:00:00.000Z`),
          },
          { session: prisma }
        )
      } catch (err) {
        if (!isPrismaErrorUniqueConstraintFailed(err)) {
          throw err
        }
        logger.warn(
          `Newsletter ${listId} ${dayjs(date).format('DD/MM/YYYY')} ignored. Value already exists, script is not idempotent`
        )
      }
    }
  } catch (err) {
    logger.error(
      `Newsletter ${dayjs(date).format('DD/MM/YYYY')} import failed`,
      isAxiosError(err)
        ? {
            code: err.code,
            message: err.message,
            stack: err.stack,
            status: err.status,
          }
        : err
    )
  }
}

export const fetchNorthstarStats = async (query: NorthstarStatsFetchQuery) => {
  const stats = await getNorthstarStats(query, { session: prisma })

  return {
    description: 'Nombre de simulations réalisées',
    stats,
  }
}
