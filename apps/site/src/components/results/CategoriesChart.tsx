'use client'

import VerticalBarChart from '@/components/charts/VerticalBarChart'
import { useIsClient } from '@/hooks/useIsClient'
import { useSortedCategoriesByFootprint } from '@/hooks/useSortedCategoriesByFootprint'
import { useRule } from '@/publicodes-state'
import { twMerge } from 'tailwind-merge'
import CategoryChartItem from './categoriesChart/CategoryChartItem'

interface Props {
  className?: string
}
export default function CategoriesChart({ className }: Props) {
  // The engine only exists on the client (see `useEngine`): rendered during
  // hydration, the chart would show its categories where the server rendered an
  // empty list, and React would regenerate the whole tree. Waiting for the
  // mount keeps both renders identical.
  const isClient = useIsClient()

  const { sortedCategories } = useSortedCategoriesByFootprint()
  const { numericValue: firstCategoryValue } = useRule(
    sortedCategories[0] ?? 'logement'
  )

  if (!isClient) {
    return null
  }

  return (
    <VerticalBarChart className={twMerge('md:hidden', className)}>
      {sortedCategories.map((category, index) => (
        <CategoryChartItem
          key={category}
          category={category}
          maxValue={firstCategoryValue}
          index={index}
        />
      ))}
    </VerticalBarChart>
  )
}
