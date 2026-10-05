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

export class SimulationNotFinishedException extends DomainError<'simulation_not_finished'> {
  public readonly simulationId: string
  public readonly progression: number

  constructor({
    simulationId,
    progression,
    cause,
  }: {
    simulationId: string
    progression: number
    cause?: unknown
  }) {
    super('simulation_not_finished', 'Simulation not finished')
    this.simulationId = simulationId
    this.progression = progression
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}
