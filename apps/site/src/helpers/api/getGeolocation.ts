import { defaultInitialRegion } from '@/constants/localisation/defaultRegion'
import type { RegionFromGeolocation } from '@/publicodes-state/types'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import { captureException } from '@sentry/nextjs'
import axios, { isAxiosError } from 'axios'
import { MODELE_URL } from '../../constants/urls/main'

type ModelGeolocation = RegionFromGeolocation & {
  region: string
}

const supportedCountryCodes = new Set(Object.keys(supportedRegions))

export async function getGeolocation(): Promise<RegionFromGeolocation> {
  try {
    const { data } = await axios.get<ModelGeolocation>(
      `${MODELE_URL}/geolocation`
    )

    if (supportedCountryCodes.has(data.code)) {
      return data
    }

    if (data.region === 'Europe') {
      return { code: 'EU', name: 'Europe' }
    }

    return defaultInitialRegion
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return defaultInitialRegion
    }

    captureException(err)

    return defaultInitialRegion
  }
}
