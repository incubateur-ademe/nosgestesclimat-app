import { Exception } from '../../../exception.js'
import { DomainError } from '../../../lib/errors.ts'
import type { Model } from '../../simulations/types/model.ts'

export class SimulationComputationFailedError extends DomainError<'simulation_computation_failed'> {
  public readonly simulationId: string

  constructor({
    simulationId,
    cause,
  }: {
    simulationId: string
    cause?: unknown
  }) {
    super('simulation_computation_failed', 'Simulation computation failed')
    this.simulationId = simulationId
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class ComputationAlreadyExistsException extends Exception<{
  simulationId: string
}> {
  level = 'error' as const
}

export class SimulationNotFinishedException extends Exception<{
  simulationId: string
  progression: number
}> {
  level = 'error' as const
}

export class UnsupportedModelException extends Exception<{
  model: Model
}> {
  level = 'warning' as const
}
