'use client'

import Navigation from '@/components/form/Navigation'
import Question from '@/components/form/Question'
import Trans from '@/components/translation/trans/TransClient'
import { filterRelevantMissingVariables } from '@/helpers/actions/filterRelevantMissingVariables'
import {
  useEngine,
  useFormState,
  useRule,
  useTempEngine,
} from '@/publicodes-state'
import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import type { Action, MissingVariables } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect } from 'react'

interface Props {
  action: Action
  category: DottedName
  onComplete: () => void
  handleUpdatePersistedActions?: () => void
}

export default function ActionForm({
  action,
  category,
  onComplete,
  handleUpdatePersistedActions = () => {},
}: Props) {
  const {
    currentQuestion,
    setCurrentQuestion,
    setCurrentCategory,
    currentCategory,
  } = useFormState()

  const {
    everyQuestions,
    rawMissingVariables,
    safeEvaluate,
    everyMosaicChildrenWithParent,
  } = useEngine()

  const { extendedFoldedSteps } = useTempEngine()

  const { numericValue } = useRule(action.dottedName)

  const { missingVariables } = action

  const remainingQuestions = filterRelevantMissingVariables({
    everyQuestions,
    missingVariables: Object.keys(missingVariables || {}) as DottedName[],
    extendedFoldedSteps,
    rawMissingVariables,
    safeEvaluate,
    everyMosaicChildrenWithParent,
  })

  const isActionApplicable =
    checkIfDottedNameShouldNotBeIgnored({
      dottedName: action.dottedName,
      safeEvaluate,
      rawMissingVariables: {} as MissingVariables,
    }) && numericValue !== 0

  useEffect(() => {
    if (category && !currentCategory) {
      setCurrentCategory(category)
    }
  }, [category, currentCategory, setCurrentCategory])

  useEffect(() => {
    if (currentCategory && !currentQuestion) {
      setCurrentQuestion(remainingQuestions?.[0])
    }
  }, [currentCategory, currentQuestion, remainingQuestions, setCurrentQuestion])

  if (!currentQuestion || !currentCategory) return null

  return (
    <div aria-live="polite" className="text-left">
      <Question question={currentQuestion} key={currentQuestion} />

      {!isActionApplicable && (
        <p className="text-primary-800 text-sm">
          <Trans>
            Vos réponses ne vous permettent pas de sélectionner ce geste ; il va
            être retiré de la liste de vos actions suggérées.
          </Trans>
        </p>
      )}

      <Navigation
        question={currentQuestion}
        onComplete={() => {
          onComplete()
          handleUpdatePersistedActions()
        }}
        isEmbedded
        remainingQuestions={remainingQuestions}
      />
    </div>
  )
}
