import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import type { Model, ModelRegion } from '../../simulations/types/model.ts'
import { resolveVersionKind } from './resolve-version-kind.ts'

const SUPPORTED_REGIONS = new Set(
  Object.keys(supportedRegions) as ModelRegion[]
)

export function isModelSupported(model: Model): boolean {
  return (
    SUPPORTED_REGIONS.has(model.region) && resolveVersionKind(model) !== null
  )
}
