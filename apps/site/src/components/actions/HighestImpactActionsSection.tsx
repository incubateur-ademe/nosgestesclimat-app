import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { useId } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'
import ActionCard from './ActionCard'
import ActionsCarousel from './ActionsCarousel/ActionsCarousel'

interface HighestImpactActionsSectionProps extends React.ComponentPropsWithoutRef<'section'> {
  actions: Action[]
  locale: Locale
}

export default function HighestImpactActionsSection({
  actions,
  locale,
  className,
  ...props
}: HighestImpactActionsSectionProps) {
  const carouselLabelId = useId()
  return (
    <section
      {...props}
      className={twMerge(
        'relative -mx-4 px-2 pt-5 pb-4 shadow-lg md:mx-0 md:rounded-2xl md:px-5 md:pt-8 md:pb-7',
        className
      )}
      style={{
        background:
          'linear-gradient(90deg, rgba(26,26,26,0.2), rgba(26,26,26,0.2)), linear-gradient(114deg, var(--color-indigo-900) 0%, var(--color-indigo-600) 100%)',
      }}>
      <div className="mb-4 flex gap-2">
        <span
          className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-xl shadow-[0px_2px_4px_rgba(240,177,0,.25)]"
          aria-hidden="true">
          🏆
        </span>
        <div className="text-white">
          <h2 id={carouselLabelId} className="mb-0 text-lg/normal font-bold">
            <Trans
              locale={locale}
              i18nKey="actions.components.highestImpactActionsSection.title">
              Le trio gagnant
            </Trans>
          </h2>
          <p className="text-sm/normal font-normal md:text-base">
            <Trans
              locale={locale}
              i18nKey="actions.components.highestImpactActionsSection.description">
              Les actions qui auraient le plus d'impact sur votre empreinte
            </Trans>
          </p>
        </div>
      </div>
      <ActionsCarousel
        locale={locale}
        aria-labelledby={carouselLabelId}
        className="-mx-2 md:mx-0"
        innerClassName="py-1 px-2 md:px-0">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} locale={locale} />
        ))}
      </ActionsCarousel>
    </section>
  )
}
