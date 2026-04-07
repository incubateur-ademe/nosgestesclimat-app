'use client'

import {
  DEFAULT_FOCUS_ELEMENT_ID,
  QUESTION_DESCRIPTION_BUTTON_ID,
} from '@/constants/accessibility'
import { captureClickFormNav } from '@/constants/tracking/posthogTrackers'
import {
  questionClickPass,
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
import { trackEvent, trackPosthogEvent } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { TFunction } from 'i18next'
import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransClient'

interface FuncProps {
  isPending?: boolean
  finalNoNextQuestion?: boolean
  isMissing?: boolean
  t: TFunction<string, string>
}

const getSubmitButtonText = ({
  isPending,
  finalNoNextQuestion,
  isMissing,
  t,
}: FuncProps) => {
  return {
    title: isPending
      ? t(
          'common.navigation.nextQuestion.loading.label',
          'Terminer le test et accéder à la page de résultats, chargement en cours'
        )
      : finalNoNextQuestion
        ? t(
            'common.navigation.nextQuestion.finish.label',
            'Terminer le test et accéder à la page de résultats'
          )
        : isMissing
          ? t(
              'common.navigation.nextQuestion.dontKnow.title',
              'Je ne sais pas, passer et aller à la question suivante'
            )
          : t(
              'common.navigation.nextQuestion.next.label',
              'Aller à la question suivante'
            ),
    label: isPending ? (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.loading">
          <Loader color="light" size="sm" className="mr-2" /> Terminer
        </Trans>
      </span>
    ) : finalNoNextQuestion ? (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.finished">
          Terminer
        </Trans>
      </span>
    ) : isMissing ? (
      <span data-testid="skip-question-button">
        <Trans i18nKey="simulator.navigation.nextButton.dontKnow.label">
          Je ne sais pas
        </Trans>{' '}
        <span aria-hidden>→</span>
      </span>
    ) : (
      <span data-testid="next-question-button">
        <Trans i18nKey="simulator.navigation.nextButton.next">Suivant</Trans>{' '}
        <span aria-hidden>→</span>
      </span>
    ),
  }
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

  const persistedRemainingQuestionsRef = useRef(remainingQuestions)

  const {
    gotoPrevQuestion,
    gotoNextQuestion,
    noPrevQuestion,
    noNextQuestion,
    setCurrentQuestion,
  } = useFormState()

  const {
    isMissing,
    plancher,
    plafond,
    situationValue,
    value,
    activeNotifications,
    questionsOfMosaicFromParent,
  } = useRule(question)

  const { getValue } = useEngine()

  // Hack in order to reset the notification when the question changes
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
  let isNextDisabled = false
  if (typeof situationValue === 'number') {
    const { isBelowFloor, isOverCeiling } = getValueIsOverFloorOrCeiling({
      value: situationValue,
      plafond,
      plancher,
    })
    isNextDisabled = isBelowFloor || isOverCeiling
  }

  // @TODO : fix this, sometimes without this hack, not all remaining questions
  // are displayed to the user
  const isSingleQuestionEmbeddedFinal =
    isEmbedded &&
    ((remainingQuestions.length === 1 && remainingQuestions[0] === question) ||
      remainingQuestions.length === 0)

  // Determines if the current question is the last one of the test
  const finalNoNextQuestion = isSingleQuestionEmbeddedFinal || noNextQuestion

  const isFirstOrOnlyQuestion =
    noPrevQuestion ||
    (!!isEmbedded &&
      (persistedRemainingQuestionsRef.current?.indexOf(question) === 0 ||
        persistedRemainingQuestionsRef.current?.indexOf(question) ===
          (persistedRemainingQuestionsRef.current?.length || 0) - 1))

  // Start time of the question
  //(we need to use question to update the start time when the question changes, but it is not exactly usefull as a dependency)
  const [startTime, setStartTime] = useState(() => Date.now())

  useEffect(() => {
    setStartTime(Date.now())
  }, [question])

  const handleMoveFocus = () => {
    // Focus the question title upon question change
    setTimeout(() => {
      const focusedElement =
        // Default : focus the first element focusable in the modified area of the form
        document.getElementById(
          QUESTION_DESCRIPTION_BUTTON_ID
          // Otherwise focus the first input or field button
        ) ??
        document.getElementById(
          DEFAULT_FOCUS_ELEMENT_ID
          // Edge case : mosaics
        ) ??
        document.getElementById(`${DEFAULT_FOCUS_ELEMENT_ID}-0`)

      if (focusedElement) {
        focusedElement.focus()
      }
    })
  }

  const handleAnswerQuestion = useCallback(() => {
    if (questionsOfMosaicFromParent.length > 0) {
      questionsOfMosaicFromParent.forEach((question) => {
        updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: question,
            value: getValue(question),
            isMosaicChild: true,
          },
        })
      })
    }

    updateCurrentSimulation({
      foldedStepToAdd: {
        foldedStep: question,
        value: value,
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

  useEffect(() => {
    if (finalNoNextQuestion) {
      handleAnswerQuestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalNoNextQuestion])

  const handleGoToNextQuestion = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()

      const endTime = Date.now()
      const timeSpentOnQuestion = endTime - startTime

      if (isMissing) {
        trackEvent(questionClickPass({ question, timeSpentOnQuestion }))
        trackPosthogEvent(
          captureClickFormNav({
            actionType: 'passer',
            question,
            answer: value,
            timeSpentOnQuestion,
          })
        )
      } else {
        trackEvent(
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
      }

      if (isMissing) {
        handleAnswerQuestion()
      }

      handleMoveFocus()

      // Hack in order to reset the notifications when the question changes
      resetNotification()

      if (isEmbedded && persistedRemainingQuestionsRef.current.length > 0) {
        setCurrentQuestion(
          persistedRemainingQuestionsRef.current.find(
            (dottedName, index) =>
              index ===
              (persistedRemainingQuestionsRef.current.indexOf(question) || 0) +
                1
          ) ?? null
        )
      } else {
        gotoNextQuestion()
      }
    },
    [
      startTime,
      isMissing,
      resetNotification,
      isEmbedded,
      question,
      value,
      handleAnswerQuestion,
      setCurrentQuestion,
      gotoNextQuestion,
    ]
  )

  const handleGoToPrevQuestion = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()

      if (isFirstOrOnlyQuestion) {
        return
      }

      const endTime = Date.now()
      const timeSpentOnQuestion = endTime - startTime
      trackEvent(questionClickPrevious({ question }))
      trackPosthogEvent(
        captureClickFormNav({
          actionType: 'précédent',
          question,
          answer: value,
          timeSpentOnQuestion,
        })
      )

      if (isEmbedded) {
        setCurrentQuestion(
          persistedRemainingQuestionsRef.current.find(
            (dottedName, index) =>
              index ===
              (persistedRemainingQuestionsRef.current.indexOf(question) || 0) -
                1
          ) ?? null
        )
      } else {
        gotoPrevQuestion()
      }

      // Hack in order to reset the notifications when the question changes
      resetNotification()

      handleMoveFocus()
    },
    [
      isFirstOrOnlyQuestion,
      startTime,
      question,
      value,
      isEmbedded,
      setCurrentQuestion,
      gotoPrevQuestion,
      resetNotification,
    ]
  )

  useMagicKey({
    gotToNextQuestion: handleGoToNextQuestion,
  })

  const { title, label } = getSubmitButtonText({
    isPending,
    finalNoNextQuestion,
    isMissing,
    t,
  })

  return (
    <div
      className={twMerge(
        'fixed right-0 bottom-0 left-0 z-50 min-h-[66px] bg-gray-100 py-3',
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
          disabled={isFirstOrOnlyQuestion || isPending}
          color="text"
          className={twMerge('px-3')}
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
          color={isMissing ? 'secondary' : 'primary'}
          disabled={isNextDisabled || isPending}
          className="p-3 text-sm"
          size="md"
          title={title}
          onClick={(e) => {
            handleGoToNextQuestion(e)
            if (finalNoNextQuestion) {
              onComplete()
            }
          }}>
          {label}
        </Button>
      </div>
    </div>
  )
}
