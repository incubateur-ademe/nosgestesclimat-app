import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as v from 'valibot'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.ts'
import logger from '../../logger.ts'
import { MatomoStatsDevice, StatsKind } from '../prisma/generated.ts'

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

const ReferrerBaseSchema = v.strictObject({
  label: v.string(),
  nb_visits: v.number(),
  segment: v.optional(v.string()),
  nb_uniq_visitors: v.optional(v.number()),
  nb_actions: v.optional(v.number()),
  nb_users: v.optional(v.number()),
  max_actions: v.optional(v.number()),
  sum_visit_length: v.optional(v.number()),
  bounce_count: v.optional(v.number()),
  goals: v.optional(v.record(v.string(), v.unknown())),
  nb_visits_converted: v.optional(v.number()),
  nb_conversions: v.optional(v.number()),
  revenue: v.optional(v.number()),
  idsubdatatable: v.optional(v.number()),
})

const ReferrerTypeSchema = v.strictObject({
  ...ReferrerBaseSchema.entries,
  referrer_type: v.enum(ReferrerType),
})

export type ReferrerTypeSchema = v.InferOutput<typeof ReferrerTypeSchema>

const ReferrerWebsiteSchema = ReferrerBaseSchema

export type ReferrerWebsiteSchema = v.InferOutput<typeof ReferrerWebsiteSchema>

const ReferrerCampaignSchema = ReferrerBaseSchema

export type ReferrerCampaignSchema = v.InferOutput<
  typeof ReferrerCampaignSchema
>

const DayVisitSchema = v.strictObject({
  value: v.number(),
})

export type DayVisitSchema = v.InferOutput<typeof DayVisitSchema>

const DayActionSchema = v.object({
  label: v.string(),
  nb_uniq_visitors: v.number(),
  nb_visits: v.union([v.string(), v.number()]),
  nb_events: v.union([v.string(), v.number()]),
  nb_events_with_value: v.union([v.string(), v.number()]),
  sum_event_value: v.number(),
  min_event_value: v.nullable(v.union([v.number(), v.boolean()])),
  max_event_value: v.nullable(v.number()),
  avg_event_value: v.number(),
  segment: v.string(),
  idsubdatatable: v.optional(v.number()),
})

export type DayActionSchema = v.InferOutput<typeof DayActionSchema>

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
            'content-type': 'application/x-www-form-urlencoded',
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
      req.method = 'post'
      req.data = new URLSearchParams({ token_auth: token }).toString()

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

      return v.parse(v.array(ReferrerTypeSchema), data)
    },

    async getReferrersWebsites(date: string) {
      const { data } = await client('/', {
        params: {
          method: 'Referrers.getWebsites',
          period: 'day',
          date,
        },
      })

      return v.parse(v.array(ReferrerWebsiteSchema), data)
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

      const campaigns = v.parse(v.array(ReferrerWebsiteSchema), data)

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
          ...v
            .parse(v.array(ReferrerCampaignSchema), dataWithKeyWords)
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

        const { success, output: safeData } = v.safeParse(DayVisitSchema, data)

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

          const { success, output: safeData } = v.safeParse(
            v.array(DayActionSchema),
            data
          )

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

        const { success, output: safeData } = v.safeParse(
          v.array(DayActionSchema),
          data
        )

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
