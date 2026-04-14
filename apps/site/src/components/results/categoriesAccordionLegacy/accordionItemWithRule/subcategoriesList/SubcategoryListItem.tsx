'use client'

import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { Metric } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  subcategory: DottedName
  categoryValue: number
  metric?: Metric
}

export default function SubcategoryListItem({
  subcategory,
  categoryValue,
  metric = carboneMetric,
}: Props) {
  const { numericValue, title, icons } = useRule(subcategory, metric)

  const { t } = useClientTranslation()

  const { formattedValue, unit } = formatFootprint(numericValue, { metric, t })
  if (formattedValue === '0') return null

  const percentageOfCategoryValue =
    1 - (categoryValue - numericValue) / categoryValue

  return (
    <li className="p-3" role="listitem">
      <div className="flex items-baseline gap-4">
        {/* @bjlaa: flex w-4 is required here because of a bug of react-easy-emoji that creates a duplicate empty element */}
        <Emoji className="flex w-4">{icons}</Emoji>

        <div className="w-full">
          <div className="flex items-center justify-between text-sm md:text-base">
            <p className="mb-0">{title}</p>

            <div className="text-primary-700">
              <strong>{formattedValue}</strong> <Trans>{unit}</Trans>
            </div>
          </div>
          <div className="mt-2">
            <div
              role="img"
              aria-label={`Part de la sous-catégorie: ${Math.round(
                percentageOfCategoryValue * 100
              )}%`}>
              <div
                className="bg-primary-700 h-[6px] rounded-xl"
                style={{ width: `calc(${percentageOfCategoryValue} * 100%)` }}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
