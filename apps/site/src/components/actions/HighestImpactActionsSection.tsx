import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { cn } from 'cn'
import { useId } from 'react'
import Trans from '../translation/trans/TransServer'
import HighlightedActionCard from './HighlightedActionCard'
import type { ActionCatalogueContext, ActionFrom } from './types/actions'

interface HighestImpactActionsSectionProps extends React.ComponentPropsWithoutRef<'section'> {
  actions: MaybePersonalizedAction[]
  from?: ActionFrom
  actionCatalogueContext: ActionCatalogueContext
}

export default function HighestImpactActionsSection({
  actions,
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
      className={cn('flex flex-col gap-4', className)}>
      <h2
        id={headingId}
        className="mb-0 text-xl/normal font-medium md:text-2xl/normal">
        <Trans i18nKey="actions.components.highestImpactActionsSection.testWhiteBackground.title">
          Vos 3 actions clés
        </Trans>
      </h2>

      <ol className="flex list-none flex-col gap-4 p-0 md:gap-8">
        {actions.map((action, index) => (
          <li key={action.id}>
            <HighlightedActionCard
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
