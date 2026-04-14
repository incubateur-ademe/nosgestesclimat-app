import type {
  DottedName,
  NGCRule,
  NGCRuleNode,
  NGCRulesNodes,
} from '@incubateur-ademe/nosgestesclimat'
import * as Sentry from '@sentry/nextjs'
import { utils } from 'publicodes'
import getSomme from './getSomme'

export function getSubcategories({
  categories,
  everyRules,
  parsedRules,
  safeGetRule,
}: {
  categories: DottedName[]
  everyRules: DottedName[]
  parsedRules: NGCRulesNodes | undefined
  safeGetRule?: (rule: DottedName) => NGCRuleNode | undefined
}) {
  return categories.reduce(
    (accumulator: DottedName[], currentValue: DottedName) => {
      const subCat: DottedName[] = []

      const rule = safeGetRule?.(currentValue)
      if (!rule) {
        // eslint-disable-next-line no-console
        console.error(
          `[useCategories:subcategories] No rule found for ${currentValue}`
        )
        Sentry.captureMessage(
          `[useCategories:subcategories] No rule found for ${currentValue}`
        )
        return accumulator
      }

      const sum = getSomme(rule.rawNode as NGCRule)
      if (!sum) {
        // eslint-disable-next-line no-console
        console.error(
          `[useCategories:subcategories] No [somme] found for ${currentValue}`
        )
        Sentry.captureMessage(
          `[useCategories:subcategories] No [somme] found for ${currentValue}`
        )
        return accumulator
      }

      for (const rule of sum) {
        // The rule is a full rule, not a shorten one
        if (everyRules.includes(rule)) {
          subCat.push(rule)
        } else {
          subCat.push(
            utils.disambiguateReference(parsedRules || {}, currentValue, rule)
          )
        }
      }
      return [...accumulator, ...subCat]
    },
    [] as DottedName[]
  )
}
