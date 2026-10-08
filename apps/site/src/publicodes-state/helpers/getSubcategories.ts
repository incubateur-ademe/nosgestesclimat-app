import _logger from '@/logger/logger.browser'
import type {
  DottedName,
  NGCRule,
  NGCRuleNode,
  NGCRulesNodes,
} from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import getSomme from './getSomme'

const logger = _logger.child({ scope: 'site.engine.getSubcategories' })

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
        logger.warn('No rule found for the category', {
          dottedName: currentValue,
        })
        return accumulator
      }

      const sum = getSomme(rule.rawNode as NGCRule)
      if (!sum) {
        logger.warn('No [somme] found for the category', {
          dottedName: currentValue,
        })
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
