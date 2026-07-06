'use server'

import { MODELE_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import {
  DEFAULT_REGION,
  supportedRegions,
  type Region,
} from '@/helpers/server/model/models'
import { captureException } from '@sentry/nextjs'

export async function getGeolocation(): Promise<Region> {
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
    captureException(e, { level: 'warning' })
    return DEFAULT_REGION
  }
}
