import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'cn'
import Trans from '../../translation/trans/TransServer'
import ActionsBasket from '../ActionsBasket'
import BetaBanner from '../BetaBanner'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import ThemeSection from '../ThemeSection'
import type { ActionFrom } from '../types/actions'

interface ActionsPageProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'title'
> {
  title: React.ReactNode
  description: React.ReactNode
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
}

export default function ActionsPage({
  title,
  description,
  otherActionsTitle,
  otherActionsDescription,
  topActions,
  actions,
  themes,
  locale,
  className,
  assessmentStatus,
  from,
  totalFootprint,
  ...props
}: ActionsPageProps) {
  const actionsByTheme = Object.groupBy(actions, (action) => action.theme.key)

  return (
    <>
      <BetaBanner locale={locale} />

      <div>
        <h1 className="mb-0 text-2xl/normal font-medium md:text-4xl/normal">
          {title}
        </h1>
        <p className="w-190 max-w-full text-base/normal md:text-lg/normal">
          {description}
        </p>
      </div>

      <div className="relative flex items-start gap-10">
        <div
          {...props}
          className={twMerge(
            'mt-8 w-[calc(100%-(320px+40px))] pb-24',
            className
          )}>
          {topActions && topActions.length > 0 && (
            <HighestImpactActionsSection
              actions={topActions}
              className="mb-8 md:mb-12"
              locale={locale}
              from={from}
              actionCatalogueContext={{
                totalFootprint,
                assessmentStatus,
              }}
            />
          )}

          <h2 className="mb-0 text-2xl/normal font-bold md:text-3xl/normal">
            {otherActionsTitle ?? (
              <Trans
                locale={locale}
                i18nKey="actions.components.themeSections.testWhiteBackground.title">
                Voici d’autres actions qui vous aideront à réduire votre
                empreinte
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

          <div className="relative flex max-w-full flex-col gap-5 md:gap-10">
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
                  />
                )
              })}
          </div>
        </div>
        {assessmentStatus && (
          <ActionsBasket
            actions={actions}
            locale={locale}
            assessmentStatus={assessmentStatus}
          />
        )}
      </div>
    </>
  )
}
