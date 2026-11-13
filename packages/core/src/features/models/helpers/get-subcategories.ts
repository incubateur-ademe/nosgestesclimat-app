import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { ParsedRules } from 'publicodes'
import { utils } from 'publicodes'
import { getSomme } from './get-somme.ts'

/**
 * Resolves the subcategories the given categories sum, as full dotted names.
 *
 * A `somme` entry is either a full rule name or a partial one read from the
 * category's context; `disambiguateReference` resolves the latter.
 *
 * Returns no subcategory when the rules are not parsed: no engine means no sum
 * to read.
 */
export const getSubcategories = ({
  categories,
  parsedRules,
}: {
  categories: DottedName[]
  parsedRules?: ParsedRules
}): DottedName[] => {
  if (!parsedRules) {
    return []
  }

  const everyRule = Object.keys(parsedRules) as DottedName[]

  return categories.flatMap((category) =>
    (getSomme(parsedRules[category]?.rawNode) ?? []).map(
      (partialName) =>
        (everyRule.includes(partialName)
          ? partialName
          : utils.disambiguateReference(
              parsedRules,
              category,
              partialName
            )) as DottedName
    )
  )
}
