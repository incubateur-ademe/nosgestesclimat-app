import { useCookieManagement } from '@/components/cookies/useCookieManagement'
import {
  captureSimulationCompleted,
  captureSimulationFirstQuestionSeen,
  captureSimulationStarted,
} from '@/constants/tracking/posthogTrackers'
import {
  gtmSimulationCompleted,
  gtmSimulationStarted,
  simulationCategoryCompleted,
  simulationCategoryStarted,
  simulationSimulationCompleted,
  simulationSimulationFirstQuestionSeen,
  simulationSimulationStarted,
} from '@/constants/tracking/simulation'
import {
  useCurrentSimulation,
  useEngine,
  useFormState,
} from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { trackGTMEvent } from '@/utils/analytics/trackGTMEvent'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect } from 'react'
import { useTrackTimeOnSimulation } from './useTrackTimeOnSimulation'

const FIRST_QUESTION_SEEN = 'first_question_seen'
const FIRST_QUESTION_ANSWERED = 'first_question_answered'
const TEST_COMPLETED = 'test_completed'

const getTrackingKey = (simulationId: string, eventType: string): string => {
  return `ngc_tracking_${eventType}_${simulationId}`
}

const getTrackingState = (simulationId: string, eventType: string): boolean => {
  const key = getTrackingKey(simulationId, eventType)
  return safeLocalStorage.getItem(key) === 'true'
}

const setTrackingState = (
  simulationId: string,
  eventType: string,
  value: boolean
): void => {
  const key = getTrackingKey(simulationId, eventType)

  safeLocalStorage.setItem(key, value.toString())
}

export function useTrackSimulator() {
  const currentSimulation = useCurrentSimulation()
  const simulationId = currentSimulation.id

  const {
    isFirstQuestionOfCategory,
    isLastQuestionOfCategory,
    currentCategory,
    relevantAnsweredQuestions,
    remainingQuestions,
  } = useFormState()

  const { progression, foldedSteps } = currentSimulation

  const { cookieState } = useCookieManagement()

  const { getNumericValue } = useEngine()

  const { trackTimeOnSimulation } = useTrackTimeOnSimulation()

  // Track users that have seen the first question
  useEffect(() => {
    if (
      progression === 0 &&
      foldedSteps.length === 0 &&
      !getTrackingState(simulationId, FIRST_QUESTION_SEEN)
    ) {
      trackMatomoEvent__deprecated(simulationSimulationFirstQuestionSeen)

      trackPosthogEvent(
        captureSimulationFirstQuestionSeen({
          question: remainingQuestions[0],
        })
      )

      setTrackingState(simulationId, FIRST_QUESTION_SEEN, true)
    }
  }, [remainingQuestions, progression, foldedSteps, simulationId])

  // Track users that have answered at first question
  useEffect(() => {
    if (
      progression > 0 &&
      foldedSteps.length === 1 &&
      !getTrackingState(simulationId, FIRST_QUESTION_ANSWERED)
    ) {
      trackMatomoEvent__deprecated(simulationSimulationStarted)

      // Track GTM event if available
      if (cookieState.googleTag === 'accepted') {
        trackGTMEvent(gtmSimulationStarted)
      }

      trackPosthogEvent(
        captureSimulationStarted({
          question:
            relevantAnsweredQuestions[relevantAnsweredQuestions.length - 1],
        })
      )

      setTrackingState(simulationId, FIRST_QUESTION_ANSWERED, true)
    }
  }, [
    relevantAnsweredQuestions,
    progression,
    foldedSteps,
    simulationId,
    currentSimulation,
    cookieState,
  ])

  useEffect(() => {
    if (progression === 1 && !getTrackingState(simulationId, TEST_COMPLETED)) {
      const timeSpentOnSimulation = trackTimeOnSimulation()

      const bilan = getNumericValue('bilan')

      // Track Matomo event
      trackMatomoEvent__deprecated(simulationSimulationCompleted(bilan))

      // Track GTM event if available
      if (cookieState.googleTag === 'accepted') {
        trackGTMEvent(gtmSimulationCompleted)
      }

      trackPosthogEvent(
        captureSimulationCompleted({
          bilanCarbone: getNumericValue('bilan'),
          bilanEau: getNumericValue('bilan', 'eau'),
          timeSpentOnSimulation,
        })
      )

      setTrackingState(simulationId, TEST_COMPLETED, true)
    }
  }, [
    progression,
    trackTimeOnSimulation,
    getNumericValue,
    simulationId,
    currentSimulation,
    cookieState,
  ])

  useEffect(() => {
    if (!currentCategory) return

    if (isFirstQuestionOfCategory) {
      trackMatomoEvent__deprecated(simulationCategoryStarted(currentCategory))
    }

    if (isLastQuestionOfCategory) {
      trackMatomoEvent__deprecated(simulationCategoryCompleted(currentCategory))
    }
  }, [currentCategory, isFirstQuestionOfCategory, isLastQuestionOfCategory])
}
