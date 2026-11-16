'use client'

import { orderedTestCategoriesWithProfile } from '@/constants/model/categories'
import { useFormController } from '@/form-controller/core/useFormController'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

/**
 * Where the form stands: the current question and its category, the
 * position-based advancement, the categories left and how complete each one is.
 * Not a Simulation status.
 */
export function useFormAdvancement() {
  const {
    currentQuestion,
    currentCategory,
    advancement,
    relevantQuestions,
    completionByCategory,
    questionsByCategories,
  } = useFormController()

  const categoryQuestions = currentCategory
    ? questionsByCategories[currentCategory]
    : []
  const currentQuestionIndex = currentQuestion
    ? categoryQuestions.indexOf(currentQuestion) + 1
    : 0

  /** Where any question sits in its category, for the page title. */
  const questionPosition = (question: DottedName) => {
    const category = getNamespace(question)
    const questions = category ? questionsByCategories[category] : []
    return {
      category,
      count: questions.length,
      index: questions.indexOf(question) + 1,
    }
  }

  const remainingCategories = useMemo(() => {
    const index = orderedTestCategoriesWithProfile.findIndex(
      (category) => category === currentCategory
    )
    return orderedTestCategoriesWithProfile.length - index - 1
  }, [currentCategory])

  return {
    currentQuestion,
    currentCategory,
    advancement,
    remainingCategories,
    completionByCategory,
    /** How many questions the current category holds. */
    countCategoryQuestions: categoryQuestions.length,
    /** 1-based position of the current question in its category. */
    currentQuestionIndex,
    questionPosition,
    isInitialized: relevantQuestions.length > 0,
  }
}
