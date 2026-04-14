import BarChart from '@/design-system/utils/BarChart'
import type { ReactNode } from 'react'

interface Props {
  title?: string
  icon?: ReactNode
  displayValue: ReactNode
  shouldDisplayValue?: boolean
  percentageOfTotalValue: number
  minTitleWidth?: number
  index?: number
  barColor?: string
}

export default function HorizontalBarChartItemLegacy({
  title,
  icon,
  displayValue,
  shouldDisplayValue = true,
  percentageOfTotalValue,
  minTitleWidth,
  index,
  barColor,
}: Props) {
  return (
    <div className="w-full">
      <div
        className="mb-1.5 flex justify-between text-sm"
        style={{
          minWidth: (minTitleWidth ?? 10) + 'rem',
        }}>
        <div className="flex items-center gap-1">
          {icon} <p className={`mb-0`}>{title}</p>
        </div>
        {shouldDisplayValue && (
          <div className="text-primary-700 mr-4 min-w-20 text-right">
            {displayValue}
          </div>
        )}
      </div>

      <div className="mr-4 flex-1" aria-hidden>
        <BarChart
          type="horizontal"
          value={`${percentageOfTotalValue}%`}
          index={index}
          color={barColor}
        />
      </div>
    </div>
  )
}
