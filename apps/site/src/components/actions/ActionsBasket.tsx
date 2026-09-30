import Button from '@/design-system/buttons/Button'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useId, type ReactNode } from 'react'
import Trans from '../translation/trans/TransServer'
import ActionBasketItem from './actionsBasket/ActionBasketItem'
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

  const hasCommittedToActions = actionsWithChoice.length > 0

  return (
    <section
      aria-labelledby={titleId}
      className="sticky top-22 w-80 rounded-xl border border-slate-200 p-4">
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
            Votre sélection est vide. Parcourez les catégories pour ajouter des
            actions que vous pourrez mettre en place.
          </Trans>
        </p>
      )}

      {hasCommittedToActions && (
        <ul className="mb-4 flex flex-col gap-2.5">
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
          <ButtonLinkServer href="/" className="text-sm!">
            <Trans i18nKey="actions.basket.saveButton.label" locale={locale}>
              Sauvegarder mon plan d'action
            </Trans>
          </ButtonLinkServer>
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
  )
}
