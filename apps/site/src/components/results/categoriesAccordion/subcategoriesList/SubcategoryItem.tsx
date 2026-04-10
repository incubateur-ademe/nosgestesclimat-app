import BarChart from '@/design-system/utils/BarChart'
import type { SubcategoryDisplayData } from '@/helpers/getCategoriesDisplayData'
import type { Metric } from '@/publicodes-state/types'
import { capitalizeString } from '@/utils/capitalizeString'
import type { TFunction } from 'i18next'

interface Props {
  subcategory: SubcategoryDisplayData
  bgBarClassName: string
  index?: number
  t: TFunction
  metric: Metric
}

export default function SubcategoryItem({
  subcategory,
  bgBarClassName,
  index = 0,
  t,
  metric,
}: Props) {
  const animationDelay = 0.3 + index * 0.25

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <strong>{capitalizeString(subcategory.title)}</strong>
          <span className="whitespace-nowrap">
            {subcategory.formattedValue}&nbsp;
            <span className={metric === 'eau' ? 'capitalize' : ''}>
              {subcategory.unit}
            </span>
            &nbsp;-&nbsp;
            {subcategory.displayPercentage}
          </span>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden"
          role="img"
          aria-label={t(`Part de la sous-catégorie {{percentage}}`, {
            percentage: subcategory.displayPercentage,
          })}>
          <BarChart
            type="horizontal"
            value={`${subcategory.percentage}%`}
            delay={animationDelay}
            color={bgBarClassName}
            width={6}
          />
        </div>
      </div>
    </li>
  )
}
