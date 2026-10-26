'use client'

import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useLocale } from '@/hooks/useLocale'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { ActionAssessment } from '@nosgestesclimat/core/features/actions/types/action'
import type { ThemeKey } from '@nosgestesclimat/core/features/actions/types/theme'
import { cn } from 'cn'
import { Trans } from 'react-i18next'
import type { ActionCatalogueContext } from '../types/actions'
import { shouldDisplayComputationInProgressText } from '../utils/shouldDisplayComputationInProgressText'
import { classesByTheme } from './impactSection/classes-by-theme'

interface Props {
  themeKey: ThemeKey
  assessment?: ActionAssessment | null
  actionCatalogueContext: ActionCatalogueContext
  className?: string
}

export default function ImpactSection({
  themeKey,
  assessment,
  actionCatalogueContext,
  className,
}: Props) {
  const classes = classesByTheme[themeKey]

  if (
    !actionCatalogueContext.assessmentStatus ||
    !actionCatalogueContext.totalFootprint ||
    !assessment
  )
    return null

  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-0.5 rounded-lg border-slate-100 px-6 py-6 md:w-75 md:rounded-none md:border-l',
        classes.panel,
        className
      )}>
      <p className="mb-0 text-sm/normal font-bold text-slate-600 uppercase">
        <Trans i18nKey="actions.components.actionCard.highlighted.potentialImpact">
          Impact potentiel
        </Trans>
      </p>
      <ImpactValue
        impact={assessment.impact}
        valueClassName={classes.value}
        assessmentStatus={actionCatalogueContext.assessmentStatus}
      />
      <FootprintShare
        impact={assessment.impact}
        totalFootprint={actionCatalogueContext.totalFootprint}
      />
    </div>
  )
}

interface ImpactValueProps {
  impact?: number
  assessmentStatus: AssessmentStatus
  valueClassName: string
}

function ImpactValue({
  impact,
  assessmentStatus,
  valueClassName,
}: ImpactValueProps) {
  const locale = useLocale()
  if (shouldDisplayComputationInProgressText(assessmentStatus)) {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans i18nKey="actions.components.actionCard.impactAssessmentInProgress">
          En cours de calcul
        </Trans>
      </p>
    )
  }

  if (typeof impact !== 'number') {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans i18nKey="actions.components.actionCard.noImpactTag">
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
        className={cn(
          'text-[2rem]/none font-extrabold tracking-[-0.9px] md:text-5xl/none',
          valueClassName
        )}>
        {formattedValue} {unit}
      </span>
      <span className="text-xs/none font-bold text-slate-600">
        <Trans i18nKey="actions.components.actionCard.highlighted.impactUnit">
          CO<sub>2</sub>e / an
        </Trans>
      </span>
    </p>
  )
}

interface FootprintShareProps {
  impact?: number
  totalFootprint?: number
}

function FootprintShare({ impact, totalFootprint }: FootprintShareProps) {
  if (
    typeof impact !== 'number' ||
    typeof totalFootprint !== 'number' ||
    totalFootprint <= 0
  ) {
    return null
  }

  const percentage = Math.round((impact / totalFootprint) * 100)

  if (percentage === 0) {
    return null
  }

  return (
    <p className="mb-0 text-sm/normal font-bold text-slate-600">
      <Trans
        i18nKey="actions.components.actionCard.highlighted.footprintShare"
        values={{ percentage }}>
        soit {'{{percentage}}'} % de votre empreinte totale
      </Trans>
    </p>
  )
}
