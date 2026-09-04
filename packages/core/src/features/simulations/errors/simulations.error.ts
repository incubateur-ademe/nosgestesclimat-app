import type { InvalidPayloadError } from '../../../lib/errors.ts'
import { DomainError } from '../../../lib/errors.ts'

export class SimulationNotFoundError extends DomainError<'simulation_not_found'> {
  constructor() {
    super('simulation_not_found', 'Simulation introuvable')
  }
}

export class SimulationCompletedError extends DomainError<'simulation_completed'> {
  constructor() {
    super('simulation_completed', 'Simulation déjà terminée')
  }
}

export class ZeroFootprintError extends DomainError<'zero_footprint'> {
  constructor() {
    super('zero_footprint', 'Bilan carbone nul')
  }
}

export type UpdateSimulationSituationError =
  | SimulationNotFoundError
  | SimulationCompletedError
  | ZeroFootprintError
  | InvalidPayloadError

export type CompleteSimulationError =
  | SimulationNotFoundError
  | SimulationCompletedError
  | ZeroFootprintError
  | InvalidPayloadError
