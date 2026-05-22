import { SIMULATOR_INTERCALAIRE_PATH } from '@/constants/urls/paths'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import useCurrentSimulation from '../useCurrentSimulation/useCurrentSimulation'
import useFormState from '../useFormState/useFormState'

export function useGotoNextQuestion() {
  const {
    gotoNextQuestion,
    isLastQuestionOfCategory,
    nextQuestionAlreadySeen,
    currentCategory,
  } = useFormState()
  const router = useRouter()

  const withIntercalaire =
    getSimulationMode(useCurrentSimulation()) === 'scolaire'

  const isIntercalaireNext =
    withIntercalaire && isLastQuestionOfCategory && !nextQuestionAlreadySeen

  const [isPending, startRouteTransition] = useTransition()
  return {
    goToNextQuestion: () => {
      if (withIntercalaire && isIntercalaireNext) {
        if (isPending) return
        startRouteTransition(() =>
          router.push(`${SIMULATOR_INTERCALAIRE_PATH}/${currentCategory}`)
        )
      } else {
        gotoNextQuestion()
      }
    },
    isIntercalaireNext,
  }
}
