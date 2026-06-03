import Trans from '@/components/translation/trans/TransServer'
import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import { twMerge } from 'tailwind-merge'
import BetaBanner from '../BetaBanner'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import ThemeSection from '../ThemeSection'

interface ActionsPageProps extends React.ComponentPropsWithoutRef<'div'> {
  topActions?: PersonalizedAction[]
  themes: Theme[]
  actions: PersonalizedAction[]
  locale: Locale
  assessmentStatus?: SimulationComputationStatus | null
}

export default async function ActionsPage({
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
          <h1 className="mb-2 text-2xl/normal md:text-4xl/normal">
            <Trans locale={locale} i18nKey="actions.listPage.title">
              Construire mon plan d’action
            </Trans>
          </h1>
          <p className="text-base/normal text-slate-500 md:text-lg/normal">
            <Trans locale={locale} i18nKey="actions.listPage.description">
              Les actions suivantes vous sont recommandées d’après vos réponses
              au test.
              <br />
              Choisissez-celles qui vous semblent atteignables, l’essentiel,
              c’est de se mettre en mouvement !
            </Trans>
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

        <div className="relative flex flex-col gap-5 md:gap-10">
          {themes
            .filter((theme) => {
              const actions = actionsByTheme[theme.key]
              return actions && actions.length > 0
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
