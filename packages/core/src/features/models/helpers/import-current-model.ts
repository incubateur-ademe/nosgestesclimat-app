import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import rulesOpti from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr-opti.json' with { type: 'json' }

import { getModelFileName } from './get-model-file-name.ts'

const OPTIMIZED_FR_FILENAME = getModelFileName({
  region: 'FR',
  locale: 'fr',
  isOptim: true,
})

/**
 * Imports a model file of the currently installed model from the
 * `@incubateur-ademe/nosgestesclimat` package installed in node_modules.
 *
 * The optimized FR rule set is statically imported so it ships in the
 * bundle instead of being fetched at runtime; it is a subset of the model -
 * some rules are voluntarily removed - so we accept to lose some type
 * soundness here for increased bundle clarity. Every other file is
 * dynamically imported.
 */
export async function importCurrentModel(fileName: string): Promise<NGCRules> {
  if (fileName === OPTIMIZED_FR_FILENAME) {
    return rulesOpti as unknown as NGCRules
  }

  const model = await import(
    `@incubateur-ademe/nosgestesclimat/public/${fileName}`,
    { with: { type: 'json' } }
  )
  return model.default as NGCRules
}
