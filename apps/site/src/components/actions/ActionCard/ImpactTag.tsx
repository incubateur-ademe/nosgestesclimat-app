import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Locale } from '@/i18nConfig'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import { twMerge } from 'tailwind-merge'
import Trans from '../../translation/trans/TransServer'
import { shouldDisplayComputationInProgressText } from '../utils/shouldDisplayComputationInProgressText'

export interface ImpactTagProps extends React.ComponentPropsWithoutRef<'span'> {
  impact?: number
  assessmentStatus?: SimulationComputationStatus | null
  locale: Locale
}

export function ImpactTag({
  impact,
  locale,
  className,
  assessmentStatus,
  ...rest
}: ImpactTagProps) {
  let text

  if (
    assessmentStatus &&
    shouldDisplayComputationInProgressText(assessmentStatus)
  ) {
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.impactAssessmentInProgress">
        En cours de calcul
      </Trans>
    )
  } else if (typeof impact === 'number' && impact < 100) {
    const { formattedValue, unit } = formatFootprint(-100, {
      locale,
      shouldUseAbbreviation: true,
      metric: 'carbone',
      unit: 't',
    })
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.lowImpactTag"
        values={{ formattedValue, unit }}>
        Moins de {'{{formattedValue}}'} {'{{unit}}'} CO<sub>2</sub>e / an
      </Trans>
    )
  } else if (typeof impact === 'number') {
    const { formattedValue, unit } = formatFootprint(-1 * impact, {
      locale,
      shouldUseAbbreviation: true,
      metric: 'carbone',
      unit: 't',
    })
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.impactTag"
        values={{ formattedValue, unit }}>
        Jusqu'à {'{{formattedValue}}'} {'{{unit}}'} CO<sub>2</sub>e / an
      </Trans>
    )
  } else {
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.noImpactTag">
        Impact non quantifiable
      </Trans>
    )
  }

  return (
    <span
      className={twMerge(
        `inline-block rounded-xl border border-slate-200 bg-white p-2 py-1.5 text-xs/none! font-bold whitespace-nowrap`,
        className
      )}
      {...rest}>
      {text}
    </span>
  )
}
