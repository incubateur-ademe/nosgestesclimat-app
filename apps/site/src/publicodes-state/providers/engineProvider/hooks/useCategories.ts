import { orderedCategories } from '@/constants/model/categories'
import { getSubcategories } from '@/publicodes-state/helpers/getSubcategories'
import type {
  DottedName,
  NGCRuleNode,
  NGCRulesNodes,
} from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

interface Props {
  parsedRules?: NGCRulesNodes
  everyRules: DottedName[]
  safeGetRule?: (rule: DottedName) => NGCRuleNode | undefined
}

export function useCategories({ parsedRules, everyRules, safeGetRule }: Props) {
  const categories = orderedCategories

  const subcategories = useMemo<DottedName[]>(() => {
    return getSubcategories({
      categories,
      everyRules,
      parsedRules,
      safeGetRule,
    })
  }, [categories, safeGetRule, everyRules, parsedRules])

  return { categories, subcategories }
}
