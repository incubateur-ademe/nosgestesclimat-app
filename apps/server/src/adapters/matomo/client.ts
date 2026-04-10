import axios from 'axios'
import axiosRetry from 'axios-retry'
import { z } from 'zod'
import { MatomoStatsDevice, StatsKind } from '../prisma/generated.js'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.js'
import logger from '../../logger.js'

export const ReferrerType = {
  [StatsKind.direct]: 1,
  [StatsKind.search]: 2,
  [StatsKind.website]: 3,
  [StatsKind.campaign]: 6,
  [StatsKind.social]: 7,
  [StatsKind.aiAgent]: 8,
} as const

export const ReferrerKind = {
  1: StatsKind.direct,
  2: StatsKind.search,
  3: StatsKind.website,
  6: StatsKind.campaign,
  7: StatsKind.social,
  8: StatsKind.aiAgent,
} as const

export const MatomoActions = {
  firstAnswer: ['1ère réponse au bilan', 'Simulation First answer'],
  finishedSimulations: ['A terminé la simulation', 'Simulation Completed'],
} as const

export const MatomoActionsSet: Record<
  keyof typeof MatomoActions,
  Set<string>
> = {
  firstAnswer: new Set(MatomoActions.firstAnswer),
  finishedSimulations: new Set(MatomoActions.finishedSimulations),
}

export const MatomoIframeVisits = [
  'visites via iframe',
  'Iframe visit',
] as const

export const MatomoIframeVisitsSet = new Set<string>(MatomoIframeVisits)

const ReferrerBaseSchema = z
  .object({
    label: z.string(),
    nb_visits: z.number(),
    segment: z.string().optional(),
    nb_uniq_visitors: z.number().optional(),
    nb_actions: z.number().optional(),
    nb_users: z.number().optional(),
    max_actions: z.number().optional(),
    sum_visit_length: z.number().optional(),
    bounce_count: z.number().optional(),
    goals: z.record(z.string(), z.unknown()).optional(),
    nb_visits_converted: z.number().optional(),
    nb_conversions: z.number().optional(),
    revenue: z.number().optional(),
    idsubdatatable: z.number().optional(),
  })
  .strict()

const ReferrerTypeSchema = ReferrerBaseSchema.extend({
  referrer_type: z.enum(ReferrerType),
}).strict()

export type ReferrerTypeSchema = z.infer<typeof ReferrerTypeSchema>

const ReferrerWebsiteSchema = ReferrerBaseSchema

export type ReferrerWebsiteSchema = z.infer<typeof ReferrerWebsiteSchema>

const ReferrerCampaignSchema = ReferrerBaseSchema

export type ReferrerCampaignSchema = z.infer<typeof ReferrerCampaignSchema>

const DayVisitSchema = z
  .object({
    value: z.number(),
  })
  .strict()

export type DayVisitSchema = z.infer<typeof DayVisitSchema>

const DayActionSchema = z.object({
  label: z.string(),
  nb_uniq_visitors: z.number(),
  nb_visits: z.union([z.string(), z.number()]),
  nb_events: z.union([z.string(), z.number()]),
  nb_events_with_value: z.union([z.string(), z.number()]),
  sum_event_value: z.number(),
  min_event_value: z.union([z.number(), z.boolean()]).nullable(),
  max_event_value: z.number().nullable(),
  avg_event_value: z.number(),
  segment: z.string(),
  idsubdatatable: z.number().optional(),
})

export type DayActionSchema = z.infer<typeof DayActionSchema>

const getFullSegments = ({
  iframe,
  device,
  segment = '',
}: {
  device?: MatomoStatsDevice | null
  segment?: string
  iframe?: boolean
} = {}) => {
  if (device && device !== MatomoStatsDevice.all) {
    segment += segment ? ';' : ''
    segment += `deviceType==${device}`
  }

  if (iframe) {
    segment += segment ? ';' : ''

    return MatomoIframeVisits.map(
      (visitKind) => `${segment}eventAction==${encodeURIComponent(visitKind)}`
    )
  }

  return [segment]
}

