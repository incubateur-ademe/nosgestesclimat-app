'use client'

import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { MouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import Trans from '@/components/translation/trans/TransClient'
import {
  DEFAULT_FOCUS_ELEMENT_ID,
  QUESTION_DESCRIPTION_BUTTON_ID,
} from '@/constants/accessibility'
import { captureClickFormNav } from '@/constants/tracking/posthogTrackers'
import {
  questionClickPrevious,
  questionClickSuivant,
} from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIframe } from '@/hooks/useIframe'
import { useMagicKey } from '@/hooks/useMagicKey'
import {
  useCurrentSimulation,
  useEngine,
  useFormState,
  useRule,
} from '@/publicodes-state'
import getValueIsOverFloorOrCeiling from '@/publicodes-state/helpers/getValueIsOverFloorOrCeiling'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'

type SubmitButtonKind = 'loading' | 'finish' | 'next'

function getSubmitButtonKind({
  isPending,
  isLastQuestion,
}: {
  isPending?: boolean
  isLastQuestion?: boolean
}): SubmitButtonKind {
  if (isPending) return 'loading'
  if (isLastQuestion) return 'finish'
  return 'next'
}

function SubmitButtonContent({ kind }: { kind: SubmitButtonKind }) {
  if (kind === 'loading') {
    return (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.loading">
          <Loader color="light" size="sm" className="mr-2" /> Terminer
        </Trans>
      </span>
    )
  }

  if (kind === 'finish') {
    return (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.finished">
          Terminer
        </Trans>
      </span>
    )
  }

  return (
    <span data-testid="next-question-button">
      <Trans i18nKey="simulator.navigation.nextButton.next">Suivant</Trans>{' '}
      <span aria-hidden>→</span>
    </span>
  )
}

