import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { MissingFootprintRuleError } from '../errors.ts'
import { getSomme } from './get-somme.ts'
import { getSubcategories } from './get-subcategories.ts'

/** The rule whose value is the footprint of the simulation. */
export const ROOT_DOTTED_NAME: DottedName = 'bilan'

/** The categories the footprint sums, and the subcategories each sums. */
export interface FootprintRules {
  categories: DottedName[]
  subcategories: DottedName[]
}

/**
 * Reads the structure the model gives its footprint: the `bilan` sums its
 * categories, each of which sums its subcategories.
 *
 * The model contract guarantees these rules are public, so they are always part
 * of the rules the server stores and evaluates.
 *
 * Throws when the model has no `bilan`: its footprint structure cannot be read.
 */
export const getFootprintRules = (engine: Engine): FootprintRules => {
  const parsedRules = engine.getParsedRules()
  const rootRule = parsedRules[ROOT_DOTTED_NAME]

  if (!rootRule) {
    throw new MissingFootprintRuleError(ROOT_DOTTED_NAME)
  }

  const categories = getSomme(rootRule.rawNode) ?? ([] as DottedName[])

  const subcategories = getSubcategories({ categories, parsedRules })

  return { categories, subcategories }
}
