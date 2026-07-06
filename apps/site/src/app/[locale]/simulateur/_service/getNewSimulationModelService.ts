import { SIMULATION_MODES } from '@/constants/model/simulationModes'
import {
  getCurrentModel,
  supportedRegions,
  type Model,
  type Region,
} from '@/helpers/server/model/models'
import type { SimulationMode } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getGeolocation } from '@/services/geolocation/get-geolocation'
import { getRegion } from '@/services/users/region'
import type { SearchParams } from 'next/dist/server/request/search-params'

export async function getNewSimulationModelService({
  searchParams,
  locale = 'fr',
  mode = 'standard',
}: {
  searchParams?: Promise<SearchParams>
  locale?: Locale
  mode?: SimulationMode
} = {}): Promise<Model> {
  const {
    region: regionParam,
    PR: PRNumberParam,
    mode: modeParam,
  } = (await searchParams) ?? {}

  let userRegion: Region | undefined
  let PRNumber: string | undefined

  if (
    regionParam &&
    typeof regionParam === 'string' &&
    regionParam in supportedRegions
  ) {
    userRegion = regionParam as Region
  } else {
    userRegion = (await getRegion())?.current ?? (await getGeolocation())
  }

  if (
    modeParam &&
    typeof modeParam === 'string' &&
    SIMULATION_MODES.includes(modeParam)
  ) {
    mode = modeParam as SimulationMode
  }

  if (PRNumberParam && typeof PRNumberParam === 'string') {
    PRNumber = PRNumberParam
  }

  return getCurrentModel({
    userRegion,
    mode,
    locale,
    PRNumber,
  })
}
