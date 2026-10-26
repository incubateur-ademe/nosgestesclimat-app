import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import {
  parseModel,
  serializeModel,
} from '@nosgestesclimat/core/features/models/helpers/model-versions'
import {
  type Model,
  type ModelLocale,
  type ModelRegion,
  type ModelVersion,
} from '@nosgestesclimat/core/features/models/types/model'
import {
  supportedRegions,
  type Region,
} from '@nosgestesclimat/core/features/region/region.schema'
import type { SimulationMode } from './simulations'

export { supportedRegions }

export type { Model, ModelLocale, ModelRegion, ModelVersion, Region }

export { parseModel }

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