export const matomoClientFactory = ({
  timeout,
  secure,
  siteId,
  token,
  url,
}: {
  siteId: string
  token: string
  url: string
  secure: boolean
  timeout: number
}) => {
  const client = axios.create({
    baseURL: url,
    ...(secure
      ? {
          method: 'post',
          headers: {
            'content-type': 'application/json',
          },
        }
      : {}),
    params: {
      idSite: siteId,
      format: 'json',
      module: 'API',
      ...(secure ? {} : { token_auth: token }),
    },
    timeout,
  })

  if (secure) {
    client.interceptors.request.use((req) => {
      req.data = JSON.stringify({
        token_auth: token,
      })

      return req
    })
  }

  axiosRetry(client, {
    retryCondition: isNetworkOrTimeoutOrRetryableError,
    retryDelay: () => 200,
    shouldResetTimeout: true,
  })

  return {
    async getReferrers(date: string) {
      const { data } = await client('/', {
        params: {
          method: 'Referrers.getReferrerType',
          period: 'day',
          date,
        },
      })

      return z.array(ReferrerTypeSchema).parse(data)
    },

    async getReferrersWebsites(date: string) {
      const { data } = await client('/', {
        params: {
          method: 'Referrers.getWebsites',
          period: 'day',
          date,
        },
      })

      return z.array(ReferrerWebsiteSchema).parse(data)
    },

    async getReferrersCampaigns(date: string) {
      const referrersCampaignsByKeyWord = []

      const { data } = await client('/', {
        params: {
          method: 'Referrers.getCampaigns',
          period: 'day',
          date,
        },
      })

      const campaigns = z.array(ReferrerWebsiteSchema).parse(data)

      for (const campaign of campaigns) {
        const { idsubdatatable: idSubtable } = campaign
        if (!idSubtable) {
          referrersCampaignsByKeyWord.push(campaign)
          continue
        }

        const { data: dataWithKeyWords } = await client('/', {
          params: {
            method: 'Referrers.getKeywordsFromCampaignId',
            idSubtable,
            period: 'day',
            date,
          },
        })

        referrersCampaignsByKeyWord.push(
          ...z
            .array(ReferrerCampaignSchema)
            .parse(dataWithKeyWords)
            .map((referrerWithKeyWords) => ({
              ...referrerWithKeyWords,
              label: `${campaign.label} - ${referrerWithKeyWords.label}`,
            }))
        )
      }

      return referrersCampaignsByKeyWord
    },

    async getDayVisits(
      date: string,
      params?: {
        device?: MatomoStatsDevice | null
        segment?: string
        iframe?: boolean
      }
    ) {
      let segments = getFullSegments(params)

      const dayVisits = { value: 0 }

      for (const segment of segments) {
        const { data } = await client('/', {
          params: {
            method: 'VisitsSummary.getVisits',
            date,
            period: 'day',
            ...(segment ? { segment } : {}),
          },
        })

        const { success, data: safeData } = DayVisitSchema.safeParse(data)

        if (success) {
          dayVisits.value += safeData.value
        } else {
          logger.warn('getDayVisits(): Got invalid DayVisit data', {
            date,
            params,
            data,
          })
        }
      }

      if (params?.iframe && dayVisits.value === 0) {
        segments = getFullSegments({
          ...params,
          iframe: false,
        })

        for (const segment of segments) {
          const { data } = await client('/', {
            params: {
              method: 'Events.getAction',
              date,
              period: 'day',
              'label[]': MatomoIframeVisits.map((visitKind) =>
                encodeURIComponent(visitKind)
              ),
              ...(segment
                ? {
                    segment,
                  }
                : {}),
            },
          })

          const { success, data: safeData } = z
            .array(DayActionSchema)
            .safeParse(data)

          if (success) {
            safeData.forEach(({ label, nb_visits }) => {
              if (MatomoIframeVisitsSet.has(label)) {
                dayVisits.value += +nb_visits || 0
              }
            })
          } else {
            logger.warn('getDayVisits(): Got invalid DayAction data', {
              date,
              params,
              data,
            })
          }
        }
      }

      return dayVisits
    },

    async getDayActions(
      date: string,
      params?: {
        device?: MatomoStatsDevice | null
        segment?: string
        iframe?: boolean
      }
    ) {
      const segments = getFullSegments(params)

      let firstAnswer = 0
      let finishedSimulations = 0

      for (const segment of segments) {
        const { data } = await client('/', {
          params: {
            method: 'Events.getAction',
            'label[]': [
              ...MatomoActions.firstAnswer.map((action) =>
                encodeURIComponent(action)
              ),
              ...MatomoActions.finishedSimulations.map((action) =>
                encodeURIComponent(action)
              ),
            ],
            period: 'day',
            date,
            ...(segment ? { segment } : {}),
          },
        })

        const { success, data: safeData } = z
          .array(DayActionSchema)
          .safeParse(data)

        if (success) {
          safeData.forEach(({ label, nb_visits }) => {
            if (MatomoActionsSet.firstAnswer.has(label)) {
              firstAnswer += +nb_visits || 0
            }

            if (MatomoActionsSet.finishedSimulations.has(label)) {
              finishedSimulations += +nb_visits || 0
            }
          })
        } else {
          logger.warn('getDayActions(): Got invalid DayAction data', {
            date,
            params,
            data,
          })
        }
      }

      return { firstAnswer, finishedSimulations }
    },
  }
}
