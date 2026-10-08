import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type {
  ActionPlan,
  MaybePersonalizedAction,
} from '@nosgestesclimat/core/features/actions/types/action'
import { useId, type ReactNode } from 'react'
import Trans from '../translation/trans/TransServer'
import ChosenActionsList from './actionsBasket/ChosenActionsList'
import DesktopSaveSelectionButtonSection from './actionsBasket/DesktopSaveSelectionButtonSection'
import MobileSaveSelectionBanner from './actionsBasket/MobileSaveSelectionBanner'

interface Props {
  actions: MaybePersonalizedAction[]
  plan: ActionPlan
  locale: Locale
  assessmentStatus: AssessmentStatus
}

export default function ActionsBasket({
  actions,
  plan,
  locale,
  assessmentStatus,
}: Props) {
  const titleId = useId()

  const { numberOfCommittedActions, totalImpact } = plan

  const hasCommittedToActions = numberOfCommittedActions > 0

  return (
    <>
      <MobileSaveSelectionBanner
        actionsLength={numberOfCommittedActions}
        totalImpact={totalImpact}
        locale={locale}
      />
      <section
        aria-labelledby={titleId}
        className="sticky top-20.5 mt-21 mb-12 hidden w-80 rounded-xl border border-slate-200 p-4 lg:block">
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
              {numberOfCommittedActions}
            </div>
          )}
        </div>

        <p className="m text-sm text-slate-600">
          {hasCommittedToActions ? (
            <Trans
              i18nKey="actions.basket.subtitle.choices"
              locale={locale}
              count={numberOfCommittedActions}
              values={{
                numberOfCommittedActions,
              }}>
              {
                {
                  numberOfCommittedActions,
                } as unknown as ReactNode
              }{' '}
              actions dans votre sélection
            </Trans>
          ) : (
            <Trans i18nKey="actions.basket.subtitle.empty" locale={locale}>
              Ajoutez des actions à votre sélection.
            </Trans>
          )}
        </p>

        <ChosenActionsList
          locale={locale}
          actions={actions}
          hasCommittedToActions={hasCommittedToActions}
          assessmentStatus={assessmentStatus}
        />

        <DesktopSaveSelectionButtonSection
          locale={locale}
          hasCommittedToActions={hasCommittedToActions}
        />
      </section>
    </>
  )
}
