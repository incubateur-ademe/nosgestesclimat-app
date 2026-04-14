import axios from 'axios'
import axiosRetry from 'axios-retry'
import { z } from 'zod'
import { config } from '../../config.js'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.js'
import type { SituationExportQueryParamsSchema } from '../../features/integrations/integrations.validator.js'
import type { SituationSchema } from '../../features/simulations/simulations.validator.js'

const agir = axios.create({
  baseURL: config.thirdParty.agir.url,
  headers: {
    apikey: config.thirdParty.agir.apiKey,
  },
  timeout: 1000,
})

axiosRetry(agir, {
  retryCondition: isNetworkOrTimeoutOrRetryableError,
  retryDelay: () => 200,
  shouldResetTimeout: true,
})

const AgirResponseSchema = z
  .object({
    redirect_url: z.string(),
  })
  .strict()

export const exportSituation = async (
  situation: SituationSchema,
  _: SituationExportQueryParamsSchema
) => {
  const { data } = await agir.post<{ redirect_url: string }>(
    '/bilan/importFromNGC',
    {
      situation,
    }
  )

  return {
    redirectUrl: AgirResponseSchema.parse(data).redirect_url,
  }
}
