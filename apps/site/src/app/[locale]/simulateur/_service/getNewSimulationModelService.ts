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
  mode = 'standard',
}: {
  searchParams: Promise<SearchParams>
  locale: Locale
  mode?: SimulationMode
}): Promise<Model> {
  const { region: regionParam, PRNumberParam } = await searchParams

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
