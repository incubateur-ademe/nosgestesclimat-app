import type { Logger } from '../../logger/index.ts'
import { isSimulationCompleted } from '../../simulations/helpers/simulation-guards.ts'
import { SimulationNotFinishedError } from '../errors/simulation-computation.error.ts'
import { isModelSupported } from '../model-support/is-model-supported.ts'
import { createSimulationComputation } from '../repositories/simulation-computations.repository.ts'
import { getSimulationById } from '../repositories/simulation.repository.ts'

interface ProgramSimulationComputationDeps {
  logger: Logger
}

export function createProgramSimulationComputation(
  deps: ProgramSimulationComputationDeps
) {
  return async function programSimulationComputation(
    simulationId: string
  ): Promise<void> {
    const logger = deps.logger.child({
      scope: 'core.service.programSimulationComputation',
      simulationId: simulationId,
    })
    const simulation = await getSimulationById(simulationId)

    if (!isSimulationCompleted(simulation)) {
      throw new SimulationNotFinishedError({
        simulationId: simulation.id,
        progression: simulation.progression,
      })
    }

    if (!isModelSupported(simulation.model)) {
      // An unsupported model skips the computation: the simulation stays
      // pending, nothing is lost.
      logger.warn('Unsupported model', {
        'error.type': 'unsupported_model',
        model: simulation.model,
      })
      return
    }

    const result = await createSimulationComputation(simulationId)
    if (!result.success) {
      logger.warn(result.error)
    }
  }
}
