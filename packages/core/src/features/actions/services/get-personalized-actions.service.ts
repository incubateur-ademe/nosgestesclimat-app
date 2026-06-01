import { findLastSimulationComputationByUserId } from '../../publicodes-computation/repositories/simulation-computations.repository.ts'
import type { SimulationComputationStatus } from '../../publicodes-computation/types/computation.ts'
import { findVisiblePersonalizedActions } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

export const getPersonalizedActions = async (
  userId: string
): Promise<{
  lastSimulationAssessmentStatus: SimulationComputationStatus | null
  actions: PersonalizedAction[]
}> => {
  const [personalizedActions, lastComputation] = await Promise.all([
    findVisiblePersonalizedActions(userId),
    findLastSimulationComputationByUserId(userId),
  ])

  const actions = personalizedActions.toSorted(
    (a, b) =>
      (b.assessment.impact ?? -Infinity) - (a.assessment.impact ?? -Infinity)
  )

  return {
    lastSimulationAssessmentStatus: lastComputation?.status ?? null,
    actions,
  }
}
