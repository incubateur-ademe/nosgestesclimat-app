import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findLastFinishedSimulationByUserId } from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import type { SimulationComputationStatus } from '../../simulation-computation/types/computation.ts'
import { findAllVisiblePersonalizedActions } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

/**
 * Assessment state of the user's latest finished simulation:
 * - a `SimulationComputationStatus` when that simulation has a computation row
 * - `'never-assessed'` when it has none (model unsupported at completion, or
 *   predating the computation feature) — it will never be computed
 * - `null` when the user has no finished simulation
 */
export type AssessmentStatus =
  | SimulationComputationStatus
  | 'never-assessed'

export const getPersonalizedActionsCatalogue = async (
  userId: string | undefined,
  locale: ISOSupportedLanguage
): Promise<{
  assessmentStatus: AssessmentStatus | null
  actions: PersonalizedAction[]
  topActions: PersonalizedAction[]
}> => {
  // Status and assessments must come from the same simulation, otherwise a
  // completed computation from an older simulation filters actions assessed
  // for another one, emptying the catalogue.
  const lastFinished = await findLastFinishedSimulationByUserId(
    userId
  )
  const personalizedActions = await findAllVisiblePersonalizedActions(
    lastFinished?.simulationId,
    locale,
    {
      fallbackToDefaultLocale: true,
    }
  )

  // No finished simulation -> all actions without assessments
  // Simulation whose model was never computed -> all actions without assessments
  // Simulation with assessment in progress -> all actions without assessments
  // Simulation with completed assessment -> only applicable actions, sorted by impact
  const actions =
    lastFinished?.computationStatus === 'completed'
      ? personalizedActions
          .filter((action) => action.assessment?.applicable)
          .sort(
            (a, b) =>
              (b.assessment?.impact ?? -Infinity) -
              (a.assessment?.impact ?? -Infinity)
          )
      : personalizedActions

  return {
    assessmentStatus:
      lastFinished === undefined
        ? null
        : (lastFinished.computationStatus ?? 'never-assessed'),
    actions,
    topActions: actions
      .filter((action) => typeof action.assessment?.impact === 'number')
      .slice(0, 3),
  }
}
