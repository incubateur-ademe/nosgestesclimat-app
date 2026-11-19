import { orderedTestCategoriesWithProfile } from '@/constants/model/categories'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

interface Props {
  questionsByCategories: Record<DottedName, DottedName[]>
  remainingQuestions: DottedName[]
}

/**
 * How complete each category is, from 0 to 1: a category is done when none of
 * its questions is still to be asked.
 */
export default function useCompletionByCategory({
  questionsByCategories,
  remainingQuestions,
}: Props): Record<DottedName, number> {
  return useMemo(() => {
    const remaining = new Set(remainingQuestions)
    return Object.fromEntries(
      orderedTestCategoriesWithProfile.map((category) => {
        const questions = questionsByCategories[category]
        const left = questions.filter((question) =>
          remaining.has(question)
        ).length
        return [
          category,
          questions.length === 0
            ? 0
            : (questions.length - left) / questions.length,
        ]
      })
    ) as Record<DottedName, number>
  }, [questionsByCategories, remainingQuestions])
}
