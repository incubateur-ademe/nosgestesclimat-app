import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import { twMerge } from 'tailwind-merge'
import BetaBanner from '../BetaBanner'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import ThemeSection from '../ThemeSection'

interface ActionsPageProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'title'
> {
  title: React.ReactNode
  description: React.ReactNode
  cta?: React.ReactNode
  topActions?: MaybePersonalizedAction[]
  themes: Theme[]
  actions: MaybePersonalizedAction[]
  locale: Locale
  assessmentStatus?: SimulationComputationStatus | null
}

export default function ActionsPage({
  title,
  description,
  cta,
  topActions,
  actions,
  themes,
  locale,
  className,
  assessmentStatus,
  ...props
}: ActionsPageProps) {
  const actionsByTheme = Object.groupBy(actions, (action) => action.theme.key)
  return (
    <>
      <BetaBanner locale={locale} />

      <div {...props} className={twMerge('pb-24', className)}>
        <div className="mb-10">
          <h1 className="mb-2 text-2xl/normal md:text-4xl/normal">{title}</h1>
          <p className="text-base/normal text-slate-500 md:text-lg/normal">
            {description}
          </p>
        </div>

        {topActions && topActions.length > 0 && (
          <>
            <HighestImpactActionsSection
              actions={topActions}
              className="mb-10"
              locale={locale}
              assessmentStatus={assessmentStatus}
            />
            <Separator variant="full" className="my-10 hidden md:block" />
          </>
        )}

        {cta && (
          <>
            {cta}
            <Separator variant="full" className="my-10 hidden md:block" />
          </>
        )}

        <div className="relative flex flex-col gap-5 md:gap-10">
          {themes
            .filter((theme) => {
              const actions = actionsByTheme[theme.key]
              return (
                theme.key !== 'societal_services' &&
                actions &&
                actions.length > 0
              )
            })
            .map((theme) => {
              return (
                <ThemeSection
                  key={theme.id}
                  theme={theme}
                  locale={locale}
                  assessmentStatus={assessmentStatus}
                  actions={actionsByTheme[theme.key] ?? []}
                />
              )
            })}
        </div>
      </div>
    </>
  )
}
