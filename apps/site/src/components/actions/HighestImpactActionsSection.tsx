import type { Locale } from '@/i18nConfig'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'cn'
import { useId } from 'react'
import Trans from '../translation/trans/TransServer'
import HighlightedActionCard from './HighlightedActionCard'
import type { ActionCatalogueContext, ActionFrom } from './types/actions'

interface HighestImpactActionsSectionProps extends React.ComponentPropsWithoutRef<'section'> {
  actions: MaybePersonalizedAction[]
  locale: Locale
  from?: ActionFrom
  actionCatalogueContext: ActionCatalogueContext
}

export default function HighestImpactActionsSection({
  actions,
  locale,
  className,
  from,
  actionCatalogueContext,
  ...props
}: HighestImpactActionsSectionProps) {
  const headingId = useId()
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={twMerge('flex flex-col gap-4', className)}>
      <h2
        id={headingId}
        className="mb-0 text-xl/normal font-medium md:text-2xl/normal">
        <Trans
          locale={locale}
          i18nKey="actions.components.highestImpactActionsSection.testWhiteBackground.title">
          Voici vos 3 actions qui auront le plus d'impact
        </Trans>
      </h2>

      <ol className="flex list-none flex-col gap-4 p-0 md:gap-8">
        {actions.map((action, index) => (
          <li key={action.id}>
            <HighlightedActionCard
              locale={locale}
              action={action}
              rank={index + 1}
              from={from}
              actionCatalogueContext={actionCatalogueContext}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
