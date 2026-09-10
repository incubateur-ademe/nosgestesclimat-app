import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as v from 'valibot'
import { config } from '../../config.ts'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.ts'
import type { PERIODS } from '../../features/stats/stats.constant.ts'
import { PosthogEndpoint } from './constant.ts'

const posthog = axios.create({
  baseURL: config.thirdParty.posthog.url,
  headers: {
    Authorization: `Bearer ${config.thirdParty.posthog.personalApiKey}`,
  },
  timeout: 5_000,
})

axiosRetry(posthog, {
  retryCondition: isNetworkOrTimeoutOrRetryableError,
  retryDelay: () => 200,
  shouldResetTimeout: true,
})

const PosthogEndpointRunResponseSchema = v.object({
  results: v.array(v.tuple([v.number(), v.number()])),
})

export type NorthstarStat = {
  /**
   * Timestamp (in ms) of the start of the period (UTC)
   */
  date: number
  value: number
}

const runEndpoint = async (
  endpoint: PosthogEndpoint,
  variables: Record<string, string | number>
) => {
  const { data } = await posthog.post<
    v.InferOutput<typeof PosthogEndpointRunResponseSchema>
  >(
    `/api/projects/${config.thirdParty.posthog.projectId}/endpoints/${endpoint}/run`,
    {
      variables,
    }
  )

  const { results } = v.parse(PosthogEndpointRunResponseSchema, data)

  return results.map(
    ([date, value]): NorthstarStat => ({
      date,
      value,
    })
  )
}

export const fetchNorthstarStats = ({
  periodicity,
  since,
}: {
  periodicity?: PERIODS
  since?: number
}) => {
  return runEndpoint(PosthogEndpoint.northstarStats, {
    ...(periodicity ? { periodicity } : {}),
    ...(since ? { since } : {}),
  })
}
