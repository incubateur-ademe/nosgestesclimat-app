import type { Model } from '../../simulations/types/model.ts'
import type { ModelVersionKind } from './model-versions.ts'
import {
  CURRENT_MODEL_VERSION,
  PREVIOUS_MODEL_VERSION,
} from './model-versions.ts'

export function resolveVersionKind(model: Model): ModelVersionKind | null {
  if (!('publishedTag' in model.version)) {
    return null
  }
  if (model.version.publishedTag === CURRENT_MODEL_VERSION) {
    return 'current'
  }
  if (model.version.publishedTag === PREVIOUS_MODEL_VERSION) {
    return 'previous'
  }
  return null
}
