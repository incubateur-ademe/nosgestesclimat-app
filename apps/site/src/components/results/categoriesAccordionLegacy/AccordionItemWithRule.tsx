'use client'

import HorizontalBarChartItemLegacy from '@/components/charts/HorizontalBarChartItemLegacy'
import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import { endClickCategory } from '@/constants/tracking/pages/end'
import { captureEndClickCategory } from '@/constants/tracking/posthogTrackers'
import Card from '@/design-system/layout/Card'
import AccordionItemLegacy from '@/design-system/layout/accordion/AccordionItemLegacy'
import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getBackgroundColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useEngine, useRule } from '@/publicodes-state'
import type { Metric } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import SubcategoriesList from './accordionItemWithRule/SubcategoriesList'

interface Props {
  dottedName: DottedName
  maxValue: number
  index?: number
  metric?: Metric
}
export default function AccordionItemWithRule({
  dottedName,
  maxValue,
  index,
  metric = carboneMetric,
}: Props) {
  const { title, icons, numericValue } = useRule(dottedName, metric)

  const { subcategories } = useEngine()

  const { t } = useClientTranslation()

  const { formattedValue, unit } = formatFootprint(numericValue, { metric, t })

  const percentageOfTotalValue = (numericValue / maxValue) * 100

  return (
    <AccordionItemLegacy
      onClick={() => {
        trackMatomoEvent__deprecated(endClickCategory(dottedName))
        trackPosthogEvent(captureEndClickCategory({ category: dottedName }))
      }}
      title={
        <HorizontalBarChartItemLegacy
          percentageOfTotalValue={percentageOfTotalValue}
          index={index}
          title={title}
          icon={<Emoji>{icons}</Emoji>}
          barColor={getBackgroundColor(dottedName)}
          shouldDisplayValue={false}
          displayValue={
            <span>
              <strong className="font-black">{formattedValue}</strong>{' '}
              <Trans>{unit}</Trans>
            </span>
          }
        />
      }
      name={title ?? ''}
      ariaLabel={`${title} - ${formattedValue} ${unit}`}
      content={
        <Card
          className="mb-4 border-x-0 bg-gray-100"
          style={{ boxShadow: '0px 6px 6px -2px rgba(21, 3, 35, 0.05) inset' }}>
          <SubcategoriesList
            category={dottedName}
            subcategories={subcategories}
            metric={metric}
          />
        </Card>
      }
    />
  )
}
