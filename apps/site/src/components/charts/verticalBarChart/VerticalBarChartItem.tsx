'use client'

import Badge from '@/design-system/layout/Badge'
import BarChart from '@/design-system/utils/BarChart'
import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getCategoryTitle } from '@/helpers/formatters/getCategoryTitle'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

interface Props {
  value: string
  index: number
  percentage: number
  ariaLabel: string
  title: string
  icons: React.ReactNode
  barColor?: string
  category?: string
  className?: string
}

export default function VerticalBarChartItem({
  value,
  index,
  percentage,
  ariaLabel,
  title,
  icons,
  barColor,
  category,
  className,
  ...props
}: Props) {
  const { t } = useClientTranslation()

  const { formattedValue, unit } = formatFootprint(parseFloat(value) * 1000, {
    maximumFractionDigits: 1,
    shouldUseAbbreviation: true,
    t,
  })

  return (
    <li
      className={twMerge(
        'flex h-full flex-1 flex-col items-center justify-end gap-2',
        className
      )}
      aria-label={ariaLabel}
      {...props}>
      <Badge className="bg-white p-0.5 text-xs" category={category}>
        <strong>{formattedValue}</strong> {unit}
      </Badge>
      <div className="flex items-end">
        <BarChart
          type="vertical"
          value={`calc(${percentage} * 8rem)`}
          index={index}
          color={barColor}
        />
      </div>

      <Emoji
        className="mt-3 text-2xl"
        title={getCategoryTitle({
          ruleTitle: title,
          dottedName: category as DottedName,
          t,
        })}>
        {icons}
      </Emoji>
    </li>
  )
}
