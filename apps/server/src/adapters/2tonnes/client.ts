import axios, { isAxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import * as v from 'valibot'
import { config } from '../../config.ts'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.ts'
import type { SituationExportQueryParamsSchema } from '../../features/integrations/integrations.validator.ts'
import type { SituationSchema } from '../../features/simulations/simulations.validator.ts'

const twoTons = axios.create({
  baseURL: config.thirdParty.twoTons.url,
  headers: {
    Authorization: `Bearer ${config.thirdParty.twoTons.bearerToken}`,
  },
  timeout: 1000,
})

axiosRetry(twoTons, {
  retryCondition: isNetworkOrTimeoutOrRetryableError,
  retryDelay: () => 200,
  shouldResetTimeout: true,
})

const TwoTonsResponseSchema = v.strictObject({
  redirect_url: v.string(),
})

export const exportSituation = async (
  situation: SituationSchema,
  params: SituationExportQueryParamsSchema
) => {
  try {
    const { data } = await twoTons.post<{ redirect_url: string }>(
      '/api/v1/ngc-carbon-form-answers',
      {
        situation,
      },
      {
        params,
      }
    )

    return {
      redirectUrl: v.parse(TwoTonsResponseSchema, data).redirect_url,
    }
  } catch (e) {
    if (isAxiosError(e) && e.response?.data) {
      const { success, output: data } = v.safeParse(
        TwoTonsResponseSchema,
        e.response.data
      )

      if (success) {
        return {
          redirectUrl: data.redirect_url,
        }
      }
    }

    const { success, output: data } = v.safeParse(TwoTonsResponseSchema, {
      redirect_url: params['fallback'],
    })

    if (success) {
      return {
        redirectUrl: data.redirect_url,
      }
    }

    throw e
  }
}
