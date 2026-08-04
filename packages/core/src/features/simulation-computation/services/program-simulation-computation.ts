import type { CaptureException, Logger } from '../../logger/index.ts'
import { getSimulationById } from '../../simulations/repository/simulation.repository.ts'
import {
  SimulationNotFinishedException,
  UnsupportedModelException,
} from '../exceptions/simulation-computation.exception.ts'
import { isModelSupported } from '../model-support/is-model-supported.ts'
import { createSimulationComputation } from '../repositories/simulation-computations.repository.ts'

interface ProgramSimulationComputationDeps {
  logger: Logger
  captureException: CaptureException
}

export function createProgramSimulationComputation(
  deps: ProgramSimulationComputationDeps
) {
  return async function programSimulationComputation(
    simulationId: string
  ): Promise<void> {
    const { logger, captureException } = deps
    const simulation = await getSimulationById(simulationId)

    if (simulation.progression !== 1) {
      throw new SimulationNotFinishedException({
        simulationId: simulation.id,
        progression: simulation.progression,
      })
    }

    if (!isModelSupported(simulation.model)) {
      const exception = new UnsupportedModelException({
        message: 'Unsupported model',
        model: simulation.model,
      })
      logger.error(
        `[program-simulation-computation] ${exception.message}`,
        exception.payload
      )
      captureException(exception)
      return
    }

    await createSimulationComputation(simulationId)
  }
}
