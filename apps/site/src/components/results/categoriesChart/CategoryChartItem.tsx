'use client'

import VerticalBarChartItem from '@/components/charts/verticalBarChart/VerticalBarChartItem'
import { getCategoryTitle } from '@/helpers/formatters/getCategoryTitle'
import { getBackgroundColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { formatValue } from 'publicodes'

export default function CategoryChartItem({
  category,
  maxValue,
  index,
}: {
  category: DottedName
  maxValue: number
  index: number
}) {
  const { t } = useClientTranslation()

  const { numericValue, icons, title } = useRule(category)

  const categoryTitle = getCategoryTitle({
    ruleTitle: title ?? '',
    dottedName: category,
    t,
  })

  const percentageOfMaxValue = 1 - (maxValue - numericValue) / maxValue

  const formattedValue = formatValue(numericValue / 1000, { precision: 1 })

  return (
    <VerticalBarChartItem
      value={formattedValue}
      index={index}
      percentage={percentageOfMaxValue}
      ariaLabel={t(
        'La catégorie {{categoryTitle}} représente {{formattedValue}} tonnes de CO₂e.',
        { formattedValue, categoryTitle }
      )}
      barColor={getBackgroundColor(category)}
      title={categoryTitle ?? ''}
      icons={icons}
    />
  )
}
