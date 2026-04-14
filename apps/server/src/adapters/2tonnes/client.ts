import axios, { isAxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { z } from 'zod'
import { config } from '../../config.js'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.js'
import type { SituationExportQueryParamsSchema } from '../../features/integrations/integrations.validator.js'
import type { SituationSchema } from '../../features/simulations/simulations.validator.js'

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

const TwoTonsResponseSchema = z
  .object({
    redirect_url: z.string(),
  })
  .strict()

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
      redirectUrl: TwoTonsResponseSchema.parse(data).redirect_url,
    }
  } catch (e) {
    if (isAxiosError(e) && e.response?.data) {
      const { success, data } = TwoTonsResponseSchema.safeParse(e.response.data)

      if (success) {
        return {
          redirectUrl: data.redirect_url,
        }
      }
    }

    const { success, data } = TwoTonsResponseSchema.safeParse({
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
