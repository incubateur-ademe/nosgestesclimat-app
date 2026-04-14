import { useEngine } from '@/publicodes-state'
import { useMemo } from 'react'

export function useSortedCategoriesByFootprint() {
  const { getNumericValue, categories } = useEngine()

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => getNumericValue(category))
  }, [categories, getNumericValue])

  const sortedCategories = useMemo(() => {
    return filteredCategories.sort((categoryA, categoryB) => {
      const valueA = getNumericValue(categoryA) ?? 0
      const valueB = getNumericValue(categoryB) ?? 0

      return valueB - valueA
    })
  }, [filteredCategories, getNumericValue])

  return {
    sortedCategories,
  }
}
