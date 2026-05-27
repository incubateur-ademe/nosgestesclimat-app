import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as v from 'valibot'
import { config } from '../../config.ts'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.ts'
import type { SituationExportQueryParamsSchema } from '../../features/integrations/integrations.validator.ts'
import type { SituationSchema } from '../../features/simulations/simulations.validator.ts'

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

const AgirResponseSchema = v.strictObject({
  redirect_url: v.string(),
})

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
    redirectUrl: v.parse(AgirResponseSchema, data).redirect_url,
  }
}
