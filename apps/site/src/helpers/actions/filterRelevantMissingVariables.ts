import { MUST_NOT_ASK_QUESTIONS } from '@/publicodes-state/constants/questions'
import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import type { MissingVariables, SafeEvaluate } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const filterRelevantMissingVariables = ({
  missingVariables,
  extendedFoldedSteps,
  everyQuestions,
  safeEvaluate,
  rawMissingVariables,
  everyMosaicChildrenWithParent,
}: {
  missingVariables: DottedName[]
  extendedFoldedSteps: DottedName[]
  everyQuestions: DottedName[]
  safeEvaluate: SafeEvaluate
  rawMissingVariables: MissingVariables
  everyMosaicChildrenWithParent: Record<DottedName, DottedName[]>
}) => {
  let remainingQuestions = missingVariables.filter((dottedName: DottedName) => {
    const isFolded = extendedFoldedSteps.includes(dottedName)
    const isMustNotAskQuestion = MUST_NOT_ASK_QUESTIONS?.has(dottedName)
    const isRelevantQuestion = everyQuestions.includes(dottedName)

    const isApplicable = checkIfDottedNameShouldNotBeIgnored({
      dottedName,
      safeEvaluate,
      rawMissingVariables,
    })

    return (
      !isFolded && !isMustNotAskQuestion && isRelevantQuestion && isApplicable
    )
  })

  // Detect if one of the remaining questions is a child of a mosaic
  const mosaicParentsDottedNamesToAdd: DottedName[] = []

  remainingQuestions = remainingQuestions.filter((question) => {
    // Find if this question is a child of a mosaic
    const parentMosaic = Object.entries(everyMosaicChildrenWithParent).find(
      ([, children]) => children.includes(question)
    )?.[0] as DottedName | undefined

    if (!parentMosaic) return true

    if (!mosaicParentsDottedNamesToAdd.includes(parentMosaic)) {
      mosaicParentsDottedNamesToAdd.push(parentMosaic)
    }

    return false
  })

  remainingQuestions = [...remainingQuestions, ...mosaicParentsDottedNamesToAdd]

  return remainingQuestions
}
