import { orderedCategories } from '@/constants/model/categories'
import type {
  DottedName,
  NGCRulesNodes,
} from '@incubateur-ademe/nosgestesclimat'
import { getSubcategories } from '@nosgestesclimat/core/features/models/helpers/get-subcategories'
import { useMemo } from 'react'

interface Props {
  parsedRules?: NGCRulesNodes
}

export function useCategories({ parsedRules }: Props) {
  const categories = orderedCategories

  const subcategories = useMemo<DottedName[]>(() => {
    return getSubcategories({ categories, parsedRules })
  }, [categories, parsedRules])

  return { categories, subcategories }
}
