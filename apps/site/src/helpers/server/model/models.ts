import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import {
  supportedRegions,
  type Region,
} from '@nosgestesclimat/core/features/region/region.schema'
import {
  parseModelString,
  serializeModel,
} from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import {
  type Model,
  type ModelLocale,
  type ModelRegion,
  type ModelVersion,
} from '@nosgestesclimat/core/features/simulations/types/model'
import type { SimulationMode } from './simulations'

export { supportedRegions }

export type { Model, ModelLocale, ModelRegion, ModelVersion, Region }

export { parseModelString }

export const CURRENT_MODEL_VERSION = packageJson.version
export const DEFAULT_REGION: Region = 'FR'

export const stringifyModel = serializeModel

export function getCurrentModel({
  mode = 'standard',
  userRegion = 'FR',
  locale,
  PRNumber,
}: {
  mode?: SimulationMode
  userRegion?: Region
  PRNumber?: string
  locale: ModelLocale
}): Model {
  let region: Model['region'] = userRegion
  const version: ModelVersion = PRNumber
    ? { PRNumber }
    : { publishedTag: CURRENT_MODEL_VERSION }

  if (mode === 'scolaire') {
    region = 'ED'
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (mode === 'standard') {
    //
  } else {
    mode satisfies never
  }

  return {
    version,
    region,
    locale,
  }
}
