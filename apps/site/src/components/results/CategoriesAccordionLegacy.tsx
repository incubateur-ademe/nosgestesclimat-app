'use client'

import { carboneMetric } from '@/constants/model/metric'
import Accordion from '@/design-system/layout/Accordion'
import { useSortedCategoriesByFootprint } from '@/hooks/useSortedCategoriesByFootprint'
import { useRule } from '@/publicodes-state'
import type { Metric } from '@/publicodes-state/types'
import AccordionItemWithRule from './categoriesAccordionLegacy/AccordionItemWithRule'

interface Props {
  metric?: Metric
}
export default function CategoriesAccordionLegacy({
  metric = carboneMetric,
}: Props) {
  const { sortedCategories } = useSortedCategoriesByFootprint()

  const { numericValue: maxCategoryValue } = useRule(
    sortedCategories?.[0] ?? '',
    metric
  )

  return (
    <Accordion>
      {sortedCategories.map((categoryDottedName, index) => {
        return (
          <AccordionItemWithRule
            key={categoryDottedName}
            dottedName={categoryDottedName}
            maxValue={maxCategoryValue}
            index={index}
            metric={metric}
          />
        )
      })}
    </Accordion>
  )
}
