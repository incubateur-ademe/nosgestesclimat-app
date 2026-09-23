import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useId } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'
import HighlightedActionCard from './HighlightedActionCard'

interface HighestImpactActionsSectionProps extends React.ComponentPropsWithoutRef<'section'> {
  actions: MaybePersonalizedAction[]
  locale: Locale
  assessmentStatus?: AssessmentStatus | null
  from?: 'fin' | 'mon-espace' | 'index'
  /** Total carbon footprint in kg, used to express each impact as a share of it */
  totalFootprint?: number
  personalized?: boolean
}

export default function HighestImpactActionsSection({
  actions,
  locale,
  className,
  assessmentStatus,
  from,
  totalFootprint,
  personalized,
  ...props
}: HighestImpactActionsSectionProps) {
  const headingId = useId()
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={twMerge('flex flex-col gap-4 md:gap-8', className)}>
      <div>
        <h1
          id={headingId}
          className="mb-0 text-2xl/normal font-bold md:text-3xl/normal">
          <Trans
            locale={locale}
            i18nKey="actions.components.highestImpactActionsSection.testWhiteBackground.title">
            Voici vos 3 actions qui auront le plus d'impact
          </Trans>
        </h1>
        <p className="mb-0 text-lg/normal">
          <Trans
            locale={locale}
            i18nKey="actions.components.highestImpactActionsSection.testWhiteBackground.description">
            C'est ici que se joue l'essentiel de votre empreinte.
          </Trans>
        </p>
      </div>

      <ol className="flex list-none flex-col gap-4 p-0 md:gap-8">
        {actions.map((action, index) => (
          <li key={action.id}>
            <HighlightedActionCard
              action={action}
              locale={locale}
              assessmentStatus={assessmentStatus}
              rank={index + 1}
              from={from}
              totalFootprint={totalFootprint}
              personalized={personalized}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
