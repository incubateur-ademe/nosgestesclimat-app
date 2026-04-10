'use client'

import { carboneMetric } from '@/constants/model/metric'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useGetDifference } from '@/hooks/simulation/useGetDifference'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export default function ValueChangeDisplay({
  className,
  metric = carboneMetric,
  size = 'sm',
}: {
  className?: string
  metric?: Metrics
  size?: 'sm' | 'md'
}) {
  const { t } = useClientTranslation()
  const locale = useLocale()

  const pathname = usePathname()

  const { difference, updateKey } = useGetDifference({
    metric,
  })

  const isNegative = difference < 0

  const { formattedValue, unit } = formatFootprint(difference, {
    locale,
    metric,
    t,
  })

  if (difference === 0 || !pathname.includes('simulateur/bilan')) {
    return null
  }

  return (
    <div
      className={twMerge(
        'absolute -top-0.5 right-2 -z-0 w-auto whitespace-nowrap sm:top-1',
        isNegative
          ? 'animate-valuechange-reverse text-green-700 motion-reduce:animate-none'
          : 'animate-valuechange text-red-700 motion-reduce:animate-none',
        className
      )}
      key={updateKey}
      aria-label={t(
        '{{signe}} {{value}} {{unit}} sur votre empreinte {{metric}}',
        {
          signe: isNegative ? t('moins') : t('plus'),
          value: formattedValue,
          unit,
          metric: metric === 'carbone' ? t('carbone') : t('eau'),
        }
      )}>
      <span
        className={twMerge(
          'text-xs font-semibold sm:text-sm',
          size === 'md' ? 'text-base' : ''
        )}>
        {difference > 0 ? '+' : ''}
        {formattedValue}
      </span>{' '}
      <span
        className={twMerge(
          'text-xs font-normal',
          size === 'md' ? 'text-sm' : ''
        )}>
        {unit}
      </span>
    </div>
  )
}
