import type {
  DottedName,
  NGCRuleNode,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode } from 'publicodes'
import { getIsActionDisabled } from './getIsActionDisabled'

type ActionWithIrrelevant = (EvaluatedNode & NGCRuleNode) & {
  isIrrelevant?: boolean
}

export const filterIrrelevantActions = ({
  actions,
  actionChoices,
  rules,
}: {
  actions: (EvaluatedNode & NGCRuleNode)[]
  actionChoices: Partial<Record<DottedName, boolean>>
  rules?: Partial<NGCRules>
}) => {
  // Create a Map to store modified actions
  const actionsMap = new Map<string, ActionWithIrrelevant>()

  // Initialize the Map with all original actions
  actions.forEach((action) => {
    actionsMap.set(action.dottedName, action)
  })

  // For each chosen action, process actions in the same category
  Object.entries(actionChoices).forEach(([actionChoiceKey, isChosen]) => {
    if (!isChosen) return

    const chosenAction = actions.find(
      (action) => action.dottedName === actionChoiceKey
    )

    if (!chosenAction?.rawNode?.action?.dépasse) return

    // Mark "surpassed" actions as irrelevant
    const actionsToMarkAsIrrelevant = chosenAction.rawNode.action.dépasse

    actionsToMarkAsIrrelevant.forEach((actionName) => {
      const actionToUpdate = actionsMap.get(actionName)
      if (actionToUpdate) {
        actionsMap.set(actionName, {
          ...actionToUpdate,
          isIrrelevant: true,
        })
      }
    })
  })

  // Filter disabled actions if rules are provided
  let filteredActions = Array.from(actionsMap.values())

  if (rules) {
    filteredActions = filteredActions.filter((action) => {
      if (action.isIrrelevant) {
        return false
      }

      const flatRule = rules[action.dottedName as DottedName] as {
        formule: string
      }
      return !getIsActionDisabled(
        flatRule,
        action.nodeValue as number | boolean | undefined
      )
    })
  }

  return filteredActions
}
