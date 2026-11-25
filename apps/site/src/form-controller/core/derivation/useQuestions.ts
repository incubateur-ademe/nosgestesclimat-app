import getSortedQuestionsList from '@/form-controller/core/derivation/getSortedQuestionsList'
import {
  MUST_ASK_QUESTIONS,
  MUST_NOT_ASK_QUESTIONS,
  NON_PRIORITY_QUESTIONS,
  PRIORITY_QUESTIONS,
} from '@/publicodes-state/constants/questions'
import type {
  Entries,
  MissingVariables,
  SafeEvaluate,
  Situation,
} from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useCallback, useMemo } from 'react'

interface Props {
  root: DottedName
  safeEvaluate: SafeEvaluate
  categories: DottedName[]
  subcategories: DottedName[]
  situation: Situation
  foldedSteps: DottedName[]
  everyQuestions: DottedName[]
  everyMosaicChildrenWithParent: Record<DottedName, DottedName[]>
}

/**
 * Derives the form's question lists from the situation: what is left to ask,
 * what was answered, and the two ordered by category.
 */
export default function useQuestions({
  root,
  safeEvaluate,
  categories,
  subcategories,
  situation,
  foldedSteps,
  everyQuestions,
  everyMosaicChildrenWithParent,
}: Props) {
  const missingVariables = useMemo(
    () => {
      const tempMissingVariables = Object.fromEntries(
        (
          Object.entries(
            safeEvaluate(root)?.missingVariables ?? {}
          ) as Entries<MissingVariables>
        ).filter((missingVariable) =>
          everyQuestions.includes(missingVariable[0])
        )
      ) as MissingVariables

      // We take every mosaic parent to add it to the missing variables with the max score of its children
      ;(
        Object.entries(everyMosaicChildrenWithParent) as [
          DottedName,
          DottedName[],
        ][]
      ).forEach(([mosaicParent, mosaicChildren]) => {
        // We avoid considering raw missing variable for mosaic parent but calculate score from children
        if (tempMissingVariables[mosaicParent]) {
          delete tempMissingVariables[mosaicParent]
        }
        const isMosaicParentNotApplicable =
          safeEvaluate({
            'est non applicable': mosaicParent,
          })?.nodeValue === true

        if (isMosaicParentNotApplicable) {
          delete tempMissingVariables[mosaicParent]
          mosaicChildren.forEach((mosaicChild) => {
            delete tempMissingVariables[mosaicChild]
          })
        }
        const maxMissingVariableScoreInMosaic = Math.max(
          ...mosaicChildren.map((child) => {
            return tempMissingVariables[child] || 0
          })
        )
        if (
          !isNaN(maxMissingVariableScoreInMosaic) &&
          maxMissingVariableScoreInMosaic > 0
        ) {
          tempMissingVariables[mosaicParent] = maxMissingVariableScoreInMosaic
          mosaicChildren.forEach((mosaicChild) => {
            delete tempMissingVariables[mosaicChild]
          })
        }
      })

      // We artificially add some questions in the missing variables.
      MUST_ASK_QUESTIONS.forEach((dottedName) => {
        tempMissingVariables[dottedName] = 1
      })

      // We artificially set the missing variables of the whiteList to a high value
      PRIORITY_QUESTIONS.forEach((dottedName) => {
        if (dottedName in tempMissingVariables) {
          tempMissingVariables[dottedName] += 100000
        }
      })

      // We artificially set the missing variables of the blackList to a negative value
      NON_PRIORITY_QUESTIONS.forEach((dottedName) => {
        if (dottedName in tempMissingVariables) {
          tempMissingVariables[dottedName] -= 1000
        }
      })

      return tempMissingVariables
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeEvaluate, root, everyQuestions, situation]
  )

  const sortQuestions = useCallback(
    (questions: DottedName[]) =>
      getSortedQuestionsList({
        questions,
        categories,
        subcategories,
        missingVariables,
      }),
    [categories, subcategories, missingVariables]
  )

  const remainingQuestions = useMemo(() => {
    const mosaicChildren = new Set(
      Object.values(everyMosaicChildrenWithParent).flat()
    )

    // We take every questions
    const questionsToSort = everyQuestions
      // We remove all that are in mosaics,
      .filter((question) => !mosaicChildren.has(question))
      // all that are in folded steps
      .filter((question) => !foldedSteps.includes(question))
      // and all that are not missing
      .filter((question) =>
        Object.keys(missingVariables).find((missingVariable) =>
          missingVariable.includes(question)
        )
      )
      .filter((question) => !MUST_NOT_ASK_QUESTIONS.has(question))
    // then we sort them by category, subcategory and missing variables
    return sortQuestions(questionsToSort)
  }, [
    everyMosaicChildrenWithParent,
    everyQuestions,
    foldedSteps,
    missingVariables,
    sortQuestions,
  ])

  const relevantAnsweredQuestions = useMemo(
    () =>
      foldedSteps.filter((foldedStep) => {
        // checks that there is still a question associated to the folded step
        if (!everyQuestions.includes(foldedStep)) {
          return false
        }
        return true
      }),
    [foldedSteps, everyQuestions]
  )

  // Answered and unanswered questions in one ordered sequence: the form's
  // navigation order.
  const sortedRelevantQuestions = useMemo(
    () =>
      sortQuestions(
        [...relevantAnsweredQuestions, ...remainingQuestions].filter(
          (question) => !MUST_NOT_ASK_QUESTIONS.has(question)
        )
      ),
    [relevantAnsweredQuestions, remainingQuestions, sortQuestions]
  )

  const questionsByCategories = useMemo(
    () =>
      categories.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue]: sortedRelevantQuestions.filter((question) =>
            // We check that the question is in the current category
            utils.ruleParent(question).includes(currentValue)
          ),
        }),
        {} as Record<DottedName, DottedName[]>
      ),
    [sortedRelevantQuestions, categories]
  )

  return {
    missingVariables,
    remainingQuestions,
    relevantAnsweredQuestions,
    relevantQuestions: sortedRelevantQuestions,
    questionsByCategories,
  }
}
