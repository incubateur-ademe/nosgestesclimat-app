import type { Locale } from '@/i18nConfig'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { useId } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'
import HighlightedActionCard from './HighlightedActionCard'

/**
 * Same indigo treatment as the control section, which is the product's existing
 * "dark blue" background for this block.
 */
const DARK_BACKGROUND =
  'linear-gradient(90deg, rgba(26,26,26,0.2), rgba(26,26,26,0.2)), linear-gradient(114deg, var(--color-indigo-900) 0%, var(--color-indigo-600) 100%)'

interface HighestImpactActionsSectionDarkBackgroundProps extends React.ComponentPropsWithoutRef<'section'> {
  actions: MaybePersonalizedAction[]
  locale: Locale
  assessmentStatus?: AssessmentStatus | null
  from?: 'fin' | 'mon-espace' | 'index'
  /** Total carbon footprint in kg, used to express each impact as a share of it */
  totalFootprint?: number
}

export default function HighestImpactActionsSectionDarkBackground({
  actions,
  locale,
  className,
  assessmentStatus,
  from,
  totalFootprint,
  ...props
}: HighestImpactActionsSectionDarkBackgroundProps) {
  const headingId = useId()
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={twMerge(
        '-mx-4 flex flex-col gap-4 px-4 py-6 md:mx-0 md:gap-8 md:rounded-2xl md:p-8',
        className
      )}
      style={{ background: DARK_BACKGROUND }}>
      <div className="text-white">
        <h2
          id={headingId}
          className="mb-0 text-2xl/normal font-bold md:text-3xl/normal">
          <Trans
            locale={locale}
            i18nKey="actions.components.highestImpactActionsSection.testWhiteBackground.title">
            Voici vos 3 actions qui auront le plus d'impact
          </Trans>
        </h2>
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
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
