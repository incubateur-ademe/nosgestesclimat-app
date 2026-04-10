'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import getSomme from '@/publicodes-state/helpers/getSomme'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { captureException } from '@sentry/nextjs'
import { useMemo } from 'react'

interface ActionObject {
  dottedName: DottedName
  value: number
}
/**
 * A hook to help with the actions display and processing.
 *
 * Not really used for now but will be essential when we redo the actions page
 */
export default function useActions() {
  const { getNumericValue, engine } = useEngine()

  const { actionChoices } = useCurrentSimulation()

  const actions = useMemo(() => {
    if (!engine) return []

    const actionsRule = engine.getRule('actions')
    const somme = getSomme(actionsRule.rawNode)

    if (!somme) {
      captureException('No actions found')
      return []
    }

    return somme
  }, [engine])

  const orderedActions = useMemo(() => {
    return actions
      .map((action) => ({
        dottedName: action,
        value: getNumericValue(action),
      }))
      .sort((a: ActionObject, b: ActionObject) => (a.value > b.value ? -1 : 1))
      .map((actionObject: ActionObject) => actionObject.dottedName)
  }, [actions, getNumericValue])

  const { chosenActions, declinedActions } =
    Object.keys(actionChoices ?? {}).reduce(
      (accActions, currentAction) => {
        const actionChoice = actionChoices[currentAction as DottedName]

        if (actionChoice) {
          {
            accActions.chosenActions = [
              ...accActions.chosenActions,
              currentAction,
            ]
          }
        } else {
          accActions.declinedActions = [
            ...accActions.declinedActions,
            currentAction,
          ]
        }

        return accActions
      },
      { chosenActions: [], declinedActions: [] } as {
        chosenActions: string[]
        declinedActions: string[]
      }
    ) || 0

  const totalChosenActionsValue: number = useMemo(
    () =>
      chosenActions.reduce(
        (acc, action) => acc + getNumericValue(action as DottedName),
        0
      ),
    [chosenActions, getNumericValue]
  )

  return {
    actions,
    orderedActions,
    chosenActions,
    declinedActions,
    totalChosenActionsValue,
  }
}
