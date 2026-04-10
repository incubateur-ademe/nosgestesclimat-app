'use client'

import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import Loader from '@/design-system/layout/Loader'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import { useActions, useEngine, useRule } from '@/publicodes-state'
import type { Metric } from '@/publicodes-state/types'
import { twMerge } from 'tailwind-merge'

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

  const { isInitialized } = useEngine()

  const { numericValue: totalFootprintValue } = useRule('bilan', metric)

  const { totalChosenActionsValue } = useActions()

  const totalFootprintValueMinusActions =
    totalFootprintValue - totalChosenActionsValue

  const { formattedValue: formattedValueMinusActions, unit } = formatFootprint(
    totalFootprintValueMinusActions,
    { t, locale, metric }
  )

  const { formattedValue: formatedTotalFootprintValue } = formatFootprint(
    totalFootprintValue,
    { t, locale, metric }
  )

  const shouldDisplayTotalWithoutActions =
    totalFootprintValue !== totalFootprintValueMinusActions

  return (
    <div
      className={twMerge('flex flex-col gap-1 md:gap-0', className)}
      aria-live="polite"
      data-testid="total-footprint-number">
      {shouldDisplayTotalWithoutActions && (
        <strong
          className={twMerge(
            'mr-4 block leading-0! font-black text-slate-500 line-through md:text-xl',
            size === 'lg' && 'text-xl md:text-3xl'
          )}>
          {!isInitialized ? '--' : formatedTotalFootprintValue}
        </strong>
      )}
      {isInitialized ? (
        <strong
          className={twMerge(
            'block text-lg leading-0! font-black md:text-2xl',
            size === 'lg' && 'text-xl md:text-4xl'
          )}>
          {formattedValueMinusActions}{' '}
          <span
            className={twMerge(
              'text-xs font-medium',
              size === 'lg' && 'text-sm md:text-base'
            )}>
            {t(unit ?? '')}
          </span>
        </strong>
      ) : (
        <div className="px-2">
          <Loader
            color="dark"
            size="sm"
            ariaLabel="Chargement de l'empreinte carbone"
          />
        </div>
      )}
      <span
        className={twMerge(
          'block text-xs leading-none font-medium lg:inline lg:text-sm',
          size === 'lg' && 'text-sm md:text-base'
        )}>
        <span className="xs:inline hidden">{duration[metric]}</span>
      </span>
    </div>
  )
}
