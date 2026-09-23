'use server'

import { MODELE_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import {
  DEFAULT_REGION,
  supportedRegions,
  type Region,
} from '@/helpers/server/model/models'
import { toError } from '@nosgestesclimat/core/lib/to-error'

import logger from '@/logger.server'

export const getGeolocation = async (): Promise<Region> =>
  await logger.withSpan('site.service.getGeolocation', async () => {
    try {
      const geo = await fetchServer<{ code: string; region: string }>(
        `${MODELE_URL}/geolocation`
      )
      if (geo.code in supportedRegions) {
        return geo.code as Region
      }
      if (geo.region === 'Europe') {
        return 'EU'
      }
      return DEFAULT_REGION
    } catch (e) {
      logger.warn(toError(e))
      return DEFAULT_REGION
    }
  })
