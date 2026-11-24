import {
  isMajorQuestion,
  MUST_ASK_QUESTIONS,
  MUST_NOT_ASK_QUESTIONS,
  NON_PRIORITY_QUESTIONS,
  PRIORITY_QUESTIONS,
} from '@/publicodes-state/constants/questions'
import getSortedQuestionsList from '@/publicodes-state/helpers/getSortedQuestionsList'
import moveLastQuestionsToTheEnd from '@/publicodes-state/helpers/moveLastQuestionsToTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useCallback, useMemo } from 'react'
import type {
  Entries,
  MissingVariables,
  SafeEvaluate,
  Situation,
} from '../../../types'

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
 * This is were we get all the questions of the form in the correct order
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
  const majorQuestions = useMemo(
    () => everyQuestions.filter(isMajorQuestion),
    [everyQuestions]
  )

  const missingVariables = useMemo(
    () => {
      const tempMissingVariables = Object.fromEntries(
        (
          Object.entries(
            safeEvaluate(root)?.missingVariables || {}
          ) as Entries<MissingVariables>
        ).filter((missingVariable) =>
          majorQuestions.includes(missingVariable[0])
        )
      ) as MissingVariables

      // We take every mosaic parent to add it to the missing variables with the max score of its children
      ;(
        Object.entries(everyMosaicChildrenWithParent) as [
          DottedName,
          DottedName[],
        ][]
      ).forEach(([mosaicParent, mosaicChildren]) => {
        if (!isMajorQuestion(mosaicParent)) {
          return
        }
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
    [safeEvaluate, root, majorQuestions, situation]
  )

  const sortQuestions = useCallback(
    (questions: DottedName[]) =>
      moveLastQuestionsToTheEnd(
        getSortedQuestionsList({
          questions,
          categories,
          subcategories,
          missingVariables,
        })
      ),
    [categories, subcategories, missingVariables]
  )

  const remainingQuestions = useMemo(() => {
    // We take every questions
    const questionsToSort = majorQuestions
      // We remove all that are in mosaics,
      .filter(
        (question) =>
          !Object.values(everyMosaicChildrenWithParent)
            .flat()
            .find((mosaic) => mosaic === question)
      )
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
    majorQuestions,
    foldedSteps,
    missingVariables,
    sortQuestions,
  ])

  const relevantAnsweredQuestions = useMemo(
    () =>
      foldedSteps.filter((foldedStep) => {
        // checks that there is still a question associated to the folded step
        if (!majorQuestions.includes(foldedStep)) {
          return false
        }
        return true
      }),
    [foldedSteps, majorQuestions]
  )

  const sortedRelevantQuestions = sortQuestions(
    [
      /**
       * We add every answered questions to display and every not answered
       * questions to display to get every relevant questions
       */
      ...relevantAnsweredQuestions,
      ...remainingQuestions,
    ].filter((question) => !MUST_NOT_ASK_QUESTIONS.has(question))
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

  const remainingQuestionsByCategories = useMemo(
    () =>
      Object.entries(questionsByCategories).reduce(
        (accumulator, [category, questions]) => ({
          ...accumulator,
          [category]: questions.filter((question) =>
            remainingQuestions.includes(question)
          ),
        }),
        {} as Record<DottedName, DottedName[]>
      ),
    [questionsByCategories, remainingQuestions]
  )

  return {
    missingVariables,
    remainingQuestions,
    relevantAnsweredQuestions,
    relevantQuestions: sortedRelevantQuestions,
    questionsByCategories,
    remainingQuestionsByCategories,
  }
}
