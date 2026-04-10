import type {
  DottedName,
  NGCRuleNode,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import useCurrentSimulation from '../useCurrentSimulation/useCurrentSimulation'

import { useEngine } from '@/publicodes-state'
import type { EvaluatedNode } from 'publicodes'
/**
 * This is temporary and should be put to death as soon as possible
 */
export default function useTempEngine(): {
  getSpecialRuleObject: (dottedName: DottedName) => EvaluatedNode & NGCRuleNode
  rules: Partial<NGCRules> | undefined
  extendedFoldedSteps: DottedName[]
} {
  const { safeEvaluate, rules, safeGetRule, everyMosaicChildrenWithParent } =
    useEngine()

  const { foldedSteps } = useCurrentSimulation()

  const getSpecialRuleObject = (
    dottedName: DottedName
  ): EvaluatedNode & NGCRuleNode => {
    const evaluation = safeEvaluate(dottedName)!
    const rule = safeGetRule(dottedName)!
    return {
      ...evaluation,
      ...rule,
    }
  }

  const extendedFoldedSteps = foldedSteps
    .map((foldedStep) => {
      const questionsOfMosaic = everyMosaicChildrenWithParent[foldedStep] || []
      return questionsOfMosaic.length > 0 ? questionsOfMosaic : foldedStep
    })
    .flat()

  return {
    getSpecialRuleObject,
    rules,
    extendedFoldedSteps,
  }
}
