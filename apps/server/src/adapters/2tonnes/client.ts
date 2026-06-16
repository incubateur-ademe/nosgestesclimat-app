import axios, { isAxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import * as v from 'valibot'
import { allowedRedirectUrls, config } from '../../config.ts'
import { isSafeRedirectUrl } from '../../core/allowed-urls.ts'
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

const twoTonsAllowedFallbackRedirects = [
  // Allow any path on the same origins as the main app
  ...allowedRedirectUrls.map((u) => u.replace(/\/$/, '/*')),
  // 2tonnes-specific
  'https://app.preprod.2tonnes.tech/*',
  'https://api.preprod.2tonnes.tech/*',
  'https://app.2tonnes.org/*',
  'https://api.2tonnes.org/*',
]

const TwoTonsFallbackSchema = v.strictObject({
  redirect_url: v.pipe(
    v.string(),
    v.check((url) => isSafeRedirectUrl(url, twoTonsAllowedFallbackRedirects))
  ),
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

    const { success, output: data } = v.safeParse(TwoTonsFallbackSchema, {
      redirect_url: params['fallback'],
    })

    if (success) {
      return {
        redirectUrl: data.redirect_url,
      }
    }

    if (typeof params['fallback'] === 'string') {
      throw new InvalidFallbackURLError()
    }

    throw e
  }
}

export class InvalidFallbackURLError extends Error {
  constructor() {
    super('Invalid fallback URL')
    this.name = 'InvalidFallbackURLError'
  }
}
