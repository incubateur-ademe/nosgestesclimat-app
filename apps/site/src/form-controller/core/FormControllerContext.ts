'use client'

import type { Step } from '@/form-controller/core/steps'
import type { MissingVariables } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { createContext } from 'react'

/**
 * The form controller's session: everything derived from the situation and the
 * current step. The single source the public windows read. Drafts live in their
 * own context (DraftContext); writes go through the write service.
 */
export interface FormControllerSession {
  currentStep: Step | undefined
  /** Move to a step: updates the session and the URL in the same tick. */
  navigate: (step: Step) => void
  /** The step as of now, readable from a callback that runs before a re-render. */
  getCurrentStep: () => Step | undefined
  /** The current question (last answered on an intercalaire), or null. */
  currentQuestion: DottedName | null
  currentCategory: DottedName | undefined
  /** Position-based advancement, from 0 to 1. Not a Simulation status. */
  advancement: number
  /** How complete each category is, from 0 to 1. */
  completionByCategory: Record<DottedName, number>
  relevantQuestions: DottedName[]
  remainingQuestions: DottedName[]
  relevantAnsweredQuestions: DottedName[]
  questionsByCategories: Record<DottedName, DottedName[]>
  missingVariables: MissingVariables
  forgottenQuestions: DottedName[]
  /** Bounds: is next disabled because a value is out of bounds. */
  isNextDisabled: boolean
  /** Questions over their floor/ceiling (for the per-question warnings). */
}

/**
 * An empty session, used outside the provider: the simulator skeleton is
 * rendered by `(simulator-flow)/loading.tsx`, above the layout that mounts the
 * controller, and must not crash while it shows nothing.
 */
const EMPTY_SESSION: FormControllerSession = {
  currentStep: undefined,
  navigate: () => undefined,
  getCurrentStep: () => undefined,
  currentQuestion: null,
  currentCategory: undefined,
  advancement: 0,
  completionByCategory: {} as Record<DottedName, number>,
  relevantQuestions: [],
  remainingQuestions: [],
  relevantAnsweredQuestions: [],
  questionsByCategories: {} as Record<DottedName, DottedName[]>,
  missingVariables: {} as MissingVariables,
  forgottenQuestions: [],
  isNextDisabled: false,
}

const FormControllerContext =
  createContext<FormControllerSession>(EMPTY_SESSION)

export default FormControllerContext
