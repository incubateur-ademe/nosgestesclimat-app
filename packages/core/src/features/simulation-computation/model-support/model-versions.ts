import previousPkg from '@incubateur-ademe/nosgestesclimat-previous/package.json' with { type: 'json' }
import currentPkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }

export const CURRENT_MODEL_VERSION = currentPkg.version

/**
 * "Previous" is the model version published right before CURRENT_MODEL_VERSION,
 * kept installed under an npm alias so simulations started before a model
 * release can still be computed after that release ships. Bump the alias in
 * package.json on each model release.
 */
export const PREVIOUS_MODEL_VERSION = previousPkg.version

export type ModelVersionKind = 'current' | 'previous'
