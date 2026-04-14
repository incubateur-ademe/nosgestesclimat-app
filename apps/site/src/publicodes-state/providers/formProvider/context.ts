'use client'

import type { MissingVariables } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { createContext } from 'react'

interface FormContextType {
  questionsByCategories: Record<DottedName, DottedName[]>
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  relevantAnsweredQuestions: DottedName[]
  remainingQuestionsByCategories: Record<DottedName, DottedName[]>
  currentQuestion: DottedName | null
  currentCategory: DottedName | null
  setCurrentQuestion: (question: DottedName | null) => void
  setCurrentCategory: (category: DottedName | null) => void
  missingVariables: MissingVariables
}
export default createContext<FormContextType>({
  questionsByCategories: {} as Record<DottedName, DottedName[]>,
  relevantQuestions: [],
  remainingQuestions: [],
  relevantAnsweredQuestions: [],
  remainingQuestionsByCategories: {} as Record<DottedName, DottedName[]>,
  currentQuestion: null,
  currentCategory: null,
  setCurrentQuestion: () => '',
  setCurrentCategory: () => '',
  missingVariables: {} as MissingVariables,
})
