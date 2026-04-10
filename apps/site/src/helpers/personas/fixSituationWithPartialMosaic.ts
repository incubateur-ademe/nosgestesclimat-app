import getType from '@/publicodes-state/helpers/getType'
import type { SafeEvaluate, Situation } from '@/publicodes-state/types'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  situation: Situation
  everyMosaicChildrenWithParent: Record<DottedName, DottedName[]>
  safeGetRule: (rule: DottedName) => NGCRuleNode | undefined
  safeEvaluate: SafeEvaluate
}

const getMosaicChildrenGroup = (
  situation: Situation,
  expectedMosaicGroup: DottedName[]
) => {
  return (Object.keys(situation) as DottedName[]).filter((key) =>
    expectedMosaicGroup.includes(key)
  )
}

export const fixSituationWithPartialMosaic = ({
  situation,
  everyMosaicChildrenWithParent,
  safeGetRule,
  safeEvaluate,
}: Props) => {
  // We take every mosaic questions and check if all or part of their children are in the situation.
  // If not answers are set in situation, we consider all mosaic answers to be 'non' or 0.
  Object.values(everyMosaicChildrenWithParent).forEach(
    (expectedMosaicGroup) => {
      const situationMosaicGroup = getMosaicChildrenGroup(
        situation,
        expectedMosaicGroup
      )

      if (situationMosaicGroup.length === 0) {
        return
      }

      expectedMosaicGroup.forEach((dottedName) => {
        if (!situationMosaicGroup.includes(dottedName)) {
          const rule = safeGetRule(dottedName)
          const evaluation = safeEvaluate(dottedName)
          const valueToReset =
            getType({ dottedName, rule, evaluation }) === 'boolean' ? 'non' : 0
          situation[dottedName] = valueToReset
        }
      })
    }
  )

  return situation
}
