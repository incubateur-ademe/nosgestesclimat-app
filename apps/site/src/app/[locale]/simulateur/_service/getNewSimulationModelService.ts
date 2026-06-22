import { SIMULATION_MODES } from '@/constants/model/simulationModes'
import { getAnonSession } from '@/helpers/server/dal/anonSession'
import {
  getCurrentModel,
  getGeolocation,
  type Model,
  supportedRegions,
  type UserRegion,
} from '@/helpers/server/model/models'
import type { SimulationMode } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { SearchParams } from 'next/dist/server/request/search-params'

export async function getNewSimulationModelService({
  searchParams,
  locale,
  simulationMode = 'standard',
}: {
  searchParams: Promise<SearchParams>
  locale: Locale
  simulationMode?: SimulationMode
}): Promise<Model> {
  const {
    region: regionParam,
    PR: PRNumberParam,
    mode: modeParam,
  } = await searchParams

  let userRegion: UserRegion | undefined
  let PRNumber: string | undefined

  if (
    regionParam &&
    typeof regionParam === 'string' &&
    regionParam in supportedRegions
  ) {
    userRegion = regionParam as UserRegion
  } else {
    userRegion = (await getAnonSession()).region ?? (await getGeolocation())
  }

  if (
    modeParam &&
    typeof modeParam === 'string' &&
    SIMULATION_MODES.includes(modeParam)
  ) {
    simulationMode = modeParam as SimulationMode
  }

  if (PRNumberParam && typeof PRNumberParam === 'string') {
    PRNumber = PRNumberParam
  }

  return getCurrentModel({
    userRegion,
    mode: simulationMode,
    locale,
    PRNumber,
  })
}
