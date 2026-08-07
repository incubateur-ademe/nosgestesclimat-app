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
import {
  getIsEventTracked,
  markAsEventTracked,
} from '@/utils/analytics/trackUniqueEvent'
import { useEffect } from 'react'
import { useTrackTimeOnSimulation } from './useTrackTimeOnSimulation'

const FIRST_QUESTION_SEEN = 'first_question_seen'
const FIRST_QUESTION_ANSWERED = 'first_question_answered'
const TEST_COMPLETED = 'test_completed'

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
      !getIsEventTracked(FIRST_QUESTION_SEEN, simulationId)
    ) {
      trackMatomoEvent__deprecated(simulationSimulationFirstQuestionSeen)

      trackPosthogEvent(
        captureSimulationFirstQuestionSeen({
          question: remainingQuestions[0],
        })
      )

      markAsEventTracked(FIRST_QUESTION_SEEN, simulationId)
    }
  }, [remainingQuestions, progression, foldedSteps, simulationId])

  // Track users that have answered at first question
  useEffect(() => {
    if (
      progression > 0 &&
      foldedSteps.length === 1 &&
      !getIsEventTracked(FIRST_QUESTION_ANSWERED, simulationId)
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

      markAsEventTracked(FIRST_QUESTION_ANSWERED, simulationId)
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
    if (progression === 1 && !getIsEventTracked(TEST_COMPLETED, simulationId)) {
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

      markAsEventTracked(TEST_COMPLETED, simulationId)
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
