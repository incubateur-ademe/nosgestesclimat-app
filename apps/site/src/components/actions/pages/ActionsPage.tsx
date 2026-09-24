import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'tailwind-merge'
import Trans from '../../translation/trans/TransServer'
import ActionsPageHeaderSwitch from '../ActionsPageHeaderSwitch'
import BetaBanner from '../BetaBanner'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import ThemeSection from '../ThemeSection'
import { ActionProvider } from '../contexts/action'
import type { ActionFrom } from '../types/actions'

interface ActionsPageProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'title'
> {
  title?: React.ReactNode
  description?: React.ReactNode
  otherActionsTitle?: React.ReactNode
  otherActionsDescription?: React.ReactNode
  cta?: React.ReactNode
  topActions?: MaybePersonalizedAction[]
  themes: Theme[]
  actions: MaybePersonalizedAction[]
  locale: Locale
  assessmentStatus?: AssessmentStatus | null
  from?: ActionFrom
  /**
   * Total carbon footprint in kg of the user's latest simulation.
   */
  totalFootprint?: number
  shouldHideActionCommitFeature?: boolean
}

export default function ActionsPage({
  title,
  description,
  otherActionsTitle,
  otherActionsDescription,
  cta,
  topActions,
  actions,
  themes,
  locale,
  className,
  assessmentStatus,
  from,
  totalFootprint,
  shouldHideActionCommitFeature,
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
        {otherActionsTitle ?? (
          <Trans
            locale={locale}
            i18nKey="actions.components.themeSections.testWhiteBackground.title">
            Voici d’autres actions qui vous aideront à réduire votre empreinte
          </Trans>
        )}
      </h2>
      <p className="mb-4 text-lg/normal md:mb-8">
        {otherActionsDescription ?? (
          <Trans
            locale={locale}
            i18nKey="actions.components.themeSections.testWhiteBackground.description">
            À impact variable : des gestes à fort impact aux petit pas.
          </Trans>
        )}
      </p>
    </>
  )

  return (
    <ActionProvider
      values={{
        assessmentStatus,
        totalFootprint,
      }}>
      <BetaBanner locale={locale} />

      <div {...props} className={twMerge('pb-24', className)}>
        {title && (
          <ActionsPageHeaderSwitch
            title={title}
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
        )}

        {topActions && topActions.length > 0 && (
          <HighestImpactActionsSection
            actions={topActions}
            className={cta ? 'mb-10' : 'mb-8 md:mb-12'}
            locale={locale}
            from={from}
            shouldHideActionCommitFeature={shouldHideActionCommitFeature}
          />
        )}

        {!totalFootprint && testVariantsTrailingContent}

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
                  actions={actionsByTheme[theme.key] ?? []}
                  from={from}
                  shouldHideActionCommitFeature={shouldHideActionCommitFeature}
                />
              )
            })}
        </div>
      </div>
    </ActionProvider>
  )
}
