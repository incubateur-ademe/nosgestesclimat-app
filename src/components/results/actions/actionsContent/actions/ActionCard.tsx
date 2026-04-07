'use client'

import Link from '@/components/Link'
import CloseIcon from '@/components/icons/Close'
import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import {
  actionsClickNo,
  actionsClickYes,
  actionsOpenAction,
} from '@/constants/tracking/pages/actions'
import {
  captureActionsClickNo,
  captureActionsClickYes,
  captureActionsOpenAction,
} from '@/constants/tracking/posthogTrackers'
import Emoji from '@/design-system/utils/Emoji'
import { filterRelevantMissingVariables } from '@/helpers/actions/filterRelevantMissingVariables'
import { getIsActionDisabled } from '@/helpers/actions/getIsActionDisabled'
import {
  getBackgroundLightColor,
  getBorderColor,
  getTextDarkColor,
} from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  useCurrentSimulation,
  useEngine,
  useRule,
  useTempEngine,
  useUser,
} from '@/publicodes-state'
import type { Action } from '@/publicodes-state/types'
import { trackEvent, trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { encodeRuleName } from '@/utils/publicodes/encodeRuleName'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import ActionValue from './ActionValue'

interface Props {
  action: Action
  total: number
  rule: NGCRuleNode | undefined
  setActionWithFormOpen: (dottedName: DottedName) => void
  isFocused: boolean
  handleUpdatePersistedActions: () => void
}

export default function ActionCard({
  action,
  total,
  rule,
  setActionWithFormOpen,
  handleUpdatePersistedActions,
}: Props) {
  const { t } = useClientTranslation()

  const pathname = usePathname()

  const {
    everyQuestions,
    safeEvaluate,
    rawMissingVariables,
    everyMosaicChildrenWithParent,
  } = useEngine()

  const { rules, extendedFoldedSteps } = useTempEngine()
  const typedRules = rules

  const { toggleActionChoice, rejectAction } = useUser()

  const currentSimulation = useCurrentSimulation()

  const { dottedName, title, traversedVariables, missingVariables } = action

  const icons =
    (rule?.rawNode as { icônes?: string })?.icônes ??
    (action.rawNode as { icônes?: string })?.icônes
  const remainingQuestions = filterRelevantMissingVariables({
    everyQuestions,
    missingVariables: Object.keys(missingVariables || {}) as DottedName[],
    extendedFoldedSteps,
    safeEvaluate,
    rawMissingVariables,
    everyMosaicChildrenWithParent,
  })

  const nbRemainingQuestions = remainingQuestions?.length

  const hasRemainingQuestions = nbRemainingQuestions > 0

  const { category } = useRule(dottedName)

  const actionChoices = currentSimulation?.actionChoices

  const isSelected = Object.keys(actionChoices || {}).some((key) => {
    return key === dottedName && actionChoices?.[key]
  })

  const flatRule = typedRules?.[dottedName]

  const hasFormula = !!flatRule?.formule
  const isDisabled =
    flatRule &&
    getIsActionDisabled(flatRule as { formule?: string }) &&
    traversedVariables &&
    Object.keys(actionChoices || {}).some((key) => {
      return traversedVariables.includes(key)
    })

  const handleChooseAction = useCallback(() => {
    if (isDisabled) return

    if (hasRemainingQuestions) {
      setActionWithFormOpen(dottedName)
      return null
    }

    toggleActionChoice(dottedName)

    handleUpdatePersistedActions()

    if (!isSelected) {
      trackEvent(actionsClickYes(dottedName))
      trackPosthogEvent(captureActionsClickYes({ action: dottedName }))
    }
  }, [
    dottedName,
    hasRemainingQuestions,
    isDisabled,
    isSelected,
    setActionWithFormOpen,
    toggleActionChoice,
    handleUpdatePersistedActions,
  ])

  const handleRejectAction = () => {
    if (isDisabled) return

    rejectAction(dottedName)

    handleUpdatePersistedActions()

    if (!isSelected) {
      trackEvent(actionsClickNo(dottedName))
      trackPosthogEvent(captureActionsClickNo({ action: dottedName }))
    }
  }

  if (!currentSimulation || !rules) {
    return null
  }

  return (
    <div
      id={dottedName}
      className={twMerge(
        'relative flex h-[19rem] w-full flex-col items-center justify-center overflow-auto rounded-xl border-2 border-solid p-4',
        isSelected
          ? 'border-green-500 bg-green-500/[0.23]'
          : getBorderColor(category)
      )}>
      <div
        className={twMerge(
          'flex h-auto w-full items-center rounded-xl p-2',
          getBackgroundLightColor(category)
        )}>
        <Link
          className="z-10 w-full underline"
          onClick={() => {
            trackEvent(actionsOpenAction(dottedName))
            trackPosthogEvent(captureActionsOpenAction({ action: dottedName }))
          }}
          href={`${pathname}/${encodeRuleName(dottedName)}`}>
          {icons && (
            <Emoji className="inline-flex justify-center">{icons}</Emoji>
          )}

          <h3
            className={twMerge(
              'mb-0 inline-block w-full text-center text-sm font-bold underline',
              getTextDarkColor(category)
            )}>
            {title}
          </h3>
        </Link>
      </div>

      <div className="mt-3 flex w-full flex-1 flex-col justify-between">
        <div className="relative">
          <ActionValue
            dottedName={dottedName}
            total={total}
            isDisabled={isDisabled}
            hasFormula={hasFormula}
            setActionWithFormOpen={setActionWithFormOpen}
            remainingQuestions={remainingQuestions}
          />
        </div>
        <div className="self-bottom flex w-full justify-between px-2">
          <button
            title={
              remainingQuestions?.length > 0
                ? t("Choisir l'action - désactivé")
                : actionChoices?.[dottedName]
                  ? t('Annuler la sélection')
                  : t("Choisir l'action")
            }
            type="button"
            aria-disabled={remainingQuestions?.length > 0}
            aria-pressed={!!actionChoices?.[dottedName]}
            aria-label={`${title} ${actionChoices?.[dottedName] ? t('actions.chooseAction.ariaLabel.selected', 'Action sélectionnée, annuler la sélection') : t('actions.chooseAction.ariaLabel.unselected', 'Sélectionner cette action')}`}
            className={twMerge(
              hasRemainingQuestions ? 'grayscale' : '',
              'focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden'
            )}
            onClick={
              remainingQuestions?.length > 0 ? () => {} : handleChooseAction
            }>
            <CheckCircleIcon
              className="fill-green-700"
              width="40"
              height="40"
            />
          </button>

          {!Object.keys(actionChoices || {}).some((key) => {
            return key === dottedName && actionChoices?.[key]
          }) && (
            <button
              title={t("Rejeter l'action")}
              onClick={handleRejectAction}
              aria-label={`${title} ${actionChoices?.[dottedName] ? t('actions.rejectAction.ariaLabel.selected', 'Action rejetée') : t('actions.rejectAction.ariaLabel.unselected', 'Rejeter cette action')}`}
              className="focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
              <CloseIcon width="40" height="40" className="fill-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
