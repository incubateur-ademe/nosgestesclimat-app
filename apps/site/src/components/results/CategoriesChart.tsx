'use client'

import VerticalBarChart from '@/components/charts/VerticalBarChart'
import { useSortedCategoriesByFootprint } from '@/hooks/useSortedCategoriesByFootprint'
import { useRule } from '@/publicodes-state'
import { twMerge } from 'tailwind-merge'
import CategoryChartItem from './categoriesChart/CategoryChartItem'

interface Props {
  className?: string
}
export default function CategoriesChart({ className }: Props) {
  const { sortedCategories } = useSortedCategoriesByFootprint()
  const { numericValue: firstCategoryValue } = useRule(
    sortedCategories[0] ?? 'logement'
  )

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
