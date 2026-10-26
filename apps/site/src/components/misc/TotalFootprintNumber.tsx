'use client'

import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import useRule from '@/publicodes-state/hooks/useRule/useRule'
import type { Metric } from '@/publicodes-state/types'
import { cn } from 'cn'

type Sizes = 'md' | 'lg'

interface Props {
  metric?: Metric
  className?: string
  size?: Sizes
}

const duration = {
  carbone: <Trans>de CO₂e par an</Trans>,
  eau: <Trans>d'eau par jour</Trans>,
}
export default function TotalFootprintNumber({
  metric = carboneMetric,
  className,
  size = 'md',
}: Props) {
  const locale = useLocale()
  const { t } = useClientTranslation()
  const { numericValue: totalFootprintValue } = useRule('bilan', metric)

  const { formattedValue: formatedTotalFootprintValue, unit } = formatFootprint(
    totalFootprintValue,
    { t, locale, metric }
  )

  return (
    <div
      className={cn('flex flex-col gap-1 md:gap-0', className)}
      aria-live="polite"
      data-testid="total-footprint-number">
      <strong
        className={cn(
          'block text-lg leading-0! font-black md:text-2xl',
          size === 'lg' && 'text-xl md:text-4xl'
        )}>
        {formatedTotalFootprintValue}{' '}
        <span
          className={cn(
            'text-xs font-medium',
            size === 'lg' && 'text-sm md:text-base'
          )}>
          {t(unit ?? '')}
        </span>
      </strong>
      <span
        className={cn(
          'block text-xs leading-none font-medium lg:inline lg:text-sm',
          size === 'lg' && 'text-sm md:text-base'
        )}>
        <span className="xs:inline hidden">{duration[metric]}</span>
      </span>
    </div>
  )
}
