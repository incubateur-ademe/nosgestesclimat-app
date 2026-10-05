import Button from '@/design-system/buttons/Button'
import BottomBannerWithCTA from '@/design-system/layout/BottomBannerWithCTA'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useId, type ReactNode } from 'react'
import Trans from '../translation/trans/TransServer'
import ActionBasketItem from './actionsBasket/ActionBasketItem'
import SavePlanLink from './actionsBasket/SavePlanLink'
import { getActionsWithChoice } from './utils/getActionsWithChoice'

interface Props {
  actions: MaybePersonalizedAction[] | null
  locale: Locale
  assessmentStatus: AssessmentStatus
}

export default function ActionsBasket({
  actions,
  locale,
  assessmentStatus,
}: Props) {
  const titleId = useId()

  const { t } = getServerTranslation({ locale })

  const actionsWithChoice = getActionsWithChoice(actions ?? [])
  const actionsLength = actionsWithChoice.length
  const hasCommittedToActions = actionsLength > 0
  const actionsImpactSum = actionsWithChoice.reduce((acc, action) => {
    return acc + (action.assessment?.impact ?? 0)
  }, 0)

  const { formattedValue: formattedActionsImpactSum, unit } = formatFootprint(
    actionsImpactSum,
    {
      locale,
      metric: 'carbone',
    }
  )

  return (
    <>
      <BottomBannerWithCTA className="lg:hidden">
        <SavePlanLink
          className="w-full max-w-[320px]"
          label={
            <span className="text-center">
              <span className="inline-block text-base/normal font-bold">
                <Trans
                  locale={locale}
                  i18nKey="actions.seeActionPlanLink.mobile.label.firstLine">
                  Voir mon plan d'action
                </Trans>
              </span>
              <br />
              <span className="inline-block text-sm/normal">
                <Trans
                  locale={locale}
                  i18nKey="actions.seeActionPlanLink.mobile.label.secondLine"
                  // Ne fonctionne pas
                  count={actionsLength}>
                  {{ count: actionsLength } as unknown as ReactNode} actions
                </Trans>
                {actionsImpactSum > 0 && (
                  <>
                    {' '}
                    / -{formattedActionsImpactSum} {unit}{' '}
                    <Trans locale={locale}>CO₂e / an</Trans>
                  </>
                )}
              </span>
            </span>
          }
        />
      </BottomBannerWithCTA>
      <section
        aria-labelledby={titleId}
        className="sticky top-22 mb-12 hidden w-80 rounded-xl border border-slate-200 p-4 lg:block">
        <div className="flex items-center gap-2.5">
          <h2 className="mb-0 text-lg/normal font-bold">
            <Trans
              i18nKey="actions.basket.title.withActionChoices"
              locale={locale}>
              Ma sélection d'actions
            </Trans>
          </h2>
          {hasCommittedToActions && (
            <div
              aria-hidden
              className="bg-primary-600 flex size-8 items-center justify-center rounded-full text-sm font-bold text-white">
              {actionsWithChoice.length}
            </div>
          )}
        </div>

        <p className="m text-sm text-slate-600">
          {hasCommittedToActions ? (
            <Trans
              i18nKey="actions.basket.subtitle.withChoices"
              locale={locale}
              values={{
                actionChoicesLength: actionsWithChoice.length,
                pluralSuffix: actionsWithChoice.length > 1 ? 's' : '',
              }}>
              {
                {
                  actionChoicesLength: actionsWithChoice.length,
                } as unknown as ReactNode
              }{' '}
              action
              {
                {
                  pluralSuffix: actionsWithChoice.length > 1 ? 's' : '',
                } as unknown as ReactNode
              }{' '}
              dans votre sélection
            </Trans>
          ) : (
            <Trans i18nKey="actions.basket.subtitle.empty" locale={locale}>
              Ajoutez des actions à votre sélection.
            </Trans>
          )}
        </p>

        {!hasCommittedToActions && (
          <p className="bg-secondary-50 mb-20 rounded-lg p-5 text-sm text-slate-600">
            <Trans
              i18nKey="actions.basket.informativeBlock.content"
              locale={locale}>
              Votre sélection est vide. Parcourez les catégories pour ajouter
              des actions que vous pourrez mettre en place.
            </Trans>
          </p>
        )}

        {hasCommittedToActions && (
          <ul className="mb-4 flex max-h-125 flex-col gap-2.5 overflow-auto">
            {actionsWithChoice.map((action) => (
              <ActionBasketItem
                key={action.id}
                action={action}
                locale={locale}
                assessmentStatus={assessmentStatus}
              />
            ))}
          </ul>
        )}

        <div className="-mx-4 flex justify-center border-t border-slate-300 pt-5">
          {hasCommittedToActions ? (
            <SavePlanLink>
              <Trans i18nKey="actions.basket.saveButton.label" locale={locale}>
                Sauvegarder mon plan d'action
              </Trans>
            </SavePlanLink>
          ) : (
            <Button
              disabled
              aria-label={t(
                'actions.basket.saveButton.ariaLabel',
                "Sauvegarder mon plan d'actions et accéder à ma page plan d'actions"
              )}
              className="text-sm!">
              <Trans i18nKey="actions.basket.saveButton.label" locale={locale}>
                Sauvegarder mon plan d'action
              </Trans>
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