export default function Navigation({
  question,
  onComplete = () => '',
  isEmbedded,
  remainingQuestions,
  isPending,
}: {
  question: DottedName
  onComplete?: () => void
  isEmbedded?: boolean
  remainingQuestions: DottedName[]
  isPending?: boolean
}) {
  const { t } = useClientTranslation()

  const { isIframe } = useIframe()

  const [persistedRemainingQuestions] = useState(remainingQuestions)

  const {
    gotoPrevQuestion,
    gotoNextQuestion,
    noPrevQuestion,
    noNextQuestion,
    setCurrentQuestion,
  } = useFormState()

  const {
    isMissing,
    isFolded,
    plancher,
    plafond,
    situationValue,
    value,
    activeNotifications,
    questionsOfMosaicFromParent,
  } = useRule(question)

  const { getValue } = useEngine()

  // Reset notifications when navigating away
  const hasActiveNotifications = activeNotifications.length > 0
  const { setValue: setNotificationValue } = useRule(
    hasActiveNotifications
      ? activeNotifications[activeNotifications.length - 1]
      : question
  )
  const resetNotification = useCallback(() => {
    if (hasActiveNotifications) {
      setNotificationValue(false, {})
    }
  }, [hasActiveNotifications, setNotificationValue])

  const { updateCurrentSimulation } = useCurrentSimulation()

  // Check if the numeric value is out of bounds (floor/ceiling)
  const isNextDisabled =
    typeof situationValue === 'number'
      ? (() => {
          const { isBelowFloor, isOverCeiling } = getValueIsOverFloorOrCeiling({
            value: situationValue,
            plafond,
            plancher,
          })
          return isBelowFloor || isOverCeiling
        })()
      : false

  // Determines if the current question is the last one of the test
  const isLastQuestion = isEmbedded
    ? (remainingQuestions.length === 1 && remainingQuestions[0] === question) ||
      remainingQuestions.length === 0
    : noNextQuestion

  // Disable "Précédent" only when there's truly no previous question
  const hasNoPreviousQuestion = isEmbedded
    ? persistedRemainingQuestions.indexOf(question) === 0
    : noPrevQuestion

  const [startTime, setStartTime] = useState(() => Date.now())

  useEffect(() => {
    setStartTime(Date.now())
  }, [question])

  const handleMoveFocus = () => {
    setTimeout(() => {
      const focusedElement =
        document.getElementById(QUESTION_DESCRIPTION_BUTTON_ID) ??
        document.getElementById(DEFAULT_FOCUS_ELEMENT_ID) ??
        document.getElementById(`${DEFAULT_FOCUS_ELEMENT_ID}-0`)

      if (focusedElement) {
        focusedElement.focus()
      }
    })
  }

  const handleAnswerQuestion = useCallback(() => {
    if (questionsOfMosaicFromParent.length > 0) {
      questionsOfMosaicFromParent.forEach((mosaicQuestion) => {
        updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: mosaicQuestion,
            value: getValue(mosaicQuestion),
            isMosaicChild: true,
          },
        })
      })
    }

    updateCurrentSimulation({
      foldedStepToAdd: {
        foldedStep: question,
        value,
        isMosaicParent: questionsOfMosaicFromParent.length > 0,
      },
    })
  }, [
    getValue,
    question,
    questionsOfMosaicFromParent,
    updateCurrentSimulation,
    value,
  ])

  const trackNextNavigation = useCallback(
    (timeSpentOnQuestion: number) => {
      trackMatomoEvent__deprecated(
        questionClickSuivant({
          question,
          answer: value,
          timeSpentOnQuestion,
        })
      )
      trackPosthogEvent(
        captureClickFormNav({
          actionType: 'suivant',
          question,
          answer: value,
          timeSpentOnQuestion,
        })
      )
    },
    [question, value]
  )

  const trackPrevNavigation = useCallback(
    (timeSpentOnQuestion: number) => {
      trackMatomoEvent__deprecated(questionClickPrevious({ question }))
      trackPosthogEvent(
        captureClickFormNav({
          actionType: 'précédent',
          question,
          answer: value,
          timeSpentOnQuestion,
        })
      )
    },
    [question, value]
  )

  const navigateToNextEmbeddedQuestion = useCallback(() => {
    const nextIndex = (persistedRemainingQuestions.indexOf(question) || 0) + 1
    setCurrentQuestion(persistedRemainingQuestions[nextIndex] ?? null)
  }, [question, setCurrentQuestion, persistedRemainingQuestions])

  const navigateToPrevEmbeddedQuestion = useCallback(() => {
    const prevIndex = (persistedRemainingQuestions.indexOf(question) || 0) - 1
    setCurrentQuestion(persistedRemainingQuestions[prevIndex] ?? null)
  }, [question, setCurrentQuestion, persistedRemainingQuestions])

  const handleGoToNextQuestion = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()

      const timeSpentOnQuestion = Date.now() - startTime

      trackNextNavigation(timeSpentOnQuestion)

      if (isMissing) {
        handleAnswerQuestion()
      }

      handleMoveFocus()

      resetNotification()

      if (isEmbedded && persistedRemainingQuestions.length > 0) {
        navigateToNextEmbeddedQuestion()
      } else {
        gotoNextQuestion()
      }

      if (isLastQuestion) {
        onComplete()
      }
    },
    [
      startTime,
      trackNextNavigation,
      isMissing,
      handleAnswerQuestion,
      resetNotification,
      isEmbedded,
      gotoNextQuestion,
      navigateToNextEmbeddedQuestion,
      isLastQuestion,
      onComplete,
      persistedRemainingQuestions.length,
    ]
  )

  const handleGoToPrevQuestion = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()

      if (hasNoPreviousQuestion) return

      trackPrevNavigation(Date.now() - startTime)

      if (isEmbedded) {
        navigateToPrevEmbeddedQuestion()
      } else {
        gotoPrevQuestion()
      }

      resetNotification()

      handleMoveFocus()
    },
    [
      hasNoPreviousQuestion,
      startTime,
      trackPrevNavigation,
      isEmbedded,
      gotoPrevQuestion,
      navigateToPrevEmbeddedQuestion,
      resetNotification,
    ]
  )

  useMagicKey({
    gotToNextQuestion: handleGoToNextQuestion,
    isLastQuestion,
  })

  const submitButtonKind = getSubmitButtonKind({
    isPending,
    isLastQuestion,
  })

  const submitButtonTitle = {
    loading: t(
      'common.navigation.nextQuestion.loading.label',
      'Terminer le test et accéder à la page de résultats, chargement en cours'
    ),
    finish: t(
      'common.navigation.nextQuestion.finish.label',
      'Terminer le test et accéder à la page de résultats'
    ),
    next: t(
      'common.navigation.nextQuestion.next.label',
      'Aller à la question suivante'
    ),
  }[submitButtonKind]

  const submitButtonIsDisabled = isPending || isNextDisabled || !isFolded

  const submitButtonColor = 'primary'

  return (
    <div
      className={twMerge(
        'fixed right-0 bottom-0 left-0 z-50 min-h-16.5 bg-gray-100 py-3',
        isEmbedded && 'static bg-transparent p-0',
        isIframe &&
          'relative right-auto bottom-auto left-auto z-0 bg-transparent'
      )}>
      <div
        className={twMerge(
          'relative mx-auto flex w-full max-w-6xl justify-between gap-1 px-4 md:gap-4 lg:justify-start',
          isEmbedded && 'justify-start'
        )}>
        <Button
          size="md"
          onClick={handleGoToPrevQuestion}
          disabled={hasNoPreviousQuestion || isPending}
          color="text"
          className="px-3"
          title={t(
            'common.navigation.previousButton.label',
            'Aller à la question précédente'
          )}>
          <span aria-hidden className="hidden md:inline">
            ←
          </span>
           {t('Précédent')}
        </Button>

        <Button
          color={submitButtonColor}
          disabled={submitButtonIsDisabled}
          size="md"
          title={submitButtonTitle}
          onClick={handleGoToNextQuestion}
          className={twMerge(
            'p-3 text-sm',
            submitButtonKind === 'finish' &&
              !submitButtonIsDisabled &&
              'animate-bg-pulse hover:bg-primary-900! motion-reduce:animate-none'
          )}>
          <span
            className={twMerge(
              submitButtonKind === 'finish' &&
                !submitButtonIsDisabled &&
                'bg-rainbow animate-rainbow-fast bg-clip-text! text-transparent! duration-1000 motion-reduce:animate-none'
            )}
            key={submitButtonKind}>
            <SubmitButtonContent kind={submitButtonKind} />
          </span>
        </Button>
      </div>
    </div>
  )
}
