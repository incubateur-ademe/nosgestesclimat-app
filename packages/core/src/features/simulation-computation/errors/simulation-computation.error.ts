import { DomainError } from '../../../lib/errors.ts'
import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'
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
  /** The model the simulation was computed with, logged with the failure. */
  public readonly model: ModelString

  constructor({
    simulationId,
    model,
    cause,
  }: {
    simulationId: string
    model: ModelString
    cause?: unknown
  }) {
    super('simulation_computation_failed', 'Simulation computation failed')
    this.simulationId = simulationId
    this.model = model
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class SimulationNotFinishedError extends DomainError<'simulation_not_finished'> {
  public readonly simulationId: string
  public readonly status: SimulationStatus

  constructor({
    simulationId,
    status,
    cause,
  }: {
    simulationId: string
    status: SimulationStatus
    cause?: unknown
  }) {
    super('simulation_not_finished', 'Simulation not finished')
    this.simulationId = simulationId
    this.status = status
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}
