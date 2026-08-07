import { SIMULATION_MODES } from '@/constants/model/simulationModes'
import { getLocaleFromHeaders } from '@/helpers/server/getLocaleForNotFoundOrUnautorizedPage'
import {
  getCurrentModel,
  stringifyModel,
  supportedRegions,
  type Model,
  type Region,
} from '@/helpers/server/model/models'
import type { SimulationMode } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getGeolocation } from '@/services/geolocation/get-geolocation'
import { getRegion } from '@/services/users/region'
import type { SearchParams } from 'next/dist/server/request/search-params'

interface ResolveNewSimulationModelOptions {
  searchParams?: Promise<SearchParams>
  locale?: Locale
  mode?: SimulationMode
}

/**
 * The single source of truth for the model a *new* simulation should use.
 *
 * The model can only be resolved server-side: the region lives in an httpOnly
 * cookie (surfaced as the `x-region` header by the proxy), the fallback is a
 * geolocation fetch, and the version is the build-time version of the
 * `@incubateur-ademe/nosgestesclimat` package. Callable from server components
 * and from server actions alike — `locale` defaults to the request headers.
 */
export async function resolveNewSimulationModel({
  searchParams,
  locale,
  mode = 'standard',
}: ResolveNewSimulationModelOptions = {}): Promise<Model> {
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
    locale: locale ?? (await getLocaleFromHeaders()),
    PRNumber,
  })
}

/**
 * {@link resolveNewSimulationModel}, serialized. Most consumers store the model
 * on a simulation, which holds it as a string.
 */
export async function resolveNewSimulationModelString(
  options: ResolveNewSimulationModelOptions = {}
): Promise<string> {
  return stringifyModel(await resolveNewSimulationModel(options))
}
