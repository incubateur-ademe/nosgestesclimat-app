import getSomme from '@/publicodes-state/helpers/getSomme'
import type { Action, SafeEvaluate } from '@/publicodes-state/types'
import { getCorrectedValue } from '@/utils/getCorrectedValue'
import { sortBy } from '@/utils/sortBy'
import type {
  DottedName,
  NGCRule,
  NGCRuleNode,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode } from 'publicodes'
import { filterIrrelevantActions } from './filterIrrelevantActions'

interface Props {
  rules?: Partial<NGCRules>
  radical: boolean
  safeEvaluate: SafeEvaluate
  getSpecialRuleObject: (dottedName: DottedName) => EvaluatedNode & NGCRuleNode
  actionChoices: Partial<Record<DottedName, boolean>>
}

export default function getActions({
  rules,
  radical,
  safeEvaluate,
  getSpecialRuleObject,
  actionChoices,
}: Props): Action[] {
  if (!rules) return []

  const actionsObject = rules.actions

  const somme = getSomme(actionsObject) ?? []

  const actions = somme.reduce(
    (acc: (EvaluatedNode & NGCRuleNode)[], actionDottedName) => {
      if (
        safeEvaluate({ 'est non applicable': actionDottedName })?.nodeValue ===
        true
      )
        return acc

      const ruleContent = getSpecialRuleObject(actionDottedName)
      return [
        ...acc,
        {
          ...ruleContent,
          dottedName: actionDottedName,
        },
      ]
    },
    []
  )

  const relevantActions = filterIrrelevantActions({
    actions,
    actionChoices,
    rules,
  }) as NGCRule[]

  const sortedActionsByImpact = sortBy(
    (value) =>
      (radical ? -1 : 1) * (getCorrectedValue(value as EvaluatedNode) ?? 1)
  )(relevantActions) as Action[]

  return sortedActionsByImpact
}
