import { findLastSimulationComputationByUserId } from '../../publicodes-computation/repositories/simulation-computations.repository.ts'
import type { SimulationComputationStatus } from '../../publicodes-computation/types/computation.ts'
import { findAllVisiblePersonalizedActions } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

export const getPersonalizedActionsCatalogue = async (
  userId: string
): Promise<{
  assessmentStatus: SimulationComputationStatus | null
  actions: PersonalizedAction[]
}> => {
  const [personalizedActions, lastComputation] = await Promise.all([
    findAllVisiblePersonalizedActions(userId),
    findLastSimulationComputationByUserId(userId),
  ])

  // No simulation -> all actions without assessments
  // Old incompatible simulations -> all actions without assessments
  // Simulation with assessment in progress -> all actions without assessments
  // Simulation with completed assessment -> only applicable actions, sorted by impact
  const actions =
    lastComputation?.status === 'completed'
      ? personalizedActions
          .filter((action) => action.assessment?.applicable)
          .sort(
            (a, b) =>
              (b.assessment?.impact ?? -Infinity) -
              (a.assessment?.impact ?? -Infinity)
          )
      : personalizedActions

  return {
    assessmentStatus: lastComputation?.status ?? null,
    actions,
  }
}
