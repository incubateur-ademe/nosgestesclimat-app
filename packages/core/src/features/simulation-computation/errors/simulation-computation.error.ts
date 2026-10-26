import { DomainError } from '../../../lib/errors.ts'
import type { Model } from '../../models/types/model.ts'

export class UnsupportedModelError extends DomainError<'unsupported_model'> {
  public readonly model: Model

  constructor(model: Model) {
    super('unsupported_model', 'Unsupported model')
    this.model = model
  }
}

export class ComputationAlreadyExistsError extends DomainError<'computation_already_exists'> {
  public readonly simulationId: string

  constructor(simulationId: string) {
    super('computation_already_exists', 'Computation already exists')
    this.simulationId = simulationId
  }
}

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

export class SimulationNotFinishedError extends DomainError<'simulation_not_finished'> {
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
