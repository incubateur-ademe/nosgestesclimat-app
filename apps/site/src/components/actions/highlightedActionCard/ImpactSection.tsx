'use client'

import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useLocale } from '@/hooks/useLocale'
import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { ActionAssessment } from '@nosgestesclimat/core/features/actions/types/action'
import { Trans } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { useActionContext } from '../contexts/action'
import { shouldDisplayComputationInProgressText } from '../utils/shouldDisplayComputationInProgressText'

interface Props {
  totalFootprint?: number
  classes: Record<'card' | 'panel' | 'value', string>
  assessment?: ActionAssessment
}

export default function ImpactSection({
  totalFootprint,
  classes,
  assessment,
}: Props) {
  const { assessmentStatus } = useActionContext()
  const locale = useLocale()

  if (!assessmentStatus || !assessment) return null

  return (
    <div
      className={twMerge(
        'flex flex-col justify-center gap-0.5 border-t border-slate-100 px-6 py-6 md:w-75 md:border-t-0 md:border-l',
        classes.panel
      )}>
      <p className="mb-0 text-sm/normal font-bold text-slate-600 uppercase">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.highlighted.potentialImpact">
          Impact potentiel
        </Trans>
      </p>
      <ImpactValue
        impact={assessment.impact}
        locale={locale}
        valueClassName={classes.value}
        assessmentStatus={assessmentStatus}
      />
      <FootprintShare
        impact={assessment.impact}
        totalFootprint={totalFootprint}
        locale={locale}
      />
    </div>
  )
}

interface ImpactValueProps {
  impact?: number
  assessmentStatus: AssessmentStatus
  locale: Locale
  valueClassName: string
}

function ImpactValue({
  impact,
  locale,
  assessmentStatus,
  valueClassName,
}: ImpactValueProps) {
  if (shouldDisplayComputationInProgressText(assessmentStatus)) {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.impactAssessmentInProgress">
          En cours de calcul
        </Trans>
      </p>
    )
  }

  if (typeof impact !== 'number') {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.noImpactTag">
          Impact non quantifiable
        </Trans>
      </p>
    )
  }

  const { formattedValue, unit } = formatFootprint(impact, {
    locale,
    shouldUseAbbreviation: true,
    metric: 'carbone',
    unit: 't',
  })

  return (
    <p className="mb-0 flex items-baseline gap-1.5 whitespace-nowrap">
      <span
        className={twMerge(
          'text-[2rem]/none font-extrabold tracking-[-0.9px] md:text-5xl/none',
          valueClassName
        )}>
        {formattedValue} {unit}
      </span>
      <span className="text-xs/none font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.highlighted.impactUnit">
          CO<sub>2</sub>e / an
        </Trans>
      </span>
    </p>
  )
}

interface FootprintShareProps {
  impact?: number
  totalFootprint?: number
  locale: Locale
}

function FootprintShare({
  impact,
  totalFootprint,
  locale,
}: FootprintShareProps) {
  if (
    typeof impact !== 'number' ||
    typeof totalFootprint !== 'number' ||
    totalFootprint <= 0
  ) {
    return null
  }

  const percentage = Math.round((impact / totalFootprint) * 100)

  if (percentage <= 0) {
    return null
  }

  return (
    <p className="mb-0 text-sm/normal font-bold text-slate-600">
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.highlighted.footprintShare"
        values={{ percentage }}>
        soit {'{{percentage}}'} % de votre empreinte totale
      </Trans>
    </p>
  )
}
