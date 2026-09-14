import { Exception } from '../../../exception.ts'
import { DomainError } from '../../../lib/errors.ts'

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

export class SimulationNotFinishedException extends Exception<{
  simulationId: string
  progression: number
}> {
  level = 'error' as const
}
