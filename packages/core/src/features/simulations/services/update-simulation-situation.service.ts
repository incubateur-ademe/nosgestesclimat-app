import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { Result } from '../../../lib/result.ts'
import { failure } from '../../../lib/result.ts'
import {
  SimulationCompletedError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../errors/simulations.error.ts'
import {
  hasZeroCarbonFootprint,
  isSimulationCompleted,
} from '../helpers/simulation-guards.ts'
import { findSimulationProgressById } from '../repository/simulation-progress.repository.ts'
import { updateSimulation } from '../repository/simulation.repository.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/**
 * Updates what changes when a user answers a question. Unlike  creation,
 * it neither creates the user nor touches group or poll membership:
 * those are established when the simulation is created or joined.
 */
export const updateSimulationSituation = async ({
  userId,
  simulationId,
  situation,
  foldedSteps,
  progression,
  computedResults,
  model,
}: {
  userId: string
  simulationId: string
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  progression: number
  computedResults: ComputedResults
  /** Written only when supplied in order to repair a broken model string */
  model?: string
}): Promise<
  Result<
    void,
    SimulationNotFoundError | SimulationCompletedError | ZeroFootprintError
  >
> => {
  if (hasZeroCarbonFootprint(computedResults)) {
    return failure(new ZeroFootprintError())
  }

  const existing = await findSimulationProgressById({
    id: simulationId,
    userId,
  })

  if (!existing) {
    return failure(new SimulationNotFoundError())
  }

  if (isSimulationCompleted(existing.progression)) {
    return failure(new SimulationCompletedError())
  }

  return await updateSimulation({
    id: simulationId,
    userId,
    situation,
    foldedSteps,
    progression,
    computedResults,
    model,
  })
}
