import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import { twMerge } from 'tailwind-merge'
import Trans from '../../translation/trans/TransServer'
import ActionsPageHeaderSwitch from '../ActionsPageHeaderSwitch'
import BetaBanner from '../BetaBanner'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import HighestImpactActionsSectionDarkBackground from '../HighestImpactActionsSectionDarkBackground'
import HighestImpactActionsSectionSwitch from '../HighestImpactActionsSectionSwitch'
import HighestImpactActionsSectionWhiteBackground from '../HighestImpactActionsSectionWhiteBackground'
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
  from?: 'fin' | 'mon-espace' | 'index'
  /**
   * Total carbon footprint in kg of the user's latest simulation.
   */
  totalFootprint?: number
  textOverrides?: { highestImpactSectionDescription?: React.ReactNode }
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
  from,
  totalFootprint,
  textOverrides,
  ...props
}: ActionsPageProps) {
  const actionsByTheme = Object.groupBy(actions, (action) => action.theme.key)

  // Both test layouts share everything that sits between the highlighted
  // actions and the per-theme sections.
  const testVariantsTrailingContent = (
    <>
      {cta && (
        <>
          <Separator variant="full" className="my-10 hidden md:block" />
          {cta}
          <Separator variant="full" className="my-10 hidden md:block" />
        </>
      )}

      <h2 className="mb-0 text-2xl/normal font-bold md:text-3xl/normal">
        <Trans
          locale={locale}
          i18nKey="actions.components.themeSections.testWhiteBackground.title">
          Voici d’autres actions qui vous aideront à réduire votre empreinte
        </Trans>
      </h2>
      <p className="mb-4 text-lg/normal md:mb-8">
        <Trans
          locale={locale}
          i18nKey="actions.components.themeSections.testWhiteBackground.description">
          À impact variable : des gestes à fort impact aux petit pas.
        </Trans>
      </p>
    </>
  )

  return (
    <>
      <BetaBanner locale={locale} />

      <div {...props} className={twMerge('pb-24', className)}>
        <ActionsPageHeaderSwitch
          control={
            <div className="mb-10">
              <h1 className="mb-2 text-2xl/normal md:text-4xl/normal">
                {title}
              </h1>
              <p className="text-base/normal text-slate-500 md:text-lg/normal">
                {description}
              </p>
            </div>
          }
        />

        {topActions && topActions.length > 0 && (
          <HighestImpactActionsSectionSwitch
            control={
              <>
                <HighestImpactActionsSection
                  actions={topActions}
                  className="mb-10"
                  locale={locale}
                  assessmentStatus={assessmentStatus}
                  from={from}
                  textOverrides={
                    textOverrides?.highestImpactSectionDescription
                      ? {
                          description:
                            textOverrides.highestImpactSectionDescription,
                        }
                      : undefined
                  }
                />
                <Separator variant="full" className="my-10 hidden md:block" />

                {cta && (
                  <>
                    {cta}
                    <Separator
                      variant="full"
                      className="my-10 hidden md:block"
                    />
                  </>
                )}
              </>
            }
            testWhiteBackground={
              <>
                <HighestImpactActionsSectionWhiteBackground
                  actions={topActions}
                  className={cta ? 'mb-10' : 'mb-8 md:mb-12'}
                  locale={locale}
                  assessmentStatus={assessmentStatus}
                  from={from}
                  totalFootprint={totalFootprint}
                />
                {testVariantsTrailingContent}
              </>
            }
            testDarkBackground={
              <>
                <HighestImpactActionsSectionDarkBackground
                  actions={topActions}
                  className={cta ? 'mb-10' : 'mb-8 md:mb-12'}
                  locale={locale}
                  assessmentStatus={assessmentStatus}
                  from={from}
                  totalFootprint={totalFootprint}
                />
                {testVariantsTrailingContent}
              </>
            }
          />
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
                  from={from}
                />
              )
            })}
        </div>
      </div>
    </>
  )
}
